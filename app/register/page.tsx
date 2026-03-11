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
const MIN_PASSWORD_LENGTH = 8;
const CODE_SEND_INTERVAL = 60;

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
    nickname: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = '请输入邮箱';
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }

    if (!formData.code) {
      newErrors.code = '请输入验证码';
    } else if (!/^\d{6}$/.test(formData.code)) {
      newErrors.code = '验证码为 6 位数字';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `密码至少需要 ${MIN_PASSWORD_LENGTH} 个字符`;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      setErrors({ email: '请输入邮箱' });
      return;
    }

    if (!EMAIL_REGEX.test(formData.email)) {
      setErrors({ email: '邮箱格式不正确' });
      return;
    }

    setIsSendingCode(true);
    setErrors({});

    try {
      const result = await sendVerificationCode(formData.email, 'register');

      if (!result.success) {
        setErrors({ code: result.error || '发送验证码失败' });
        if (result.waitSeconds) {
          setCountdown(result.waitSeconds);
        }
        return;
      }

      setCountdown(CODE_SEND_INTERVAL);
    } catch {
      setErrors({ code: '发送验证码失败，请稍后重试' });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          code: formData.code,
          nickname: formData.nickname || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || '注册失败，请稍后重试' });
        return;
      }

      router.push('/login?registered=true');
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
    <AuthShell
      title="注册账户"
      description="创建账号后即可保存订阅、收藏文章，并管理 AI 配置与模板。"
      footer={
        <p>
          已有账户？{' '}
          <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
            立即登录
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        {errors.form ? (
          <Alert variant="destructive">
            <AlertTitle>注册失败</AlertTitle>
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

          <div className="space-y-2">
            <label htmlFor="code" className="block text-sm font-medium text-foreground">
              验证码
            </label>
            <div className="flex items-start gap-2">
              <Input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6 位数字验证码"
                value={formData.code}
                onChange={handleChange}
                error={errors.code}
                containerClassName="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleSendCode}
                disabled={isSendingCode || countdown > 0}
                loading={isSendingCode}
                className="mt-0 min-w-32"
              >
                {countdown > 0 ? `${countdown} 秒` : '发送验证码'}
              </Button>
            </div>
          </div>

          <Input
            id="nickname"
            name="nickname"
            type="text"
            label="昵称"
            placeholder="不填则使用邮箱前缀"
            value={formData.nickname}
            onChange={handleChange}
            helperText="可选字段，用于在界面中显示您的名称。"
          />

          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            label="密码"
            placeholder="至少 8 个字符"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            label="确认密码"
            placeholder="再次输入密码"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <Button type="submit" loading={isLoading} fullWidth>
            创建账户
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
