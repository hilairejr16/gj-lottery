-- ============================================================
-- GJ LOTTERY — INITIAL DATABASE SCHEMA
-- Phase 1: Users, Wallets, Deposits, Withdrawals
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE payment_method AS ENUM (
  'moncash',
  'natcash',
  'credit_card',
  'zelle',
  'cashapp',
  'paypal',
  'venmo',
  'wise',
  'remitly',
  'interac'
);

CREATE TYPE transaction_type AS ENUM (
  'deposit',
  'withdrawal',
  'bet_placed',
  'bet_won',
  'bet_refund',
  'lottery_ticket',
  'lottery_win',
  'bonus',
  'admin_adjustment'
);

CREATE TYPE transaction_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE deposit_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE withdrawal_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'rejected'
);

-- ============================================================
-- TABLES
-- ============================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username       TEXT UNIQUE NOT NULL,
  full_name      TEXT,
  phone          TEXT,
  country        TEXT DEFAULT 'HT',
  preferred_lang TEXT DEFAULT 'ht' CHECK (preferred_lang IN ('ht', 'fr', 'en')),
  is_admin       BOOLEAN DEFAULT FALSE,
  is_active      BOOLEAN DEFAULT TRUE,
  kyc_verified   BOOLEAN DEFAULT FALSE,
  avatar_url     TEXT,
  date_of_birth  DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets (one per user)
