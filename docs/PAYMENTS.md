# GJ Lottery — Payment Methods Guide

Last updated: 2026-04-22

---

## Overview

Phase 1 uses a **manual confirmation flow** for all payment methods:

```
User submits → Reference number provided → Admin verifies externally → Admin approves → Wallet credited
```

This approach:
- Works immediately with zero API integration cost
- Supports all 10 payment methods listed below
- Requires an admin to manually verify each transaction
- Is appropriate for launch until volume justifies automation

---

## Payment Methods

### 🇭🇹 Haitian Methods

#### MonCash (Priority #1 for Haiti)
- **Type**: Mobile money (Digicel Haiti)
- **Flow**: User sends to GJ Lottery MonCash number → submits reference
- **Min deposit**: 100 HTG | **Max deposit**: 500,000 HTG
- **Admin action**: Check MonCash transaction history, verify amount, approve
- **Phase 5**: Direct MonCash API integration (auto-confirmation)
- **⚠️ Update**: Change `+509-XXXX-XXXX` in `payment_method_info` table

#### NatCash (Priority #2 for Haiti)
- **Type**: Mobile money (Natcom Haiti)
- **Flow**: Same as MonCash
- **⚠️ Update**: Change `+509-XXXX-XXXX` in `payment_method_info` table

---

### 🇺🇸 US Methods

#### CashApp ($GJLottery)
- **Type**: US peer-to-peer
- **Flow**: User sends to $GJLottery cashtag → submits transaction ID
- **Note**: Requires CashApp business account
- **⚠️ Update**: Change `$GJLottery` to your real cashtag

#### Zelle (payments@gjlottery.com)
- **Type**: US bank-linked transfer
- **Flow**: User sends to email/phone → submits reference
- **Note**: Requires US bank account enrolled in Zelle
- **⚠️ Update**: Change email to your registered Zelle email/phone

#### PayPal (payments@gjlottery.com)
- **Type**: Online payment
- **Flow**: User sends as "Friends & Family" → submits transaction ID
- **⚠️ Important**: Tell users to send as Friends & Family to avoid PayPal fees
- **Phase 5**: PayPal Business API for auto-confirmation

#### Venmo (@GJLottery)
- **Type**: US peer-to-peer (PayPal subsidiary)
- **Flow**: User sends to @GJLottery → submits transaction ID
- **Note**: Venmo has no public business API
- **⚠️ Update**: Change `@GJLottery` to your real Venmo handle

---

### 🌍 International Methods

#### Wise (TransferWise)
- **Type**: International bank transfer
- **Flow**: User transfers via Wise → submits reference
- **Best for**: Haitian diaspora sending from US, Canada, Europe
- **Phase 5**: Wise Business API integration

#### Remitly
- **Type**: International remittance
- **Flow**: User sends via Remitly app → submits reference number
- **Best for**: Haitian diaspora in North America and Europe
- **Note**: Admin verifies via email notification from Remitly

#### Interac e-Transfer (Canada 🇨🇦)
- **Type**: Canadian bank transfer
- **Flow**: User sends to payments@gjlottery.com → submits confirmation number
- **Best for**: Haitian diaspora in Canada
- **Note**: Requires Canadian bank account

---

### 💳 Card Payments

#### Credit / Debit Card (Stripe)
- **Status**: DISABLED in Phase 1
- **Phase 5**: Full Stripe integration
- **Why disabled**: Stripe requires business registration and KYC

---

## Admin Verification Process

1. User submits deposit request in app
2. Admin receives notification (check Admin Panel → Deposits)
3. Admin opens their corresponding payment app and verifies:
   - Amount matches
   - Reference/transaction ID matches
   - Date is recent (within 24h)
4. Admin clicks **Approve** → wallet credited automatically
5. If fraudulent or wrong amount → click **Reject** with reason

**Processing time target**: Within 2 hours during business hours (9am-9pm)

---

## Setting Up Your Payment Accounts

You MUST update the `payment_method_info` table in Supabase with your real account information:

```sql
-- Example: Update your MonCash number
UPDATE payment_method_info
SET account_info = '+509 3XXX-XXXX'
WHERE method = 'moncash';

-- Example: Update your CashApp cashtag
UPDATE payment_method_info
SET account_info = '$YourRealTag'
WHERE method = 'cashapp';

-- Disable a method you don't have yet
UPDATE payment_method_info
SET is_active = FALSE
WHERE method = 'interac';
```

---

## Currency

- **Primary currency**: HTG (Haitian Gourde)
- All wallet balances stored in HTG
- Phase 5: USD support with exchange rate display

---

## Fees Policy (Recommendation)

| Transaction Type | Recommended Fee |
|-----------------|----------------|
| Deposit         | 0% (free)      |
| Withdrawal      | 1-2% or flat fee |
| Bet winnings    | Built into odds |
| Virtual game    | Built into house edge |
| Lottery ticket  | Built into prize pool |
