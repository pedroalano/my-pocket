import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, setupUser } from '@/test/test-utils';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('returns null when totalPages <= 1', () => {
    const { container } = renderWithProviders(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when totalPages is 0', () => {
    const { container } = renderWithProviders(
      <Pagination page={1} totalPages={0} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders Previous and Next buttons when totalPages > 1', () => {
    renderWithProviders(
      <Pagination page={1} totalPages={3} onPageChange={vi.fn()} />,
    );
    expect(
      screen.getByRole('button', { name: 'Previous' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('shows correct page info text', () => {
    renderWithProviders(
      <Pagination page={2} totalPages={5} onPageChange={vi.fn()} />,
    );
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('Previous button is disabled on page 1', () => {
    renderWithProviders(
      <Pagination page={1} totalPages={3} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('Next button is disabled on last page', () => {
    renderWithProviders(
      <Pagination page={3} totalPages={3} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('Previous button is enabled when not on first page', () => {
    renderWithProviders(
      <Pagination page={2} totalPages={3} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Previous' })).not.toBeDisabled();
  });

  it('Next button is enabled when not on last page', () => {
    renderWithProviders(
      <Pagination page={2} totalPages={3} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
  });

  it('calls onPageChange with page - 1 when Previous is clicked', async () => {
    const user = setupUser();
    const onPageChange = vi.fn();
    renderWithProviders(
      <Pagination page={3} totalPages={5} onPageChange={onPageChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with page + 1 when Next is clicked', async () => {
    const user = setupUser();
    const onPageChange = vi.fn();
    renderWithProviders(
      <Pagination page={3} totalPages={5} onPageChange={onPageChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('both buttons are disabled when disabled prop is true', () => {
    renderWithProviders(
      <Pagination page={2} totalPages={5} onPageChange={vi.fn()} disabled />,
    );
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
