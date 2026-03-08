'use client';

import { useTranslations } from 'next-intl';
import { transactionsApi } from '@/lib/transactions';
import { TransactionForm } from '@/components/TransactionForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default function NewTransactionPage() {
  const t = useTranslations('transactions');
  const tCommon = useTranslations('common');

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <TransactionForm
          title={t('createTitle')}
          submitLabel={tCommon('create')}
          onSubmit={transactionsApi.create}
        />
      </div>
    </AuthLayout>
  );
}
