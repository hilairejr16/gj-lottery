

import { Lock } from 'lucide-react';

export default function PrivacyStatementPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-2">
        <Lock className="w-8 h-8 text-brand-gold" />
        <h1 className="text-3xl font-black">Privacy Statement — Deklarasyon Konfidansyalite</h1>
      </div>
      <p className="text-sm text-gray-500 mb-10">Effective / Antre an vigè: January 1, 2025</p>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <div className="p-6 bg-bg-card border border-brand-gold/30 rounded-xl">
          <p className="text-white font-semibold mb-2">Our Commitment / Angajman Nou</p>
          <p>G&amp;J Lottery is committed to maintaining the trust and confidence of all visitors to our platform. We want you to know that we are not in the business of selling, renting, or trading email lists with other companies and businesses for marketing purposes.</p>
          <p className="text-gray-500 italic mt-2">G&amp;J Lottery angaje pou kenbe konfyans tout vizitè platfòm nou an. Nou pa vann, lwe, ni echanje lis imèl ak lòt konpayi pou rezon maketing.</p>
        </div>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">What Data We Collect / Ki Done Nou Kolekte</h2>
          <p>When you register with G&amp;J Lottery, we ask for identifying information such as your name, email address, date of birth, and contact details. We collect this to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Verify your identity and age (18+ only)</li>
            <li>Manage your account securely</li>
            <li>Process financial transactions</li>
            <li>Comply with responsible gambling regulations</li>
            <li>Prevent fraud and money laundering</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Google Analytics &amp; Third-Party Tools</h2>
          <p>Like many platforms, we use Google Analytics to understand how our users engage with our site. Google Analytics collects standard internet log information and visitor behavior information anonymously. This information is processed in a way which does not identify anyone.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Your Choices / Chwa Ou</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You may opt-out of marketing emails at any time using the unsubscribe link.</li>
            <li>You may request deletion of your personal data by contacting our privacy team.</li>
            <li>You may disable cookies in your browser settings (see our Cookie Policy).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Questions / Kesyon</h2>
          <p>If you have questions about this Privacy Statement, please contact us at <a href="mailto:privacy@gjlottery.com" className="text-brand-gold hover:underline">privacy@gjlottery.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
