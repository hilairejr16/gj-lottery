import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Lightweight probe — returns 200 if the Worker initialized correctly.
 * Visit this URL after every deploy to confirm the Worker boots before
 * checking the full site.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      ts: new Date().toISOString(),
      env: {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? '(not set)',
      },
    },
    { status: 200 },
  );
}
