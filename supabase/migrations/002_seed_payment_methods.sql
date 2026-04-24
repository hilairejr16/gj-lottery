-- ============================================================
-- GJ LOTTERY — PAYMENT METHODS SEED DATA
-- Update account_info values with your actual account details
-- ============================================================

INSERT INTO payment_method_info (
  method, display_name, account_info,
  instructions_ht, instructions_fr, instructions_en,
  min_deposit, max_deposit, min_withdrawal, max_withdrawal,
  sort_order, is_active
) VALUES
(
  'moncash', 'MonCash', '+509-XXXX-XXXX',
  'Voye lajan nan nimewo MonCash sa a. Apre ou fin voye, antre nimewo referans ou a anba a.',
  'Envoyez l''argent à ce numéro MonCash. Après l''envoi, entrez votre numéro de référence ci-dessous.',
  'Send money to this MonCash number. After sending, enter your reference number below.',
  100, 500000, 100, 250000, 1, TRUE
),
(
  'natcash', 'NatCash', '+509-XXXX-XXXX',
  'Voye lajan nan nimewo NatCash sa a. Apre ou fin voye, antre nimewo referans ou a anba a.',
  'Envoyez l''argent à ce numéro NatCash. Après l''envoi, entrez votre numéro de référence ci-dessous.',
  'Send money to this NatCash number. After sending, enter your reference number below.',
  100, 500000, 100, 250000, 2, TRUE
),
(
  'cashapp', 'CashApp', '$GJLottery',
  'Voye lajan nan cashtag $GJLottery. Apre ou fin voye, antre ID tranzaksyon ou a anba a.',
  'Envoyez de l''argent au cashtag $GJLottery. Après l''envoi, entrez l''ID de transaction ci-dessous.',
  'Send money to $GJLottery cashtag. After sending, enter your transaction ID below.',
  500, 500000, 500, 250000, 3, TRUE
),
(
  'zelle', 'Zelle', 'payments@gjlottery.com',
  'Voye lajan bay payments@gjlottery.com sou Zelle. Apre ou fin voye, antre referans ou a anba a.',
  'Envoyez de l''argent à payments@gjlottery.com via Zelle. Entrez ensuite votre référence.',
  'Send money to payments@gjlottery.com via Zelle. Then enter your reference below.',
  500, 500000, 500, 250000, 4, TRUE
),
(
  'paypal', 'PayPal', 'payments@gjlottery.com',
  'Voye lajan bay payments@gjlottery.com sou PayPal (sèlman "Friends & Family"). Antre ID tranzaksyon ou a apre.',
  'Envoyez de l''argent à payments@gjlottery.com via PayPal (Friends & Family uniquement). Entrez ensuite l''ID de transaction.',
  'Send money to payments@gjlottery.com via PayPal (Friends & Family only). Then enter transaction ID.',
  500, 500000, 500, 250000, 5, TRUE
),
(
  'venmo', 'Venmo', '@GJLottery',
  'Voye lajan bay @GJLottery sou Venmo. Antre ID tranzaksyon ou a apre ou fin voye.',
  'Envoyez de l''argent à @GJLottery via Venmo. Entrez ensuite l''ID de transaction.',
  'Send money to @GJLottery on Venmo. Then enter your transaction ID below.',
  500, 250000, 500, 125000, 6, TRUE
),
(
  'wise', 'Wise (TransferWise)', 'payments@gjlottery.com',
  'Voye transfè entènasyonal via Wise bay payments@gjlottery.com. Antre referans ou a apre.',
  'Envoyez un transfert international via Wise à payments@gjlottery.com. Entrez ensuite la référence.',
  'Send international transfer via Wise to payments@gjlottery.com. Enter your reference after.',
  1000, 1000000, 1000, 500000, 7, TRUE
),
(
  'remitly', 'Remitly', 'gjlottery@gmail.com',
  'Voye transfè via Remitly bay gjlottery@gmail.com. Antre nimewo referans ou a apre ou fin voye.',
  'Envoyez un transfert via Remitly à gjlottery@gmail.com. Entrez ensuite votre numéro de référence.',
  'Send transfer via Remitly to gjlottery@gmail.com. Enter your reference number after sending.',
  1000, 1000000, 1000, 500000, 8, TRUE
),
(
  'interac', 'Interac e-Transfer', 'payments@gjlottery.com',
  'Voye Interac e-Transfer bay payments@gjlottery.com (Kanada). Antre nimewo referans ou a apre.',
  'Envoyez un virement Interac à payments@gjlottery.com (Canada). Entrez ensuite la référence.',
  'Send Interac e-Transfer to payments@gjlottery.com (Canada). Enter your reference after.',
  1000, 1000000, 1000, 500000, 9, TRUE
),
(
  'credit_card', 'Carte de Crédit / Credit Card', 'Powered by Stripe',
  'Peye dirèkteman avèk kat kredi oswa kat debi ou a. Tranzaksyon an pwoteje pa Stripe.',
  'Payez directement avec votre carte de crédit ou de débit. Transaction sécurisée par Stripe.',
  'Pay directly with your credit or debit card. Transaction secured by Stripe.',
  500, 500000, 500, 250000, 10, FALSE
);
