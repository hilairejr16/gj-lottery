import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-bg-border bg-bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center text-bg-base font-black text-sm">GJ</div>
              <span className="font-black text-lg"><span className="text-brand-gold">GJ</span> Lottery</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Pi gwo platfòm paryaj Ayisyen an.<br />
              La meilleure plateforme de paris haïtienne.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Jwèt / Jeux</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/sports"  className="hover:text-brand-gold transition-colors">Espò / Sports</Link></li>
              <li><Link href="/virtual" className="hover:text-brand-gold transition-colors">Vityèl / Virtuel</Link></li>
              <li><Link href="/lottery" className="hover:text-brand-gold transition-colors">Lotri / Loterie</Link></li>
              <li><Link href="/live"    className="hover:text-brand-gold transition-colors">Direk / Direct</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Kont / Compte</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/register" className="hover:text-brand-gold transition-colors">Enskri / S'inscrire</Link></li>
              <li><Link href="/login"    className="hover:text-brand-gold transition-colors">Konekte / Connexion</Link></li>
              <li><Link href="/wallet"   className="hover:text-brand-gold transition-colors">Pòtfèy / Portefeuille</Link></li>
              <li><Link href="/profile"  className="hover:text-brand-gold transition-colors">Pwofil / Profil</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Sipò / Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/help"    className="hover:text-brand-gold transition-colors">Èd / Aide</Link></li>
              <li><Link href="/terms"   className="hover:text-brand-gold transition-colors">Tèm / Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-gold transition-colors">Konfidansyalite</Link></li>
              <li><a href="mailto:support@gjlottery.com" className="hover:text-brand-gold transition-colors">support@gjlottery.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-bg-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} GJ Lottery. Tout dwa rezève / Tous droits réservés.
          </p>
          <p className="text-xs text-gray-600">
            🔞 Jwèt responsab pou moun ki gen 18 an ak plis / Jeu responsable pour les 18 ans et plus
          </p>
        </div>
      </div>
    </footer>
  );
}
