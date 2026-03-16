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
import {
  CreateRecurringTransactionDto,
  RecurringInterval,
  Category,
} from '@/types';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';
import { categoriesApi } from '@/lib/categories';

interface RecurringTransactionFormProps {
  initialData?: {
    amount: number;
    categoryId: string;
    description: string;
    interval: RecurringInterval;
    startDate: string;
    endDate?: string;
    isActive?: boolean;
  };
  onSubmit: (data: CreateRecurringTransactionDto) => Promise<unknown>;
  title: string;
  submitLabel: string;
}

export function RecurringTransactionForm({
  initialData,
  onSubmit,
  title,
  submitLabel,
}: RecurringTransactionFormProps) {
  const [amount, setAmount] = useState<string>(
    initialData?.amount?.toString() || '',
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.categoryId || '',
  );
  const [description, setDescription] = useState<string>(
    initialData?.description || '',
  );
  const [interval, setInterval] = useState<RecurringInterval | ''>(
    initialData?.interval || '',
  );
  const [startDate, setStartDate] = useState<string>(
    initialData?.startDate || '',
  );
  const [endDate, setEndDate] = useState<string>(initialData?.endDate || '');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const router = useRouter();
  const t = useTranslations('recurringTransactionForm');
  const tCommon = useTranslations('common');
  const tRT = useTranslations('recurringTransactions');

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

    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error(t('amountRequired'));
      return;
    }

    if (!categoryId) {
      toast.error(t('categoryRequired'));
      return;
    }

    if (!description) {
      toast.error(t('descriptionRequired'));
      return;
    }

    if (!interval) {
      toast.error(t('intervalRequired'));
      return;
    }

    if (!startDate) {
      toast.error(t('startDateRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const payload: CreateRecurringTransactionDto = {
        amount: amountNum,
        categoryId,
        description,
        interval: interval as RecurringInterval,
        startDate: new Date(startDate).toISOString(),
      };
      if (endDate) {
        payload.endDate = new Date(endDate).toISOString();
      }
      await onSubmit(payload);
      toast.success(initialData ? t('updateSuccess') : t('createSuccess'));
      router.push('/recurring-transactions');
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
              placeholder="e.g., 99.99"
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

          <div className="space-y-2">
            <Label htmlFor="description">{tCommon('description')}</Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Netflix"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">{tRT('interval')}</Label>
            <Select
              value={interval}
              onValueChange={(value) => setInterval(value as RecurringInterval)}
              disabled={isLoading}
            >
              <SelectTrigger id="interval">
                <SelectValue placeholder={t('selectInterval')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">{tRT('daily')}</SelectItem>
                <SelectItem value="WEEKLY">{tRT('weekly')}</SelectItem>
                <SelectItem value="MONTHLY">{tRT('monthly')}</SelectItem>
                <SelectItem value="YEARLY">{tRT('yearly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">{tRT('startDate')}</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">{t('endDateOptional')}</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/recurring-transactions')}
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
