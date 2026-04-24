import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge from '@/components/ui/badge';
import { Users, ShieldCheck } from 'lucide-react';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      wallets(balance, currency)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black text-white">Itilizatè / Utilisateurs</h1>
        <span className="px-2.5 py-0.5 bg-brand-blue/20 text-blue-300 text-xs font-medium rounded-full">
          {users?.length ?? 0} total
        </span>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                {['Itilizatè', 'Imèl', 'Telefòn', 'Balans', 'Estati', 'Dat Enskri'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u: any) => (
                <tr key={u.id} className="border-b border-bg-border hover:bg-bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-brand-blue/30 rounded-full flex items-center justify-center text-xs font-bold text-brand-gold">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white flex items-center gap-1">
                          {u.username}
                          {u.is_admin && <ShieldCheck size={12} className="text-blue-400" />}
                        </p>
                        <p className="text-xs text-gray-500">{u.full_name || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">—</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.phone || '—'}</td>
                  <td className="px-4 py-3 font-bold text-brand-gold">
                    {u.wallets ? formatCurrency(u.wallets.balance) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.is_active ? 'approved' : 'rejected'}>
                      {u.is_active ? 'Aktif' : 'Dezaktive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
