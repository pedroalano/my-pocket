'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ApiException } from '@/lib/api';

interface ExportCsvButtonProps {
  onExport: () => Promise<Blob>;
  filenamePrefix: string;
  label: string;
  successMessage: string;
  errorMessage: string;
}

export function ExportCsvButton({
  onExport,
  filenamePrefix,
  label,
  successMessage,
  errorMessage,
}: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const blob = await onExport();
      const url = URL.createObjectURL(blob);
      const today = new Date().toISOString().slice(0, 10);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${filenamePrefix}-${today}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success(successMessage);
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      aria-label={label}
    >
      <Download className="size-4" />
      {label}
    </Button>
  );
}
