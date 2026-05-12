

import { Cookie } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-2">
        <Cookie className="w-8 h-8 text-brand-gold" />
        <h1 className="text-3xl font-black">Cookie Policy — Politik Koki</h1>
      </div>
      <p className="text-sm text-gray-500 mb-10">Last updated / Dènye mizajou: January 1, 2025</p>

      <div className="space-y-8 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white mb-3">What Are Cookies? / Kisa Koki Ye?</h2>
          <p>Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit, making your next visit easier and the site more useful to you.</p>
          <p className="text-gray-500 italic mt-2">Koki se ti fichye tèks ki estoke sou aparèy ou lè ou vizite yon sitwèb. Yo ede sitwèb yo sonje enfòmasyon sou vizit ou.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Types of Cookies We Use / Tip Koki Nou Itilize</h2>
          <div className="space-y-4">
            <div className="p-4 bg-bg-card border border-bg-border rounded-lg">
              <h3 className="font-semibold text-white">🔒 Essential Cookies / Koki Esansyèl</h3>
              <p className="text-sm mt-1">Required for the platform to function. They enable core features like login sessions, security, and wallet access. Cannot be disabled.</p>
            </div>
            <div className="p-4 bg-bg-card border border-bg-border rounded-lg">
              <h3 className="font-semibold text-white">📊 Analytics Cookies / Koki Analitik</h3>
              <p className="text-sm mt-1">Help us understand how users interact with our platform (e.g., Google Analytics). Data is anonymous and aggregated.</p>
            </div>
            <div className="p-4 bg-bg-card border border-bg-border rounded-lg">
              <h3 className="font-semibold text-white">⚙️ Functionality Cookies / Koki Fonksyonnalite</h3>
              <p className="text-sm mt-1">Remember your preferences such as language selection, currency, and odds format.</p>
            </div>
            <div className="p-4 bg-bg-card border border-bg-border rounded-lg">
              <h3 className="font-semibold text-white">🎯 Marketing Cookies / Koki Maketing</h3>
              <p className="text-sm mt-1">Used to deliver relevant advertisements and track campaign effectiveness. You may opt out.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Third-Party Cookies / Koki Twazyèm Pati</h2>
          <p>We use services from third parties that may also set cookies on your device:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong className="text-white">Google Analytics</strong> — usage analysis</li>
            <li><strong className="text-white">Stripe</strong> — payment processing</li>
            <li><strong className="text-white">Intercom / Crisp</strong> — customer support chat</li>
            <li><strong className="text-white">Facebook Pixel</strong> — advertising (if applicable)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Managing Cookies / Jere Koki</h2>
          <p>You can control cookies through your browser settings:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong className="text-white">Chrome:</strong> Settings → Privacy and Security → Cookies</li>
            <li><strong className="text-white">Firefox:</strong> Options → Privacy &amp; Security → Cookies</li>
            <li><strong className="text-white">Safari:</strong> Preferences → Privacy → Cookies</li>
            <li><strong className="text-white">Edge:</strong> Settings → Cookies and site permissions</li>
          </ul>
          <p className="mt-3 text-yellow-400 text-sm">⚠️ Disabling essential cookies will affect platform functionality, including your ability to log in and place bets.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Contact / Kontakte Nou</h2>
          <p>Questions about cookies? Email us at <a href="mailto:privacy@gjlottery.com" className="text-brand-gold hover:underline">privacy@gjlottery.com</a></p>
        </section>
      </div>
    </div>
  );
}
