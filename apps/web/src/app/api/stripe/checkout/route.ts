import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const HTG_TO_USD = 130;

export async function POST(request: NextRequest) {
  // Instantiate Stripe inside the handler so a missing key never crashes the Worker on boot.
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: 'Stripe not configured — contact support' },
      { status: 503 },
    );
  }
  // Dynamic import so Stripe's module-level code runs at request time, not Worker init.
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });

  try {
    const body = await request.json();
    // Accept { amountHTG, userId } (Phase 5 spec) OR legacy { amount, userId }
    const userId    = body.userId as string | undefined;
    const amountHTG = (body.amountHTG ?? body.amount) as number | undefined;

    // Validate required fields
    if (!amountHTG || !userId) {
      return NextResponse.json(
        { error: 'userId and amountHTG are required' },
        { status: 400 }
      );
    }

    if (typeof amountHTG !== 'number' || amountHTG <= 0) {
      return NextResponse.json(
        { error: 'amountHTG must be a positive number (in HTG)' },
        { status: 400 }
      );
    }

    // Alias for the rest of the handler
    const amount = amountHTG;

    // Convert HTG → USD → cents for Stripe
    const amountUSD = Math.round((amount / HTG_TO_USD) * 100) / 100; // 2 decimal precision
    const amountCents = Math.round(amountUSD * 100);

    // Enforce minimum charge of $1.00 USD (100 cents)
    if (amountCents < 100) {
      return NextResponse.json(
        {
          error: `Minimòm chaj se $1.00 USD (${HTG_TO_USD} HTG). / Minimum charge is $1.00 USD.`,
        },
        { status: 400 }
      );
    }

    // Verify the user actually exists before creating a session
    const supabase = await createAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: 'GJ Lottery — Rechaj Bous / Wallet Top-up',
              description: `${amount.toLocaleString()} HTG ajoute nan bous ou. / ${amount.toLocaleString()} HTG added to your wallet.`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/wallet?success=1`,
      cancel_url: `${appUrl}/wallet?cancelled=1`,
      metadata: {
        userId,
        amountHTG: String(amount),
      },
      client_reference_id: userId,
    });

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[stripe/checkout] Error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
