'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { budgetsApi } from '@/lib/budgets';
import { categoriesApi } from '@/lib/categories';
import { Budget, Category, BudgetType } from '@/types';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { BudgetsTableSkeleton } from '@/components/BudgetsTableSkeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';
import { formatCurrencyFromString } from '@/lib/formatters';

type FilterType = 'ALL' | BudgetType;
type FilterMonth = 'ALL' | number;
type FilterYear = 'ALL' | number;
type FilterCategory = 'ALL' | string;

// Combined type for budgets with optional spending info
type BudgetDisplay = Budget &
  Partial<{
    spent?: string;
    earned?: string;
    remaining: string;
    utilizationPercentage: number;
  }>;

// Get the progress value (spent for EXPENSE, earned for INCOME)
function getProgressValue(budget: BudgetDisplay): string | undefined {
  if (budget.type === BudgetType.INCOME) {
    return budget.earned;
  }
  return budget.spent;
}

// Get unique years from budgets for the filter
function getUniqueYears(budgets: BudgetDisplay[]): number[] {
  const years = [...new Set(budgets.map((b) => b.year))];
  return years.sort((a, b) => b - a); // Sort descending
}

function getUtilizationColor(
  percentage: number | undefined,
  budgetType?: BudgetType,
): string {
  if (percentage === undefined) return '';
  if (budgetType === BudgetType.INCOME) {
    if (percentage >= 75) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }
  if (percentage >= 100) return 'text-red-600 dark:text-red-400';
  if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetDisplay[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteBudget, setDeleteBudget] = useState<BudgetDisplay | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterMonth, setFilterMonth] = useState<FilterMonth>('ALL');
  const [filterYear, setFilterYear] = useState<FilterYear>('ALL');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [hasSpendingInfo, setHasSpendingInfo] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('budgets');
  const tCommon = useTranslations('common');
  const tMonths = useTranslations('months');
  const locale = useLocale();

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: tMonths(String(i + 1)),
  }));

  const loadAllBudgets = useCallback(async () => {
    try {
      const budgetsData = await budgetsApi.getAll();
      setBudgets(budgetsData);
      setHasSpendingInfo(false);
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.statusCode === 401) {
          logout();
          router.push('/login');
          return;
        }
        toast.error(error.message);
      } else {
        toast.error(t('failedToLoad'));
      }
    }
  }, [logout, router, t]);

  const loadBudgetsByCategory = useCallback(
    async (categoryId: string) => {
      try {
        const budgetsData = await budgetsApi.getByCategory(categoryId);
        // Add userId property to match Budget type (for display purposes)
        const budgetsWithUserId = budgetsData.map((b) => ({
          ...b,
          userId: '',
        }));
        setBudgets(budgetsWithUserId);
        setHasSpendingInfo(true);
      } catch (error) {
        if (error instanceof ApiException) {
          if (error.statusCode === 401) {
            logout();
            router.push('/login');
            return;
          }
          toast.error(error.message);
        } else {
          toast.error(t('failedToLoad'));
        }
      }
    },
    [logout, router, t],
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoriesApi.getAll();
        setCategories(categoriesData);
      } catch (error) {
        if (error instanceof ApiException && error.statusCode === 401) {
          logout();
          router.push('/login');
          return;
        }
        toast.error(t('failedToLoadCategories'));
      }
    };

    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated, logout, router, t]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    if (filterCategory === 'ALL') {
      loadAllBudgets().finally(() => setIsLoading(false));
    } else {
      loadBudgetsByCategory(filterCategory).finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, filterCategory, loadAllBudgets, loadBudgetsByCategory]);

  const categoryMap = useMemo(() => {
    return categories.reduce(
      (acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [categories]);

  const availableYears = useMemo(() => getUniqueYears(budgets), [budgets]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      const matchesMonth =
        filterMonth === 'ALL' || budget.month === filterMonth;
      const matchesYear = filterYear === 'ALL' || budget.year === filterYear;
      const matchesType = filterType === 'ALL' || budget.type === filterType;
      return matchesMonth && matchesYear && matchesType;
    });
  }, [budgets, filterMonth, filterYear, filterType]);

  const handleDelete = async () => {
    if (!deleteBudget) return;

    setIsDeleting(true);
    try {
      await budgetsApi.delete(deleteBudget.id);
      setBudgets((prev) => prev.filter((b) => b.id !== deleteBudget.id));
      toast.success(t('deleteSuccess'));
      setDeleteBudget(null);
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error(t('failedToDelete'));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">{t('title')}</h2>
        <Link href="/budgets/new">
          <Button>{t('newBudget')}</Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <Select
          value={filterMonth === 'ALL' ? 'ALL' : String(filterMonth)}
          onValueChange={(value) =>
            setFilterMonth(value === 'ALL' ? 'ALL' : parseInt(value))
          }
        >
          <SelectTrigger className="w-[150px]" data-testid="month-filter">
            <SelectValue placeholder={tCommon('filterByMonth')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{tCommon('allMonths')}</SelectItem>
            {MONTHS.map((month) => (
              <SelectItem key={month.value} value={String(month.value)}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterYear === 'ALL' ? 'ALL' : String(filterYear)}
          onValueChange={(value) =>
            setFilterYear(value === 'ALL' ? 'ALL' : parseInt(value))
          }
        >
          <SelectTrigger className="w-[120px]" data-testid="year-filter">
            <SelectValue placeholder={tCommon('filterByYear')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{tCommon('allYears')}</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterType}
          onValueChange={(value) => setFilterType(value as FilterType)}
        >
          <SelectTrigger className="w-[150px]" data-testid="type-filter">
            <SelectValue placeholder={tCommon('filterByType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{tCommon('allTypes')}</SelectItem>
            <SelectItem value="INCOME">{tCommon('income')}</SelectItem>
            <SelectItem value="EXPENSE">{tCommon('expense')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterCategory}
          onValueChange={(value) => setFilterCategory(value as FilterCategory)}
        >
          <SelectTrigger className="w-[180px]" data-testid="category-filter">
            <SelectValue placeholder={tCommon('filterByCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{tCommon('allCategories')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasSpendingInfo && filterCategory !== 'ALL' && (
        <p className="text-sm text-muted-foreground mb-2">
          {t('showingSpending', { categoryName: categoryMap[filterCategory] })}
        </p>
      )}

      <div className="bg-card rounded-lg shadow">
        {isLoading ? (
          <BudgetsTableSkeleton />
        ) : budgets.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noBudgets')}
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noMatch')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tCommon('category')}</TableHead>
                <TableHead>{tCommon('amount')}</TableHead>
                {hasSpendingInfo && (
                  <>
                    <TableHead>{t('spentEarned')}</TableHead>
                    <TableHead>{t('remaining')}</TableHead>
                    <TableHead>{t('usage')}</TableHead>
                  </>
                )}
                <TableHead>{t('period')}</TableHead>
                <TableHead>{tCommon('type')}</TableHead>
                <TableHead className="text-right">
                  {tCommon('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.map((budget) => {
                const progressValue = getProgressValue(budget);
                return (
                  <TableRow
                    key={budget.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/budgets/${budget.id}`)}
                  >
                    <TableCell className="font-medium">
                      {categoryMap[budget.categoryId] || tCommon('unknown')}
                    </TableCell>
                    <TableCell>
                      {formatCurrencyFromString(budget.amount, locale)}
                    </TableCell>
                    {hasSpendingInfo && progressValue !== undefined && (
                      <>
                        <TableCell>
                          {formatCurrencyFromString(progressValue, locale)}
                        </TableCell>
                        <TableCell
                          className={
                            parseFloat(budget.remaining || '0') < 0
                              ? 'text-red-600 dark:text-red-400'
                              : ''
                          }
                        >
                          {formatCurrencyFromString(
                            budget.remaining || '0',
                            locale,
                          )}
                        </TableCell>
                        <TableCell
                          className={`font-medium ${getUtilizationColor(budget.utilizationPercentage, budget.type)}`}
                        >
                          {budget.utilizationPercentage?.toFixed(1)}%
                        </TableCell>
                      </>
                    )}
                    <TableCell className="text-muted-foreground">
                      {tMonths(String(budget.month))} {budget.year}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          budget.type === 'INCOME'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {budget.type === 'INCOME'
                          ? tCommon('income')
                          : tCommon('expense')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link
                        href={`/budgets/${budget.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="outline" size="sm">
                          {tCommon('edit')}
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteBudget(budget);
                        }}
                      >
                        {tCommon('delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!deleteBudget} onOpenChange={() => setDeleteBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteTitle')}</DialogTitle>
            <DialogDescription>{t('deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteBudget(null)}
              disabled={isDeleting}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? tCommon('deleting') : tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
