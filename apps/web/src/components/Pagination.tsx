'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled,
}: PaginationProps) {
  const t = useTranslations('pagination');

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <Button
        variant="outline"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        {t('previous')}
      </Button>
      <span className="text-sm text-muted-foreground">
        {t('pageOf', { page, totalPages })}
      </span>
      <Button
        variant="outline"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        {t('next')}
      </Button>
    </div>
  );
}
