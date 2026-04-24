// ── Virtual Games Engine ─────────────────────────────────────────────────────
// Deterministic event generation & result computation for virtual football and
// horse racing. All randomness is seeded so results can be reproduced server-
// side for settlement without storing the RNG state.

// ── Team data ────────────────────────────────────────────────────────────────

export const VIRTUAL_TEAMS: [string, string][] = [
  ['Dynamo FC',       'Sparta United'],
  ['Phoenix Athletic','Galaxy SC'],
  ['Storm FC',        'Titan Warriors'],
  ['Blaze United',    'Nordic FC'],
  ['Dragon SC',       'Eclipse FC'],
  ['Thunder United',  'Viper FC'],
];

// ── Horse data ───────────────────────────────────────────────────────────────

export interface VirtualHorse {
  id:    number;
  name:  string;
  color: string; // CSS hex color
}

export const VIRTUAL_HORSES: VirtualHorse[] = [
  { id: 1, name: 'Éclair Doré',   color: '#F5A623' },
  { id: 2, name: 'Tempête Noire', color: '#3B82F6' },
  { id: 3, name: 'Feu Rouge',     color: '#EF4444' },
  { id: 4, name: 'Vent du Nord',  color: '#8B5CF6' },
  { id: 5, name: 'Tonnerre Bleu', color: '#06B6D4' },
  { id: 6, name: "Étoile d'Or",   color: '#10B981' },
  { id: 7, name: 'Ombre Royale',  color: '#F97316' },
  { id: 8, name: 'Tempête Verte', color: '#84CC16' },
];

// ── Interval constants ───────────────────────────────────────────────────────

export const FOOTBALL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
export const HORSE_INTERVAL_MS    = 3 * 60 * 1000; // 3 minutes

// ── Types ────────────────────────────────────────────────────────────────────

export interface FootballEventTemplate {
  scheduled_at: string; // ISO
  home_team:    string;
  away_team:    string;
  odds_home:    number;
  odds_draw:    number;
  odds_away:    number;
}

export interface HorseEventTemplate {
  scheduled_at: string; // ISO
  horse_names:  Record<string, string>; // {"1":"Éclair Doré", ...}
  horse_odds:   Record<string, number>; // {"1":3.50, ...}
}

// ── Seeded PRNG (LCG) ────────────────────────────────────────────────────────
// Returns a factory that, each call, advances an LCG and returns [0, 1).

export function seededRandom(seed: number): () => number {
  let s = seed >>> 0; // force unsigned 32-bit
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Round to 2 decimal places */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Map a 0-1 value linearly into [lo, hi] */
function lerp(t: number, lo: number, hi: number): number {
  return lo + t * (hi - lo);
}

/** Next boundary (rounding up to the nearest `interval` ms from now) */
function nextBoundary(interval: number): number {
  return Math.ceil(Date.now() / interval) * interval;
}

// ── Football event generation ────────────────────────────────────────────────

export function generateFootballEvents(count: number): FootballEventTemplate[] {
  const events: FootballEventTemplate[] = [];
  const start = nextBoundary(FOOTBALL_INTERVAL_MS);

  for (let i = 0; i < count; i++) {
    const scheduledMs = start + i * FOOTBALL_INTERVAL_MS;
    const scheduled_at = new Date(scheduledMs).toISOString();

    // Seed from timestamp so results are deterministic per slot
    const rand = seededRandom(scheduledMs / 1000);

    // Pick a team pair deterministically
    const pairIdx = Math.floor(rand() * VIRTUAL_TEAMS.length);
    const [home_team, away_team] = VIRTUAL_TEAMS[pairIdx];

    // Generate odds in sensible ranges
    const odds_home = r2(lerp(rand(), 1.5, 3.5));
    const odds_draw = r2(lerp(rand(), 2.5, 4.0));
    const odds_away = r2(lerp(rand(), 1.5, 3.5));

    events.push({ scheduled_at, home_team, away_team, odds_home, odds_draw, odds_away });
  }

  return events;
}

// ── Horse event generation ───────────────────────────────────────────────────

export function generateHorseEvents(count: number): HorseEventTemplate[] {
  const events: HorseEventTemplate[] = [];
  const start = nextBoundary(HORSE_INTERVAL_MS);

  for (let i = 0; i < count; i++) {
    const scheduledMs = start + i * HORSE_INTERVAL_MS;
    const scheduled_at = new Date(scheduledMs).toISOString();

    const rand = seededRandom(scheduledMs / 1000);

    const horse_names: Record<string, string> = {};
    const horse_odds:  Record<string, number>  = {};

    for (const horse of VIRTUAL_HORSES) {
      horse_names[String(horse.id)] = horse.name;
      horse_odds[String(horse.id)]  = r2(lerp(rand(), 2.0, 15.0));
    }

    events.push({ scheduled_at, horse_names, horse_odds });
  }

  return events;
}

// ── Football result computation ──────────────────────────────────────────────

export interface FootballResult {
  result:    'home' | 'draw' | 'away';
  homeScore: number;
  awayScore: number;
}

export function computeFootballResult(
  seed:      number,
  oddsHome:  number,
  oddsDraw:  number,
  oddsAway:  number,
): FootballResult {
  const rand = seededRandom(seed);

  // Weight each outcome by the inverse of its odds (lower odds = more likely)
  const wHome = 1 / oddsHome;
  const wDraw = 1 / oddsDraw;
  const wAway = 1 / oddsAway;
  const total = wHome + wDraw + wAway;

  const roll = rand() * total;

  let result: 'home' | 'draw' | 'away';
  if (roll < wHome) {
    result = 'home';
  } else if (roll < wHome + wDraw) {
    result = 'draw';
  } else {
    result = 'away';
  }

  // Generate scores consistent with the result
  let homeScore: number;
  let awayScore: number;

  if (result === 'draw') {
    homeScore = Math.floor(rand() * 4);      // 0-3
    awayScore = homeScore;
  } else if (result === 'home') {
    awayScore = Math.floor(rand() * 3);       // 0-2
    homeScore = awayScore + 1 + Math.floor(rand() * 3); // away+1 to away+3
  } else {
    homeScore = Math.floor(rand() * 3);
    awayScore = homeScore + 1 + Math.floor(rand() * 3);
  }

  return { result, homeScore, awayScore };
}

// ── Horse result computation ─────────────────────────────────────────────────

export interface HorseResult {
  winner: number; // horse id (1-8)
}

export function computeHorseResult(
  seed:      number,
  horseOdds: Record<string, number>,
): HorseResult {
  const rand = seededRandom(seed);

  // Build cumulative weight array (inverse odds = implied probability)
  const entries = Object.entries(horseOdds).map(([id, odds]) => ({
    id:     parseInt(id, 10),
    weight: 1 / Math.max(odds, 0.01),
  }));

  const total  = entries.reduce((sum, e) => sum + e.weight, 0);
  const roll   = rand() * total;

  let cumulative = 0;
  for (const entry of entries) {
    cumulative += entry.weight;
    if (roll < cumulative) {
      return { winner: entry.id };
    }
  }

  // Fallback: return last horse
  return { winner: entries[entries.length - 1].id };
}
