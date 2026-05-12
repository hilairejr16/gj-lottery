

import { Briefcase, MapPin, Clock, ChevronRight } from 'lucide-react';

const openings = [
  {
    title: 'Senior Full-Stack Developer',
    dept: 'Engineering',
    location: 'Remote / Ayiti',
    type: 'Full-time',
    desc: 'Build and scale the core betting platform using Next.js, Node.js, and PostgreSQL. 3+ years experience required.',
  },
  {
    title: 'Mobile Developer (React Native)',
    dept: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    desc: 'Develop our iOS and Android apps using Expo/React Native. Experience with real-time data and animations required.',
  },
  {
    title: 'Customer Support Agent (Creole)',
    dept: 'Support',
    location: 'Port-au-Prince, Haiti 🇭🇹',
    type: 'Full-time',
    desc: 'Provide outstanding support to our users in Haitian Creole, French, and English via chat and email.',
  },
  {
    title: 'Sports Odds Trader',
    dept: 'Trading',
    location: 'Remote / Port-au-Prince',
    type: 'Full-time',
    desc: 'Monitor and manage sports odds, risk exposure, and market positions across all sports markets.',
  },
  {
    title: 'Marketing & Social Media Manager',
    dept: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    desc: 'Drive user acquisition and brand awareness via Facebook, Instagram, TikTok, and influencer partnerships in the Haitian community.',
  },
  {
    title: 'Affiliate Program Manager',
    dept: 'Growth',
    location: 'Remote',
    type: 'Contract',
    desc: 'Recruit, onboard, and manage affiliate partners. Track performance and develop incentive programs to grow our user base.',
  },
];

const perks = [
  '💰 Competitive salary in USD',
  '🌴 Flexible remote work',
  '📚 Learning & development budget',
  '🏆 Performance bonuses',
  '🌍 Work with a passionate team building Haiti\'s #1 betting platform',
  '📱 Latest equipment provided',
];

export default function JobsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Briefcase className="w-10 h-10 text-brand-gold mx-auto mb-4" />
        <h1 className="text-3xl font-black">Careers — Karyè / Emplois</h1>
        <p className="text-gray-400 mt-2 max-w-xl mx-auto">
          Join the team building Haiti's most exciting betting platform. / Rantre nan ekip ki ap bati platfòm paryaj ki pi eksite Ayiti a.
        </p>
      </div>

      {/* Perks */}
      <div className="p-6 bg-gradient-to-br from-brand-gold/10 to-bg-card border border-brand-gold/20 rounded-2xl mb-10">
        <h2 className="text-lg font-bold text-white mb-4">Why Join G&amp;J Lottery? / Poukisa Rantre?</h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {perks.map((p) => (
            <li key={p} className="text-sm text-gray-300">{p}</li>
          ))}
        </ul>
      </div>

      {/* Openings */}
      <h2 className="text-xl font-bold text-white mb-5">Open Positions / Pòs Disponib</h2>
      <div className="space-y-4">
        {openings.map((job) => (
          <div key={job.title} className="p-5 bg-bg-card border border-bg-border rounded-xl group hover:border-brand-gold transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-bold text-white group-hover:text-brand-gold transition-colors">{job.title}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.dept}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">{job.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-brand-gold transition-colors shrink-0 mt-1" />
            </div>
            <div className="mt-4">
              <a
                href={`mailto:careers@gjlottery.com?subject=Application: ${encodeURIComponent(job.title)}`}
                className="inline-block px-4 py-2 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold rounded-lg hover:bg-brand-gold hover:text-bg-base transition-colors"
              >
                Apply Now / Aplike Kounye a →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* General Application */}
      <div className="mt-10 text-center p-6 bg-bg-card border border-bg-border rounded-2xl">
        <p className="text-gray-300 font-semibold">Don't see a fit? / Ou pa wè yon pòs ki koresponn?</p>
        <p className="text-gray-500 text-sm mt-1">Send your CV and we'll keep you in mind for future openings.</p>
        <a href="mailto:careers@gjlottery.com?subject=General Application" className="mt-4 inline-block px-6 py-2.5 bg-brand-gold text-bg-base font-bold rounded-xl hover:bg-yellow-400 transition-colors text-sm">
          Send General Application / Voye Aplikasyon Jeneral
        </a>
      </div>
    </div>
  );
}
