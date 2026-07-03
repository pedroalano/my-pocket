import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import HomePage from './page';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get: (target, prop: string) => {
        const el = (target as Record<string, unknown>)[prop];
        if (el) return el;
        return ({ children, ...rest }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) => {
          const Tag = prop as keyof JSX.IntrinsicElements;
          return <Tag {...(rest as object)}>{children}</Tag>;
        };
      },
    }),
    useInView: () => true,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const mockRouterPush = vi.fn();
vi.mock('next/navigation', async () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/contexts/AuthContext')>();
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing while loading', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    const { container } = renderWithProviders(<HomePage />);
    expect(container.firstChild).toBeNull();
  });

  it('redirects to /dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    renderWithProviders(<HomePage />);
    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders hero headline for unauthenticated users', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Take back control')).toBeInTheDocument();
    expect(screen.getByText('of your money.')).toBeInTheDocument();
  });

  it('renders features section', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Dashboard at a glance')).toBeInTheDocument();
    expect(screen.getByText('Smart budgets')).toBeInTheDocument();
    expect(screen.getByText('Visual insights')).toBeInTheDocument();
  });

  it('renders "start for free" CTA links pointing to /register', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderWithProviders(<HomePage />);
    const ctaLinks = screen.getAllByRole('link', { name: /start for free/i });
    expect(ctaLinks.length).toBeGreaterThanOrEqual(1);
    ctaLinks.forEach((link) => expect(link).toHaveAttribute('href', '/register'));
  });

  it('renders sign in links pointing to /login', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderWithProviders(<HomePage />);
    const signInLinks = screen.getAllByRole('link', { name: /sign in/i });
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    signInLinks.forEach((link) => expect(link).toHaveAttribute('href', '/login'));
  });

  it('renders testimonials section', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Marcus R.')).toBeInTheDocument();
    expect(screen.getByText('Sofia C.')).toBeInTheDocument();
    expect(screen.getByText('James T.')).toBeInTheDocument();
  });

  it('renders free pricing section', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderWithProviders(<HomePage />);
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText(/Completely free\./)).toBeInTheDocument();
  });

  it('renders FAQ section', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Is My Pocket really free?')).toBeInTheDocument();
    expect(screen.getByText('Does it connect to my bank?')).toBeInTheDocument();
  });
});
