export const runtime = 'edge';

import { Shield } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function PrivacyPolicyPage() {
  const updated = 'January 1, 2025';
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-8 h-8 text-brand-gold" />
        <h1 className="text-3xl font-black">Privacy Policy — Politik Konfidansyalite</h1>
      </div>
      <p className="text-sm text-gray-500 mb-10">Last updated / Dènye mizajou: {updated}</p>

      <div className="prose prose-invert prose-gold max-w-none space-y-8 text-gray-300 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-white mb-3">1. Introduction / Entwodiksyon</h2>
          <p>G&amp;J Lottery ("we", "us", "our") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
          <p className="mt-2 text-gray-500 italic">G&amp;J Lottery ("nou") angaje pou pwoteje enfòmasyon pèsonèl ou ak dwa ou a konfidansyalite. Politik Konfidansyalite sa a eksplike kijan nou kolekte, itilize, divige, epi pwoteje enfòmasyon ou lè w itilize platfòm nou an.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect / Enfòmasyon Nou Kolekte</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> Full name, date of birth, email address, phone number, username.</li>
            <li><strong>Identity verification (KYC):</strong> Government-issued ID, proof of address.</li>
            <li><strong>Financial data:</strong> Payment method details, transaction history, wallet balance.</li>
            <li><strong>Usage data:</strong> Betting history, game activity, login timestamps, IP address, device type, browser type.</li>
            <li><strong>Communications:</strong> Messages you send to our support team.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information / Kijan Nou Itilize Enfòmasyon Ou</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To create and manage your account.</li>
            <li>To process deposits, withdrawals, and bets.</li>
            <li>To verify your identity and comply with anti-money-laundering (AML) regulations.</li>
            <li>To detect and prevent fraud.</li>
            <li>To send you service notifications, promotions, and updates (with your consent).</li>
            <li>To improve our platform and personalize your experience.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Sharing Your Information / Pataj Enfòmasyon Ou</h2>
          <p>We do not sell your personal data. We may share your information with:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Payment processors</strong> (Stripe, PayPal, MonCash) to process transactions.</li>
            <li><strong>Identity verification services</strong> to comply with KYC requirements.</li>
            <li><strong>Analytics providers</strong> to understand platform usage.</li>
            <li><strong>Law enforcement</strong> when required by law or to protect rights and safety.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. Data Retention / Konsèvasyon Done</h2>
          <p>We retain your personal data for as long as your account is active and for up to 7 years after account closure to comply with legal and regulatory obligations.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">6. Your Rights / Dwa Ou</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
            <li><strong>Deletion:</strong> Request deletion of your data (subject to legal obligations).</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time.</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at: <a href="mailto:privacy@gjlottery.com" className="text-brand-gold hover:underline">privacy@gjlottery.com</a></p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">7. Cookies</h2>
          <p>We use cookies and similar tracking technologies. See our <Link href="/cookie-policy" className="text-brand-gold hover:underline">Cookie Policy</Link> for details.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">8. Security / Sekirite</h2>
          <p>We implement industry-standard security measures including SSL/TLS encryption, two-factor authentication, and regular security audits to protect your data.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">9. Children / Timoun</h2>
          <p>Our platform is strictly for users aged 18 and over. We do not knowingly collect data from minors. If we discover we have collected data from a minor, we will immediately delete it.</p>
          <p className="text-gray-500 italic mt-1">Platfòm nou an se pou moun ki gen 18 an ak plis sèlman. Nou pa kolekte done timoun.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">10. Changes to This Policy / Chanjman nan Politik sa a</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">11. Contact / Kontakte Nou</h2>
          <p>For privacy-related questions or requests:<br />
            <a href="mailto:privacy@gjlottery.com" className="text-brand-gold hover:underline">privacy@gjlottery.com</a><br />
            G&amp;J Lottery, Legal Department
          </p>
        </section>
      </div>
    </div>
  );
}
