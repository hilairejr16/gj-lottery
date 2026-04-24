import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function LoginScreen() {
  const router  = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erè', 'Ranpli imèl ak modpas ou');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Erè Koneksyon', 'Imèl oswa modpas ou pa bon');
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>GJ</Text>
        </View>
        <Text style={styles.title}>GJ Lottery</Text>
        <Text style={styles.subtitle}>Konekte nan Kont Ou</Text>

        <TextInput
          style={styles.input}
          placeholder="Imèl / E-mail"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Modpas / Mot de passe"
          placeholderTextColor="#555"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Ap konekte...' : 'Konekte'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
          <Text style={styles.linkText}>Pa gen kont? <Text style={styles.linkAccent}>Enskri</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0D1520' },
  inner:       { flex: 1, justifyContent: 'center', padding: 24 },
  logo:        { width: 64, height: 64, backgroundColor: '#F5A623', borderRadius: 16, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  logoText:    { color: '#0D1520', fontWeight: '900', fontSize: 24 },
  title:       { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  subtitle:    { color: '#888', fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 32 },
  input:       { backgroundColor: '#152035', borderWidth: 1, borderColor: '#1E3A5F', borderRadius: 12, padding: 16, color: '#fff', fontSize: 15, marginBottom: 12 },
  btn:         { backgroundColor: '#F5A623', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  btnText:     { color: '#0D1520', fontWeight: '800', fontSize: 16 },
  link:        { marginTop: 20, alignItems: 'center' },
  linkText:    { color: '#888', fontSize: 14 },
  linkAccent:  { color: '#F5A623', fontWeight: '700' },
});
