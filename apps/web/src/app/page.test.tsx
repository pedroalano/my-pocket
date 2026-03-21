import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import HomePage from './page';

// Mock next/navigation
const mockRouterPush = vi.fn();
vi.mock('next/navigation', async () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/contexts/AuthContext')>();
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when isLoading is true', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });

    renderWithProviders(<HomePage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to /dashboard when authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });

    renderWithProviders(<HomePage />);

    expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
  });

  it('renders hero headline for unauthenticated users', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    renderWithProviders(<HomePage />);

    expect(
      screen.getByText(
        "When you don't know where your money goes, how can you expect to make more?",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The first step for great gains is being fully aware of your actual financial situation.',
      ),
    ).toBeInTheDocument();
  });

  it('renders all three feature cards', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    renderWithProviders(<HomePage />);

    expect(screen.getByText('Track Every Transaction')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Know exactly where every cent goes. Log income and expenses in seconds.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('Set Smart Budgets')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Plan ahead by category. Set monthly targets and stay in control of your spending.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('Visualize Your Progress')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Clear charts and reports give you a complete picture of your financial health.',
      ),
    ).toBeInTheDocument();
  });

  it('renders CTA section with button', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    renderWithProviders(<HomePage />);

    expect(screen.getByText('Start taking control today')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Awareness is the foundation of every great financial decision.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Get Started Free' }),
    ).toHaveAttribute('href', '/register');
  });

  it('Sign In link points to /login', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    renderWithProviders(<HomePage />);

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('Get Started link in hero points to /register', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });

    renderWithProviders(<HomePage />);

    const getStartedLinks = screen.getAllByRole('link', {
      name: /get started/i,
    });
    expect(
      getStartedLinks.every(
        (link) => link.getAttribute('href') === '/register',
      ),
    ).toBe(true);
  });
});
