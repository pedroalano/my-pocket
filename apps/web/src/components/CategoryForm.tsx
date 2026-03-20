'use client';

import { useState } from 'react';
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
import { CategoryType, CreateCategoryDto } from '@/types';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';

interface CategoryFormProps {
  initialData?: {
    name: string;
    type: CategoryType;
  };
  onSubmit: (data: CreateCategoryDto) => Promise<unknown>;
  title: string;
  submitLabel: string;
}

export function CategoryForm({
  initialData,
  onSubmit,
  title,
  submitLabel,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<CategoryType | ''>(initialData?.type || '');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('categoryForm');
  const tCommon = useTranslations('common');

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

    setIsLoading(true);
    try {
      await onSubmit({ name: name.trim(), type });
      toast.success(initialData ? t('updateSuccess') : t('createSuccess'));
      router.push('/categories');
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
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{tCommon('type')}</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as CategoryType)}
              disabled={isLoading}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder={t('selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CategoryType.INCOME}>
                  {tCommon('income')}
                </SelectItem>
                <SelectItem value={CategoryType.EXPENSE}>
                  {tCommon('expense')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/categories')}
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
