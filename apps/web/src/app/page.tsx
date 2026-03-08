'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('home');
  const tCommon = useTranslations('common');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">My Pocket</h1>
        <p className="text-lg text-muted-foreground mb-8">{t('tagline')}</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button variant="outline" size="lg">
              {t('signIn')}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg">{t('getStarted')}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
