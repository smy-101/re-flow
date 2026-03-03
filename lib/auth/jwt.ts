import { SignJWT, jwtVerify } from 'jose';

const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  sub: string; // user ID
  iat: number;
  exp: number;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error(
      'JWT_SECRET environment variable is not set. ' +
        'Please set it in your .env.local file.'
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(userId: number): Promise<string> {
  const secret = getJwtSecret();

  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  const secret = getJwtSecret();

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      iat: payload.iat!,
      exp: payload.exp!,
    };
  } catch {
    return null;
  }
}

export async function getUserIdFromToken(token: string): Promise<number | null> {
  const payload = await verifyToken(token);
  if (!payload) return null;
  return parseInt(payload.sub, 10);
}
