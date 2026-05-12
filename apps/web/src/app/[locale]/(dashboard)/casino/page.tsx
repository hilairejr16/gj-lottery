

import Link from 'next/link';
import { Gamepad2, Star, Flame, ChevronRight, Lock } from 'lucide-react';

const games = [
  { emoji: '🎰', name: 'Slots',         subtitle: 'Machine à sous',  desc: '200+ titres. Megaways, Jackpots, Cluster Pays.',  tag: 'HOT',   tagColor: 'bg-red-500',    coming: false },
  { emoji: '🎡', name: 'Roulette',      subtitle: 'Woule',           desc: 'European, American, French Roulette HD.',         tag: 'LIVE',  tagColor: 'bg-green-500',  coming: false },
  { emoji: '🃏', name: 'Blackjack',     subtitle: 'Blakjak',         desc: 'Classic, Multi-hand, Perfect Pairs variants.',    tag: 'LIVE',  tagColor: 'bg-green-500',  coming: false },
  { emoji: '🀄', name: 'Baccarat',      subtitle: 'Bakaraw',         desc: 'Speed Baccarat, Dragon Tiger, Squeeze.',          tag: 'LIVE',  tagColor: 'bg-green-500',  coming: false },
  { emoji: '🚀', name: 'Crash',         subtitle: 'Kras',            desc: 'Bet before the multiplier crashes. Up to 1000x.', tag: 'NEW',   tagColor: 'bg-blue-500',   coming: false },
  { emoji: '🎲', name: 'Dice',          subtitle: 'Zo',              desc: 'Predict high or low. Fast & fair.',              tag: 'FAST',  tagColor: 'bg-purple-500', coming: false },
  { emoji: '🎴', name: 'Poker',         subtitle: 'Pokè',            desc: 'Caribbean Stud, 3-Card Poker, Texas Hold\'em.',   tag: 'SOON',  tagColor: 'bg-gray-500',   coming: true  },
  { emoji: '🎪', name: 'Live Dealer',   subtitle: 'Dealè Direk',     desc: 'Real tables, real dealers, streamed HD.',         tag: 'SOON',  tagColor: 'bg-gray-500',   coming: true  },
];

const providers = ['Evolution Gaming', 'Pragmatic Play', 'NetEnt', 'Microgaming', 'Play\'n GO', 'Hacksaw Gaming'];

export default function CasinoPage() {
  return (
    <div className="min-h-screen bg-[#080C14]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-[#0D1117] to-blue-900/20 border-b border-white/5 py-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.1),transparent_70%)]" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-xs font-bold uppercase tracking-wide">Casino Online</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Casino</span> G&amp;J
          </h1>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Slots, Roulette, Blackjack, Crash &amp; Live Dealer — tout jwèt kazino ou renmen yo, disponib 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-xl hover:shadow-xl hover:shadow-purple-500/30 transition-all">
              Jwèt Kounye a / Play Now →
            </Link>
            <div className="flex items-center justify-center gap-6 px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300">
              <span>🎰 200+ Games</span>
              <span>🔴 Live Dealer</span>
              <span>⚡ Instant Play</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Game Grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400" /> Tout Jwèt Yo / All Games
          </h2>
          <div className="flex gap-2">
            {['All', 'Slots', 'Live', 'Table', 'Crash'].map(f => (
              <button key={f}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${f === 'All' ? 'bg-brand-gold text-[#080C14]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {games.map(g => (
            <div key={g.name}
              className={`relative p-5 bg-[#111827] border border-white/5 rounded-2xl transition-all duration-200 ${g.coming ? 'opacity-60' : 'hover:border-purple-500/30 hover:-translate-y-0.5'}`}>
              <span className={`absolute top-4 right-4 text-xs font-black px-2 py-0.5 ${g.tagColor} text-white rounded-full`}>{g.tag}</span>
              <div className="text-4xl mb-4">{g.emoji}</div>
              <h3 className="font-black text-white">{g.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{g.subtitle}</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">{g.desc}</p>
              {g.coming ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Lock className="w-3.5 h-3.5" /> Pwochen / Coming Soon
                </div>
              ) : (
                <button className="text-xs font-bold text-purple-400 flex items-center gap-1 hover:text-purple-300">
                  Jwèt / Play <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Providers */}
        <div className="p-6 bg-[#111827] border border-white/5 rounded-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-brand-gold" /> Founisè Jwèt Nou / Our Game Providers
          </h3>
          <div className="flex flex-wrap gap-3">
            {providers.map(p => (
              <span key={p} className="px-4 py-2 bg-white/5 border border-white/5 rounded-lg text-xs text-gray-400 font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Responsible */}
        <div className="mt-6 text-center text-xs text-gray-700">
          🔞 18+ sèlman. Paryaj responsab. <Link href="/responsible-gambling" className="text-brand-gold hover:underline">Paryaj Responsab / Responsible Gambling</Link>
        </div>
      </div>
    </div>
  );
}
