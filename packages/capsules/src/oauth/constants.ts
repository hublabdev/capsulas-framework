import type { OAuthConfig, OAuthStats } from './types';

export const DEFAULT_CONFIG: Partial<OAuthConfig> = {
  debug: false,
};

export const INITIAL_STATS: OAuthStats = {
  totalAuthorizations: 0,
  successfulAuthorizations: 0,
  failedAuthorizations: 0,
  tokenRefreshes: 0,
  errors: 0,
};

export const OAUTH_ENDPOINTS = {
  google: {
    auth: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    userInfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
  },
  github: {
    auth: 'https://github.com/login/oauth/authorize',
    token: 'https://github.com/login/oauth/access_token',
    userInfo: 'https://api.github.com/user',
  },
  facebook: {
    auth: 'https://www.facebook.com/v12.0/dialog/oauth',
    token: 'https://graph.facebook.com/v12.0/oauth/access_token',
    userInfo: 'https://graph.facebook.com/me',
  },
};