CREATE TABLE wallets (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance    DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
  currency   TEXT DEFAULT 'HTG',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction ledger (immutable record of all money movements)
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  wallet_id       UUID NOT NULL REFERENCES wallets(id),
  type            transaction_type NOT NULL,
  status          transaction_status DEFAULT 'completed',
  amount          DECIMAL(15,2) NOT NULL,
  balance_before  DECIMAL(15,2) NOT NULL,
  balance_after   DECIMAL(15,2) NOT NULL,
  reference_id    UUID,
  reference_type  TEXT,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Deposit requests (user submits → admin approves)
CREATE TABLE deposit_requests (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id),
  amount           DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  payment_method   payment_method NOT NULL,
  reference_number TEXT,
  screenshot_url   TEXT,
  user_notes       TEXT,
  status           deposit_status DEFAULT 'pending',
  admin_id         UUID REFERENCES profiles(id),
  admin_notes      TEXT,
  processed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawal requests (user requests → admin processes)
CREATE TABLE withdrawal_requests (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id),
  amount                DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  payment_method        payment_method NOT NULL,
  destination           TEXT NOT NULL,
  user_notes            TEXT,
  status                withdrawal_status DEFAULT 'pending',
  admin_id              UUID REFERENCES profiles(id),
  admin_notes           TEXT,
  transaction_reference TEXT,
  processed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- GJ Lottery's payment account info (shown to users when depositing)
CREATE TABLE payment_method_info (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  method           payment_method UNIQUE NOT NULL,
  display_name     TEXT NOT NULL,
  account_info     TEXT NOT NULL,
  instructions_ht  TEXT,
  instructions_fr  TEXT,
  instructions_en  TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  min_deposit      DECIMAL(15,2) DEFAULT 100,
  max_deposit      DECIMAL(15,2) DEFAULT 500000,
  min_withdrawal   DECIMAL(15,2) DEFAULT 100,
  max_withdrawal   DECIMAL(15,2) DEFAULT 250000,
  sort_order       INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  type       TEXT DEFAULT 'info',
  is_read    BOOLEAN DEFAULT FALSE,
  data       JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_method_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles
CREATE POLICY "Users view own profile"    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile"  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles"  ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins update all profiles" ON profiles FOR UPDATE USING (is_admin());

-- Wallets
CREATE POLICY "Users view own wallet"    ON wallets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins view all wallets"  ON wallets FOR SELECT USING (is_admin());

-- Transactions
CREATE POLICY "Users view own txns"    ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins view all txns"   ON transactions FOR SELECT USING (is_admin());

-- Deposit requests
CREATE POLICY "Users create deposits"  ON deposit_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users view own deposits" ON deposit_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage deposits" ON deposit_requests FOR ALL USING (is_admin());

-- Withdrawal requests
CREATE POLICY "Users create withdrawals"  ON withdrawal_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users view own withdrawals" ON withdrawal_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage withdrawals" ON withdrawal_requests FOR ALL USING (is_admin());

-- Payment method info (anyone can read active methods)
CREATE POLICY "Public read active methods" ON payment_method_info FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins manage methods"      ON payment_method_info FOR ALL USING (is_admin());

-- Notifications
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins manage notifications" ON notifications FOR ALL USING (is_admin());

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile + wallet when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  uname TEXT;
BEGIN
  uname := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'user_' || substring(replace(NEW.id::text, '-', ''), 1, 8)
  );

  INSERT INTO profiles (id, username, full_name, phone, preferred_lang)
  VALUES (
    NEW.id,
    uname,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'preferred_lang', 'ht')
  );

  INSERT INTO wallets (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Approve a deposit (admin action)
CREATE OR REPLACE FUNCTION approve_deposit(
  deposit_id   UUID,
  admin_uid    UUID,
  admin_note   TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  dep     deposit_requests;
  wal     wallets;
  new_bal DECIMAL(15,2);
BEGIN
  SELECT * INTO dep FROM deposit_requests
  WHERE id = deposit_id AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deposit not found or already processed';
  END IF;

  SELECT * INTO wal FROM wallets WHERE user_id = dep.user_id FOR UPDATE;

  new_bal := wal.balance + dep.amount;

  UPDATE wallets
  SET balance = new_bal, updated_at = NOW()
  WHERE user_id = dep.user_id;

  INSERT INTO transactions (
    user_id, wallet_id, type, status, amount,
    balance_before, balance_after, reference_id, reference_type, description
  ) VALUES (
    dep.user_id, wal.id, 'deposit', 'completed', dep.amount,
    wal.balance, new_bal, deposit_id, 'deposit_requests',
    'Deposit via ' || dep.payment_method
  );

  UPDATE deposit_requests
  SET status = 'approved', admin_id = admin_uid,
      admin_notes = admin_note, processed_at = NOW(), updated_at = NOW()
  WHERE id = deposit_id;

  INSERT INTO notifications (user_id, title, body, type, data)
  VALUES (
    dep.user_id,
    'Depo Apwouve / Dépôt Approuvé / Deposit Approved',
    'Depo ou a nan kantite ' || dep.amount || ' HTG apwouve.',
    'success',
    jsonb_build_object('deposit_id', deposit_id, 'amount', dep.amount)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject a deposit (admin action)
CREATE OR REPLACE FUNCTION reject_deposit(
  deposit_id UUID,
  admin_uid  UUID,
  admin_note TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE deposit_requests
  SET status = 'rejected', admin_id = admin_uid,
      admin_notes = admin_note, processed_at = NOW(), updated_at = NOW()
  WHERE id = deposit_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deposit not found or already processed';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve a withdrawal (admin action — deducts balance)
CREATE OR REPLACE FUNCTION approve_withdrawal(
  withdrawal_id UUID,
  admin_uid     UUID,
  tx_ref        TEXT DEFAULT NULL,
  admin_note    TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  wr      withdrawal_requests;
  wal     wallets;
  new_bal DECIMAL(15,2);
BEGIN
  SELECT * INTO wr FROM withdrawal_requests
  WHERE id = withdrawal_id AND status IN ('pending', 'processing')
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found or already processed';
  END IF;

  SELECT * INTO wal FROM wallets WHERE user_id = wr.user_id FOR UPDATE;

  IF wal.balance < wr.amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  new_bal := wal.balance - wr.amount;

  UPDATE wallets
  SET balance = new_bal, updated_at = NOW()
  WHERE user_id = wr.user_id;

  INSERT INTO transactions (
    user_id, wallet_id, type, status, amount,
    balance_before, balance_after, reference_id, reference_type, description
  ) VALUES (
    wr.user_id, wal.id, 'withdrawal', 'completed', -wr.amount,
    wal.balance, new_bal, withdrawal_id, 'withdrawal_requests',
    'Withdrawal via ' || wr.payment_method
  );

  UPDATE withdrawal_requests
  SET status = 'completed', admin_id = admin_uid,
      transaction_reference = tx_ref, admin_notes = admin_note,
      processed_at = NOW(), updated_at = NOW()
  WHERE id = withdrawal_id;

  INSERT INTO notifications (user_id, title, body, type, data)
  VALUES (
    wr.user_id,
    'Retrè Apwouve / Retrait Approuvé / Withdrawal Approved',
    'Retrè ou a nan kantite ' || wr.amount || ' HTG trete.',
    'success',
    jsonb_build_object('withdrawal_id', withdrawal_id, 'amount', wr.amount)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject a withdrawal (admin action — does NOT deduct balance)
CREATE OR REPLACE FUNCTION reject_withdrawal(
  withdrawal_id UUID,
  admin_uid     UUID,
  admin_note    TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  wr withdrawal_requests;
BEGIN
  UPDATE withdrawal_requests
  SET status = 'rejected', admin_id = admin_uid,
      admin_notes = admin_note, processed_at = NOW(), updated_at = NOW()
  WHERE id = withdrawal_id AND status IN ('pending', 'processing')
  RETURNING * INTO wr;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found or already processed';
  END IF;

  INSERT INTO notifications (user_id, title, body, type, data)
  VALUES (
    wr.user_id,
    'Retrè Refize / Retrait Refusé / Withdrawal Rejected',
    'Retrè ou a refize. Kontakte sipò a pou plis enfòmasyon.',
    'error',
    jsonb_build_object('withdrawal_id', withdrawal_id, 'amount', wr.amount)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_deposits_updated_at
  BEFORE UPDATE ON deposit_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_withdrawals_updated_at
  BEFORE UPDATE ON withdrawal_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_payment_methods_updated_at
  BEFORE UPDATE ON payment_method_info FOR EACH ROW EXECUTE FUNCTION update_updated_at();
