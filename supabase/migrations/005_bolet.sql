-- ============================================================
-- GJ LOTTERY — PHASE 4: BOLET (Haitian Lottery)
-- Run in Supabase SQL Editor after migration 004
-- ============================================================

-- Bolet bet type: how many digits the user picks
CREATE TYPE bolet_type AS ENUM ('2chif', '3chif', '4chif');  -- 2, 3, or 4 digit

-- Draw status
CREATE TYPE draw_status AS ENUM ('upcoming', 'open', 'closed', 'drawn');

-- ── BOLET DRAWS ───────────────────────────────────────────────
CREATE TABLE bolet_draws (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_name    TEXT NOT NULL,             -- 'Tiraj Maten', 'Tiraj Midi', 'Tiraj Swa'
  draw_time    TIMESTAMPTZ NOT NULL,      -- scheduled draw time
  status       draw_status DEFAULT 'upcoming',
  -- Results (set when drawn)
  winning_2    TEXT,                      -- 2-digit result  e.g. '47'
  winning_3    TEXT,                      -- 3-digit result  e.g. '472'
  winning_4    TEXT,                      -- 4-digit result  e.g. '4723'
  drawn_at     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── BOLET TICKETS ─────────────────────────────────────────────
CREATE TABLE bolet_tickets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id),
  draw_id      UUID NOT NULL REFERENCES bolet_draws(id),
  bet_type     bolet_type NOT NULL,
  number       TEXT NOT NULL,            -- the number they picked, e.g. '47', '472'
  stake        DECIMAL(15,2) NOT NULL CHECK (stake > 0),
  potential_win DECIMAL(15,2) NOT NULL,
  multiplier   INT NOT NULL,             -- 2chif=60x, 3chif=500x, 4chif=4000x
  status       TEXT DEFAULT 'pending',   -- 'pending' | 'won' | 'lost'
  settled_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE bolet_draws   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bolet_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read draws"       ON bolet_draws FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage draws"     ON bolet_draws FOR ALL   USING (is_admin());

CREATE POLICY "Users view own tickets"  ON bolet_tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create tickets"    ON bolet_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage tickets"   ON bolet_tickets FOR ALL   USING (is_admin());

-- ── FUNCTION: Buy Bolet Ticket ────────────────────────────────
CREATE OR REPLACE FUNCTION buy_bolet_ticket(
  p_user_id UUID,
  p_draw_id UUID,
  p_bet_type TEXT,   -- '2chif' | '3chif' | '4chif'
  p_number  TEXT,    -- the number string
  p_stake   DECIMAL(15,2)
)
RETURNS UUID AS $$
DECLARE
  wal           wallets;
  draw          bolet_draws;
  multiplier    INT;
  potential_win DECIMAL(15,2);
  ticket_id     UUID;
BEGIN
  -- Check draw is open
  SELECT * INTO draw FROM bolet_draws WHERE id = p_draw_id FOR SHARE;
  IF draw.status NOT IN ('upcoming', 'open') THEN
    RAISE EXCEPTION 'This draw is closed';
  END IF;
  IF draw.draw_time <= NOW() THEN
    RAISE EXCEPTION 'Draw time has passed';
  END IF;

  -- Multipliers (standard Haitian bolet rates)
  multiplier := CASE p_bet_type
    WHEN '2chif' THEN 60
    WHEN '3chif' THEN 500
    WHEN '4chif' THEN 4000
    ELSE 0
  END;
  IF multiplier = 0 THEN
    RAISE EXCEPTION 'Invalid bet type: %', p_bet_type;
  END IF;

  potential_win := ROUND(p_stake * multiplier, 2);

  -- Lock wallet
  SELECT * INTO wal FROM wallets WHERE user_id = p_user_id FOR UPDATE;
  IF wal.balance < p_stake THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct
  UPDATE wallets SET balance = balance - p_stake, updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO transactions (user_id, wallet_id, type, status, amount, balance_before, balance_after, description)
  VALUES (p_user_id, wal.id, 'bet_placed', 'completed', -p_stake,
          wal.balance, wal.balance - p_stake,
          'Bolet ' || p_bet_type || ' #' || p_number);

  INSERT INTO bolet_tickets (user_id, draw_id, bet_type, number, stake, potential_win, multiplier)
  VALUES (p_user_id, p_draw_id, p_bet_type::bolet_type, p_number, p_stake, potential_win, multiplier)
  RETURNING id INTO ticket_id;

  RETURN ticket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── FUNCTION: Settle Bolet Draw ───────────────────────────────
