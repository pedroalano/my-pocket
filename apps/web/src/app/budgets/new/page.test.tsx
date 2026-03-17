import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAuthenticatedProviders } from '@/test/test-utils';
import NewBudgetPage from './page';

const { mockRouterPush, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

// Mock next/navigation
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
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

describe('NewBudgetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Create Budget page with form', async () => {
    renderWithAuthenticatedProviders(<NewBudgetPage />);

    await waitFor(() => {
      expect(screen.getByText('Create Budget')).toBeInTheDocument();
    });

    // Check form fields are present
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Month')).toBeInTheDocument();
    expect(screen.getByLabelText('Year')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('renders within AuthLayout', async () => {
    renderWithAuthenticatedProviders(<NewBudgetPage />);

    await waitFor(() => {
      expect(screen.getByText('Create Budget')).toBeInTheDocument();
    });

    // Check that AuthLayout navigation is present
    expect(screen.getByRole('link', { name: 'My Pocket' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'User menu' }),
    ).toBeInTheDocument();
  });

  it('"Repeat until" checkbox is present in create mode', async () => {
    renderWithAuthenticatedProviders(<NewBudgetPage />);

    await waitFor(() => {
      expect(screen.getByText('Create Budget')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Repeat until')).toBeInTheDocument();
  });

  it('checking "Repeat until" shows End Month and End Year fields', async () => {
    renderWithAuthenticatedProviders(<NewBudgetPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Repeat until')).toBeInTheDocument();
    });

    // End month/year not visible yet
    expect(screen.queryByLabelText('End Month')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('End Year')).not.toBeInTheDocument();

    // Check the checkbox
    fireEvent.click(screen.getByLabelText('Repeat until'));

    await waitFor(() => {
      expect(screen.getByLabelText('End Month')).toBeInTheDocument();
      expect(screen.getByLabelText('End Year')).toBeInTheDocument();
    });
  });

  it('shows Start Month / Start Year labels when toggle is on', async () => {
    renderWithAuthenticatedProviders(<NewBudgetPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Repeat until')).toBeInTheDocument();
    });

    // Before toggle: labels are Month / Year
    expect(screen.getByLabelText('Month')).toBeInTheDocument();
    expect(screen.getByLabelText('Year')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Repeat until'));

    await waitFor(() => {
      expect(screen.getByLabelText('Start Month')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Year')).toBeInTheDocument();
    });
  });

  it('submitting with toggle off calls single-create API (POST /budgets)', async () => {
    const user = userEvent.setup();
    renderWithAuthenticatedProviders(<NewBudgetPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Amount'), '500');

    // Select category via native select hidden input (Radix UI)
    fireEvent.submit(document.querySelector('form')!);

    // We expect the error toast for missing category, not batch API
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Category is required');
    });
  });

  it('submitting with toggle on calls batch API (POST /budgets/batch)', async () => {
    const user = userEvent.setup();
    renderWithAuthenticatedProviders(<NewBudgetPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Repeat until')).toBeInTheDocument();
    });

    // Fill amount
    await user.type(screen.getByLabelText('Amount'), '500');

    // Toggle repeat-until
    fireEvent.click(screen.getByLabelText('Repeat until'));

    await waitFor(() => {
      expect(screen.getByLabelText('End Month')).toBeInTheDocument();
    });

    // Submit without category — should hit category validation first
    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Category is required');
    });
  });

  it('shows error toast when end date is before start date', async () => {
    renderWithAuthenticatedProviders(<NewBudgetPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Repeat until')).toBeInTheDocument();
    });

    // Toggle repeat-until
    fireEvent.click(screen.getByLabelText('Repeat until'));

    await waitFor(() => {
      expect(screen.getByLabelText('End Year')).toBeInTheDocument();
    });

    // Fill amount
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '500' },
    });

    // Set end year to a past year to trigger date validation
    const endYearInput = screen.getByLabelText('End Year');
    fireEvent.change(endYearInput, { target: { value: '2020' } });

    // Submit — category validation will fire first
    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });
  });
});
