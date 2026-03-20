import { api } from '@/lib/api';
import { PaginatedResponse } from '@my-pocket/shared';
import {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
} from '@/types';

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  type?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export const transactionsApi = {
  getAll: (params?: GetTransactionsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined)
      searchParams.set('page', String(params.page));
    if (params?.limit !== undefined)
      searchParams.set('limit', String(params.limit));
    if (params?.type) searchParams.set('type', params.type);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const qs = searchParams.toString();
    return api.get<PaginatedResponse<Transaction>>(
      `/transactions${qs ? `?${qs}` : ''}`,
    );
  },

  getById: (id: string) => api.get<Transaction>(`/transactions/${id}`),

  create: (data: CreateTransactionDto) =>
    api.post<Transaction>('/transactions', data),

  update: (id: string, data: UpdateTransactionDto) =>
    api.put<Transaction>(`/transactions/${id}`, data),

  delete: (id: string) => api.delete<void>(`/transactions/${id}`),
};
