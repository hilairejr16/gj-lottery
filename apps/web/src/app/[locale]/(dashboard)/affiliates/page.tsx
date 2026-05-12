

import { Users, TrendingUp, DollarSign, Share2, ChevronRight, Copy, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  { name: 'Agent',     referrals: '1–9',   commission: '15%',  revShare: '5%',  color: 'border-gray-700/50' },
  { name: 'Senior',   referrals: '10–49',  commission: '20%',  revShare: '8%',  color: 'border-brand-gold/30' },
  { name: 'Master',   referrals: '50–199', commission: '25%',  revShare: '10%', color: 'border-yellow-400/40' },
  { name: 'Elite',    referrals: '200+',   commission: '30%',  revShare: '15%', color: 'border-cyan-400/40' },
];

const stats = [
  { label: 'Referans Total / Total Referrals', value: '0', icon: Users },
  { label: 'Revni Total / Total Earned',        value: '0 HTG', icon: DollarSign },
  { label: 'Aktyèlman / This Month',            value: '0 HTG', icon: TrendingUp },
  { label: 'Konvèsyon / Conversion Rate',       value: '0%',    icon: BarChart3 },
];

const howItWorks = [
  { step: '01', title: 'Jwenn Lyen Ou / Get Your Link',   desc: 'Enskri epi resevwa yon lyen referans pèsonèl. / Register and receive your unique referral link.' },
  { step: '02', title: 'Pataje / Share It',               desc: 'Pataje sou Facebook, WhatsApp, Instagram, elatriye. / Share on Facebook, WhatsApp, Instagram, etc.' },
  { step: '03', title: 'Reklame Komision / Earn Commission', desc: 'Ou genyen komisyon sou chak depo ak pèt amis ou yo. / Earn commission on every deposit and loss from your referrals.' },
  { step: '04', title: 'Retire / Withdraw',               desc: 'Retire revni ou nenpò ki lè nan pòtfèy ou. / Withdraw your earnings anytime to your wallet.' },
];

export default function AffiliatesPage() {
  const referralLink = 'https://gjlottery.com/ref/YOUR_CODE';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-4">
          <Share2 className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-xs font-black uppercase tracking-wide">Pwogram Afilye</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">
          Touche Lajan / <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Earn Money</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Envite zanmi ou, fè yo enskri sou G&amp;J Lottery, epi touche komisyon sou tout aktivite yo pou tout lavi a.
          <span className="text-gray-600 block text-sm mt-1 italic">Invite friends, earn lifetime commissions on all their activity.</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5 bg-[#111827] border border-white/5 rounded-xl">
              <Icon className="w-5 h-5 text-green-400 mb-3" />
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Referral Link Box */}
      <div className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20 rounded-2xl mb-8">
        <h2 className="font-bold text-white mb-3 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-green-400" /> Lyen Referans Ou / Your Referral Link
        </h2>
        <div className="flex gap-3">
          <div className="flex-1 px-4 py-3 bg-[#080C14] border border-white/10 rounded-xl text-sm text-gray-400 font-mono truncate">
            {referralLink}
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 transition-colors text-sm shrink-0">
            <Copy className="w-4 h-4" /> Kopye
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          ✅ Ou pa gen kont toujou? <Link href="/register" className="text-green-400 hover:underline">Enskri Gratis →</Link>
        </p>
      </div>

      {/* Commission Tiers */}
      <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-400" /> Nivo Komisyon / Commission Tiers
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {tiers.map(t => (
          <div key={t.name} className={`p-5 bg-[#111827] border ${t.color} rounded-2xl`}>
            <h3 className="font-black text-white text-lg mb-1">{t.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{t.referrals} referans</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Komisyon Depo</span>
                <span className="font-black text-green-400">{t.commission}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rev Share (pèt)</span>
                <span className="font-black text-brand-gold">{t.revShare}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-brand-gold" /> Kijan sa Travay / How It Works
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {howItWorks.map(h => (
          <div key={h.step} className="p-5 bg-[#111827] border border-white/5 rounded-xl">
            <p className="text-xs font-black text-green-400/50 mb-2">{h.step}</p>
            <h3 className="font-bold text-white text-sm mb-2">{h.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{h.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ Teaser */}
      <div className="p-6 bg-[#111827] border border-white/5 rounded-2xl mb-6">
        <h3 className="font-bold text-white mb-4">FAQ Afilye / Affiliate FAQ</h3>
        <div className="space-y-3">
          {[
            { q: 'Ki lè komisyon mwen peye? / When are commissions paid?', a: 'Komisyon yo akredite otomatikman apre 7 jou hold period. / Commissions are credited automatically after a 7-day hold period.' },
            { q: 'Ki minimòm pou retire? / Minimum withdrawal?', a: '1,000 HTG minimòm pou afilye yo. / 1,000 HTG minimum for affiliates.' },
            { q: 'Eske gen yon limit sou referans? / Is there a referral limit?', a: 'Pa gen limit — plis ou envite, plis ou touche! / No limit — the more you invite, the more you earn!' },
          ].map(f => (
            <div key={f.q} className="text-sm">
              <p className="font-semibold text-white mb-1">{f.q}</p>
              <p className="text-gray-500">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/contact?subject=affiliate" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black rounded-xl hover:shadow-xl hover:shadow-green-500/20 transition-all">
          Kontakte nou pou info afilye <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
