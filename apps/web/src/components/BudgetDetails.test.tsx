import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetDetails } from './BudgetDetails';
import {
  BudgetType,
  BudgetWithDetailsExpense,
  BudgetWithDetailsIncome,
  CategoryType,
  TransactionType,
} from '@/types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

const mockExpenseBudget: BudgetWithDetailsExpense = {
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

const mockIncomeBudget: BudgetWithDetailsIncome = {
  id: 'budget-2',
  amount: '2000.00',
  categoryId: 'cat-2',
  month: 3,
  year: 2026,
  type: BudgetType.INCOME,
  category: {
    id: 'cat-2',
    name: 'Salary',
    type: CategoryType.INCOME,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  transactions: [],
  earned: '1500.00',
  remaining: '500.00',
  utilizationPercentage: 75,
};

describe('BudgetDetails', () => {
  it('should render budget title and category', () => {
    render(<BudgetDetails budget={mockExpenseBudget} />);

    expect(screen.getByTestId('budget-title')).toHaveTextContent('Groceries');
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('should render budget type badge', () => {
    render(<BudgetDetails budget={mockExpenseBudget} />);

    const badge = screen.getByTestId('budget-type-badge');
    expect(badge).toHaveTextContent('EXPENSE');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should render income type badge with correct styling', () => {
    render(<BudgetDetails budget={mockIncomeBudget} />);

    const badge = screen.getByTestId('budget-type-badge');
    expect(badge).toHaveTextContent('INCOME');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should render budget amount formatted as currency', () => {
    render(<BudgetDetails budget={mockExpenseBudget} />);

    expect(screen.getByTestId('budget-amount')).toHaveTextContent('$500.00');
  });

  it('should render spent label and amount for EXPENSE budgets', () => {
    render(<BudgetDetails budget={mockExpenseBudget} />);

    expect(screen.getByText('Spent')).toBeInTheDocument();
    expect(screen.getByTestId('budget-progress-value')).toHaveTextContent(
      '$150.00',
    );
    expect(screen.getByTestId('budget-remaining')).toHaveTextContent('$350.00');
  });

  it('should render earned label and amount for INCOME budgets', () => {
    render(<BudgetDetails budget={mockIncomeBudget} />);

    expect(screen.getByText('Earned')).toBeInTheDocument();
    expect(screen.getByTestId('budget-progress-value')).toHaveTextContent(
      '$1,500.00',
    );
    expect(screen.getByTestId('budget-remaining')).toHaveTextContent('$500.00');
  });

  it('should render utilization percentage', () => {
    render(<BudgetDetails budget={mockExpenseBudget} />);

    expect(screen.getByTestId('utilization-percentage')).toHaveTextContent(
      '30.0%',
    );
  });

  describe('progress bar colors for EXPENSE budgets', () => {
    it('should render green progress bar for low utilization (<75%)', () => {
      const lowUsageBudget: BudgetWithDetailsExpense = {
        ...mockExpenseBudget,
        spent: '150.00',
        remaining: '350.00',
        utilizationPercentage: 30,
      };

      render(<BudgetDetails budget={lowUsageBudget} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-green-500');
    });

    it('should render yellow progress bar for medium utilization (>=75%, <100%)', () => {
      const mediumUsageBudget: BudgetWithDetailsExpense = {
        ...mockExpenseBudget,
        spent: '400.00',
        remaining: '100.00',
        utilizationPercentage: 80,
      };

      render(<BudgetDetails budget={mediumUsageBudget} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-yellow-500');
    });

    it('should render red progress bar for high utilization (>=100%)', () => {
      const highUsageBudget: BudgetWithDetailsExpense = {
        ...mockExpenseBudget,
        spent: '550.00',
        remaining: '-50.00',
        utilizationPercentage: 110,
      };

      render(<BudgetDetails budget={highUsageBudget} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-red-500');
    });

    it('should cap progress bar width at 100%', () => {
      const overBudget: BudgetWithDetailsExpense = {
        ...mockExpenseBudget,
        spent: '750.00',
        remaining: '-250.00',
        utilizationPercentage: 150,
      };

      render(<BudgetDetails budget={overBudget} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('progress bar colors for INCOME budgets (inverted)', () => {
    it('should render red progress bar for low utilization (<50%)', () => {
      const lowEarnedBudget: BudgetWithDetailsIncome = {
        ...mockIncomeBudget,
        earned: '400.00',
        remaining: '1600.00',
        utilizationPercentage: 20,
      };

      render(<BudgetDetails budget={lowEarnedBudget} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-red-500');
    });

    it('should render yellow progress bar for medium utilization (>=50%, <75%)', () => {
      const mediumEarnedBudget: BudgetWithDetailsIncome = {
        ...mockIncomeBudget,
        earned: '1200.00',
        remaining: '800.00',
        utilizationPercentage: 60,
      };

      render(<BudgetDetails budget={mediumEarnedBudget} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-yellow-500');
    });

    it('should render green progress bar for high utilization (>=75%)', () => {
      const highEarnedBudget: BudgetWithDetailsIncome = {
        ...mockIncomeBudget,
        earned: '1800.00',
        remaining: '200.00',
        utilizationPercentage: 90,
      };

      render(<BudgetDetails budget={highEarnedBudget} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('bg-green-500');
    });
  });

  describe('negative remaining', () => {
    it('should show remaining in red when negative', () => {
      const overBudget: BudgetWithDetailsExpense = {
        ...mockExpenseBudget,
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
      render(<BudgetDetails budget={mockExpenseBudget} />);

      expect(screen.getByTestId('no-transactions')).toHaveTextContent(
        'No transactions found for this budget period.',
      );
    });

    it('should render transactions table when transactions exist', () => {
      const budgetWithTransactions: BudgetWithDetailsExpense = {
        ...mockExpenseBudget,
        transactions: [
          {
            id: 'tx-1',
            amount: '75.00',
            type: TransactionType.EXPENSE,
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
            type: TransactionType.EXPENSE,
            categoryId: 'cat-1',
            date: '2026-03-08T10:00:00.000Z',
            description: undefined,
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
      const budgetWithNullCategory: BudgetWithDetailsExpense = {
        ...mockExpenseBudget,
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
      render(<BudgetDetails budget={mockExpenseBudget} />);

      const editLink = screen.getByRole('link', { name: 'Edit Budget' });
      expect(editLink).toHaveAttribute('href', '/budgets/budget-1/edit');
    });

    it('should render Back to Budgets link', () => {
      render(<BudgetDetails budget={mockExpenseBudget} />);

      const backLink = screen.getByRole('link', { name: 'Back to Budgets' });
      expect(backLink).toHaveAttribute('href', '/budgets');
    });
  });
});
