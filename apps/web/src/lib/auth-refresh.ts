import { getRefreshToken, setRefreshToken, clearRefreshToken } from './cookies';
import { setAccessToken } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Auth endpoints that should NOT trigger the 401 refresh interceptor
export const SKIP_REFRESH_ENDPOINTS = [
  '/auths/refresh',
  '/auths/login',
  '/auths/register',
];

export async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auths/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearRefreshToken();
      return null;
    }

    const data = await response.json();
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token);
    }
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export async function handleUnauthorized(
  endpoint: string,
  isRetry: boolean,
  retryFn: () => Promise<unknown>,
): Promise<{ retried: boolean; result?: unknown }> {
  if (isRetry || SKIP_REFRESH_ENDPOINTS.includes(endpoint)) {
    return { retried: false };
  }

  const newToken = await tryRefreshToken();
  if (newToken) {
    setAccessToken(newToken);
    return { retried: true, result: await retryFn() };
  }

  setAccessToken(null);
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  return { retried: false };
}
