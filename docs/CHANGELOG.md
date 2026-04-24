# GJ Lottery — Changelog

All notable changes to this project are documented here.
Format: [PHASE] Date — What changed — Why / Impact

---

## [SETUP] 2026-04-22 — Environment & Server

### Environment
- Supabase project created: `hhjwhwiotjcsxzycujgz` (Nano, West US Oregon)
- Both SQL migrations run successfully (schema + payment method seed data)
- `.env.local` configured with Supabase publishable + secret keys
- Mobile `.env` configured with Supabase URL + publishable key

### Dependency Fixes
- Node.js v24.15.0 + npm v11.12.1 installed
- `npm install` — 1,424 packages installed
- Next.js upgraded: `14.2.5` → `16.2.4` (security fix)
- `next-intl` upgraded to `^4.9.1` (Next.js 16 compatible)
- `eslint-config-next` upgraded to `^16.2.4`
- `react` + `react-dom` installed locally in `apps/web`
- `next` installed at monorepo root to fix next-intl workspace resolution

### Next.js 16 Migration
- Renamed `src/middleware.ts` → `src/proxy.ts` (Next.js 16 renamed middleware to proxy)
- Updated export from `middleware()` → `proxy()` function
- `tsconfig.json` auto-updated by Next.js 16 (added `target: ES2017`, updated includes)

### Server Status
- ✅ Running at http://localhost:3000 — no errors
- Next.js 16.2.4 with Turbopack (fast builds)

---

## [PHASE 1] 2026-04-22 — Foundation Build

### Added
- Monorepo structure: `apps/web` (Next.js 14), `apps/mobile` (Expo), root workspace
- **Supabase database schema** (migration 001):
  - Tables: `profiles`, `wallets`, `transactions`, `deposit_requests`, `withdrawal_requests`, `payment_method_info`, `notifications`
  - Enums: `payment_method` (10 methods), `transaction_type`, `transaction_status`, `deposit_status`, `withdrawal_status`
  - Row Level Security (RLS) on all tables
  - Stored functions: `approve_deposit`, `reject_deposit`, `approve_withdrawal`, `reject_withdrawal`
  - Trigger: auto-creates profile + wallet on user signup
- **Seed data** (migration 002): All 10 payment methods pre-configured
- **Web app (Next.js 14)**:
  - Multilingual routing: Haitian Creole (default), French, English via `next-intl`
  - Landing page with hero, features, how-it-works, payment methods sections
  - Auth: Login + Register pages with full validation (react-hook-form + zod)
  - Dashboard: wallet balance, quick game access, recent transactions
  - Wallet page: deposit modal, withdrawal modal, full transaction history
  - Admin panel: deposits management (approve/reject), withdrawals management, users list
  - Dark theme with Haitian flag colors (blue `#1B3A6B`, red `#CE1126`) + lottery gold `#F5A623`
- **Mobile app (Expo)**:
  - Auth screens: Login, Register
  - Tab navigation: Home, Sports, Wallet, Profile
  - Home screen: balance card, quick game links
  - Wallet screen: deposit/withdraw forms + transaction history
  - Profile screen: user info + logout
- **Translations**: Full i18n for Haitian Creole, French, English (nav, auth, wallet, admin, common)

### Payment Methods Available (Phase 1 — all manual confirmation)
| Method       | Account            | Notes                     |
|-------------|-------------------|---------------------------|
| MonCash     | +509-XXXX-XXXX    | Update with real number   |
| NatCash     | +509-XXXX-XXXX    | Update with real number   |
| CashApp     | $GJLottery        | Update cashtag            |
| Zelle       | payments@gjlottery.com | Update email         |
| PayPal      | payments@gjlottery.com | Update email         |
| Venmo       | @GJLottery        | Update handle             |
| Wise        | payments@gjlottery.com | Update email         |
| Remitly     | gjlottery@gmail.com | Update email           |
| Interac     | payments@gjlottery.com | Canada only          |
| Credit Card | Stripe (Phase 5)  | Disabled until Phase 5    |

### Architecture Decisions
- Supabase chosen over Firebase: PostgreSQL + RLS + stored procedures = safer money operations
- Manual payment confirmation for all methods: fastest to ship, works for Haiti market
- Monorepo: shared types between web and mobile, single source of truth
- HTG (Haitian Gourde) as primary currency; USD support in Phase 5

---

---

## [PHASE 2] 2026-04-22 — Sports Betting

### Added
- **GJ Lottery branding**:
  - `public/logo.svg` — Full banner logo: GJ gold badge + "LOTTERY" text + "PARYAJ • JWÈT • LOTRI" tagline + Haitian flag accent lines + star decorations
  - `public/logo-icon.svg` — Icon-only SVG with GJ monogram on gold background + blue/red/gold ring
  - Header updated to use new SVG logo (replaced text fallback)

- **Sports odds integration** (`src/lib/odds-api.ts`):
  - The Odds API client for live real-money odds (500 req/month free)
  - 8 sports supported: Premier League, MLS, Ligue 1, La Liga, NBA, MLB, NHL, NFL
  - Mock data fallback when `ODDS_API_KEY` is not set (demo-safe)
  - `fetchOdds(sportKey)` + `getBestOdds(match)` exported functions

- **Sports betting page** (`/sports`):
  - Sport tabs grouped by category (Soccer leagues, Basketball, Baseball, Hockey, NFL)
  - Match cards with 1/X/2 odds buttons (auto-hides draw for US sports)
  - Parlay/accumulator bet slip: add multiple selections, combined odds calculation
  - Sticky desktop sidebar bet slip + mobile overlay
  - Calls `supabase.rpc('place_bet', ...)` — atomic stake deduction

