'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { api, ApiException, setAccessToken } from '@/lib/api';
import { getRefreshToken, setRefreshToken, clearRefreshToken } from '@/lib/cookies';
import { decodeToken } from '@/lib/token';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function applySession(accessToken: string): void {
    const decodedUser = decodeToken(accessToken);
    setAccessToken(accessToken);
    setToken(accessToken);
    setUser(decodedUser);
  }

  function clearSession(): void {
    setAccessToken(null);
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }
    api
      .post<AuthResponse>('/auths/refresh', { refresh_token: refreshToken })
      .then((response) => {
        if (response.refresh_token) {
          setRefreshToken(response.refresh_token);
        }
        applySession(response.access_token);
      })
      .catch(() => {
        clearRefreshToken();
        clearSession();
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auths/login', data);
    const decodedUser = decodeToken(response.access_token);
    if (!decodedUser) {
      throw new ApiException(401, 'Invalid token received');
    }
    if (response.refresh_token) {
      setRefreshToken(response.refresh_token);
    }
    setAccessToken(response.access_token);
    setToken(response.access_token);
    setUser(decodedUser);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await api.post('/auths/register', data);
  }, []);

  const loginWithTokens = useCallback(
    (accessToken: string, refreshToken: string) => {
      setRefreshToken(refreshToken);
      applySession(accessToken);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const logout = useCallback(() => {
    api.post('/auths/logout').catch(() => {}); // best-effort server-side revocation
    clearRefreshToken();
    clearSession();
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        loginWithTokens,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
