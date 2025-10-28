/**
 * JWT Auth Capsule - Service
 */

import type {
  JWTConfig,
  TokenPayload,
  TokenOptions,
  SignResult,
  VerifyResult,
  RefreshTokenPair,
  JWTStats,
  TokenType,
  DecodedToken,
  TokenBlacklist,
} from './types';
import { createAdapter, JWTAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import {
  extractTokenFromHeader,
  hashPassword,
  generateSalt,
  verifyPassword,
  validatePassword,
} from './utils';
import {
  createVerifyError,
  createBlacklistedError,
  createRefreshError,
  createPasswordError,
} from './errors';

class MemoryBlacklist implements TokenBlacklist {
  private blacklist = new Map<string, number>();

  async add(jti: string, expiresAt: number): Promise<void> {
    this.blacklist.set(jti, expiresAt);
  }

  async has(jti: string): Promise<boolean> {
    return this.blacklist.has(jti);
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [jti, expiresAt] of this.blacklist.entries()) {
      if (expiresAt < now) {
        this.blacklist.delete(jti);
      }
    }
  }
}

export class JWTAuthService {
  private adapter: JWTAdapter | null = null;
  private config: JWTConfig;
  private stats: JWTStats = { ...INITIAL_STATS };
  private blacklist: TokenBlacklist = new MemoryBlacklist();
  private initialized = false;
  private signTimes: number[] = [];
  private verifyTimes: number[] = [];
  private refreshTokens = new Map<string, { userId: string; expiresAt: number }>();

  constructor(config: JWTConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.adapter = createAdapter(this.config);
    this.initialized = true;
  }

  async sign(payload: TokenPayload, type: TokenType = 'access', options?: TokenOptions): Promise<SignResult> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const startTime = Date.now();
    try {
      const result = this.adapter!.sign(payload, type, options);
      const signTime = Date.now() - startTime;

      this.updateSignStats(type, signTime);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async verify(token: string): Promise<VerifyResult> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const startTime = Date.now();
    try {
      const result = this.adapter!.verify(token);
      const verifyTime = Date.now() - startTime;

      if (result.valid && result.payload) {
        // Check blacklist
        if (result.payload.jti && await this.blacklist.has(result.payload.jti)) {
          this.stats.blacklistedTokens++;
          throw createBlacklistedError(result.payload.jti);
        }

        this.stats.totalVerified++;
      } else {
        this.stats.failedVerifications++;
        if (result.expired) {
          this.stats.expiredTokens++;
        }
      }

      this.updateVerifyTime(verifyTime);
      return result;
    } catch (error) {
      this.stats.failedVerifications++;
      throw error;
    }
  }

  async verifyFromHeader(authHeader: string): Promise<VerifyResult> {
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      throw createVerifyError('Invalid authorization header');
    }
    return this.verify(token);
  }

  async createTokenPair(payload: TokenPayload): Promise<RefreshTokenPair> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    // Sign access token
    const accessResult = await this.sign(payload, 'access');

    // Sign refresh token
    const refreshResult = await this.sign(payload, 'refresh');

    // Store refresh token
    if (refreshResult.payload.jti && payload.sub) {
      this.refreshTokens.set(refreshResult.payload.jti, {
        userId: payload.sub,
        expiresAt: refreshResult.expiresAt,
      });
    }

    return {
      accessToken: accessResult.token,
      refreshToken: refreshResult.token,
      accessExpiresAt: accessResult.expiresAt,
      refreshExpiresAt: refreshResult.expiresAt,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenPair> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    // Verify refresh token
    const verifyResult = await this.verify(refreshToken);
    if (!verifyResult.valid || !verifyResult.payload) {
      throw createRefreshError('Invalid refresh token');
    }

    const jti = verifyResult.payload.jti;
    if (!jti || !this.refreshTokens.has(jti)) {
      throw createRefreshError('Refresh token not found');
    }

    // Extract user payload
    const { sub, email, role, permissions } = verifyResult.payload;
    const newPayload: TokenPayload = { sub, email, role, permissions };

    // Create new token pair
    const tokens = await this.createTokenPair(newPayload);

    // Invalidate old refresh token
    if (jti) {
      await this.blacklist.add(jti, verifyResult.payload.exp * 1000);
      this.refreshTokens.delete(jti);
    }

    this.stats.totalRefreshed++;
    return tokens;
  }

  async revokeToken(token: string): Promise<void> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const decoded = this.adapter!.decode(token);
    if (decoded?.jti) {
      await this.blacklist.add(decoded.jti, decoded.exp * 1000);
      this.refreshTokens.delete(decoded.jti);
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    // Remove all refresh tokens for user
    for (const [jti, data] of this.refreshTokens.entries()) {
      if (data.userId === userId) {
        await this.blacklist.add(jti, data.expiresAt);
        this.refreshTokens.delete(jti);
      }
    }
  }

  decode(token: string): DecodedToken | null {
    if (!this.initialized || !this.adapter) {
      return null;
    }
    return this.adapter.decode(token);
  }

  // Password utilities
  hashPassword(password: string): { hash: string; salt: string } {
    const validation = validatePassword(password);
    if (!validation.valid) {
      throw createPasswordError(`Password validation failed: ${validation.errors.join(', ')}`);
    }

    const salt = generateSalt();
    const hash = hashPassword(password, salt);
    return { hash, salt };
  }

  verifyPassword(password: string, hash: string, salt: string): boolean {
    return verifyPassword(password, hash, salt);
  }

  private updateSignStats(type: TokenType, time: number): void {
    this.stats.totalSigned++;
    this.stats.byType[type]++;

    this.signTimes.push(time);
    if (this.signTimes.length > 100) {
      this.signTimes.shift();
    }

    const sum = this.signTimes.reduce((a, b) => a + b, 0);
    this.stats.averageSignTime = Math.round(sum / this.signTimes.length);
  }

  private updateVerifyTime(time: number): void {
    this.verifyTimes.push(time);
    if (this.verifyTimes.length > 100) {
      this.verifyTimes.shift();
    }

    const sum = this.verifyTimes.reduce((a, b) => a + b, 0);
    this.stats.averageVerifyTime = Math.round(sum / this.verifyTimes.length);
  }

  getStats(): JWTStats {
    return { ...this.stats };
  }

  getConfig(): Readonly<JWTConfig> {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    await this.blacklist.cleanup();
    this.refreshTokens.clear();
    this.signTimes = [];
    this.verifyTimes = [];
    this.adapter = null;
    this.initialized = false;
  }
}

export async function createJWTAuthService(config: JWTConfig): Promise<JWTAuthService> {
  const service = new JWTAuthService(config);
  await service.initialize();
  return service;
}
