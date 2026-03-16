import { api } from '@/lib/api';
import {
  RecurringTransaction,
  CreateRecurringTransactionDto,
  UpdateRecurringTransactionDto,
} from '@/types';

export const recurringTransactionsApi = {
  getAll: () => api.get<RecurringTransaction[]>('/recurring-transactions'),

  getById: (id: string) =>
    api.get<RecurringTransaction>(`/recurring-transactions/${id}`),

  create: (data: CreateRecurringTransactionDto) =>
    api.post<RecurringTransaction>('/recurring-transactions', data),

  update: (id: string, data: UpdateRecurringTransactionDto) =>
    api.put<RecurringTransaction>(`/recurring-transactions/${id}`, data),

  delete: (id: string) => api.delete<void>(`/recurring-transactions/${id}`),
};
