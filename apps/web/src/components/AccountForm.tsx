'use client';

import { useState } from 'react';
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
import { AccountType, CreateAccountDto } from '@/types';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';

interface AccountFormProps {
  initialData?: {
    name: string;
    type: AccountType;
    initialBalance: number;
  };
  onSubmit: (data: CreateAccountDto) => Promise<unknown>;
  title: string;
  submitLabel: string;
}

export function AccountForm({
  initialData,
  onSubmit,
  title,
  submitLabel,
}: AccountFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<AccountType | ''>(initialData?.type || '');
  const [initialBalance, setInitialBalance] = useState<string>(
    initialData?.initialBalance != null
      ? initialData.initialBalance.toFixed(2)
      : '',
  );
  const [initialBalanceFloat, setInitialBalanceFloat] = useState<number | null>(
    initialData?.initialBalance ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('accountForm');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const intlConfig =
    locale === 'pt-BR'
      ? { locale: 'pt-BR', currency: 'BRL' }
      : { locale: 'en-US', currency: 'USD' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t('nameRequired'));
      return;
    }

    if (!type) {
      toast.error(t('typeRequired'));
      return;
    }

    if (initialBalanceFloat === null || initialBalanceFloat === undefined) {
      toast.error(t('initialBalanceRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        initialBalance: initialBalanceFloat,
      });
      toast.success(initialData ? t('updateSuccess') : t('createSuccess'));
      router.push('/accounts');
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
            <Label htmlFor="name">{tCommon('name')}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{tCommon('type')}</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as AccountType)}
              disabled={isLoading}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder={t('selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AccountType.CHECKING}>
                  {t('typeChecking')}
                </SelectItem>
                <SelectItem value={AccountType.SAVINGS}>
                  {t('typeSavings')}
                </SelectItem>
                <SelectItem value={AccountType.CREDIT_CARD}>
                  {t('typeCreditCard')}
                </SelectItem>
                <SelectItem value={AccountType.CASH}>
                  {t('typeCash')}
                </SelectItem>
                <SelectItem value={AccountType.INVESTMENT}>
                  {t('typeInvestment')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialBalance">{t('initialBalance')}</Label>
            <CurrencyInput
              id="initialBalance"
              className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              placeholder={t('initialBalancePlaceholder')}
              value={initialBalance}
              onValueChange={(value, _name, values) => {
                setInitialBalance(value ?? '');
                setInitialBalanceFloat(values?.float ?? null);
              }}
              intlConfig={intlConfig}
              allowNegativeValue={false}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/accounts')}
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
