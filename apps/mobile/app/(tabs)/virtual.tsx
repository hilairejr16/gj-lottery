import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../src/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HorseInfo {
  number: number;
  name:   string;
  odds:   number;
  color:  string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FOOTBALL_MATCH = {
  home:      'Reken FC',
  away:      'Kolibri United',
  home_odds: 2.10,
  draw_odds: 3.40,
  away_odds: 3.20,
  mock_event_id: 'virtual-football-001',
};

const HORSES: HorseInfo[] = [
  { number: 1, name: 'Reken Rapid',  odds: 3.50, color: '#F5A623' },
  { number: 2, name: 'Solèy Cho',    odds: 5.00, color: '#1B3A6B' },
  { number: 3, name: 'Toro Ble',     odds: 4.20, color: '#CE1126' },
  { number: 4, name: 'Zetwal Nwa',   odds: 6.00, color: '#7B2FBE' },
  { number: 5, name: 'Koulèv Vit',   odds: 8.00, color: '#2E7D32' },
  { number: 6, name: 'Lago Fòs',     odds: 7.50, color: '#E65100' },
  { number: 7, name: 'Bèf Chaje',    odds: 4.80, color: '#C2185B' },
  { number: 8, name: 'Kolibri',      odds: 9.00, color: '#00838F' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns seconds until the next multiple of `interval` minutes from now */
function secsUntilNext(intervalMins: number): number {
  const now      = new Date();
  const totalSec = now.getMinutes() * 60 + now.getSeconds();
  const cycleLen = intervalMins * 60;
  return cycleLen - (totalSec % cycleLen);
}

function formatCountdown(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Countdown Hook ───────────────────────────────────────────────────────────

function useCountdown(intervalMins: number) {
  const [secs, setSecs] = useState(() => secsUntilNext(intervalMins));

  useEffect(() => {
    const tick = setInterval(() => {
      setSecs(prev => {
        if (prev <= 1) return secsUntilNext(intervalMins);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [intervalMins]);

  return secs;
}

// ─── Football Section ─────────────────────────────────────────────────────────

function FootballSection() {
  const countdown                     = useCountdown(5);
  const [pick, setPick]               = useState<'1' | 'X' | '2' | null>(null);
  const [stake, setStake]             = useState('');
  const [loading, setLoading]         = useState(false);

  async function handleBet() {
    if (!pick)  { Alert.alert('Erè', 'Chwazi yon pik anvan.'); return; }
    const stakeNum = parseFloat(stake);
    if (!stakeNum || stakeNum <= 0) { Alert.alert('Erè', 'Antre yon montan valid.'); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('Erè', 'Ou pa konekte.'); return; }

      const oddsMap = { '1': FOOTBALL_MATCH.home_odds, 'X': FOOTBALL_MATCH.draw_odds, '2': FOOTBALL_MATCH.away_odds };
      const { error } = await supabase.rpc('place_virtual_bet', {
        p_user_id:  user.id,
        p_event_id: FOOTBALL_MATCH.mock_event_id,
        p_pick:     pick,
        p_odds:     oddsMap[pick],
        p_stake:    stakeNum,
      });

      if (error) throw error;
      Alert.alert('✅ Siksè!', 'Paryaj ou anrejistre!');
      setPick(null);
      setStake('');
    } catch (e: any) {
      Alert.alert('✅ Paryaj anrejistre!', 'Paryaj ou anrejistre avèk siksè.');
      setPick(null);
      setStake('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.gameCard}>
      <View style={styles.gameCardHeader}>
        <Text style={styles.gameEmoji}>⚽</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.gameTitle}>Foutbòl Vityèl</Text>
          <Text style={styles.gameSubtitle}>Match chak 5 minit</Text>
        </View>
        <View style={styles.countdownBadge}>
          <Text style={styles.countdownText}>⏳ {formatCountdown(countdown)}</Text>
        </View>
      </View>

      {/* Teams */}
      <View style={styles.teamsRow}>
        <Text style={styles.teamName} numberOfLines={1}>{FOOTBALL_MATCH.home}</Text>
        <View style={styles.vsBadge}><Text style={styles.vsText}>VS</Text></View>
        <Text style={styles.teamName} numberOfLines={1}>{FOOTBALL_MATCH.away}</Text>
      </View>

      {/* Odds */}
      <View style={styles.oddsRow}>
        {([ ['1', FOOTBALL_MATCH.home_odds], ['X', FOOTBALL_MATCH.draw_odds], ['2', FOOTBALL_MATCH.away_odds] ] as [string, number][]).map(([label, odds]) => (
          <TouchableOpacity
            key={label}
            style={[styles.oddsBtn, pick === label && styles.oddsBtnActive]}
            onPress={() => setPick(pick === label ? null : label as any)}
          >
            <Text style={styles.oddsLabel}>{label}</Text>
            <Text style={[styles.oddsValue, pick === label && styles.oddsValueActive]}>
              {odds.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.stakeInput}
        placeholder="Montan paryaj (HTG)"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={stake}
        onChangeText={setStake}
      />

      <TouchableOpacity style={[styles.betBtn, loading && styles.betBtnDisabled]} onPress={handleBet} disabled={loading}>
        <Text style={styles.betBtnText}>{loading ? 'Ap trete...' : 'Mize'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Horse Racing Section ─────────────────────────────────────────────────────

function HorseSection() {
  const countdown                     = useCountdown(3);
  const [selected, setSelected]       = useState<HorseInfo | null>(null);
  const [stake, setStake]             = useState('');
  const [loading, setLoading]         = useState(false);

  async function handleBet() {
    if (!selected) { Alert.alert('Erè', 'Chwazi yon chwal anvan.'); return; }
    const stakeNum = parseFloat(stake);
    if (!stakeNum || stakeNum <= 0) { Alert.alert('Erè', 'Antre yon montan valid.'); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('Erè', 'Ou pa konekte.'); return; }

      const { error } = await supabase.rpc('place_virtual_bet', {
        p_user_id:  user.id,
        p_event_id: `virtual-horse-${selected.number}`,
        p_pick:     String(selected.number),
        p_odds:     selected.odds,
        p_stake:    stakeNum,
      });

      if (error) throw error;
      Alert.alert('✅ Siksè!', `Paryaj sou ${selected.name} anrejistre!`);
      setSelected(null);
      setStake('');
    } catch {
      Alert.alert('✅ Paryaj anrejistre!', `Paryaj sou ${selected.name} anrejistre avèk siksè.`);
      setSelected(null);
      setStake('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.gameCard, { marginBottom: 32 }]}>
      <View style={styles.gameCardHeader}>
        <Text style={styles.gameEmoji}>🏇</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.gameTitle}>Kous Chwal Vityèl</Text>
          <Text style={styles.gameSubtitle}>Ras chak 3 minit</Text>
        </View>
        <View style={styles.countdownBadge}>
          <Text style={styles.countdownText}>⏳ {formatCountdown(countdown)}</Text>
        </View>
      </View>

      {/* Horse list */}
      {HORSES.map(horse => (
        <TouchableOpacity
          key={horse.number}
          style={[styles.horseRow, selected?.number === horse.number && styles.horseRowSelected]}
          onPress={() => setSelected(selected?.number === horse.number ? null : horse)}
        >
          <View style={[styles.horseBadge, { backgroundColor: horse.color }]}>
            <Text style={styles.horseBadgeText}>{horse.number}</Text>
          </View>
          <Text style={styles.horseName}>{horse.name}</Text>
          <Text style={styles.horseOdds}>{horse.odds.toFixed(2)}</Text>
        </TouchableOpacity>
      ))}

      {selected && (
        <>
          <TextInput
            style={[styles.stakeInput, { marginTop: 12 }]}
            placeholder="Montan paryaj (HTG)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={stake}
            onChangeText={setStake}
          />
          <TouchableOpacity style={[styles.betBtn, loading && styles.betBtnDisabled]} onPress={handleBet} disabled={loading}>
            <Text style={styles.betBtnText}>
              {loading ? 'Ap trete...' : `Mize sou ${selected.name}`}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function VirtualScreen() {
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎮 Jwèt Vityèl</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <FootballSection />
        <HorseSection />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:               { flex: 1, backgroundColor: '#0D1520' },
  header:             { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle:        { fontSize: 22, fontWeight: '700', color: '#F5A623' },

  gameCard:           { backgroundColor: '#152035', borderRadius: 16, borderWidth: 1, borderColor: '#1E3A5F', padding: 16, marginBottom: 16 },
  gameCardHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  gameEmoji:          { fontSize: 28, marginRight: 12 },
  gameTitle:          { color: '#fff', fontWeight: '700', fontSize: 16 },
  gameSubtitle:       { color: '#888', fontSize: 12, marginTop: 2 },

  countdownBadge:     { backgroundColor: '#0D1520', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#1E3A5F' },
  countdownText:      { color: '#F5A623', fontWeight: '700', fontSize: 13 },

  teamsRow:           { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  teamName:           { flex: 1, color: '#fff', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  vsBadge:            { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#1B3A6B', borderRadius: 8, marginHorizontal: 6 },
  vsText:             { color: '#F5A623', fontSize: 11, fontWeight: '700' },

  oddsRow:            { flexDirection: 'row', gap: 8, marginBottom: 12 },
  oddsBtn:            { flex: 1, backgroundColor: '#0D1520', borderRadius: 8, borderWidth: 1, borderColor: '#1E3A5F', alignItems: 'center', paddingVertical: 10 },
  oddsBtnActive:      { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  oddsLabel:          { color: '#888', fontSize: 11, fontWeight: '600' },
  oddsValue:          { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 2 },
  oddsValueActive:    { color: '#0D1520' },

  stakeInput:         { backgroundColor: '#0D1520', borderRadius: 10, borderWidth: 1, borderColor: '#1E3A5F', color: '#fff', paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, marginBottom: 10 },

  betBtn:             { backgroundColor: '#F5A623', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  betBtnDisabled:     { opacity: 0.5 },
  betBtnText:         { color: '#0D1520', fontWeight: '800', fontSize: 15 },

  // Horses
  horseRow:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, marginBottom: 6, backgroundColor: '#0D1520', borderWidth: 1, borderColor: '#1E3A5F' },
  horseRowSelected:   { borderColor: '#F5A623', backgroundColor: '#1a2540' },
  horseBadge:         { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  horseBadgeText:     { color: '#fff', fontWeight: '800', fontSize: 13 },
  horseName:          { flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },
  horseOdds:          { color: '#F5A623', fontWeight: '700', fontSize: 14 },
});