CREATE OR REPLACE FUNCTION settle_bolet_draw(
  p_draw_id   UUID,
  p_winning_2 TEXT,
  p_winning_3 TEXT,
  p_winning_4 TEXT
)
RETURNS VOID AS $$
DECLARE
  ticket bolet_tickets;
  wal    wallets;
  won    BOOLEAN;
BEGIN
  -- Update draw result
  UPDATE bolet_draws SET
    status    = 'drawn',
    winning_2 = p_winning_2,
    winning_3 = p_winning_3,
    winning_4 = p_winning_4,
    drawn_at  = NOW()
  WHERE id = p_draw_id;

  -- Settle each pending ticket
  FOR ticket IN
    SELECT * FROM bolet_tickets WHERE draw_id = p_draw_id AND status = 'pending'
  LOOP
    won := CASE ticket.bet_type
      WHEN '2chif' THEN ticket.number = p_winning_2
      WHEN '3chif' THEN ticket.number = p_winning_3
      WHEN '4chif' THEN ticket.number = p_winning_4
    END;

    UPDATE bolet_tickets SET
      status     = CASE WHEN won THEN 'won' ELSE 'lost' END,
      settled_at = NOW()
    WHERE id = ticket.id;

    IF won THEN
      SELECT * INTO wal FROM wallets WHERE user_id = ticket.user_id FOR UPDATE;
      UPDATE wallets SET balance = balance + ticket.potential_win, updated_at = NOW()
      WHERE user_id = ticket.user_id;

      INSERT INTO transactions (user_id, wallet_id, type, status, amount, balance_before, balance_after, description)
      VALUES (ticket.user_id, wal.id, 'bet_won', 'completed', ticket.potential_win,
              wal.balance, wal.balance + ticket.potential_win,
              'Bolet ' || ticket.bet_type || ' #' || ticket.number || ' — GENYEN!');

      INSERT INTO notifications (user_id, title, body, type, data)
      VALUES (ticket.user_id, '🎰 BOLET OU PASE!',
              'Nimewo ' || ticket.number || ' pase! Ou genyen ' || ticket.potential_win || ' HTG!',
              'success',
              jsonb_build_object('draw_id', p_draw_id, 'number', ticket.number, 'amount', ticket.potential_win));
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── SEED: Create next 7 days of draws ────────────────────────
-- 3 draws per day: 10am, 1pm, 6pm Haiti time (UTC-5 = 15:00, 18:00, 23:00 UTC)
INSERT INTO bolet_draws (draw_name, draw_time)
SELECT
  draw_name,
  draw_date::TIMESTAMPTZ + draw_time::INTERVAL
FROM (
  SELECT
    generate_series(0, 6) AS day_offset,
    unnest(ARRAY['Tiraj Maten', 'Tiraj Midi', 'Tiraj Swa']) AS draw_name,
    unnest(ARRAY['15:00:00', '18:00:00', '23:00:00']) AS draw_time
) AS draws
CROSS JOIN LATERAL (
  SELECT (CURRENT_DATE + day_offset)::TEXT AS draw_date
) AS d
WHERE (draw_date::DATE + draw_time::INTERVAL) > NOW()
ORDER BY draw_date, draw_time;

-- ── INDEXES ───────────────────────────────────────────────────
CREATE INDEX idx_bolet_draws_status   ON bolet_draws(status);
CREATE INDEX idx_bolet_draws_time     ON bolet_draws(draw_time);
CREATE INDEX idx_bolet_tickets_user   ON bolet_tickets(user_id);
CREATE INDEX idx_bolet_tickets_draw   ON bolet_tickets(draw_id);
