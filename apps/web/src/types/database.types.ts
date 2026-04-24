// Auto-generated Supabase types — matches 001_initial_schema.sql

export type PaymentMethod =
  | 'moncash' | 'natcash' | 'credit_card' | 'zelle'
  | 'cashapp' | 'paypal' | 'venmo' | 'wise' | 'remitly' | 'interac';

export type TransactionType =
  | 'deposit' | 'withdrawal' | 'bet_placed' | 'bet_won'
  | 'bet_refund' | 'lottery_ticket' | 'lottery_win' | 'bonus' | 'admin_adjustment';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type DepositStatus     = 'pending' | 'approved' | 'rejected';
export type WithdrawalStatus  = 'pending' | 'processing' | 'completed' | 'rejected';

export interface Profile {
  id:             string;
  username:       string;
  full_name:      string | null;
  phone:          string | null;
  country:        string;
  preferred_lang: 'ht' | 'fr' | 'en';
  is_admin:       boolean;
  is_active:      boolean;
  kyc_verified:   boolean;
  avatar_url:     string | null;
  date_of_birth:  string | null;
  created_at:     string;
  updated_at:     string;
}

export interface Wallet {
  id:         string;
  user_id:    string;
  balance:    number;
  currency:   string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id:             string;
  user_id:        string;
  wallet_id:      string;
  type:           TransactionType;
  status:         TransactionStatus;
  amount:         number;
  balance_before: number;
  balance_after:  number;
  reference_id:   string | null;
  reference_type: string | null;
  description:    string | null;
  created_at:     string;
}

export interface DepositRequest {
  id:               string;
  user_id:          string;
  amount:           number;
  payment_method:   PaymentMethod;
  reference_number: string | null;
  screenshot_url:   string | null;
  user_notes:       string | null;
  status:           DepositStatus;
  admin_id:         string | null;
  admin_notes:      string | null;
  processed_at:     string | null;
  created_at:       string;
  updated_at:       string;
  profiles?:        Pick<Profile, 'username' | 'full_name' | 'phone'>;
}

export interface WithdrawalRequest {
  id:                    string;
  user_id:               string;
  amount:                number;
  payment_method:        PaymentMethod;
  destination:           string;
  user_notes:            string | null;
  status:                WithdrawalStatus;
  admin_id:              string | null;
  admin_notes:           string | null;
  transaction_reference: string | null;
  processed_at:          string | null;
  created_at:            string;
  updated_at:            string;
  profiles?:             Pick<Profile, 'username' | 'full_name' | 'phone'>;
}

export interface PaymentMethodInfo {
  id:               string;
  method:           PaymentMethod;
  display_name:     string;
  account_info:     string;
  instructions_ht:  string | null;
  instructions_fr:  string | null;
  instructions_en:  string | null;
  is_active:        boolean;
  min_deposit:      number;
  max_deposit:      number;
  min_withdrawal:   number;
  max_withdrawal:   number;
  sort_order:       number;
}

export interface Notification {
  id:         string;
  user_id:    string;
  title:      string;
  body:       string;
  type:       'info' | 'success' | 'warning' | 'error';
  is_read:    boolean;
  data:       Record<string, unknown> | null;
  created_at: string;
}
