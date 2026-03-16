'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { recurringTransactionsApi } from '@/lib/recurring-transactions';
import { categoriesApi } from '@/lib/categories';
import { RecurringTransaction, Category, RecurringInterval } from '@/types';
import { AuthLayout } from '@/components/layouts/AuthLayout';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';
import { formatCurrencyFromString, formatDateUTC } from '@/lib/formatters';

type FilterType = 'ALL' | 'INCOME' | 'EXPENSE';
type FilterInterval = 'ALL' | RecurringInterval;
type FilterActive = 'ALL' | 'ACTIVE' | 'INACTIVE';

export default function RecurringTransactionsPage() {
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteItem, setDeleteItem] = useState<RecurringTransaction | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [filterInterval, setFilterInterval] = useState<FilterInterval>('ALL');
  const [filterActive, setFilterActive] = useState<FilterActive>('ALL');
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('recurringTransactions');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [rtData, categoriesData] = await Promise.all([
        recurringTransactionsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setRecurringTransactions(rtData);
      setCategories(categoriesData);
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
    } finally {
      setIsLoading(false);
    }
  };

  const categoryMap = useMemo(() => {
    return categories.reduce(
      (acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [categories]);

  const filteredItems = useMemo(() => {
    return recurringTransactions.filter((rt) => {
      const matchesType = filterType === 'ALL' || rt.type === filterType;
      const matchesInterval =
        filterInterval === 'ALL' || rt.interval === filterInterval;
      const matchesActive =
        filterActive === 'ALL' ||
        (filterActive === 'ACTIVE' && rt.isActive) ||
        (filterActive === 'INACTIVE' && !rt.isActive);
      return matchesType && matchesInterval && matchesActive;
    });
  }, [recurringTransactions, filterType, filterInterval, filterActive]);

  const clearFilters = () => {
    setFilterType('ALL');
    setFilterInterval('ALL');
    setFilterActive('ALL');
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      await recurringTransactionsApi.delete(deleteItem.id);
      setRecurringTransactions((prev) =>
        prev.filter((rt) => rt.id !== deleteItem.id),
      );
      toast.success(t('deleteSuccess'));
      setDeleteItem(null);
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
        <Link href="/recurring-transactions/new">
          <Button>{t('newRecurringTransaction')}</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 items-end">
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
          value={filterInterval}
          onValueChange={(value) => setFilterInterval(value as FilterInterval)}
        >
          <SelectTrigger className="w-[180px]" data-testid="interval-filter">
            <SelectValue placeholder={t('filterByInterval')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('allIntervals')}</SelectItem>
            <SelectItem value="DAILY">{t('daily')}</SelectItem>
            <SelectItem value="WEEKLY">{t('weekly')}</SelectItem>
            <SelectItem value="MONTHLY">{t('monthly')}</SelectItem>
            <SelectItem value="YEARLY">{t('yearly')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterActive}
          onValueChange={(value) => setFilterActive(value as FilterActive)}
        >
          <SelectTrigger className="w-[160px]" data-testid="status-filter">
            <SelectValue placeholder={t('filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('allStatuses')}</SelectItem>
            <SelectItem value="ACTIVE">{t('active')}</SelectItem>
            <SelectItem value="INACTIVE">{t('inactive')}</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters}>
          {tCommon('clearFilters')}
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow">
        {isLoading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : recurringTransactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noRecurringTransactions')}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noMatchingRecurringTransactions')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tCommon('description')}</TableHead>
                <TableHead>{tCommon('category')}</TableHead>
                <TableHead>{tCommon('type')}</TableHead>
                <TableHead className="text-right">{tCommon('amount')}</TableHead>
                <TableHead>{t('interval')}</TableHead>
                <TableHead>{t('nextRun')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right">{tCommon('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((rt) => (
                <TableRow key={rt.id}>
                  <TableCell className="font-medium">
                    {rt.description}
                  </TableCell>
                  <TableCell>
                    {categoryMap[rt.categoryId] || tCommon('unknown')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rt.type === 'INCOME'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {rt.type === 'INCOME'
                        ? tCommon('income')
                        : tCommon('expense')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrencyFromString(rt.amount, locale)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {t(rt.interval.toLowerCase() as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateUTC(rt.nextRun, locale)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rt.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}
                    >
                      {rt.isActive ? t('active') : t('inactive')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/recurring-transactions/${rt.id}/edit`}>
                      <Button variant="outline" size="sm">
                        {tCommon('edit')}
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteItem(rt)}
                    >
                      {tCommon('delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteTitle')}</DialogTitle>
            <DialogDescription>{t('deleteDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteItem(null)}
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
