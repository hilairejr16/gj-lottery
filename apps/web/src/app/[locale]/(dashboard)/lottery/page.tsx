'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import {
  Clock,
  Ticket,
  Trophy,
  Zap,
  ChevronRight,
  RefreshCw,
  CircleDot,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BoletDraw {
  id: string;
  draw_name: string;
  draw_time: string;
  status: 'upcoming' | 'open' | 'closed' | 'drawn';
  winning_2: string | null;
  winning_3: string | null;
  winning_4: string | null;
  drawn_at: string | null;
}

interface BoletTicket {
  id: string;
  draw_id: string;
  bet_type: '2chif' | '3chif' | '4chif';
  number: string;
  stake: number;
  potential_win: number;
  multiplier: number;
  status: 'pending' | 'won' | 'lost';
  created_at: string;
  bolet_draws?: { draw_name: string } | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MULTIPLIERS: Record<string, number> = {
  '2chif': 60,
  '3chif': 500,
  '4chif': 4000,
};

const BET_TABS = [
  { key: '2chif' as const, label: '2 Chif', sub: '60×', digits: 2 },
  { key: '3chif' as const, label: '3 Chif', sub: '500×', digits: 3 },
  { key: '4chif' as const, label: '4 Chif', sub: '4000×', digits: 4 },
];

const DRAW_ICONS: Record<string, string> = {
  'Tiraj Maten': '🌅',
  'Tiraj Midi':  '☀️',
  'Tiraj Swa':   '🌙',
};

// ── Countdown hook ────────────────────────────────────────────────────────────

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false });
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function tick() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, expired: true });
        if (ref.current) clearInterval(ref.current);
        return;
      }
      const t = Math.floor(diff / 1000);
      setTimeLeft({ h: Math.floor(t / 3600), m: Math.floor((t % 3600) / 60), s: t % 60, expired: false });
    }
    tick();
    ref.current = setInterval(tick, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [targetDate]);

  return timeLeft;
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  upcoming: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  open:     'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  closed:   'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  drawn:    'bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30',
  pending:  'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  won:      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  lost:     'bg-red-500/20 text-red-300 border border-red-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Byento',
  open:     'Ouvè',
  closed:   'Fèmen',
  drawn:    'Tiraj Fini',
  pending:  'An Atant',
  won:      'Ou Genyen!',
  lost:     'Pèdi',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ── Countdown display ─────────────────────────────────────────────────────────

function Countdown({ drawTime }: { drawTime: string }) {
  const { h, m, s, expired } = useCountdown(drawTime);
  const pad = (n: number) => String(n).padStart(2, '0');

  if (expired) {
    return <span className="text-amber-400 font-bold text-sm animate-pulse">Tiraj ap kòmanse...</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <Clock size={14} className="text-gray-500 shrink-0" />
      <span className="font-mono font-bold text-white tabular-nums">
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </div>
  );
}

// ── Number circle ─────────────────────────────────────────────────────────────

