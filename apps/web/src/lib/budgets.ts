import { api } from '@/lib/api';
import { Budget, CreateBudgetDto, UpdateBudgetDto } from '@/types';

export const budgetsApi = {
  getAll: () => api.get<Budget[]>('/budgets'),

  getById: (id: string) => api.get<Budget>(`/budgets/${id}`),

  create: (data: CreateBudgetDto) => api.post<Budget>('/budgets', data),

  update: (id: string, data: UpdateBudgetDto) =>
    api.put<Budget>(`/budgets/${id}`, data),

  delete: (id: string) => api.delete<void>(`/budgets/${id}`),
};
