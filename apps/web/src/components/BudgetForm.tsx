'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BudgetType, CreateBudgetDto, Category } from '@/types';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';
import { categoriesApi } from '@/lib/categories';

interface BudgetFormProps {
  initialData?: {
    amount: number;
    categoryId: string;
    month: number;
    year: number;
    type: BudgetType;
  };
  onSubmit: (data: CreateBudgetDto) => Promise<unknown>;
  title: string;
  submitLabel: string;
}

export function BudgetForm({
  initialData,
  onSubmit,
  title,
  submitLabel,
}: BudgetFormProps) {
  const [amount, setAmount] = useState<string>(
    initialData?.amount?.toString() || '',
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.categoryId || '',
  );
  const [month, setMonth] = useState<number | ''>(initialData?.month || '');
  const [year, setYear] = useState<string>(
    initialData?.year?.toString() || new Date().getFullYear().toString(),
  );
  const [type, setType] = useState<BudgetType | ''>(initialData?.type || '');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const router = useRouter();
  const t = useTranslations('budgetForm');
  const tCommon = useTranslations('common');
  const tMonths = useTranslations('months');

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: tMonths(String(i + 1)),
  }));

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch {
        toast.error(t('failedToLoadCategories'));
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    const yearNum = parseInt(year, 10);

    if (!amount || isNaN(amountNum)) {
      toast.error(t('amountRequired'));
      return;
    }

    if (amountNum <= 0) {
      toast.error(t('amountPositive'));
      return;
    }

    if (!categoryId) {
      toast.error(t('categoryRequired'));
      return;
    }

    if (!month) {
      toast.error(t('monthRequired'));
      return;
    }

    if (!year || isNaN(yearNum)) {
      toast.error(t('yearRequired'));
      return;
    }

    if (!type) {
      toast.error(t('typeRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        amount: amountNum,
        categoryId,
        month: month as number,
        year: yearNum,
        type,
      });
      toast.success(initialData ? t('updateSuccess') : t('createSuccess'));
      router.push('/budgets');
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error(tCommon('unexpectedError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{tCommon('amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder={t('amountPlaceholder')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{tCommon('category')}</Label>
            {isLoadingCategories ? (
              <div className="text-sm text-muted-foreground">
                {t('loadingCategories')}
              </div>
            ) : (
              <Select
                value={categoryId}
                onValueChange={setCategoryId}
                disabled={isLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder={t('selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">{tCommon('month')}</Label>
              <Select
                value={month.toString()}
                onValueChange={(value) => setMonth(parseInt(value, 10))}
                disabled={isLoading}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder={t('selectMonth')} />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">{tCommon('year')}</Label>
              <Input
                id="year"
                type="number"
                min="2000"
                max="2100"
                placeholder={t('yearPlaceholder')}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{tCommon('type')}</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as BudgetType)}
              disabled={isLoading}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder={t('selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BudgetType.INCOME}>
                  {tCommon('income')}
                </SelectItem>
                <SelectItem value={BudgetType.EXPENSE}>
                  {tCommon('expense')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/budgets')}
            disabled={isLoading}
          >
            {tCommon('cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? tCommon('saving') : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
