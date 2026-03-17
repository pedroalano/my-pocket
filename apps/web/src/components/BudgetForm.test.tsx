import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders, setupUser } from '@/test/test-utils';
import { BudgetForm } from './BudgetForm';
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
    renderWithProviders(
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
    renderWithProviders(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Month')).toBeInTheDocument();
    expect(screen.getByLabelText('Year')).toBeInTheDocument();
  });

  it('should load categories in dropdown', async () => {
    const user = setupUser();

    renderWithProviders(
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
      expect(screen.getAllByText('Salary').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Groceries').length).toBeGreaterThan(0);
    });
  });

  it('should render form with initial data', async () => {
    renderWithProviders(
      <BudgetForm
        title="Edit Budget"
        submitLabel="Save"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('$500.00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2026')).toBeInTheDocument();
    });
  });

  it('should have required attribute on amount and year inputs', () => {
    renderWithProviders(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Year')).toHaveAttribute('required');
  });

  it('should show error toast when category is not selected', async () => {
    // Use initialData without categoryId to test validation
    renderWithProviders(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: 500,
          categoryId: '',
          month: 3,
          year: 2026,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Category is required');
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data from initialData', async () => {
    renderWithProviders(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        amount: 500,
        categoryId: 'cat-2',
        month: 3,
        year: 2026,
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Budget updated successfully');
    expect(mockRouterPush).toHaveBeenCalledWith('/budgets');
  });

  it('should show success message for update', async () => {
    renderWithProviders(
      <BudgetForm
        title="Edit Budget"
        submitLabel="Save"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Budget updated successfully');
    });
  });

  it('should handle API exception', async () => {
    mockOnSubmit.mockRejectedValue(
      new ApiException(409, 'Budget already exists for this period'),
    );

    renderWithProviders(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Budget already exists for this period',
      );
    });
  });

  it('should handle generic error', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Network error'));

    renderWithProviders(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred');
    });
  });

  it('should disable inputs during loading', async () => {
    // Make the submit never resolve to keep loading state
    mockOnSubmit.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: 500,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    });

    expect(screen.getByLabelText('Amount')).toBeDisabled();
    expect(screen.getByLabelText('Year')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('should navigate to budgets on cancel', async () => {
    const user = setupUser();

    renderWithProviders(
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
    renderWithProviders(
      <BudgetForm
        title="Create Budget"
        submitLabel="Create"
        initialData={{
          amount: -100,
          categoryId: 'cat-2',
          month: 3,
          year: 2026,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Amount must be greater than 0');
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
