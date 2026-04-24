-- ============================================================
-- GJ LOTTERY — PHASE 2: SPORTS BETTING SCHEMA
-- Run in Supabase SQL Editor after migration 001 & 002
-- ============================================================

-- Sports enum
CREATE TYPE sport_type AS ENUM (
  'soccer', 'basketball', 'baseball', 'hockey', 'american_football'
);

-- Bet status enum
CREATE TYPE bet_status AS ENUM (
  'pending', 'won', 'lost', 'void', 'cashout'
);

-- Bet selection result
CREATE TYPE selection_result AS ENUM (
  'pending', 'won', 'lost', 'void'
);

-- ── MATCHES (cached from API) ─────────────────────────────────
CREATE TABLE matches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id     TEXT UNIQUE NOT NULL,      -- ID from The Odds API
  sport           sport_type NOT NULL,
  league          TEXT NOT NULL,
  home_team       TEXT NOT NULL,
  away_team       TEXT NOT NULL,
  commence_time   TIMESTAMPTZ NOT NULL,
  status          TEXT DEFAULT 'upcoming',   -- upcoming | live | finished
  home_score      INT,
  away_score      INT,
  -- Odds (decimal format)
  odds_home       DECIMAL(8,3),
  odds_draw       DECIMAL(8,3),              -- NULL for sports with no draw
  odds_away       DECIMAL(8,3),
  odds_updated_at TIMESTAMPTZ,
  result          TEXT,                      -- 'home' | 'draw' | 'away' | null
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── BET SLIPS ────────────────────────────────────────────────
CREATE TABLE bet_slips (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id),
  stake         DECIMAL(15,2) NOT NULL CHECK (stake > 0),
  total_odds    DECIMAL(10,3) NOT NULL,
  potential_win DECIMAL(15,2) NOT NULL,
  status        bet_status DEFAULT 'pending',
  settled_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── BET SELECTIONS (legs of a bet slip) ──────────────────────
CREATE TABLE bet_selections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slip_id     UUID NOT NULL REFERENCES bet_slips(id) ON DELETE CASCADE,
  match_id    UUID NOT NULL REFERENCES matches(id),
  pick        TEXT NOT NULL,                 -- 'home' | 'draw' | 'away'
  odds        DECIMAL(8,3) NOT NULL,
  result      selection_result DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ODDS CACHE CONTROL ───────────────────────────────────────
CREATE TABLE odds_cache (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport       TEXT NOT NULL,
  fetched_at  TIMESTAMPTZ DEFAULT NOW(),
  requests_remaining INT
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE matches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_slips     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE odds_cache    ENABLE ROW LEVEL SECURITY;

-- Matches: public read, admin write
CREATE POLICY "Public read matches"   ON matches FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage matches" ON matches FOR ALL   USING (is_admin());

-- Bet slips: users see own, admins see all
CREATE POLICY "Users view own slips"   ON bet_slips FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create slips"     ON bet_slips FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage slips"    ON bet_slips FOR ALL   USING (is_admin());

-- Bet selections: users see own
CREATE POLICY "Users view own selections" ON bet_selections FOR SELECT
  USING (EXISTS (SELECT 1 FROM bet_slips WHERE id = slip_id AND user_id = auth.uid()));
CREATE POLICY "Users create selections"   ON bet_selections FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM bet_slips WHERE id = slip_id AND user_id = auth.uid()));
CREATE POLICY "Admins manage selections"  ON bet_selections FOR ALL USING (is_admin());

-- Odds cache: admin only
CREATE POLICY "Admins manage cache" ON odds_cache FOR ALL USING (is_admin());

-- ── FUNCTION: Place a bet ─────────────────────────────────────
CREATE OR REPLACE FUNCTION place_bet(
  p_user_id      UUID,
  p_stake        DECIMAL(15,2),
  p_selections   JSONB   -- [{match_id, pick, odds}, ...]
)
RETURNS UUID AS $$
DECLARE
  wal           wallets;
  total_odds    DECIMAL(10,3) := 1.0;
  potential_win DECIMAL(15,2);
  slip_id       UUID;
  sel           JSONB;
