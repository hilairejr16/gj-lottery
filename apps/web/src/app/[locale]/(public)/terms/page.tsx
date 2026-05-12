

import { FileText } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-2">
        <FileText className="w-8 h-8 text-brand-gold" />
        <h1 className="text-3xl font-black">Terms of Use — Tèm Itilizasyon</h1>
      </div>
      <p className="text-sm text-gray-500 mb-10">Last updated / Dènye mizajou: January 1, 2025</p>

      <div className="space-y-8 text-gray-300 leading-relaxed">

        <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-xl text-sm">
          ⚠️ <strong className="text-white">Please read these Terms carefully before using G&amp;J Lottery.</strong> By accessing or using our platform, you agree to be bound by these Terms. If you do not agree, do not use the platform.
        </div>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">1. Eligibility / Kondisyon Elijibilite</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You must be at least <strong className="text-white">18 years of age</strong> to use G&amp;J Lottery.</li>
            <li>You must reside in a jurisdiction where online gambling is legal.</li>
            <li>You may only hold one account per person.</li>
            <li>Employees and their immediate family members of G&amp;J Lottery are not eligible to participate.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">2. Account Registration / Enrejistreman Kont</h2>
          <p>You agree to provide accurate, complete, and current information during registration. You are responsible for maintaining the confidentiality of your login credentials. You must notify us immediately of any unauthorized use of your account.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">3. Deposits &amp; Withdrawals / Depo ak Retrè</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All deposits are credited in HTG (Haitian Gourdes) equivalent.</li>
            <li>Minimum deposit: <strong className="text-white">100 HTG</strong>. Minimum withdrawal: <strong className="text-white">500 HTG</strong>.</li>
            <li>Withdrawals are subject to identity verification (KYC).</li>
            <li>Bonus funds are subject to wagering requirements before withdrawal.</li>
            <li>G&amp;J Lottery reserves the right to delay or refuse withdrawals in case of suspected fraud.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Betting Rules / Règ Paryaj</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All bets are final once confirmed.</li>
            <li>G&amp;J Lottery reserves the right to void bets placed on erroneous odds.</li>
            <li>In-play (live) betting is subject to delays due to network conditions.</li>
            <li>Maximum winnings per bet slip: <strong className="text-white">500,000 HTG</strong> (subject to change).</li>
            <li>G&amp;J Lottery reserves the right to limit or close accounts exhibiting suspicious betting patterns.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. Lottery Rules / Règ Lotri</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Lottery tickets are non-refundable once purchased.</li>
            <li>Winning numbers are drawn fairly using certified random number generation.</li>
            <li>Prizes must be claimed within 90 days of the draw date.</li>
            <li>Taxes on winnings are the sole responsibility of the winner.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">6. Bonuses &amp; Promotions / Bonis ak Pwomosyon</h2>
          <p>Bonuses are subject to wagering requirements (typically 10x the bonus amount). Abuse of bonuses, including creating multiple accounts to claim promotions, will result in account suspension and forfeiture of funds.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">7. Prohibited Activities / Aktivite Entèdi</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Money laundering or any fraudulent activity.</li>
            <li>Using bots, scripts, or automated tools.</li>
            <li>Collusion with other users or against G&amp;J Lottery.</li>
            <li>Attempting to hack or manipulate the platform.</li>
            <li>Creating multiple accounts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">8. Responsible Gambling / Paryaj Responsab</h2>
          <p>G&amp;J Lottery promotes responsible gambling. We offer self-exclusion, deposit limits, and cooling-off periods. If gambling is affecting your life, please visit our <Link href="/responsible-gambling" className="text-brand-gold hover:underline">Responsible Gambling</Link> page or contact us immediately.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">9. Intellectual Property / Pwopriyete Entelektyèl</h2>
          <p>All content on G&amp;J Lottery — including logos, graphics, software, and text — is the property of G&amp;J Lottery and protected by copyright law. Unauthorized reproduction is strictly prohibited.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">10. Limitation of Liability / Limit Responsabilite</h2>
          <p>G&amp;J Lottery shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including lost profits or data. Our total liability shall not exceed the amount deposited in your account in the past 30 days.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">11. Termination / Fèmti Kont</h2>
          <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or failure to complete identity verification. Funds in confirmed accounts will be returned minus any applicable fees.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">12. Governing Law / Lwa Gouvènman</h2>
          <p>These Terms are governed by and construed in accordance with applicable laws. Any disputes shall be resolved by binding arbitration.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">13. Contact / Kontakte Nou</h2>
          <p>Questions about these Terms? Contact us at <a href="mailto:legal@gjlottery.com" className="text-brand-gold hover:underline">legal@gjlottery.com</a></p>
        </section>
      </div>
    </div>
  );
}
