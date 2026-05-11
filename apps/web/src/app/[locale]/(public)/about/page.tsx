export const runtime = 'edge';

import { Trophy, Globe, Users, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const stats = [
  { label: 'Active Players / Jwè Aktif', value: '10,000+' },
  { label: 'Daily Bets / Paryaj Chak Jou', value: '50,000+' },
  { label: 'Languages / Lang', value: '3' },
  { label: 'Payment Methods / Metòd Peman', value: '10+' },
];

const values = [
  { icon: Trophy,      title: 'Excellence',         desc: 'We deliver a world-class betting experience built for the Haitian community and beyond.' },
  { icon: ShieldCheck, title: 'Trust / Konfyans',   desc: 'Secure transactions, fair play, and transparent operations at every level.' },
  { icon: Globe,       title: 'Accessibility',       desc: 'Available in Haitian Creole, French, and English — on any device, anywhere.' },
  { icon: Users,       title: 'Community / Kominote',desc: 'Built for Haitians, by people who understand the culture and passion for sports.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-xl flex items-center justify-center font-black text-bg-base text-lg">GJ</div>
          <span className="text-3xl font-black"><span className="text-brand-gold">G&amp;J</span> Lottery</span>
        </div>
        <h1 className="text-4xl font-black mb-4">About Us / Sou Nou</h1>
        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
          G&amp;J Lottery is Haiti's premier sports betting, virtual games, and lottery platform — built to bring world-class entertainment to every Haitian, wherever they are.
        </p>
        <p className="text-gray-600 italic text-sm mt-2 max-w-2xl mx-auto">
          G&amp;J Lottery se platfòm premye kalite Ayiti pou paryaj espò, jwèt vityèl, ak lotri — konstwi pou pote divètisman mondyal bay tout Ayisyen, kèlkeswa kote yo ye.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {stats.map((s) => (
          <div key={s.label} className="p-5 bg-bg-card border border-bg-border rounded-xl text-center">
            <p className="text-3xl font-black text-brand-gold">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="mb-16 space-y-4 text-gray-300 leading-relaxed">
        <h2 className="text-2xl font-black text-white">Our Story / Istwa Nou</h2>
        <p>
          G&amp;J Lottery was founded with one mission: to create a safe, transparent, and exciting betting platform that Haitians can trust. Inspired by global leaders like FanDuel, Bet365, and Stake, we built our platform from the ground up with the Haitian market in mind — accepting HTG, supporting MonCash and NatCash, and operating in Haitian Creole.
        </p>
        <p className="text-gray-500 italic">
          G&amp;J Lottery te fonde ak yon sèl misyon: kreye yon platfòm paryaj san, transparan, epi eksite ke Ayisyen ka fè konfyans. Enspitre pa lidè mondyal tankou FanDuel, Bet365, ak Stake, nou bati platfòm nou an depi zewo ak mache Ayisyen an nan tèt nou — aksepte HTG, sipòte MonCash ak NatCash, epi opere nan Kreyòl Ayisyen.
        </p>
        <p>
          Today, we offer sports betting on major leagues worldwide, virtual football and horse racing, daily bolet lottery draws, and a secure multi-method wallet — all from one platform.
        </p>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-white mb-6">Our Values / Valè Nou</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 bg-bg-card border border-bg-border rounded-xl">
              <Icon className="w-6 h-6 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-8 bg-gradient-to-br from-brand-blue/30 to-bg-card border border-bg-border rounded-2xl">
        <h3 className="text-xl font-black text-white mb-2">Join the Community / Rantre nan Kominote a</h3>
        <p className="text-gray-400 text-sm mb-5">Be part of Haiti's #1 betting platform.</p>
        <Link href="/register" className="inline-block px-8 py-3 bg-brand-gold text-bg-base font-bold rounded-xl hover:bg-yellow-400 transition-colors">
          Create Account / Kreye Kont
        </Link>
      </div>
    </div>
  );
}
