// The Odds API — Free tier: 500 requests/month
// Sign up free at https://the-odds-api.com
// Add ODDS_API_KEY to .env.local

const BASE_URL = 'https://api.the-odds-api.com/v4';
const API_KEY  = process.env.ODDS_API_KEY || '';

export const SPORTS = [
  { key: 'soccer_epl',              label: 'Premier League',   emoji: '⚽', sport: 'soccer' },
  { key: 'soccer_usa_mls',          label: 'MLS',              emoji: '⚽', sport: 'soccer' },
  { key: 'soccer_france_ligue_one', label: 'Ligue 1',          emoji: '⚽', sport: 'soccer' },
  { key: 'soccer_spain_la_liga',    label: 'La Liga',          emoji: '⚽', sport: 'soccer' },
  { key: 'basketball_nba',          label: 'NBA',              emoji: '🏀', sport: 'basketball' },
  { key: 'baseball_mlb',            label: 'MLB',              emoji: '⚾', sport: 'baseball' },
  { key: 'icehockey_nhl',           label: 'NHL',              emoji: '🏒', sport: 'hockey' },
  { key: 'americanfootball_nfl',    label: 'NFL',              emoji: '🏈', sport: 'american_football' },
] as const;

export type SportKey = typeof SPORTS[number]['key'];

export interface OddsMatch {
  id:           string;
  sport_key:    string;
  sport_title:  string;
  commence_time: string;
  home_team:    string;
  away_team:    string;
  bookmakers:   Bookmaker[];
}

interface Bookmaker {
  key:      string;
  title:    string;
  markets:  Market[];
}

interface Market {
  key:      string;
  outcomes: Outcome[];
}

interface Outcome {
  name:  string;
  price: number;
}

// Get odds for a sport (h2h = moneyline/1X2)
export async function fetchOdds(sportKey: string): Promise<OddsMatch[]> {
  if (!API_KEY) return getMockOdds(sportKey);

  const url = `${BASE_URL}/sports/${sportKey}/odds?apiKey=${API_KEY}&regions=us,eu&markets=h2h&oddsFormat=decimal&dateFormat=iso`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
    if (!res.ok) return getMockOdds(sportKey);
    return res.json();
  } catch {
    return getMockOdds(sportKey);
  }
}

// Extract best odds from bookmakers for a match
export function getBestOdds(match: OddsMatch): { home: number; draw: number | null; away: number } {
  let home = 0, draw = 0, away = 0;

  for (const bm of match.bookmakers) {
    for (const market of bm.markets) {
      if (market.key !== 'h2h') continue;
      for (const outcome of market.outcomes) {
        if (outcome.name === match.home_team) home = Math.max(home, outcome.price);
        else if (outcome.name === match.away_team) away = Math.max(away, outcome.price);
        else if (outcome.name === 'Draw') draw = Math.max(draw, outcome.price);
      }
    }
  }

  return {
    home: home || 2.00,
    draw: draw > 0 ? draw : null,
    away: away || 2.00,
  };
}

// ── MOCK DATA (used when no API key is set) ───────────────────
function getMockOdds(sportKey: string): OddsMatch[] {
  const sport = SPORTS.find(s => s.key === sportKey);
  const isSoccer = sportKey.startsWith('soccer');

  const fixtures: [string, string][] = {
    soccer_epl: [
      ['Manchester City', 'Arsenal'], ['Liverpool', 'Chelsea'],
      ['Tottenham', 'Manchester United'], ['Newcastle', 'Aston Villa'],
    ],
    soccer_usa_mls: [
      ['Inter Miami', 'LA Galaxy'], ['NYCFC', 'Atlanta United'],
    ],
    basketball_nba: [
      ['Los Angeles Lakers', 'Boston Celtics'], ['Golden State Warriors', 'Miami Heat'],
      ['Milwaukee Bucks', 'Phoenix Suns'], ['Denver Nuggets', 'Dallas Mavericks'],
    ],
    baseball_mlb: [
      ['New York Yankees', 'Boston Red Sox'], ['Los Angeles Dodgers', 'San Francisco Giants'],
      ['Houston Astros', 'Texas Rangers'],
    ],
    icehockey_nhl: [
      ['Toronto Maple Leafs', 'Montreal Canadiens'], ['Vegas Golden Knights', 'Edmonton Oilers'],
    ],
    americanfootball_nfl: [
      ['Kansas City Chiefs', 'Buffalo Bills'], ['San Francisco 49ers', 'Dallas Cowboys'],
    ],
  }[sportKey] || [['Team A', 'Team B']];

  return fixtures.map(([home, away], i) => ({
    id: `mock-${sportKey}-${i}`,
    sport_key: sportKey,
    sport_title: sport?.label || sportKey,
    commence_time: new Date(Date.now() + (i + 1) * 3600000 * 24).toISOString(),
    home_team: home,
    away_team: away,
    bookmakers: [{
      key: 'gj_odds',
      title: 'GJ Lottery',
      markets: [{
        key: 'h2h',
        outcomes: [
          { name: home, price: +(1.5 + Math.random() * 2).toFixed(2) },
          ...(isSoccer ? [{ name: 'Draw', price: +(2.8 + Math.random()).toFixed(2) }] : []),
          { name: away, price: +(1.5 + Math.random() * 2).toFixed(2) },
        ],
      }],
    }],
  }));
}
