import type { Metadata } from 'next';
import './globals.css';

// next/font/google reads a font-manifest file at runtime, which fails in
// Cloudflare Workers. Use a plain Google Fonts CSS link instead.
const inter = { className: '' };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gjlottery.com';
const APP_NAME = 'G&J Lottery';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'G&J Lottery — Paryaj Espò, Lotri & Casino Ayiti',
    template: '%s | G&J Lottery',
  },
  description:
    'Pi gwo platfòm paryaj espò, lotri, jwèt vityèl, ak casino ann Ayiti. Sports betting, virtual games, bolet lottery, and casino — in Haitian Creole, French, and English.',
  keywords: [
    'G&J Lottery', 'GJ Lottery', 'paryaj', 'lotri', 'bolèt', 'Ayiti', 'Haiti',
    'sports betting Haiti', 'paryaj espò', 'virtual football', 'horse racing Haiti',
    'bolet Haiti', 'casino Haiti', 'MonCash betting', 'NatCash betting',
    'haiti lottery online', 'paris sportifs Haiti',
  ],
  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon:   '/logo-icon.svg',
    shortcut: '/logo-icon.svg',
    apple:  '/logo-icon.svg',
  },
  openGraph: {
    title:       'G&J Lottery — Paryaj Espò, Lotri & Casino Ayiti',
    description: 'Pi gwo platfòm paryaj espò ak lotri ann Ayiti. Sports betting, bolet lottery, virtual games & casino.',
    siteName:    APP_NAME,
    locale:      'ht_HT',
    alternateLocale: ['fr_HT', 'en_US'],
    type:        'website',
    url:         APP_URL,
    images: [
      {
        url:    '/og-image.png',
        width:  1200,
        height: 630,
        alt:    'G&J Lottery — Haiti\'s #1 Betting Platform',
      },
    ],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'G&J Lottery — Paryaj Espò, Lotri & Casino Ayiti',
    description: 'Pi gwo platfòm paryaj espò ak lotri ann Ayiti. Sports betting, bolet lottery & casino.',
    images:      ['/og-image.png'],
    site:        '@gjlottery',
    creator:     '@gjlottery',
  },
  alternates: {
    canonical: APP_URL,
    languages: {
      'ht': `${APP_URL}/ht`,
      'fr': `${APP_URL}/fr`,
      'en': `${APP_URL}/en`,
    },
  },
  manifest: '/manifest.json',
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Replace after Google Search Console setup
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* Google Fonts — loaded via CSS link to avoid next/font filesystem access in Workers */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'G&J Lottery',
              url: APP_URL,
              logo: `${APP_URL}/logo.svg`,
              description: "Haiti's #1 sports betting, lottery, and casino platform.",
              sameAs: [
                'https://facebook.com/GJLottery',
                'https://instagram.com/gjlottery',
                'https://x.com/gjlottery',
                'https://linkedin.com/company/gjlottery',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'support@gjlottery.com',
                contactType: 'customer support',
                availableLanguage: ['Haitian Creole', 'French', 'English'],
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
