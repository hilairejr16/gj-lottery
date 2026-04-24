import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { createClient } from '@/lib/supabase/server';
import { Trophy, Zap, Ticket, Radio, Wallet, Headphones } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1">
        <HeroSection loggedIn={!!user} />
        <FeaturesSection />
        <HowItWorksSection />
        <PaymentMethodsSection />
      </main>
      <Footer />
    </div>
  );
}

function HeroSection({ loggedIn }: { loggedIn: boolean }) {
  const t = useTranslations('home');
  return (
    <section className="relative overflow-hidden bg-gradient-brand py-24 px-4">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse-slow" />
          <span className="text-brand-gold text-sm font-medium">Live Betting Available</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-white mb-4">
          <span className="text-brand-gold">GJ</span> Lottery
        </h1>
        <p className="text-xl sm:text-2xl text-brand-gold font-semibold mb-4">
          {t('hero_subtitle')}
        </p>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
          {t('hero_desc')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {loggedIn ? (
            <Link href="/dashboard"
              className="px-8 py-4 bg-brand-gold text-bg-base font-bold rounded-xl hover:bg-brand-gold-light transition-all text-lg shadow-lg shadow-brand-gold/25">
              {t('cta_play')} →
            </Link>
          ) : (
            <>
              <Link href="/register"
                className="px-8 py-4 bg-brand-gold text-bg-base font-bold rounded-xl hover:bg-brand-gold-light transition-all text-lg shadow-lg shadow-brand-gold/25">
                {t('cta_register')} →
              </Link>
              <Link href="/login"
                className="px-8 py-4 bg-bg-muted border border-bg-border text-white font-semibold rounded-xl hover:bg-bg-border transition-all text-lg">
                Konekte / Se connecter
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
          {[
            { label: 'Jwè Aktif', value: '10K+' },
            { label: 'Matchs Chak Jou', value: '500+' },
            { label: 'Gayan Chak Semèn', value: '1K+' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-brand-gold">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const t = useTranslations('home');
  const features = [
    { icon: Trophy,      key: 'sports',   href: '/sports',  color: 'text-brand-gold' },
    { icon: Zap,         key: 'virtual',  href: '/virtual', color: 'text-purple-400' },
    { icon: Ticket,      key: 'lottery',  href: '/lottery', color: 'text-brand-red' },
    { icon: Radio,       key: 'live',     href: '/live',    color: 'text-green-400' },
    { icon: Wallet,      key: 'wallet',   href: '/wallet',  color: 'text-blue-400' },
    { icon: Headphones,  key: 'support',  href: '/help',    color: 'text-pink-400' },
  ];

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-black text-center text-white mb-12">
        Tout Sa Ou Bezwen /{' '}
        <span className="text-brand-gold">Tout ce dont vous avez besoin</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map(f => {
          const Icon = f.icon;
          return (
            <Link key={f.key} href={f.href}
              className="card p-6 hover:border-brand-gold/40 transition-all duration-300 group">
              <Icon size={32} className={`${f.color} mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="font-bold text-white">{t(`feature_${f.key}` as any)}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: '01', ht: 'Kreye kont ou gratis', fr: 'Créez votre compte gratuitement' },
    { num: '02', ht: 'Depoze lajan nan pòtfèy ou', fr: 'Rechargez votre portefeuille' },
    { num: '03', ht: 'Chwazi jwèt ou ak paryaj ou', fr: 'Choisissez votre jeu et pariez' },
    { num: '04', ht: 'Retire kòb ou nenpò ki lè', fr: 'Retirez vos gains à tout moment' },
  ];

  return (
    <section className="py-20 px-4 bg-bg-card">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-center text-white mb-12">
          Kijan sa travay? / <span className="text-brand-gold">Comment ça marche ?</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(s => (
            <div key={s.num} className="text-center">
              <div className="w-12 h-12 bg-brand-gold rounded-xl flex items-center justify-center text-bg-base font-black text-lg mx-auto mb-4">
                {s.num}
              </div>
              <p className="text-white font-semibold text-sm">{s.ht}</p>
              <p className="text-gray-400 text-xs mt-1">{s.fr}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PaymentMethodsSection() {
  const methods = ['MonCash', 'NatCash', 'CashApp', 'Zelle', 'PayPal', 'Venmo', 'Wise', 'Remitly', 'Interac'];
  return (
    <section className="py-16 px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-black text-center text-white mb-8">
        Metòd Peman / <span className="text-brand-gold">Méthodes de paiement</span>
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {methods.map(m => (
          <div key={m} className="card px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-brand-gold hover:border-brand-gold/40 transition-all">
            {m}
          </div>
        ))}
      </div>
    </section>
  );
}
