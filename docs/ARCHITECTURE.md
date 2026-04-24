# GJ Lottery — Architecture Document

Last updated: 2026-04-22 (Phase 1)

---

## Overview

GJ Lottery is a full-stack Haitian sports betting and lottery platform.
It uses a **monorepo** structure with a shared Supabase backend.

```
GJ Lottery/
├── apps/
│   ├── web/          ← Next.js 14 web app (Vercel)
│   └── mobile/       ← React Native + Expo app (iOS & Android)
├── docs/             ← All documentation
└── supabase/
    └── migrations/   ← SQL schema migrations
```

---

## Tech Stack

| Layer              | Technology              | Reason                                      |
|-------------------|------------------------|---------------------------------------------|
| Web Frontend       | Next.js 14 (App Router) | SSR, i18n, SEO, free on Vercel             |
| Mobile             | React Native + Expo     | Cross-platform iOS + Android, free builds   |
| Backend / API      | Next.js API Routes      | Serverless, no extra server cost            |
| Database           | Supabase (PostgreSQL)   | Free tier, real-time, auth, storage         |
| Authentication     | Supabase Auth (JWT)     | Built-in, secure, free                      |
| Real-time          | Supabase Realtime       | Live balance updates, notifications         |
| Styling            | Tailwind CSS            | Utility-first, fast to build                |
| i18n (Web)         | next-intl               | Next.js native, server components support   |
| i18n (Mobile)      | i18next + react-i18next | Standard React Native i18n                 |
| Form validation    | react-hook-form + zod   | Type-safe, performant                       |
| Payments (Phase 1) | Manual confirmation     | Works for all methods, no API cost          |
| Payments (Phase 5) | Stripe + MonCash API    | Automated card + Haitian mobile money       |
| Hosting (Web)      | Vercel                  | Free tier, automatic deploys                |
| Hosting (Mobile)   | Expo EAS                | Free builds, OTA updates                    |
| Push Notifications | Expo Push               | Free, cross-platform                        |

---

## Database Schema

### Core Tables

```
profiles          → user data (extends auth.users)
wallets           → one wallet per user, tracks balance
transactions      → immutable ledger of all money movements
deposit_requests  → user deposit submissions (pending → approved/rejected)
withdrawal_requests → user withdrawal requests (pending → completed/rejected)
payment_method_info → GJ Lottery's account info per payment method
notifications     → in-app notifications per user
```

### Money Flow (Phase 1)

```
USER DEPOSIT:
  User selects method → sees GJ Lottery account info
  → User sends money externally (MonCash, Zelle, etc.)
  → User submits reference number in app
  → Admin sees deposit request in admin panel
  → Admin verifies externally, clicks Approve
  → approve_deposit() function runs:
      - Credits wallet balance
      - Creates transaction record
      - Sends notification to user

USER WITHDRAWAL:
  User enters amount + destination
  → Withdrawal request created (no balance deducted yet)
  → Admin sees request, sends money externally
  → Admin clicks Approve with transaction reference
  → approve_withdrawal() function runs:
      - Deducts wallet balance (with balance check)
      - Creates transaction record
      - Sends notification to user
```

### Row Level Security (RLS)

Every table has RLS enabled. Key rules:
- Users can only read/write their own data
- Admins (is_admin = TRUE) can read/write all data
- Payment method info is publicly readable (is_active = TRUE)
- Transactions are append-only (no UPDATE/DELETE for users)

---

## Web App Structure (apps/web/src/)

```
app/
  [locale]/                ← next-intl locale prefix (ht/fr/en)
    layout.tsx             ← NextIntlClientProvider + Toaster
    page.tsx               ← Landing page
    (auth)/
      layout.tsx           ← Auth layout (centered, branded)
      login/page.tsx       ← Login form
      register/page.tsx    ← Register form
    (dashboard)/
      layout.tsx           ← Auth guard + Header + Footer
      dashboard/page.tsx   ← User dashboard (balance, quick links, transactions)
      wallet/page.tsx      ← Wallet (deposit/withdraw modals, history)
    (admin)/
      layout.tsx           ← Admin auth guard + sidebar nav
      admin/page.tsx       ← Admin dashboard (stats)
      admin/deposits/      ← Deposit requests management
      admin/withdrawals/   ← Withdrawal requests management
      admin/users/         ← User list

components/
  ui/           ← Button, Input, Modal, Badge
  layout/       ← Header, Footer
  
lib/
  supabase/
    client.ts   ← Browser client (createBrowserClient)
    server.ts   ← Server client (createServerClient) + admin client
  utils.ts      ← formatCurrency, formatDate, cn, constants
  
i18n/
  routing.ts    ← defineRouting (locales, defaultLocale)
  request.ts    ← getRequestConfig

messages/
  ht.json       ← Haitian Creole (default)
  fr.json       ← French
  en.json       ← English

middleware.ts   ← Auth guard + i18n routing
```

---

## Mobile App Structure (apps/mobile/)

```
app/
  _layout.tsx          ← Root: auth state, splash screen
  index.tsx            ← Redirect to (auth) or (tabs)
  (auth)/
    login.tsx          ← Login screen
    register.tsx       ← Register screen
  (tabs)/
    _layout.tsx        ← Tab bar navigator
    index.tsx          ← Home screen (balance + quick links)
    sports.tsx         ← Sports betting (Phase 2)
    wallet.tsx         ← Wallet (deposit/withdraw + history)
    profile.tsx        ← Profile + logout

src/
  lib/
    supabase.ts        ← Supabase client (AsyncStorage session)
```

---

## Security Considerations

1. **Supabase RLS** — All data access controlled at DB level, even if client code is wrong
2. **Service role key** — Only used server-side (Next.js API routes), never exposed to browser
3. **Balance operations** — Only done via stored procedures (approve_deposit, approve_withdrawal) which run as SECURITY DEFINER — no client can directly update balances
4. **Admin check** — Enforced in both middleware (Next.js) and RLS (PostgreSQL)
5. **Input validation** — All forms validated client-side (zod) AND server-side (Supabase constraints)
6. **Secrets** — All API keys in .env.local (gitignored), never committed

---

## Color Palette (Brand)

| Token            | Hex       | Use                          |
|-----------------|-----------|------------------------------|
| brand-blue       | #1B3A6B   | Primary (Haitian flag blue)  |
| brand-red        | #CE1126   | Secondary (Haitian flag red) |
| brand-gold       | #F5A623   | Accent (lottery gold)        |
| brand-gold-light | #FFD166   | Hover state                  |
| bg-base          | #0D1520   | Page background              |
| bg-card          | #152035   | Card background              |
| bg-muted         | #1E2D45   | Input background             |
| bg-border        | #1E3A5F   | Borders                      |
| success          | #16A34A   | Win, approved                |
| warning          | #F59E0B   | Pending                      |
| danger           | #DC2626   | Loss, rejected               |
