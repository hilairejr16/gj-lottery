export const runtime = 'edge';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/layout/header';
import Link from 'next/link';
import { Users, ArrowDownLeft, ArrowUpRight, LayoutDashboard, Trophy, Dices } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile?.is_admin) redirect('/dashboard');

  const navItems = [
    { href: '/admin',             icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/deposits',    icon: ArrowDownLeft,   label: 'Depo / Dépôts' },
    { href: '/admin/withdrawals', icon: ArrowUpRight,    label: 'Retrè / Retraits' },
    { href: '/admin/users',       icon: Users,           label: 'Itilizatè / Utilisateurs' },
    { href: '/admin/matches',     icon: Trophy,          label: 'Match / Résultats' },
    { href: '/admin/lottery',     icon: Dices,           label: 'Bolet / Lotri' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="card p-3 space-y-1 sticky top-24">
            <p className="text-xs font-semibold text-gray-500 uppercase px-3 pb-2">Admin Panel</p>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-bg-muted rounded-lg transition-colors">
                  <Icon size={16} className="text-brand-gold" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-2 flex-wrap mb-4">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-300 hover:text-white card hover:border-brand-gold/40 transition-all">
                <Icon size={14} className="text-brand-gold" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
