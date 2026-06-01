export function resolveLang(acceptLanguage?: string): string {
  if (!acceptLanguage) return 'en';
  const first = acceptLanguage.split(',')[0]?.trim().toLowerCase() ?? 'en';
  if (first.startsWith('pt')) return 'pt-BR';
  return 'en';
}
