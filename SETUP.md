# GJ Lottery — Setup Guide

Follow every step in order. Do not skip.

---

## Step 1 — Install Required Tools

Download and install these (if not already installed):

| Tool       | Download                        | Purpose                  |
|-----------|--------------------------------|--------------------------|
| Node.js   | https://nodejs.org (LTS)       | Runs JavaScript          |
| Git       | https://git-scm.com            | Version control          |
| VS Code   | https://code.visualstudio.com  | Code editor              |
| Expo Go   | App Store / Google Play        | Test mobile app on phone |

---

## Step 2 — Create a Supabase Account & Project

1. Go to https://supabase.com → Sign up (free)
2. Click **New Project**
   - Name: `gj-lottery`
   - Database password: save this somewhere safe
   - Region: choose closest to Haiti (e.g. `us-east-1`)
3. Wait for project to be ready (~2 minutes)
4. Go to **Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon / public` key → this is your `SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SERVICE_ROLE_KEY` (keep SECRET)

---

## Step 3 — Run Database Migrations

1. In Supabase, go to **SQL Editor**
2. Open the file: `supabase/migrations/001_initial_schema.sql`
3. Copy the entire content → paste into SQL Editor → click **Run**
4. Open the file: `supabase/migrations/002_seed_payment_methods.sql`
5. Copy the entire content → paste into SQL Editor → click **Run**
6. ✅ You should see all tables created (profiles, wallets, transactions, etc.)

---

## Step 4 — Set Up the Web App

Open a terminal (Command Prompt or PowerShell) in the `GJ Lottery` folder.

### 4a. Create environment file
```bash
cd apps/web
copy .env.example .env.local
```

Edit `.env.local` and fill in your Supabase values:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4b. Install dependencies
```bash
cd "C:\Users\hilai\OneDrive\GJ Lottery"
npm install
```

### 4c. Start the web app
```bash
npm run dev:web
```

Open your browser → go to http://localhost:3000

---

## Step 5 — Set Up the Mobile App

### 5a. Create environment file
```bash
cd apps/mobile
copy .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5b. Install dependencies
```bash
cd "C:\Users\hilai\OneDrive\GJ Lottery\apps\mobile"
npm install
```

### 5c. Install Expo CLI globally
```bash
npm install -g expo-cli eas-cli
```

### 5d. Start the mobile app
```bash
npm run start
```

- A QR code will appear in the terminal
- Open **Expo Go** on your phone → scan the QR code
- The app will load on your phone!

---

## Step 6 — Create Your Admin Account

1. Open http://localhost:3000/register
2. Create an account with your email
3. In Supabase → **Table Editor → profiles** → find your user
4. Set `is_admin = TRUE` for your account
5. Now visit http://localhost:3000/admin — you'll have full admin access

---

## Step 7 — Update Your Payment Account Info

In Supabase → **SQL Editor**, run:
```sql
-- Update MonCash number
UPDATE payment_method_info SET account_info = '+509 YOUR-NUMBER' WHERE method = 'moncash';

-- Update NatCash number
UPDATE payment_method_info SET account_info = '+509 YOUR-NUMBER' WHERE method = 'natcash';

-- Update CashApp cashtag
UPDATE payment_method_info SET account_info = '$YourCashTag' WHERE method = 'cashapp';

-- Update Zelle email
UPDATE payment_method_info SET account_info = 'your@email.com' WHERE method = 'zelle';

-- Update PayPal email
UPDATE payment_method_info SET account_info = 'your@email.com' WHERE method = 'paypal';

-- Disable methods you don't have yet
UPDATE payment_method_info SET is_active = FALSE WHERE method = 'interac';
```

---

## Step 8 — Deploy to Production (Free)

### Deploy Web App to Vercel
1. Create account at https://vercel.com (free)
2. Connect your GitHub/GitLab account
3. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial GJ Lottery build"
   git remote add origin https://github.com/YOUR_USERNAME/gj-lottery.git
   git push -u origin main
   ```
4. In Vercel → Import Project → select your repo
5. Add environment variables (same as `.env.local`)
6. Deploy → your site will be live at `https://gj-lottery.vercel.app`

### Deploy Mobile App to App Stores (Phase 5)
```bash
# Login to Expo
eas login

# Create your EAS project
eas build:configure

# Build for Android (free, creates APK)
eas build --platform android --profile preview

# Build for iOS (requires Apple Developer account $99/yr)
eas build --platform ios
```

---

## Common Issues & Solutions

| Problem | Solution |
|---------|---------|
| `npm install` fails | Make sure Node.js 18+ is installed |
| Supabase connection error | Double-check your `.env.local` keys |
| Admin panel not showing | Make sure `is_admin = TRUE` in profiles table |
| Mobile app won't connect | Make sure Expo Go app is updated |
| "Page not found" on /dashboard | You must be logged in first |

---

## File Structure Reference

```
GJ Lottery/
├── apps/
│   ├── web/                     ← Next.js web app
│   │   ├── src/app/[locale]/    ← All pages
│   │   ├── src/components/      ← Reusable UI components
│   │   ├── src/lib/             ← Supabase client, utilities
│   │   ├── src/messages/        ← Translations (ht, fr, en)
│   │   └── .env.local           ← Your secrets (create from .env.example)
│   └── mobile/                  ← Expo mobile app
│       ├── app/                 ← All screens
│       └── .env                 ← Your secrets (create from .env.example)
├── supabase/
│   └── migrations/              ← Run these in Supabase SQL Editor
├── docs/
│   ├── CHANGELOG.md             ← All changes documented
│   ├── ARCHITECTURE.md          ← Technical architecture
│   └── PAYMENTS.md              ← Payment methods guide
└── SETUP.md                     ← This file
```

---

## Support

If something breaks or you need to add a feature, describe the problem and I will fix it.

Platform: Claude Code  
Developer: Claude (Anthropic)  
Owner: GJ Lottery
