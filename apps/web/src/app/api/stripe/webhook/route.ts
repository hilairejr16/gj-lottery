import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Build a Supabase admin client without needing cookies.
 * The webhook endpoint has no browser session, so we use the
 * service role key directly via the base JS client.
 */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase env vars (URL / SERVICE_ROLE_KEY) are not set');
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  // Instantiate Stripe inside the handler so a missing key never crashes the Worker on boot.
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('[stripe/webhook] STRIPE_SECRET_KEY is not set');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 },
    );
  }
  const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  // Read raw body — MUST use .text() for Stripe signature verification
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe/webhook] Signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Only handle the event type we care about
  if (event.type !== 'checkout.session.completed') {
    // Return 200 for unhandled events so Stripe doesn't retry them
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.userId;
  const amountHTGRaw = session.metadata?.amountHTG;

  if (!userId || !amountHTGRaw) {
    console.error('[stripe/webhook] Missing metadata on session:', session.id);
    return NextResponse.json(
      { error: 'Missing userId or amountHTG in session metadata' },
      { status: 400 }
    );
  }

  const amountHTG = parseFloat(amountHTGRaw);

  if (isNaN(amountHTG) || amountHTG <= 0) {
    console.error('[stripe/webhook] Invalid amountHTG:', amountHTGRaw);
    return NextResponse.json(
      { error: 'Invalid amountHTG in session metadata' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  try {
    // 1. Fetch the user's wallet (needed for balance_before / balance_after)
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', userId)
      .single();

    if (walletError || !wallet) {
      console.error('[stripe/webhook] Wallet not found for user:', userId, walletError);
      // Return 500 so Stripe retries — this shouldn't happen for valid users
      return NextResponse.json(
        { error: 'Wallet not found for user' },
        { status: 500 }
      );
    }

    const balanceBefore = parseFloat(String(wallet.balance));
    const balanceAfter = balanceBefore + amountHTG;

    // 2. Credit the wallet
    const { error: walletUpdateError } = await supabase
      .from('wallets')
      .update({
        balance: balanceAfter,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (walletUpdateError) {
      console.error('[stripe/webhook] Failed to update wallet:', walletUpdateError);
      return NextResponse.json(
        { error: 'Failed to credit wallet' },
        { status: 500 }
      );
    }

    // 3. Insert transaction record
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: userId,
      wallet_id: wallet.id,
      type: 'deposit',
      status: 'completed',
      amount: amountHTG,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      reference_type: 'stripe_checkout',
      reference_id: null, // Stripe session ID is a string; reference_id is UUID
      description: `Stripe card deposit — Session ${session.id}`,
    });

    if (txError) {
      // Wallet was already credited — log but don't fail (don't let Stripe retry and double-credit)
      console.error(
        '[stripe/webhook] Wallet credited but transaction insert failed:',
        txError
      );
    }

    // 4. Insert in-app notification (Haitian Creole)
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Depo Konfime / Deposit Confirmed',
      body: `💳 Depo ou konfime! ${amountHTG.toLocaleString()} HTG ajoute nan bous ou.`,
      type: 'success',
      data: {
        stripe_session_id: session.id,
        amount_htg: amountHTG,
        payment_method: 'credit_card',
      },
    });

    if (notifError) {
      // Non-critical — log and continue
      console.error('[stripe/webhook] Failed to insert notification:', notifError);
    }

    console.log(
      `[stripe/webhook] Successfully credited ${amountHTG} HTG to user ${userId} (session ${session.id})`
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe/webhook] Unexpected error:', error);
    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
