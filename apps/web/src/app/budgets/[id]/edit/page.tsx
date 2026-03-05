'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { budgetsApi } from '@/lib/budgets';
import { BudgetForm } from '@/components/BudgetForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Budget, UpdateBudgetDto } from '@/types';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';

export default function EditBudgetPage() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoadingBudget, setIsLoadingBudget] = useState(true);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const budgetId = params.id as string;

  useEffect(() => {
    if (isAuthenticated && budgetId) {
      loadBudget();
    }
  }, [isAuthenticated, budgetId]);

  const loadBudget = async () => {
    try {
      const data = await budgetsApi.getById(budgetId);
      setBudget(data);
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.statusCode === 404) {
          toast.error('Budget not found');
          router.push('/budgets');
          return;
        }
        if (error.statusCode === 401) {
          logout();
          router.push('/login');
          return;
        }
        toast.error(error.message);
      } else {
        toast.error('Failed to load budget');
      }
      router.push('/budgets');
    } finally {
      setIsLoadingBudget(false);
    }
  };

  const handleUpdate = async (data: UpdateBudgetDto) => {
    await budgetsApi.update(budgetId, data);
  };

  return (
    <AuthLayout>
      <div className="flex justify-center">
        {isLoadingBudget ? (
          <p className="text-gray-500">Loading budget...</p>
        ) : budget ? (
          <BudgetForm
            title="Edit Budget"
            submitLabel="Save Changes"
            initialData={{
              amount: parseFloat(budget.amount),
              categoryId: budget.categoryId,
              month: budget.month,
              year: budget.year,
              type: budget.type,
            }}
            onSubmit={handleUpdate}
          />
        ) : null}
      </div>
    </AuthLayout>
  );
}
