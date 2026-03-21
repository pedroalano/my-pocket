'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { accountsApi } from '@/lib/accounts';
import { AccountForm } from '@/components/AccountForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Account, AccountType, UpdateAccountDto } from '@/types';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';

export default function EditAccountPage() {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations('accounts');
  const tCommon = useTranslations('common');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await accountsApi.getById(id);
        setAccount(data);
      } catch (error) {
        if (error instanceof ApiException) {
          toast.error(error.message);
        } else {
          toast.error(t('failedToLoadSingle'));
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="p-8 text-center text-muted-foreground">
          {tCommon('loading')}
        </div>
      </AuthLayout>
    );
  }

  if (!account) {
    return (
      <AuthLayout>
        <div className="p-8 text-center text-muted-foreground">
          {t('notFound')}
        </div>
      </AuthLayout>
    );
  }

  const handleUpdate = (data: UpdateAccountDto) => accountsApi.update(id, data);

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <AccountForm
          title={t('editTitle')}
          submitLabel={tCommon('save')}
          initialData={{
            name: account.name,
            type: account.type as AccountType,
            initialBalance: parseFloat(account.initialBalance),
          }}
          onSubmit={handleUpdate}
        />
      </div>
    </AuthLayout>
  );
}
