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
  full_name:        z.string().min(2, 'Non obligatwa'),
  username:         z.string().min(3, 'Minimum 3 karaktè').regex(/^[a-zA-Z0-9_]+$/, 'Sèlman lèt, chif, ak _'),
  email:            z.string().email('Email invalide'),
  phone:            z.string().optional(),
  password:         z.string().min(8, 'Minimum 8 karaktè'),
  confirm_password: z.string(),
  terms:            z.boolean().refine(v => v, 'Ou dwe aksepte tèm yo'),
  age:              z.boolean().refine(v => v, 'Ou dwe gen 18 an'),
}).refine(d => d.password === d.confirm_password, {
  message: 'Modpas yo pa menm',
  path: ['confirm_password'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name:      data.full_name,
          username:       data.username,
          phone:          data.phone || null,
          preferred_lang: 'ht',
        },
      },
    });

    if (error) {
      if (error.message.includes('already')) {
        toast.error('Imèl sa a deja itilize / Cet e-mail est déjà utilisé');
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success('Kont kreye! Byenveni nan GJ Lottery 🎉');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white">{t('register_title')}</h1>
          <p className="text-gray-400 mt-1 text-sm">{t('register_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('full_name')}
            type="text"
            placeholder="Jean Paul"
            error={errors.full_name?.message}
            required
            {...register('full_name')}
          />
          <Input
            label={t('username')}
            type="text"
            placeholder="jeanpaul99"
            error={errors.username?.message}
            required
            {...register('username')}
          />
          <Input
            label={t('email')}
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            required
            {...register('email')}
          />
          <Input
            label={t('phone')}
            type="tel"
            placeholder="+509 XXXX XXXX"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label={t('password')}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            required
            {...register('password')}
          />
          <Input
            label={t('confirm_password')}
            type="password"
            placeholder="••••••••"
            error={errors.confirm_password?.message}
            required
            {...register('confirm_password')}
          />

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-brand-gold" {...register('terms')} />
              <span className="text-sm text-gray-400">{t('terms_agree')}</span>
            </label>
            {errors.terms && <p className="text-xs text-danger ml-6">{errors.terms.message}</p>}

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-brand-gold" {...register('age')} />
              <span className="text-sm text-gray-400">{t('age_confirm')}</span>
            </label>
            {errors.age && <p className="text-xs text-danger ml-6">{errors.age.message}</p>}
          </div>

          <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
            {isSubmitting ? t('registering') : t('register_btn')}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {t('have_account')}
          <Link href="/login" className="text-brand-gold font-semibold hover:underline">
            {t('login_btn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
