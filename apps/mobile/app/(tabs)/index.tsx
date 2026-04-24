import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet]   = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [p, w] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('wallets').select('*').eq('user_id', user.id).single(),
    ]);
    setProfile(p.data);
    setWallet(w.data);
  }

  const quickActions = [
    { label: 'Espò',          emoji: '⚽', route: '/sports'  },
    { label: 'Vityèl',        emoji: '🎮', route: '/virtual' },
    { label: 'Lotri',         emoji: '🎟', route: '/lottery' },
    { label: 'Direk',         emoji: '📡', route: '/live'    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadData(); setRefreshing(false); }} tintColor="#F5A623" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjou 👋</Text>
          <Text style={styles.username}>{profile?.full_name || profile?.username || '...'}</Text>
        </View>
        <View style={styles.logo}>
          <Text style={styles.logoText}>GJ</Text>
        </View>
      </View>

      {/* Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balans / Solde</Text>
        <Text style={styles.balanceAmount}>
          {wallet ? `${Number(wallet.balance).toLocaleString('fr-HT', { minimumFractionDigits: 2 })} HTG` : '—'}
        </Text>
        <View style={styles.walletActions}>
          <TouchableOpacity style={styles.depositBtn} onPress={() => router.push('/wallet')}>
            <Text style={styles.depositBtnText}>+ Depoze</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.withdrawBtn} onPress={() => router.push('/wallet')}>
            <Text style={styles.withdrawBtnText}>↑ Retire</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Jwèt / Jeux</Text>
      <View style={styles.grid}>
        {quickActions.map(a => (
          <TouchableOpacity key={a.label} style={styles.gameCard} onPress={() => router.push(a.route as any)}>
            <Text style={styles.gameEmoji}>{a.emoji}</Text>
            <Text style={styles.gameLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Coming soon */}
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonTitle}>🚀 Byento / Bientôt</Text>
        <Text style={styles.comingSoonText}>Live scores, paryaj direk, ak plis ankò ap vini.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0D1520' },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56 },
  greeting:         { color: '#888', fontSize: 13 },
  username:         { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 2 },
  logo:             { width: 40, height: 40, backgroundColor: '#F5A623', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logoText:         { color: '#0D1520', fontWeight: '900', fontSize: 14 },
  balanceCard:      { margin: 16, padding: 20, backgroundColor: '#152035', borderRadius: 20, borderWidth: 1, borderColor: '#1B3A6B' },
  balanceLabel:     { color: '#888', fontSize: 13, marginBottom: 4 },
  balanceAmount:    { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 16 },
  walletActions:    { flexDirection: 'row', gap: 12 },
  depositBtn:       { flex: 1, backgroundColor: '#F5A623', borderRadius: 10, padding: 12, alignItems: 'center' },
  depositBtnText:   { color: '#0D1520', fontWeight: '800', fontSize: 14 },
  withdrawBtn:      { flex: 1, backgroundColor: '#1E2D45', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1E3A5F' },
  withdrawBtnText:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionTitle:     { color: '#fff', fontSize: 16, fontWeight: '800', marginHorizontal: 16, marginTop: 8, marginBottom: 12 },
  grid:             { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  gameCard:         { width: '47%', margin: '1.5%', backgroundColor: '#152035', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1E3A5F' },
  gameEmoji:        { fontSize: 32, marginBottom: 8 },
  gameLabel:        { color: '#fff', fontWeight: '700', fontSize: 14 },
  comingSoon:       { margin: 16, padding: 16, backgroundColor: '#1B3A6B22', borderRadius: 16, borderWidth: 1, borderColor: '#1B3A6B' },
  comingSoonTitle:  { color: '#F5A623', fontWeight: '800', fontSize: 14, marginBottom: 4 },
  comingSoonText:   { color: '#888', fontSize: 12 },
});
