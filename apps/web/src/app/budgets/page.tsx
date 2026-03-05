'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

type FilterType = 'ALL' | BudgetType;
type FilterMonth = 'ALL' | number;
type FilterYear = 'ALL' | number;

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

function formatAmount(amount: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

function formatPeriod(month: number, year: number): string {
  const monthObj = MONTHS.find((m) => m.value === month);
  return `${monthObj?.label || month} ${year}`;
}

// Get unique years from budgets for the filter
function getUniqueYears(budgets: Budget[]): number[] {
  const years = [...new Set(budgets.map((b) => b.year))];
  return years.sort((a, b) => b - a); // Sort descending
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteBudget, setDeleteBudget] = useState<Budget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterMonth, setFilterMonth] = useState<FilterMonth>('ALL');
  const [filterYear, setFilterYear] = useState<FilterYear>('ALL');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [budgetsData, categoriesData] = await Promise.all([
        budgetsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setBudgets(budgetsData);
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
        toast.error('Failed to load budgets');
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
      toast.success('Budget deleted successfully');
      setDeleteBudget(null);
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete budget');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Budgets</h2>
        <Link href="/budgets/new">
          <Button>New Budget</Button>
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
            <SelectValue placeholder="Filter by month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Months</SelectItem>
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
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Years</SelectItem>
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
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <BudgetsTableSkeleton />
        ) : budgets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No budgets yet. Create your first budget to get started.
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No budgets match your filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium">
                    {categoryMap[budget.categoryId] || 'Unknown'}
                  </TableCell>
                  <TableCell>{formatAmount(budget.amount)}</TableCell>
                  <TableCell className="text-gray-500">
                    {formatPeriod(budget.month, budget.year)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        budget.type === 'INCOME'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {budget.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/budgets/${budget.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteBudget(budget)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!deleteBudget} onOpenChange={() => setDeleteBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this budget? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteBudget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
