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

// Common DTOs (can be extended in each app)
export interface BaseUser {
  id: string;
  email: string;
  name: string;
}

export interface BaseCategory {
  id: string;
  name: string;
  type: TransactionType;
}

export interface BaseTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
  categoryId: string;
}

export interface BaseBudget {
  id: string;
  name: string;
  amount: number;
  type: BudgetType;
  month: number;
  year: number;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
