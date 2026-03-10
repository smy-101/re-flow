import type { VerificationCodeType } from '@/lib/db/schema';

interface SendCodeResponse {
  success: boolean;
  message?: string;
  error?: string;
  waitSeconds?: number;
}

interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Send verification code to email
 */
export async function sendVerificationCode(
  email: string,
  type: VerificationCodeType,
): Promise<SendCodeResponse> {
  const response = await fetch('/api/auth/send-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, type }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || '发送验证码失败',
      waitSeconds: data.waitSeconds,
    };
  }

  return {
    success: true,
    message: data.message,
  };
}

/**
 * Reset password with verification code
 */
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || '密码重置失败',
    };
  }

  return {
    success: true,
    message: data.message,
  };
}
