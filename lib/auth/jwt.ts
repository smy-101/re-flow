import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  sub: string; // user ID
  iat: number;
  exp: number;
}

export async function signToken(userId: number): Promise<string> {
  const secret = JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  const secret = JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

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
