import { ApiError } from '@/types';
import { getLocale } from './cookies';
import { SKIP_REFRESH_ENDPOINTS, tryRefreshToken } from './auth-refresh';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

// Module-level access token — set by AuthContext, read by apiRequest
let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

function getToken(): string | null {
  return _accessToken;
}

export interface ApiRequestOptions extends RequestInit {
  responseType?: 'json' | 'blob';
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  _isRetry = false,
): Promise<T> {
  const token = getToken();
  const { responseType = 'json', ...fetchOptions } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept-Language': getLocale(),
    ...fetchOptions.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (
    response.status === 401 &&
    !_isRetry &&
    !SKIP_REFRESH_ENDPOINTS.includes(endpoint)
  ) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      setAccessToken(newToken);
      return apiRequest<T>(endpoint, options, true);
    }
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiException(401, 'Session expired. Please log in again.');
  }

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'An unexpected error occurred',
      statusCode: response.status,
    }));
    throw new ApiException(response.status, error.message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (responseType === 'blob') {
    return (await response.blob()) as unknown as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};
