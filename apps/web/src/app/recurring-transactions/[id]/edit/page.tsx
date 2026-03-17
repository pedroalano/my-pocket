'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { recurringTransactionsApi } from '@/lib/recurring-transactions';
import { RecurringTransactionForm } from '@/components/RecurringTransactionForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { RecurringTransaction, UpdateRecurringTransactionDto } from '@/types';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';

export default function EditRecurringTransactionPage() {
  const [recurringTransaction, setRecurringTransaction] =
    useState<RecurringTransaction | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const t = useTranslations('recurringTransactions');
  const tCommon = useTranslations('common');

  useEffect(() => {
    if (isAuthenticated && itemId) {
      loadItem();
    }
  }, [isAuthenticated, itemId]);

  const loadItem = async () => {
    try {
      const data = await recurringTransactionsApi.getById(itemId);
      setRecurringTransaction(data);
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.statusCode === 404) {
          toast.error(t('failedToLoadSingle'));
          router.push('/recurring-transactions');
          return;
        }
        if (error.statusCode === 401) {
          logout();
          router.push('/login');
          return;
        }
        toast.error(error.message);
      } else {
        toast.error(t('failedToLoadSingle'));
      }
      router.push('/recurring-transactions');
    } finally {
      setIsLoadingItem(false);
    }
  };

  const handleUpdate = async (data: UpdateRecurringTransactionDto) => {
    await recurringTransactionsApi.update(itemId, data);
  };

  const formatDateForInput = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0];
  };

  return (
    <AuthLayout>
      <div className="flex justify-center">
        {isLoadingItem ? (
          <p className="text-gray-500">{tCommon('loading')}</p>
        ) : recurringTransaction ? (
          <RecurringTransactionForm
            title={t('editTitle')}
            submitLabel={tCommon('save')}
            initialData={{
              amount: parseFloat(recurringTransaction.amount),
              categoryId: recurringTransaction.categoryId,
              description: recurringTransaction.description,
              interval: recurringTransaction.interval,
              startDate: formatDateForInput(recurringTransaction.startDate),
              endDate: recurringTransaction.endDate
                ? formatDateForInput(recurringTransaction.endDate)
                : undefined,
              isActive: recurringTransaction.isActive,
            }}
            onSubmit={handleUpdate}
          />
        ) : null}
      </div>
    </AuthLayout>
  );
}
