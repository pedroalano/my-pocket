import { api } from '@/lib/api';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),

  getById: (id: string) => api.get<Category>(`/categories/${id}`),

  create: (data: CreateCategoryDto) => api.post<Category>('/categories', data),

  update: (id: string, data: UpdateCategoryDto) =>
    api.put<Category>(`/categories/${id}`, data),

  delete: (id: string) => api.delete<void>(`/categories/${id}`),
};
