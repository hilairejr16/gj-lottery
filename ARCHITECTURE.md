# G&J Lottery — Full System Architecture

## Overview

G&J Lottery is a production-grade sportsbook + lottery + casino ecosystem built for the Haitian market
with global scalability. It is modeled after FanDuel, Bet365, Stake, and 1xBet.

---

## Tech Stack (Current → Target)

| Layer            | Current (MVP)                    | Target (Production Scale)             |
|-----------------|----------------------------------|---------------------------------------|
| Frontend         | Next.js 16, Tailwind, TypeScript | + Framer Motion, React Query, PWA     |
| Backend          | Next.js API Routes (Edge)        | NestJS microservices + GraphQL        |
| Database         | Supabase (PostgreSQL + Auth)     | PostgreSQL + Prisma + Redis cache     |
| Real-time        | Supabase Realtime                | WebSockets via Socket.io              |
| Payments         | Stripe, manual methods           | Full payment gateway orchestration    |
| Mobile           | Expo / React Native              | + Face ID, push notifications, EAS   |
| Infrastructure   | Cloudflare Pages                 | Cloudflare + AWS + Docker + K8s       |
| CI/CD            | GitHub push                      | GitHub Actions full pipeline          |
| AI               | None                             | OpenAI for predictions + chatbot      |

---

## Database Schema Summary

### Core Tables
- `profiles` — user accounts, KYC status, is_admin flag
- `wallets` — one per user, balance in HTG
- `transactions` — all wallet movements (deposit/withdraw/bet/win)
- `deposit_requests` — pending deposit approvals
- `withdrawal_requests` — pending withdrawal approvals
- `payment_method_info` — 10 payment methods seeded

### Sports Betting
- `matches` — sports events with odds (home/draw/away)
- `bet_slips` — user bet tickets (single/parlay)
- `bet_selections` — individual picks per slip

### Virtual Games
- `virtual_events` — auto-generated football (5min) + horse (3min) events
- `virtual_bets` — user bets on virtual events

### Lottery
- `bolet_draws` — 3x daily draws, morning/afternoon/evening
- `bolet_tickets` — user ticket purchases (2chif/3chif/4chif)

### Planned Additions
- `casino_sessions` — slot/table game sessions
- `affiliate_links` — referral tracking
- `vip_xp` — XP tracking per user
- `missions` — daily/weekly challenge definitions
- `mission_progress` — user mission completion state
- `kyc_documents` — uploaded ID verification files
- `audit_log` — security audit trail

---

## API Structure

### Current Routes
```
POST /api/stripe/checkout       — Create Stripe checkout session
POST /api/stripe/webhook        — Handle payment confirmation
GET  /api/virtual/sync          — Sync virtual events + settle past rounds
```

### Planned Routes
```
GET  /api/sports/odds           — Fetch live odds from The Odds API
POST /api/bets/place            — Place bet (wrapped RPC)
POST /api/lottery/ticket        — Buy bolet ticket (wrapped RPC)
GET  /api/wallet/balance        — Current wallet balance
POST /api/payments/moncash      — MonCash payment initiation
POST /api/payments/natcash      — NatCash payment initiation
POST /api/kyc/upload            — Upload KYC documents
GET  /api/affiliate/stats       — Affiliate commission stats
POST /api/ai/predict            — AI match prediction (OpenAI)
GET  /api/leaderboard           — Weekly XP leaderboard
```

---

## Folder Structure

```
GJ Lottery/
├── apps/
│   ├── web/                          ← Next.js 16 web app
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── [locale]/
│   │   │   │   │   ├── (public)/     ← Public pages (legal, about, blog...)
│   │   │   │   │   ├── (auth)/       ← Login, Register
│   │   │   │   │   ├── (dashboard)/  ← Main app (sports, lottery, wallet...)
│   │   │   │   │   └── (admin)/      ← Admin panel
│   │   │   │   ├── api/              ← Edge API routes
│   │   │   │   ├── sitemap.ts        ← Dynamic sitemap
│   │   │   │   └── layout.tsx        ← Root layout + SEO metadata
│   │   │   ├── components/
│   │   │   │   ├── layout/           ← Header, Footer
│   │   │   │   └── ui/               ← Button, Input, Modal, Badge
│   │   │   └── lib/
│   │   │       ├── supabase/         ← Client + server + admin clients
│   │   │       ├── virtual-engine.ts ← Deterministic RNG for virtual games
│   │   │       └── odds-api.ts       ← The Odds API + mock fallback
│   │   ├── public/                   ← Static assets
│   │   ├── next.config.mjs
│   │   ├── tailwind.config.ts
│   │   └── wrangler.toml             ← Cloudflare Pages config
│   └── mobile/                       ← Expo React Native app
│       ├── app/
│       │   └── (tabs)/               ← Home, Sports, Virtual, Lottery, Wallet
│       └── eas.json                  ← EAS Build config
├── supabase/
│   └── migrations/                   ← SQL migration files
├── .github/
│   └── workflows/                    ← CI/CD pipelines (to add)
├── vercel.json                        ← Monorepo build config
└── package.json                       ← npm workspaces
```

