export const runtime = 'edge';

import { Crown, Star, Gift, BarChart3, Zap, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Bronze', icon: '🥉', xp: '0 – 999 XP', color: 'from-amber-900/40 to-amber-800/10',
    border: 'border-amber-700/40', textColor: 'text-amber-400',
    perks: ['Bonis Biyenveni 100% jiska 5,000 HTG', 'Cashback 2% chak semèn', 'Aksè ak Promo Espesyal'],
  },
  {
    name: 'Silver', icon: '🥈', xp: '1,000 – 9,999 XP', color: 'from-gray-700/40 to-gray-600/10',
    border: 'border-gray-500/40', textColor: 'text-gray-300',
    perks: ['Cashback 5% chak semèn', 'Retrè Rapid (priorite)', 'Bonis Mensyèl 500 HTG', 'Sipò Priorite'],
  },
  {
    name: 'Gold', icon: '🥇', xp: '10,000 – 49,999 XP', color: 'from-yellow-700/40 to-yellow-600/10',
    border: 'border-yellow-500/50', textColor: 'text-yellow-400',
    perks: ['Cashback 10% chak semèn', 'Manadjè VIP Pèsonèl', 'Limit Depo/Paryaj Ogmante', 'Evènman Eksklizif', 'Bonis Anivèsè'],
  },
  {
    name: 'Diamond', icon: '💎', xp: '50,000+ XP', color: 'from-cyan-700/40 to-cyan-600/10',
    border: 'border-cyan-400/50', textColor: 'text-cyan-400',
    perks: ['Cashback 15% chak semèn', 'Manadjè VIP Dedikase', 'Limit Pou Ou Sèlman', 'Evènman Elite ak Kado', 'Freebet Chak Semèn', 'Tretman Premye Klas'],
  },
];

const missions = [
  { icon: '⚽', title: 'Paryaje 5 Matchs Jodi a', xp: '+50 XP', progress: 60, desc: '3/5 fini' },
  { icon: '🎰', title: 'Achte 3 Tikè Bolèt Semèn sa a', xp: '+75 XP', progress: 33, desc: '1/3 fini' },
  { icon: '💰', title: 'Depoze 1,000 HTG oswa plis', xp: '+100 XP', progress: 0, desc: 'Pa kòmanse' },
  { icon: '🏆', title: 'Genyen 3 Paryaj Jodi a', xp: '+150 XP', progress: 100, desc: 'Konplete! ✓' },
];

const dailyRewards = [
  { day: 'Jou 1', reward: '100 HTG', claimed: true },
  { day: 'Jou 2', reward: '200 HTG', claimed: true },
  { day: 'Jou 3', reward: '300 HTG', claimed: false, today: true },
  { day: 'Jou 4', reward: '400 HTG', claimed: false },
  { day: 'Jou 5', reward: '500 HTG', claimed: false },
  { day: 'Jou 6', reward: '750 HTG', claimed: false },
  { day: 'Jou 7', reward: '1,500 HTG 🎁', claimed: false },
];

export default function VIPPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-1.5 mb-4">
          <Crown className="w-4 h-4 text-brand-gold" />
          <span className="text-brand-gold text-xs font-black uppercase tracking-wide">Pwogram VIP</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">
          VIP &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-300">Gamification</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Chak paryaj ou fè genyen ou XP. Monte nivo pou dekwoche plis avantaj, cashback, ak prèvilèj eksklizif.
        </p>
      </div>

      {/* Current Status Card */}
      <div className="p-6 bg-gradient-to-br from-brand-gold/10 to-amber-900/10 border border-brand-gold/30 rounded-2xl mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Nivo Aktyèl / Current Level</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🥉</span>
              <div>
                <p className="text-2xl font-black text-white">Bronze</p>
                <p className="text-xs text-gray-500">247 / 1,000 XP pou Silver</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Total XP</p>
            <p className="text-3xl font-black text-brand-gold">247</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-gold to-yellow-400 rounded-full" style={{ width: '24.7%' }} />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Bronze (0)</span>
            <span>Silver (1,000)</span>
          </div>
        </div>
      </div>

      {/* VIP Tiers */}
      <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
        <Star className="w-5 h-5 text-brand-gold" /> Nivo VIP Yo / VIP Tiers
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {tiers.map(t => (
          <div key={t.name}
            className={`p-5 bg-gradient-to-br ${t.color} border ${t.border} rounded-2xl`}>
            <div className="text-3xl mb-3">{t.icon}</div>
            <h3 className={`font-black text-lg ${t.textColor}`}>{t.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{t.xp}</p>
            <ul className="space-y-2">
              {t.perks.map(p => (
                <li key={p} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Daily Rewards */}
      <div className="mb-10">
        <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
          <Gift className="w-5 h-5 text-brand-gold" /> Rekonpans Chak Jou / Daily Rewards
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {dailyRewards.map((r) => (
            <div key={r.day}
              className={`p-3 rounded-xl text-center border transition-all ${
                r.claimed ? 'bg-green-900/20 border-green-700/30 opacity-60' :
                r.today   ? 'bg-brand-gold/10 border-brand-gold/50 ring-1 ring-brand-gold/30' :
                            'bg-[#111827] border-white/5'
              }`}>
              <p className="text-xs text-gray-500 mb-1">{r.day}</p>
              <p className={`text-xs font-bold ${r.today ? 'text-brand-gold' : r.claimed ? 'text-green-400' : 'text-white'}`}>
                {r.claimed ? '✓' : r.reward}
              </p>
              {r.today && (
                <button className="mt-2 w-full py-1 bg-brand-gold text-[#080C14] text-xs font-black rounded-lg hover:bg-yellow-400 transition-colors">
                  Reklame
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Missions */}
      <div className="mb-10">
        <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-gold" /> Misyon Jodi a / Today's Missions
        </h2>
        <div className="space-y-3">
          {missions.map(m => (
            <div key={m.title} className="p-4 bg-[#111827] border border-white/5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{m.title}</p>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </div>
                </div>
                <span className={`text-xs font-black px-3 py-1 rounded-full ${m.progress === 100 ? 'bg-green-900/30 text-green-400' : 'bg-brand-gold/10 text-brand-gold'}`}>
                  {m.xp}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${m.progress === 100 ? 'bg-green-500' : 'bg-brand-gold'}`}
                  style={{ width: `${m.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard teaser */}
      <div className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-2xl text-center">
        <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
        <h3 className="font-black text-white text-lg mb-2">🏆 Leaderboard Semèn sa a</h3>
        <p className="text-gray-400 text-sm mb-4">Pi gwo XP gagnan semèn sa a ka genyen jiska 50,000 HTG an priz!</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors text-sm">
          Wè Leaderboard <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
