'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 karaktè'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(t('errors.invalid_credentials'));
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white">{t('login_title')}</h1>
          <p className="text-gray-400 mt-1 text-sm">{t('login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label={t('email')}
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label={t('password')}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-brand-gold hover:underline">
              {t('forgot_password')}
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            {isSubmitting ? t('logging_in') : t('login_btn')}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {t('no_account')}
          <Link href="/register" className="text-brand-gold font-semibold hover:underline">
            {t('register_btn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
