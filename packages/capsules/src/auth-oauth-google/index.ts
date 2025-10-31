/**
 * @capsulas/capsules - Google OAuth Capsule
 *
 * Google OAuth 2.0 authentication with PKCE support
 *
 * @category Authentication
 * @version 1.0.0
 */

// Export types
export type * from './types';

// Export errors
export * from './errors';

// Export constants
export * from './constants';

// Export utilities
export * from './utils';

// Export adapters
export { GoogleOAuthAdapter, createAdapter } from './adapters';

// Export service
export { GoogleOAuthService, createGoogleOAuthService } from './service';

import { GoogleOAuthService } from './service';
export default GoogleOAuthService;

/**
 * Capsule metadata for Capsulas Framework
 */
export const googleOAuthCapsule = {
  id: 'auth-oauth-google',
  name: 'Google OAuth',
  description: 'Google OAuth 2.0 authentication',
  icon: '♚',
  category: 'auth',
  version: '1.0.0',

  inputs: [
    {
      id: 'code',
      name: 'Authorization Code',
      type: 'string',
      required: true,
      description: 'OAuth authorization code from callback',
    },
    {
      id: 'state',
      name: 'State',
      type: 'string',
      required: false,
      description: 'State parameter for CSRF protection',
    },
  ],

  outputs: [
    {
      id: 'user',
      name: 'User Profile',
      type: 'user',
      description: 'Google user profile information',
    },
    {
      id: 'tokens',
      name: 'OAuth Tokens',
      type: 'object',
      description: 'Access and refresh tokens',
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if authentication failed',
    },
  ],

  configSchema: {
    clientId: {
      type: 'string',
      required: true,
      description: 'Google OAuth Client ID',
    },
    clientSecret: {
      type: 'password',
      required: true,
      description: 'Google OAuth Client Secret',
    },
    redirectUri: {
      type: 'string',
      required: true,
      description: 'OAuth redirect URI',
    },
    scopes: {
      type: 'array',
      required: false,
      default: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      description: 'OAuth scopes to request',
    },
  },

  examples: [
    {
      name: 'Basic Google OAuth',
      description: 'Complete OAuth flow with Google',
      code: `
import { createGoogleOAuthService } from '@capsulas/capsules/auth-oauth-google';

const oauth = createGoogleOAuthService({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: 'http://localhost:3000/auth/callback',
});

// Generate authorization URL
const { url, state } = oauth.generateAuthorizationUrl();
console.log('Visit:', url);

// After user authorizes, exchange code for tokens
const { tokens, profile } = await oauth.completeAuthorization(
  authCode,
  state
);

console.log('User:', profile.email);
console.log('Access Token:', tokens.accessToken);
`,
    },
    {
      name: 'Custom Scopes',
      description: 'Request additional Google API scopes',
      code: `
import { createGoogleOAuthService } from '@capsulas/capsules/auth-oauth-google';

const oauth = createGoogleOAuthService({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: 'http://localhost:3000/auth/callback',
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar.readonly',
  ],
});

const { url } = oauth.generateAuthorizationUrl({
  loginHint: 'user@example.com',
});
`,
    },
    {
      name: 'Token Refresh',
      description: 'Refresh expired access tokens',
      code: `
import { createGoogleOAuthService } from '@capsulas/capsules/auth-oauth-google';

const oauth = createGoogleOAuthService(config);

// Refresh token when access token expires
const newTokens = await oauth.refreshToken(oldRefreshToken);
console.log('New access token:', newTokens.accessToken);
`,
    },
  ],

  environmentVariables: [
    {
      name: 'GOOGLE_CLIENT_ID',
      description: 'Google OAuth Client ID',
      required: true,
    },
    {
      name: 'GOOGLE_CLIENT_SECRET',
      description: 'Google OAuth Client Secret',
      required: true,
      secret: true,
    },
  ],

  tags: ['oauth', 'google', 'authentication', 'auth', 'social-login'],

  links: {
    documentation: 'https://docs.capsulas.dev/capsules/auth-oauth-google',
    github:
      'https://github.com/capsulas-framework/capsulas/tree/main/packages/capsules/src/auth-oauth-google',
    npm: 'https://www.npmjs.com/package/@capsulas/capsules',
  },
};
