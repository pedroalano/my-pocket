import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetDetails } from './BudgetDetails';
import { BudgetType, BudgetWithDetails, CategoryType } from '@/types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

const mockBudgetBase: BudgetWithDetails = {
  id: 'budget-1',
  amount: '500.00',
  categoryId: 'cat-1',
  month: 3,
  year: 2026,
  type: BudgetType.EXPENSE,
  category: {
    id: 'cat-1',
    name: 'Groceries',
    type: CategoryType.EXPENSE,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  transactions: [],
  spent: '150.00',
  remaining: '350.00',
  utilizationPercentage: 30,
};

describe('BudgetDetails', () => {
  it('should render budget title and category', () => {
    render(<BudgetDetails budget={mockBudgetBase} />);

    expect(screen.getByTestId('budget-title')).toHaveTextContent('Groceries');
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('should render budget type badge', () => {
    render(<BudgetDetails budget={mockBudgetBase} />);

    const badge = screen.getByTestId('budget-type-badge');
    expect(badge).toHaveTextContent('EXPENSE');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should render income type badge with correct styling', () => {
    const incomeBudget: BudgetWithDetails = {
      ...mockBudgetBase,
      type: BudgetType.INCOME,
    };

    render(<BudgetDetails budget={incomeBudget} />);

    const badge = screen.getByTestId('budget-type-badge');
    expect(badge).toHaveTextContent('INCOME');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should render budget amount formatted as currency', () => {
    render(<BudgetDetails budget={mockBudgetBase} />);

    expect(screen.getByTestId('budget-amount')).toHaveTextContent('$500.00');
  });

  it('should render spent and remaining amounts', () => {
    render(<BudgetDetails budget={mockBudgetBase} />);

    expect(screen.getByTestId('budget-spent')).toHaveTextContent('$150.00');
    expect(screen.getByTestId('budget-remaining')).toHaveTextContent('$350.00');
  });

  it('should render utilization percentage', () => {
    render(<BudgetDetails budget={mockBudgetBase} />);

    expect(screen.getByTestId('utilization-percentage')).toHaveTextContent(
      '30.0%',
    );
  });

  describe('progress bar colors', () => {
    it('should render green progress bar for low utilization (<75%)', () => {
      const lowUsageBudget: BudgetWithDetails = {
        ...mockBudgetBase,
        spent: '150.00',
        remaining: '350.00',
        utilizationPercentage: 30,
      };

      render(<BudgetDetails budget={lowUsageBudget} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-green-500');
    });

    it('should render yellow progress bar for medium utilization (>=75%, <100%)', () => {
      const mediumUsageBudget: BudgetWithDetails = {
        ...mockBudgetBase,
        spent: '400.00',
        remaining: '100.00',
        utilizationPercentage: 80,
      };

      render(<BudgetDetails budget={mediumUsageBudget} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-yellow-500');
    });

    it('should render red progress bar for high utilization (>=100%)', () => {
      const highUsageBudget: BudgetWithDetails = {
        ...mockBudgetBase,
        spent: '550.00',
        remaining: '-50.00',
        utilizationPercentage: 110,
      };

      render(<BudgetDetails budget={highUsageBudget} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-red-500');
    });

    it('should cap progress bar width at 100%', () => {
      const overBudget: BudgetWithDetails = {
        ...mockBudgetBase,
        spent: '750.00',
        remaining: '-250.00',
        utilizationPercentage: 150,
      };

      render(<BudgetDetails budget={overBudget} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('negative remaining', () => {
    it('should show remaining in red when negative', () => {
      const overBudget: BudgetWithDetails = {
        ...mockBudgetBase,
        spent: '600.00',
        remaining: '-100.00',
        utilizationPercentage: 120,
      };

      render(<BudgetDetails budget={overBudget} />);

      const remaining = screen.getByTestId('budget-remaining');
      expect(remaining).toHaveTextContent('-$100.00');
      expect(remaining).toHaveClass('text-red-600');
    });
  });

  describe('transactions', () => {
    it('should show no transactions message when empty', () => {
      render(<BudgetDetails budget={mockBudgetBase} />);

      expect(screen.getByTestId('no-transactions')).toHaveTextContent(
        'No transactions found for this budget period.',
      );
    });

    it('should render transactions table when transactions exist', () => {
      const budgetWithTransactions: BudgetWithDetails = {
        ...mockBudgetBase,
        transactions: [
          {
            id: 'tx-1',
            amount: '75.00',
            type: 'EXPENSE' as const,
            categoryId: 'cat-1',
            date: '2026-03-15T10:00:00.000Z',
            description: 'Weekly groceries',
            userId: 'user-1',
            createdAt: '2026-03-15T10:00:00.000Z',
            updatedAt: '2026-03-15T10:00:00.000Z',
          },
          {
            id: 'tx-2',
            amount: '75.00',
            type: 'EXPENSE' as const,
            categoryId: 'cat-1',
            date: '2026-03-08T10:00:00.000Z',
            description: null,
            userId: 'user-1',
            createdAt: '2026-03-08T10:00:00.000Z',
            updatedAt: '2026-03-08T10:00:00.000Z',
          },
        ],
      };

      render(<BudgetDetails budget={budgetWithTransactions} />);

      expect(screen.queryByTestId('no-transactions')).not.toBeInTheDocument();
      const table = screen.getByTestId('transactions-table');
      expect(table).toBeInTheDocument();

      // Check first transaction
      expect(screen.getByText('Weekly groceries')).toBeInTheDocument();
      expect(screen.getByText('Mar 15, 2026')).toBeInTheDocument();

      // Check second transaction without description
      expect(screen.getByText('No description')).toBeInTheDocument();
      expect(screen.getByText('Mar 8, 2026')).toBeInTheDocument();
    });
  });

  describe('null category', () => {
    it('should show Unknown Category when category is null', () => {
      const budgetWithNullCategory: BudgetWithDetails = {
        ...mockBudgetBase,
        category: null,
      };

      render(<BudgetDetails budget={budgetWithNullCategory} />);

      expect(screen.getByTestId('budget-title')).toHaveTextContent(
        'Unknown Category',
      );
    });
  });

  describe('navigation links', () => {
    it('should render Edit Budget link', () => {
      render(<BudgetDetails budget={mockBudgetBase} />);

      const editLink = screen.getByRole('link', { name: 'Edit Budget' });
      expect(editLink).toHaveAttribute('href', '/budgets/budget-1/edit');
    });

    it('should render Back to Budgets link', () => {
      render(<BudgetDetails budget={mockBudgetBase} />);

      const backLink = screen.getByRole('link', { name: 'Back to Budgets' });
      expect(backLink).toHaveAttribute('href', '/budgets');
    });
  });
});
