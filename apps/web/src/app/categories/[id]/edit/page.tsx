'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { categoriesApi } from '@/lib/categories';
import { CategoryForm } from '@/components/CategoryForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Category, CategoryType } from '@/types';
import { toast } from 'sonner';
import { ApiException } from '@/lib/api';

export default function EditCategoryPage() {
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');

  useEffect(() => {
    if (isAuthenticated && categoryId) {
      loadCategory();
    }
  }, [isAuthenticated, categoryId]);

  const loadCategory = async () => {
    try {
      const data = await categoriesApi.getById(categoryId);
      setCategory(data);
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.statusCode === 404) {
          toast.error(t('notFound'));
          router.push('/categories');
          return;
        }
        if (error.statusCode === 401) {
          logout();
          router.push('/login');
          return;
        }
        toast.error(error.message);
      } else {
        toast.error(t('failedToLoadSingle'));
      }
      router.push('/categories');
    } finally {
      setIsLoadingCategory(false);
    }
  };

  const handleUpdate = async (data: { name: string; type: CategoryType }) => {
    await categoriesApi.update(categoryId, data);
  };

  return (
    <AuthLayout>
      <div className="flex justify-center">
        {isLoadingCategory ? (
          <p className="text-gray-500">{t('loadingCategory')}</p>
        ) : category ? (
          <CategoryForm
            title={t('editTitle')}
            submitLabel={tCommon('save')}
            initialData={{
              name: category.name,
              type: category.type,
            }}
            onSubmit={handleUpdate}
          />
        ) : null}
      </div>
    </AuthLayout>
  );
}
