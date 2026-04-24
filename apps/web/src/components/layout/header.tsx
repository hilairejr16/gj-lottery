'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database.types';
import { Globe, Menu, X, Wallet, LogOut, User, Shield, ReceiptText } from 'lucide-react';
import toast from 'react-hot-toast';

interface HeaderProps {
  profile?: Profile | null;
}

const LOCALES = [
  { code: 'ht', label: 'Kreyòl' },
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
];

export default function Header({ profile }: HeaderProps) {
  const t = useTranslations('nav');
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Dekonekte / Déconnecté / Logged out');
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-bg-base/95 backdrop-blur-md border-b border-bg-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="GJ Lottery" className="h-10 w-auto" />
          </Link>

          {/* Desktop nav */}
          {profile && (
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-muted rounded-lg transition-colors">
                {t('home')}
              </Link>
              <Link href="/sports" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-muted rounded-lg transition-colors">
                {t('sports')}
              </Link>
              <Link href="/virtual" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-muted rounded-lg transition-colors">
                {t('virtual')}
              </Link>
              <Link href="/lottery" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-muted rounded-lg transition-colors">
                {t('lottery')}
              </Link>
              <Link href="/bets" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-muted rounded-lg transition-colors flex items-center gap-1.5">
                <ReceiptText size={14} />
                Paryaj Mwen
              </Link>
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-2 text-gray-400 hover:text-white hover:bg-bg-muted rounded-lg transition-colors"
              >
                <Globe size={16} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-36 card shadow-xl py-1 z-50">
                  {LOCALES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { router.push(`/${l.code}`); setLangOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-muted transition-colors"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {profile ? (
              <>
                <Link href="/wallet" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-brand-gold hover:bg-brand-gold/10 rounded-lg transition-colors">
                  <Wallet size={16} />
                  <span>{t('wallet')}</span>
                </Link>
                {profile.is_admin && (
                  <Link href="/admin" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Shield size={16} />
                    <span>{t('admin')}</span>
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-muted rounded-lg transition-colors"
                  >
                    <User size={16} />
                    <span className="hidden sm:block">{profile.username}</span>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 card shadow-xl py-1 z-50">
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-muted">
                        <User size={14} /> {t('profile')}
                      </Link>
                      <Link href="/wallet" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-muted sm:hidden">
                        <Wallet size={14} /> {t('wallet')}
                      </Link>
                      <hr className="border-bg-border my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-bg-muted"
                      >
                        <LogOut size={14} /> {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-bg-muted rounded-lg transition-colors">
                  {t('login')}
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold bg-brand-gold text-bg-base hover:bg-brand-gold-light rounded-lg transition-colors">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
