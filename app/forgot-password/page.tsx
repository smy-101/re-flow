'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendVerificationCode } from '@/lib/api/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    setError('');
    setSuccess('');

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

      setSuccess('验证码已发送到您的邮箱');
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      setError('发送验证码失败，请稍后重试');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendCode();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
            忘记密码
          </h1>

          <p className="mb-6 text-sm text-gray-600">
            请输入您的注册邮箱，我们将发送验证码到该邮箱，帮助您重置密码。
          </p>

          {/* Success Message */}
          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                邮箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="请输入注册邮箱"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSendCode}
              disabled={isSendingCode || countdown > 0}
              className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSendingCode
                ? '发送中...'
                : countdown > 0
                  ? `${countdown}秒后重试`
                  : '发送验证码'}
            </button>
          </div>

          {/* Link to Login */}
          <p className="mt-6 text-center text-sm text-gray-600">
            想起密码了？{' '}
            <a
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              返回登录
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
