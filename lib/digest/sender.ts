import { sendEmail } from '@/lib/auth/email';

/**
 * Input for sending a digest email
 */
export interface SendDigestInput {
  to: string;
  subject: string;
  htmlContent: string;
  userId: number;
  configId: number;
  itemCount: number;
}

/**
 * Result of sending a digest email
 */
export interface SendDigestResult {
  success: boolean;
  error?: string;
  configId: number;
}

/**
 * Input for updating config after send
 */
export interface UpdateConfigInput {
  success: boolean;
  configId: number;
  itemCount?: number;
  currentFailureCount?: number;
  error?: string;
}

/**
 * Result of updating config
 */
export interface UpdateConfigResult {
  consecutiveFailures: number;
  pausedDueToFailures: boolean;
  lastSentAt?: number;
}

/**
 * Maximum consecutive failures before pausing
 */
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Check if digest should be paused due to failures
 */
export function shouldPauseDueToFailures(consecutiveFailures: number): boolean {
  return consecutiveFailures >= MAX_CONSECUTIVE_FAILURES;
}

/**
 * Send a digest email
 */
export async function sendDigestEmail(
  input: SendDigestInput,
): Promise<SendDigestResult> {
  const { to, subject, htmlContent, configId } = input;

  // Validate recipient
  if (!to || to.trim() === '') {
    return {
      success: false,
      error: 'No recipient email address provided',
      configId,
    };
  }

  try {
    await sendEmail({
      to,
      subject,
      html: htmlContent,
    });

    return {
      success: true,
      configId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      configId,
    };
  }
}

/**
 * Calculate updated config values after a send attempt
 */
export function updateConfigAfterSend(input: UpdateConfigInput): UpdateConfigResult {
  const { success, currentFailureCount = 0 } = input;

  if (success) {
    return {
      consecutiveFailures: 0,
      pausedDueToFailures: false,
      lastSentAt: Math.floor(Date.now() / 1000),
    };
  }

  const newFailureCount = currentFailureCount + 1;
  const shouldPause = shouldPauseDueToFailures(newFailureCount);

  return {
    consecutiveFailures: newFailureCount,
    pausedDueToFailures: shouldPause,
  };
}
