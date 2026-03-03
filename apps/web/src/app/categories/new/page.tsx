'use client';

import { categoriesApi } from '@/lib/categories';
import { CategoryForm } from '@/components/CategoryForm';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default function NewCategoryPage() {
  return (
    <AuthLayout>
      <div className="flex justify-center">
        <CategoryForm
          title="Create Category"
          submitLabel="Create"
          onSubmit={categoriesApi.create}
        />
      </div>
    </AuthLayout>
  );
}
