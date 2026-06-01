const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days — matches backend expiry

function secureFlag(): string {
  return typeof location !== 'undefined' && location.protocol === 'https:'
    ? '; Secure'
    : '';
}

export function getRefreshToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((r) => r.startsWith(`${REFRESH_TOKEN_COOKIE}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export function setRefreshToken(token: string): void {
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${token}; path=/; max-age=${REFRESH_TOKEN_MAX_AGE}; SameSite=Strict${secureFlag()}`;
}

export function clearRefreshToken(): void {
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Strict${secureFlag()}`;
}

export function getLocale(): string {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie
    .split('; ')
    .find((r) => r.startsWith('NEXT_LOCALE='));
  return match ? match.split('=')[1] : 'en';
}
