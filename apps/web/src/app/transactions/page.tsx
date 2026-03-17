'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { transactionsApi } from '@/lib/transactions';
import { categoriesApi } from '@/lib/categories';
import { Transaction, Category, TransactionType } from '@/types';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { TransactionsTableSkeleton } from '@/components/TransactionsTableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { formatCurrencyFromString, formatDateUTC } from '@/lib/formatters';

type FilterType = 'ALL' | TransactionType;
type FilterCategory = 'ALL' | string;

function parseFilterDate(dateString: string): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTransaction, setDeleteTransaction] =
    useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('transactions');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        transactionsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setTransactions(transactionsData);
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

  const filteredTransactions = useMemo(() => {
    const startDate = parseFilterDate(filterStartDate);
    const endDate = parseFilterDate(filterEndDate);

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      const matchesStartDate = !startDate || transactionDate >= startDate;
      const matchesEndDate =
        !endDate ||
        transactionDate <=
          new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1);
      const matchesType =
        filterType === 'ALL' || transaction.type === filterType;
      const matchesCategory =
        filterCategory === 'ALL' || transaction.categoryId === filterCategory;

      return (
        matchesStartDate && matchesEndDate && matchesType && matchesCategory
      );
    });
  }, [
    transactions,
    filterStartDate,
    filterEndDate,
    filterType,
    filterCategory,
  ]);

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterType('ALL');
    setFilterCategory('ALL');
  };

  const handleDelete = async () => {
    if (!deleteTransaction) return;

    setIsDeleting(true);
    try {
      await transactionsApi.delete(deleteTransaction.id);
      setTransactions((prev) =>
        prev.filter((t) => t.id !== deleteTransaction.id),
      );
      toast.success(t('deleteSuccess'));
      setDeleteTransaction(null);
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
        <Link href="/transactions/new">
          <Button>{t('newTransaction')}</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div className="space-y-1">
          <Label htmlFor="start-date">{t('startDate')}</Label>
          <Input
            id="start-date"
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-[150px]"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="end-date">{t('endDate')}</Label>
          <Input
            id="end-date"
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="w-[150px]"
          />
        </div>

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

        <Button variant="outline" onClick={clearFilters}>
          {tCommon('clearFilters')}
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow">
        {isLoading ? (
          <TransactionsTableSkeleton />
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noTransactions')}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noMatch')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tCommon('date')}</TableHead>
                <TableHead>{tCommon('description')}</TableHead>
                <TableHead>{tCommon('category')}</TableHead>
                <TableHead>{tCommon('type')}</TableHead>
                <TableHead className="text-right">
                  {tCommon('amount')}
                </TableHead>
                <TableHead className="text-right">
                  {tCommon('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDateUTC(transaction.date, locale)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.description || '-'}
                  </TableCell>
                  <TableCell>
                    {categoryMap[transaction.categoryId] || tCommon('unknown')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'INCOME'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === 'INCOME'
                        ? tCommon('income')
                        : tCommon('expense')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrencyFromString(transaction.amount, locale)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/transactions/${transaction.id}/edit`}>
                      <Button variant="outline" size="sm">
                        {tCommon('edit')}
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTransaction(transaction)}
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

      <Dialog
        open={!!deleteTransaction}
        onOpenChange={() => setDeleteTransaction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteTitle')}</DialogTitle>
            <DialogDescription>{t('deleteConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTransaction(null)}
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
