'use client';

import { budgetsApi } from '@/lib/budgets';
import { BudgetForm } from '@/components/BudgetForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default function NewBudgetPage() {
  return (
    <AuthLayout>
      <div className="flex justify-center">
        <BudgetForm
          title="Create Budget"
          submitLabel="Create"
          onSubmit={budgetsApi.create}
        />
      </div>
    </AuthLayout>
  );
}
