import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithAuthenticatedProviders, setupUser } from '@/test/test-utils';
import AccountsPage from './page';

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

describe('AccountsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render accounts list from MSW mock', async () => {
    renderWithAuthenticatedProviders(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText('Main Checking')).toBeInTheDocument();
      expect(screen.getByText('Savings')).toBeInTheDocument();
    });
  });

  it('should render account columns', async () => {
    renderWithAuthenticatedProviders(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Initial Balance')).toBeInTheDocument();
      expect(screen.getByText('Current Balance')).toBeInTheDocument();
    });
  });

  it('should show delete dialog when delete button is clicked', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText('Main Checking')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });
  });

  it('should delete account and show success toast on confirm', async () => {
    const user = setupUser();
    renderWithAuthenticatedProviders(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText('Main Checking')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Account deleted successfully',
      );
    });
  });

  it('should show new account button', async () => {
    renderWithAuthenticatedProviders(<AccountsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'New Account' }),
      ).toBeInTheDocument();
    });
  });
});
