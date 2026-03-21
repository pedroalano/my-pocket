'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { PaginatedResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { transactionsApi, GetTransactionsParams } from '@/lib/transactions';
import { categoriesApi } from '@/lib/categories';
import { Transaction, Category, TransactionType } from '@/types';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { TransactionsTableSkeleton } from '@/components/TransactionsTableSkeleton';
import { Pagination } from '@/components/Pagination';
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

export default function TransactionsPage() {
  const [transactions, setTransactions] =
    useState<PaginatedResponse<Transaction> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTransaction, setDeleteTransaction] =
    useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('transactions');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const categoryMap = useMemo(() => {
    return categories.reduce(
      (acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [categories]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const params: GetTransactionsParams = { page: currentPage, limit: 20 };
        if (filterType !== 'ALL') params.type = filterType;
        if (filterCategory !== 'ALL') params.categoryId = filterCategory;
        if (filterStartDate) params.startDate = filterStartDate;
        if (filterEndDate) params.endDate = filterEndDate;

        const [transactionsData, categoriesData] = await Promise.all([
          transactionsApi.getAll(params),
          categoriesApi.getAll(),
        ]);
        if (!cancelled) {
          setTransactions(transactionsData);
          setCategories(categoriesData);
        }
      } catch (error) {
        if (cancelled) return;
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
        if (!cancelled) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    currentPage,
    filterType,
    filterCategory,
    filterStartDate,
    filterEndDate,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterTypeChange = (value: FilterType) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const handleFilterCategoryChange = (value: FilterCategory) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };

  const handleFilterStartDateChange = (value: string) => {
    setFilterStartDate(value);
    setCurrentPage(1);
  };

  const handleFilterEndDateChange = (value: string) => {
    setFilterEndDate(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterType('ALL');
    setFilterCategory('ALL');
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTransaction) return;

    setIsDeleting(true);
    try {
      await transactionsApi.delete(deleteTransaction.id);
      setTransactions((prev) => {
        if (!prev) return prev;
        const newData = prev.data.filter((t) => t.id !== deleteTransaction.id);
        const newTotal = prev.total - 1;
        const newTotalPages = Math.ceil(newTotal / prev.limit);
        // If current page becomes empty and we're not on page 1, go back
        if (newData.length === 0 && currentPage > 1) {
          setCurrentPage((p) => p - 1);
          return prev;
        }
        return {
          ...prev,
          data: newData,
          total: newTotal,
          totalPages: newTotalPages,
        };
      });
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
            onChange={(e) => handleFilterStartDateChange(e.target.value)}
            className="w-[150px]"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="end-date">{t('endDate')}</Label>
          <Input
            id="end-date"
            type="date"
            value={filterEndDate}
            onChange={(e) => handleFilterEndDateChange(e.target.value)}
            className="w-[150px]"
          />
        </div>

        <Select
          value={filterType}
          onValueChange={(value) => handleFilterTypeChange(value as FilterType)}
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
          onValueChange={(value) =>
            handleFilterCategoryChange(value as FilterCategory)
          }
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
        ) : transactions?.data.length === 0 && transactions?.total === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noTransactions')}
          </div>
        ) : transactions?.data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noMatch')}
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                {transactions?.data.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDateUTC(transaction.date, locale)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.description || '-'}
                    </TableCell>
                    <TableCell>
                      {categoryMap[transaction.categoryId] ||
                        tCommon('unknown')}
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
          </div>
        )}
      </div>

      {transactions && (
        <Pagination
          page={transactions.page}
          totalPages={transactions.totalPages}
          onPageChange={setCurrentPage}
          disabled={isLoading}
        />
      )}

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
