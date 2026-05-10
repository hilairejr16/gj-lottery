export const runtime = 'edge';

import { AlertTriangle } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle className="w-8 h-8 text-yellow-400" />
        <h1 className="text-3xl font-black">Disclaimer — Avètisman</h1>
      </div>
      <p className="text-sm text-gray-500 mb-10">Last updated / Dènye mizajou: January 1, 2025</p>

      <div className="space-y-8 text-gray-300 leading-relaxed">

        <div className="p-5 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
          <p className="text-yellow-400 font-semibold mb-1">⚠️ Gambling Risk Warning / Avètisman Risk Paryaj</p>
          <p className="text-sm">Gambling involves financial risk. Never bet more than you can afford to lose. If gambling is causing problems in your life, seek help immediately.</p>
          <p className="text-sm text-gray-500 italic mt-1">Paryaj gen risk finansye. Pa janm paryaje plis pase sa ou ka pèdi. Si paryaj ap kreye pwoblèm nan lavi ou, chèche èd imedyatman.</p>
        </div>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">General Disclaimer / Avètisman Jeneral</h2>
          <p>The information provided on G&amp;J Lottery is for general informational and entertainment purposes only. G&amp;J Lottery makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of any information, products, services, or related graphics on the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Odds &amp; Predictions / Kòt ak Prediksyon</h2>
          <p>All odds displayed on G&amp;J Lottery are for wagering purposes and do not constitute guaranteed outcomes. AI-powered predictions and statistics are analytical tools only and are not guarantees of any result. Past performance does not predict future outcomes.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Financial Disclaimer / Avètisman Finansye</h2>
          <p>Betting and lottery participation carry inherent financial risk. G&amp;J Lottery is not a financial institution. Funds held in your wallet are not insured by any government deposit protection scheme. Only participate with money you can afford to lose entirely.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Third-Party Links / Lyen Twazyèm Pati</h2>
          <p>Our platform may contain links to external websites. G&amp;J Lottery has no control over the content, privacy policies, or practices of third-party sites and accepts no responsibility for them.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Jurisdiction / Jiridiksyon</h2>
          <p>G&amp;J Lottery is intended for use in jurisdictions where online gambling is lawful. It is your responsibility to ensure that using our platform is legal in your location. G&amp;J Lottery does not guarantee availability in all regions.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Age Restriction / Restriksyon Laj</h2>
          <p className="text-red-400 font-semibold">🔞 This platform is strictly for users aged 18 and over. Underage gambling is illegal and harmful.</p>
          <p className="text-gray-500 italic mt-1">Platfòm sa a se pou moun ki gen 18 an ak plis sèlman. Paryaj timoun se ilegal epi danjere.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Help / Èd</h2>
          <p>If gambling is affecting you or someone you know, contact a responsible gambling organization or visit our <a href="/responsible-gambling" className="text-brand-gold hover:underline">Responsible Gambling</a> page.</p>
        </section>
      </div>
    </div>
  );
}
