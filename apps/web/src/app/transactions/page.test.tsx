import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockTransactions } from '@/test/mocks/handlers';
import {
  renderWithAuthenticatedProviders,
  setupUser,
  selectOption,
} from '@/test/test-utils';
import TransactionsPage from './page';

const API_URL = 'http://localhost:3001';

const makePaginatedResponse = (
  data: typeof mockTransactions,
  page = 1,
  limit = 20,
) => ({
  data,
  total: data.length,
  page,
  limit,
  totalPages: Math.ceil(data.length / limit),
});

// Mock next/navigation
const mockRouterPush = vi.fn();
vi.mock('next/navigation', async () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up authenticated state
  });

  it('renders loading skeleton initially', () => {
    renderWithAuthenticatedProviders(<TransactionsPage />);
    // The skeleton should be visible while loading
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders transaction list from API', async () => {
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      // Transaction amounts should be displayed
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expense')).toBeInTheDocument();
  });

  it('displays category names for transactions', async () => {
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      // Category names should be resolved from categoryId
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });

    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('displays transaction descriptions', async () => {
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    });

    expect(screen.getByText('Monthly salary')).toBeInTheDocument();
  });

  it('shows empty state when no transactions exist', async () => {
    server.use(
      http.get(`${API_URL}/transactions`, () => {
        return HttpResponse.json(makePaginatedResponse([]));
      }),
    );

    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'No transactions yet. Create your first transaction to get started.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('filters transactions by type', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    // Filter by INCOME — re-fetches from API
    server.use(
      http.get(`${API_URL}/transactions`, ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get('type');
        const data = type
          ? mockTransactions.filter((t) => t.type === type)
          : mockTransactions;
        return HttpResponse.json(makePaginatedResponse(data));
      }),
    );

    await selectOption(user, screen.getByTestId('type-filter'), 'Income');

    await waitFor(() => {
      expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    });
    expect(screen.queryByText('$150.00')).not.toBeInTheDocument();
  });

  it('filters transactions by category', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    // Filter by Salary category — re-fetches from API
    server.use(
      http.get(`${API_URL}/transactions`, ({ request }) => {
        const url = new URL(request.url);
        const categoryId = url.searchParams.get('categoryId');
        const data = categoryId
          ? mockTransactions.filter((t) => t.categoryId === categoryId)
          : mockTransactions;
        return HttpResponse.json(makePaginatedResponse(data));
      }),
    );

    await selectOption(user, screen.getByTestId('category-filter'), 'Salary');

    await waitFor(() => {
      expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    });
    expect(screen.queryByText('$150.00')).not.toBeInTheDocument();
  });

  it('has New Transaction button that links to create page', async () => {
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    const newButton = screen.getByRole('link', { name: 'New Transaction' });
    expect(newButton).toHaveAttribute('href', '/transactions/new');
  });

  it('has Edit buttons that link to edit pages', async () => {
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('link', { name: 'Edit' });
    expect(editButtons).toHaveLength(2);
    expect(editButtons[0]).toHaveAttribute(
      'href',
      '/transactions/transaction-1/edit',
    );
    expect(editButtons[1]).toHaveAttribute(
      'href',
      '/transactions/transaction-2/edit',
    );
  });

  it('opens delete confirmation dialog when Delete is clicked', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Transaction')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete this transaction/),
    ).toBeInTheDocument();
  });

  it('closes delete dialog when Cancel is clicked', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    // Open dialog
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click Cancel
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('deletes transaction when confirmed and removes from list', async () => {
    const user = setupUser();
    const { toast } = await import('sonner');
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    // Open dialog
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);

    // Confirm delete
    const dialogDeleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(dialogDeleteButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Transaction deleted successfully',
      );
    });

    // Transaction should be removed from the list
    await waitFor(() => {
      expect(screen.queryByText('$150.00')).not.toBeInTheDocument();
    });
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
  });

  it('handles 401 error by logging out and redirecting', async () => {
    server.use(
      http.get(`${API_URL}/transactions`, () => {
        return HttpResponse.json(
          { message: 'Unauthorized', statusCode: 401 },
          { status: 401 },
        );
      }),
    );

    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
    });
  });

  it('shows error toast when API returns error', async () => {
    const { toast } = await import('sonner');
    server.use(
      http.get(`${API_URL}/transactions`, () => {
        return HttpResponse.json(
          { message: 'Server error', statusCode: 500 },
          { status: 500 },
        );
      }),
    );

    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error');
    });
  });

  it('shows generic error toast on network failure', async () => {
    const { toast } = await import('sonner');
    server.use(
      http.get(`${API_URL}/transactions`, () => {
        return HttpResponse.error();
      }),
    );

    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load transactions');
    });
  });

  it('shows error toast when delete fails', async () => {
    const user = setupUser();
    const { toast } = await import('sonner');

    server.use(
      http.delete(`${API_URL}/transactions/:id`, () => {
        return HttpResponse.json(
          {
            message: 'Cannot delete transaction',
            statusCode: 400,
          },
          { status: 400 },
        );
      }),
    );

    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    // Open dialog and confirm delete
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Cannot delete transaction');
    });

    // Transaction should still be in the list
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('displays date in formatted format', async () => {
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    // Date should be formatted (e.g., Mar 1, 2026)
    expect(screen.getByText('Mar 1, 2026')).toBeInTheDocument();
    expect(screen.getByText('Mar 5, 2026')).toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    // Apply filter — server returns only INCOME
    server.use(
      http.get(`${API_URL}/transactions`, ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get('type');
        const data = type
          ? mockTransactions.filter((t) => t.type === type)
          : mockTransactions;
        return HttpResponse.json(makePaginatedResponse(data));
      }),
    );

    await selectOption(user, screen.getByTestId('type-filter'), 'Income');

    await waitFor(() => {
      expect(screen.queryByText('$150.00')).not.toBeInTheDocument();
      expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    });

    // Click clear filters — all transactions should come back
    await user.click(screen.getByRole('button', { name: 'Clear Filters' }));

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
  });

  it('shows pagination when totalPages > 1', async () => {
    server.use(
      http.get(`${API_URL}/transactions`, () => {
        return HttpResponse.json({
          data: [mockTransactions[0]],
          total: 40,
          page: 1,
          limit: 20,
          totalPages: 2,
        });
      }),
    );

    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: 'Previous' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('pagination hidden when totalPages <= 1', async () => {
    renderWithAuthenticatedProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('button', { name: 'Previous' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next' }),
    ).not.toBeInTheDocument();
  });
});
