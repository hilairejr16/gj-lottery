-- ============================================================
-- GJ LOTTERY — PHASE 3: VIRTUAL GAMES
-- Run in Supabase SQL Editor after migration 003
-- ============================================================

-- Game type enum
CREATE TYPE virtual_game_type AS ENUM ('football', 'horses');

-- Event status enum
CREATE TYPE virtual_event_status AS ENUM ('upcoming', 'live', 'settled', 'cancelled');

-- Bet status enum
CREATE TYPE virtual_bet_status AS ENUM ('pending', 'won', 'lost', 'void');

-- ── VIRTUAL EVENTS ────────────────────────────────────────────
CREATE TABLE virtual_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_type     virtual_game_type NOT NULL,
  event_number  SERIAL,                        -- display number (Race #1042, Match #220)
  scheduled_at  TIMESTAMPTZ NOT NULL,           -- when betting closes / event starts
  settled_at    TIMESTAMPTZ,
  status        virtual_event_status DEFAULT 'upcoming',

  -- Football fields
  home_team     TEXT,
  away_team     TEXT,
  home_score    INT,
  away_score    INT,
  result        TEXT,                           -- 'home' | 'draw' | 'away'
  odds_home     DECIMAL(6,2) DEFAULT 2.10,
  odds_draw     DECIMAL(6,2) DEFAULT 3.20,
  odds_away     DECIMAL(6,2) DEFAULT 2.80,

  -- Horse racing fields
  winner_horse  INT,                            -- 1-8
  horse_names   JSONB,                          -- {"1":"Lightning","2":"Thunder",...}
  horse_odds    JSONB,                          -- {"1":3.50,"2":5.00,...}

  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── VIRTUAL BETS ──────────────────────────────────────────────
CREATE TABLE virtual_bets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id),
  event_id      UUID NOT NULL REFERENCES virtual_events(id),
  game_type     virtual_game_type NOT NULL,
  pick          TEXT NOT NULL,                  -- 'home'|'draw'|'away' or '1'-'8'
  odds          DECIMAL(6,2) NOT NULL,
  stake         DECIMAL(15,2) NOT NULL CHECK (stake > 0),
  potential_win DECIMAL(15,2) NOT NULL,
  status        virtual_bet_status DEFAULT 'pending',
  settled_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE virtual_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_bets   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read virtual events"    ON virtual_events FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage virtual events"  ON virtual_events FOR ALL   USING (is_admin());

CREATE POLICY "Users view own virtual bets"   ON virtual_bets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create virtual bets"     ON virtual_bets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage virtual bets"    ON virtual_bets FOR ALL   USING (is_admin());

-- ── FUNCTION: Place Virtual Bet ───────────────────────────────
CREATE OR REPLACE FUNCTION place_virtual_bet(
  p_user_id  UUID,
  p_event_id UUID,
  p_pick     TEXT,
  p_odds     DECIMAL(6,2),
  p_stake    DECIMAL(15,2)
)
RETURNS UUID AS $$
DECLARE
  wal           wallets;
  ev            virtual_events;
  potential_win DECIMAL(15,2);
  bet_id        UUID;
BEGIN
  -- Check event is still upcoming
  SELECT * INTO ev FROM virtual_events WHERE id = p_event_id FOR SHARE;
  IF ev.status != 'upcoming' THEN
    RAISE EXCEPTION 'Betting is closed for this event';
  END IF;
  IF ev.scheduled_at <= NOW() THEN
    RAISE EXCEPTION 'Betting time has passed';
  END IF;

  -- Lock wallet
  SELECT * INTO wal FROM wallets WHERE user_id = p_user_id FOR UPDATE;
  IF wal.balance < p_stake THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  potential_win := ROUND(p_stake * p_odds, 2);

  -- Deduct stake
  UPDATE wallets SET balance = balance - p_stake, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO transactions (user_id, wallet_id, type, status, amount, balance_before, balance_after, description)
  VALUES (p_user_id, wal.id, 'bet_placed', 'completed', -p_stake,
          wal.balance, wal.balance - p_stake,
          'Virtual ' || ev.game_type || ' bet — ' || p_pick);

  -- Create bet
  INSERT INTO virtual_bets (user_id, event_id, game_type, pick, odds, stake, potential_win)
  VALUES (p_user_id, p_event_id, ev.game_type, p_pick, p_odds, p_stake, potential_win)
  RETURNING id INTO bet_id;

  RETURN bet_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── FUNCTION: Settle Virtual Event ───────────────────────────
CREATE OR REPLACE FUNCTION settle_virtual_event(
  p_event_id    UUID,
  p_result      TEXT,       -- 'home'|'draw'|'away' for football, '1'-'8' for horses
  p_home_score  INT DEFAULT NULL,
  p_away_score  INT DEFAULT NULL,
  p_winner_horse INT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  bet   virtual_bets;
  wal   wallets;
  ev    virtual_events;
  won   BOOLEAN;
BEGIN
  SELECT * INTO ev FROM virtual_events WHERE id = p_event_id;

  -- Update event
  UPDATE virtual_events SET
    status       = 'settled',
    result       = p_result,
    home_score   = COALESCE(p_home_score, home_score),
    away_score   = COALESCE(p_away_score, away_score),
    winner_horse = COALESCE(p_winner_horse, winner_horse),
    settled_at   = NOW()
  WHERE id = p_event_id;

  -- Settle each pending bet
  FOR bet IN
    SELECT * FROM virtual_bets WHERE event_id = p_event_id AND status = 'pending'
  LOOP
    won := (bet.pick = p_result);

    UPDATE virtual_bets SET
      status     = CASE WHEN won THEN 'won' ELSE 'lost' END,
      settled_at = NOW()
    WHERE id = bet.id;

    IF won THEN
      SELECT * INTO wal FROM wallets WHERE user_id = bet.user_id FOR UPDATE;
      UPDATE wallets SET balance = balance + bet.potential_win, updated_at = NOW()
      WHERE user_id = bet.user_id;

      INSERT INTO transactions (user_id, wallet_id, type, status, amount, balance_before, balance_after, description)
      VALUES (bet.user_id, wal.id, 'bet_won', 'completed', bet.potential_win,
              wal.balance, wal.balance + bet.potential_win,
              'Virtual ' || ev.game_type || ' win — ' || bet.potential_win || ' HTG');

      INSERT INTO notifications (user_id, title, body, type, data)
      VALUES (bet.user_id, '🏆 Paryaj Vityèl Ou Genyen!',
              'Ou fè ' || bet.potential_win || ' HTG nan jwèt vityèl la!',
              'success',
              jsonb_build_object('event_id', p_event_id, 'amount', bet.potential_win));
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── INDEXES ───────────────────────────────────────────────────
CREATE INDEX idx_virtual_events_type      ON virtual_events(game_type);
CREATE INDEX idx_virtual_events_status    ON virtual_events(status);
CREATE INDEX idx_virtual_events_scheduled ON virtual_events(scheduled_at);
CREATE INDEX idx_virtual_bets_user        ON virtual_bets(user_id);
CREATE INDEX idx_virtual_bets_event       ON virtual_bets(event_id);
