import { User } from '@/types';

export function decodeToken(token: string): User | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
      isAdmin: decoded.isAdmin ?? false,
    };
  } catch {
    return null;
  }
}
