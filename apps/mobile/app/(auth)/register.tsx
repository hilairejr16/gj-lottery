import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', username: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    if (!form.full_name || !form.username || !form.email || !form.password) {
      Alert.alert('Erè', 'Ranpli tout chan obligatwa yo');
      return;
    }
    if (form.password !== form.confirm) {
      Alert.alert('Erè', 'Modpas yo pa menm');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Erè', 'Modpas dwe gen omwen 8 karaktè');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name:      form.full_name,
          username:       form.username,
          phone:          form.phone || null,
          preferred_lang: 'ht',
        },
      },
    });
    setLoading(false);

    if (error) { Alert.alert('Erè', error.message); return; }
    Alert.alert('Siksè!', 'Kont ou kreye. Byenveni nan GJ Lottery!', [
      { text: 'OK', onPress: () => router.replace('/(tabs)') }
    ]);
  }

  const fields = [
    { key: 'full_name',  placeholder: 'Non Konplè / Nom complet *',      type: 'default' },
    { key: 'username',   placeholder: 'Non Itilizatè / Username *',        type: 'default' },
    { key: 'email',      placeholder: 'Imèl / E-mail *',                   type: 'email-address' },
    { key: 'phone',      placeholder: 'Telefòn / Téléphone (+509...)',      type: 'phone-pad' },
    { key: 'password',   placeholder: 'Modpas / Mot de passe *',           type: 'default', secure: true },
    { key: 'confirm',    placeholder: 'Konfime Modpas *',                   type: 'default', secure: true },
  ] as const;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Tounen / Retour</Text>
      </TouchableOpacity>

      <View style={styles.logo}>
        <Text style={styles.logoText}>GJ</Text>
      </View>
      <Text style={styles.title}>Kreye Kont</Text>
      <Text style={styles.subtitle}>Rejwenn GJ Lottery jodi a</Text>

      {fields.map(f => (
        <TextInput
          key={f.key}
          style={styles.input}
          placeholder={f.placeholder}
          placeholderTextColor="#555"
          value={form[f.key]}
          onChangeText={v => update(f.key, v)}
          keyboardType={f.type as any}
          autoCapitalize="none"
          secureTextEntry={'secure' in f && f.secure}
        />
      ))}

      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Ap kreye kont...' : 'Kreye Kont'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.link}>
        <Text style={styles.linkText}>Gen kont deja? <Text style={styles.linkAccent}>Konekte</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0D1520' },
  inner:       { padding: 24, paddingBottom: 48 },
  back:        { marginBottom: 24 },
  backText:    { color: '#888', fontSize: 14 },
  logo:        { width: 56, height: 56, backgroundColor: '#F5A623', borderRadius: 14, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 12 },
  logoText:    { color: '#0D1520', fontWeight: '900', fontSize: 20 },
  title:       { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  subtitle:    { color: '#888', fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  input:       { backgroundColor: '#152035', borderWidth: 1, borderColor: '#1E3A5F', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, marginBottom: 10 },
  btn:         { backgroundColor: '#F5A623', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText:     { color: '#0D1520', fontWeight: '800', fontSize: 16 },
  link:        { marginTop: 20, alignItems: 'center' },
  linkText:    { color: '#888', fontSize: 14 },
  linkAccent:  { color: '#F5A623', fontWeight: '700' },
});
