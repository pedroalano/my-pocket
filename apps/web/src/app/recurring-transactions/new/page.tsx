'use client';

import { useTranslations } from 'next-intl';
import { recurringTransactionsApi } from '@/lib/recurring-transactions';
import { RecurringTransactionForm } from '@/components/RecurringTransactionForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default function NewRecurringTransactionPage() {
  const t = useTranslations('recurringTransactions');
  const tCommon = useTranslations('common');

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <RecurringTransactionForm
          title={t('createTitle')}
          submitLabel={tCommon('create')}
          onSubmit={recurringTransactionsApi.create}
        />
      </div>
    </AuthLayout>
  );
}
