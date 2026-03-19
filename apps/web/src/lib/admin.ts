import { api } from './api';
import { AdminStats, AdminUser } from '@/types';

export const adminApi = {
  getStats: () => api.get<AdminStats>('/admin/stats'),
  getUsers: () => api.get<AdminUser[]>('/admin/users'),
  updateUserStatus: (id: string, isActive: boolean) =>
    api.patch<AdminUser>(`/admin/users/${id}/status`, { isActive }),
};
