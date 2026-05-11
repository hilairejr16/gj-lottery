export const runtime = 'edge';

import { BookOpen, Calendar, Tag, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const posts = [
  {
    slug: 'how-to-bet-on-sports',
    title: 'Kijan pou Paryaje sou Espò / How to Bet on Sports',
    excerpt: 'A complete beginner\'s guide to sports betting on G&J Lottery — from odds to parlays. / Yon gid konplè pou debutant sou paryaj espò sou G&J Lottery — depi kòt rive parlay.',
    date: 'January 10, 2025',
    category: 'Guide',
    readTime: '5 min read',
    emoji: '⚽',
  },
  {
    slug: 'understanding-bolet',
    title: 'Konprann Bolèt Ayisyen an / Understanding Haitian Bolet',
    excerpt: 'Everything you need to know about playing bolet — how numbers are drawn, bet types, and payout multipliers. / Tout sa ou bezwen konnen sou jwèt bolèt — kijan nimewo yo tire, tip paryaj, ak miltip peman.',
    date: 'January 15, 2025',
    category: 'Lottery',
    readTime: '4 min read',
    emoji: '🎰',
  },
  {
    slug: 'responsible-gambling-tips',
    title: '7 Tips for Responsible Gambling / 7 Konsèy pou Paryaj Responsab',
    excerpt: 'Stay in control of your betting with these proven responsible gambling strategies. / Rete an kontwòl paryaj ou ak estrateji paryaj responsab sa yo ki pwouve.',
    date: 'January 20, 2025',
    category: 'Wellness',
    readTime: '3 min read',
    emoji: '🛡️',
  },
  {
    slug: 'virtual-games-explained',
    title: 'Virtual Football &amp; Horse Racing Explained / Foutbòl Vityèl ak Kous Cheval Eksplike',
    excerpt: 'Learn how our virtual games work, how results are determined fairly, and how to maximize your chances. / Aprann kijan jwèt vityèl nou yo travay, kijan rezilta yo detèmine yon fason ekitab.',
    date: 'February 1, 2025',
    category: 'Virtual Games',
    readTime: '4 min read',
    emoji: '🏇',
  },
  {
    slug: 'deposit-guide',
    title: 'How to Deposit with MonCash / Kijan Depoze ak MonCash',
    excerpt: 'Step-by-step guide on how to fund your G&J Lottery wallet using MonCash in under 2 minutes. / Gid pa etap sou kijan pou ranje pòtfèy G&J Lottery ou ak MonCash nan mwens pase 2 minit.',
    date: 'February 5, 2025',
    category: 'Payments',
    readTime: '3 min read',
    emoji: '💰',
  },
  {
    slug: 'top-betting-strategies',
    title: 'Top 5 Sports Betting Strategies / 5 Pi Bon Estrateji Paryaj Espò',
    excerpt: 'From value betting to bankroll management — the strategies professional bettors use to stay profitable. / De paryaj valè rive jesyon bankroll — estrateji paryè pwofesyonèl yo itilize.',
    date: 'February 10, 2025',
    category: 'Strategy',
    readTime: '6 min read',
    emoji: '📊',
  },
];

const categoryColors: Record<string, string> = {
  'Guide': 'bg-blue-900/30 text-blue-400',
  'Lottery': 'bg-yellow-900/30 text-yellow-400',
  'Wellness': 'bg-green-900/30 text-green-400',
  'Virtual Games': 'bg-purple-900/30 text-purple-400',
  'Payments': 'bg-orange-900/30 text-orange-400',
  'Strategy': 'bg-red-900/30 text-red-400',
};

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <BookOpen className="w-10 h-10 text-brand-gold mx-auto mb-4" />
        <h1 className="text-3xl font-black">Blog — G&amp;J Lottery News &amp; Guides</h1>
        <p className="text-gray-400 mt-2">Tips, guides, and updates in Haitian Creole, French, and English</p>
      </div>

      {/* Featured Post */}
      <div className="mb-8 p-6 bg-gradient-to-br from-brand-gold/10 to-bg-card border border-brand-gold/20 rounded-2xl">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{posts[0].emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[posts[0].category]}`}>{posts[0].category}</span>
              <span className="text-xs text-gray-500">Featured / Vedèt</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2"
              dangerouslySetInnerHTML={{ __html: posts[0].title }} />
            <p className="text-gray-400 text-sm mb-4">{posts[0].excerpt}</p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{posts[0].date}</span>
              <span>{posts[0].readTime}</span>
            </div>
          </div>
        </div>
        <Link href={`/blog/${posts[0].slug}`} className="mt-4 inline-flex items-center gap-2 text-brand-gold text-sm font-semibold hover:underline">
          Read More / Li Plis <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Post Grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {posts.slice(1).map((post) => (
          <div key={post.slug} className="p-5 bg-bg-card border border-bg-border rounded-xl hover:border-brand-gold transition-colors group">
            <div className="text-3xl mb-3">{post.emoji}</div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[post.category]}`}>{post.category}</span>
            <h3 className="font-bold text-white mt-3 mb-2 text-sm group-hover:text-brand-gold transition-colors leading-snug"
              dangerouslySetInnerHTML={{ __html: post.title }} />
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{post.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
              <span>{post.readTime}</span>
            </div>
            <Link href={`/blog/${post.slug}`} className="mt-3 inline-flex items-center gap-1 text-brand-gold text-xs font-semibold hover:underline">
              Read / Li <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>

      {/* Subscribe */}
      <div className="mt-12 text-center p-6 bg-bg-card border border-bg-border rounded-2xl">
        <BookOpen className="w-8 h-8 text-brand-gold mx-auto mb-3" />
        <h3 className="font-bold text-white mb-1">Stay Updated / Rete Enfòme</h3>
        <p className="text-gray-500 text-sm mb-4">Get the latest tips and news delivered to your inbox.</p>
        <div className="flex gap-2 max-w-sm mx-auto">
          <input
            type="email" placeholder="your@email.com"
            className="flex-1 px-4 py-2.5 bg-bg-base border border-bg-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-gold"
          />
          <button className="px-4 py-2.5 bg-brand-gold text-bg-base font-bold rounded-lg hover:bg-yellow-400 transition-colors text-sm">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
