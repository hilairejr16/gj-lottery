import Link from 'next/link';
import { Zap } from 'lucide-react';

// ── Virtual Games Hub — Server Component ─────────────────────────────────────

export default function VirtualGamesPage() {
  return (
    <div className="animate-fade-in space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Zap size={24} className="text-brand-gold" />
          Jwèt Vityèl / Jeux Virtuels
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Paryaje sou match vityèl ak kous chwal — rezilta chak kèk minit
        </p>
      </div>

      {/* Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Football Card */}
        <div className="relative overflow-hidden rounded-2xl border border-bg-border bg-gradient-to-br from-bg-card to-bg-muted p-8 flex flex-col gap-6 hover:border-brand-gold/40 transition-all group">
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-gold/5 rounded-full blur-3xl group-hover:bg-brand-gold/10 transition-all" />

          <div className="relative">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-5 text-3xl">
              ⚽
            </div>

            {/* Title & description */}
            <h2 className="text-xl font-black text-white mb-2">Foutbòl Vityèl</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-1">
              Match toutes les 5 minutes
            </p>
            <p className="text-gray-500 text-xs">
              Paryaje sou 1 / X / 2 — lakay, egal, oswa deyò. Rezilta otomatik chak 5 minit.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-4">
            <div className="flex-1 bg-bg-base/60 rounded-xl p-3 text-center">
              <p className="text-brand-gold font-black text-lg">5 min</p>
              <p className="text-gray-500 text-xs">Pa match</p>
            </div>
            <div className="flex-1 bg-bg-base/60 rounded-xl p-3 text-center">
              <p className="text-brand-gold font-black text-lg">3</p>
              <p className="text-gray-500 text-xs">Chwa (1/X/2)</p>
            </div>
            <div className="flex-1 bg-bg-base/60 rounded-xl p-3 text-center">
              <p className="text-brand-gold font-black text-lg">×4.0</p>
              <p className="text-gray-500 text-xs">Max cote</p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/virtual/football"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-brand-gold text-bg-base font-black text-base hover:bg-yellow-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Zap size={18} />
            Jwe Foutbòl Vityèl
          </Link>
        </div>

        {/* Horses Card */}
        <div className="relative overflow-hidden rounded-2xl border border-bg-border bg-gradient-to-br from-bg-card to-bg-muted p-8 flex flex-col gap-6 hover:border-brand-gold/40 transition-all group">
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all" />

          <div className="relative">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 text-3xl">
              🏇
            </div>

            {/* Title & description */}
            <h2 className="text-xl font-black text-white mb-2">Kous Chwal Vityèl</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-1">
              Course toutes les 3 minutes
            </p>
            <p className="text-gray-500 text-xs">
              Chwazi 1 nan 8 chwal — gwo cote, gwo viktwa. Ras vityèl chak 3 minit.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-4">
            <div className="flex-1 bg-bg-base/60 rounded-xl p-3 text-center">
              <p className="text-brand-gold font-black text-lg">3 min</p>
              <p className="text-gray-500 text-xs">Pa ras</p>
            </div>
            <div className="flex-1 bg-bg-base/60 rounded-xl p-3 text-center">
              <p className="text-brand-gold font-black text-lg">8</p>
              <p className="text-gray-500 text-xs">Chwal</p>
            </div>
            <div className="flex-1 bg-bg-base/60 rounded-xl p-3 text-center">
              <p className="text-brand-gold font-black text-lg">×15</p>
              <p className="text-gray-500 text-xs">Max cote</p>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/virtual/horses"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-brand-gold text-bg-base font-black text-base hover:bg-yellow-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Zap size={18} />
            Jwe Kous Chwal Vityèl
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="card p-6">
        <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
          Kijan Jwèt Vityèl Yo Travay?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-black text-sm shrink-0">
              1
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Chwazi yon jwèt</p>
              <p className="text-xs text-gray-500 mt-0.5">Foutbòl (5 min) oswa Kous Chwal (3 min)</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-black text-sm shrink-0">
              2
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Fè paryaj ou</p>
              <p className="text-xs text-gray-500 mt-0.5">Antre montan ou vle ak chwa ou a anvan tan fèmen</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-brand-gold font-black text-sm shrink-0">
              3
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Tann rezilta</p>
              <p className="text-xs text-gray-500 mt-0.5">Rezilta jenere otomatikman — si ou genyen, balans ou monte!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
