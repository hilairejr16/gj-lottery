import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../src/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Match {
  id: string;
  home: string;
  away: string;
  home_odds: number;
  draw_odds: number | null;
  away_odds: number;
}

interface Selection {
  matchId: string;
  home: string;
  away: string;
  pick: '1' | 'X' | '2';
  odds: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'pl',  label: '⚽ Premier League' },
  { id: 'mls', label: '⚽ MLS' },
  { id: 'nba', label: '🏀 NBA' },
  { id: 'mlb', label: '⚾ MLB' },
  { id: 'nhl', label: '🏒 NHL' },
  { id: 'nfl', label: '🏈 NFL' },
];

const MOCK_MATCHES: Match[] = [
  { id: '1', home: 'Manchester City', away: 'Arsenal',       home_odds: 2.10, draw_odds: 3.40, away_odds: 3.20 },
  { id: '2', home: 'Liverpool',       away: 'Chelsea',       home_odds: 1.95, draw_odds: 3.50, away_odds: 3.80 },
  { id: '3', home: 'Miami Heat',      away: 'Boston Celtics',home_odds: 2.20, draw_odds: null, away_odds: 1.75 },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: '60%', marginTop: 8 }]} />
      <View style={styles.skeletonOddsRow}>
        <View style={styles.skeletonOddsBtn} />
        <View style={styles.skeletonOddsBtn} />
        <View style={styles.skeletonOddsBtn} />
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SportsScreen() {
  const [activeCategory, setActiveCategory] = useState('pl');
  const [matches, setMatches]               = useState<Match[]>([]);
  const [loading, setLoading]               = useState(true);
  const [selections, setSelections]         = useState<Selection[]>([]);
  const [stake, setStake]                   = useState('');

  // Fetch or fall back to mock data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('virtual_events')
          .select('id, home_team, away_team, home_odds, draw_odds, away_odds')
          .eq('game_type', 'football')
          .eq('status', 'upcoming')
          .limit(10);

        if (!cancelled) {
          if (error || !data || data.length === 0) {
            setMatches(MOCK_MATCHES);
          } else {
            setMatches(
              data.map((r: any) => ({
                id:        String(r.id),
                home:      r.home_team,
                away:      r.away_team,
                home_odds: r.home_odds,
                draw_odds: r.draw_odds ?? null,
                away_odds: r.away_odds,
              }))
            );
          }
        }
      } catch {
        if (!cancelled) setMatches(MOCK_MATCHES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeCategory]);

  // Toggle a pick
  function togglePick(match: Match, pick: '1' | 'X' | '2', odds: number) {
    setSelections(prev => {
      const existing = prev.find(s => s.matchId === match.id);
      if (existing && existing.pick === pick) {
        // Deselect
        return prev.filter(s => s.matchId !== match.id);
      }
      const newSel: Selection = { matchId: match.id, home: match.home, away: match.away, pick, odds };
      if (existing) {
        return prev.map(s => s.matchId === match.id ? newSel : s);
      }
      return [...prev, newSel];
    });
  }

  const totalOdds    = selections.reduce((acc, s) => acc * s.odds, 1);
  const stakeNum     = parseFloat(stake) || 0;
  const potentialWin = stakeNum * totalOdds;

  function handlePlaceBet() {
    if (selections.length === 0) return;
    if (stakeNum <= 0) {
      Alert.alert('Erè', 'Tanpri antre yon montan.');
      return;
    }
    Alert.alert('✅ Paryaj anrejistre!', `Ou genyen posibilite: $${potentialWin.toFixed(2)}`);
    setSelections([]);
    setStake('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Espò</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: selections.length > 0 ? 280 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillRow}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, activeCategory === cat.id && styles.pillActive]}
              onPress={() => { setActiveCategory(cat.id); setSelections([]); }}
            >
              <Text style={[styles.pillText, activeCategory === cat.id && styles.pillTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Match list */}
        <View style={styles.matchList}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : matches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Pa gen match disponib.</Text>
            </View>
          ) : (
            matches.map(match => {
              const sel = selections.find(s => s.matchId === match.id);
              return (
                <View key={match.id} style={styles.matchCard}>
                  {/* Teams */}
                  <View style={styles.teamsRow}>
                    <Text style={styles.teamName} numberOfLines={1}>{match.home}</Text>
                    <View style={styles.vsBadge}><Text style={styles.vsText}>VS</Text></View>
                    <Text style={styles.teamName} numberOfLines={1}>{match.away}</Text>
                  </View>

                  {/* Odds buttons */}
                  <View style={styles.oddsRow}>
                    <TouchableOpacity
                      style={[styles.oddsBtn, sel?.pick === '1' && styles.oddsBtnActive]}
                      onPress={() => togglePick(match, '1', match.home_odds)}
                    >
                      <Text style={styles.oddsLabel}>1</Text>
                      <Text style={[styles.oddsValue, sel?.pick === '1' && styles.oddsValueActive]}>
                        {match.home_odds.toFixed(2)}
                      </Text>
                    </TouchableOpacity>

                    {match.draw_odds !== null && (
                      <TouchableOpacity
                        style={[styles.oddsBtn, sel?.pick === 'X' && styles.oddsBtnActive]}
                        onPress={() => togglePick(match, 'X', match.draw_odds!)}
                      >
                        <Text style={styles.oddsLabel}>X</Text>
                        <Text style={[styles.oddsValue, sel?.pick === 'X' && styles.oddsValueActive]}>
                          {match.draw_odds.toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.oddsBtn, sel?.pick === '2' && styles.oddsBtnActive]}
                      onPress={() => togglePick(match, '2', match.away_odds)}
                    >
                      <Text style={styles.oddsLabel}>2</Text>
                      <Text style={[styles.oddsValue, sel?.pick === '2' && styles.oddsValueActive]}>
                        {match.away_odds.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Bet Slip */}
      {selections.length > 0 && (
        <View style={styles.betSlip}>
          <Text style={styles.betSlipTitle}>🎟 Tikè Paryaj ({selections.length})</Text>

          {selections.map(s => (
            <View key={s.matchId} style={styles.slipRow}>
              <Text style={styles.slipMatch} numberOfLines={1}>
                {s.home} vs {s.away}
              </Text>
              <Text style={styles.slipPick}>{s.pick} · {s.odds.toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.slipDivider} />

          <View style={styles.slipInfoRow}>
            <Text style={styles.slipLabel}>Kot Total</Text>
            <Text style={styles.slipValue}>{totalOdds.toFixed(2)}</Text>
          </View>

          <TextInput
            style={styles.stakeInput}
            placeholder="Montan (HTG)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={stake}
            onChangeText={setStake}
          />

          {stakeNum > 0 && (
            <View style={styles.slipInfoRow}>
              <Text style={styles.slipLabel}>Posibilite Genyen</Text>
              <Text style={styles.slipWin}>HTG {potentialWin.toFixed(2)}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.placeBetBtn} onPress={handlePlaceBet}>
            <Text style={styles.placeBetText}>Fè Paryaj</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: '#0D1520' },
  scroll:           { flex: 1 },

  // Header
  header:           { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle:      { fontSize: 22, fontWeight: '700', color: '#F5A623' },

  // Pills
  pillRow:          { flexGrow: 0 },
  pill:             { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#152035', borderWidth: 1, borderColor: '#1E3A5F', marginRight: 8 },
  pillActive:       { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  pillText:         { color: '#888', fontSize: 12, fontWeight: '600' },
  pillTextActive:   { color: '#0D1520' },

  // Match list
  matchList:        { paddingHorizontal: 16, paddingTop: 8 },

  matchCard:        { backgroundColor: '#152035', borderRadius: 12, borderWidth: 1, borderColor: '#1E3A5F', padding: 14, marginBottom: 12 },
  teamsRow:         { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  teamName:         { flex: 1, color: '#fff', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  vsBadge:          { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#1B3A6B', borderRadius: 8, marginHorizontal: 8 },
  vsText:           { color: '#F5A623', fontSize: 11, fontWeight: '700' },

  oddsRow:          { flexDirection: 'row', gap: 8 },
  oddsBtn:          { flex: 1, backgroundColor: '#0D1520', borderRadius: 8, borderWidth: 1, borderColor: '#1E3A5F', alignItems: 'center', paddingVertical: 10 },
  oddsBtnActive:    { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  oddsLabel:        { color: '#888', fontSize: 11, fontWeight: '600' },
  oddsValue:        { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 2 },
  oddsValueActive:  { color: '#0D1520' },

  // Skeleton
  skeletonCard:     { backgroundColor: '#152035', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#1E3A5F' },
  skeletonLine:     { height: 14, backgroundColor: '#1E3A5F', borderRadius: 7, width: '80%' },
  skeletonOddsRow:  { flexDirection: 'row', gap: 8, marginTop: 14 },
  skeletonOddsBtn:  { flex: 1, height: 44, backgroundColor: '#1E3A5F', borderRadius: 8 },

  // Empty
  emptyState:       { alignItems: 'center', paddingVertical: 40 },
  emptyText:        { color: '#888', fontSize: 15 },

  // Bet Slip
  betSlip:          { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#152035', borderTopWidth: 1, borderTopColor: '#F5A623', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 32 },
  betSlipTitle:     { color: '#F5A623', fontWeight: '700', fontSize: 15, marginBottom: 10 },

  slipRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  slipMatch:        { color: '#ccc', fontSize: 12, flex: 1, marginRight: 8 },
  slipPick:         { color: '#F5A623', fontSize: 12, fontWeight: '700' },
  slipDivider:      { height: 1, backgroundColor: '#1E3A5F', marginVertical: 10 },

  slipInfoRow:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  slipLabel:        { color: '#888', fontSize: 13 },
  slipValue:        { color: '#fff', fontSize: 13, fontWeight: '700' },
  slipWin:          { color: '#4CAF50', fontSize: 13, fontWeight: '700' },

  stakeInput:       { backgroundColor: '#0D1520', borderRadius: 10, borderWidth: 1, borderColor: '#1E3A5F', color: '#fff', paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 10 },

  placeBetBtn:      { backgroundColor: '#F5A623', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  placeBetText:     { color: '#0D1520', fontWeight: '800', fontSize: 16 },
});
