'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { UserCircle, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();
  const t = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-foreground">My Pocket</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t('dashboard')}
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t('categories')}
              </Link>
              <Link
                href="/budgets"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t('budgets')}
              </Link>
              <Link
                href="/transactions"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t('transactions')}
              </Link>
              <Link
                href="/recurring-transactions"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t('recurringTransactions')}
              </Link>
              {user?.isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {t('admin')}
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <LanguageToggle />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="User menu">
                  <UserCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">{t('settings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('dashboard')}
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('categories')}
            </Link>
            <Link
              href="/budgets"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('budgets')}
            </Link>
            <Link
              href="/transactions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('transactions')}
            </Link>
            <Link
              href="/recurring-transactions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('recurringTransactions')}
            </Link>
            {user?.isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('admin')}
              </Link>
            )}
          </nav>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
