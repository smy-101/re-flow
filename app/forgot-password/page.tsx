'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import Alert, { AlertDescription, AlertTitle } from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { sendVerificationCode } from '@/lib/api/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    setError('');

    if (!email) {
      setError('请输入邮箱');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      setError('邮箱格式不正确');
      return;
    }

    setIsSendingCode(true);

    try {
      const result = await sendVerificationCode(email, 'reset_password');

      if (!result.success) {
        setError(result.error || '发送验证码失败');
        if (result.waitSeconds) {
          setCountdown(result.waitSeconds);
        }
        return;
      }

      setCountdown(60);
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      setError('发送验证码失败，请稍后重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  return (
    <AuthShell
      title="忘记密码"
      description="输入注册邮箱后发送验证码，下一步可以直接重置密码。"
      footer={
        <p>
          想起密码了？{' '}
          <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
            返回登录
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>发送失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            label="邮箱"
            placeholder="请输入注册邮箱"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendCode();
              }
            }}
          />

          <Button type="button" onClick={handleSendCode} disabled={isSendingCode || countdown > 0} loading={isSendingCode} fullWidth>
            {countdown > 0 ? `${countdown} 秒后重试` : '发送验证码'}
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
