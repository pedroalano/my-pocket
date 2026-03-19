'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { adminApi } from '@/lib/admin';
import { AdminUser } from '@/types';
import { Button } from '@/components/ui/button';

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      router.push('/dashboard');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!isLoading && user?.isAdmin) {
      adminApi
        .getUsers()
        .then(setUsers)
        .catch(() => setError(t('failedToLoad')))
        .finally(() => setLoadingUsers(false));
    }
  }, [isLoading, user, t]);

  async function handleStatusToggle(targetUser: AdminUser) {
    setUpdatingId(targetUser.id);
    try {
      const updated = await adminApi.updateUserStatus(
        targetUser.id,
        !targetUser.isActive,
      );
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(
        updated.isActive ? t('activateSuccess') : t('deactivateSuccess'),
      );
    } catch {
      toast.error(tCommon('unexpectedError'));
    } finally {
      setUpdatingId(null);
    }
  }

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            {t('userList.title')}
          </h1>
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t('backToAdmin')}
          </Link>
        </div>

        {loadingUsers && (
          <p className="text-muted-foreground">{tCommon('loading')}</p>
        )}
        {error && <p className="text-destructive">{error}</p>}

        {!loadingUsers && !error && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('userList.name')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('userList.email')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('userList.status')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('userList.emailVerified')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('userList.joined')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('userList.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="bg-card">
                    <td className="px-4 py-3 text-foreground">{u.name}</td>
                    <td className="px-4 py-3 text-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          u.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {u.isActive ? t('statusActive') : t('statusInactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {u.emailVerified ? '✓' : '✗'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant={u.isActive ? 'destructive' : 'outline'}
                        disabled={u.id === user.id || updatingId === u.id}
                        onClick={() => handleStatusToggle(u)}
                      >
                        {u.isActive ? t('deactivate') : t('activate')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