---

## Deployment Workflow

### Current: Cloudflare Pages
1. Push to GitHub → Cloudflare Pages detects push
2. Build: `cd apps/web && npx @cloudflare/next-on-pages@1`
3. Output: `apps/web/.vercel/output/static`
4. Edge runtime: all API routes have `export const runtime = 'edge'`

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET        (set after Cloudflare URL known)
ODDS_API_KEY                 (The Odds API — theodsapi.com)
MONCASH_CLIENT_ID
MONCASH_CLIENT_SECRET
```

---

## CI/CD Pipeline (GitHub Actions — to implement)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install
      - run: cd apps/web && npm run type-check
      - run: cd apps/web && npm run lint
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: gj-lottery
          directory: apps/web/.vercel/output/static
          command: cd apps/web && npx @cloudflare/next-on-pages@1
```

---

## Production Scale Architecture (Target)

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │  CDN + WAF +    │
                    │  DDoS protect   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌────▼────┐  ┌─────▼─────┐
       │  Next.js    │ │ NestJS  │  │  WebSocket │
       │  Frontend   │ │  API    │  │   Server   │
       │  (CF Pages) │ │ (AWS)   │  │ (live odds)│
       └──────┬──────┘ └────┬────┘  └─────┬─────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌────▼────┐  ┌─────▼─────┐
       │  Supabase   │ │  Redis  │  │  Stripe   │
       │  PostgreSQL │ │  Cache  │  │  Payment  │
       │  + Auth     │ │         │  │  Gateway  │
       └─────────────┘ └─────────┘  └───────────┘
```

---

## Security Checklist

- [x] SSL/TLS via Cloudflare
- [x] Supabase RLS (Row Level Security) on all tables
- [x] Admin-only operations via service role key (server-side only)
- [x] Edge API routes — no server-side secrets exposed to client
- [ ] Rate limiting (Cloudflare WAF rules)
- [ ] 2FA for admin accounts
- [ ] KYC document verification
- [ ] AML transaction monitoring
- [ ] Geo-blocking for restricted jurisdictions
- [ ] Audit log for all financial operations

---

## Monetization Strategy

| Revenue Stream         | Implementation                    | Est. Margin |
|------------------------|-----------------------------------|-------------|
| Sports Betting Margin  | Vig/juice built into odds (~10%)  | 8–12%       |
| Virtual Games          | House edge in odds (~15%)         | 12–18%      |
| Bolet Lottery          | Fixed multipliers vs true odds    | 20–30%      |
| Casino Games           | RTP of 95-97% = 3-5% house edge   | 3–5%        |
| Deposit Fees           | Optional processing fee           | 1–3%        |
| VIP Subscriptions      | Monthly VIP tier fees (future)    | Fixed       |

---

## SEO Strategy

1. **Technical SEO**: sitemap.xml, robots.txt, hreflang tags ✅
2. **Structured Data**: Organization JSON-LD ✅
3. **Meta Tags**: Full OG + Twitter cards ✅
4. **Content**: Blog in 3 languages (Creole, French, English)
5. **Keywords**: "paryaj Ayiti", "bolèt Haiti", "sports betting Haiti"
6. **Local SEO**: Google Business Profile for Haiti
7. **Backlinks**: Haitian sports/news sites, diaspora communities

---

## Affiliate Marketing Strategy

- **Tier system**: Agent → Senior → Master → Elite (15%–30% commission)
- **Multi-level**: Earn on sub-affiliates' referrals
- **Channels**: Facebook groups, WhatsApp, diaspora communities (US, Canada, France)
- **Influencers**: Haitian sports commentators, content creators
- **Tracking**: UTM parameters + unique referral codes

---

## Production Roadmap

### Phase 1 — MVP (Complete ✅)
- User auth, wallet, sports betting, virtual games, bolet lottery
- Stripe payments, admin panel, mobile app

### Phase 2 — Growth (Now)
- Legal pages, SEO, blog, social media presence
- Premium UI redesign, casino games, VIP program, affiliates

### Phase 3 — Monetization (Next 3 months)
- MonCash/NatCash live integration
- KYC/ID verification flow
- Live odds API (The Odds API or SportRadar)
- Push notifications (mobile)
- Email marketing (welcome, deposit, win notifications)

### Phase 4 — Scale (3–6 months)
- AI betting assistant / predictions
- Live dealer casino integration
- Crypto wallet support
- Multi-currency (USD, CAD, EUR)
- Kubernetes deployment for scale

### Phase 5 — Dominance (6–12 months)
- iOS App Store + Google Play launch
- TV/radio advertising in Haiti
- Partnership with Haitian sports leagues
- Regional expansion (Dominican Republic, Caribbean)
