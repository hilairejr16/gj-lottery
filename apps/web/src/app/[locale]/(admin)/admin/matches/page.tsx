'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { Trophy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type Match = {
  id: string;
  external_id: string;
  league: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  status: string;
  result: string | null;
  odds_home: number;
  odds_draw: number | null;
  odds_away: number;
};

// ── Settle Modal ──────────────────────────────────────────────
function SettleModal({ match, onClose, onSettled }: {
  match: Match;
  onClose: () => void;
  onSettled: () => void;
}) {
  const [pick, setPick]       = useState<'home' | 'draw' | 'away' | ''>('');
  const [settling, setSettling] = useState(false);
  const supabase = createClient();

  async function settle() {
    if (!pick) { toast.error('Chwazi rezilta match la'); return; }
    setSettling(true);
    const { error } = await supabase.rpc('settle_match', {
      p_match_id: match.id,
      p_result:   pick,
    });
    setSettling(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Match regle! Rezilta: ${pick === 'home' ? match.home_team : pick === 'away' ? match.away_team : 'Match Nul'}`);
    onSettled();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-6 space-y-5">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Trophy size={18} className="text-brand-gold" />
          Regle Match la
        </h2>

        <div className="text-center py-2">
          <p className="text-xs text-gray-500 mb-1">{match.league}</p>
          <p className="font-bold text-white">{match.home_team}</p>
          <p className="text-gray-500 text-sm">vs</p>
          <p className="font-bold text-white">{match.away_team}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-semibold">Chwazi Rezilta:</p>
          {[
            { value: 'home', label: `🏠 ${match.home_team} Genyen`, odds: match.odds_home },
            ...(match.odds_draw ? [{ value: 'draw', label: '🤝 Match Nul / Égalité', odds: match.odds_draw }] : []),
            { value: 'away', label: `✈️ ${match.away_team} Genyen`, odds: match.odds_away },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setPick(opt.value as any)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                pick === opt.value
                  ? 'border-brand-gold bg-brand-gold/20 text-white'
                  : 'border-bg-border bg-bg-muted text-gray-300 hover:border-brand-gold/40'
              }`}
            >
              <span className="font-semibold">{opt.label}</span>
              <span className="text-brand-gold font-bold">{Number(opt.odds).toFixed(2)}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-3 border border-bg-border text-gray-400 rounded-xl hover:text-white transition-colors">
            Anile
          </button>
          <button
            onClick={settle}
            disabled={settling || !pick}
            className="flex-1 px-4 py-3 bg-brand-gold text-bg-base font-bold rounded-xl hover:bg-brand-gold-light transition-all disabled:opacity-50"
          >
            {settling ? 'Ap regle...' : 'Konfime Rezilta'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function AdminMatchesPage() {
  const [matches, setMatches]       = useState<Match[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Match | null>(null);
  const [filterStatus, setFilter]   = useState<'upcoming' | 'finished'>('upcoming');
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('matches')
      .select('*')
      .eq('status', filterStatus)
      .order('commence_time', { ascending: filterStatus === 'upcoming' });
    setMatches(data ?? []);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const statusIcon = (m: Match) => {
    if (m.status === 'finished') return <CheckCircle size={14} className="text-success" />;
    if (m.status === 'live')     return <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />;
    return <Clock size={14} className="text-yellow-400" />;
  };

  return (
    <div className="animate-fade-in space-y-6">
      {selected && (
        <SettleModal
          match={selected}
          onClose={() => setSelected(null)}
          onSettled={load}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Trophy size={24} className="text-brand-gold" />
          Jere Match / Gérer Matchs
        </h1>
        <div className="flex gap-2">
          {(['upcoming', 'finished'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === s
                  ? 'bg-brand-gold text-bg-base'
                  : 'bg-bg-muted border border-bg-border text-gray-400 hover:text-white'
              }`}
            >
              {s === 'upcoming' ? '⏳ Ap vini' : '✅ Fini'}
            </button>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <AlertCircle size={16} className="text-blue-400 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">Kijan pou regle match la:</p>
          <p className="text-blue-400">Match yo dwe egziste nan baz done anvan ou ka regle yo. Match ki soti nan The Odds API yo ajoute otomatikman lè yon paryaj fèt. Ou ka regle yon match lè rezilta final la disponib.</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-bg-muted rounded w-1/4 mb-2" />
              <div className="h-5 bg-bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">Pa gen match {filterStatus === 'upcoming' ? 'k ap vini' : 'ki fini'}</p>
          <p className="text-gray-600 text-sm mt-1">Match yo ajoute otomatikman nan baz done lè yon paryaj fèt</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border text-left">
                <th className="pb-3 text-gray-500 font-semibold">Match</th>
                <th className="pb-3 text-gray-500 font-semibold">Lèg</th>
                <th className="pb-3 text-gray-500 font-semibold">Dat</th>
                <th className="pb-3 text-gray-500 font-semibold">Cote</th>
                <th className="pb-3 text-gray-500 font-semibold">Eta</th>
                <th className="pb-3 text-gray-500 font-semibold">Rezilta</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border">
              {matches.map(m => (
                <tr key={m.id} className="hover:bg-bg-muted/40 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-white">{m.home_team}</p>
                    <p className="text-gray-500 text-xs">vs {m.away_team}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-gray-400">{m.league}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-gray-400 text-xs">{formatDate(m.commence_time)}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-1.5 text-xs font-bold">
                      <span className="text-brand-gold">{Number(m.odds_home).toFixed(2)}</span>
                      {m.odds_draw && <span className="text-gray-400">{Number(m.odds_draw).toFixed(2)}</span>}
                      <span className="text-brand-gold">{Number(m.odds_away).toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      {statusIcon(m)}
                      <span className="capitalize text-gray-400">{m.status}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {m.result ? (
                      <span className="text-success text-xs font-bold capitalize">
                        {m.result === 'home' ? m.home_team : m.result === 'away' ? m.away_team : 'Nul'}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    {m.status !== 'finished' && (
                      <button
                        onClick={() => setSelected(m)}
                        className="px-3 py-1.5 bg-brand-gold text-bg-base text-xs font-bold rounded-lg hover:bg-brand-gold-light transition-colors"
                      >
                        Regle
                      </button>
                    )}
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
