import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3001';

// Mock data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  isAdmin: false,
};

export const mockAdminUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  isAdmin: true,
};

export const mockCategories = [
  {
    id: 'cat-1',
    name: 'Salary',
    type: 'INCOME',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Groceries',
    type: 'EXPENSE',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

export const mockBudgets = [
  {
    id: 'budget-1',
    amount: '500.00',
    categoryId: 'cat-2',
    month: 3,
    year: 2026,
    type: 'EXPENSE',
    userId: 'test-user-id',
  },
  {
    id: 'budget-2',
    amount: '3000.00',
    categoryId: 'cat-1',
    month: 3,
    year: 2026,
    type: 'INCOME',
    userId: 'test-user-id',
  },
];

export const mockTransactions = [
  {
    id: 'transaction-1',
    amount: '150.00',
    type: 'EXPENSE',
    categoryId: 'cat-2',
    date: '2026-03-01T10:00:00.000Z',
    description: 'Grocery shopping',
    userId: 'test-user-id',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'transaction-2',
    amount: '3000.00',
    type: 'INCOME',
    categoryId: 'cat-1',
    date: '2026-03-05T09:00:00.000Z',
    description: 'Monthly salary',
    userId: 'test-user-id',
    createdAt: '2026-03-05T09:00:00.000Z',
    updatedAt: '2026-03-05T09:00:00.000Z',
  },
];

// Mock budget with spending calculations
export const mockBudgetWithDetails = {
  id: 'budget-1',
  amount: '500.00',
  categoryId: 'cat-2',
  month: 3,
  year: 2026,
  type: 'EXPENSE',
  category: mockCategories[1], // Groceries
  transactions: [mockTransactions[0]], // Only grocery transaction
  spent: '150.00',
  remaining: '350.00',
  utilizationPercentage: 30,
};

export const mockBudgetsWithSpending = [
  {
    id: 'budget-1',
    amount: '500.00',
    categoryId: 'cat-2',
    month: 3,
    year: 2026,
    type: 'EXPENSE',
    spent: '150.00',
    remaining: '350.00',
    utilizationPercentage: 30,
  },
  {
    id: 'budget-2',
    amount: '3000.00',
    categoryId: 'cat-1',
    month: 3,
    year: 2026,
    type: 'INCOME',
    earned: '3000.00',
    remaining: '0.00',
    utilizationPercentage: 100,
  },
];

// Dashboard mock data
export const mockMonthlySummary = {
  totalIncome: 3000,
  totalExpense: 150,
  balance: 2850,
};

export const mockBudgetVsActual = [
  {
    categoryId: 'cat-2',
    category: { id: 'cat-2', name: 'Groceries', type: 'EXPENSE' },
    budget: 500,
    actual: 150,
    difference: 350,
    percentageUsed: 30,
  },
  {
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Salary', type: 'INCOME' },
    budget: 3000,
    actual: 3000,
    difference: 0,
    percentageUsed: 100,
  },
];

export const mockCategoryBreakdown = [
  {
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Salary', type: 'INCOME' },
    totalAmount: 3000,
    percentage: 95.24,
  },
  {
    categoryId: 'cat-2',
    category: { id: 'cat-2', name: 'Groceries', type: 'EXPENSE' },
    totalAmount: 150,
    percentage: 4.76,
  },
];

export const mockTopExpenses = [
  {
    id: 'transaction-1',
    description: 'Grocery shopping',
    date: '2026-03-01T10:00:00.000Z',
    amount: 150,
    category: { id: 'cat-2', name: 'Groceries', type: 'EXPENSE' },
  },
];

export const mockRecurringTransactions = [
  {
    id: 'rt-1',
    amount: '15.00',
    type: 'EXPENSE',
    categoryId: 'cat-2',
    description: 'Netflix',
    interval: 'MONTHLY',
    startDate: '2026-01-01T00:00:00.000Z',
    nextRun: '2026-04-01T00:00:00.000Z',
    isActive: true,
    userId: 'user-123',
    endDate: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'rt-2',
    amount: '3000.00',
    type: 'INCOME',
    categoryId: 'cat-1',
    description: 'Salary',
    interval: 'MONTHLY',
    startDate: '2026-01-01T00:00:00.000Z',
    nextRun: '2026-04-01T00:00:00.000Z',
    isActive: true,
    userId: 'user-123',
    endDate: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export const mockAdminUsers = [
  {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    isActive: true,
    emailVerified: true,
    isAdmin: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user-2',
    name: 'Alice',
    email: 'alice@example.com',
    isActive: true,
    emailVerified: true,
    isAdmin: false,
    createdAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'user-3',
    name: 'Bob',
    email: 'bob@example.com',
    isActive: false,
    emailVerified: true,
    isAdmin: false,
    createdAt: '2024-01-03T00:00:00.000Z',
  },
];

// Generate a valid-looking JWT for testing
export const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNzA0MDY3MjAwfQ.fake-signature';

export const mockRefreshToken = 'mock-refresh-token-value';

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auths/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'unverified@example.com') {
      return HttpResponse.json(
        {
          message: 'Please verify your email address before logging in',
          statusCode: 403,
        },
        { status: 403 },
      );
    }
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        access_token: mockToken,
        refresh_token: mockRefreshToken,
      });
    }
    return HttpResponse.json(
      { message: 'Invalid credentials', statusCode: 401 },
      { status: 401 },
    );
  }),

  http.post(`${API_URL}/auths/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string };
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { message: 'Email already exists', statusCode: 409 },
        { status: 409 },
      );
    }
    return HttpResponse.json({
      message: 'Verification email sent. Please check your inbox.',
    });
  }),

  http.post(`${API_URL}/auths/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refresh_token: string };
    if (body.refresh_token === mockRefreshToken) {
      return HttpResponse.json({
        access_token: mockToken,
        refresh_token: mockRefreshToken,
      });
    }
    return HttpResponse.json(
      { message: 'Invalid refresh token', statusCode: 401 },
      { status: 401 },
    );
  }),

  http.post(`${API_URL}/auths/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API_URL}/auths/forgot-password`, async () => {
    return HttpResponse.json({
      message:
        'If an account with that email exists, a password reset link has been sent',
    });
  }),

  http.post(`${API_URL}/auths/reset-password`, async ({ request }) => {
    const body = (await request.json()) as {
      token: string;
      newPassword: string;
    };
    if (body.token === 'valid-reset-token') {
      return HttpResponse.json({
        message: 'Password has been reset successfully',
      });
    }
    return HttpResponse.json(
      { message: 'Invalid or expired password reset token', statusCode: 400 },
      { status: 400 },
    );
  }),

  http.post(`${API_URL}/auths/verify-email`, async ({ request }) => {
    const body = (await request.json()) as { token: string };
    if (body.token === 'valid-verification-token') {
      return HttpResponse.json({
        access_token: mockToken,
        refresh_token: mockRefreshToken,
      });
    }
    return HttpResponse.json(
      { message: 'Invalid or expired verification token', statusCode: 400 },
      { status: 400 },
    );
  }),

  http.post(`${API_URL}/auths/resend-verification`, async () => {
    return HttpResponse.json({
      message: 'Verification email sent. Please check your inbox.',
    });
  }),

  // Categories endpoints
  http.get(`${API_URL}/categories`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockCategories);
  }),

  http.get(`${API_URL}/categories/:id`, ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const category = mockCategories.find((c) => c.id === params.id);
    if (!category) {
      return HttpResponse.json(
        { message: 'Category not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return HttpResponse.json(category);
  }),

  http.post(`${API_URL}/categories/batch`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const body = (await request.json()) as {
      categories: { name: string; type: string }[];
    };
    return HttpResponse.json({
      created: body.categories.length,
      skipped: 0,
    });
  }),

  http.post(`${API_URL}/categories`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const body = (await request.json()) as { name: string; type: string };
    return HttpResponse.json({
      id: 'new-cat-id',
      name: body.name,
      type: body.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.put(`${API_URL}/categories/:id`, async ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const category = mockCategories.find((c) => c.id === params.id);
    if (!category) {
      return HttpResponse.json(
        { message: 'Category not found', statusCode: 404 },
        { status: 404 },
      );
    }
    const body = (await request.json()) as { name?: string; type?: string };
    return HttpResponse.json({
      ...category,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete(`${API_URL}/categories/:id`, ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const category = mockCategories.find((c) => c.id === params.id);
    if (!category) {
      return HttpResponse.json(
        { message: 'Category not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Budgets endpoints
  http.get(`${API_URL}/budgets`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockBudgets);
  }),

  http.get(`${API_URL}/budgets/:id`, ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const budget = mockBudgets.find((b) => b.id === params.id);
    if (!budget) {
      return HttpResponse.json(
        { message: 'Budget not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return HttpResponse.json(budget);
  }),

  http.post(`${API_URL}/budgets/batch`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const body = (await request.json()) as {
      amount: number;
      categoryId: string;
      startMonth: number;
      startYear: number;
      endMonth: number;
      endYear: number;
    };
    const startOrdinal = body.startYear * 12 + body.startMonth;
    const endOrdinal = body.endYear * 12 + body.endMonth;
    const created = Math.max(0, endOrdinal - startOrdinal + 1);
    return HttpResponse.json({ created, skipped: 0 });
  }),

  http.post(`${API_URL}/budgets`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const body = (await request.json()) as {
      amount: number;
      categoryId: string;
      month: number;
      year: number;
    };
    const category = mockCategories.find((c) => c.id === body.categoryId);
    return HttpResponse.json({
      id: 'new-budget-id',
      amount: body.amount.toFixed(2),
      categoryId: body.categoryId,
      month: body.month,
      year: body.year,
      type: category?.type ?? 'EXPENSE',
      userId: 'test-user-id',
    });
  }),

  http.put(`${API_URL}/budgets/:id`, async ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const budget = mockBudgets.find((b) => b.id === params.id);
    if (!budget) {
      return HttpResponse.json(
        { message: 'Budget not found', statusCode: 404 },
        { status: 404 },
      );
    }
    const body = (await request.json()) as {
      amount?: number;
      categoryId?: string;
      month?: number;
      year?: number;
    };
    return HttpResponse.json({
      ...budget,
      amount:
        body.amount !== undefined ? body.amount.toFixed(2) : budget.amount,
      categoryId: body.categoryId ?? budget.categoryId,
      month: body.month ?? budget.month,
      year: body.year ?? budget.year,
    });
  }),

  http.get(`${API_URL}/budgets/:id/details`, ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const budget = mockBudgets.find((b) => b.id === params.id);
    if (!budget) {
      return HttpResponse.json(
        { message: 'Budget not found', statusCode: 404 },
        { status: 404 },
      );
    }
    // Return the budget with spending details
    const budgetWithSpending = mockBudgetsWithSpending.find(
      (b) => b.id === params.id,
    );
    const category = mockCategories.find((c) => c.id === budget.categoryId);
    const transactions = mockTransactions.filter(
      (t) => t.categoryId === budget.categoryId,
    );
    return HttpResponse.json({
      ...budgetWithSpending,
      category: category || null,
      transactions,
    });
  }),

  http.get(`${API_URL}/budgets/category/:categoryId`, ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const filteredBudgets = mockBudgetsWithSpending.filter(
      (b) => b.categoryId === params.categoryId,
    );
    return HttpResponse.json(filteredBudgets);
  }),

  http.delete(`${API_URL}/budgets/:id`, ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const budget = mockBudgets.find((b) => b.id === params.id);
    if (!budget) {
      return HttpResponse.json(
        { message: 'Budget not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Dashboard endpoints
  http.get(`${API_URL}/dashboard/monthly-summary`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockMonthlySummary);
  }),

  http.get(`${API_URL}/dashboard/budget-vs-actual`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockBudgetVsActual);
  }),

  http.get(`${API_URL}/dashboard/category-breakdown`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockCategoryBreakdown);
  }),

  http.get(`${API_URL}/dashboard/top-expenses`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockTopExpenses);
  }),

  // Users endpoints
  http.get(`${API_URL}/users/me`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  }),

  http.patch(`${API_URL}/users/me`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({
      id: mockUser.id,
      name: body.name,
      email: mockUser.email,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  }),

  http.patch(`${API_URL}/users/me/password`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const body = (await request.json()) as { currentPassword: string };
    if (body.currentPassword === 'WrongPassword1') {
      return HttpResponse.json(
        { message: 'Current password is incorrect', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json({});
  }),

  http.patch(`${API_URL}/users/me/email`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const body = (await request.json()) as { email: string };
    if (body.email === 'taken@example.com') {
      return HttpResponse.json(
        { message: 'Email already exists', statusCode: 409 },
        { status: 409 },
      );
    }
    return HttpResponse.json({
      id: mockUser.id,
      name: mockUser.name,
      email: body.email,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  }),

  http.delete(`${API_URL}/users/me`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Transactions endpoints
  http.get(`${API_URL}/transactions`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockTransactions);
  }),

  http.get(`${API_URL}/transactions/:id`, ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const transaction = mockTransactions.find((t) => t.id === params.id);
    if (!transaction) {
      return HttpResponse.json(
        { message: 'Transaction not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return HttpResponse.json(transaction);
  }),

  http.post(`${API_URL}/transactions`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const body = (await request.json()) as {
      amount: number;
      categoryId: string;
      date: string;
      description?: string;
    };
    const category = mockCategories.find((c) => c.id === body.categoryId);
    return HttpResponse.json({
      id: 'new-transaction-id',
      amount: body.amount.toFixed(2),
      type: category?.type ?? 'EXPENSE',
      categoryId: body.categoryId,
      date: body.date,
      description: body.description,
      userId: 'test-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.put(`${API_URL}/transactions/:id`, async ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const transaction = mockTransactions.find((t) => t.id === params.id);
    if (!transaction) {
      return HttpResponse.json(
        { message: 'Transaction not found', statusCode: 404 },
        { status: 404 },
      );
    }
    const body = (await request.json()) as {
      amount?: number;
      categoryId?: string;
      date?: string;
      description?: string;
    };
    const newCategoryId = body.categoryId ?? transaction.categoryId;
    const newCategory = mockCategories.find((c) => c.id === newCategoryId);
    return HttpResponse.json({
      ...transaction,
      amount:
        body.amount !== undefined ? body.amount.toFixed(2) : transaction.amount,
      type:
        body.categoryId !== undefined
          ? (newCategory?.type ?? transaction.type)
          : transaction.type,
      categoryId: newCategoryId,
      date: body.date ?? transaction.date,
      description: body.description ?? transaction.description,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete(`${API_URL}/transactions/:id`, ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const transaction = mockTransactions.find((t) => t.id === params.id);
    if (!transaction) {
      return HttpResponse.json(
        { message: 'Transaction not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // Recurring Transactions endpoints
  http.get(`${API_URL}/recurring-transactions`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockRecurringTransactions);
  }),

  http.get(`${API_URL}/recurring-transactions/:id`, ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const rt = mockRecurringTransactions.find((r) => r.id === params.id);
    if (!rt) {
      return HttpResponse.json(
        { message: 'Recurring transaction not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return HttpResponse.json(rt);
  }),

  http.post(`${API_URL}/recurring-transactions`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const body = (await request.json()) as {
      amount: number;
      categoryId: string;
      description: string;
      interval: string;
      startDate: string;
      endDate?: string;
    };
    const category = mockCategories.find((c) => c.id === body.categoryId);
    return HttpResponse.json({
      id: 'new-rt-id',
      amount: body.amount.toFixed(2),
      type: category?.type ?? 'EXPENSE',
      categoryId: body.categoryId,
      description: body.description,
      interval: body.interval,
      startDate: body.startDate,
      nextRun: body.startDate,
      endDate: body.endDate,
      isActive: true,
      userId: 'test-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.put(
    `${API_URL}/recurring-transactions/:id`,
    async ({ params, request }) => {
      const auth = request.headers.get('Authorization');
      if (!auth?.startsWith('Bearer ')) {
        return HttpResponse.json(
          { message: 'Unauthorized', statusCode: 401 },
          { status: 401 },
        );
      }
      const rt = mockRecurringTransactions.find((r) => r.id === params.id);
      if (!rt) {
        return HttpResponse.json(
          { message: 'Recurring transaction not found', statusCode: 404 },
          { status: 404 },
        );
      }
      const body = (await request.json()) as {
        amount?: number;
        categoryId?: string;
        description?: string;
        interval?: string;
        startDate?: string;
        endDate?: string;
        isActive?: boolean;
      };
      return HttpResponse.json({
        ...rt,
        amount: body.amount !== undefined ? body.amount.toFixed(2) : rt.amount,
        categoryId: body.categoryId ?? rt.categoryId,
        description: body.description ?? rt.description,
        interval: body.interval ?? rt.interval,
        startDate: body.startDate ?? rt.startDate,
        endDate: body.endDate ?? rt.endDate,
        isActive: body.isActive !== undefined ? body.isActive : rt.isActive,
        updatedAt: new Date().toISOString(),
      });
    },
  ),

  http.delete(
    `${API_URL}/recurring-transactions/:id`,
    ({ params, request }) => {
      const auth = request.headers.get('Authorization');
      if (!auth?.startsWith('Bearer ')) {
        return HttpResponse.json(
          { message: 'Unauthorized', statusCode: 401 },
          { status: 401 },
        );
      }
      const rt = mockRecurringTransactions.find((r) => r.id === params.id);
      if (!rt) {
        return HttpResponse.json(
          { message: 'Recurring transaction not found', statusCode: 404 },
          { status: 404 },
        );
      }
      return new HttpResponse(null, { status: 204 });
    },
  ),

  // Admin endpoints
  http.get(`${API_URL}/admin/stats`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      totalUsers: 10,
      activeUsers: 8,
      inactiveUsers: 2,
    });
  }),

  http.get(`${API_URL}/admin/users`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockAdminUsers);
  }),

  http.patch(
    `${API_URL}/admin/users/:id/status`,
    async ({ params, request }) => {
      const auth = request.headers.get('Authorization');
      if (!auth?.startsWith('Bearer ')) {
        return HttpResponse.json(
          { message: 'Unauthorized', statusCode: 401 },
          { status: 401 },
        );
      }
      const body = (await request.json()) as { isActive: boolean };
      const user = mockAdminUsers.find((u) => u.id === params.id);
      if (!user) {
        return HttpResponse.json(
          { message: 'User not found', statusCode: 404 },
          { status: 404 },
        );
      }
      return HttpResponse.json({ ...user, isActive: body.isActive });
    },
  ),
];
