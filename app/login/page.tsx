'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import Alert, { AlertDescription, AlertTitle } from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setNotice('注册成功，请使用刚刚创建的账户登录。');
    } else if (searchParams.get('reset') === 'true') {
      setNotice('密码重置成功，请使用新密码登录。');
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || '登录失败，请稍后重试' });
        return;
      }

      router.push('/');
    } catch {
      setErrors({ form: '网络错误，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.form) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        delete next.form;
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      {notice ? (
        <Alert variant="success">
          <AlertTitle>状态更新</AlertTitle>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}

      {errors.form ? (
        <Alert variant="destructive">
          <AlertTitle>登录失败</AlertTitle>
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          label="邮箱"
          placeholder="请输入邮箱"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          label="密码"
          placeholder="请输入密码"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
            忘记密码？
          </Link>
        </div>

        <Button type="submit" loading={isLoading} fullWidth>
          登录
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="登录"
      description="继续访问您的订阅与阅读工作流。登录后会直接回到仪表盘。"
      footer={
        <p>
          还没有账户？{' '}
          <Link href="/register" className="font-medium text-primary transition-colors hover:text-primary/80">
            立即注册
          </Link>
        </p>
      }
    >
      <Suspense fallback={<div className="py-8 text-center text-muted-foreground">加载中...</div>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
