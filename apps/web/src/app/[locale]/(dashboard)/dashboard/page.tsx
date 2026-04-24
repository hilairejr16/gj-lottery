import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge from '@/components/ui/badge';
import { Trophy, Zap, Ticket, Radio, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import type { Transaction, DepositStatus, WithdrawalStatus } from '@/types/database.types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [profileRes, walletRes, txnRes, depositRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('wallets').select('*').eq('user_id', user.id).single(),
    supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('deposit_requests').select('*').eq('user_id', user.id).eq('status', 'pending').limit(1),
  ]);

  const profile  = profileRes.data;
  const wallet   = walletRes.data;
  const txns     = txnRes.data || [];
  const hasPending = (depositRes.data || []).length > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-black text-white">
          Bonjou, <span className="text-brand-gold">{profile?.full_name || profile?.username}</span> 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">Bienveni tounen nan GJ Lottery</p>
      </div>

      {/* Wallet Card */}
      <div className="card p-6 bg-gradient-to-br from-brand-blue to-bg-card border-brand-blue/40">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Balans Pòtfèy / Solde Portefeuille</p>
            <p className="text-4xl font-black text-white">
              {formatCurrency(wallet?.balance ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{wallet?.currency || 'HTG'}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/wallet?action=deposit"
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-bg-base text-sm font-bold rounded-lg hover:bg-brand-gold-light transition-colors">
              <ArrowDownRight size={16} /> Depoze
            </Link>
            <Link href="/wallet?action=withdraw"
              className="flex items-center gap-1.5 px-4 py-2 bg-bg-muted border border-bg-border text-white text-sm font-medium rounded-lg hover:bg-bg-border transition-colors">
              <ArrowUpRight size={16} /> Retire
            </Link>
          </div>
        </div>

        {hasPending && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-xs text-warning">
              ⏳ Ou gen yon demann depo an atant. Admin ap verifye li.
            </p>
          </div>
        )}
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Trophy, label: 'Espò',          sub: 'Sports',         href: '/sports',  color: 'brand-gold' },
          { icon: Zap,    label: 'Vityèl',         sub: 'Virtual',        href: '/virtual', color: 'purple-400' },
          { icon: Ticket, label: 'Lotri',           sub: 'Lottery',        href: '/lottery', color: 'brand-red' },
          { icon: Radio,  label: 'Direk',           sub: 'Live Betting',   href: '/live',    color: 'green-400' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className="card p-4 hover:border-brand-gold/40 transition-all duration-200 group text-center">
              <Icon size={28} className={`text-${item.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
              <p className="font-bold text-white text-sm">{item.label}</p>
              <p className="text-xs text-gray-500">{item.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-gold" />
            Dènye Tranzaksyon / Dernières Transactions
          </h2>
          <Link href="/wallet" className="text-xs text-brand-gold hover:underline">
            Wè tout →
          </Link>
        </div>

        {txns.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">
            Pa gen tranzaksyon pou kounye a / Aucune transaction pour l'instant
          </p>
        ) : (
          <div className="space-y-3">
            {txns.map((txn: Transaction) => (
              <div key={txn.id} className="flex items-center justify-between py-2 border-b border-bg-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    txn.amount > 0 ? 'bg-success/20' : 'bg-danger/20'
                  }`}>
                    {txn.amount > 0
                      ? <ArrowDownRight size={14} className="text-success" />
                      : <ArrowUpRight size={14} className="text-danger" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white capitalize">
                      {txn.type.replace(/_/g, ' ')}
                    </p>
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
    </div>
  );
}
