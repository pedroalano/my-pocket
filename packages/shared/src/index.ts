// Shared types and utilities for My Pocket applications

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common enums
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum BudgetType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

// Utility types
export type Optional<T> = T | undefined;
