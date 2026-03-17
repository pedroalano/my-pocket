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
import { CreateTransactionDto, Category } from '@/types';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';
import { categoriesApi } from '@/lib/categories';

interface TransactionFormProps {
  initialData?: {
    amount: number;
    categoryId: string;
    date: string;
    description?: string;
  };
  onSubmit: (data: CreateTransactionDto) => Promise<unknown>;
  title: string;
  submitLabel: string;
}

export function TransactionForm({
  initialData,
  onSubmit,
  title,
  submitLabel,
}: TransactionFormProps) {
  const [amount, setAmount] = useState<string>(
    initialData?.amount != null ? initialData.amount.toFixed(2) : '',
  );
  const [amountFloat, setAmountFloat] = useState<number | null>(
    initialData?.amount ?? null,
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.categoryId || '',
  );
  const [date, setDate] = useState<string>(initialData?.date || '');
  const [description, setDescription] = useState<string>(
    initialData?.description || '',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const router = useRouter();
  const t = useTranslations('transactionForm');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const intlConfig =
    locale === 'pt-BR'
      ? { locale: 'pt-BR', currency: 'BRL' }
      : { locale: 'en-US', currency: 'USD' };

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

    if (!date) {
      toast.error(t('dateRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        amount: amountFloat,
        categoryId,
        date: new Date(date).toISOString(),
        description: description || undefined,
      });
      toast.success(initialData ? t('updateSuccess') : t('createSuccess'));
      router.push('/transactions');
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

          <div className="space-y-2">
            <Label htmlFor="date">{tCommon('date')}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('descriptionOptional')}</Label>
            <Input
              id="description"
              type="text"
              placeholder={t('descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/transactions')}
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
