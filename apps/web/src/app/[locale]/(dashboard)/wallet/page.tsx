'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, PAYMENT_METHOD_LABELS } from '@/lib/utils';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import type { Wallet, Transaction, DepositRequest, WithdrawalRequest, PaymentMethodInfo } from '@/types/database.types';
import { ArrowDownRight, ArrowUpRight, Wallet as WalletIcon, Copy, CreditCard, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

function WalletContent() {
  const t = useTranslations('wallet');
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [wallet, setWallet]             = useState<Wallet | null>(null);
  const [transactions, setTransactions]  = useState<Transaction[]>([]);
  const [deposits, setDeposits]          = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals]    = useState<WithdrawalRequest[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo[]>([]);
  const [loading, setLoading]            = useState(true);

  const [depositOpen, setDepositOpen]   = useState(false);
  const [withdrawOpen, setWithrawOpen]  = useState(false);
  const [cardOpen, setCardOpen]         = useState(false);
  const [cardAmount, setCardAmount]     = useState('');
  const [cardLoading, setCardLoading]   = useState(false);

  // Deposit form state
  const [dMethod, setDMethod]           = useState('');
  const [dAmount, setDAmount]           = useState('');
  const [dRef, setDRef]                 = useState('');
  const [dNotes, setDNotes]             = useState('');
  const [dSubmitting, setDSubmitting]   = useState(false);

  // Withdraw form state
  const [wMethod, setWMethod]           = useState('');
  const [wAmount, setWAmount]           = useState('');
  const [wDest, setWDest]               = useState('');
  const [wNotes, setWNotes]             = useState('');
  const [wSubmitting, setWSubmitting]   = useState(false);

  const selectedDepositMethod = paymentMethods.find(m => m.method === dMethod);
  const selectedWithdrawMethod = paymentMethods.find(m => m.method === wMethod);

  useEffect(() => {
    loadData();
    if (searchParams.get('action') === 'deposit')  setDepositOpen(true);
    if (searchParams.get('action') === 'withdraw') setWithrawOpen(true);
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [w, txns, deps, withs, methods] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', user.id).single(),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('deposit_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('withdrawal_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('payment_method_info').select('*').eq('is_active', true).order('sort_order'),
    ]);

    setWallet(w.data);
    setTransactions(txns.data || []);
    setDeposits(deps.data || []);
    setWithdrawals(withs.data || []);
    setPaymentMethods(methods.data || []);
    setLoading(false);
  }

  async function submitDeposit() {
    if (!dMethod || !dAmount || parseFloat(dAmount) <= 0) {
      toast.error('Ranpli tout chan obligatwa yo');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setDSubmitting(true);
    const { error } = await supabase.from('deposit_requests').insert({
      user_id: user.id,
      amount: parseFloat(dAmount),
      payment_method: dMethod,
      reference_number: dRef || null,
      user_notes: dNotes || null,
    });

    setDSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t('deposit_modal.success'));
    setDepositOpen(false);
    setDMethod(''); setDAmount(''); setDRef(''); setDNotes('');
    loadData();
  }

  async function startCardDeposit() {
    const amount = parseFloat(cardAmount);
    if (!amount || amount < 100) { toast.error('Montan minimòm 100 HTG'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCardLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amountHTG: amount }),
      });
      const { url, error } = await res.json();
      if (error || !url) throw new Error(error || 'Failed to create checkout');
      window.location.href = url;
    } catch (e: any) {
      toast.error(e.message || 'Erè Stripe');
      setCardLoading(false);
    }
  }

  async function submitWithdraw() {
    const amount = parseFloat(wAmount);
    if (!wMethod || !wDest || !amount || amount <= 0) {
      toast.error('Ranpli tout chan obligatwa yo');
      return;
    }
    if (wallet && amount > wallet.balance) {
      toast.error(t('withdraw_modal.insufficient'));
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setWSubmitting(true);
    const { error } = await supabase.from('withdrawal_requests').insert({
      user_id: user.id,
      amount,
      payment_method: wMethod,
      destination: wDest,
      user_notes: wNotes || null,
    });

    setWSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t('withdraw_modal.success'));
    setWithrawOpen(false);
    setWMethod(''); setWAmount(''); setWDest(''); setWNotes('');
    loadData();
  }

  if (loading) return <div className="text-center py-20 text-gray-400">{t('...')  || 'Chajman...'}</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-black text-white">{t('title')}</h1>

      {/* Balance card */}
      <div className="card p-6 bg-gradient-to-br from-brand-blue to-bg-card border-brand-blue/40">
        <p className="text-sm text-gray-400 mb-1">{t('balance')}</p>
        <p className="text-5xl font-black text-white mb-4">{formatCurrency(wallet?.balance ?? 0)}</p>
        <div className="flex gap-3">
          <Button onClick={() => setDepositOpen(true)} className="flex items-center gap-2">
            <ArrowDownRight size={16} /> {t('deposit')}
          </Button>
          <Button variant="secondary" onClick={() => setWithrawOpen(true)} className="flex items-center gap-2">
            <ArrowUpRight size={16} /> {t('withdraw')}
          </Button>
          <button onClick={() => setCardOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-bg-border text-gray-300 hover:text-white hover:border-brand-gold/40 rounded-xl transition-all">
            <CreditCard size={16} /> Kat Kredi
          </button>
        </div>
      </div>

      {/* Pending deposits/withdrawals */}
      {deposits.filter(d => d.status === 'pending').length > 0 && (
        <div className="card p-4 border-warning/30 bg-warning/5">
          <p className="text-sm font-semibold text-warning mb-2">⏳ Demann Depo An Atant</p>
          {deposits.filter(d => d.status === 'pending').map(d => (
            <div key={d.id} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-300">{PAYMENT_METHOD_LABELS[d.payment_method]}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">{formatCurrency(d.amount)}</span>
                <Badge variant="pending">{t('status.pending')}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction history */}
      <div className="card p-6">
        <h2 className="font-bold text-white mb-5">{t('history')}</h2>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">{t('no_transactions')}</p>
        ) : (
          <div className="space-y-1">
            {transactions.map((txn: Transaction) => (
              <div key={txn.id} className="flex items-center justify-between py-3 border-b border-bg-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${txn.amount > 0 ? 'bg-success/20' : 'bg-danger/20'}`}>
                    {txn.amount > 0 ? <ArrowDownRight size={16} className="text-success" /> : <ArrowUpRight size={16} className="text-danger" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{txn.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{formatDate(txn.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${txn.amount > 0 ? 'text-success' : 'text-danger'}`}>
                    {txn.amount > 0 ? '+' : ''}{formatCurrency(txn.amount)}
                  </p>
                  <p className="text-xs text-gray-500">{formatCurrency(txn.balance_after)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── DEPOSIT MODAL ── */}
      <Modal open={depositOpen} onClose={() => setDepositOpen(false)} title={t('deposit_modal.title')} size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">{t('deposit_modal.select_method')}</label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map(m => (
                <button key={m.method}
                  onClick={() => setDMethod(m.method)}
                  className={`p-3 rounded-xl border text-left text-sm transition-all ${
                    dMethod === m.method
                      ? 'border-brand-gold bg-brand-gold/10 text-white'
                      : 'border-bg-border bg-bg-muted text-gray-400 hover:border-brand-gold/40'
                  }`}>
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          {selectedDepositMethod && (
            <div className="p-4 bg-bg-muted border border-bg-border rounded-xl space-y-2">
              <p className="text-xs font-semibold text-brand-gold uppercase">{t('deposit_modal.account_info')}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">{selectedDepositMethod.account_info}</p>
                <button onClick={() => { navigator.clipboard.writeText(selectedDepositMethod.account_info); toast.success('Kopye!'); }}
                  className="text-gray-400 hover:text-brand-gold transition-colors">
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-400">{selectedDepositMethod.instructions_ht}</p>
              <p className="text-xs text-gray-600">
                Min: {formatCurrency(selectedDepositMethod.min_deposit)} — Max: {formatCurrency(selectedDepositMethod.max_deposit)}
              </p>
            </div>
          )}

          <Input label={t('deposit_modal.amount')} type="number" min="0" step="0.01" placeholder="5000"
            value={dAmount} onChange={e => setDAmount(e.target.value)} />
          <Input label={t('deposit_modal.reference')} type="text" placeholder="REF-XXXXXXXX"
            hint={t('deposit_modal.reference_help')} value={dRef} onChange={e => setDRef(e.target.value)} />
          <Input label={t('deposit_modal.notes')} type="text" placeholder="..."
            value={dNotes} onChange={e => setDNotes(e.target.value)} />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDepositOpen(false)}>Anile</Button>
            <Button className="flex-1" loading={dSubmitting} onClick={submitDeposit}>
              {t('deposit_modal.submit')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── CARD DEPOSIT MODAL ── */}
      <Modal open={cardOpen} onClose={() => setCardOpen(false)} title="Depo ak Kat Kredi / Carte de Crédit">
        <div className="space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-300">
            <p className="font-semibold mb-1">💳 Pèman Sécurisé via Stripe</p>
            <p className="text-blue-400 text-xs">Ou ap peye an USD. 1 USD ≈ 130 HTG. Visa, Mastercard, Amex aksepte.</p>
          </div>
          <div>
            <label className="label">Montan an HTG</label>
            <input type="number" min="100" step="100" placeholder="5000"
              value={cardAmount} onChange={e => setCardAmount(e.target.value)}
              className="input-field" />
            {cardAmount && parseFloat(cardAmount) >= 100 && (
              <p className="text-xs text-gray-400 mt-1">
                ≈ ${(parseFloat(cardAmount) / 130).toFixed(2)} USD • Converted by Stripe
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setCardOpen(false)}
              className="flex-1 px-4 py-3 border border-bg-border text-gray-400 rounded-xl hover:text-white transition-colors">
              Anile
            </button>
            <button onClick={startCardDeposit} disabled={cardLoading || !cardAmount}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-gold text-bg-base font-bold rounded-xl hover:bg-brand-gold-light transition-all disabled:opacity-50">
              {cardLoading ? 'Ap chaje...' : <><ExternalLink size={14} /> Peye ak Stripe</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── WITHDRAW MODAL ── */}
      <Modal open={withdrawOpen} onClose={() => setWithrawOpen(false)} title={t('withdraw_modal.title')} size="lg">
        <div className="space-y-4">
          <div className="p-3 bg-bg-muted border border-bg-border rounded-xl">
            <p className="text-xs text-gray-400">Balans Disponib</p>
            <p className="text-xl font-black text-white">{formatCurrency(wallet?.balance ?? 0)}</p>
          </div>

          <div>
            <label className="label">{t('withdraw_modal.select_method')}</label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map(m => (
                <button key={m.method}
                  onClick={() => setWMethod(m.method)}
                  className={`p-3 rounded-xl border text-left text-sm transition-all ${
                    wMethod === m.method
                      ? 'border-brand-gold bg-brand-gold/10 text-white'
                      : 'border-bg-border bg-bg-muted text-gray-400 hover:border-brand-gold/40'
                  }`}>
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          <Input label={t('withdraw_modal.amount')} type="number" min="0" step="0.01"
            placeholder={selectedWithdrawMethod ? `Min: ${selectedWithdrawMethod.min_withdrawal}` : '5000'}
            value={wAmount} onChange={e => setWAmount(e.target.value)} />
          <Input label={t('withdraw_modal.destination')} type="text"
            placeholder="+509 XXXX XXXX / you@example.com"
            hint={t('withdraw_modal.destination_help')}
            value={wDest} onChange={e => setWDest(e.target.value)} />
          <Input label={t('withdraw_modal.notes')} type="text" placeholder="..."
            value={wNotes} onChange={e => setWNotes(e.target.value)} />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setWithrawOpen(false)}>Anile</Button>
            <Button className="flex-1" loading={wSubmitting} onClick={submitWithdraw}>
              {t('withdraw_modal.submit')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Chajman...</div>}>
      <WalletContent />
    </Suspense>
  );
}
