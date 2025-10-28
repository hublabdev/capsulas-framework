/**
 * JWT Auth Capsule - Utils
 */

import * as crypto from 'crypto';

export function generateJTI(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function parseExpiry(expiry: string | number): number {
  if (typeof expiry === 'number') {
    return expiry;
  }

  // Parse string expiry like '15m', '7d', '1h'
  const units: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
    w: 60 * 60 * 24 * 7,
  };

  const match = expiry.match(/^(\d+)([smhdw])$/);
  if (!match) {
    throw new Error(`Invalid expiry format: ${expiry}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  return value * units[unit];
}

export function calculateExpiryTimestamp(expiry: string | number): number {
  const seconds = parseExpiry(expiry);
  return Math.floor(Date.now() / 1000) + seconds;
}

export function isExpired(exp: number, clockTolerance = 0): boolean {
  const now = Math.floor(Date.now() / 1000);
  return exp + clockTolerance < now;
}

export function extractTokenFromHeader(header: string): string | null {
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7).trim();
}

export function decodeTokenPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function base64UrlEncode(input: string | Buffer): string {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const newHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(newHash));
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function sanitizePayload(payload: any): any {
  // Remove sensitive fields
  const sanitized = { ...payload };
  delete sanitized.password;
  delete sanitized.passwordHash;
  delete sanitized.salt;
  delete sanitized.secret;
  return sanitized;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createTokenFingerprint(): string {
  return crypto.randomBytes(32).toString('hex');
}
