import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { Users, ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [usersRes, depositsRes, withdrawalsRes, walletsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }).eq('is_admin', false),
    supabase.from('deposit_requests').select('id, status, amount'),
    supabase.from('withdrawal_requests').select('id, status, amount'),
    supabase.from('wallets').select('balance'),
  ]);

  const totalUsers     = usersRes.count ?? 0;
  const allDeposits    = depositsRes.data || [];
  const allWithdrawals = withdrawalsRes.data || [];
  const allWallets     = walletsRes.data || [];

  const pendingDeposits   = allDeposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawals = allWithdrawals.filter(w => w.status === 'pending').length;
  const totalBalance      = allWallets.reduce((sum, w) => sum + (w.balance || 0), 0);
  const approvedDeposits  = allDeposits.filter(d => d.status === 'approved').reduce((s, d) => s + d.amount, 0);

  const stats = [
    { label: 'Total Itilizatè',    value: totalUsers,                    icon: Users,         color: 'text-blue-400',    bg: 'bg-blue-500/10' },
    { label: 'Depo An Atant',      value: pendingDeposits,              icon: ArrowDownLeft,  color: 'text-warning',     bg: 'bg-warning/10' },
    { label: 'Retrè An Atant',     value: pendingWithdrawals,           icon: ArrowUpRight,   color: 'text-brand-red',   bg: 'bg-brand-red/10' },
    { label: 'Total Depo Apwouve', value: formatCurrency(approvedDeposits), icon: DollarSign, color: 'text-success',     bg: 'bg-success/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={s.color} />
              </div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {(pendingDeposits > 0 || pendingWithdrawals > 0) && (
        <div className="card p-5 border-warning/30 bg-warning/5">
          <p className="font-semibold text-warning mb-1">⚠️ Aksyon Ijan Obligatwa</p>
          <p className="text-sm text-gray-400">
            {pendingDeposits > 0 && `${pendingDeposits} depo an atant apwobasyon. `}
            {pendingWithdrawals > 0 && `${pendingWithdrawals} retrè an atant tretman.`}
          </p>
          <div className="flex gap-3 mt-3">
            {pendingDeposits > 0 && (
              <a href="/admin/deposits" className="text-sm text-brand-gold hover:underline">Jere Depo →</a>
            )}
            {pendingWithdrawals > 0 && (
              <a href="/admin/withdrawals" className="text-sm text-brand-gold hover:underline">Jere Retrè →</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
