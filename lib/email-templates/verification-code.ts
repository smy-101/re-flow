import type { VerificationCodeType } from '@/lib/db/schema';

export function getVerificationEmailHtml(
  code: string,
  type: VerificationCodeType,
): string {
  const title = type === 'register' ? '验证您的邮箱' : '重置密码';
  const description = type === 'register'
    ? '感谢您注册 Re:Flow！请使用以下验证码完成邮箱验证：'
    : '您正在重置密码，请使用以下验证码完成操作：';
  const warning = type === 'register'
    ? '如果这不是您的操作，请忽略此邮件。'
    : '如果这不是您的操作，请立即修改密码以确保账户安全。';

  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Re:Flow</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <h1 style="margin: 0 0 20px; font-size: 24px; color: #1a1a1a; text-align: center;">
          ${title}
        </h1>
        <p style="margin: 0 0 30px; font-size: 16px; color: #666666; text-align: center; line-height: 1.5;">
          ${description}
        </p>
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">
            ${code}
          </span>
        </div>
        <p style="margin: 0 0 20px; font-size: 14px; color: #999999; text-align: center;">
          验证码有效期为 10 分钟，请尽快使用。
        </p>
        <p style="margin: 0; font-size: 14px; color: #ff6b6b; text-align: center;">
          ${warning}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #999999;">
          此邮件由系统自动发送，请勿回复。
        </p>
        <p style="margin: 10px 0 0; font-size: 12px; color: #999999;">
          © ${new Date().getFullYear()} Re:Flow. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
