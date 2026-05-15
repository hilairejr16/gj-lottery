import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gjlottery.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  typescript: {
    // Type errors are caught in CI; don't block Cloudflare builds
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Force HTTPS for 2 years, include subdomains
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Control referrer info sent to other sites
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable browser features not needed
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(self)' },
          // DNS prefetch for performance
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js requires unsafe-eval in dev; scripts from Stripe and Google
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com",
              // Styles from self + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts from Google
              "font-src 'self' https://fonts.gstatic.com",
              // Images from self, data URIs, Supabase, and HTTPS
              "img-src 'self' data: blob: https:",
              // API connections: Supabase REST + WebSocket, Stripe
              `connect-src 'self' ${SUPABASE_URL} ${SUPABASE_URL.replace('https://', 'wss://')} https://api.stripe.com https://accounts.google.com`,
              // Stripe iframes for payment elements
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com",
              // No plugins (Flash etc.)
              "object-src 'none'",
              // Prevent base tag injection
              "base-uri 'self'",
              // Only submit forms to own origin
              "form-action 'self'",
              // Upgrade HTTP to HTTPS
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
