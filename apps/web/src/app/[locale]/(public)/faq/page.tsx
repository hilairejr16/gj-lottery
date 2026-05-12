'use client';


import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const faqs = [
  {
    category: 'Account / Kont',
    items: [
      { q: 'How do I create an account? / Kijan pou m kreye yon kont?', a: 'Click "Register" at the top of the page. Fill in your name, email, date of birth, and create a password. You must be 18+ to register. / Klike "Enskri" nan tèt paj la. Ranpli non ou, imèl, dat nesans, epi kreye yon modpas. Ou dwe gen 18 an ak plis pou enskri.' },
      { q: 'Can I have multiple accounts? / Eske m ka gen plizyè kont?', a: 'No. Each person is allowed only one account. Creating multiple accounts may result in permanent suspension. / Non. Chak moun gen dwa gen yon sèl kont. Kreye plizyè kont ka mennen nan sispan pèmanan.' },
      { q: 'How do I reset my password? / Kijan pou m reyinisyalize modpas mwen?', a: 'Click "Forgot Password" on the login page and enter your registered email. You\'ll receive a reset link within 5 minutes. / Klike "Bliye Modpas" sou paj koneksyon an epi antre imèl ou anrejistre a. W ap resevwa yon lyen nan 5 minit.' },
      { q: 'Why is my account suspended? / Poukisa kont mwen sispan?', a: 'Accounts may be suspended for Terms of Use violations, incomplete KYC verification, or suspicious activity. Contact support@gjlottery.com for details. / Kont yo ka sispan pou vyolasyon Tèm Itilizasyon, verifikasyon KYC enkompli, oswa aktivite sispèk.' },
    ],
  },
  {
    category: 'Deposits & Withdrawals / Depo ak Retrè',
    items: [
      { q: 'What payment methods are accepted? / Ki metòd peman ki aksepte?', a: 'We accept MonCash, NatCash, Stripe (credit/debit card), Zelle, CashApp, PayPal, Venmo, Wise, Remitly, and Interac. / Nou aksepte MonCash, NatCash, Stripe (kat kredi/debi), Zelle, CashApp, PayPal, Venmo, Wise, Remitly, ak Interac.' },
      { q: 'What is the minimum deposit? / Ki depozit minimòm?', a: 'The minimum deposit is 100 HTG. The minimum withdrawal is 500 HTG. / Depozit minimòm se 100 HTG. Retrè minimòm se 500 HTG.' },
      { q: 'How long do withdrawals take? / Konbyen tan retrè pran?', a: 'MonCash/NatCash: instant to 24 hours. Bank/wire transfers: 2–5 business days. Card withdrawals: 3–7 business days. / MonCash/NatCash: imedya jiska 24 èdtan. Virement bancaire: 2-5 jou travay. Retrè kat: 3-7 jou travay.' },
      { q: 'Do I need to verify my identity to withdraw? / Eske m bezwen verifye idantite mwen pou retire?', a: 'Yes. All withdrawal requests require KYC verification (government ID + proof of address). This protects your funds and complies with regulations. / Wi. Tout demann retrè bezwen verifikasyon KYC (ID gouvènman + prèv adrès).' },
    ],
  },
  {
    category: 'Betting / Paryaj',
    items: [
      { q: 'Can I cancel a bet? / Eske m ka anile yon paryaj?', a: 'No. All bets are final once placed and confirmed. Please review your bet slip carefully before submitting. / Non. Tout paryaj final yon fwa yo plase epi konfime. Tanpri revize fèy paryaj ou avèk swen anvan ou soumèt.' },
      { q: 'What sports are available? / Ki espò ki disponib?', a: 'We offer football (soccer), basketball, American football, baseball, MMA, boxing, tennis, and more. / Nou ofri foutbòl (sòkè), baskètbòl, foutbòl Ameriken, bèzbol, MMA, boks, tenis, ak plis.' },
      { q: 'What is a parlay? / Kisa yon parlay ye?', a: 'A parlay combines multiple selections into one bet. All selections must win for you to collect. The odds multiply, creating a larger potential payout. / Yon parlay konbine plizyè seleksyon nan yon sèl paryaj. Tout seleksyon dwe genyen pou w kolekte. Kòt yo miltiplye, kreye yon peman potansyèl pi gwo.' },
      { q: 'What is the maximum payout? / Ki peman maksimòm?', a: 'Maximum single bet payout is 500,000 HTG. This may vary by sport and market. / Peman paryaj maksimòm se 500,000 HTG. Sa a ka varyè selon espò ak mache.' },
    ],
  },
  {
    category: 'Lottery / Lotri',
    items: [
      { q: 'How does Bolet work? / Kijan Bolèt travay?', a: 'Choose one or two numbers from 00-99. If your number matches the draw result for the chosen bet type, you win a multiple of your stake. / Chwazi youn oswa de nimewo ant 00-99. Si nimewo ou matche rezilta tiraj la pou tip paryaj ou chwazi a, ou genyen yon miltip enjèk ou.' },
      { q: 'When are lottery draws? / Ki lè tiraj lotri yo fèt?', a: 'There are 3 daily draws: Morning (10:00 AM), Afternoon (3:00 PM), and Evening (8:00 PM) Haiti time. / Gen 3 tiraj chak jou: Maten (10:00 AM), Apremidi (3:00 PM), ak Aswè (8:00 PM) lè Ayiti.' },
      { q: 'How do I claim lottery winnings? / Kijan m ka reklame prim lotri?', a: 'Winnings are automatically credited to your wallet within minutes of the draw. No action required. / Prim yo otomatikman kredite nan pòtfèy ou nan kèk minit apre tiraj la. Pa gen aksyon ki nesesè.' },
    ],
  },
  {
    category: 'Responsible Gambling / Paryaj Responsab',
    items: [
      { q: 'How do I self-exclude? / Kijan pou m ekskli tèt mwen?', a: 'Go to Account Settings > Responsible Gambling > Self-Exclusion. Choose your exclusion period (1 month, 6 months, 1 year, or permanent). / Ale nan Paramèt Kont > Paryaj Responsab > Eksklizyyon Tèt. Chwazi peryòd eksklizyyon ou.' },
      { q: 'Can I set deposit limits? / Eske m ka mete limit depo?', a: 'Yes. Go to Account Settings > Responsible Gambling > Deposit Limits to set daily, weekly, or monthly caps. / Wi. Ale nan Paramèt Kont > Paryaj Responsab > Limit Depo pou mete plafon chak jou, chak semèn, oswa chak mwa.' },
    ],
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <HelpCircle className="w-10 h-10 text-brand-gold mx-auto mb-4" />
        <h1 className="text-3xl font-black">FAQ — Kesyon Souvan</h1>
        <p className="text-gray-400 mt-2">Frequently Asked Questions / Kesyon ki Poze Souvan</p>
      </div>

      <div className="space-y-8">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-sm font-semibold text-brand-gold uppercase tracking-widest mb-3">{section.category}</h2>
            <div className="space-y-2">
              {section.items.map((item) => {
                const key = section.category + item.q;
                const isOpen = open === key;
                return (
                  <div key={item.q} className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-white hover:text-brand-gold transition-colors"
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={`w-4 h-4 shrink-0 ml-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed border-t border-bg-border pt-4">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center p-6 bg-bg-card border border-bg-border rounded-xl">
        <p className="text-gray-400 text-sm">Still have questions? / Toujou gen kesyon?</p>
        <Link href="/contact" className="mt-3 inline-block px-6 py-2.5 bg-brand-gold text-bg-base font-bold rounded-xl hover:bg-yellow-400 transition-colors text-sm">
          Contact Support / Kontakte Sipò
        </Link>
      </div>
    </div>
  );
}
