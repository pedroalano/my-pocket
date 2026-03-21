import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import { AccountForm } from './AccountForm';
import { ApiException } from '@/lib/api';
import { AccountType } from '@/types';

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

describe('AccountForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue({});
  });

  it('should render form with title and submit label', () => {
    renderWithProviders(
      <AccountForm
        title="Create Account"
        submitLabel="Create"
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should render name input, type select, and initial balance input', () => {
    renderWithProviders(
      <AccountForm
        title="Create Account"
        submitLabel="Create"
        onSubmit={mockOnSubmit}
      />,
    );

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Initial Balance')).toBeInTheDocument();
  });

  it('should show error toast when name is empty', async () => {
    renderWithProviders(
      <AccountForm
        title="Create Account"
        submitLabel="Create"
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Name is required');
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show error toast when type is not selected', async () => {
    renderWithProviders(
      <AccountForm
        title="Create Account"
        submitLabel="Create"
        initialData={{
          name: 'Test Account',
          type: '' as AccountType,
          initialBalance: 0,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Account type is required');
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data and call onSubmit', async () => {
    renderWithProviders(
      <AccountForm
        title="Create Account"
        submitLabel="Create"
        initialData={{
          name: 'Main Checking',
          type: AccountType.CHECKING,
          initialBalance: 1000,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Main Checking',
        type: AccountType.CHECKING,
        initialBalance: 1000,
      });
    });

    // initialData is provided so it shows update success
    expect(toast.success).toHaveBeenCalledWith('Account updated successfully');
    expect(mockRouterPush).toHaveBeenCalledWith('/accounts');
  });

  it('should show update success toast when initialData is provided', async () => {
    renderWithProviders(
      <AccountForm
        title="Edit Account"
        submitLabel="Save"
        initialData={{
          name: 'Main Checking',
          type: AccountType.CHECKING,
          initialBalance: 1000,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Account updated successfully',
      );
    });
  });

  it('should handle API exception', async () => {
    mockOnSubmit.mockRejectedValue(new ApiException(400, 'Account name taken'));

    renderWithProviders(
      <AccountForm
        title="Create Account"
        submitLabel="Create"
        initialData={{
          name: 'Test',
          type: AccountType.SAVINGS,
          initialBalance: 0,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Account name taken');
    });
  });

  it('should navigate to accounts on cancel', async () => {
    renderWithProviders(
      <AccountForm
        title="Create Account"
        submitLabel="Create"
        onSubmit={mockOnSubmit}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockRouterPush).toHaveBeenCalledWith('/accounts');
  });

  it('should render initial data correctly', async () => {
    renderWithProviders(
      <AccountForm
        title="Edit Account"
        submitLabel="Save"
        initialData={{
          name: 'Savings Account',
          type: AccountType.SAVINGS,
          initialBalance: 5000,
        }}
        onSubmit={mockOnSubmit}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Savings Account')).toBeInTheDocument();
      expect(screen.getByDisplayValue('$5,000.00')).toBeInTheDocument();
    });
  });
});
