export interface ValidationResult {
  valid: boolean;
  title?: string;
  error?: string;
}

const API_BASE = '/api';

// API: Validate RSS feed URL
export async function validateFeedUrl(url: string): Promise<ValidationResult> {
  try {
    const response = await fetch(`${API_BASE}/feeds/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedUrl: url }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Validation failed' }));
      return {
        valid: false,
        error: error.message || error.error || 'Validation failed',
      };
    }

    return await response.json() as Promise<ValidationResult>;
  } catch {
    return {
      valid: false,
      error: 'Network error during validation',
    };
  }
}
