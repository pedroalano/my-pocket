'use client';

import { useTranslations } from 'next-intl';
import { categoriesApi } from '@/lib/categories';
import { CategoryForm } from '@/components/CategoryForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default function NewCategoryPage() {
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <CategoryForm
          title={t('createTitle')}
          submitLabel={tCommon('create')}
          onSubmit={categoriesApi.create}
        />
      </div>
    </AuthLayout>
  );
}
