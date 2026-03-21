'use client';

import { useTranslations } from 'next-intl';
import { accountsApi } from '@/lib/accounts';
import { AccountForm } from '@/components/AccountForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default function NewAccountPage() {
  const t = useTranslations('accounts');
  const tCommon = useTranslations('common');

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <AccountForm
          title={t('createTitle')}
          submitLabel={tCommon('create')}
          onSubmit={accountsApi.create}
        />
      </div>
    </AuthLayout>
  );
}
