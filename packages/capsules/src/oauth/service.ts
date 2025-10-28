import type { OAuthConfig, OAuthStats, OAuthToken, OAuthUser } from './types';
import { createAdapter, OAuthAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import { OAuthError, OAuthErrorType } from './errors';
import { generateState } from './utils';

export class OAuthService {
  private adapter: OAuthAdapter | null = null;
  private config: OAuthConfig;
  private stats: OAuthStats = { ...INITIAL_STATS };
  private initialized = false;
  private currentState: string | null = null;

  constructor(config: OAuthConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.adapter = createAdapter(this.config);
      this.initialized = true;

      if (this.config.debug) {
        console.log('[OAuth] Initialized with provider:', this.config.provider);
      }
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  getAuthorizationUrl(): string {
    if (!this.initialized || !this.adapter) {
      throw new OAuthError(OAuthErrorType.INVALID_CONFIG, 'OAuth service not initialized');
    }

    this.currentState = this.config.state || generateState();
    const url = this.adapter.getAuthorizationUrl(this.currentState);

    // Track authorization URL generation
    this.stats.totalAuthorizations++;

    if (this.config.debug) {
      console.log('[OAuth] Generated auth URL with state:', this.currentState);
    }

    return url;
  }

  async exchangeCodeForToken(code: string, state?: string): Promise<OAuthToken> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      if (state && this.currentState && state !== this.currentState) {
        throw new OAuthError(OAuthErrorType.INVALID_STATE, 'State mismatch');
      }

      this.stats.totalAuthorizations++;
      const token = await this.adapter!.exchangeCodeForToken(code);
      this.stats.successfulAuthorizations++;

      if (this.config.debug) {
        console.log('[OAuth] Token exchange successful');
      }

      return token;
    } catch (error) {
      this.stats.errors++;
      this.stats.failedAuthorizations++;
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<OAuthToken> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      this.stats.tokenRefreshes++;
      const token = await this.adapter!.refreshToken(refreshToken);

      if (this.config.debug) {
        console.log('[OAuth] Token refresh successful');
      }

      return token;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  async getUserInfo(accessToken: string): Promise<OAuthUser> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const user = await this.adapter!.getUserInfo(accessToken);

      if (this.config.debug) {
        console.log('[OAuth] User info retrieved:', user.email);
      }

      return user;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  getStats(): OAuthStats {
    return { ...this.stats };
  }

  getConfig(): OAuthConfig {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    if (this.config.debug) {
      console.log('[OAuth] Cleaning up service');
    }
    this.adapter = null;
    this.initialized = false;
    this.currentState = null;
  }
}

export async function createOAuthService(config: OAuthConfig): Promise<OAuthService> {
  const service = new OAuthService(config);
  await service.initialize();
  return service;
}
