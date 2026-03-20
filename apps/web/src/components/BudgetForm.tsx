'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import CurrencyInput from 'react-currency-input-field';
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
import { CreateBudgetDto, Category } from '@/types';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';
import { categoriesApi } from '@/lib/categories';
import { budgetsApi } from '@/lib/budgets';

interface BudgetFormProps {
  initialData?: {
    amount: number;
    categoryId: string;
    month: number;
    year: number;
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
    initialData?.amount != null ? initialData.amount.toFixed(2) : '',
  );
  const [amountFloat, setAmountFloat] = useState<number | null>(
    initialData?.amount ?? null,
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.categoryId || '',
  );
  const [month, setMonth] = useState<number | ''>(initialData?.month || '');
  const [year, setYear] = useState<string>(
    initialData?.year?.toString() || new Date().getFullYear().toString(),
  );
  const [repeatUntil, setRepeatUntil] = useState(false);
  const [endMonth, setEndMonth] = useState<number | ''>('');
  const [endYear, setEndYear] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const router = useRouter();
  const t = useTranslations('budgetForm');
  const tCommon = useTranslations('common');
  const tMonths = useTranslations('months');
  const locale = useLocale();
  const intlConfig =
    locale === 'pt-BR'
      ? { locale: 'pt-BR', currency: 'BRL' }
      : { locale: 'en-US', currency: 'USD' };

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

    const yearNum = parseInt(year, 10);

    if (amountFloat === null || amountFloat === undefined) {
      toast.error(t('amountRequired'));
      return;
    }

    if (amountFloat <= 0) {
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

    if (repeatUntil && !initialData) {
      if (!endMonth) {
        toast.error(t('endMonthRequired'));
        return;
      }
      const endYearNum = parseInt(endYear, 10);
      if (!endYear || isNaN(endYearNum)) {
        toast.error(t('endYearRequired'));
        return;
      }
      const startOrdinal = yearNum * 12 + (month as number);
      const endOrdinal = endYearNum * 12 + (endMonth as number);
      if (endOrdinal < startOrdinal) {
        toast.error(t('endDateBeforeStart'));
        return;
      }
      setIsLoading(true);
      try {
        const result = await budgetsApi.createBatch({
          amount: amountFloat,
          categoryId,
          startMonth: month as number,
          startYear: yearNum,
          endMonth: endMonth as number,
          endYear: endYearNum,
        });
        toast.success(
          t('batchCreateSuccess', {
            created: result.created,
            skipped: result.skipped,
          }),
        );
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
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        amount: amountFloat,
        categoryId,
        month: month as number,
        year: yearNum,
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
            <CurrencyInput
              id="amount"
              className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              placeholder={t('amountPlaceholder')}
              value={amount}
              onValueChange={(value, _name, values) => {
                setAmount(value ?? '');
                setAmountFloat(values?.float ?? null);
              }}
              intlConfig={intlConfig}
              allowNegativeValue={false}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">
                {repeatUntil && !initialData
                  ? t('startMonth')
                  : tCommon('month')}
              </Label>
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
              <Label htmlFor="year">
                {repeatUntil && !initialData ? t('startYear') : tCommon('year')}
              </Label>
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

          {!initialData && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="repeat-until"
                checked={repeatUntil}
                onChange={(e) => setRepeatUntil(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="repeat-until">{t('repeatUntil')}</Label>
            </div>
          )}

          {repeatUntil && !initialData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end-month">{t('endMonth')}</Label>
                <Select
                  value={endMonth.toString()}
                  onValueChange={(value) => setEndMonth(parseInt(value, 10))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="end-month">
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
                <Label htmlFor="end-year">{t('endYear')}</Label>
                <Input
                  id="end-year"
                  type="number"
                  min="2000"
                  max="2100"
                  placeholder={t('yearPlaceholder')}
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-0">
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
