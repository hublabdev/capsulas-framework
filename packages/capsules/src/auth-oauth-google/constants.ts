/**
 * @capsulas/capsules - Google OAuth Constants
 */

export const GOOGLE_OAUTH_ENDPOINTS = {
  AUTHORIZATION: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN: 'https://oauth2.googleapis.com/token',
  REVOKE: 'https://oauth2.googleapis.com/revoke',
  USERINFO: 'https://www.googleapis.com/oauth2/v2/userinfo',
};

export const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export const DEFAULT_CONFIG = {
  scopes: DEFAULT_SCOPES,
  accessType: 'online' as const,
  prompt: 'consent' as const,
};

export const TOKEN_EXPIRY_BUFFER = 300; // 5 minutes in seconds

export const STATE_EXPIRY = 600000; // 10 minutes in milliseconds
