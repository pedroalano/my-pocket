'use client';

import { useTranslations } from 'next-intl';
import { budgetsApi } from '@/lib/budgets';
import { BudgetForm } from '@/components/BudgetForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default function NewBudgetPage() {
  const t = useTranslations('budgets');
  const tCommon = useTranslations('common');

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <BudgetForm
          title={t('createTitle')}
          submitLabel={tCommon('create')}
          onSubmit={budgetsApi.create}
        />
      </div>
    </AuthLayout>
  );
}
