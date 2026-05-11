export const runtime = 'edge';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

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

  const messages = await getMessages();

  function getMessageFallback({ namespace, key }: { namespace?: string; key: string }) {
    return namespace ? `${namespace}.${key}` : key;
  }

  return (
    <NextIntlClientProvider messages={messages} onError={() => {}} getMessageFallback={getMessageFallback}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#152035',
            color: '#ffffff',
            border: '1px solid #1E3A5F',
          },
          success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
        }}
      />
    </NextIntlClientProvider>
  );
}
