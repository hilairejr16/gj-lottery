'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Zap, Clock, Trophy, Star } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Constants ────────────────────────────────────────────────────────────────

const HORSE_NAMES: Record<number, string> = {
  1: 'Reken Rapid',
  2: 'Solèy Cho',
  3: 'Toro Ble',
  4: 'Zetwal Nwa',
  5: 'Koulèv Vit',
  6: 'Lago Fòs',
  7: 'Bèf Chaje',
  8: 'Kolibri',
};

const BASE_ODDS: Record<number, number> = {
  1: 3.50,
  2: 5.00,
  3: 4.20,
  4: 6.00,
  5: 8.00,
  6: 7.50,
  7: 4.80,
  8: 9.00,
};

/** Fixed color per horse number (1-indexed) */
const HORSE_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-yellow-500',  text: 'text-yellow-500',  border: 'border-yellow-500'  }, // gold
  2: { bg: 'bg-blue-500',    text: 'text-blue-400',    border: 'border-blue-500'    }, // blue
  3: { bg: 'bg-red-500',     text: 'text-red-400',     border: 'border-red-500'     }, // red
  4: { bg: 'bg-purple-500',  text: 'text-purple-400',  border: 'border-purple-500'  }, // purple
  5: { bg: 'bg-green-500',   text: 'text-green-400',   border: 'border-green-500'   }, // green
  6: { bg: 'bg-orange-500',  text: 'text-orange-400',  border: 'border-orange-500'  }, // orange
  7: { bg: 'bg-pink-500',    text: 'text-pink-400',    border: 'border-pink-500'    }, // pink
  8: { bg: 'bg-teal-500',    text: 'text-teal-400',    border: 'border-teal-500'    }, // teal
};

const RACE_DURATION_SECONDS = 180; // 3 minutes

// ── Types ────────────────────────────────────────────────────────────────────

interface VirtualEvent {
  id: string;
  game_type: string;
  status: 'upcoming' | 'live' | 'settled' | 'cancelled';
  scheduled_at: string;
  settled_at?: string;
  winner_horse?: number;
  horse_names?: Record<string, string>;
  odds?: Record<string, number>;
  race_number?: number;
}

