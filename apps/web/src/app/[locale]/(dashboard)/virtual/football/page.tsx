'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Zap, Clock, Trophy, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Constants ────────────────────────────────────────────────
const TEAMS = [
  'Les Cayes FC',
  'Port-au-Prince United',
  'Cap-Haïtien Stars',
  'Jacmel Athletic',
  'Gonaïves City',
  'Pétion-Ville FC',
];

const EVENT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// ── Types ────────────────────────────────────────────────────
interface VirtualEvent {
  id: string;
  game_type: string;
  status: 'upcoming' | 'live' | 'settled';
  scheduled_at: string;
  settled_at?: string;
  home_team: string;
  away_team: string;
  home_odds: number;
  draw_odds: number;
  away_odds: number;
  home_score?: number;
  away_score?: number;
  result?: '1' | 'X' | '2';
}

type Pick = '1' | 'X' | '2';

// ── Odds variance helper ──────────────────────────────────────
function jitter(base: number, range = 0.15): number {
  return Math.round((base + (Math.random() * range * 2 - range)) * 100) / 100;
}

// ── Mock event generator (demo mode) ─────────────────────────
function buildMockEvent(): VirtualEvent {
  const shuffled = [...TEAMS].sort(() => Math.random() - 0.5);
  const [home, away] = shuffled;
  const scheduledAt = new Date(
    Math.ceil(Date.now() / EVENT_INTERVAL_MS) * EVENT_INTERVAL_MS,
  );

  return {
    id: 'demo-' + Date.now(),
    game_type: 'football',
    status: 'upcoming',
    scheduled_at: scheduledAt.toISOString(),
    home_team: home,
    away_team: away,
    home_odds: jitter(2.1),
    draw_odds: jitter(3.2),
    away_odds: jitter(2.8),
  };
}