function NumberCircle({ value, color = 'gold' }: { value: string; color?: 'gold' | 'red' | 'blue' }) {
  const styles = {
    gold: 'bg-[#F5A623]/20 border-[#F5A623]/50 text-[#F5A623]',
    red:  'bg-red-500/20 border-red-500/50 text-red-300',
    blue: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  };
  return (
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full border-2 font-black text-lg tabular-nums ${styles[color]}`}>
      {value}
    </div>
  );
}

// ── Draw Card with Bet Form ───────────────────────────────────────────────────

function DrawBetCard({
  draw,
  walletBalance,
  onBought,
}: {
  draw: BoletDraw;
  walletBalance: number;
  onBought: () => void;
}) {
  const supabase = createClient();

  const [activeType, setActiveType] = useState<'2chif' | '3chif' | '4chif'>('2chif');
  const [selectedNum, setSelectedNum] = useState('');
  const [stake, setStake]            = useState('');
  const [buying, setBuying]          = useState(false);

  const digits      = activeType === '2chif' ? 2 : activeType === '3chif' ? 3 : 4;
  const multiplier  = MULTIPLIERS[activeType];
  const stakeNum    = parseFloat(stake) || 0;
  const potentialWin = stakeNum * multiplier;
  const isOpen      = draw.status === 'open';

  function switchTab(type: '2chif' | '3chif' | '4chif') {
    setActiveType(type);
    setSelectedNum('');
  }

  function handleManualInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, digits);
    setSelectedNum(val);
  }

  async function handleBuy() {
    if (!isOpen)                           { toast.error('Tiraj sa a pa ouvè pou kounye a'); return; }
    if (selectedNum.length !== digits)     { toast.error(`Nimewo ou dwe gen egzakteman ${digits} chif`); return; }
    if (!stakeNum || stakeNum <= 0)        { toast.error('Antre montan paryaj ou'); return; }
    if (stakeNum > walletBalance)          { toast.error('Balans ou pa ase'); return; }

    setBuying(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Ou pa konekte'); setBuying(false); return; }

    const { error } = await supabase.rpc('buy_bolet_ticket', {
      p_user_id:  user.id,
      p_draw_id:  draw.id,
      p_bet_type: activeType,
      p_number:   selectedNum,
      p_stake:    stakeNum,
    });

    setBuying(false);
    if (error) { toast.error(error.message); return; }

    toast.success(`Tikè achte! ${selectedNum} (${activeType.toUpperCase()}) — ${formatCurrency(potentialWin)} si ou genyen!`);
    setSelectedNum('');
    setStake('');
    onBought();
  }

  const icon = DRAW_ICONS[draw.draw_name] ?? '🎰';

  return (
    <div className="card p-0 overflow-hidden">
      {/* Draw header */}
      <div className={`px-5 py-4 flex items-center justify-between border-b border-white/5 ${
        draw.status === 'open'
          ? 'bg-gradient-to-r from-emerald-900/40 to-[#0D1520]'
          : 'bg-[#0D1520]'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-black text-white text-base leading-tight">{draw.draw_name}</h3>
            <p className="text-gray-500 text-xs">
              {new Date(draw.draw_time).toLocaleString('fr-HT', {
                weekday: 'short', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={draw.status} />
          {(draw.status === 'open' || draw.status === 'upcoming') && (
            <Countdown drawTime={draw.draw_time} />
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Bet type tabs */}
        <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl">
          {BET_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeType === tab.key
                  ? 'bg-[#F5A623] text-[#0D1520] shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="block">{tab.label}</span>
              <span className={`block text-[10px] ${activeType === tab.key ? 'text-[#0D1520]/70' : 'text-gray-600'}`}>
                {tab.sub}
              </span>
            </button>
          ))}
        </div>

        {/* 2chif: full 00-99 grid */}
        {activeType === '2chif' ? (
          <div>
            <p className="text-xs text-gray-500 mb-2 text-center">Chwazi nimewo ou (00–99)</p>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 100 }, (_, i) => {
                const num = String(i).padStart(2, '0');
                const isSelected = selectedNum === num;
                return (
                  <button
                    key={num}
                    disabled={!isOpen}
                    onClick={() => setSelectedNum(isSelected ? '' : num)}
                    className={`h-7 rounded text-[11px] font-bold transition-all duration-150 ${
                      isSelected
                        ? 'bg-[#F5A623] text-[#0D1520] shadow-sm scale-105'
                        : isOpen
                          ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                          : 'bg-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            {selectedNum && (
              <p className="text-center mt-2 text-xs text-gray-400">
                Chwazi: <span className="text-[#F5A623] font-black text-base ml-1">{selectedNum}</span>
              </p>
            )}
          </div>
        ) : (
          /* 3chif / 4chif: text input */
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Antre nimewo ou ({digits} chif)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={digits}
              value={selectedNum}
              onChange={handleManualInput}
              disabled={!isOpen}
              placeholder={'0'.repeat(digits)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-3xl font-black tracking-[0.5em] text-white focus:outline-none focus:border-[#F5A623]/50 disabled:opacity-50 transition-colors"
            />
            <p className="text-center text-xs text-gray-600 mt-1">{selectedNum.length}/{digits} chif</p>
          </div>
        )}

        {/* Stake input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-500">Montan Paryaj (HTG)</label>
            <span className="text-xs text-gray-600">
              Balans: <span className="text-white font-semibold">{formatCurrency(walletBalance)}</span>
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="100"
              value={stake}
              onChange={e => setStake(e.target.value)}
              disabled={!isOpen}
              placeholder="500"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-[#F5A623]/50 disabled:opacity-50 transition-colors"
            />
            {/* Quick-stake chips */}
            {[100, 500, 1000].map(amt => (
              <button
                key={amt}
                disabled={!isOpen}
                onClick={() => setStake(String(amt))}
                className="px-2.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:border-[#F5A623]/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* Potential win preview */}
        {stakeNum > 0 && selectedNum.length === digits && (
          <div className="flex items-center justify-between p-3.5 bg-emerald-900/20 border border-emerald-500/20 rounded-xl">
            <div>
              <p className="text-xs text-gray-400">
                Nimewo <span className="text-white font-bold">{selectedNum}</span> — {activeType.toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatCurrency(stakeNum)} × {multiplier}
              </p>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-black text-xl">{formatCurrency(potentialWin)}</p>
              <p className="text-xs text-gray-600">Posib Genyen</p>
            </div>
          </div>
        )}

        {/* Closed notice */}
        {!isOpen && (
          <div className="p-3 bg-amber-900/20 border border-amber-500/20 rounded-xl">
            <p className="text-xs text-amber-400 text-center">
              {draw.status === 'drawn' || draw.status === 'closed'
                ? 'Tiraj sa a fèmen. Ou pa ka achte tikè ankò.'
                : 'Tiraj poko ouvè. Ret tann.'}
            </p>
          </div>
        )}

        {/* Buy button */}
        <button
          onClick={handleBuy}
          disabled={!isOpen || buying || selectedNum.length !== digits || !stakeNum}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm bg-[#F5A623] text-[#0D1520] hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <Ticket size={17} />
          {buying ? 'Ap achte tikè...' : 'Achte Tikè'}
        </button>
      </div>
    </div>
  );
}

// ── Completed draw results ────────────────────────────────────────────────────

function CompletedDrawsSection({ draws }: { draws: BoletDraw[] }) {
  if (draws.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-[#F5A623]" />
        <h2 className="font-black text-white">Rezilta Dènyè Tiraj</h2>
      </div>

      <div className="space-y-3">
        {draws.map(draw => (
          <div key={draw.id} className="p-4 bg-white/3 border border-white/5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{DRAW_ICONS[draw.draw_name] ?? '🎰'}</span>
                <span className="font-bold text-white text-sm">{draw.draw_name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {draw.drawn_at
                  ? new Date(draw.drawn_at).toLocaleDateString('fr-HT', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {draw.winning_2 && (
                <div className="text-center">
                  <p className="text-[10px] text-gray-600 mb-1">2 Chif</p>
                  <NumberCircle value={draw.winning_2} color="gold" />
                </div>
              )}
              {draw.winning_3 && (
                <div className="text-center">
                  <p className="text-[10px] text-gray-600 mb-1">3 Chif</p>
                  <NumberCircle value={draw.winning_3} color="blue" />
                </div>
              )}
              {draw.winning_4 && (
                <div className="text-center">
                  <p className="text-[10px] text-gray-600 mb-1">4 Chif</p>
                  <NumberCircle value={draw.winning_4} color="red" />
                </div>
              )}
              {!draw.winning_2 && !draw.winning_3 && !draw.winning_4 && (
                <p className="text-xs text-gray-600 italic">Rezilta poko disponib</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recent tickets ────────────────────────────────────────────────────────────

function RecentTickets({ tickets }: { tickets: BoletTicket[] }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Ticket size={18} className="text-[#F5A623]" />
        <h2 className="font-black text-white">Dènye Tikè Mwen</h2>
        {tickets.length > 0 && (
          <span className="ml-auto bg-[#F5A623]/20 text-[#F5A623] text-xs font-bold px-2 py-0.5 rounded-full border border-[#F5A623]/30">
            {tickets.length}
          </span>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-8">
          <Ticket size={32} className="text-gray-700 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Ou poko achte tikè</p>
          <p className="text-gray-600 text-xs mt-1">Chwazi yon nimewo anlè pou kòmanse!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(ticket => {
            const mult = ticket.multiplier || MULTIPLIERS[ticket.bet_type] || 1;
            const win  = ticket.potential_win || ticket.stake * mult;
            return (
              <div
                key={ticket.id}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                  ticket.status === 'won'
                    ? 'bg-emerald-900/20 border-emerald-500/25'
                    : ticket.status === 'lost'
                      ? 'bg-red-900/20 border-red-500/25'
                      : 'bg-white/3 border-white/6'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Number badge */}
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#0D1520] border border-white/10 shrink-0">
                    <span className="text-[#F5A623] font-black text-base tabular-nums leading-none">{ticket.number}</span>
                    <span className="text-gray-600 text-[9px] mt-0.5">{ticket.bet_type}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-bold text-sm">{ticket.bet_type.toUpperCase()}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {ticket.bolet_draws?.draw_name ?? 'Tiraj'}
                      {' · '}
                      {new Date(ticket.created_at).toLocaleTimeString('fr-HT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-600">Mise: <span className="text-gray-300 font-semibold">{formatCurrency(ticket.stake)}</span></p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`font-black text-base ${ticket.status === 'won' ? 'text-emerald-400' : 'text-[#F5A623]'}`}>
                    {formatCurrency(win)}
                  </p>
                  <p className="text-[10px] text-gray-600">{mult}× mise</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-white/5 rounded-xl w-56" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[0, 1, 2].map(i => (
          <div key={i} className="card p-5 space-y-4">
            <div className="h-6 bg-white/5 rounded w-2/3" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 50 }, (_, j) => (
                <div key={j} className="h-7 bg-white/5 rounded" />
              ))}
            </div>
            <div className="h-10 bg-white/5 rounded-xl" />
            <div className="h-11 bg-white/5 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LotteryPage() {
  const supabase = createClient();

  const [activeDraws,    setActiveDraws]    = useState<BoletDraw[]>([]);
  const [completedDraws, setCompletedDraws] = useState<BoletDraw[]>([]);
  const [myTickets,      setMyTickets]      = useState<BoletTicket[]>([]);
  const [walletBalance,  setWalletBalance]  = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);

  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);

    const { data: { user } } = await supabase.auth.getUser();

    const [activeRes, completedRes, walletRes] = await Promise.all([
      supabase
        .from('bolet_draws')
        .select('*')
        .in('status', ['upcoming', 'open'])
        .order('draw_time', { ascending: true })
        .limit(3),
      supabase
        .from('bolet_draws')
        .select('*')
        .eq('status', 'drawn')
        .order('drawn_at', { ascending: false })
        .limit(5),
      user
        ? supabase.from('wallets').select('balance').eq('user_id', user.id).single()
        : Promise.resolve({ data: null }),
    ]);

    setActiveDraws(activeRes.data ?? []);
    setCompletedDraws(completedRes.data ?? []);
    setWalletBalance(walletRes.data?.balance ?? 0);

    if (user) {
      const { data: tickets } = await supabase
        .from('bolet_tickets')
        .select('*, bolet_draws(draw_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setMyTickets(tickets ?? []);
    }

    setLoading(false);
    setRefreshing(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <Skeleton />;

  const openDrawCount = activeDraws.filter(d => d.status === 'open').length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <CircleDot size={26} className="text-[#F5A623]" />
            Bolet Ayisyen
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Chwazi nimewo ou, achte tikè, genyen gwo!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {walletBalance > 0 && (
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-[10px] text-gray-600 uppercase tracking-wide">Balans</p>
              <p className="text-white font-bold text-sm">{formatCurrency(walletBalance)}</p>
            </div>
          )}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white hover:border-[#F5A623]/30 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Aktyalize
          </button>
        </div>
      </div>

      {/* Mobile balance */}
      {walletBalance > 0 && (
        <div className="sm:hidden flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/8 rounded-xl">
          <span className="text-xs text-gray-500">Balans ou:</span>
          <span className="text-white font-bold text-sm">{formatCurrency(walletBalance)}</span>
        </div>
      )}

      {/* ── Active draws open banner ── */}
      {openDrawCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-900/30 border border-emerald-500/25 rounded-xl">
          <Zap size={15} className="text-emerald-400 shrink-0" />
          <p className="text-emerald-300 text-sm font-semibold">
            {openDrawCount === 1 ? 'Gen 1 tiraj ouvè' : `Gen ${openDrawCount} tiraj ouvè`} — achte tikè ou kounye a!
          </p>
        </div>
      )}

      {/* ── No active draws ── */}
      {activeDraws.length === 0 && (
        <div className="card p-8 text-center">
          <Clock size={40} className="text-gray-700 mx-auto mb-3" />
          <h3 className="text-white font-bold mb-1">Pa gen tiraj aktif</h3>
          <p className="text-gray-500 text-sm">Tiraj pwochen ap disponib byento. Tounen pita!</p>
        </div>
      )}

      {/* ── Active draw cards ── */}
      {activeDraws.length > 0 && (
        <div className={`grid gap-5 ${
          activeDraws.length === 1
            ? 'grid-cols-1 max-w-xl'
            : activeDraws.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        }`}>
          {activeDraws.map(draw => (
            <DrawBetCard
              key={draw.id}
              draw={draw}
              walletBalance={walletBalance}
              onBought={() => loadData(true)}
            />
          ))}
        </div>
      )}

      {/* ── Payout reference ── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ChevronRight size={16} className="text-[#F5A623]" />
          <h2 className="font-bold text-white text-sm">Tablo Pèman / Payouts</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {BET_TABS.map(tab => (
            <div key={tab.key} className="text-center p-3 bg-white/3 border border-white/5 rounded-xl">
              <p className="text-gray-500 text-xs mb-1">{tab.label}</p>
              <p className="text-[#F5A623] font-black text-xl">{tab.sub}</p>
              <p className="text-gray-600 text-[10px] mt-0.5">{tab.digits} chif</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <CompletedDrawsSection draws={completedDraws} />
        <RecentTickets tickets={myTickets} />
      </div>
    </div>
  );
}
