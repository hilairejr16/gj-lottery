import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function ProfileScreen() {
  const router  = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => setProfile(data));
    });
  }, []);

  async function handleLogout() {
    Alert.alert('Dekonekte', 'Ou vle dekonekte?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Wi', style: 'destructive', onPress: async () => {
        await supabase.auth.signOut();
        router.replace('/(auth)/login');
      }},
    ]);
  }

  const rows = [
    { label: 'Non Itilizatè', value: profile?.username },
    { label: 'Non Konplè',    value: profile?.full_name || '—' },
    { label: 'Telefòn',       value: profile?.phone || '—' },
    { label: 'Lang',          value: profile?.preferred_lang === 'ht' ? 'Kreyòl' : profile?.preferred_lang === 'fr' ? 'Français' : 'English' },
    { label: 'Kont',          value: profile?.is_admin ? '🛡 Admin' : '👤 Itilizatè' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.username?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.username}>{profile?.username || '...'}</Text>
        <Text style={styles.name}>{profile?.full_name || ''}</Text>
      </View>

      <View style={styles.card}>
        {rows.map(r => (
          <View key={r.label} style={styles.row}>
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Text style={styles.rowValue}>{r.value || '—'}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>🚪 Dekonekte / Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#0D1520' },
  header:        { alignItems: 'center', paddingTop: 64, paddingBottom: 24, paddingHorizontal: 20 },
  avatar:        { width: 80, height: 80, backgroundColor: '#1B3A6B', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText:    { color: '#F5A623', fontSize: 32, fontWeight: '900' },
  username:      { color: '#fff', fontSize: 22, fontWeight: '900' },
  name:          { color: '#888', fontSize: 14, marginTop: 4 },
  card:          { margin: 16, backgroundColor: '#152035', borderRadius: 20, borderWidth: 1, borderColor: '#1E3A5F', overflow: 'hidden' },
  row:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  rowLabel:      { color: '#888', fontSize: 13 },
  rowValue:      { color: '#fff', fontSize: 13, fontWeight: '600' },
  logoutBtn:     { margin: 16, backgroundColor: '#CE112620', borderWidth: 1, borderColor: '#CE112640', borderRadius: 16, padding: 16, alignItems: 'center' },
  logoutBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },
});