// ── Countdown hook ────────────────────────────────────────────
function useCountdown(targetIso: string | undefined): number {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!targetIso) { setSecondsLeft(0); return; }
    const target = targetIso; // capture for closure narrowing

    function tick() {
      const diff = Math.max(0, Math.floor((new Date(target).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return secondsLeft;
}

// ── Format seconds as MM:SS ───────────────────────────────────
function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Result badge ──────────────────────────────────────────────
function ResultBadge({ result }: { result: string | undefined }) {
  if (!result) return <span className="text-gray-500 text-xs">—</span>;
  const map: Record<string, string> = { '1': 'Lakay', X: 'Egal', '2': 'Deyò' };
  const colorMap: Record<string, string> = {
    '1': 'bg-brand-gold/20 text-brand-gold border-brand-gold/30',
    X: 'bg-gray-600/30 text-gray-300 border-gray-600/40',
    '2': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${colorMap[result] ?? ''}`}
    >
      {result} — {map[result] ?? result}
    </span>
  );
}

// ── Match Card ────────────────────────────────────────────────
function MatchCard({
  event,
  selectedPick,
  onPickSelect,
  stake,
  onStakeChange,
  onPlaceBet,
  placing,
  bettingClosed,
}: {
  event: VirtualEvent;
  selectedPick: Pick | null;
  onPickSelect: (p: Pick) => void;
  stake: string;
  onStakeChange: (v: string) => void;
  onPlaceBet: () => void;
  placing: boolean;
  bettingClosed: boolean;
}) {
  const potentialWin =
    selectedPick && stake && parseFloat(stake) > 0
      ? parseFloat(stake) *
        (selectedPick === '1'
          ? event.home_odds
          : selectedPick === 'X'
            ? event.draw_odds
            : event.away_odds)
      : 0;

  const oddsButtons: { pick: Pick; label: string; sublabel: string; odds: number }[] = [
    { pick: '1', label: '1', sublabel: event.home_team.split(' ')[0], odds: event.home_odds },
    { pick: 'X', label: 'X', sublabel: 'Egal', odds: event.draw_odds },
    { pick: '2', label: '2', sublabel: event.away_team.split(' ')[0], odds: event.away_odds },
  ];

  return (
    <div className="card p-5 space-y-5">
      {/* Teams */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-center">
          <p className="text-sm text-gray-400 mb-1">Lakay</p>
          <p className="font-black text-white text-base leading-tight">{event.home_team}</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="px-4 py-2 bg-bg-muted rounded-xl border border-bg-border">
            <span className="text-brand-gold font-black text-lg">VS</span>
          </div>
        </div>
        <div className="flex-1 text-center">
          <p className="text-sm text-gray-400 mb-1">Deyò</p>
          <p className="font-black text-white text-base leading-tight">{event.away_team}</p>
        </div>
      </div>

      {/* Odds buttons */}
      {bettingClosed ? (
        <div className="text-center py-3 bg-bg-muted rounded-xl border border-bg-border">
          <p className="text-gray-400 text-sm font-medium">
            ⏳ Paryaj fèmen — match ap kòmanse
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {oddsButtons.map(({ pick, label, sublabel, odds }) => (
            <button
              key={pick}
              onClick={() => onPickSelect(pick)}
              className={`odds-btn ${selectedPick === pick ? 'selected' : ''}`}
            >
              <span className="text-xs text-gray-400 mb-0.5 font-semibold">{label}</span>
              <span className="font-black text-white text-xl leading-none">
                {odds.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 mt-0.5 truncate w-full text-center">
                {sublabel}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Stake + Bet button */}
      {!bettingClosed && (
        <div className="space-y-3 pt-1">
          <div>
            <label className="label">Montan (HTG)</label>
            <input
              type="number"
              min="0"
              step="50"
              placeholder="eks: 500"
              value={stake}
              onChange={(e) => onStakeChange(e.target.value)}
              className="input-field"
            />
          </div>

          {potentialWin > 0 && selectedPick && (
            <div className="flex items-center justify-between px-3 py-2 bg-success/10 border border-success/20 rounded-xl">
              <span className="text-xs text-gray-400">Posib Genyen</span>
              <span className="text-success font-black text-sm">{formatCurrency(potentialWin)}</span>
            </div>
          )}

          <button
            onClick={onPlaceBet}
            disabled={placing || !selectedPick || !stake || parseFloat(stake) <= 0}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {placing ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-bg-base border-t-transparent rounded-full" />
                Ap voye paryaj...
              </>
            ) : (
              <>
                <Zap size={16} />
                Paryaje
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Results Table ─────────────────────────────────────────────
function ResultsTable({ events }: { events: VirtualEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Trophy size={32} className="text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Pa gen rezilta pou kounye a</p>
        <p className="text-gray-600 text-xs mt-1">Rezilta ap parèt isi apre chak match</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bg-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Match
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sko
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rezilta
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev, i) => (
              <tr
                key={ev.id}
                className={`border-b border-bg-border last:border-0 transition-colors ${
                  i === 0 ? 'bg-brand-gold/5' : 'hover:bg-bg-muted/40'
                }`}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-white leading-tight">
                    {ev.home_team}
                  </p>
                  <p className="text-xs text-gray-500">vs {ev.away_team}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  {ev.home_score != null && ev.away_score != null ? (
                    <span className="font-black text-white tabular-nums">
                      {ev.home_score} – {ev.away_score}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <ResultBadge result={ev.result} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Live Result Announcement ──────────────────────────────────
function LiveResultBanner({ event, onDismiss }: { event: VirtualEvent; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 8000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  const resultLabel =
    event.result === '1'
      ? `${event.home_team} Genyen!`
      : event.result === 'X'
        ? 'Match Egal!'
        : `${event.away_team} Genyen!`;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in w-full max-w-sm px-4">
      <div className="card p-4 border-brand-gold/60 bg-bg-card shadow-2xl shadow-brand-gold/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center shrink-0">
              <Trophy size={18} className="text-brand-gold" />
            </div>
            <div>
              <p className="text-xs text-brand-gold font-semibold uppercase tracking-wide mb-0.5">
                Rezilta Direk
              </p>
              <p className="font-black text-white text-sm leading-tight">
                {event.home_team} vs {event.away_team}
              </p>
              <p className="text-brand-gold font-bold text-base mt-0.5">{resultLabel}</p>
              {event.home_score != null && event.away_score != null && (
                <p className="text-gray-400 text-xs mt-0.5">
                  Sko final: {event.home_score} – {event.away_score}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-white transition-colors text-lg leading-none mt-0.5"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function VirtualFootballPage() {
  const supabase = createClient();

  const [upcomingEvent, setUpcomingEvent] = useState<VirtualEvent | null>(null);
  const [recentResults, setRecentResults] = useState<VirtualEvent[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Betting state
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);
  const [stake, setStake] = useState('');
  const [placing, setPlacing] = useState(false);

  // Live result banner
  const [liveResult, setLiveResult] = useState<VirtualEvent | null>(null);

  // Countdown
  const secondsLeft = useCountdown(upcomingEvent?.scheduled_at);

  // Betting closes 30 seconds before match start
  const bettingClosed = secondsLeft <= 30;

  // ── Data loading ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);

    // Sync virtual events (generate upcoming + settle overdue)
    try {
      await fetch('/api/virtual/sync');
    } catch {
      // Non-fatal — continue with whatever is in DB already
    }

    // Wallet balance
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      setWalletBalance(wallet?.balance ?? 0);
    }

    // Upcoming events
    const { data: upcoming } = await supabase
      .from('virtual_events')
      .select('*')
      .eq('game_type', 'football')
      .eq('status', 'upcoming')
      .order('scheduled_at')
      .limit(3);

    // Recent settled results
    const { data: settled } = await supabase
      .from('virtual_events')
      .select('*')
      .eq('game_type', 'football')
      .eq('status', 'settled')
      .order('settled_at', { ascending: false })
      .limit(10);

    setRecentResults((settled as VirtualEvent[]) ?? []);

    if (upcoming && upcoming.length > 0) {
      setUpcomingEvent(upcoming[0] as VirtualEvent);
      setIsDemoMode(false);
    } else {
      // Demo mode — no DB events yet
      setUpcomingEvent(buildMockEvent());
      setIsDemoMode(true);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Realtime subscription ───────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('virtual_football_events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'virtual_events',
          filter: 'game_type=eq.football',
        },
        (payload) => {
          const updated = payload.new as VirtualEvent;

          if (updated.status === 'settled') {
            // Show live result banner
            setLiveResult(updated);

            // Move it to top of results
            setRecentResults((prev) => {
              const without = prev.filter((e) => e.id !== updated.id);
              return [updated, ...without].slice(0, 10);
            });

            // Refresh upcoming event
            loadData();
          }

          if (updated.status === 'upcoming') {
            setUpcomingEvent(updated);
            setIsDemoMode(false);
            // Reset selection when a new event appears
            setSelectedPick(null);
            setStake('');
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadData]);

  // ── Auto-refresh demo mode event when timer hits 0 ─────────
  const prevSeconds = useRef(secondsLeft);
  useEffect(() => {
    if (isDemoMode && prevSeconds.current > 0 && secondsLeft === 0) {
      // Simulate the event settling and generate a new one
      if (upcomingEvent) {
        const mockResult = (['1', 'X', '2'] as const)[Math.floor(Math.random() * 3)];
        const homeScore = Math.floor(Math.random() * 4);
        const awayScore =
          mockResult === '1' ? Math.max(0, homeScore - 1) :
          mockResult === '2' ? homeScore + 1 :
          homeScore;

        const settled: VirtualEvent = {
          ...upcomingEvent,
          status: 'settled',
          settled_at: new Date().toISOString(),
          result: mockResult,
          home_score: homeScore,
          away_score: awayScore,
        };
        setLiveResult(settled);
        setRecentResults((prev) => [settled, ...prev].slice(0, 10));
      }

      // New upcoming mock event
      const next = buildMockEvent();
      setUpcomingEvent(next);
      setSelectedPick(null);
      setStake('');
    }
    prevSeconds.current = secondsLeft;
  }, [secondsLeft, isDemoMode, upcomingEvent]);

  // ── Place bet ───────────────────────────────────────────────
  async function handlePlaceBet() {
    if (!selectedPick) { toast.error('Chwazi yon rezilta (1, X, oswa 2)'); return; }
    const stakeNum = parseFloat(stake);
    if (!stakeNum || stakeNum <= 0) { toast.error('Antre montan paryaj ou'); return; }
    if (stakeNum > walletBalance) { toast.error('Balans ou pa ase pou paryaj sa a'); return; }
    if (!upcomingEvent) { toast.error('Pa gen evènman disponib'); return; }
    if (bettingClosed) { toast.error('Paryaj fèmen pou match sa a'); return; }

    if (isDemoMode) {
      toast('Demo: Paryaj pa voye nan baz done', { icon: 'ℹ️' });
      return;
    }

    setPlacing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Ou pa konekte'); setPlacing(false); return; }

    const selectedOdds =
      selectedPick === '1'
        ? upcomingEvent.home_odds
        : selectedPick === 'X'
          ? upcomingEvent.draw_odds
          : upcomingEvent.away_odds;

    const { error } = await supabase.rpc('place_virtual_bet', {
      p_user_id:  user.id,
      p_event_id: upcomingEvent.id,
      p_pick:     selectedPick,
      p_odds:     selectedOdds,
      p_stake:    stakeNum,
    });

    setPlacing(false);

    if (error) {
      toast.error(error.message || 'Erè lè nou voye paryaj ou');
      return;
    }

    const potential = stakeNum * selectedOdds;
    toast.success(
      `Paryaj ${formatCurrency(stakeNum)} voye! Ou ka genyen ${formatCurrency(potential)}`,
    );
    setStake('');
    setSelectedPick(null);

    // Refresh balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    setWalletBalance(wallet?.balance ?? walletBalance - stakeNum);
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6">
      {/* Live result banner */}
      {liveResult && (
        <LiveResultBanner event={liveResult} onDismiss={() => setLiveResult(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Zap size={24} className="text-brand-gold" />
            Foutbòl Vityèl
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Match chak 5 minit — paryaje kounye a</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Balans Ou</p>
          <p className="text-brand-gold font-black text-lg">{formatCurrency(walletBalance)}</p>
        </div>
      </div>

      {/* Demo mode notice */}
      {isDemoMode && !loading && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-warning/10 border border-warning/30 rounded-xl">
          <Zap size={15} className="text-warning shrink-0" />
          <p className="text-warning text-sm">
            <span className="font-bold">Mod Demo</span> — Evènman reyèl ap parèt lè sistèm kominse jenere yo otomatikman.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: countdown + match card */}
        <div className="lg:col-span-2 space-y-4">

          {/* Countdown card */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-brand-gold" />
                <span className="text-sm font-semibold text-gray-300">
                  {secondsLeft > 0 ? 'Pwochen Match' : 'Match Ap Kòmanse'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`font-black text-2xl tabular-nums tracking-widest ${
                    secondsLeft <= 30
                      ? 'text-danger'
                      : secondsLeft <= 60
                        ? 'text-warning'
                        : 'text-brand-gold'
                  }`}
                >
                  {formatCountdown(secondsLeft)}
                </div>
                {bettingClosed && secondsLeft > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-danger/20 text-danger border border-danger/30 rounded-full">
                    Fèmen
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  secondsLeft <= 30 ? 'bg-danger' : secondsLeft <= 60 ? 'bg-warning' : 'bg-brand-gold'
                }`}
                style={{ width: `${Math.min(100, (secondsLeft / 300) * 100)}%` }}
              />
            </div>
          </div>

          {/* Match card */}
          {loading ? (
            <div className="card p-5 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="h-5 bg-bg-muted rounded w-1/3" />
                <div className="h-5 bg-bg-muted rounded w-1/3" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-bg-muted rounded-xl" />
                ))}
              </div>
              <div className="h-12 bg-bg-muted rounded-xl" />
            </div>
          ) : upcomingEvent ? (
            <MatchCard
              event={upcomingEvent}
              selectedPick={selectedPick}
              onPickSelect={setSelectedPick}
              stake={stake}
              onStakeChange={setStake}
              onPlaceBet={handlePlaceBet}
              placing={placing}
              bettingClosed={bettingClosed}
            />
          ) : (
            <div className="card p-10 text-center">
              <Trophy size={36} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">Pa gen evènman disponib</p>
            </div>
          )}
        </div>

        {/* Right column: quick info */}
        <div className="space-y-4">
          {/* Teams list */}
          <div className="card p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Trophy size={14} className="text-brand-gold" />
              Ekip nan Konpetisyon
            </h3>
            <div className="space-y-2">
              {TEAMS.map((team) => (
                <div
                  key={team}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    upcomingEvent?.home_team === team || upcomingEvent?.away_team === team
                      ? 'bg-brand-gold/10 border border-brand-gold/20 text-white font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      upcomingEvent?.home_team === team
                        ? 'bg-brand-gold'
                        : upcomingEvent?.away_team === team
                          ? 'bg-blue-400'
                          : 'bg-gray-700'
                    }`}
                  />
                  {team}
                  {upcomingEvent?.home_team === team && (
                    <span className="ml-auto text-xs text-brand-gold">Lakay</span>
                  )}
                  {upcomingEvent?.away_team === team && (
                    <span className="ml-auto text-xs text-blue-400">Deyò</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* How to bet */}
          <div className="card p-4">
            <h3 className="text-sm font-bold text-white mb-3">Kijan Pou Paryaje?</h3>
            <ol className="space-y-2 text-xs text-gray-400">
              <li className="flex gap-2">
                <span className="text-brand-gold font-bold shrink-0">1.</span>
                Chwazi rezilta — <strong className="text-white">1</strong> (Lakay),{' '}
                <strong className="text-white">X</strong> (Egal),{' '}
                <strong className="text-white">2</strong> (Deyò)
              </li>
              <li className="flex gap-2">
                <span className="text-brand-gold font-bold shrink-0">2.</span>
                Antre montan paryaj ou ann HTG
              </li>
              <li className="flex gap-2">
                <span className="text-brand-gold font-bold shrink-0">3.</span>
                Klike sou <strong className="text-white">Paryaje</strong> anvan
                konte a rive 0:30
              </li>
              <li className="flex gap-2">
                <span className="text-brand-gold font-bold shrink-0">4.</span>
                Rezilta parèt otomatikman chak 5 minit
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Recent results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white flex items-center gap-2">
            <ChevronRight size={18} className="text-brand-gold" />
            Rezilta Dènyè
          </h2>
          <button
            onClick={loadData}
            className="text-xs text-brand-gold hover:underline flex items-center gap-1"
          >
            Rechaje <ChevronRight size={12} />
          </button>
        </div>
        <ResultsTable events={recentResults} />
      </div>
    </div>
  );
}
