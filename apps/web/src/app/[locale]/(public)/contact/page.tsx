'use client';


import { useState } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Send, Facebook, Instagram } from 'lucide-react';

const channels = [
  { icon: Mail,    label: 'Email Support',    value: 'support@gjlottery.com',  href: 'mailto:support@gjlottery.com' },
  { icon: Mail,    label: 'Legal / Privacy',  value: 'legal@gjlottery.com',    href: 'mailto:legal@gjlottery.com' },
  { icon: MessageSquare, label: 'WhatsApp',   value: 'Chat with us',           href: 'https://wa.me/50900000000' },
  { icon: Facebook, label: 'Facebook',        value: '@GJLottery',             href: 'https://facebook.com/GJLottery' },
  { icon: Instagram,label: 'Instagram',       value: '@gjlottery',             href: 'https://instagram.com/gjlottery' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: POST to /api/contact
    setSent(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Mail className="w-10 h-10 text-brand-gold mx-auto mb-4" />
        <h1 className="text-3xl font-black">Contact Us — Kontakte Nou</h1>
        <p className="text-gray-400 mt-2">We typically respond within 24 hours / Nou reponn anjeneral nan 24 èdtan</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-5">Send a Message / Voye Yon Mesaj</h2>

          {sent ? (
            <div className="text-center py-10">
              <Send className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-green-400 font-bold text-lg">Message Sent! / Mesaj Voye!</p>
              <p className="text-gray-400 text-sm mt-2">We'll get back to you within 24 hours.</p>
              <button onClick={() => setSent(false)} className="mt-5 text-brand-gold text-sm hover:underline">Send another / Voye yon lòt</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Full Name / Non Konplè</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-bg-base border border-bg-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-gold"
                  placeholder="Jean Baptiste"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-bg-base border border-bg-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-gold"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Subject / Sijè</label>
                <select
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-bg-base border border-bg-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-gold"
                >
                  <option value="">Select topic / Chwazi sijè</option>
                  <option value="account">Account / Kont</option>
                  <option value="payment">Deposit / Withdrawal / Peman</option>
                  <option value="bet">Betting Issue / Pwoblèm Paryaj</option>
                  <option value="technical">Technical Issue / Pwoblèm Teknik</option>
                  <option value="responsible">Responsible Gambling / Paryaj Responsab</option>
                  <option value="other">Other / Lòt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Message</label>
                <textarea
                  required rows={4}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-bg-base border border-bg-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-gold resize-none"
                  placeholder="Describe your issue or question..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-brand-gold text-bg-base font-bold rounded-xl hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Message / Voye Mesaj
              </button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-5">
          <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Contact Channels / Kannal Kontak</h2>
            <ul className="space-y-4">
              {channels.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                    className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-brand-gold/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-brand-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm text-white group-hover:text-brand-gold transition-colors">{value}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-gold" /> Support Hours / Èdtan Sipò
            </h2>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Monday – Friday / Lendi – Vandredi: <span className="text-white">8:00 AM – 10:00 PM (EST)</span></p>
              <p>Saturday / Samdi: <span className="text-white">9:00 AM – 8:00 PM (EST)</span></p>
              <p>Sunday / Dimanch: <span className="text-white">10:00 AM – 6:00 PM (EST)</span></p>
            </div>
          </div>

          <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-gold" /> Headquarters / Sièj
            </h2>
            <p className="text-sm text-gray-400">G&amp;J Lottery<br />Port-au-Prince, Haiti 🇭🇹</p>
          </div>
        </div>
      </div>
    </div>
  );
}
