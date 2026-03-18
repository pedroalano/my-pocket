'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { authsApi } from '@/lib/auths';
import { ApiException } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const t = useTranslations('verifyEmail');
  const tCommon = useTranslations('common');
  const { loginWithTokens } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying',
  );
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    authsApi
      .verifyEmail({ token })
      .then((response) => {
        loginWithTokens(response.access_token, response.refresh_token);
        setStatus('success');
        toast.success(t('successMessage'));
        router.push('/dashboard');
      })
      .catch(() => {
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t('checkInboxTitle')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('checkInboxMessage')}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:underline"
            >
              {t('backToLogin')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === 'verifying' || status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t('title')}
            </CardTitle>
            <CardDescription className="text-center flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('verifying')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResending(true);
    try {
      await authsApi.resendVerification({ email: resendEmail });
      toast.success(t('resendSuccess'));
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error(tCommon('unexpectedError'));
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('errorTitle')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('invalidToken')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResend}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resend-email">{t('resendButton')}</Label>
              <Input
                id="resend-email"
                type="email"
                placeholder="you@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
                disabled={isResending}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={isResending}>
              {isResending ? t('resending') : t('resendButton')}
            </Button>
            <Link
              href="/login"
              className="text-sm text-primary hover:underline"
            >
              {t('backToLogin')}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
