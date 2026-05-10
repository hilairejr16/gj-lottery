export const runtime = 'edge';

import { Scale, Heart, Phone, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ResponsibleGamblingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="flex items-center gap-3 mb-2">
        <Scale className="w-8 h-8 text-brand-gold" />
        <h1 className="text-3xl font-black">Responsible Gambling — Paryaj Responsab</h1>
      </div>
      <p className="text-sm text-gray-500 mb-10">G&amp;J Lottery cares about your wellbeing / G&amp;J Lottery pran swen byennèt ou</p>

      {/* Emergency Banner */}
      <div className="p-5 bg-red-900/30 border border-red-500/50 rounded-xl mb-10 flex items-start gap-4">
        <Phone className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-400">Need Help Now? / Bezwen Èd Kounye a?</p>
          <p className="text-sm text-gray-300 mt-1">If gambling is harming you or someone you love, reach out immediately:</p>
          <ul className="text-sm mt-2 space-y-1">
            <li>📞 <strong className="text-white">National Problem Gambling Helpline:</strong> 1-800-522-4700</li>
            <li>💬 <a href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">ncpgambling.org</a></li>
            <li>📧 <a href="mailto:support@gjlottery.com" className="text-brand-gold hover:underline">support@gjlottery.com</a></li>
          </ul>
        </div>
      </div>

      <div className="space-y-8 text-gray-300 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" /> Our Commitment / Angajman Nou
          </h2>
          <p>G&amp;J Lottery is committed to providing a safe and responsible gambling environment. We believe that gambling should be an enjoyable form of entertainment — not a way to make money or escape problems.</p>
          <p className="text-gray-500 italic mt-2">G&amp;J Lottery angaje pou bay yon anviwonnman paryaj san epi responsab. Nou kwè paryaj ta dwe yon fòm divètisman pleziran — pa yon fason pou fè lajan oswa sove pwoblèm.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Signs of Problem Gambling / Siy Pwoblèm Paryaj</h2>
          <p className="mb-3">Ask yourself honestly / Poze tèt ou onètman:</p>
          <ul className="space-y-2">
            {[
              'Do you bet more than you can afford to lose?',
              'Do you gamble to escape problems or relieve feelings of anxiety or depression?',
              'Have you lied to family members about your gambling?',
              'Do you feel the need to bet with increasing amounts of money?',
              'Have you tried to stop gambling but failed?',
              'Do you borrow money or sell things to fund gambling?',
              'Has gambling caused problems in your relationships or work?',
            ].map((q, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">›</span>
                <span className="text-sm">{q}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-yellow-400 text-sm font-semibold">If you answered YES to 3 or more, please seek help.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-gold" /> Tools We Offer / Zouti Nou Ofri
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Deposit Limits / Limit Depo', desc: 'Set daily, weekly, or monthly deposit caps to stay in control.' },
              { title: 'Bet Limits / Limit Paryaj', desc: 'Limit the maximum amount you can wager per bet or per day.' },
              { title: 'Cooling-Off Period / Peryòd Repo', desc: 'Take a break from 24 hours up to 30 days. No betting during this period.' },
              { title: 'Self-Exclusion / Eksklizyyon', desc: 'Permanently or temporarily close your account and block access.' },
              { title: 'Reality Check / Chèk Reyalite', desc: 'Set reminders showing how long you\'ve been playing and your net position.' },
              { title: 'Account History', desc: 'View all bets, deposits, and withdrawals at any time in your account dashboard.' },
            ].map((tool, i) => (
              <div key={i} className="p-4 bg-bg-card border border-bg-border rounded-lg">
                <p className="font-semibold text-white text-sm">{tool.title}</p>
                <p className="text-xs text-gray-500 mt-1">{tool.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">To activate any of these tools, go to <Link href="/dashboard" className="text-brand-gold hover:underline">Account Settings</Link> or contact <a href="mailto:support@gjlottery.com" className="text-brand-gold hover:underline">support@gjlottery.com</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Tips for Safe Gambling / Konsèy pou Paryaj San</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Set a budget before you start and stick to it.</li>
            <li>Never chase your losses — accept them as the cost of entertainment.</li>
            <li>Take regular breaks and do not play when tired, stressed, or upset.</li>
            <li>Balance gambling with other recreational activities.</li>
            <li>Never gamble under the influence of alcohol or drugs.</li>
            <li>Do not borrow money to gamble.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">Protecting Minors / Pwoteje Minè</h2>
          <p>G&amp;J Lottery is strictly for adults aged 18 and over. If you share a device with children, we recommend using parental control software:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
            <li><a href="https://www.gamblock.com" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">GamBlock</a></li>
            <li><a href="https://www.netnanny.com" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">Net Nanny</a></li>
            <li><a href="https://www.cyberpatrol.com" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">CYBERsitter</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
