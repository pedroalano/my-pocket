export function formatCurrency(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: locale === 'pt-BR' ? 'BRL' : 'USD',
  }).format(amount);
}

export function formatCurrencyFromString(amount: string, locale: string): string {
  return formatCurrency(parseFloat(amount), locale);
}

export function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(
    locale === 'pt-BR' ? 'pt-BR' : 'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' },
  );
}

export function formatDateUTC(dateStr: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateStr));
}

export function formatMonthYear(date: Date, locale: string): string {
  return date.toLocaleDateString(locale === 'pt-BR' ? 'pt-BR' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
}
