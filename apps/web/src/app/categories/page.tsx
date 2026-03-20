'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { categoriesApi } from '@/lib/categories';
import { Category, CategoryType } from '@/types';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { CategoriesTableSkeleton } from '@/components/CategoriesTableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

type FilterType = 'ALL' | CategoryType;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');

  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
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

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'ALL' || category.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [categories, searchQuery, filterType]);

  const handleDelete = async () => {
    if (!deleteCategory) return;

    setIsDeleting(true);
    try {
      await categoriesApi.delete(deleteCategory.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteCategory.id));
      toast.success(t('deleteSuccess'));
      setDeleteCategory(null);
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
        <Link href="/categories/new">
          <Button>{t('newCategory')}</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={filterType}
          onValueChange={(value) => setFilterType(value as FilterType)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={tCommon('filterByType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{tCommon('allTypes')}</SelectItem>
            <SelectItem value={CategoryType.INCOME}>
              {tCommon('income')}
            </SelectItem>
            <SelectItem value={CategoryType.EXPENSE}>
              {tCommon('expense')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg shadow">
        {isLoading ? (
          <CategoriesTableSkeleton />
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noCategories')}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noMatch')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon('name')}</TableHead>
                  <TableHead>{tCommon('type')}</TableHead>
                  <TableHead>{t('created')}</TableHead>
                  <TableHead className="text-right">
                    {tCommon('actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.type === 'INCOME'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {category.type === 'INCOME'
                          ? tCommon('income')
                          : tCommon('expense')}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/categories/${category.id}/edit`}>
                        <Button variant="outline" size="sm">
                          {tCommon('edit')}
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteCategory(category)}
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

      <Dialog
        open={!!deleteCategory}
        onOpenChange={() => setDeleteCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('deleteConfirm', { name: deleteCategory?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteCategory(null)}
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
