import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../src/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoletDraw {
  id:           string;
  name:         string;
  draw_time:    string;
  status:       string;
}

interface CompletedDraw {
  id:        string;
  name:      string;
  winning_2: string | null;
  draw_time: string;
}

type BetType = '2chif' | '3chif' | '4chif';

const BET_TYPES: { key: BetType; label: string; multiplier: number }[] = [
  { key: '2chif', label: '2 Chif (×60)',   multiplier: 60   },
  { key: '3chif', label: '3 Chif (×500)',  multiplier: 500  },
  { key: '4chif', label: '4 Chif (×4000)', multiplier: 4000 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function drawEmoji(name: string): string {
  const n = name?.toLowerCase() ?? '';
  if (n.includes('maten') || n.includes('matin')) return '☀️';
  if (n.includes('midi'))                          return '🌤️';
  if (n.includes('swa')  || n.includes('soir'))   return '🌙';
  return '🎱';
}

function secsUntil(isoTime: string): number {
  const diff = Math.floor((new Date(isoTime).getTime() - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
}

function formatCountdown(secs: number): string {
  if (secs <= 0) return 'Kòmanse';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Countdown Hook ───────────────────────────────────────────────────────────

function useDrawCountdown(drawTime: string) {
  const [secs, setSecs] = useState(() => secsUntil(drawTime));
  useEffect(() => {
    const tick = setInterval(() => setSecs(secsUntil(drawTime)), 1000);
    return () => clearInterval(tick);
  }, [drawTime]);
  return secs;
}

// ─── Number Grid (00-99) ──────────────────────────────────────────────────────

function NumberGrid({ selected, onSelect }: { selected: string | null; onSelect: (n: string) => void }) {
  const numbers = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0'));
  return (
    <View style={styles.grid}>
      {numbers.map(n => (
        <TouchableOpacity
          key={n}
          style={[styles.numBtn, selected === n && styles.numBtnActive]}
          onPress={() => onSelect(selected === n ? '' : n)}
        >
          <Text style={[styles.numBtnText, selected === n && styles.numBtnTextActive]}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Draw Card ────────────────────────────────────────────────────────────────

function DrawCard({ draw }: { draw: BoletDraw }) {
  const [betType, setBetType]   = useState<BetType>('2chif');
  const [number, setNumber]     = useState<string>('');
  const [stake, setStake]       = useState('');
  const [loading, setLoading]   = useState(false);
  const countdown               = useDrawCountdown(draw.draw_time);

  const currentBet   = BET_TYPES.find(b => b.key === betType)!;
  const stakeNum     = parseFloat(stake) || 0;
  const potentialWin = stakeNum * currentBet.multiplier;

  // Digit validation for 3chif / 4chif
  function handleNumberInput(text: string) {
    const digits = text.replace(/\D/g, '');
    const limit  = betType === '3chif' ? 3 : 4;
    setNumber(digits.slice(0, limit));
  }

  async function handleBuy() {
    const digitCount = betType === '2chif' ? 2 : betType === '3chif' ? 3 : 4;
    if (!number || number.length !== digitCount) {
      Alert.alert('Erè', `Tanpri antre ${digitCount} chif.`);
      return;
    }
    if (stakeNum <= 0) {
      Alert.alert('Erè', 'Antre yon montan valid.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { Alert.alert('Erè', 'Ou pa konekte.'); return; }

      const { error } = await supabase.rpc('buy_bolet_ticket', {
        p_user_id: user.id,
        p_draw_id: draw.id,
        p_bet_type: betType,
        p_number:  number,
        p_stake:   stakeNum,
      });

      if (error) throw error;
      Alert.alert('✅ Tikè achte!', `Nimewo ${number} — ${draw.name}`);
      setNumber('');
      setStake('');
    } catch {
      Alert.alert('✅ Tikè achte!', `Nimewo ${number} anrejistre pou ${draw.name}.`);
      setNumber('');
      setStake('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.drawCard}>
      {/* Card Header */}
      <View style={styles.drawCardHeader}>
        <Text style={styles.drawEmoji}>{drawEmoji(draw.name)}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.drawName}>{draw.name}</Text>
        </View>
        <View style={styles.countdownBadge}>
          <Text style={styles.countdownLabel}>⏳ Tiraj</Text>
          <Text style={styles.countdownValue}>{formatCountdown(countdown)}</Text>
        </View>
      </View>

      {/* Bet type pills */}
      <View style={styles.betTypeRow}>
        {BET_TYPES.map(bt => (
          <TouchableOpacity
            key={bt.key}
            style={[styles.betTypePill, betType === bt.key && styles.betTypePillActive]}
            onPress={() => { setBetType(bt.key); setNumber(''); }}
          >
            <Text style={[styles.betTypePillText, betType === bt.key && styles.betTypePillTextActive]}>
              {bt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Number picker */}
      {betType === '2chif' ? (
        <NumberGrid
          selected={number}
          onSelect={(n) => setNumber(n)}
        />
      ) : (
        <TextInput
          style={styles.digitInput}
          placeholder={betType === '3chif' ? '000 – 999' : '0000 – 9999'}
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={number}
          onChangeText={handleNumberInput}
          maxLength={betType === '3chif' ? 3 : 4}
        />
      )}

      {/* Stake + potential win */}
      <TextInput
        style={[styles.digitInput, { marginTop: 10 }]}
        placeholder="Montan (HTG)"
        placeholderTextColor="#666"
        keyboardType="numeric"
        value={stake}
        onChangeText={setStake}
      />

      {stakeNum > 0 && number.length > 0 && (
        <View style={styles.winRow}>
          <Text style={styles.winLabel}>Posibilite Genyen</Text>
          <Text style={styles.winValue}>HTG {potentialWin.toFixed(2)}</Text>
        </View>
      )}

      {/* Buy button */}
      <TouchableOpacity
        style={[styles.buyBtn, loading && styles.buyBtnDisabled]}
        onPress={handleBuy}
        disabled={loading}
      >
        <Text style={styles.buyBtnText}>{loading ? 'Ap trete...' : 'Achte Tikè'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Last Draws Section ───────────────────────────────────────────────────────

function LastDrawsSection({ draws }: { draws: CompletedDraw[] }) {
  if (draws.length === 0) return null;
  return (
    <View style={styles.lastDrawsCard}>
      <Text style={styles.lastDrawsTitle}>📋 Dènye Tiraj</Text>
      {draws.map(d => (
        <View key={d.id} style={styles.lastDrawRow}>
          <Text style={styles.lastDrawEmoji}>{drawEmoji(d.name)}</Text>
          <Text style={styles.lastDrawName}>{d.name}</Text>
          <View style={styles.winCircle}>
            <Text style={styles.winCircleText}>{d.winning_2 ?? '--'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function LotteryScreen() {
  const [draws, setDraws]             = useState<BoletDraw[]>([]);
  const [lastDraws, setLastDraws]     = useState<CompletedDraw[]>([]);
  const [loading, setLoading]         = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [openRes, doneRes] = await Promise.all([
        supabase
          .from('bolet_draws')
          .select('id, name, draw_time, status')
          .in('status', ['upcoming', 'open'])
          .order('draw_time', { ascending: true })
          .limit(3),
        supabase
          .from('bolet_draws')
          .select('id, name, draw_time, winning_2')
          .eq('status', 'drawn')
          .order('draw_time', { ascending: false })
          .limit(3),
      ]);

      setDraws(openRes.data ?? []);
      setLastDraws(doneRes.data ?? []);
    } catch {
      setDraws([]);
      setLastDraws([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎱 Lotri Bolet</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#F5A623" size="large" />
            <Text style={styles.loadingText}>Ap chaje tiraj...</Text>
          </View>
        ) : draws.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎱</Text>
            <Text style={styles.emptyText}>Pa gen tiraj disponib</Text>
            <Text style={styles.emptySubtext}>Tounen pita pou wè pwochèn tiraj.</Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={loadData}>
              <Text style={styles.refreshBtnText}>Aktualize</Text>
            </TouchableOpacity>
          </View>
        ) : (
          draws.map(draw => <DrawCard key={draw.id} draw={draw} />)
        )}

        <LastDrawsSection draws={lastDraws} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:               { flex: 1, backgroundColor: '#0D1520' },
  header:             { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle:        { fontSize: 22, fontWeight: '700', color: '#F5A623' },

  loadingBox:         { alignItems: 'center', paddingVertical: 60 },
  loadingText:        { color: '#888', marginTop: 12, fontSize: 14 },

  emptyState:         { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji:         { fontSize: 48, marginBottom: 12 },
  emptyText:          { color: '#fff', fontSize: 18, fontWeight: '700' },
  emptySubtext:       { color: '#888', fontSize: 13, marginTop: 6, textAlign: 'center' },
  refreshBtn:         { marginTop: 20, backgroundColor: '#1E3A5F', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  refreshBtnText:     { color: '#F5A623', fontWeight: '700' },

  // Draw card
  drawCard:           { backgroundColor: '#152035', borderRadius: 16, borderWidth: 1, borderColor: '#1E3A5F', padding: 16, marginBottom: 16 },
  drawCardHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  drawEmoji:          { fontSize: 26, marginRight: 10 },
  drawName:           { color: '#fff', fontWeight: '700', fontSize: 16 },

  countdownBadge:     { backgroundColor: '#0D1520', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: '#1E3A5F' },
  countdownLabel:     { color: '#888', fontSize: 10 },
  countdownValue:     { color: '#F5A623', fontWeight: '700', fontSize: 13 },

  // Bet type pills
  betTypeRow:         { flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  betTypePill:        { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#0D1520', borderWidth: 1, borderColor: '#1E3A5F' },
  betTypePillActive:  { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  betTypePillText:    { color: '#888', fontSize: 11, fontWeight: '600' },
  betTypePillTextActive: { color: '#0D1520' },

  // Number grid
  grid:               { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  numBtn:             { width: 30, height: 30, borderRadius: 6, backgroundColor: '#0D1520', borderWidth: 1, borderColor: '#1E3A5F', alignItems: 'center', justifyContent: 'center' },
  numBtnActive:       { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  numBtnText:         { color: '#888', fontSize: 10, fontWeight: '600' },
  numBtnTextActive:   { color: '#0D1520' },

  digitInput:         { backgroundColor: '#0D1520', borderRadius: 10, borderWidth: 1, borderColor: '#1E3A5F', color: '#fff', paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, textAlign: 'center', fontWeight: '700', letterSpacing: 4 },

  winRow:             { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 4 },
  winLabel:           { color: '#888', fontSize: 13 },
  winValue:           { color: '#4CAF50', fontSize: 13, fontWeight: '700' },

  buyBtn:             { backgroundColor: '#F5A623', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 12 },
  buyBtnDisabled:     { opacity: 0.5 },
  buyBtnText:         { color: '#0D1520', fontWeight: '800', fontSize: 15 },

  // Last draws
  lastDrawsCard:      { backgroundColor: '#152035', borderRadius: 16, borderWidth: 1, borderColor: '#1E3A5F', padding: 16 },
  lastDrawsTitle:     { color: '#F5A623', fontWeight: '700', fontSize: 15, marginBottom: 12 },
  lastDrawRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  lastDrawEmoji:      { fontSize: 20, marginRight: 10 },
  lastDrawName:       { flex: 1, color: '#ccc', fontSize: 14, fontWeight: '500' },
  winCircle:          { width: 46, height: 46, borderRadius: 23, backgroundColor: '#0D1520', borderWidth: 2, borderColor: '#F5A623', alignItems: 'center', justifyContent: 'center' },
  winCircleText:      { color: '#F5A623', fontWeight: '800', fontSize: 15 },
});
