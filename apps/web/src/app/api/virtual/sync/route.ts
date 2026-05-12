import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  generateFootballEvents,
  generateHorseEvents,
  computeFootballResult,
  computeHorseResult,
} from '@/lib/virtual-engine';

// ── GET /api/virtual/sync ────────────────────────────────────────────────────
// 1. Upserts upcoming football events (next 2 h = 24 × 5-min slots)
// 2. Upserts upcoming horse events   (next 2 h = 40 × 3-min slots)
// 3. Settles any 'upcoming' event whose scheduled_at has already passed

export async function GET() {
  try {
    const supabase = await createAdminClient();
    let created = 0;
    let settled = 0;

    // ── 1. Football events ───────────────────────────────────────────────────
    const footballTemplates = generateFootballEvents(24);

    for (const tpl of footballTemplates) {
      const { error } = await supabase
        .from('virtual_events')
        .upsert(
          {
            game_type:    'football',
            status:       'upcoming',
            scheduled_at: tpl.scheduled_at,
            home_team:    tpl.home_team,
            away_team:    tpl.away_team,
            odds_home:    tpl.odds_home,
            odds_draw:    tpl.odds_draw,
            odds_away:    tpl.odds_away,
          },
          {
            onConflict:        'scheduled_at,game_type',
            ignoreDuplicates:  true,
          }
        );

      if (!error) created++;
    }

    // ── 2. Horse events ──────────────────────────────────────────────────────
    const horseTemplates = generateHorseEvents(40);

    for (const tpl of horseTemplates) {
      const { error } = await supabase
        .from('virtual_events')
        .upsert(
          {
            game_type:    'horses',
            status:       'upcoming',
            scheduled_at: tpl.scheduled_at,
            horse_names:  tpl.horse_names,
            horse_odds:   tpl.horse_odds,
          },
          {
            onConflict:        'scheduled_at,game_type',
            ignoreDuplicates:  true,
          }
        );

      if (!error) created++;
    }

    // ── 3. Settle overdue events ─────────────────────────────────────────────
    const now = new Date().toISOString();

    const { data: overdue, error: overdueError } = await supabase
      .from('virtual_events')
      .select('*')
      .eq('status', 'upcoming')
      .lte('scheduled_at', now);

    if (overdueError) {
      console.error('[virtual/sync] overdue fetch error:', overdueError);
    }

    for (const event of overdue ?? []) {
      // Use epoch-seconds of scheduled_at as the settlement seed so it's
      // deterministic — calling sync twice yields the same result.
      const seed = Math.floor(new Date(event.scheduled_at).getTime() / 1000);

      if (event.game_type === 'football') {
        const { result, homeScore, awayScore } = computeFootballResult(
          seed,
          event.odds_home ?? 2.0,
          event.odds_draw ?? 3.2,
          event.odds_away ?? 2.5,
        );

        const { error } = await supabase.rpc('settle_virtual_event', {
          p_event_id:    event.id,
          p_result:      result,
          p_home_score:  homeScore,
          p_away_score:  awayScore,
        });

        if (!error) settled++;
        else console.error('[virtual/sync] settle football error:', error);

      } else if (event.game_type === 'horses') {
        // horse_odds stored as {"1": 3.5, ...}
        const horseOdds: Record<string, number> =
          (event.horse_odds as Record<string, number>) ?? {};

        const { winner } = computeHorseResult(seed, horseOdds);

        const { error } = await supabase.rpc('settle_virtual_event', {
          p_event_id:     event.id,
          p_result:       String(winner),
          p_winner_horse: winner,
        });

        if (!error) settled++;
        else console.error('[virtual/sync] settle horses error:', error);
      }
    }

    return NextResponse.json({ created, settled });
  } catch (err) {
    console.error('[virtual/sync] unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
