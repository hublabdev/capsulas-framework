/**
 * @capsulas/capsules - Google OAuth Capsule Types
 */

/**
 * OAuth Configuration
 */
export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
  accessType?: 'online' | 'offline';
  prompt?: 'none' | 'consent' | 'select_account';
}

/**
 * OAuth Token Response
 */
export interface GoogleOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  idToken?: string;
}

/**
 * Google User Profile
 */
export interface GoogleUserProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

/**
 * OAuth State (for CSRF protection)
 */
export interface OAuthState {
  state: string;
  codeVerifier?: string;
  createdAt: number;
}

/**
 * Authorization URL Options
 */
export interface AuthorizationUrlOptions {
  state?: string;
  loginHint?: string;
  includeGrantedScopes?: boolean;
}

/**
 * Token Exchange Options
 */
export interface TokenExchangeOptions {
  code: string;
  codeVerifier?: string;
}

/**
 * OAuth Service Stats
 */
export interface GoogleOAuthStats {
  totalAuthorizations: number;
  successfulAuthorizations: number;
  failedAuthorizations: number;
  totalTokenRefreshes: number;
  activeTokens: number;
}
