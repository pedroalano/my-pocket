import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, setupUser } from '@/test/test-utils';
import { LanguageToggle } from './LanguageToggle';

const mockRouterRefresh = vi.fn();
vi.mock('next/navigation', async () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: mockRouterRefresh,
  }),
  useParams: () => ({}),
}));

describe('LanguageToggle', () => {
  beforeEach(() => {
    mockRouterRefresh.mockClear();
    // Clear the NEXT_LOCALE cookie before each test
    document.cookie = 'NEXT_LOCALE=; max-age=0; path=/';
  });

  it('renders the toggle button', () => {
    renderWithProviders(<LanguageToggle />);
    expect(
      screen.getByTestId('language-toggle'),
    ).toBeInTheDocument();
  });

  it('shows English and Portuguese options when opened', async () => {
    const user = setupUser();
    renderWithProviders(<LanguageToggle />);

    await user.click(screen.getByTestId('language-toggle'));

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Português (BR)')).toBeInTheDocument();
    });
  });

  it('sets NEXT_LOCALE cookie and refreshes when English is selected', async () => {
    const user = setupUser();
    renderWithProviders(<LanguageToggle />);

    await user.click(screen.getByTestId('language-toggle'));
    await waitFor(() => expect(screen.getByText('English')).toBeInTheDocument());
    await user.click(screen.getByText('English'));

    expect(document.cookie).toContain('NEXT_LOCALE=en');
    expect(mockRouterRefresh).toHaveBeenCalled();
  });

  it('sets NEXT_LOCALE cookie and refreshes when Portuguese is selected', async () => {
    const user = setupUser();
    renderWithProviders(<LanguageToggle />);

    await user.click(screen.getByTestId('language-toggle'));
    await waitFor(() =>
      expect(screen.getByText('Português (BR)')).toBeInTheDocument(),
    );
    await user.click(screen.getByText('Português (BR)'));

    expect(document.cookie).toContain('NEXT_LOCALE=pt-BR');
    expect(mockRouterRefresh).toHaveBeenCalled();
  });
});
