import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { ExportCsvButton } from './ExportCsvButton';
import { renderWithProviders, setupUser } from '@/test/test-utils';

const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: toastMocks.success, error: toastMocks.error },
}));

describe('ExportCsvButton', () => {
  beforeEach(() => {
    toastMocks.success.mockReset();
    toastMocks.error.mockReset();
  });

  it('fetches blob, triggers download, and shows success toast', async () => {
    const user = setupUser();
    const blob = new Blob(['﻿h1,h2\n'], { type: 'text/csv' });
    const onExport = vi.fn().mockResolvedValue(blob);
    const createObjectURL = vi.fn().mockReturnValue('blob:fake');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(global.URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(global.URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    });
    const anchorClick = vi.fn();
    const realCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreateElement(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: anchorClick });
      }
      return el;
    });

    renderWithProviders(
      <ExportCsvButton
        onExport={onExport}
        filenamePrefix="transactions"
        label="Export CSV"
        successMessage="ok"
        errorMessage="fail"
      />,
    );

    await user.click(screen.getByRole('button', { name: /export csv/i }));

    await waitFor(() => expect(onExport).toHaveBeenCalled());
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(anchorClick).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake');
    expect(toastMocks.success).toHaveBeenCalledWith('ok');
  });

  it('shows error toast on failure', async () => {
    const user = setupUser();
    const onExport = vi.fn().mockRejectedValue(new Error('boom'));

    renderWithProviders(
      <ExportCsvButton
        onExport={onExport}
        filenamePrefix="x"
        label="Export CSV"
        successMessage="ok"
        errorMessage="fail"
      />,
    );

    await user.click(screen.getByRole('button', { name: /export csv/i }));

    await waitFor(() => expect(toastMocks.error).toHaveBeenCalledWith('fail'));
  });
});
