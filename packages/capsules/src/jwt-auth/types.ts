/**
 * JWT Auth Capsule - Types
 */

export type TokenType = 'access' | 'refresh' | 'reset' | 'verification';
export type Algorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';

export interface JWTConfig {
  secret?: string;
  publicKey?: string;
  privateKey?: string;
  algorithm?: Algorithm;
  accessTokenExpiry?: string | number;
  refreshTokenExpiry?: string | number;
  issuer?: string;
  audience?: string;
  clockTolerance?: number;
}

export interface TokenPayload {
  sub?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  [key: string]: any;
}

export interface TokenOptions {
  expiresIn?: string | number;
  audience?: string | string[];
  issuer?: string;
  subject?: string;
  notBefore?: string | number;
  jwtid?: string;
}

export interface SignResult {
  token: string;
  expiresAt: number;
  type: TokenType;
  payload: TokenPayload;
}

export interface VerifyResult {
  valid: boolean;
  payload?: DecodedToken;
  error?: string;
  expired?: boolean;
}

export interface DecodedToken {
  sub?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  iat: number;
  exp: number;
  iss?: string;
  aud?: string | string[];
  jti?: string;
  [key: string]: any;
}

export interface RefreshTokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
}

export interface TokenBlacklist {
  add(jti: string, expiresAt: number): Promise<void>;
  has(jti: string): Promise<boolean>;
  cleanup(): Promise<void>;
}

export interface JWTStats {
  totalSigned: number;
  totalVerified: number;
  totalRefreshed: number;
  failedVerifications: number;
  expiredTokens: number;
  blacklistedTokens: number;
  byType: Record<TokenType, number>;
  averageSignTime: number;
  averageVerifyTime: number;
}

export interface PasswordHashOptions {
  rounds?: number;
  algorithm?: 'bcrypt' | 'argon2';
}

export interface PasswordHashResult {
  hash: string;
  algorithm: string;
  rounds?: number;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    role?: string;
  };
  tokens: RefreshTokenPair;
}