- **Bet history page** (`/bets`):
  - Shows all user bet slips with status (pending/won/lost/void)
  - Stats: total bets, pending, won, total winnings
  - Expandable selections per slip with individual pick results
  - Win payout confirmation banner

- **Admin match settlement** (`/admin/matches`):
  - Lists all matches from database (upcoming or finished)
  - Settlement modal: pick home/draw/away winner → triggers `settle_match()` stored proc
  - Auto-credits winners, sends win notification, marks slip as won/lost
  - Added "Match / Résultats" to admin sidebar navigation

- **Database** (migration `003_sports_betting.sql`):
  - Tables: `matches`, `bet_slips`, `bet_selections`, `odds_cache`
  - Enums: `sport_type`, `bet_status`, `selection_result`
  - Stored function `place_bet()`: locks wallet, deducts stake atomically, records transaction
  - Stored function `settle_match()`: settles all selections, credits winners, sends notifications
  - Full RLS: users see own bets, admins manage all
  - Indexes on sport, status, commence_time, user_id

### Environment
- `ODDS_API_KEY` added to `.env.local` (leave empty for mock data)
- Get free API key at https://the-odds-api.com

### CSS Fix
- Removed Google Fonts `@import` URL from `globals.css` (caused PostCSS parse error)
- Inter font loaded via Next.js `next/font/google` in `layout.tsx` instead

---

---

## [PHASE 3] 2026-04-22 — Virtual Games

### Added
- **Virtual game engine** (`src/lib/virtual-engine.ts`):
  - Seeded LCG random number generator — results are deterministic (same seed = same result, fair & verifiable)
  - 6 fictional team pairs (football), 8 named horses with colors (racing)
  - `generateFootballEvents(n)` — creates n football events at 5-minute intervals
  - `generateHorseEvents(n)` — creates n horse races at 3-minute intervals
  - `computeFootballResult(seed, odds)` — weighted by inverse odds, realistic score generation
  - `computeHorseResult(seed, horseOdds)` — weighted winner selection

- **Auto-sync API** (`/api/virtual/sync`):
  - Creates upcoming events for next 2 hours (upserts, no duplicates)
  - Auto-settles past events using deterministic results
  - Called on page load — no cron job needed, free tier compatible

- **Virtual Football page** (`/virtual/football`):
  - Live countdown to next match
  - 6 concurrent matches with 1/X/2 odds buttons
  - Parlay bet slip (select multiple matches)
  - Recent results with scores

- **Virtual Horse Racing page** (`/virtual/horses`):
  - Live countdown to next race
  - 8 horses with colored number badges and odds
  - Single-horse pick bet
  - Recent race results with winner and payout

- **Virtual Games hub** (`/virtual`):
  - Two game mode cards linking to football and horses
  - Shows game intervals and max odds

- **Database** (migration `004_virtual_games.sql`):
  - `virtual_events` table with football + horse fields
  - `virtual_bets` table
  - `place_virtual_bet()` function — atomic wallet deduction
  - `settle_virtual_event()` function — auto-credits winners, sends notifications

---

## [PHASE 4] 2026-04-22 — Lottery / Bolet

### Added
- **Bolet lottery page** (`/lottery`):
  - 3 daily draws: Tiraj Maten (10am), Tiraj Midi (1pm), Tiraj Swa (6pm) Haiti time
  - 3 bet types: 2 Chif (×60), 3 Chif (×500), 4 Chif (×4000)
  - For 2-digit bets: 10×10 grid of numbered buttons (00–99)
  - Real-time potential win preview
  - User ticket history with status badges
  - Last 5 draw results with winning numbers

- **Admin lottery page** (`/admin/lottery`):
  - View all draws with ticket counts and total staked
  - Create new draws (Maten/Midi/Swa, custom datetime)
  - Settle draws: enter 2/3/4 digit winning numbers or click Random
  - Auto-credits winners via `settle_bolet_draw()` stored procedure

- **Database** (migration `005_bolet.sql`):
  - `bolet_draws` table (3 draws per day pre-seeded for 7 days)
  - `bolet_tickets` table
  - `buy_bolet_ticket()` function — validates draw is open, deducts stake
  - `settle_bolet_draw()` function — settles all tickets, credits winners, notifies

---

## [PHASE 5] 2026-04-22 — Payments & Polish

### Added
- **Stripe credit card integration**:
  - `/api/stripe/checkout` — creates Stripe Checkout session, converts HTG → USD (rate: 130)
  - `/api/stripe/webhook` — verifies Stripe signature, auto-credits wallet on `checkout.session.completed`
  - "Kat Kredi" button in wallet page → redirects to Stripe hosted payment page
  - Accepts Visa, Mastercard, Amex

- **Wallet page** (`/wallet`):
  - New "Kat Kredi" button alongside Deposit and Withdraw
  - Card deposit modal with HTG amount + USD preview
  - Auto-redirect to Stripe on submit

- **Admin improvements**:
  - Admin sidebar now includes: Dashboard, Deposits, Withdrawals, Users, Matches, Bolet/Lotri
  - `admin/lottery` page added for draw management

### Environment Variables Added
| Variable | Purpose |
|----------|---------|
| `ODDS_API_KEY` | The Odds API (sports odds) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `MONCASH_CLIENT_ID` | MonCash API (future) |
| `MONCASH_CLIENT_SECRET` | MonCash API (future) |

---

## Upcoming

### [PHASE 6] — Mobile App & Live Features
- Expo mobile app (iOS + Android) — already scaffolded, needs virtual/lottery screens
- Push notifications (Expo Push Tokens + OneSignal)
- MonCash / NatCash direct API integration (requires Digicel merchant account)
- Live betting with real-time odds via Supabase Realtime
- KYC verification flow
- Responsible gambling limits & deposit caps
