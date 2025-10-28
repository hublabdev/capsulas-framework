export type OAuthProvider = 'google' | 'github' | 'facebook' | 'twitter' | 'linkedin' | 'microsoft';
export type OAuthScope = string;

export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: OAuthScope[];
  state?: string;
  debug?: boolean;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
  createdAt: number;
}

export interface OAuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  locale?: string;
  provider: OAuthProvider;
  raw?: any;
}

export interface OAuthStats {
  totalAuthorizations: number;
  successfulAuthorizations: number;
  failedAuthorizations: number;
  tokenRefreshes: number;
  errors: number;
}