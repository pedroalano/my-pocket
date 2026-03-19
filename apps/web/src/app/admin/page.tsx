'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { adminApi } from '@/lib/admin';
import { AdminStats } from '@/types';

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!isLoading && user?.isAdmin) {
      adminApi
        .getStats()
        .then(setStats)
        .catch(() => setError(t('failedToLoad')))
        .finally(() => setLoadingStats(false));
    }
  }, [isLoading, user, t]);

  if (isLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>

        {loadingStats && (
          <p className="text-muted-foreground">{tCommon('loading')}</p>
        )}
        {error && <p className="text-destructive">{error}</p>}

        {stats && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {t('stats.title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('stats.totalUsers')}
                </p>
                <p className="text-4xl font-bold text-foreground mt-2">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('stats.activeUsers')}
                </p>
                <p className="text-4xl font-bold text-foreground mt-2">
                  {stats.activeUsers}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('stats.inactiveUsers')}
                </p>
                <p className="text-4xl font-bold text-foreground mt-2">
                  {stats.inactiveUsers}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t('manageUsers')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
