import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Static imports — dynamic template-literal imports are unreliable in
// Cloudflare Workers / edge bundling (esbuild may not resolve them at runtime).
import htMessages from '../messages/ht.json';
import frMessages from '../messages/fr.json';
import enMessages from '../messages/en.json';

const messagesMap: Record<string, Record<string, unknown>> = {
  ht: htMessages as Record<string, unknown>,
  fr: frMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as 'ht' | 'fr' | 'en')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messagesMap[locale] ?? htMessages,
    // Return the key path instead of throwing on missing translations
    onError(error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[next-intl]', error.message);
      }
    },
    getMessageFallback({ namespace, key }: { namespace?: string; key: string }) {
      return namespace ? `${namespace}.${key}` : key;
    },
  };
});
