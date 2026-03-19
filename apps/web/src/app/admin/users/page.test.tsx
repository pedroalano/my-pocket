import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import {
  mockToken,
  mockAdminUser,
  mockAdminUsers,
} from '@/test/mocks/handlers';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { AuthContext } from '@/contexts/AuthContext';
import { setAccessToken } from '@/lib/api';
import enMessages from '../../../../messages/en.json';
import AdminUsersPage from './page';

const API_URL = 'http://localhost:3001';

const mockRouterPush = vi.fn();
vi.mock('next/navigation', async () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderWithAdminUser() {
  setAccessToken(mockToken);
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <AuthContext.Provider
        value={{
          user: mockAdminUser,
          token: mockToken,
          isAuthenticated: true,
          isLoading: false,
          login: vi.fn(),
          register: vi.fn(),
          loginWithTokens: vi.fn(),
          logout: vi.fn(),
          updateUser: vi.fn(),
        }}
      >
        <AdminUsersPage />
      </AuthContext.Provider>
    </NextIntlClientProvider>,
  );
}

function renderWithRegularUser() {
  setAccessToken(mockToken);
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <AuthContext.Provider
        value={{
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            isAdmin: false,
          },
          token: mockToken,
          isAuthenticated: true,
          isLoading: false,
          login: vi.fn(),
          register: vi.fn(),
          loginWithTokens: vi.fn(),
          logout: vi.fn(),
          updateUser: vi.fn(),
        }}
      >
        <AdminUsersPage />
      </AuthContext.Provider>
    </NextIntlClientProvider>,
  );
}

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user list table with user data', async () => {
    renderWithAdminUser();

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('disables action button for own user row', async () => {
    renderWithAdminUser();

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // The first user (Test User) is the logged-in admin - their button should be disabled
    const rows = screen.getAllByRole('row');
    // Find the row for the admin user (test-user-id = mockAdminUsers[0])
    const adminRow = rows.find((row) => row.textContent?.includes('Test User'));
    expect(adminRow).toBeTruthy();
    const button = adminRow!.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('calls updateUserStatus and shows toast on deactivate', async () => {
    const { toast } = await import('sonner');
    const user = userEvent.setup();
    renderWithAdminUser();

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Alice is active — find the enabled Deactivate button (own-user button is disabled)
    const deactivateButtons = screen.getAllByRole('button', {
      name: 'Deactivate',
    });
    const enabledDeactivate = deactivateButtons.find(
      (btn) => !btn.hasAttribute('disabled'),
    );
    expect(enabledDeactivate).toBeTruthy();
    await user.click(enabledDeactivate!);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('calls updateUserStatus and shows toast on activate', async () => {
    const { toast } = await import('sonner');
    const user = userEvent.setup();
    renderWithAdminUser();

    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    // Bob is inactive — click Activate
    const activateButton = screen.getByRole('button', { name: 'Activate' });
    await user.click(activateButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('redirects non-admin user to dashboard', async () => {
    renderWithRegularUser();

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
