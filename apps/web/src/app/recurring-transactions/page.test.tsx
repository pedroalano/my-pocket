import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockRecurringTransactions } from '@/test/mocks/handlers';
import {
  renderWithAuthenticatedProviders,
  setupUser,
  selectOption,
} from '@/test/test-utils';
import RecurringTransactionsPage from './page';

const API_URL = 'http://localhost:3001';

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

describe('RecurringTransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders recurring transaction list from API', async () => {
    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    // "Salary" appears twice: as description and as category name for rt-2
    expect(screen.getAllByText('Salary').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('$15.00')).toBeInTheDocument();
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
  });

  it('shows empty state when no recurring transactions exist', async () => {
    server.use(
      http.get(`${API_URL}/recurring-transactions`, () => {
        return HttpResponse.json([]);
      }),
    );

    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('No recurring transactions yet.'),
      ).toBeInTheDocument();
    });
  });

  it('shows "no matches" message when filters yield no results', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    // Both mock items are ACTIVE, so filtering by INACTIVE yields no results
    await selectOption(user, screen.getByTestId('status-filter'), 'Inactive');

    expect(
      screen.getByText('No recurring transactions match your filters.'),
    ).toBeInTheDocument();
  });

  it('filters recurring transactions by type', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    await selectOption(user, screen.getByTestId('type-filter'), 'Income');

    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    expect(screen.queryByText('$15.00')).not.toBeInTheDocument();
  });

  it('filters recurring transactions by interval', async () => {
    const user = setupUser();

    server.use(
      http.get(`${API_URL}/recurring-transactions`, () => {
        return HttpResponse.json([
          ...mockRecurringTransactions,
          {
            id: 'rt-3',
            amount: '50.00',
            type: 'EXPENSE',
            categoryId: 'cat-2',
            description: 'Daily coffee',
            interval: 'DAILY',
            startDate: '2026-01-01T00:00:00.000Z',
            nextRun: '2026-04-01T00:00:00.000Z',
            isActive: true,
            userId: 'user-123',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ]);
      }),
    );

    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Daily coffee')).toBeInTheDocument();
    });

    await selectOption(
      user,
      screen.getByTestId('interval-filter'),
      'Monthly',
    );

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getAllByText('Salary').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Daily coffee')).not.toBeInTheDocument();
  });

  it('filters recurring transactions by status', async () => {
    const user = setupUser();

    server.use(
      http.get(`${API_URL}/recurring-transactions`, () => {
        return HttpResponse.json([
          ...mockRecurringTransactions,
          {
            id: 'rt-3',
            amount: '10.00',
            type: 'EXPENSE',
            categoryId: 'cat-2',
            description: 'Inactive sub',
            interval: 'MONTHLY',
            startDate: '2026-01-01T00:00:00.000Z',
            nextRun: '2026-04-01T00:00:00.000Z',
            isActive: false,
            userId: 'user-123',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ]);
      }),
    );

    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Inactive sub')).toBeInTheDocument();
    });

    await selectOption(user, screen.getByTestId('status-filter'), 'Active');

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.queryByText('Inactive sub')).not.toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    await selectOption(user, screen.getByTestId('type-filter'), 'Income');
    expect(screen.queryByText('$15.00')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear Filters' }));

    await waitFor(() => {
      expect(screen.getByText('$15.00')).toBeInTheDocument();
    });
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
  });

  it('has Edit buttons that link to edit pages', async () => {
    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('link', { name: 'Edit' });
    expect(editButtons).toHaveLength(2);
    expect(editButtons[0]).toHaveAttribute(
      'href',
      '/recurring-transactions/rt-1/edit',
    );
    expect(editButtons[1]).toHaveAttribute(
      'href',
      '/recurring-transactions/rt-2/edit',
    );
  });

  it('has New Recurring Transaction button that links to create page', async () => {
    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    const newButton = screen.getByRole('link', {
      name: 'New Recurring Transaction',
    });
    expect(newButton).toHaveAttribute('href', '/recurring-transactions/new');
  });

  it('opens delete confirmation dialog when Delete is clicked', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText('Delete Recurring Transaction'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'This will permanently delete this recurring transaction. Future transactions will no longer be generated.',
      ),
    ).toBeInTheDocument();
  });

  it('closes delete dialog when Cancel is clicked', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('deletes recurring transaction when confirmed and removes from list', async () => {
    const user = setupUser();
    const { toast } = await import('sonner');
    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);

    const dialogDeleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(dialogDeleteButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Recurring transaction deleted successfully',
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
    });
    // "Salary" appears as both description and category name for rt-2
    expect(screen.getAllByText('Salary').length).toBeGreaterThanOrEqual(1);
  });

  it('handles 401 error by logging out and redirecting', async () => {
    server.use(
      http.get(`${API_URL}/recurring-transactions`, () => {
        return HttpResponse.json(
          { message: 'Unauthorized', statusCode: 401 },
          { status: 401 },
        );
      }),
    );

    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
    });
  });

  it('shows error toast when API returns error', async () => {
    const { toast } = await import('sonner');
    server.use(
      http.get(`${API_URL}/recurring-transactions`, () => {
        return HttpResponse.json(
          { message: 'Server error', statusCode: 500 },
          { status: 500 },
        );
      }),
    );

    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error');
    });
  });

  it('shows generic error toast on network failure', async () => {
    const { toast } = await import('sonner');
    server.use(
      http.get(`${API_URL}/recurring-transactions`, () => {
        return HttpResponse.error();
      }),
    );

    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to load recurring transactions',
      );
    });
  });

  it('shows error toast when delete fails', async () => {
    const user = setupUser();
    const { toast } = await import('sonner');

    server.use(
      http.delete(`${API_URL}/recurring-transactions/:id`, () => {
        return HttpResponse.json(
          { message: 'Cannot delete recurring transaction', statusCode: 400 },
          { status: 400 },
        );
      }),
    );

    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Cannot delete recurring transaction',
      );
    });

    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('displays interval and status badges', async () => {
    renderWithAuthenticatedProviders(<RecurringTransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    // Both are monthly
    const monthlyBadges = screen.getAllByText('Monthly');
    expect(monthlyBadges.length).toBeGreaterThanOrEqual(2);

    // Both are active
    const activeBadges = screen.getAllByText('Active');
    expect(activeBadges.length).toBeGreaterThanOrEqual(2);
  });
});
