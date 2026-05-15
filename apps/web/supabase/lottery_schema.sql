-- ============================================================
-- G&J Lottery — Core Lottery Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. GAME TYPES (Bolet 3PM, 4PM, 9PM, New York, etc.) ─────────────────────
CREATE TABLE IF NOT EXISTS public.game_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,          -- 'bolet_3pm', 'bolet_4pm', 'bolet_9pm', 'new_york'
  name        TEXT NOT NULL,                 -- 'Bole 3PM'
  description TEXT,
  draw_times  TEXT[] NOT NULL,               -- ['15:00', '16:00'] in Haiti time (UTC-5)
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the default game types
INSERT INTO public.game_types (slug, name, description, draw_times) VALUES
  ('bolet_3pm',  'Bole 3PM',      'Tiraj chak jou a 3h PM',      ARRAY['15:00']),
  ('bolet_4pm',  'Bole 4PM',      'Tiraj chak jou a 4h PM',      ARRAY['16:00']),
  ('bolet_9pm',  'Bole 9PM',      'Tiraj chak jou a 9h PM',      ARRAY['21:00']),
  ('new_york',   'New York',      'Rezilta New York Lottery',     ARRAY['14:30', '22:30']),
  ('florida',    'Florida',       'Rezilta Florida Lottery',      ARRAY['13:30', '21:30'])
ON CONFLICT (slug) DO NOTHING;


-- ── 2. DRAWS (Each lottery draw event) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.draws (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type_id    UUID NOT NULL REFERENCES public.game_types(id),
  draw_date       DATE NOT NULL,
  draw_time       TIME NOT NULL,

  -- Winning numbers stored as flexible JSON
  -- Example: {"first": "12", "second": "45", "third": "78", "fourth": "03"}
  winning_numbers JSONB NOT NULL,

  -- Status flow: pending → published → verified
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'published', 'verified', 'cancelled')),

  -- Admin who published this result
  published_by    UUID REFERENCES auth.users(id),
  published_at    TIMESTAMPTZ,

  -- Tamper-detection hash (SHA-256 of game+date+time+numbers)
  result_hash     TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate draws for same game+date+time
  UNIQUE (game_type_id, draw_date, draw_time)
);

-- Index for fast result lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_draws_game_date
  ON public.draws (game_type_id, draw_date DESC);

CREATE INDEX IF NOT EXISTS idx_draws_status
  ON public.draws (status);


-- ── 3. TICKETS (User lottery purchases) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  game_type_id    UUID NOT NULL REFERENCES public.game_types(id),

  -- Which draw this ticket is for (NULL = next available draw)
  draw_id         UUID REFERENCES public.draws(id),

  -- Numbers the user picked
  -- Example: {"numbers": ["12", "45", "78"]}
  selected_numbers JSONB NOT NULL,

  -- Bet amount in HTG (Haitian Gourdes)
  bet_amount      DECIMAL(12, 2) NOT NULL CHECK (bet_amount > 0),

  -- Calculated at purchase time based on odds
  potential_payout DECIMAL(12, 2) NOT NULL,

  -- Set when draw result is processed
  actual_payout   DECIMAL(12, 2),

  -- Ticket lifecycle
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'active', 'won', 'lost', 'refunded', 'cancelled')),

  purchased_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at      TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tickets_user
  ON public.tickets (user_id, purchased_at DESC);

CREATE INDEX IF NOT EXISTS idx_tickets_draw
  ON public.tickets (draw_id);

CREATE INDEX IF NOT EXISTS idx_tickets_status
  ON public.tickets (status);


-- ── 4. WALLETS (User balance) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wallets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  balance     DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  currency    TEXT NOT NULL DEFAULT 'HTG',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 5. TRANSACTIONS (All money movements) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  wallet_id       UUID NOT NULL REFERENCES public.wallets(id),

  -- Transaction type
  type            TEXT NOT NULL
                  CHECK (type IN ('deposit', 'withdrawal', 'bet', 'payout', 'refund', 'bonus')),

  amount          DECIMAL(12, 2) NOT NULL,  -- Positive = credit, Negative = debit
  balance_before  DECIMAL(12, 2) NOT NULL,
  balance_after   DECIMAL(12, 2) NOT NULL,

  -- Reference to related entity
  reference_type  TEXT,   -- 'ticket', 'draw', 'stripe_payment', 'moncash_payment'
  reference_id    TEXT,   -- UUID or external payment ID

  -- Payment method for deposits/withdrawals
  payment_method  TEXT,   -- 'moncash', 'stripe', 'zelle', 'natcash'

  status          TEXT NOT NULL DEFAULT 'completed'
                  CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),

  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user
  ON public.transactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_reference
  ON public.transactions (reference_type, reference_id);


-- ── 6. PAYOUTS (Winning ticket payouts) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     UUID NOT NULL REFERENCES public.tickets(id),
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  draw_id       UUID NOT NULL REFERENCES public.draws(id),
  amount        DECIMAL(12, 2) NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  processed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 7. AUDIT LOG (Immutable — no updates/deletes allowed) ───────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id            BIGSERIAL PRIMARY KEY,
  event_type    TEXT NOT NULL,   -- 'draw_published', 'ticket_purchased', 'payout_sent'
  entity_type   TEXT NOT NULL,   -- 'draw', 'ticket', 'user', 'payout'
  entity_id     TEXT NOT NULL,
  actor_id      UUID,            -- Who triggered the event (user or system)
  actor_role    TEXT,            -- 'user', 'admin', 'system'
  data          JSONB,           -- Event-specific data snapshot
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity
  ON public.audit_log (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_created
  ON public.audit_log (created_at DESC);


-- ── 8. ROW LEVEL SECURITY ───────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.game_types    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log     ENABLE ROW LEVEL SECURITY;

-- Game types: anyone can read (public lottery info)
CREATE POLICY "game_types_public_read" ON public.game_types
  FOR SELECT USING (true);

-- Draws: anyone can read published results
CREATE POLICY "draws_public_read" ON public.draws
  FOR SELECT USING (status = 'published' OR status = 'verified');

-- Tickets: users can only see their own tickets
CREATE POLICY "tickets_own_read" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tickets_own_insert" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wallets: users can only see their own wallet
CREATE POLICY "wallets_own_read" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Transactions: users can only see their own transactions
CREATE POLICY "transactions_own_read" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Payouts: users can only see their own payouts
CREATE POLICY "payouts_own_read" ON public.payouts
  FOR SELECT USING (auth.uid() = user_id);

-- Audit log: insert only (no reads for regular users)
CREATE POLICY "audit_log_insert_only" ON public.audit_log
  FOR INSERT WITH CHECK (true);


-- ── 9. REALTIME (Enable live updates for draw results) ──────────────────────
-- Run this to enable Supabase Realtime on the draws table
-- (Also enable in Supabase Dashboard → Database → Replication)
ALTER PUBLICATION supabase_realtime ADD TABLE public.draws;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payouts;


-- ── 10. AUTO-CREATE WALLET ON USER SIGNUP ───────────────────────────────────
-- Trigger that automatically creates a wallet when a new user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance, currency)
  VALUES (NEW.id, 0.00, 'HTG');
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── DONE ─────────────────────────────────────────────────────────────────────
-- Tables created:
--   public.game_types    — Lottery game definitions (Bole 3PM, 4PM, 9PM...)
--   public.draws         — Each draw event + winning numbers
--   public.tickets       — User lottery ticket purchases
--   public.wallets       — User balances in HTG
--   public.transactions  — All money movements (audit trail)
--   public.payouts       — Winning ticket payments
--   public.audit_log     — Immutable event log
