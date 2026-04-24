import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'GJ Lottery — Paryaj Espò & Lotri Ayiti',
    template: '%s | GJ Lottery',
  },
  description: 'Pi gwo platfòm paryaj espò ak lotri ann Ayiti. Sports betting, virtual games, and lottery.',
  keywords: ['GJ Lottery', 'paryaj', 'lotri', 'Ayiti', 'sports betting', 'Haiti'],
  icons: {
    icon:        '/logo-icon.svg',
    shortcut:    '/logo-icon.svg',
    apple:       '/logo-icon.svg',
  },
  openGraph: {
    title:       'GJ Lottery — Paryaj Espò & Lotri Ayiti',
    description: 'Pi gwo platfòm paryaj espò ak lotri ann Ayiti.',
    siteName:    'GJ Lottery',
    locale:      'ht_HT',
    type:        'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
