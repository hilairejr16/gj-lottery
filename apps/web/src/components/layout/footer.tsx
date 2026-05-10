import Link from 'next/link';

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const socialLinks = [
  { href: 'https://facebook.com/GJLottery',   label: 'Facebook',  Icon: FacebookIcon },
  { href: 'https://instagram.com/gjlottery',  label: 'Instagram', Icon: InstagramIcon },
  { href: 'https://x.com/gjlottery',          label: 'X',         Icon: XIcon },
  { href: 'https://linkedin.com/company/gjlottery', label: 'LinkedIn', Icon: LinkedInIcon },
];

export default function Footer() {
  return (
    <footer className="border-t border-bg-border bg-bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-lg flex items-center justify-center text-bg-base font-black text-sm">GJ</div>
              <span className="font-black text-lg"><span className="text-brand-gold">G&amp;J</span> Lottery</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              Pi gwo platfòm paryaj Ayisyen an.<br />
              La meilleure plateforme de paris haïtienne.<br />
              Haiti's #1 betting platform.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label} href={href}
                  target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 bg-bg-base border border-bg-border rounded-lg flex items-center justify-center text-gray-500 hover:text-brand-gold hover:border-brand-gold transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Games */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Jwèt / Games</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link href="/sports"   className="hover:text-brand-gold transition-colors">⚽ Espò / Sports</Link></li>
              <li><Link href="/virtual"  className="hover:text-brand-gold transition-colors">🎮 Vityèl / Virtuel</Link></li>
              <li><Link href="/lottery"  className="hover:text-brand-gold transition-colors">🎰 Lotri / Loterie</Link></li>
              <li><Link href="/casino"   className="hover:text-brand-gold transition-colors">🃏 Casino</Link></li>
              <li><Link href="/live"     className="hover:text-brand-gold transition-colors">🔴 Direk / Direct</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Kont / Account</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link href="/register"  className="hover:text-brand-gold transition-colors">Enskri / Register</Link></li>
              <li><Link href="/login"     className="hover:text-brand-gold transition-colors">Konekte / Login</Link></li>
              <li><Link href="/wallet"    className="hover:text-brand-gold transition-colors">Pòtfèy / Wallet</Link></li>
              <li><Link href="/bets"      className="hover:text-brand-gold transition-colors">Paryaj Mwen / My Bets</Link></li>
              <li><Link href="/vip"       className="hover:text-brand-gold transition-colors">⭐ VIP Program</Link></li>
              <li><Link href="/affiliates" className="hover:text-brand-gold transition-colors">🤝 Affiliates</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Konpayi / Company</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link href="/about"    className="hover:text-brand-gold transition-colors">Sou Nou / About</Link></li>
              <li><Link href="/blog"     className="hover:text-brand-gold transition-colors">Blog</Link></li>
              <li><Link href="/jobs"     className="hover:text-brand-gold transition-colors">Karyè / Jobs</Link></li>
              <li><Link href="/contact"  className="hover:text-brand-gold transition-colors">Kontakte / Contact</Link></li>
              <li><Link href="/faq"      className="hover:text-brand-gold transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Legal / Jiridik</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link href="/terms"               className="hover:text-brand-gold transition-colors">Tèm Itilizasyon / Terms</Link></li>
              <li><Link href="/privacy"             className="hover:text-brand-gold transition-colors">Politik Konfidansyalite</Link></li>
              <li><Link href="/cookie-policy"       className="hover:text-brand-gold transition-colors">Politik Koki / Cookies</Link></li>
              <li><Link href="/disclaimer"          className="hover:text-brand-gold transition-colors">Avètisman / Disclaimer</Link></li>
              <li><Link href="/responsible-gambling" className="hover:text-brand-gold transition-colors">🛡️ Paryaj Responsab</Link></li>
              <li><Link href="/legal"               className="hover:text-brand-gold transition-colors">Legal Hub</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-bg-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600 text-center md:text-left">
              © {new Date().getFullYear()} G&amp;J Lottery. Tout dwa rezève / Tous droits réservés / All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <span>🔞 18+ sèlman / uniquement / only</span>
              <span>🇭🇹 Made with ❤️ in Haiti</span>
            </div>
          </div>
          <p className="text-xs text-gray-700 text-center mt-3">
            Jwèt responsab pou moun ki gen 18 an ak plis. Paryaj ka kreye depandans — chèche èd si ou bezwen. / Jeu responsable pour les 18 ans et plus. Le jeu peut créer une dépendance.
          </p>
        </div>
      </div>
    </footer>
  );
}
