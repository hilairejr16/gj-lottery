export const runtime = 'edge';

import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { createClient } from '@/lib/supabase/server';
import {
  Trophy, Zap, Ticket, Wallet, Star, TrendingUp,
  Shield, Clock, Users, ChevronRight, Flame,
  Gamepad2, Gift, Crown, BarChart3, Smartphone,
} from 'lucide-react';

export default async function HomePage() {
  let profile = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = data;
    }
  } catch {
    // Supabase not configured — render page as logged-out guest
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#080C14]">
      <Header profile={profile} />
      <main className="flex-1">
        <HeroSection loggedIn={!!user} />
        <LiveOddsTickerSection />
        <ProductsSection />
        <FeaturedMatchesSection />
        <VIPSection />
        <HowItWorksSection />
        <PaymentMethodsSection />
        <AppDownloadSection />
        <TrustSection />
      </main>
      <Footer />
    </div>
  );
}

/* ─── HERO ─────────────────────────────────────────────── */
function HeroSection({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D1520] via-[#080C14] to-[#0A0510]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,166,35,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(27,58,107,0.25),transparent_60%)]" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Floating orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-brand-gold/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative max-w-7xl mx-auto px-4 py-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-bold tracking-wide uppercase">🔴 Live Betting Aktif / Active</span>
          </div>

          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-[1.05] text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-300">G&amp;J</span>{' '}
            Lottery
            <br />
            <span className="text-2xl sm:text-3xl font-semibold text-gray-400 leading-normal">
              Pi Gwo Platfòm Paryaj Ayiti 🇭🇹
            </span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg">
            Sports betting, virtual games, bolet lottery &amp; casino — anba yon sèl platfòm.
            <span className="text-brand-gold"> Depoze ak MonCash, Stripe, Zelle ak plis.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            {loggedIn ? (
              <Link href="/dashboard"
                className="group px-8 py-4 bg-gradient-to-r from-brand-gold to-yellow-500 text-[#080C14] font-black rounded-xl text-lg hover:shadow-xl hover:shadow-brand-gold/30 transition-all duration-300 flex items-center justify-center gap-2">
                Jwèt Kounye a <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/register"
                  className="group px-8 py-4 bg-gradient-to-r from-brand-gold to-yellow-500 text-[#080C14] font-black rounded-xl text-lg hover:shadow-xl hover:shadow-brand-gold/30 transition-all duration-300 flex items-center justify-center gap-2">
                  Kreye Kont Gratis <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login"
                  className="px-8 py-4 bg-white/5 backdrop-blur border border-white/10 text-white font-semibold rounded-xl text-lg hover:bg-white/10 transition-all duration-300 text-center">
                  Konekte / Login
                </Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 pt-6 border-t border-white/5">
            {[
              { value: '10K+', label: 'Jwè Aktif' },
              { value: '500+', label: 'Matchs/Jou' },
              { value: 'HTG', label: 'Monnaie' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-black text-brand-gold">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Live Match Card Preview */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-4 bg-brand-gold/10 rounded-3xl blur-xl" />

            <div className="relative bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wide">En Direk / Live</span>
                </div>
                <span className="text-xs text-gray-500">UEFA Champions League</span>
              </div>

              {/* Match */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-center flex-1">
                    <div className="text-4xl mb-2">🇧🇷</div>
                    <p className="font-bold text-white text-sm">PSG</p>
                    <p className="text-xs text-gray-500 mt-0.5">Home</p>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-3xl font-black text-white">2 - 1</div>
                    <div className="text-xs text-green-400 mt-1 font-semibold">67′</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-4xl mb-2">🇩🇪</div>
                    <p className="font-bold text-white text-sm">Bayern</p>
                    <p className="text-xs text-gray-500 mt-0.5">Away</p>
                  </div>
                </div>

                {/* Odds */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'PSG Genyen', odds: '1.85', color: 'hover:bg-brand-gold/20 hover:border-brand-gold' },
                    { label: 'Match Nul', odds: '3.40', color: 'hover:bg-gray-400/10 hover:border-gray-400' },
                    { label: 'Bayern Genyen', odds: '4.20', color: 'hover:bg-blue-400/20 hover:border-blue-400' },
                  ].map(o => (
                    <button key={o.label}
                      className={`p-3 bg-white/5 border border-white/10 rounded-xl text-center transition-all duration-200 cursor-pointer group ${o.color}`}>
                      <p className="text-xs text-gray-500 group-hover:text-white transition-colors">{o.label}</p>
                      <p className="text-lg font-black text-brand-gold mt-1">{o.odds}</p>
                    </button>
                  ))}
                </div>

                <Link href="/sports" className="mt-4 w-full block text-center py-2.5 bg-brand-gold text-[#080C14] font-bold rounded-xl text-sm hover:bg-yellow-400 transition-colors">
                  Wè Tout Matchs →
                </Link>
              </div>

              {/* Bottom mini cards */}
              <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                {[
                  { emoji: '🏀', label: 'NBA Finals', time: 'Live' },
                  { emoji: '🎰', label: 'Bolèt 3PM', time: '2h 15m' },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-3 p-3 bg-white/3 rounded-lg border border-white/5">
                    <span className="text-xl">{c.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{c.label}</p>
                      <p className="text-xs text-green-400">{c.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── LIVE ODDS TICKER ─────────────────────────────────── */
function LiveOddsTickerSection() {
  const ticks = [
    '⚽ PSG vs Bayern — 1.85 / 3.40 / 4.20',
    '🏀 Lakers vs Celtics — 2.10 / 1.75',
    '🎾 Nadal vs Djokovic — 3.20 / 1.40',
    '⚽ Barcelona vs Real Madrid — 2.50 / 3.10 / 2.80',
    '🥊 Fury vs Joshua — 1.65 / 2.30',
    '🏈 Chiefs vs Eagles — 1.90 / 1.90',
    '⚽ Marseille vs Lyon — 2.20 / 3.00 / 3.50',
    '🎰 Bolèt Maten — Tiraj 10:00 AM',
  ];

  return (
    <div className="bg-[#111827] border-y border-white/5 py-2.5 overflow-hidden">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-1 bg-red-500 rounded-r-full shrink-0 z-10">
          <Flame className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-xs font-black uppercase tracking-wider">Live</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-8 animate-[ticker_40s_linear_infinite] whitespace-nowrap">
            {[...ticks, ...ticks].map((t, i) => (
              <span key={i} className="text-xs text-gray-400 shrink-0">
                <span className="text-brand-gold font-semibold">{t.split('—')[0]}</span>
                {t.includes('—') && <span>—{t.split('—')[1]}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── PRODUCTS ─────────────────────────────────────────── */
function ProductsSection() {
  const products = [
    {
      icon: Trophy,
      title: 'Sports Betting',
      subtitle: 'Paryaj Espò',
      desc: '500+ matchs chak jou. Foutbòl, baskètbòl, tenis, MMA ak plis.',
      href: '/sports',
      color: 'from-yellow-600/20 to-orange-600/5',
      border: 'hover:border-yellow-500/50',
      iconColor: 'text-yellow-400',
      badge: 'LIVE',
      badgeColor: 'bg-red-500',
    },
    {
      icon: Zap,
      title: 'Virtual Games',
      subtitle: 'Jwèt Vityèl',
      desc: 'Foutbòl vityèl chak 5 minit. Kous cheval chak 3 minit. 24/7.',
      href: '/virtual',
      color: 'from-purple-600/20 to-pink-600/5',
      border: 'hover:border-purple-500/50',
      iconColor: 'text-purple-400',
      badge: '24/7',
      badgeColor: 'bg-purple-500',
    },
    {
      icon: Ticket,
      title: 'Bolet Lottery',
      subtitle: 'Lotri Ayisyen',
      desc: '3 tiraj chak jou. Chwazi nimewo ou 00-99. Genyen jiska 70x enjèk ou.',
      href: '/lottery',
      color: 'from-red-600/20 to-rose-600/5',
      border: 'hover:border-red-500/50',
      iconColor: 'text-red-400',
      badge: '3x/JOU',
      badgeColor: 'bg-green-500',
    },
    {
      icon: Gamepad2,
      title: 'Casino',
      subtitle: 'Kazino',
      desc: 'Slots, Roulette, Blackjack, Baccarat, Crash games ak live dealer.',
      href: '/casino',
      color: 'from-blue-600/20 to-cyan-600/5',
      border: 'hover:border-blue-500/50',
      iconColor: 'text-blue-400',
      badge: 'NEW',
      badgeColor: 'bg-blue-500',
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Chwazi Jwèt Ou /{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-300">Choose Your Game</span>
          </h2>
          <p className="text-gray-500">Tout sa ou renmen nan yon sèl platfòm / Everything you love, one platform</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map(p => {
            const Icon = p.icon;
            return (
              <Link key={p.href} href={p.href}
                className={`group relative p-6 bg-gradient-to-br ${p.color} border border-white/10 ${p.border} rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                <span className={`absolute top-4 right-4 text-xs font-black px-2 py-0.5 ${p.badgeColor} text-white rounded-full`}>{p.badge}</span>
                <Icon className={`w-8 h-8 ${p.iconColor} mb-4`} />
                <h3 className="font-black text-white text-lg">{p.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{p.subtitle}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
                <div className={`mt-5 flex items-center gap-1 text-xs font-bold ${p.iconColor}`}>
                  Jwèt Kounye a <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURED MATCHES ─────────────────────────────────── */
function FeaturedMatchesSection() {
  const matches = [
    { league: '🏆 UEFA Champions League', home: 'PSG', away: 'Bayern', time: 'Live 67\'', oddsH: '1.85', oddsD: '3.40', oddsA: '4.20', live: true },
    { league: '⚽ Premier League', home: 'Man City', away: 'Arsenal', time: 'Jodi a 20:45', oddsH: '2.10', oddsD: '3.25', oddsA: '3.60', live: false },
    { league: '🏀 NBA Playoffs', home: 'Lakers', away: 'Celtics', time: 'Jodi a 21:00', oddsH: '2.20', oddsD: '-', oddsA: '1.70', live: false },
    { league: '🥊 Boxing', home: 'Fury', away: 'Joshua', time: 'Samdi 22:00', oddsH: '1.65', oddsD: '-', oddsA: '2.30', live: false },
  ];

  return (
    <section className="py-16 px-4 bg-[#0D1117]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Flame className="w-6 h-6 text-red-400" />
            Matchs Popilè / <span className="text-brand-gold">Featured Matches</span>
          </h2>
          <Link href="/sports" className="text-sm text-brand-gold hover:underline flex items-center gap-1">
            Tout matchs <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {matches.map((m, i) => (
            <div key={i} className="p-4 bg-[#111827] border border-white/5 hover:border-brand-gold/20 rounded-xl transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">{m.league}</span>
                    {m.live && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">LIVE</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">{m.home}</span>
                    <span className="text-xs text-gray-600 px-2 py-0.5 bg-white/5 rounded">vs</span>
                    <span className="font-bold text-white text-sm">{m.away}</span>
                    <span className={`text-xs ml-auto ${m.live ? 'text-red-400' : 'text-gray-500'}`}>{m.time}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {[
                    { label: '1', val: m.oddsH },
                    { label: 'X', val: m.oddsD },
                    { label: '2', val: m.oddsA },
                  ].filter(o => o.val !== '-').map(o => (
                    <button key={o.label}
                      className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-brand-gold/10 hover:border-brand-gold/50 rounded-lg text-center transition-all duration-200 min-w-[58px]">
                      <p className="text-xs text-gray-500">{o.label}</p>
                      <p className="text-sm font-black text-brand-gold">{o.val}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── VIP SECTION ──────────────────────────────────────── */
function VIPSection() {
  const tiers = [
    { name: 'Bronze', xp: '0 – 999 XP', color: 'from-amber-800/30 to-amber-900/10', border: 'border-amber-700/30', icon: '🥉', perks: ['Bonus biyenveni', 'Cashback 2%'] },
    { name: 'Silver', xp: '1K – 9.9K XP', color: 'from-gray-600/30 to-gray-700/10', border: 'border-gray-500/30', icon: '🥈', perks: ['Cashback 5%', 'Retrait rapid', 'Bonus mensyèl'] },
    { name: 'Gold', xp: '10K – 49.9K XP', color: 'from-yellow-600/30 to-yellow-700/10', border: 'border-yellow-500/40', icon: '🥇', perks: ['Cashback 10%', 'Manadjè VIP', 'Limit ogmante'] },
    { name: 'Diamond', xp: '50K+ XP', color: 'from-cyan-600/30 to-cyan-700/10', border: 'border-cyan-400/40', icon: '💎', perks: ['Cashback 15%', 'Tretman elit', 'Evènman eksklizif'] },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-brand-gold bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-1.5 mb-4">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-bold">VIP &amp; GAMIFICATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Pwogram VIP Nou / <span className="text-brand-gold">Our VIP Program</span>
          </h2>
          <p className="text-gray-500">Chak paryaj ou ranpli XP. Monte nivo — genyen plis. / Every bet earns XP. Level up — win more.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {tiers.map(t => (
            <div key={t.name}
              className={`p-5 bg-gradient-to-br ${t.color} border ${t.border} rounded-2xl`}>
              <div className="text-3xl mb-3">{t.icon}</div>
              <h3 className="font-black text-white text-lg">{t.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{t.xp}</p>
              <ul className="space-y-1.5">
                {t.perks.map(p => (
                  <li key={p} className="text-xs text-gray-300 flex items-center gap-2">
                    <span className="text-green-400">✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Gift,     title: 'Rekonpans Chak Jou / Daily Rewards',   desc: 'Konekte chak jou pou reklame bonis gratis ou.' },
            { icon: BarChart3,title: 'Leaderboard Chak Semèn / Weekly Board', desc: 'Konpetisyon ak lòt jwè pou priz espesyal.' },
            { icon: Star,     title: 'Misyon &amp; Defi / Missions',           desc: 'Konplete defi pou genyen XP bonifikasyon ak priz.' },
          ].map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="p-5 bg-[#111827] border border-white/5 rounded-xl flex gap-4">
                <Icon className="w-6 h-6 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-sm" dangerouslySetInnerHTML={{ __html: f.title }} />
                  <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─────────────────────────────────────── */
function HowItWorksSection() {
  const steps = [
    { num: '01', icon: Users,        ht: 'Kreye kont gratis',       en: 'Create a free account',        detail: 'Enskri an 2 minit — pa bezwen kat.' },
    { num: '02', icon: Wallet,       ht: 'Depoze lajan',            en: 'Deposit funds',                detail: 'MonCash, NatCash, Stripe, Zelle...' },
    { num: '03', icon: TrendingUp,   ht: 'Paryaje &amp; Jwèt',     en: 'Bet &amp; Play',               detail: 'Espò, lotri, vityèl, casino.' },
    { num: '04', icon: Shield,       ht: 'Retire Prim Ou',          en: 'Withdraw Your Winnings',       detail: 'Peman rapid — imedya pou MonCash.' },
  ];

  return (
    <section className="py-20 px-4 bg-[#0D1117]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Kijan sa Travay? / <span className="text-brand-gold">How It Works</span>
          </h2>
          <p className="text-gray-500">Kòmanse paryaje nan mwens pase 5 minit / Start betting in under 5 minutes</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-brand-gold/30 to-transparent" />
                )}
                <div className="w-16 h-16 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-gold/20">
                  <Icon className="w-7 h-7 text-[#080C14]" />
                </div>
                <p className="text-xs font-black text-brand-gold/50 mb-1">{s.num}</p>
                <p className="font-black text-white mb-1" dangerouslySetInnerHTML={{ __html: s.ht }} />
                <p className="text-xs text-gray-600 mb-2">{s.en}</p>
                <p className="text-xs text-gray-500">{s.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-brand-gold to-yellow-500 text-[#080C14] font-black rounded-xl text-lg hover:shadow-xl hover:shadow-brand-gold/30 transition-all duration-300">
            Kòmanse Kounye a — Gratis →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── PAYMENT METHODS ──────────────────────────────────── */
function PaymentMethodsSection() {
  const methods = [
    { name: 'MonCash', emoji: '📱', country: '🇭🇹', instant: true },
    { name: 'NatCash', emoji: '📲', country: '🇭🇹', instant: true },
    { name: 'Stripe',  emoji: '💳', country: '🌍', instant: false },
    { name: 'Zelle',   emoji: '💸', country: '🇺🇸', instant: true },
    { name: 'CashApp', emoji: '💵', country: '🇺🇸', instant: true },
    { name: 'PayPal',  emoji: '🅿️', country: '🌍', instant: false },
    { name: 'Venmo',   emoji: '💜', country: '🇺🇸', instant: true },
    { name: 'Wise',    emoji: '🌐', country: '🌍', instant: false },
    { name: 'Remitly', emoji: '✈️', country: '🌍', instant: false },
    { name: 'Interac', emoji: '🍁', country: '🇨🇦', instant: true },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">
            Metòd Peman / <span className="text-brand-gold">Payment Methods</span>
          </h2>
          <p className="text-gray-500 text-sm">Depoze ak retire ak metòd ou pi pito a / Deposit &amp; withdraw your preferred way</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {methods.map(m => (
            <div key={m.name}
              className="p-4 bg-[#111827] border border-white/5 hover:border-brand-gold/30 rounded-xl text-center transition-all duration-200 group">
              <div className="text-2xl mb-2">{m.emoji}</div>
              <p className="text-xs font-bold text-white group-hover:text-brand-gold transition-colors">{m.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">{m.country}</p>
              {m.instant && <span className="text-xs text-green-400 mt-1 block">⚡ Imedya</span>}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          🔒 Tout tranzaksyon yo an sekirite / All transactions are secured with SSL encryption
        </p>
      </div>
    </section>
  );
}

/* ─── APP DOWNLOAD ─────────────────────────────────────── */
function AppDownloadSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-brand-gold/5 via-[#0D1117] to-brand-blue/5 border-y border-white/5">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
        <div className="text-6xl shrink-0">📱</div>
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            App Mobil Nou / <span className="text-brand-gold">Our Mobile App</span>
          </h2>
          <p className="text-gray-400 text-sm mb-5">
            Paryaje nenpò ki kote, nenpò ki lè. iOS ak Android. Push notifications, Face ID, live odds.
            <br /><span className="text-gray-600 italic">Bet anywhere, anytime. iOS and Android. Push notifications, Face ID, live odds.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <a href="#" className="flex items-center gap-3 px-5 py-3 bg-white/10 border border-white/10 rounded-xl hover:bg-white/15 transition-all">
              <Smartphone className="w-5 h-5 text-brand-gold" />
              <div className="text-left">
                <p className="text-xs text-gray-500">Disponib sou</p>
                <p className="text-sm font-bold text-white">App Store (iOS)</p>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 px-5 py-3 bg-white/10 border border-white/10 rounded-xl hover:bg-white/15 transition-all">
              <Smartphone className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <p className="text-xs text-gray-500">Disponib sou</p>
                <p className="text-sm font-bold text-white">Google Play (Android)</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── TRUST SECTION ────────────────────────────────────── */
function TrustSection() {
  const badges = [
    { icon: Shield,    title: 'Sekirite SSL',        desc: 'Tout done yo ankripte' },
    { icon: Clock,     title: 'Sipò 24/7',           desc: 'Ekip sipò toujou disponib' },
    { icon: TrendingUp,title: 'Pemen Rapid',         desc: 'MonCash imedya, kad 3-7j' },
    { icon: Star,      title: 'Jeu Ekitab / Fair Play', desc: 'RNG sètifye, tiraj transparant' },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map(b => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="flex items-start gap-4 p-5 bg-[#111827] border border-white/5 rounded-xl">
                <div className="w-10 h-10 bg-brand-gold/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{b.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center p-6 bg-[#111827] border border-white/5 rounded-2xl">
          <p className="text-xs text-gray-600">
            🔞 G&amp;J Lottery se pou moun ki gen <strong className="text-white">18 an ak plis sèlman</strong>.
            Paryaj responsab — jwèt ka kreye depandans. Si ou bezwen èd:{' '}
            <a href="/responsible-gambling" className="text-brand-gold hover:underline">Paryaj Responsab</a> |{' '}
            <a href="mailto:support@gjlottery.com" className="text-brand-gold hover:underline">support@gjlottery.com</a>
          </p>
        </div>
      </div>
    </section>
  );
}
