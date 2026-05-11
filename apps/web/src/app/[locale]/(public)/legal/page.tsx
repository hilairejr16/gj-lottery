export const runtime = 'edge';

import { Link } from '@/i18n/navigation';
import { Scale, Shield, Cookie, FileText, AlertTriangle, Lock } from 'lucide-react';

const legalLinks = [
  { href: '/terms',              icon: FileText,     en: 'Terms of Use',     ht: 'Tèm Itilizasyon',     fr: 'Conditions d\'Utilisation' },
  { href: '/privacy',            icon: Shield,       en: 'Privacy Policy',   ht: 'Politik Konfidansyalite', fr: 'Politique de Confidentialité' },
  { href: '/privacy-statement',  icon: Lock,         en: 'Privacy Statement',ht: 'Deklarasyon Konfidansyalite', fr: 'Déclaration de Confidentialité' },
  { href: '/cookie-policy',      icon: Cookie,       en: 'Cookie Policy',    ht: 'Politik Koki',        fr: 'Politique des Cookies' },
  { href: '/disclaimer',         icon: AlertTriangle,en: 'Disclaimer',       ht: 'Avètisman',           fr: 'Avertissement' },
  { href: '/responsible-gambling', icon: Scale,      en: 'Responsible Gambling', ht: 'Paryaj Responsab', fr: 'Jeu Responsable' },
];

export default function LegalHubPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Scale className="w-12 h-12 text-brand-gold mx-auto mb-4" />
        <h1 className="text-3xl font-black mb-2">
          <span className="text-brand-gold">Legal</span> / Legal / Jiridik
        </h1>
        <p className="text-gray-400 text-sm">
          Tout dokiman legal GJ Lottery yo / Tous les documents légaux de GJ Lottery
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {legalLinks.map(({ href, icon: Icon, en, ht, fr }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-4 p-6 bg-bg-card border border-bg-border rounded-xl hover:border-brand-gold transition-colors group"
          >
            <Icon className="w-6 h-6 text-brand-gold mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-white group-hover:text-brand-gold transition-colors">{en}</p>
              <p className="text-sm text-gray-500 mt-0.5">{ht} / {fr}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-bg-card border border-bg-border rounded-xl text-center">
        <p className="text-sm text-gray-400 leading-relaxed">
          © {new Date().getFullYear()} GJ Lottery. Tout dwa rezève / Tous droits réservés / All rights reserved.<br />
          GJ Lottery opere anba lwa paryaj aplikab yo. Paryaj responsab — 18 an ak plis sèlman.<br />
          GJ Lottery opère sous les lois de jeu applicables. Jeu responsable — 18 ans et plus uniquement.
        </p>
      </div>
    </div>
  );
}
