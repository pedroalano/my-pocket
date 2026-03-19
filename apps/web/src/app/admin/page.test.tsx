import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { mockToken, mockAdminUser } from '@/test/mocks/handlers';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { AuthContext } from '@/contexts/AuthContext';
import { setAccessToken } from '@/lib/api';
import enMessages from '../../../messages/en.json';
import AdminPage from './page';

const API_URL = 'http://localhost:3001';

const mockRouterPush = vi.fn();
vi.mock('next/navigation', async () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
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
        <AdminPage />
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
        <AdminPage />
      </AuthContext.Provider>
    </NextIntlClientProvider>,
  );
}

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stat cards with correct numbers', async () => {
    renderWithAdminUser();

    await waitFor(() => {
      expect(screen.getByText('User Statistics')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Inactive Users')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders Manage Users link', async () => {
    renderWithAdminUser();

    await waitFor(() => {
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
    });
  });

  it('redirects non-admin user to dashboard', async () => {
    renderWithRegularUser();

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message when stats fetch fails', async () => {
    server.use(
      http.get(`${API_URL}/admin/stats`, () =>
        HttpResponse.json(
          { message: 'Forbidden', statusCode: 403 },
          { status: 403 },
        ),
      ),
    );

    renderWithAdminUser();

    await waitFor(() => {
      expect(screen.getByText('Failed to load admin data')).toBeInTheDocument();
    });
  });
});
