import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'iq_booking_platform_secret_key_2026_basra';

export interface TokenPayload {
  userId: string;
  name: string;
  phone: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader?: string | null): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return authHeader;
}

export function normalizeIraqiPhone(phoneStr: string): string {
  if (!phoneStr) return '';
  let cleaned = phoneStr
    .trim()
    .replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/\s+/g, '')
    .replace(/[^0-9+]/g, '');

  if (cleaned.startsWith('+964')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('964')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('7') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}
