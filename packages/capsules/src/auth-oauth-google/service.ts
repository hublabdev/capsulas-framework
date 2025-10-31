/**
 * @capsulas/capsules - Google OAuth Service
 */

import {
  GoogleOAuthConfig,
  GoogleOAuthTokens,
  GoogleUserProfile,
  GoogleOAuthStats,
  AuthorizationUrlOptions,
  OAuthState,
} from './types';
import { OAuthAdapter, GoogleOAuthAdapter } from './adapters';
import { InvalidConfigError, AuthorizationError } from './errors';
import {
  validateConfig,
  generateState,
  generatePKCE,
  buildQueryString,
} from './utils';
import { GOOGLE_OAUTH_ENDPOINTS, DEFAULT_CONFIG, STATE_EXPIRY } from './constants';

export class GoogleOAuthService {
  private adapter: OAuthAdapter;
  private stateStore: Map<string, OAuthState> = new Map();
  private stats: GoogleOAuthStats = {
    totalAuthorizations: 0,
    successfulAuthorizations: 0,
    failedAuthorizations: 0,
    totalTokenRefreshes: 0,
    activeTokens: 0,
  };

  constructor(private config: GoogleOAuthConfig) {
    validateConfig(config);
    this.adapter = new GoogleOAuthAdapter(config);

    // Clean expired states every 5 minutes
    setInterval(() => this.cleanExpiredStates(), 300000);
  }

  /**
   * Generate authorization URL for user to visit
   */
  generateAuthorizationUrl(options: AuthorizationUrlOptions = {}): {
    url: string;
    state: string;
    codeVerifier?: string;
  } {
    const state = options.state || generateState();
    const scopes = this.config.scopes || DEFAULT_CONFIG.scopes;

    const params: Record<string, any> = {
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: scopes,
      state,
      access_type: this.config.accessType || DEFAULT_CONFIG.accessType,
      prompt: this.config.prompt || DEFAULT_CONFIG.prompt,
    };

    if (options.loginHint) {
      params.login_hint = options.loginHint;
    }

    if (options.includeGrantedScopes) {
      params.include_granted_scopes = 'true';
    }

    // Store state for validation
    this.stateStore.set(state, {
      state,
      createdAt: Date.now(),
    });

    const queryString = buildQueryString(params);
    const url = `${GOOGLE_OAUTH_ENDPOINTS.AUTHORIZATION}?${queryString}`;

    this.stats.totalAuthorizations++;

    return { url, state };
  }

  /**
   * Validate state parameter (CSRF protection)
   */
  validateState(state: string): boolean {
    const storedState = this.stateStore.get(state);

    if (!storedState) {
      return false;
    }

    // Check if state is expired
    const isExpired = Date.now() - storedState.createdAt > STATE_EXPIRY;
    if (isExpired) {
      this.stateStore.delete(state);
      return false;
    }

    // Clean up used state
    this.stateStore.delete(state);
    return true;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(code: string, state?: string): Promise<GoogleOAuthTokens> {
    try {
      // Validate state if provided
      if (state && !this.validateState(state)) {
        throw new AuthorizationError('Invalid or expired state parameter');
      }

      const tokens = await this.adapter.exchangeCode(code);
      this.stats.successfulAuthorizations++;
      this.stats.activeTokens++;

      return tokens;
    } catch (error) {
      this.stats.failedAuthorizations++;
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<GoogleOAuthTokens> {
    this.stats.totalTokenRefreshes++;
    return await this.adapter.refreshToken(refreshToken);
  }

  /**
   * Get user profile using access token
   */
  async getUserProfile(accessToken: string): Promise<GoogleUserProfile> {
    return await this.adapter.getUserProfile(accessToken);
  }

  /**
   * Complete OAuth flow: exchange code and get profile
   */
  async completeAuthorization(
    code: string,
    state?: string
  ): Promise<{ tokens: GoogleOAuthTokens; profile: GoogleUserProfile }> {
    const tokens = await this.exchangeCode(code, state);
    const profile = await this.getUserProfile(tokens.accessToken);

    return { tokens, profile };
  }

  /**
   * Revoke access token
   */
  async revokeToken(token: string): Promise<void> {
    await this.adapter.revokeToken(token);
    this.stats.activeTokens = Math.max(0, this.stats.activeTokens - 1);
  }

  /**
   * Get service statistics
   */
  getStats(): GoogleOAuthStats {
    return { ...this.stats };
  }

  /**
   * Clean expired states from memory
   */
  private cleanExpiredStates(): void {
    const now = Date.now();
    for (const [state, data] of this.stateStore.entries()) {
      if (now - data.createdAt > STATE_EXPIRY) {
        this.stateStore.delete(state);
      }
    }
  }
}

/**
 * Factory function to create OAuth service
 */
export function createGoogleOAuthService(
  config: GoogleOAuthConfig
): GoogleOAuthService {
  return new GoogleOAuthService(config);
}
