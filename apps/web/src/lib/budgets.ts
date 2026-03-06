import { api } from '@/lib/api';
import {
  Budget,
  BudgetWithDetails,
  BudgetWithSpending,
  CreateBudgetDto,
  UpdateBudgetDto,
} from '@/types';

export const budgetsApi = {
  getAll: () => api.get<Budget[]>('/budgets'),

  getById: (id: string) => api.get<Budget>(`/budgets/${id}`),

  getDetails: (id: string) =>
    api.get<BudgetWithDetails>(`/budgets/${id}/details`),

  getByCategory: (categoryId: string) =>
    api.get<BudgetWithSpending[]>(`/budgets/category/${categoryId}`),

  create: (data: CreateBudgetDto) => api.post<Budget>('/budgets', data),

  update: (id: string, data: UpdateBudgetDto) =>
    api.put<Budget>(`/budgets/${id}`, data),

  delete: (id: string) => api.delete<void>(`/budgets/${id}`),
};
