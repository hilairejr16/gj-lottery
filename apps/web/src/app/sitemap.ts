import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gjlottery.com';
const LOCALES = ['ht', 'fr', 'en'];

function urls(path: string, priority: number, changeFreq: MetadataRoute.Sitemap[0]['changeFrequency']) {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Core pages
    ...urls('',                    1.0, 'daily'),
    ...urls('/sports',             0.9, 'hourly'),
    ...urls('/virtual',            0.9, 'hourly'),
    ...urls('/virtual/football',   0.8, 'always'),
    ...urls('/virtual/horses',     0.8, 'always'),
    ...urls('/lottery',            0.9, 'hourly'),
    ...urls('/casino',             0.8, 'daily'),

    // Auth
    ...urls('/register',           0.8, 'monthly'),
    ...urls('/login',              0.7, 'monthly'),

    // Public info
    ...urls('/about',              0.7, 'monthly'),
    ...urls('/contact',            0.7, 'monthly'),
    ...urls('/faq',                0.7, 'weekly'),
    ...urls('/blog',               0.7, 'weekly'),
    ...urls('/jobs',               0.6, 'weekly'),

    // Legal
    ...urls('/legal',              0.5, 'monthly'),
    ...urls('/terms',              0.5, 'monthly'),
    ...urls('/privacy',            0.5, 'monthly'),
    ...urls('/privacy-statement',  0.4, 'monthly'),
    ...urls('/cookie-policy',      0.4, 'monthly'),
    ...urls('/disclaimer',         0.4, 'monthly'),
    ...urls('/responsible-gambling', 0.6, 'monthly'),
  ];
}
