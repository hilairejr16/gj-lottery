'use client';

import { useState, useEffect, useCallback } from 'react';
import { SPORTS, fetchOdds, getBestOdds, type OddsMatch } from '@/lib/odds-api';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Trophy, Clock, ShoppingCart, X, Trash2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────
interface BetSelection {
  matchId:   string;
  matchLabel: string;
  pick:      'home' | 'draw' | 'away';
  pickLabel: string;
  odds:      number;
}

// ── Bet Slip Sidebar ─────────────────────────────────────────
function BetSlip({ selections, onRemove, onClear, walletBalance }:
  { selections: BetSelection[]; onRemove: (id: string) => void; onClear: () => void; walletBalance: number }) {
  const [stake, setStake]     = useState('');
  const [placing, setPlacing] = useState(false);
  const supabase = createClient();

  const totalOdds    = selections.reduce((acc, s) => acc * s.odds, 1);
  const potentialWin = stake ? parseFloat(stake) * totalOdds : 0;

  async function placeBet() {
    const stakeNum = parseFloat(stake);
    if (!stakeNum || stakeNum <= 0) { toast.error('Antre montan ou vle paryaje'); return; }
    if (stakeNum > walletBalance)    { toast.error('Balans ou pa ase'); return; }
    if (selections.length === 0)     { toast.error('Chwazi omwen yon paryaj'); return; }

    setPlacing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Ou pa konekte'); setPlacing(false); return; }

    const { error } = await supabase.rpc('place_bet', {
      p_user_id:    user.id,
      p_stake:      stakeNum,
      p_selections: selections.map(s => ({
        match_id: s.matchId,
        pick:     s.pick,
        odds:     s.odds,
      })),
    });

    setPlacing(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Paryaj ${formatCurrency(stakeNum)} fè! Ou ka genyen ${formatCurrency(potentialWin)} 🎉`);
    onClear();
    setStake('');
  }

  if (selections.length === 0) {
    return (
      <div className="card p-6 text-center">
        <ShoppingCart size={32} className="text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Panyè Paryaj Vid</p>
        <p className="text-gray-600 text-xs mt-1">Klike sou cote pou ajoute paryaj</p>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-3 sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2">
          <ShoppingCart size={16} className="text-brand-gold" />
          Panyè Paryaj ({selections.length})
        </h3>
        <button onClick={onClear} className="text-gray-500 hover:text-danger transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {selections.map(s => (
          <div key={s.matchId} className="flex items-start justify-between p-2.5 bg-bg-muted rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 truncate">{s.matchLabel}</p>
              <p className="text-sm font-semibold text-white">{s.pickLabel}</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-brand-gold font-bold text-sm">{s.odds.toFixed(2)}</span>
              <button onClick={() => onRemove(s.matchId)} className="text-gray-500 hover:text-danger">
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-bg-border pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Cote Total</span>
          <span className="text-brand-gold font-bold">{totalOdds.toFixed(2)}</span>
        </div>

        <input
          type="number" min="0" step="100" placeholder="Montan Paryaj (HTG)"
          value={stake} onChange={e => setStake(e.target.value)}
          className="input-field text-sm"
        />

        {stake && parseFloat(stake) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Posib Genyen</span>
            <span className="text-success font-bold">{formatCurrency(potentialWin)}</span>
          </div>
        )}

        <button
          onClick={placeBet} disabled={placing || !stake}
          className="w-full bg-brand-gold text-bg-base font-bold py-3 rounded-xl hover:bg-brand-gold-light transition-all disabled:opacity-50"
        >
          {placing ? 'Ap fè paryaj...' : 'Fè Paryaj'}
        </button>
      </div>
    </div>
  );
}

// ── Match Card ───────────────────────────────────────────────
function MatchCard({ match, onSelect, selected }:
  { match: OddsMatch; onSelect: (s: BetSelection) => void; selected?: BetSelection }) {

  const odds     = getBestOdds(match);
  const kickoff  = new Date(match.commence_time);
  const dateStr  = kickoff.toLocaleDateString('fr-HT', { month: 'short', day: 'numeric' });
  const timeStr  = kickoff.toLocaleTimeString('fr-HT', { hour: '2-digit', minute: '2-digit' });

  function pick(type: 'home' | 'draw' | 'away', label: string, oddsVal: number) {
    onSelect({
      matchId:    match.id,
      matchLabel: `${match.home_team} vs ${match.away_team}`,
      pick:       type,
      pickLabel:  label,
      odds:       oddsVal,
    });
  }

  const isSelected = (type: string) => selected?.pick === type;

  return (
    <div className="card p-4 hover:border-brand-gold/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{match.sport_title}</span>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={11} />
          <span>{dateStr} {timeStr}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="font-bold text-white text-sm leading-tight">{match.home_team}</p>
          <p className="text-xs text-gray-500 mt-0.5">Lakay / Domicile</p>
        </div>
        <div className="px-3 py-1 bg-bg-muted rounded-lg mx-2">
          <span className="text-xs font-bold text-gray-400">VS</span>
        </div>
        <div className="flex-1 text-right">
          <p className="font-bold text-white text-sm leading-tight">{match.away_team}</p>
          <p className="text-xs text-gray-500 mt-0.5">Deyò / Extérieur</p>
        </div>
      </div>

      {/* Odds buttons */}
      <div className={`grid gap-2 ${odds.draw ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <button
          onClick={() => pick('home', `${match.home_team} Genyen`, odds.home)}
          className={`odds-btn ${isSelected('home') ? 'selected' : ''}`}
        >
          <span className="text-xs text-gray-400 mb-0.5">1 / Lakay</span>
          <span className="font-bold text-white text-base">{odds.home.toFixed(2)}</span>
        </button>

        {odds.draw && (
          <button
            onClick={() => pick('draw', 'Match Nul / Égalité', odds.draw!)}
            className={`odds-btn ${isSelected('draw') ? 'selected' : ''}`}
          >
            <span className="text-xs text-gray-400 mb-0.5">X / Nul</span>
            <span className="font-bold text-white text-base">{odds.draw.toFixed(2)}</span>
          </button>
        )}

        <button
          onClick={() => pick('away', `${match.away_team} Genyen`, odds.away)}
          className={`odds-btn ${isSelected('away') ? 'selected' : ''}`}
        >
          <span className="text-xs text-gray-400 mb-0.5">2 / Deyò</span>
          <span className="font-bold text-white text-base">{odds.away.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
}

// ── Main Sports Page ─────────────────────────────────────────
export default function SportsPage() {
  const [activeSport, setActiveSport] = useState<string>(SPORTS[0].key);
  const [matches, setMatches]         = useState<OddsMatch[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selections, setSelections]   = useState<BetSelection[]>([]);
  const [walletBal, setWalletBal]     = useState(0);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('wallets').select('balance').eq('user_id', user.id).single()
        .then(({ data }) => setWalletBal(data?.balance ?? 0));
    });
  }, []);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    const data = await fetchOdds(activeSport);
    setMatches(data);
    setLoading(false);
  }, [activeSport]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  function handleSelect(sel: BetSelection) {
    setSelections(prev => {
      const exists = prev.find(s => s.matchId === sel.matchId);
      if (exists) {
        if (exists.pick === sel.pick) return prev.filter(s => s.matchId !== sel.matchId);
        return prev.map(s => s.matchId === sel.matchId ? sel : s);
      }
      return [...prev, sel];
    });
  }

  const currentSport = SPORTS.find(s => s.key === activeSport);

  // Group sports by category
  const sportGroups = [
    { label: '⚽ Foutbòl / Football', keys: SPORTS.filter(s => s.sport === 'soccer') },
    { label: '🏀 Basketbòl',          keys: SPORTS.filter(s => s.sport === 'basketball') },
    { label: '⚾ Bezbòl / Baseball',   keys: SPORTS.filter(s => s.sport === 'baseball') },
    { label: '🏒 Hoki / Hockey',       keys: SPORTS.filter(s => s.sport === 'hockey') },
    { label: '🏈 Foutbòl Ameriken',    keys: SPORTS.filter(s => s.sport === 'american_football') },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Trophy size={24} className="text-brand-gold" />
          Paryaj Espò / Paris Sportifs
        </h1>
        {selections.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-gold/20 border border-brand-gold/40 rounded-full">
            <ShoppingCart size={14} className="text-brand-gold" />
            <span className="text-brand-gold text-sm font-bold">{selections.length}</span>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Left: sport selector + matches */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Sport tabs */}
          <div className="space-y-2">
            {sportGroups.map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.keys.map(s => (
                    <button key={s.key} onClick={() => setActiveSport(s.key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeSport === s.key
                          ? 'bg-brand-gold text-bg-base'
                          : 'bg-bg-muted border border-bg-border text-gray-400 hover:text-white hover:border-brand-gold/40'
                      }`}>
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Matches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-white">{currentSport?.emoji} {currentSport?.label}</h2>
              <button onClick={loadMatches} className="text-xs text-brand-gold hover:underline flex items-center gap-1">
                Rechaje <ChevronRight size={12} />
              </button>
            </div>

            {loading ? (
              <div className="grid gap-3">
                {[1,2,3].map(i => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="h-4 bg-bg-muted rounded w-1/3 mb-3" />
                    <div className="h-6 bg-bg-muted rounded w-full mb-3" />
                    <div className="grid grid-cols-3 gap-2">
                      {[1,2,3].map(j => <div key={j} className="h-14 bg-bg-muted rounded-xl" />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-gray-500">Pa gen match disponib kounye a</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {matches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onSelect={handleSelect}
                    selected={selections.find(s => s.matchId === match.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Bet slip */}
        <div className="w-72 shrink-0 hidden lg:block">
          <BetSlip
            selections={selections}
            onRemove={id => setSelections(prev => prev.filter(s => s.matchId !== id))}
            onClear={() => setSelections([])}
            walletBalance={walletBal}
          />
        </div>
      </div>

      {/* Mobile bet slip button */}
      {selections.length > 0 && (
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
          <div className="card p-4">
            <BetSlip
              selections={selections}
              onRemove={id => setSelections(prev => prev.filter(s => s.matchId !== id))}
              onClear={() => setSelections([])}
              walletBalance={walletBal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
