'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <main className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          My Pocket
        </span>
        <h1 className="mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {t('headline')}
        </h1>
        <p className="mb-10 max-w-xl text-lg text-muted-foreground">
          {t('subheadline')}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/login">
            <Button variant="outline" size="lg">
              {t('signIn')}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg">{t('getStarted')}</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <TrendingUp className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>{t('features.track.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('features.track.description')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Target className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>{t('features.budgets.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('features.budgets.description')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>{t('features.insights.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('features.insights.description')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted px-6 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold">{t('ctaTitle')}</h2>
        <p className="mb-8 text-lg text-muted-foreground">{t('ctaSubtitle')}</p>
        <Link href="/register">
          <Button size="lg">{t('ctaButton')}</Button>
        </Link>
      </section>
    </main>
  );
}
