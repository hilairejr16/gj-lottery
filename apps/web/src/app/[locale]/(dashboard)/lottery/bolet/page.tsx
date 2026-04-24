'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Ticket, Clock, Trophy, Star, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────

interface BoletDraw {
  id: string;
  name: string;               // 'Tiraj Maten' | 'Tiraj Midi' | 'Tiraj Swa'
  draw_time: string;
  status: 'upcoming' | 'open' | 'closed' | 'drawn';
  result_2chif: string | null;
  result_3chif: string | null;
  result_4chif: string | null;
  drawn_at: string | null;
}

interface BoletTicket {
  id: string;
  draw_id: string;
  user_id: string;
  bet_type: '2chif' | '3chif' | '4chif';
  number: string;
  stake: number;
  potential_win: number;
  status: 'pending' | 'won' | 'lost';
  created_at: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MULTIPLIERS: Record<string, number> = {
  '2chif': 60,
  '3chif': 500,
  '4chif': 4000,
};

const BET_TYPES = [
  { key: '2chif', label: '2 Chif', digits: 2, multiplier: 60 },
  { key: '3chif', label: '3 Chif', digits: 3, multiplier: 500 },
  { key: '4chif', label: '4 Chif', digits: 4, multiplier: 4000 },
] as const;

// ── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: false });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    function tick() {
      const diff = new Date(targetDate!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, expired: true });
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      setTimeLeft({
        h: Math.floor(totalSeconds / 3600),
        m: Math.floor((totalSeconds % 3600) / 60),
        s: totalSeconds % 60,
        expired: false,
      });
    }

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [targetDate]);

  return timeLeft;
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BoletDraw['status'] | BoletTicket['status'] }) {
  const map: Record<string, string> = {
    upcoming:  'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    open:      'bg-success/20 text-success border border-success/30',
    closed:    'bg-warning/20 text-warning border border-warning/30',
    drawn:     'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    pending:   'bg-warning/20 text-warning border border-warning/30',
    won:       'bg-success/20 text-success border border-success/30',
    lost:      'bg-danger/20 text-danger border border-danger/30',
  };

  const label: Record<string, string> = {
    upcoming: 'Byento',
    open:     'Ouvè',
    closed:   'Fèmen',
    drawn:    'Tiraj Fini',
    pending:  'An Atant',
    won:      'Ou Genyen!',
    lost:     'Pèdi',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? map.pending}`}>
      {label[status] ?? status}
    </span>
  );
}

// ── Countdown display ────────────────────────────────────────────────────────

function CountdownDisplay({ drawTime }: { drawTime: string }) {
  const { h, m, s, expired } = useCountdown(drawTime);

  if (expired) {
    return <span className="text-warning font-semibold text-sm">Tiraj ap kòmanse...</span>;
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      {[
        { val: pad(h), unit: 'èdtan' },
        { val: pad(m), unit: 'minit' },
        { val: pad(s), unit: 'segonn' },
      ].map(({ val, unit }, i) => (
        <div key={unit} className="flex items-center gap-2">
          {i > 0 && <span className="text-gray-500 font-bold">:</span>}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-white tabular-nums">{val}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">{unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Next Draw Card ───────────────────────────────────────────────────────────

function NextDrawCard({ draw }: { draw: BoletDraw | null }) {
  const drawTime = draw?.draw_time ?? null;

  return (
    <div className="card p-6 bg-gradient-to-br from-brand-blue/30 to-bg-card border-brand-blue/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-brand-gold" />
          <h2 className="font-black text-white text-lg">Pwochen Tiraj</h2>
        </div>
        {draw ? <StatusBadge status={draw.status} /> : null}
      </div>

      {draw ? (
        <>
          <p className="text-brand-gold font-bold text-xl mb-1">{draw.name}</p>
          <p className="text-gray-400 text-sm mb-4">
            {new Date(draw.draw_time).toLocaleString('fr-HT', {
              weekday: 'long',
              month:   'short',
              day:     'numeric',
              hour:    '2-digit',
              minute:  '2-digit',
            })}
          </p>

          {draw.status === 'open' || draw.status === 'upcoming' ? (
            <CountdownDisplay drawTime={draw.draw_time} />
          ) : (
            <p className="text-warning text-sm font-semibold">Tiraj sa a fèmen. Ret pou pwochen an.</p>
          )}
        </>
      ) : (
        <div className="py-4">
          <p className="text-gray-400 text-sm italic">Tiraj pwochen ap disponib byento</p>
        </div>
      )}

      {/* Multiplier reference */}
      <div className="mt-5 pt-5 border-t border-bg-border grid grid-cols-3 gap-3">
        {BET_TYPES.map(bt => (
          <div key={bt.key} className="text-center bg-bg-muted rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">{bt.label}</p>
            <p className="text-brand-gold font-black text-lg">{bt.multiplier}×</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bet Form ─────────────────────────────────────────────────────────────────

function BetForm({
  draw,
  walletBalance,
  onTicketPurchased,
}: {
  draw: BoletDraw | null;
  walletBalance: number;
  onTicketPurchased: () => void;
}) {
  const supabase = createClient();
  const [activeType, setActiveType] = useState<'2chif' | '3chif' | '4chif'>('2chif');
  const [number, setNumber]         = useState('');
  const [stake, setStake]           = useState('');
  const [buying, setBuying]         = useState(false);

  const maxDigits   = activeType === '2chif' ? 2 : activeType === '3chif' ? 3 : 4;
  const multiplier  = MULTIPLIERS[activeType];
  const stakeNum    = parseFloat(stake) || 0;
  const potentialWin = stakeNum * multiplier;

  const isDrawOpen = draw?.status === 'open';
  const disabled   = !draw || !isDrawOpen || buying;

  // Reset number when tab changes
  function switchTab(type: '2chif' | '3chif' | '4chif') {
    setActiveType(type);
    setNumber('');
  }

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, maxDigits);
    setNumber(val);
  }

  async function handleBuy() {
    if (!draw) { toast.error('Pa gen tiraj disponib'); return; }
    if (!isDrawOpen) { toast.error('Tiraj sa a fèmen pou kounye a'); return; }
    if (number.length !== maxDigits) {
      toast.error(`Nimewo ou dwe gen egzakteman ${maxDigits} chif`);
      return;
    }
    if (!stakeNum || stakeNum <= 0) { toast.error('Antre montan paryaj ou'); return; }
    if (stakeNum > walletBalance)   { toast.error('Balans ou pa ase'); return; }

    setBuying(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Ou pa konekte'); setBuying(false); return; }

    const { error } = await supabase.rpc('buy_bolet_ticket', {
      p_user_id:  user.id,
      p_draw_id:  draw.id,
      p_bet_type: activeType,
      p_number:   number,
      p_stake:    stakeNum,
    });

    setBuying(false);
    if (error) { toast.error(error.message); return; }

    toast.success(
      `Tikè achte! ${number} (${activeType}) — ${formatCurrency(stakeNum)} → ${formatCurrency(potentialWin)} si ou genyen!`
    );
    setNumber('');
    setStake('');
    onTicketPurchased();
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Hash size={20} className="text-brand-gold" />
        <h2 className="font-black text-white text-lg">Achte Tikè Bolet</h2>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1 bg-bg-muted rounded-xl mb-5">
        {BET_TYPES.map(bt => (
          <button
            key={bt.key}
            onClick={() => switchTab(bt.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              activeType === bt.key
                ? 'bg-brand-gold text-bg-base shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {bt.label}
          </button>
        ))}
      </div>

      {/* Multiplier pill */}
      <div className="mb-5 flex items-center justify-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full text-sm">
          <Star size={14} className="text-brand-gold" />
          <span className="text-gray-300">Miltiplikatè:</span>
          <span className="text-brand-gold font-black text-base">{multiplier}×</span>
        </span>
      </div>

      <div className="space-y-4">
        {/* Number input */}
        <div>
          <label className="label">Nimewo Ou ({maxDigits} chif)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={maxDigits}
            value={number}
            onChange={handleNumberChange}
            disabled={disabled}
            placeholder={'0'.repeat(maxDigits)}
            className="input-field text-center text-2xl font-black tracking-[0.4em] disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            {number.length}/{maxDigits} chif antre
          </p>
        </div>

        {/* Stake input */}
        <div>
          <label className="label">Montan Paryaj (HTG)</label>
          <input
            type="number"
            min="0"
            step="100"
            value={stake}
            onChange={e => setStake(e.target.value)}
            disabled={disabled}
            placeholder="500"
            className="input-field disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Balans: <span className="text-white font-semibold">{formatCurrency(walletBalance)}</span>
          </p>
        </div>

        {/* Potential win preview */}
        {stakeNum > 0 && number.length === maxDigits && (
          <div className="p-4 bg-success/10 border border-success/30 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Si nimewo <span className="text-white font-bold">{number}</span> sòti...</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatCurrency(stakeNum)} × {multiplier} =
              </p>
            </div>
            <div className="text-right">
              <p className="text-success font-black text-2xl">{formatCurrency(potentialWin)}</p>
              <p className="text-xs text-gray-500">Posib Genyen</p>
            </div>
          </div>
        )}

        {/* Disabled notice */}
        {!isDrawOpen && draw && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl">
            <p className="text-xs text-warning text-center">
              {draw.status === 'closed' || draw.status === 'drawn'
                ? 'Tiraj sa a fèmen. Ou pa ka achte tikè ankò.'
                : 'Tiraj poko ouvè. Ret tann.'}
            </p>
          </div>
        )}

        {!draw && (
          <div className="p-3 bg-bg-muted border border-bg-border rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              Tiraj pwochen ap disponib byento. Fòm nan dezaktive.
            </p>
          </div>
        )}

        {/* Buy button */}
        <button
          onClick={handleBuy}
          disabled={disabled || !number || number.length !== maxDigits || !stakeNum}
          className="w-full btn-primary flex items-center justify-center gap-2 text-base"
        >
          <Ticket size={18} />
          {buying ? 'Ap achte tikè...' : 'Achte Tikè'}
        </button>
      </div>
    </div>
  );
}

// ── Recent Draws Table ───────────────────────────────────────────────────────

function RecentDrawsTable({ draws }: { draws: BoletDraw[] }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Trophy size={20} className="text-brand-gold" />
        <h2 className="font-black text-white text-lg">Rezilta Dènyè Tiraj</h2>
      </div>

      {draws.length === 0 ? (
        <div className="text-center py-10">
          <Trophy size={36} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Pa gen rezilta tiraj pou kounye a</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="text-left py-3 pr-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">Tiraj</th>
                <th className="text-left py-3 pr-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">Dat</th>
                <th className="text-center py-3 pr-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">2 Chif</th>
                <th className="text-center py-3 pr-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">3 Chif</th>
                <th className="text-center py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">4 Chif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {draws.map(draw => (
                <tr key={draw.id} className="hover:bg-bg-muted/40 transition-colors">
                  <td className="py-3 pr-4 font-semibold text-white whitespace-nowrap">{draw.name}</td>
                  <td className="py-3 pr-4 text-gray-400 text-xs whitespace-nowrap">
                    {draw.drawn_at ? formatDate(draw.drawn_at) : '—'}
                  </td>
                  <td className="py-3 pr-4 text-center">
                    {draw.result_2chif ? (
                      <span className="inline-block bg-brand-gold/20 border border-brand-gold/40 text-brand-gold font-black px-3 py-1 rounded-lg tabular-nums tracking-widest">
                        {draw.result_2chif}
                      </span>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-3 pr-4 text-center">
                    {draw.result_3chif ? (
                      <span className="inline-block bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black px-3 py-1 rounded-lg tabular-nums tracking-widest">
                        {draw.result_3chif}
                      </span>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-3 text-center">
                    {draw.result_4chif ? (
                      <span className="inline-block bg-brand-red/20 border border-brand-red/40 text-red-300 font-black px-3 py-1 rounded-lg tabular-nums tracking-widest">
                        {draw.result_4chif}
                      </span>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── My Tickets ───────────────────────────────────────────────────────────────

function MyTickets({ tickets }: { tickets: BoletTicket[] }) {
  const multiplierFor = (bt: string) => MULTIPLIERS[bt] ?? 1;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Ticket size={20} className="text-brand-gold" />
        <h2 className="font-black text-white text-lg">Tikè Mwen</h2>
        {tickets.length > 0 && (
          <span className="ml-auto bg-brand-gold/20 text-brand-gold text-xs font-bold px-2.5 py-0.5 rounded-full border border-brand-gold/30">
            {tickets.length}
          </span>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-10">
          <Ticket size={36} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Ou pa achte tikè pou tiraj sa a</p>
          <p className="text-gray-600 text-xs mt-1">Achte premye tikè ou anlè a!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const win = ticket.potential_win || ticket.stake * multiplierFor(ticket.bet_type);
            return (
              <div
                key={ticket.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  ticket.status === 'won'
                    ? 'bg-success/10 border-success/30'
                    : ticket.status === 'lost'
                    ? 'bg-danger/10 border-danger/30'
                    : 'bg-bg-muted border-bg-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Number bubble */}
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-bg-base border border-bg-border shrink-0">
                    <span className="text-brand-gold font-black text-lg tabular-nums tracking-wider leading-none">
                      {ticket.number}
                    </span>
                    <span className="text-gray-500 text-[10px] mt-0.5">{ticket.bet_type}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">{ticket.bet_type.toUpperCase()}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="text-xs text-gray-400">
                      Paryaj: <span className="text-white font-semibold">{formatCurrency(ticket.stake)}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(ticket.created_at).toLocaleTimeString('fr-HT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500 mb-1">Posib Genyen</p>
                  <p className={`font-black text-lg ${
                    ticket.status === 'won' ? 'text-success' : 'text-brand-gold'
                  }`}>
                    {formatCurrency(win)}
                  </p>
                  <p className="text-[10px] text-gray-600">{multiplierFor(ticket.bet_type)}× mise</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function BoletPage() {
  const supabase = createClient();

  const [nextDraw, setNextDraw]       = useState<BoletDraw | null>(null);
  const [recentDraws, setRecentDraws] = useState<BoletDraw[]>([]);
  const [myTickets, setMyTickets]     = useState<BoletTicket[]>([]);
  const [walletBal, setWalletBal]     = useState(0);
  const [loading, setLoading]         = useState(true);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const [nextRes, recentRes, walletRes] = await Promise.all([
      supabase
        .from('bolet_draws')
        .select('*')
        .in('status', ['upcoming', 'open'])
        .order('draw_time')
        .limit(1),
      supabase
        .from('bolet_draws')
        .select('*')
        .eq('status', 'drawn')
        .order('drawn_at', { ascending: false })
        .limit(10),
      user
        ? supabase.from('wallets').select('balance').eq('user_id', user.id).single()
        : Promise.resolve({ data: null }),
    ]);

    const draw = nextRes.data?.[0] ?? null;
    setNextDraw(draw);
    setRecentDraws(recentRes.data ?? []);
    setWalletBal(walletRes.data?.balance ?? 0);

    // Load tickets for next draw if it exists and user is logged in
    if (draw && user) {
      const { data: tickets } = await supabase
        .from('bolet_tickets')
        .select('*')
        .eq('draw_id', draw.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setMyTickets(tickets ?? []);
    } else {
      setMyTickets([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        {/* Skeleton header */}
        <div className="h-8 bg-bg-muted rounded-xl w-48 animate-pulse" />
        <div className="card p-6 animate-pulse space-y-4">
          <div className="h-6 bg-bg-muted rounded w-1/3" />
          <div className="h-10 bg-bg-muted rounded w-1/2" />
          <div className="grid grid-cols-3 gap-3">
            {[0,1,2].map(i => <div key={i} className="h-16 bg-bg-muted rounded-xl" />)}
          </div>
        </div>
        <div className="card p-6 animate-pulse space-y-4">
          <div className="h-6 bg-bg-muted rounded w-1/4" />
          {[0,1,2].map(i => <div key={i} className="h-12 bg-bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Star size={24} className="text-brand-gold" />
            Bolet
          </h1>
          <p className="text-gray-400 text-sm mt-1">Lotri Nasyonal Ayisyen — Chwazi nimewo ou, genyen gwo!</p>
        </div>
        {walletBal > 0 && (
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-xs text-gray-500">Balans Ou</p>
            <p className="text-white font-bold">{formatCurrency(walletBal)}</p>
          </div>
        )}
      </div>

      {/* Mobile balance chip */}
      {walletBal > 0 && (
        <div className="sm:hidden flex items-center gap-2 px-3 py-2 bg-bg-muted border border-bg-border rounded-xl">
          <span className="text-xs text-gray-500">Balans:</span>
          <span className="text-white font-bold text-sm">{formatCurrency(walletBal)}</span>
        </div>
      )}

      {/* ── Two-column layout on large screens ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* 1. Next Draw */}
          <NextDrawCard draw={nextDraw} />

          {/* 3. Recent Draws */}
          <RecentDrawsTable draws={recentDraws} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* 2. Bet Form */}
          <BetForm
            draw={nextDraw}
            walletBalance={walletBal}
            onTicketPurchased={loadData}
          />

          {/* 4. My Tickets */}
          <MyTickets tickets={myTickets} />
        </div>
      </div>
    </div>
  );
}
