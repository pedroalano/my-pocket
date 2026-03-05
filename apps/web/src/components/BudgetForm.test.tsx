import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@/test/test-utils';
import { BudgetForm } from './BudgetForm';
import { BudgetType } from '@/types';
import { ApiException } from '@/lib/api';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

const mockRouterPush = vi.fn();
vi.mock('next/navigation', async () => {
  return {
    useRouter: () => ({
      push: mockRouterPush,
      replace: vi.fn(),
      back: vi.fn(),
    }),
    useParams: () => ({}),
  };
});

// Mock categoriesApi - use inline data to avoid hoisting issues
vi.mock('@/lib/categories', () => ({
  categoriesApi: {
    getAll: vi.fn().mockResolvedValue([
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
    ]),
  },
}));

describe('BudgetForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue({});
  });

  it('should render form with title and submit label', async () => {
    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText('Create Budget')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should render all form fields', async () => {
    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Month')).toBeInTheDocument();
    expect(screen.getByLabelText('Year')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
  });

  it('should load categories in dropdown', async () => {
    const user = setupUser();

    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        onSubmit={mockOnSubmit}
      />,
    );

    // Wait for categories to load
    await waitFor(() => {
      expect(
        screen.queryByText('Loading categories...'),
      ).not.toBeInTheDocument();
    });

    // Open category dropdown
    const categoryTrigger = screen.getByLabelText('Category');
    await user.click(categoryTrigger);

    await waitFor(() => {
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });
  });

  it('should render form with initial data', async () => {
    render(
      <BudgetForm
        title="Edit Budget"
        submitLabel="Save"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
          type: BudgetType.EXPENSE,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('500')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2026')).toBeInTheDocument();
    });
  });

  it('should have required attribute on amount and year inputs', () => {
    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByLabelText('Amount')).toHaveAttribute('required');
    expect(screen.getByLabelText('Year')).toHaveAttribute('required');
  });

  it('should show error toast when category is not selected', async () => {
    const user = setupUser();

    // Use initialData without categoryId to test validation
    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: 500,
          categoryId: '',
          month: 3,
          year: 2026,
          type: BudgetType.EXPENSE,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Loading categories...'),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Category is required');
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show error toast when type is not selected', async () => {
    const user = setupUser();

    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
          type: '' as BudgetType,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Loading categories...'),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Type is required');
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data from initialData', async () => {
    const user = setupUser();

    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
          type: BudgetType.EXPENSE,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Loading categories...'),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        amount: 500,
        categoryId: 'cat-2',
        month: 3,
        year: 2026,
        type: BudgetType.EXPENSE,
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Budget created successfully');
    expect(mockRouterPush).toHaveBeenCalledWith('/budgets');
  });

  it('should show success message for update', async () => {
    const user = setupUser();

    render(
      <BudgetForm
        title="Edit Budget"
        submitLabel="Save"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
          type: BudgetType.EXPENSE,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Loading categories...'),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Budget updated successfully');
    });
  });

  it('should handle API exception', async () => {
    const user = setupUser();
    mockOnSubmit.mockRejectedValue(
      new ApiException(409, 'Budget already exists for this period'),
    );

    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
          type: BudgetType.EXPENSE,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Loading categories...'),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Budget already exists for this period',
      );
    });
  });

  it('should handle generic error', async () => {
    const user = setupUser();
    mockOnSubmit.mockRejectedValue(new Error('Network error'));

    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
          type: BudgetType.EXPENSE,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Loading categories...'),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred');
    });
  });

  it('should disable inputs during loading', async () => {
    const user = setupUser();
    // Make the submit never resolve to keep loading state
    mockOnSubmit.mockImplementation(() => new Promise(() => {}));

    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
          type: BudgetType.EXPENSE,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Loading categories...'),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    });

    expect(screen.getByLabelText('Amount')).toBeDisabled();
    expect(screen.getByLabelText('Year')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('should navigate to budgets on cancel', async () => {
    const user = setupUser();

    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        onSubmit={mockOnSubmit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockRouterPush).toHaveBeenCalledWith('/budgets');
  });

  it('should validate amount is positive', async () => {
    const user = setupUser();

    render(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: -100,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
          type: BudgetType.EXPENSE,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Loading categories...'),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Amount must be greater than 0');
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
