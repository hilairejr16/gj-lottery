import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales:       ['ht', 'fr', 'en'],
  defaultLocale: 'ht',
  localePrefix:  'always',
});
