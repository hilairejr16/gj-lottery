import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, RefreshControl } from 'react-native';
import { supabase } from '../../src/lib/supabase';

const PAYMENT_LABELS: Record<string, string> = {
  moncash: 'MonCash', natcash: 'NatCash', credit_card: 'Carte / Card',
  zelle: 'Zelle', cashapp: 'CashApp', paypal: 'PayPal',
  venmo: 'Venmo', wise: 'Wise', remitly: 'Remitly', interac: 'Interac',
};

export default function WalletScreen() {
  const [wallet, setWallet]             = useState<any>(null);
  const [transactions, setTransactions]  = useState<any[]>([]);
  const [methods, setMethods]            = useState<any[]>([]);
  const [refreshing, setRefreshing]      = useState(false);
  const [tab, setTab]                    = useState<'history' | 'deposit' | 'withdraw'>('history');

  // Deposit form
  const [dMethod, setDMethod] = useState('');
  const [dAmount, setDAmount] = useState('');
  const [dRef, setDRef]       = useState('');

  // Withdraw form
  const [wMethod, setWMethod] = useState('');
  const [wAmount, setWAmount] = useState('');
  const [wDest, setWDest]     = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [w, txns, m] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', user.id).single(),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(15),
      supabase.from('payment_method_info').select('*').eq('is_active', true).order('sort_order'),
    ]);
    setWallet(w.data);
    setTransactions(txns.data || []);
    setMethods(m.data || []);
  }

  async function submitDeposit() {
    if (!dMethod || !dAmount) { Alert.alert('Erè', 'Chwazi metòd ak montan'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('deposit_requests').insert({
      user_id: user!.id, amount: parseFloat(dAmount),
      payment_method: dMethod, reference_number: dRef || null,
    });
    if (error) { Alert.alert('Erè', error.message); return; }
    Alert.alert('Siksè!', 'Demann depo soumèt. Admin ap verifye li.');
    setDMethod(''); setDAmount(''); setDRef(''); setTab('history');
    loadData();
  }

  async function submitWithdraw() {
    if (!wMethod || !wAmount || !wDest) { Alert.alert('Erè', 'Ranpli tout chan'); return; }
    if (wallet && parseFloat(wAmount) > wallet.balance) { Alert.alert('Erè', 'Balans ou pa ase'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('withdrawal_requests').insert({
      user_id: user!.id, amount: parseFloat(wAmount),
      payment_method: wMethod, destination: wDest,
    });
    if (error) { Alert.alert('Erè', error.message); return; }
    Alert.alert('Siksè!', 'Demann retrè soumèt. Admin ap trete li.');
    setWMethod(''); setWAmount(''); setWDest(''); setTab('history');
    loadData();
  }

  return (
    <View style={styles.container}>
      {/* Balance header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>Balans / Solde</Text>
        <Text style={styles.balance}>
          {wallet ? `${Number(wallet.balance).toLocaleString('fr-HT', { minimumFractionDigits: 2 })} HTG` : '—'}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.depositBtn]} onPress={() => setTab('deposit')}>
            <Text style={styles.depositBtnText}>+ Depoze</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.withdrawBtn]} onPress={() => setTab('withdraw')}>
            <Text style={styles.withdrawBtnText}>↑ Retire</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {([['history', 'Istwa'], ['deposit', 'Depoze'], ['withdraw', 'Retire']] as const).map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadData(); setRefreshing(false); }} tintColor="#F5A623" />}
      >
        {tab === 'history' && (
          transactions.length === 0
            ? <Text style={styles.empty}>Pa gen tranzaksyon</Text>
            : transactions.map((t: any) => (
              <View key={t.id} style={styles.txRow}>
                <View>
                  <Text style={styles.txType}>{t.type.replace(/_/g, ' ')}</Text>
                  <Text style={styles.txDate}>{new Date(t.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.txAmount, { color: t.amount > 0 ? '#16A34A' : '#DC2626' }]}>
                  {t.amount > 0 ? '+' : ''}{Number(t.amount).toLocaleString('fr-HT', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ))
        )}

        {tab === 'deposit' && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Chwazi Metòd Peman</Text>
            {methods.map((m: any) => (
              <TouchableOpacity key={m.method} style={[styles.methodBtn, dMethod === m.method && styles.methodBtnActive]} onPress={() => setDMethod(m.method)}>
                <Text style={[styles.methodBtnText, dMethod === m.method && styles.methodBtnTextActive]}>{m.display_name}</Text>
                {dMethod === m.method && <Text style={styles.methodInfo}>{m.account_info}</Text>}
                {dMethod === m.method && <Text style={styles.methodInst}>{m.instructions_ht}</Text>}
              </TouchableOpacity>
            ))}
            <TextInput style={styles.input} placeholder="Montan (HTG)" placeholderTextColor="#555" keyboardType="numeric" value={dAmount} onChangeText={setDAmount} />
            <TextInput style={styles.input} placeholder="Nimewo Referans (opsyonèl)" placeholderTextColor="#555" value={dRef} onChangeText={setDRef} />
            <TouchableOpacity style={styles.submitBtn} onPress={submitDeposit}>
              <Text style={styles.submitBtnText}>Soumèt Demann Depo</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'withdraw' && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Chwazi Metòd Peman</Text>
            {methods.map((m: any) => (
              <TouchableOpacity key={m.method} style={[styles.methodBtn, wMethod === m.method && styles.methodBtnActive]} onPress={() => setWMethod(m.method)}>
                <Text style={[styles.methodBtnText, wMethod === m.method && styles.methodBtnTextActive]}>{m.display_name}</Text>
              </TouchableOpacity>
            ))}
            <TextInput style={styles.input} placeholder="Montan (HTG)" placeholderTextColor="#555" keyboardType="numeric" value={wAmount} onChangeText={setWAmount} />
            <TextInput style={styles.input} placeholder="Nimewo / Kont Destinasyon" placeholderTextColor="#555" value={wDest} onChangeText={setWDest} />
            <TouchableOpacity style={styles.submitBtn} onPress={submitWithdraw}>
              <Text style={styles.submitBtnText}>Soumèt Demann Retrè</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#0D1520' },
  header:              { padding: 20, paddingTop: 56, backgroundColor: '#152035', borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  headerLabel:         { color: '#888', fontSize: 13 },
  balance:             { color: '#fff', fontSize: 36, fontWeight: '900', marginVertical: 4 },
  actions:             { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn:           { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  depositBtn:          { backgroundColor: '#F5A623' },
  depositBtnText:      { color: '#0D1520', fontWeight: '800', fontSize: 14 },
  withdrawBtn:         { backgroundColor: '#1E2D45', borderWidth: 1, borderColor: '#1E3A5F' },
  withdrawBtnText:     { color: '#fff', fontWeight: '700', fontSize: 14 },
  tabs:                { flexDirection: 'row', backgroundColor: '#152035', borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  tab:                 { flex: 1, padding: 14, alignItems: 'center' },
  tabActive:           { borderBottomWidth: 2, borderBottomColor: '#F5A623' },
  tabText:             { color: '#666', fontWeight: '600', fontSize: 13 },
  tabTextActive:       { color: '#F5A623' },
  content:             { flex: 1, padding: 16 },
  empty:               { color: '#555', textAlign: 'center', marginTop: 40 },
  txRow:               { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  txType:              { color: '#fff', fontWeight: '600', fontSize: 13, textTransform: 'capitalize' },
  txDate:              { color: '#555', fontSize: 11, marginTop: 2 },
  txAmount:            { fontWeight: '800', fontSize: 14 },
  form:                { paddingBottom: 40 },
  formTitle:           { color: '#fff', fontWeight: '800', fontSize: 16, marginBottom: 12 },
  methodBtn:           { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1E3A5F', backgroundColor: '#152035', marginBottom: 8 },
  methodBtnActive:     { borderColor: '#F5A623', backgroundColor: '#F5A62311' },
  methodBtnText:       { color: '#888', fontWeight: '600', fontSize: 14 },
  methodBtnTextActive: { color: '#fff' },
  methodInfo:          { color: '#F5A623', fontWeight: '700', fontSize: 13, marginTop: 4 },
  methodInst:          { color: '#666', fontSize: 11, marginTop: 2 },
  input:               { backgroundColor: '#152035', borderWidth: 1, borderColor: '#1E3A5F', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, marginTop: 12 },
  submitBtn:           { backgroundColor: '#F5A623', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  submitBtnText:       { color: '#0D1520', fontWeight: '800', fontSize: 15 },
});