interface RaceHistoryRow {
  id: string;
  race_number?: number;
  winner_horse: number;
  horse_names?: Record<string, string>;
  odds?: Record<string, number>;
  settled_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Vary odds slightly each race so they feel dynamic.
 * Applies a ±5% jitter seeded by event id (deterministic per race).
 */
function computeOdds(eventId: string | null): Record<number, number> {
  if (!eventId) return { ...BASE_ODDS };
  // Simple hash from the last chars of the UUID
  const seed = parseInt(eventId.replace(/-/g, '').slice(-6), 16) / 0xffffff;
  const result: Record<number, number> = {};
  for (let h = 1; h <= 8; h++) {
    const jitter = 1 + (((seed * h * 13) % 1) - 0.5) * 0.1; // ±5%
    result[h] = Math.round(BASE_ODDS[h] * jitter * 100) / 100;
  }
  return result;
}

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

function secondsToMMSS(sec: number): string {
  const m = Math.floor(Math.max(sec, 0) / 60);
  const s = Math.max(sec, 0) % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Number circle with horse's color */
function HorseCircle({ number, size = 'md' }: { number: number; size?: 'md' | 'lg' }) {
  const c = HORSE_COLORS[number];
  const sz = size === 'lg'
    ? 'w-12 h-12 text-xl font-black'
    : 'w-9 h-9 text-base font-bold';
  return (
    <div className={`${sz} ${c.bg} rounded-full flex items-center justify-center text-white shrink-0`}>
      {number}
    </div>
  );
}

/** Single horse betting card */
function HorseCard({
  number,
  name,
  odds,
  selected,
  onSelect,
  disabled,
}: {
  number: number;
  name: string;
  odds: number;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  const c = HORSE_COLORS[number];

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-200
        flex items-center gap-3
        ${selected
          ? `border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20`
          : `border-bg-border bg-bg-muted hover:border-${c.border.replace('border-', '')}/50 hover:bg-bg-card`
        }
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}
      `}
    >
      <HorseCircle number={number} />

      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm leading-tight ${selected ? 'text-yellow-400' : 'text-white'}`}>
          {name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Chwal #{number}</p>
      </div>

      <div className="text-right shrink-0">
        <p className={`text-lg font-black ${selected ? 'text-yellow-400' : c.text}`}>
          {odds.toFixed(2)}x
        </p>
        <p className="text-xs text-gray-500">cote</p>
      </div>

      {selected && (
        <div className="absolute top-2 right-2">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
        </div>
      )}
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function VirtualHorsesPage() {
  const supabase = createClient();

  // ── State ──────────────────────────────────────────────────────────────────
  const [upcomingEvent, setUpcomingEvent]   = useState<VirtualEvent | null>(null);
  const [history, setHistory]               = useState<RaceHistoryRow[]>([]);
  const [loadingInit, setLoadingInit]       = useState(true);
  const [isDemoMode, setIsDemoMode]         = useState(false);

  // Countdown
  const [countdown, setCountdown]           = useState(RACE_DURATION_SECONDS);
  const countdownRef                        = useRef<ReturnType<typeof setInterval> | null>(null);

  // Betting
  const [selectedHorse, setSelectedHorse]   = useState<number | null>(null);
  const [stake, setStake]                   = useState('');
  const [placing, setPlacing]               = useState(false);
  const [walletBalance, setWalletBalance]   = useState(0);

  // Winner reveal
  const [lastWinner, setLastWinner]         = useState<{ horse: number; name: string; odds: number } | null>(null);
  const [showWinner, setShowWinner]         = useState(false);

  // Race odds (may vary per event)
  const [raceOdds, setRaceOdds]             = useState<Record<number, number>>({ ...BASE_ODDS });

  // ── Load wallet balance ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      setWalletBalance(data?.balance ?? 0);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load upcoming event + recent history ─────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingInit(true);

      // Sync virtual events (generate upcoming + settle overdue)
      try {
        await fetch('/api/virtual/sync');
      } catch {
        // Non-fatal — continue with whatever is in DB already
      }

      // Upcoming
      const { data: upcoming } = await supabase
        .from('virtual_events')
        .select('*')
        .eq('game_type', 'horses')
        .eq('status', 'upcoming')
        .order('scheduled_at')
        .limit(1);

      if (upcoming && upcoming.length > 0) {
        const ev = upcoming[0] as VirtualEvent;
        setUpcomingEvent(ev);
        setIsDemoMode(false);

        // Build odds for this event
        const eventOdds = ev.odds
          ? Object.fromEntries(
              Object.entries(ev.odds).map(([k, v]) => [parseInt(k), v as number])
            )
          : computeOdds(ev.id);
        setRaceOdds(eventOdds as Record<number, number>);

        // Calculate seconds until scheduled_at
        const secsLeft = Math.max(
          0,
          Math.floor((new Date(ev.scheduled_at).getTime() - Date.now()) / 1000)
        );
        setCountdown(secsLeft);
      } else {
        // Demo mode — no DB events yet
        setIsDemoMode(true);
        setRaceOdds({ ...BASE_ODDS });
        setCountdown(RACE_DURATION_SECONDS);
      }

      // Recent history
      await loadHistory();

      setLoadingInit(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadHistory() {
    const { data } = await supabase
      .from('virtual_events')
      .select('*')
      .eq('game_type', 'horses')
      .eq('status', 'settled')
      .order('settled_at', { ascending: false })
      .limit(10);
    setHistory((data ?? []) as RaceHistoryRow[]);
  }

  // ── Countdown ticker ─────────────────────────────────────────────────────
  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // In demo mode, loop the countdown
          if (isDemoMode) return RACE_DURATION_SECONDS;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isDemoMode]);

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('horses-virtual-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'virtual_events',
          filter: 'game_type=eq.horses',
        },
        async (payload) => {
          const row = payload.new as VirtualEvent;

          if (row.status === 'settled' && row.winner_horse) {
            // Show winner banner
            const horseNum  = row.winner_horse;
            const horseName = row.horse_names?.[String(horseNum)] ?? HORSE_NAMES[horseNum] ?? `Chwal #${horseNum}`;
            const horseOdds = row.odds?.[String(horseNum)] ?? raceOdds[horseNum] ?? BASE_ODDS[horseNum];

            setLastWinner({ horse: horseNum, name: horseName, odds: horseOdds });
            setShowWinner(true);
            setTimeout(() => setShowWinner(false), 12000);

            // Reload history
            await loadHistory();

            // Reset selection & stake
            setSelectedHorse(null);
            setStake('');
          }

          if (row.status === 'upcoming') {
            setUpcomingEvent(row);
            setIsDemoMode(false);
            const secsLeft = Math.max(
              0,
              Math.floor((new Date(row.scheduled_at).getTime() - Date.now()) / 1000)
            );
            setCountdown(secsLeft);

            const eventOdds = row.odds
              ? Object.fromEntries(
                  Object.entries(row.odds).map(([k, v]) => [parseInt(k), v as number])
                )
              : computeOdds(row.id);
            setRaceOdds(eventOdds as Record<number, number>);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceOdds]);

  // ── Betting logic ─────────────────────────────────────────────────────────
  async function handlePlaceBet() {
    if (isDemoMode) {
      toast.error('Mod Demo — Pa kapab fè paryaj reyèl. Tann yon ras reyèl.');
      return;
    }
    if (!selectedHorse) {
      toast.error('Chwazi yon chwal anvan ou paryaje');
      return;
    }
    const stakeNum = parseFloat(stake);
    if (!stakeNum || stakeNum <= 0) {
      toast.error('Antre montan ou vle paryaje');
      return;
    }
    if (stakeNum > walletBalance) {
      toast.error('Balans ou pa ase pou fè paryaj sa a');
      return;
    }
    if (!upcomingEvent) {
      toast.error('Pa gen ras k ap vini bientot');
      return;
    }
    if (countdown <= 10) {
      toast.error('Twò ta! Paryaj fèmen 10 segonn anvan ras la');
      return;
    }

    setPlacing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Ou pa konekte'); return; }

      const horseOdds = raceOdds[selectedHorse] ?? BASE_ODDS[selectedHorse];

      const { error } = await supabase.rpc('place_virtual_bet', {
        p_user_id: user.id,
        p_event_id: upcomingEvent.id,
        p_pick: String(selectedHorse),
        p_odds: horseOdds,
        p_stake: stakeNum,
      });

      if (error) {
        toast.error(error.message || 'Erè pandan paryaj la');
        return;
      }

      const potential = stakeNum * horseOdds;
      toast.success(
        `Paryaj ${formatCurrency(stakeNum)} sou Chwal #${selectedHorse} — ${HORSE_NAMES[selectedHorse]}! Posib genyen ${formatCurrency(potential)}`
      );

      // Refresh wallet
      const { data: wd } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      setWalletBalance(wd?.balance ?? walletBalance - stakeNum);

      setStake('');
    } finally {
      setPlacing(false);
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const stakeNum     = parseFloat(stake) || 0;
  const selectedOdds = selectedHorse ? (raceOdds[selectedHorse] ?? BASE_ODDS[selectedHorse]) : null;
  const potentialWin = selectedOdds && stakeNum > 0 ? stakeNum * selectedOdds : null;
  const bettingClosed = !isDemoMode && countdown <= 10;

  // ── Render ────────────────────────────────────────────────────────────────

  if (loadingInit) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-8 bg-bg-muted rounded-lg w-56 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-10">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Zap size={24} className="text-brand-gold" />
          Kous Chwal Vityèl
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-gray-500">Balans:</span>
          <span className="font-bold text-white">{formatCurrency(walletBalance)}</span>
        </div>
      </div>

      {/* ── Demo Mode Banner ─────────────────────────────────────────────── */}
      {isDemoMode && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-start gap-3">
          <Star size={18} className="text-yellow-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-yellow-300 font-semibold text-sm">Mod Demo Aktif</p>
            <p className="text-yellow-200/70 text-xs mt-0.5">
              Pa gen ras reyèl pou kounye a. Ou ka wè kijan paj la travay — paryaj reyèl ap disponib lè cron yo aktive.
            </p>
          </div>
        </div>
      )}

      {/* ── Winner Announcement Banner ───────────────────────────────────── */}
      {showWinner && lastWinner && (
        <div className="p-5 bg-gradient-to-r from-yellow-500/20 to-yellow-400/10 border-2 border-yellow-400/60 rounded-2xl flex items-center gap-4 animate-fade-in">
          <Trophy size={36} className="text-yellow-400 shrink-0" />
          <div>
            <p className="text-xs text-yellow-300/70 font-medium uppercase tracking-wider mb-0.5">
              Ganyan Ras la
            </p>
            <div className="flex items-center gap-3">
              <HorseCircle number={lastWinner.horse} size="lg" />
              <div>
                <p className="text-xl font-black text-yellow-400">{lastWinner.name}</p>
                <p className="text-sm text-yellow-200/70">
                  Chwal #{lastWinner.horse} — Cote: {lastWinner.odds.toFixed(2)}x
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Countdown ────────────────────────────────────────────────────── */}
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${bettingClosed ? 'bg-red-500/20' : 'bg-brand-gold/10'}`}>
            <Clock size={20} className={bettingClosed ? 'text-red-400' : 'text-brand-gold'} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">
              {bettingClosed ? 'Paryaj Fèmen' : 'Ras k ap vini'}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {isDemoMode ? 'Demo — 3 minit loop' : upcomingEvent ? `Ras #${upcomingEvent.race_number ?? '—'}` : 'Ap tann...'}
            </p>
          </div>
        </div>

        <div className={`text-4xl font-black tabular-nums tracking-tight ${
          countdown <= 30
            ? 'text-red-400'
            : countdown <= 60
              ? 'text-yellow-400'
              : 'text-brand-gold'
        }`}>
          {secondsToMMSS(countdown)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Horse Grid + Bet Form ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Horse Grid */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Pran cheval ou — Chwazi 1 nan 8 chwal yo
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                <HorseCard
                  key={num}
                  number={num}
                  name={
                    upcomingEvent?.horse_names?.[String(num)]
                      ?? HORSE_NAMES[num]
                  }
                  odds={raceOdds[num] ?? BASE_ODDS[num]}
                  selected={selectedHorse === num}
                  onSelect={() => {
                    if (bettingClosed) return;
                    setSelectedHorse(prev => (prev === num ? null : num));
                  }}
                  disabled={bettingClosed}
                />
              ))}
            </div>
          </div>

          {/* Bet Form */}
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <Star size={16} className="text-brand-gold" />
              Fè Paryaj Ou
            </h3>

            {/* Selection recap */}
            {selectedHorse ? (
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                HORSE_COLORS[selectedHorse].border
              } bg-bg-muted`}>
                <HorseCircle number={selectedHorse} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    {upcomingEvent?.horse_names?.[String(selectedHorse)] ?? HORSE_NAMES[selectedHorse]}
                  </p>
                  <p className="text-xs text-gray-400">Chwal #{selectedHorse} sèlekte</p>
                </div>
                <p className={`text-xl font-black ${HORSE_COLORS[selectedHorse].text}`}>
                  {(raceOdds[selectedHorse] ?? BASE_ODDS[selectedHorse]).toFixed(2)}x
                </p>
              </div>
            ) : (
              <div className="p-3 bg-bg-muted rounded-xl text-center">
                <p className="text-sm text-gray-500">Klike sou yon chwal pou sèlekte li</p>
              </div>
            )}

            {/* Stake input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">
                Montan Paryaj (HTG)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="Ekri montan..."
                value={stake}
                onChange={e => setStake(e.target.value)}
                disabled={bettingClosed || isDemoMode}
                className="input-field text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {[100, 500, 1000, 2500, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setStake(String(amt))}
                    disabled={bettingClosed || isDemoMode}
                    className="px-3 py-1 text-xs bg-bg-muted border border-bg-border rounded-lg text-gray-300
                               hover:border-brand-gold/50 hover:text-brand-gold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Potential win */}
            {potentialWin !== null && (
              <div className="flex items-center justify-between p-3 bg-success/10 border border-success/30 rounded-xl">
                <span className="text-sm text-gray-400">Posib Genyen</span>
                <span className="text-lg font-black text-success">
                  {formatCurrency(potentialWin)}
                </span>
              </div>
            )}

            {/* Paryaje button */}
            <button
              onClick={handlePlaceBet}
              disabled={placing || !selectedHorse || stakeNum <= 0 || bettingClosed || isDemoMode}
              className="
                w-full py-3.5 rounded-xl font-black text-base transition-all duration-200
                bg-brand-gold text-bg-base
                hover:bg-yellow-400 hover:scale-[1.01] active:scale-[0.99]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
              "
            >
              {placing
                ? 'Ap fè paryaj...'
                : bettingClosed
                  ? 'Paryaj Fèmen — Ras k ap kòmanse'
                  : isDemoMode
                    ? 'Demo — Paryaj pa disponib'
                    : 'Paryaje'}
            </button>

            {bettingClosed && !isDemoMode && (
              <p className="text-center text-xs text-red-400">
                Paryaj fèmen — ras la pral kòmanse nan kèk segond.
              </p>
            )}
          </div>
        </div>

        {/* ── Right: Race History ──────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-sm">
              <Trophy size={16} className="text-brand-gold" />
              10 Dènye Ras Yo
            </h3>

            {history.length === 0 ? (
              <div className="text-center py-8">
                <Trophy size={28} className="text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Pa gen istwa ras pou kounye a</p>
                <p className="text-xs text-gray-600 mt-1">Rezilta ap parèt apre premye ras la</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((row, idx) => {
                  const horseNum  = row.winner_horse;
                  const horseName = row.horse_names?.[String(horseNum)] ?? HORSE_NAMES[horseNum] ?? `Chwal #${horseNum}`;
                  const winOdds   = row.odds?.[String(horseNum)] ?? BASE_ODDS[horseNum] ?? 0;
                  const c         = HORSE_COLORS[horseNum] ?? HORSE_COLORS[1];
                  const isLatest  = idx === 0;

                  return (
                    <div
                      key={row.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isLatest
                          ? 'border-yellow-400/40 bg-yellow-400/5'
                          : 'border-bg-border bg-bg-muted'
                      }`}
                    >
                      {/* Rank badge */}
                      <div className="w-5 text-center shrink-0">
                        <span className="text-xs text-gray-600 font-medium">
                          {isLatest ? '★' : `${idx + 1}`}
                        </span>
                      </div>

                      {/* Horse circle */}
                      <div className={`w-7 h-7 ${c.bg} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {horseNum}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isLatest ? 'text-yellow-300' : 'text-white'}`}>
                          {horseName}
                        </p>
                        {row.race_number && (
                          <p className="text-xs text-gray-500">Ras #{row.race_number}</p>
                        )}
                      </div>

                      {/* Odds */}
                      <span className={`text-sm font-bold shrink-0 ${c.text}`}>
                        {winOdds.toFixed(2)}x
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* How-to card */}
          <div className="card p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Kijan pou jwe
            </p>
            <ol className="space-y-1.5 text-xs text-gray-500 list-decimal list-inside">
              <li>Chwazi yon chwal (1–8)</li>
              <li>Antre montan ou vle paryaje</li>
              <li>Klike <span className="text-brand-gold font-semibold">Paryaje</span></li>
              <li>Tann rezilta ras la (chak 3 minit)</li>
              <li>Si chwal ou a genyen, ou touche montan × cote!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
