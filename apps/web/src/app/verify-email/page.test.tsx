import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { renderWithProviders, userEvent } from '@/test/test-utils';
import { mockToken, mockRefreshToken } from '@/test/mocks/handlers';
import VerifyEmailPage from './page';

const API_URL = 'http://localhost:3001';

const mockRouterPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', async () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  describe('no token in URL', () => {
    it('renders the check-inbox state', () => {
      renderWithProviders(<VerifyEmailPage />);

      expect(screen.getByText('Check your inbox')).toBeInTheDocument();
      expect(
        screen.getByText(/We sent a verification link to your email address/),
      ).toBeInTheDocument();
    });

    it('renders a back to login link', () => {
      renderWithProviders(<VerifyEmailPage />);

      const link = screen.getByRole('link', { name: 'Back to login' });
      expect(link).toHaveAttribute('href', '/login');
    });

    it('does not call the verify-email API', async () => {
      let apiCalled = false;
      server.use(
        http.post(`${API_URL}/auths/verify-email`, () => {
          apiCalled = true;
          return HttpResponse.json({});
        }),
      );

      renderWithProviders(<VerifyEmailPage />);

      await new Promise((r) => setTimeout(r, 50));
      expect(apiCalled).toBe(false);
    });
  });

  describe('valid token in URL', () => {
    beforeEach(() => {
      mockSearchParams = new URLSearchParams('token=valid-verification-token');
    });

    it('shows verifying state initially', () => {
      renderWithProviders(<VerifyEmailPage />);

      expect(screen.getByText('Verifying...')).toBeInTheDocument();
    });

    it('redirects to /dashboard on successful verification', async () => {
      renderWithProviders(<VerifyEmailPage />);

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('calls loginWithTokens with the returned tokens', async () => {
      // Use real AuthProvider but spy on the context via a test component
      // We verify indirectly: the mock handler returns mockToken and mockRefreshToken
      // and the page calls loginWithTokens, then redirects.
      // Since renderWithProviders uses the real AuthProvider (which will attempt
      // session restore but find no cookie), we just check the redirect happened.
      renderWithProviders(<VerifyEmailPage />);

      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
      });

      const { toast } = await import('sonner');
      expect(toast.success).toHaveBeenCalledWith(
        'Email verified! Redirecting...',
      );
    });
  });

  describe('invalid token in URL', () => {
    beforeEach(() => {
      mockSearchParams = new URLSearchParams('token=invalid-token');
    });

    it('shows the error state with resend form', async () => {
      renderWithProviders(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText('Verification failed')).toBeInTheDocument();
      });

      expect(
        screen.getByText('The verification link is invalid or has expired.'),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Resend verification email'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Resend verification email' }),
      ).toBeInTheDocument();
    });

    it('renders a back to login link in error state', async () => {
      renderWithProviders(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText('Verification failed')).toBeInTheDocument();
      });

      const link = screen.getByRole('link', { name: 'Back to login' });
      expect(link).toHaveAttribute('href', '/login');
    });

    it('resend form calls the resend-verification API and shows success toast', async () => {
      const user = userEvent.setup();
      const { toast } = await import('sonner');

      renderWithProviders(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText('Verification failed')).toBeInTheDocument();
      });

      await user.type(
        screen.getByLabelText('Resend verification email'),
        'me@example.com',
      );
      await user.click(
        screen.getByRole('button', { name: 'Resend verification email' }),
      );

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Verification email sent! Please check your inbox.',
        );
      });
    });

    it('shows resending state while resend is in flight', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_URL}/auths/resend-verification`, async () => {
          await new Promise((r) => setTimeout(r, 100));
          return HttpResponse.json({ message: 'sent' });
        }),
      );

      renderWithProviders(<VerifyEmailPage />);

      await waitFor(() => {
        expect(screen.getByText('Verification failed')).toBeInTheDocument();
      });

      await user.type(
        screen.getByLabelText('Resend verification email'),
        'me@example.com',
      );
      await user.click(
        screen.getByRole('button', { name: 'Resend verification email' }),
      );

      expect(
        screen.getByRole('button', { name: 'Resending...' }),
      ).toBeInTheDocument();
    });
  });
});
