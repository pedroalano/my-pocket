interface ErrorContext {
  componentStack?: string | null;
  type?: 'error-boundary' | 'unhandled-rejection' | 'global-error';
}

export async function logError(error: Error, context?: ErrorContext): Promise<void> {
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: context?.componentStack ?? undefined,
        type: context?.type ?? 'error-boundary',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      }),
    });
  } catch {
    // fail silently — don't throw inside an error handler
    console.error('Failed to report error:', error);
  }
}