BEGIN
  -- Lock wallet
  SELECT * INTO wal FROM wallets WHERE user_id = p_user_id FOR UPDATE;
  IF wal.balance < p_stake THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Calculate combined odds
  FOR sel IN SELECT * FROM jsonb_array_elements(p_selections) LOOP
    total_odds := total_odds * (sel->>'odds')::DECIMAL;
  END LOOP;

  potential_win := ROUND(p_stake * total_odds, 2);

  -- Deduct stake
  UPDATE wallets SET balance = balance - p_stake, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO transactions (user_id, wallet_id, type, status, amount, balance_before, balance_after, description)
  VALUES (p_user_id, wal.id, 'bet_placed', 'completed', -p_stake,
          wal.balance, wal.balance - p_stake,
          'Bet — ' || jsonb_array_length(p_selections) || ' selection(s)');

  -- Create slip
  INSERT INTO bet_slips (user_id, stake, total_odds, potential_win)
  VALUES (p_user_id, p_stake, total_odds, potential_win)
  RETURNING id INTO slip_id;

  -- Create selections
  FOR sel IN SELECT * FROM jsonb_array_elements(p_selections) LOOP
    INSERT INTO bet_selections (slip_id, match_id, pick, odds)
    VALUES (slip_id, (sel->>'match_id')::UUID, sel->>'pick', (sel->>'odds')::DECIMAL);
  END LOOP;

  RETURN slip_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── FUNCTION: Settle a match ──────────────────────────────────
CREATE OR REPLACE FUNCTION settle_match(
  p_match_id UUID,
  p_result   TEXT   -- 'home' | 'draw' | 'away'
)
RETURNS VOID AS $$
DECLARE
  sel     bet_selections;
  slip    bet_slips;
  wal     wallets;
  won     BOOLEAN;
BEGIN
  -- Update match result
  UPDATE matches SET result = p_result, status = 'finished', updated_at = NOW()
  WHERE id = p_match_id;

  -- Settle each pending selection for this match
  FOR sel IN
    SELECT * FROM bet_selections
    WHERE match_id = p_match_id AND result = 'pending'
  LOOP
    won := (sel.pick = p_result);
    UPDATE bet_selections SET result = CASE WHEN won THEN 'won' ELSE 'lost' END
    WHERE id = sel.id;

    -- Get the slip
    SELECT * INTO slip FROM bet_slips WHERE id = sel.slip_id;

    -- Check if all selections in slip are settled
    IF NOT EXISTS (
      SELECT 1 FROM bet_selections WHERE slip_id = sel.slip_id AND result = 'pending'
    ) THEN
      -- All selections settled — determine slip outcome
      IF NOT EXISTS (
        SELECT 1 FROM bet_selections WHERE slip_id = sel.slip_id AND result = 'lost'
      ) THEN
        -- All won — pay out
        SELECT * INTO wal FROM wallets WHERE user_id = slip.user_id FOR UPDATE;
        UPDATE wallets SET balance = balance + slip.potential_win, updated_at = NOW()
        WHERE user_id = slip.user_id;

        INSERT INTO transactions (user_id, wallet_id, type, status, amount, balance_before, balance_after, description)
        VALUES (slip.user_id, wal.id, 'bet_won', 'completed', slip.potential_win,
                wal.balance, wal.balance + slip.potential_win,
                'Bet won — ' || slip.potential_win || ' HTG');

        UPDATE bet_slips SET status = 'won', settled_at = NOW() WHERE id = sel.slip_id;

        INSERT INTO notifications (user_id, title, body, type, data)
        VALUES (slip.user_id, '🏆 Paryaj Ou Genyen!',
                'Ou fè ' || slip.potential_win || ' HTG! Paryaj ou a genyen.',
                'success',
                jsonb_build_object('slip_id', sel.slip_id, 'amount', slip.potential_win));
      ELSE
        UPDATE bet_slips SET status = 'lost', settled_at = NOW() WHERE id = sel.slip_id;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── TRIGGERS ─────────────────────────────────────────────────
CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bet_slips_updated_at
  BEFORE UPDATE ON bet_slips FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_matches_sport       ON matches(sport);
CREATE INDEX idx_matches_status      ON matches(status);
CREATE INDEX idx_matches_commence    ON matches(commence_time);
CREATE INDEX idx_bet_slips_user      ON bet_slips(user_id);
CREATE INDEX idx_bet_slips_status    ON bet_slips(status);
CREATE INDEX idx_bet_selections_slip ON bet_selections(slip_id);
CREATE INDEX idx_bet_selections_match ON bet_selections(match_id);
