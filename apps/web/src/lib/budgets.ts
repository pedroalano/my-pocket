import { api } from '@/lib/api';
import { PaginatedResponse } from '@/lib/types';
import {
  Budget,
  BatchBudgetResponse,
  BudgetWithDetails,
  BudgetWithSpending,
  CreateBatchBudgetDto,
  CreateBudgetDto,
  UpdateBudgetDto,
} from '@/types';

export interface GetBudgetsParams {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  type?: string;
}

export const budgetsApi = {
  getAll: (params?: GetBudgetsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined)
      searchParams.set('page', String(params.page));
    if (params?.limit !== undefined)
      searchParams.set('limit', String(params.limit));
    if (params?.month !== undefined)
      searchParams.set('month', String(params.month));
    if (params?.year !== undefined)
      searchParams.set('year', String(params.year));
    if (params?.type) searchParams.set('type', params.type);
    const qs = searchParams.toString();
    return api.get<PaginatedResponse<Budget>>(`/budgets${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => api.get<Budget>(`/budgets/${id}`),

  getDetails: (id: string) =>
    api.get<BudgetWithDetails>(`/budgets/${id}/details`),

  getByCategory: (categoryId: string) =>
    api.get<BudgetWithSpending[]>(`/budgets/category/${categoryId}`),

  create: (data: CreateBudgetDto) => api.post<Budget>('/budgets', data),

  createBatch: (data: CreateBatchBudgetDto) =>
    api.post<BatchBudgetResponse>('/budgets/batch', data),

  update: (id: string, data: UpdateBudgetDto) =>
    api.put<Budget>(`/budgets/${id}`, data),

  delete: (id: string) => api.delete<void>(`/budgets/${id}`),
};
