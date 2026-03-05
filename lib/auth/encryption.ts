import crypto from 'node:crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error(
    'ENCRYPTION_KEY must be set as a 64-character hexadecimal string in environment variables',
  );
}

const key = Buffer.from(ENCRYPTION_KEY, 'hex');

/**
 * Encrypts a text string using AES-256-GCM
 * @param text - The plaintext to encrypt
 * @returns An object containing the encrypted text, IV, and authentication tag
 */
export function encrypt(text: string): {
  encrypted: string;
  iv: string;
  tag: string;
} {
  const iv = crypto.randomBytes(16); // 16 bytes IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypts a text string using AES-256-GCM
 * @param encrypted - The encrypted text (hex)
 * @param iv - The initialization vector (hex)
 * @param tag - The authentication tag (hex)
 * @returns The decrypted plaintext
 */
export function decrypt(
  encrypted: string,
  iv: string,
  tag: string,
): string {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
