/**
 * JWT Auth Capsule - Constants
 */

import type { JWTConfig, JWTStats } from './types';

export const DEFAULT_CONFIG: Partial<JWTConfig> = {
  algorithm: 'HS256',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  clockTolerance: 60, // 60 seconds
};

export const INITIAL_STATS: JWTStats = {
  totalSigned: 0,
  totalVerified: 0,
  totalRefreshed: 0,
  failedVerifications: 0,
  expiredTokens: 0,
  blacklistedTokens: 0,
  byType: {
    access: 0,
    refresh: 0,
    reset: 0,
    verification: 0,
  },
  averageSignTime: 0,
  averageVerifyTime: 0,
};

export const TOKEN_TYPES = {
  ACCESS: 'access' as const,
  REFRESH: 'refresh' as const,
  RESET: 'reset' as const,
  VERIFICATION: 'verification' as const,
};

export const ALGORITHMS = {
  HS256: 'HS256' as const,
  HS384: 'HS384' as const,
  HS512: 'HS512' as const,
  RS256: 'RS256' as const,
  RS384: 'RS384' as const,
  RS512: 'RS512' as const,
};

export const DEFAULT_BCRYPT_ROUNDS = 10;

export const PASSWORD_MIN_LENGTH = 8;

export const JWT_HEADER_PREFIX = 'Bearer ';
