'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Dices,
  Trophy,
  Clock,
  ChevronDown,
  Loader2,
  X,
  TicketCheck,
  CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type DrawStatus = 'upcoming' | 'open' | 'closed' | 'drawn';

interface BoletDraw {
  id: string;
  draw_name: 'Tiraj Maten' | 'Tiraj Midi' | 'Tiraj Swa';
  draw_time: string;
  status: DrawStatus;
  winning_2: string | null;
  winning_3: string | null;
  winning_4: string | null;
  drawn_at: string | null;
  created_at: string;
}

interface DrawStats {
  total_tickets: number;
  total_staked: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DRAW_NAMES = ['Tiraj Maten', 'Tiraj Midi', 'Tiraj Swa'] as const;

const STATUS_STYLES: Record<DrawStatus, string> = {
  upcoming: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  open:     'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  closed:   'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  drawn:    'bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30',
};

const STATUS_LABELS: Record<DrawStatus, string> = {
  upcoming: 'Byento',
  open:     'Ouvè',
  closed:   'Fèmen',
  drawn:    'Tiraj Fini',
};

function StatusBadge({ status }: { status: DrawStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Random number helpers ─────────────────────────────────────────────────────

function randNum(digits: number): string {
  const max = Math.pow(10, digits);
  return String(Math.floor(Math.random() * max)).padStart(digits, '0');
}

// ── Create Draw Modal ─────────────────────────────────────────────────────────

function CreateDrawModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const supabase = createClient();
  const [drawName, setDrawName] = useState<typeof DRAW_NAMES[number]>('Tiraj Maten');
  const [drawTime, setDrawTime] = useState('');
  const [saving, setSaving]     = useState(false);

  async function handleCreate() {
    if (!drawTime) { toast.error('Antre dat ak lè tiraj la'); return; }

    setSaving(true);
    const { error } = await supabase.from('bolet_draws').insert({
      draw_name: drawName,
      draw_time: new Date(drawTime).toISOString(),
      status: 'upcoming',
    });
    setSaving(false);

    if (error) { toast.error(error.message); return; }
    toast.success(`Tiraj "${drawName}" kreye!`);
    onCreated();
    onClose();
  }

  // Default draw time: next hour
  useEffect(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDrawTime(local);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-black text-white text-lg flex items-center gap-2">
            <Plus size={20} className="text-[#F5A623]" />
            Kreye Nouvo Tiraj
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Draw name */}
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wide">Non Tiraj</label>
          <div className="relative">
            <select
              value={drawName}
              onChange={e => setDrawName(e.target.value as typeof DRAW_NAMES[number])}
              className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:border-[#F5A623]/50 transition-colors pr-10"
            >
              {DRAW_NAMES.map(n => (
                <option key={n} value={n} className="bg-[#0D1520]">{n}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Draw time */}
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wide">Dat ak Lè Tiraj</label>
          <input
            type="datetime-local"
            value={drawTime}
            onChange={e => setDrawTime(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-semibold focus:outline-none focus:border-[#F5A623]/50 transition-colors [color-scheme:dark]"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-semibold hover:text-white hover:border-white/20 transition-all"
          >
            Anile
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-[#F5A623] text-[#0D1520] font-black text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {saving ? 'Ap kreye...' : 'Kreye Tiraj'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Settle Draw Modal ─────────────────────────────────────────────────────────

function SettleDrawModal({
  draw,
  stats,
  onClose,
  onSettled,
}: {
  draw: BoletDraw;
  stats: DrawStats | null;
  onClose: () => void;
  onSettled: () => void;
}) {
  const supabase = createClient();
  const [win2, setWin2]       = useState('');
  const [win3, setWin3]       = useState('');
  const [win4, setWin4]       = useState('');
  const [settling, setSettling] = useState(false);

  async function handleSettle() {
    if (win2.length !== 2) { toast.error('Nimewo 2 chif dwe gen egzakteman 2 chif'); return; }
    if (win3.length !== 3) { toast.error('Nimewo 3 chif dwe gen egzakteman 3 chif'); return; }
    if (win4.length !== 4) { toast.error('Nimewo 4 chif dwe gen egzakteman 4 chif'); return; }

    setSettling(true);
    const { error } = await supabase.rpc('settle_bolet_draw', {
      p_draw_id:    draw.id,
      p_winning_2:  win2,
      p_winning_3:  win3,
      p_winning_4:  win4,
    });
    setSettling(false);

    if (error) { toast.error(error.message); return; }
    toast.success(`Tiraj "${draw.draw_name}" fèmen! Nimewo: ${win2} / ${win3} / ${win4}`);
    onSettled();
    onClose();
  }

  const fields: { label: string; digits: number; val: string; set: (v: string) => void }[] = [
    { label: 'Nimewo 2 Chif', digits: 2, val: win2, set: setWin2 },
    { label: 'Nimewo 3 Chif', digits: 3, val: win3, set: setWin3 },
    { label: 'Nimewo 4 Chif', digits: 4, val: win4, set: setWin4 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-black text-white text-lg flex items-center gap-2">
            <Dices size={20} className="text-[#F5A623]" />
            Fè Tiraj
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Draw info */}
        <div className="px-4 py-3 bg-white/3 border border-white/6 rounded-xl">
          <p className="font-bold text-white">{draw.draw_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(draw.draw_time).toLocaleString('fr-HT', {
              weekday: 'long', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>

        {/* Ticket stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white/3 border border-white/6 rounded-xl">
              <p className="text-[#F5A623] font-black text-xl">{stats.total_tickets}</p>
              <p className="text-gray-500 text-xs mt-0.5">Tikè Vann</p>
            </div>
            <div className="text-center p-3 bg-white/3 border border-white/6 rounded-xl">
              <p className="text-[#F5A623] font-black text-xl">{formatCurrency(stats.total_staked)}</p>
              <p className="text-gray-500 text-xs mt-0.5">Total Mise</p>
            </div>
          </div>
        )}

        {/* Number inputs */}
        <div className="space-y-4">
          {fields.map(({ label, digits, val, set }) => (
            <div key={digits}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wide">{label}</label>
                <button
                  onClick={() => set(randNum(digits))}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#F5A623] transition-colors px-2 py-1 rounded-lg hover:bg-[#F5A623]/10"
                >
                  <Dices size={13} />
                  Random
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={digits}
                value={val}
                onChange={e => set(e.target.value.replace(/\D/g, '').slice(0, digits))}
                placeholder={'0'.repeat(digits)}
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-center text-2xl font-black tracking-[0.6em] text-white focus:outline-none transition-colors ${
                  val.length === digits
                    ? 'border-[#F5A623]/50 bg-[#F5A623]/5'
                    : 'border-white/10 focus:border-[#F5A623]/40'
                }`}
              />
              <p className={`text-xs text-right mt-1 ${val.length === digits ? 'text-emerald-400' : 'text-gray-600'}`}>
                {val.length}/{digits}
              </p>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="p-3 bg-amber-900/20 border border-amber-500/20 rounded-xl">
          <p className="text-xs text-amber-400 text-center font-semibold">
            ⚠️ Aksyon sa a pa ka defèt. Asire ou nimewo yo kòrèk!
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-semibold hover:text-white hover:border-white/20 transition-all"
          >
            Anile
          </button>
          <button
            onClick={handleSettle}
            disabled={settling || win2.length !== 2 || win3.length !== 3 || win4.length !== 4}
            className="flex-1 py-3 rounded-xl bg-[#F5A623] text-[#0D1520] font-black text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {settling ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />}
            {settling ? 'Ap fèmen...' : 'Konfime Tiraj'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main admin page ───────────────────────────────────────────────────────────

export default function AdminLotteryPage() {
  const supabase = createClient();

  const [draws,        setDraws]        = useState<BoletDraw[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [createModal,  setCreateModal]  = useState(false);
  const [settleTarget, setSettleTarget] = useState<BoletDraw | null>(null);
  const [drawStats,    setDrawStats]    = useState<Record<string, DrawStats>>({});

  const loadDraws = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bolet_draws')
      .select('*')
      .order('draw_time', { ascending: false });

    if (error) { toast.error(error.message); setLoading(false); return; }
    setDraws(data ?? []);
    setLoading(false);

    // Load ticket stats for all draws
    if ((data ?? []).length > 0) {
      const ids = (data ?? []).map(d => d.id);
      const { data: tickets } = await supabase
        .from('bolet_tickets')
        .select('draw_id, stake')
        .in('draw_id', ids);

      if (tickets) {
        const statsMap: Record<string, DrawStats> = {};
        for (const t of tickets) {
          if (!statsMap[t.draw_id]) {
            statsMap[t.draw_id] = { total_tickets: 0, total_staked: 0 };
          }
          statsMap[t.draw_id].total_tickets += 1;
          statsMap[t.draw_id].total_staked  += Number(t.stake) || 0;
        }
        setDrawStats(statsMap);
      }
    }
  }, [supabase]);

  useEffect(() => { loadDraws(); }, [loadDraws]);

  // Counts for header tiles
  const openCount     = draws.filter(d => d.status === 'open').length;
  const upcomingCount = draws.filter(d => d.status === 'upcoming').length;
  const drawnCount    = draws.filter(d => d.status === 'drawn').length;
  const totalTickets  = Object.values(drawStats).reduce((acc, s) => acc + s.total_tickets, 0);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Trophy size={24} className="text-[#F5A623]" />
            Jesyon Bolet
          </h1>
          <p className="text-gray-400 text-sm mt-1">Kreye, jere, ak fèmen tiraj bolet</p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] text-[#0D1520] font-bold text-sm rounded-xl hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={17} />
          Kreye Tiraj
        </button>
      </div>

      {/* ── Summary tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tiraj Ouvè',    value: openCount,     icon: Clock,         color: 'text-emerald-400' },
          { label: 'Byento',        value: upcomingCount, icon: CalendarDays,  color: 'text-blue-400' },
          { label: 'Tiraj Fini',    value: drawnCount,    icon: Trophy,        color: 'text-[#F5A623]' },
          { label: 'Total Tikè',    value: totalTickets,  icon: TicketCheck,   color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={22} className={`${color} mx-auto mb-2`} />
            <p className={`font-black text-2xl ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Draws table ── */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#F5A623]" />
          </div>
        ) : draws.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">Pa gen tiraj pou kounye a</p>
            <p className="text-gray-600 text-sm mt-1">Klike "Kreye Tiraj" pou kòmanse</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="text-left px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Tiraj</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Dat / Lè</th>
                  <th className="text-center px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Estati</th>
                  <th className="text-center px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Tikè</th>
                  <th className="text-center px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Nimewo Genyen</th>
                  <th className="text-right px-5 py-3.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Aksyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {draws.map(draw => {
                  const stats    = drawStats[draw.id];
                  const canSettle = draw.status === 'open' || draw.status === 'upcoming';

                  return (
                    <tr key={draw.id} className="hover:bg-white/2 transition-colors">

                      {/* Name */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-white">{draw.draw_name}</span>
                      </td>

                      {/* Time */}
                      <td className="px-5 py-4 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(draw.draw_time).toLocaleString('fr-HT', {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                        {draw.status === 'drawn' && draw.drawn_at && (
                          <p className="text-gray-600 mt-0.5">
                            Fini: {new Date(draw.drawn_at).toLocaleTimeString('fr-HT', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <StatusBadge status={draw.status} />
                      </td>

                      {/* Tickets */}
                      <td className="px-5 py-4 text-center">
                        {stats ? (
                          <div>
                            <p className="font-bold text-white">{stats.total_tickets}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(stats.total_staked)}</p>
                          </div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>

                      {/* Winning numbers */}
                      <td className="px-5 py-4 text-center">
                        {draw.status === 'drawn' ? (
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            {draw.winning_2 && (
                              <span className="px-2 py-0.5 rounded-lg bg-[#F5A623]/15 border border-[#F5A623]/30 text-[#F5A623] font-black text-sm tabular-nums">
                                {draw.winning_2}
                              </span>
                            )}
                            {draw.winning_3 && (
                              <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 font-black text-sm tabular-nums">
                                {draw.winning_3}
                              </span>
                            )}
                            {draw.winning_4 && (
                              <span className="px-2 py-0.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 font-black text-sm tabular-nums">
                                {draw.winning_4}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {canSettle ? (
                          <button
                            onClick={() => setSettleTarget(draw)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#F5A623] text-xs font-bold rounded-xl hover:bg-[#F5A623]/20 active:scale-95 transition-all ml-auto"
                          >
                            <Dices size={13} />
                            Fè Tiraj
                          </button>
                        ) : (
                          <span className="text-gray-700 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {createModal && (
        <CreateDrawModal
          onClose={() => setCreateModal(false)}
          onCreated={loadDraws}
        />
      )}

      {settleTarget && (
        <SettleDrawModal
          draw={settleTarget}
          stats={drawStats[settleTarget.id] ?? null}
          onClose={() => setSettleTarget(null)}
          onSettled={loadDraws}
        />
      )}
    </div>
  );
}
