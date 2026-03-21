'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { accountsApi } from '@/lib/accounts';
import { Account } from '@/types';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';
import { formatCurrencyFromString } from '@/lib/formatters';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('accounts');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  useEffect(() => {
    if (isAuthenticated) {
      loadAccounts();
    }
  }, [isAuthenticated]);

  const loadAccounts = async () => {
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.statusCode === 401) {
          logout();
          router.push('/login');
          return;
        }
        toast.error(error.message);
      } else {
        toast.error(t('failedToLoad'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAccount) return;
    setIsDeleting(true);
    try {
      await accountsApi.delete(deleteAccount.id);
      setAccounts((prev) => prev.filter((a) => a.id !== deleteAccount.id));
      toast.success(t('deleteSuccess'));
      setDeleteAccount(null);
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.statusCode === 409) {
          toast.error(t('deleteBlockedByTransactions'));
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error(t('failedToDelete'));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">{t('title')}</h2>
        <Link href="/accounts/new">
          <Button>{t('newAccount')}</Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            {tCommon('loading')}
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noAccounts')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon('name')}</TableHead>
                  <TableHead>{tCommon('type')}</TableHead>
                  <TableHead>{t('initialBalance')}</TableHead>
                  <TableHead>{t('currentBalance')}</TableHead>
                  <TableHead className="text-right">
                    {tCommon('actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.name}
                    </TableCell>
                    <TableCell>{account.type}</TableCell>
                    <TableCell>
                      {formatCurrencyFromString(account.initialBalance, locale)}
                    </TableCell>
                    <TableCell
                      className={
                        account.currentBalance >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {formatCurrencyFromString(
                        String(account.currentBalance),
                        locale,
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/accounts/${account.id}/edit`}>
                        <Button variant="outline" size="sm">
                          {tCommon('edit')}
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteAccount(account)}
                      >
                        {tCommon('delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!deleteAccount}
        onOpenChange={() => setDeleteAccount(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm', { name: deleteAccount?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? tCommon('deleting') : tCommon('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthLayout>
  );
}
