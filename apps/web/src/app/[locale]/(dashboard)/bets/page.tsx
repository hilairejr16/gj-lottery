import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Trophy, Clock, CheckCircle, XCircle, AlertCircle, ReceiptText } from 'lucide-react';

// ── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: {
      label: 'An atant',
      className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      icon: <Clock size={12} />,
    },
    won: {
      label: 'Genyen ✓',
      className: 'bg-success/20 text-success border border-success/30',
      icon: <CheckCircle size={12} />,
    },
    lost: {
      label: 'Pèdi ✗',
      className: 'bg-danger/20 text-danger border border-danger/30',
      icon: <XCircle size={12} />,
    },
    void: {
      label: 'Anile',
      className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      icon: <AlertCircle size={12} />,
    },
    cashout: {
      label: 'Cash Out',
      className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      icon: <Trophy size={12} />,
    },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.className}`}>
      {c.icon} {c.label}
    </span>
  );
}

// ── Pick badge ────────────────────────────────────────────────
function PickBadge({ result }: { result: string }) {
  if (result === 'won') return <span className="text-xs text-success font-semibold">✓ Genyen</span>;
  if (result === 'lost') return <span className="text-xs text-danger font-semibold">✗ Pèdi</span>;
  return <span className="text-xs text-yellow-400 font-semibold">⏳ An atant</span>;
}

// ── Page ──────────────────────────────────────────────────────
export default async function BetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch bet slips with their selections
  const { data: slips } = await supabase
    .from('bet_slips')
    .select(`
      id, stake, total_odds, potential_win, status, created_at, settled_at,
      bet_selections (
        id, pick, odds, result,
        matches ( home_team, away_team, league, sport )
      )
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const stats = {
    total:    slips?.length ?? 0,
    pending:  slips?.filter(s => s.status === 'pending').length ?? 0,
    won:      slips?.filter(s => s.status === 'won').length ?? 0,
    lost:     slips?.filter(s => s.status === 'lost').length ?? 0,
    totalWon: slips?.filter(s => s.status === 'won').reduce((a, s) => a + Number(s.potential_win), 0) ?? 0,
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ReceiptText size={24} className="text-brand-gold" />
        <h1 className="text-2xl font-black text-white">Paryaj Mwen / Mes Paris</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Paryaj',  value: stats.total,              sub: 'tout paryaj',     color: 'text-white' },
          { label: 'An Atant',      value: stats.pending,            sub: 'ap tann rezilta',  color: 'text-yellow-400' },
          { label: 'Genyen',        value: stats.won,                sub: 'paryaj ou genyen', color: 'text-success' },
          { label: 'Total Genyen',  value: formatCurrency(stats.totalWon), sub: 'HTG touche', color: 'text-brand-gold' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-600 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Slips list */}
      {!slips || slips.length === 0 ? (
        <div className="card p-16 text-center">
          <ReceiptText size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">Pa gen paryaj ankò</p>
          <p className="text-gray-600 text-sm mt-1">Ale nan seksyon Espò pou fè premye paryaj ou</p>
          <a href="/sports" className="inline-block mt-4 px-4 py-2 bg-brand-gold text-bg-base text-sm font-bold rounded-xl">
            Paryaje Kounye a
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {slips.map((slip: any) => (
            <div key={slip.id} className="card p-4 space-y-4 hover:border-bg-border/80 transition-all">

              {/* Slip header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={slip.status} />
                    {slip.bet_selections?.length > 1 && (
                      <span className="text-xs text-gray-500 bg-bg-muted px-2 py-0.5 rounded-full">
                        Akimilatè × {slip.bet_selections.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{formatDate(slip.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    Mize: <span className="text-white font-bold">{formatCurrency(slip.stake)}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Cote: <span className="text-brand-gold font-bold">{Number(slip.total_odds).toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Posib: <span className={`font-bold ${slip.status === 'won' ? 'text-success' : 'text-white'}`}>
                      {formatCurrency(slip.potential_win)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Selections */}
              <div className="space-y-2 border-t border-bg-border pt-3">
                {slip.bet_selections?.map((sel: any) => {
                  const match = sel.matches;
                  const pickLabel = sel.pick === 'home' ? `${match?.home_team} Genyen`
                    : sel.pick === 'away' ? `${match?.away_team} Genyen`
                    : 'Match Nul';
                  return (
                    <div key={sel.id} className="flex items-center justify-between py-1.5 px-3 bg-bg-muted rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 truncate">
                          {match?.home_team} vs {match?.away_team}
                        </p>
                        <p className="text-sm font-semibold text-white truncate">{pickLabel}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-3 shrink-0">
                        <span className="text-brand-gold font-bold text-sm">{Number(sel.odds).toFixed(2)}</span>
                        <PickBadge result={sel.result} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Won payout */}
              {slip.status === 'won' && slip.settled_at && (
                <div className="flex items-center justify-between bg-success/10 border border-success/20 rounded-xl px-3 py-2">
                  <span className="text-success text-sm font-semibold">🏆 Ou te genyen!</span>
                  <span className="text-success font-black">{formatCurrency(slip.potential_win)} HTG</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
