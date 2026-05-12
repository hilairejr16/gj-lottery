import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ToastProvider from '@/components/ui/toast-provider';

// Static imports so the bundler always includes all three message files.
// We intentionally bypass getMessages() here because it requires the
// next-intl server context to be populated first — which can fail in
// Cloudflare Workers when the context setup lags behind rendering.
import htMessages from '@/messages/ht.json';
import frMessages from '@/messages/fr.json';
import enMessages from '@/messages/en.json';

const messagesMap = {
  ht: htMessages,
  fr: frMessages,
  en: enMessages,
} as const;

function getMessageFallback({ namespace, key }: { namespace?: string; key: string }) {
  return namespace ? `${namespace}.${key}` : key;
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'ht' | 'fr' | 'en')) {
    notFound();
  }

  const messages = messagesMap[locale as keyof typeof messagesMap] ?? htMessages;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={() => {}}
      getMessageFallback={getMessageFallback}
    >
      {children}
      <ToastProvider />
    </NextIntlClientProvider>
  );
}
