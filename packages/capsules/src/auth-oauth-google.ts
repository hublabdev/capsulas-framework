/**
 * @capsulas/capsules - OAuth Google Capsule
 *
 * Complete Google OAuth 2.0 authentication with PKCE
 * Supports both web and mobile flows
 *
 * @category Authentication
 * @version 1.0.0
 */

import { defineCapsule, PORT_TYPES } from '@capsulas/core';
import crypto from 'crypto';

/**
 * Configuration for Google OAuth
 */
export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
  usePKCE?: boolean;
  prompt?: 'none' | 'consent' | 'select_account';
}

/**
 * User profile from Google
 */
export interface GoogleUserProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * OAuth tokens response
 */
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
}

/**
 * PKCE challenge data
 */
interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
}

/**
 * Generate PKCE challenge
 */
function generatePKCE(): PKCEChallenge {
  const codeVerifier = crypto
    .randomBytes(32)
    .toString('base64url');

  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

/**
 * Google OAuth Service
 */
class GoogleOAuthService {
  private config: GoogleOAuthConfig;
  private pkceData?: PKCEChallenge;

  constructor(config: GoogleOAuthConfig) {
    this.config = {
      ...config,
      scopes: config.scopes || [
        'openid',
        'email',
        'profile'
      ],
      usePKCE: config.usePKCE ?? true
    };

    // Validate required config
    if (!this.config.clientId) {
      throw new Error('Google OAuth: clientId is required');
    }
    if (!this.config.clientSecret) {
      throw new Error('Google OAuth: clientSecret is required');
    }
    if (!this.config.redirectUri) {
      throw new Error('Google OAuth: redirectUri is required');
    }
  }

  /**
   * Generate authorization URL
   * User should be redirected to this URL to authenticate
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes!.join(' '),
      access_type: 'offline',
      state: state || crypto.randomBytes(16).toString('hex')
    });

    if (this.config.prompt) {
      params.append('prompt', this.config.prompt);
    }

    // Add PKCE if enabled
    if (this.config.usePKCE) {
      this.pkceData = generatePKCE();
      params.append('code_challenge', this.pkceData.codeChallenge);
      params.append('code_challenge_method', 'S256');
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code,
      redirect_uri: this.config.redirectUri,
      grant_type: 'authorization_code'
    });

    // Add PKCE verifier if used
    if (this.config.usePKCE && this.pkceData) {
      params.append('code_verifier', this.pkceData.codeVerifier);
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to exchange code: ${error.error_description || error.error}`);
    }

    return await response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to refresh token: ${error.error_description || error.error}`);
    }

    return await response.json();
  }

  /**
   * Get user profile using access token
   */
  async getUserProfile(accessToken: string): Promise<GoogleUserProfile> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Verify ID token (if present)
   */
  async verifyIdToken(idToken: string): Promise<any> {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

    if (!response.ok) {
      throw new Error(`Failed to verify ID token: ${response.statusText}`);
    }

    const tokenInfo = await response.json();

    // Verify audience matches client ID
    if (tokenInfo.aud !== this.config.clientId) {
      throw new Error('ID token audience mismatch');
    }

    return tokenInfo;
  }

  /**
   * Revoke token
   */
  async revokeToken(token: string): Promise<void> {
    const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to revoke token: ${response.statusText}`);
    }
  }
}

/**
 * Create Google OAuth service instance
 */
export function createGoogleOAuthService(config: GoogleOAuthConfig): GoogleOAuthService {
  return new GoogleOAuthService(config);
}

/**
 * Google OAuth Capsule Definition
 */
export const authOAuthGoogle = defineCapsule({
  id: 'auth-oauth-google',
  name: 'Google OAuth',
  description: 'Google OAuth 2.0 authentication with PKCE support',
  icon: '🔐',
  category: 'auth',
  version: '1.0.0',

  inputs: [
    {
      id: 'code',
      name: 'Authorization Code',
      type: PORT_TYPES.STRING,
      required: false,
      description: 'OAuth authorization code from callback'
    },
    {
      id: 'refreshToken',
      name: 'Refresh Token',
      type: PORT_TYPES.STRING,
      required: false,
      description: 'Refresh token to get new access token'
    },
    {
      id: 'action',
      name: 'Action',
      type: PORT_TYPES.STRING,
      required: true,
      description: 'Action to perform: authorize, exchange, refresh, profile, revoke'
    }
  ],

  outputs: [
    {
      id: 'authUrl',
      name: 'Authorization URL',
      type: PORT_TYPES.STRING,
      description: 'URL to redirect user for authentication'
    },
    {
      id: 'tokens',
      name: 'OAuth Tokens',
      type: PORT_TYPES.OBJECT,
      description: 'Access token, refresh token, and metadata'
    },
    {
      id: 'user',
      name: 'User Profile',
      type: PORT_TYPES.USER,
      description: 'Google user profile data'
    },
    {
      id: 'error',
      name: 'Error',
      type: PORT_TYPES.STRING,
      description: 'Error message if operation failed'
    }
  ],

  /**
   * Execute the OAuth flow
   */
  async execute(inputs, config) {
    try {
      const service = createGoogleOAuthService({
        clientId: config.clientId || process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: config.clientSecret || process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: config.redirectUri || process.env.GOOGLE_REDIRECT_URI || '',
        scopes: config.scopes,
        usePKCE: config.usePKCE ?? true,
        prompt: config.prompt
      });

      const action = inputs.action;

      switch (action) {
        case 'authorize': {
          // Generate authorization URL
          const authUrl = service.getAuthorizationUrl(config.state);
          return {
            authUrl,
            tokens: null,
            user: null,
            error: null
          };
        }

        case 'exchange': {
          // Exchange code for tokens
          if (!inputs.code) {
            throw new Error('Authorization code is required for exchange action');
          }

          const tokens = await service.exchangeCodeForTokens(inputs.code);

          // Also get user profile
          const user = await service.getUserProfile(tokens.access_token);

          return {
            authUrl: null,
            tokens,
            user,
            error: null
          };
        }

        case 'refresh': {
          // Refresh access token
          if (!inputs.refreshToken) {
            throw new Error('Refresh token is required for refresh action');
          }

          const tokens = await service.refreshAccessToken(inputs.refreshToken);

          return {
            authUrl: null,
            tokens,
            user: null,
            error: null
          };
        }

        case 'profile': {
          // Get user profile (requires access token in config or previous tokens)
          const accessToken = config.accessToken || inputs.tokens?.access_token;
          if (!accessToken) {
            throw new Error('Access token is required for profile action');
          }

          const user = await service.getUserProfile(accessToken);

          return {
            authUrl: null,
            tokens: null,
            user,
            error: null
          };
        }

        case 'revoke': {
          // Revoke token
          const token = config.token || inputs.tokens?.access_token;
          if (!token) {
            throw new Error('Token is required for revoke action');
          }

          await service.revokeToken(token);

          return {
            authUrl: null,
            tokens: null,
            user: null,
            error: null
          };
        }

        default:
          throw new Error(`Unknown action: ${action}. Valid actions: authorize, exchange, refresh, profile, revoke`);
      }

    } catch (error) {
      return {
        authUrl: null,
        tokens: null,
        user: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Configuration schema
   */
  configSchema: {
    clientId: {
      type: 'string',
      required: false,
      description: 'Google OAuth Client ID (or use GOOGLE_CLIENT_ID env var)',
      placeholder: 'your-client-id.apps.googleusercontent.com'
    },
    clientSecret: {
      type: 'string',
      required: false,
      secret: true,
      description: 'Google OAuth Client Secret (or use GOOGLE_CLIENT_SECRET env var)'
    },
    redirectUri: {
      type: 'string',
      required: false,
      description: 'OAuth redirect URI (or use GOOGLE_REDIRECT_URI env var)',
      placeholder: 'https://yourapp.com/auth/google/callback'
    },
    scopes: {
      type: 'array',
      required: false,
      description: 'OAuth scopes to request',
      default: ['openid', 'email', 'profile']
    },
    usePKCE: {
      type: 'boolean',
      required: false,
      description: 'Use PKCE for enhanced security',
      default: true
    },
    prompt: {
      type: 'string',
      required: false,
      description: 'OAuth prompt parameter',
      enum: ['none', 'consent', 'select_account']
    },
    state: {
      type: 'string',
      required: false,
      description: 'Custom state parameter for CSRF protection'
    }
  },

  /**
   * Usage examples
   */
  examples: [
    {
      name: 'Complete OAuth Flow',
      description: 'Full authentication flow with token exchange',
      steps: [
        {
          action: 'authorize',
          description: 'Get authorization URL and redirect user',
          code: `
const result1 = await authOAuthGoogle.execute(
  { action: 'authorize' },
  {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'https://yourapp.com/callback'
  }
);

// Redirect user to: result1.authUrl
          `
        },
        {
          action: 'exchange',
          description: 'Exchange code for tokens after callback',
          code: `
const result2 = await authOAuthGoogle.execute(
  {
    action: 'exchange',
    code: 'authorization-code-from-callback'
  },
  {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'https://yourapp.com/callback'
  }
);

console.log('Access Token:', result2.tokens.access_token);
console.log('User:', result2.user);
          `
        }
      ]
    },
    {
      name: 'Refresh Token',
      description: 'Refresh an expired access token',
      code: `
const result = await authOAuthGoogle.execute(
  {
    action: 'refresh',
    refreshToken: 'stored-refresh-token'
  },
  {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  }
);

console.log('New Access Token:', result.tokens.access_token);
      `
    }
  ],

  /**
   * Environment variables required
   */
  environmentVariables: [
    {
      name: 'GOOGLE_CLIENT_ID',
      description: 'Google OAuth 2.0 Client ID from Google Cloud Console',
      required: true
    },
    {
      name: 'GOOGLE_CLIENT_SECRET',
      description: 'Google OAuth 2.0 Client Secret',
      required: true,
      secret: true
    },
    {
      name: 'GOOGLE_REDIRECT_URI',
      description: 'Authorized redirect URI configured in Google Cloud Console',
      required: true,
      example: 'https://yourapp.com/auth/google/callback'
    }
  ],

  /**
   * Setup instructions
   */
  setupInstructions: `
# Google OAuth Setup

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Choose application type (Web application)
6. Add authorized redirect URIs
7. Copy Client ID and Client Secret
8. Add to your .env file:

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://yourapp.com/auth/google/callback

## Common Scopes

- openid - Basic OpenID
- email - User's email
- profile - User's basic profile
- https://www.googleapis.com/auth/userinfo.profile - Extended profile
- https://www.googleapis.com/auth/calendar - Google Calendar
- https://www.googleapis.com/auth/drive - Google Drive

## Security Notes

- Always use PKCE for web and mobile apps
- Store refresh tokens securely (encrypted database)
- Validate state parameter to prevent CSRF
- Use HTTPS for redirect URIs
- Implement token rotation
  `,

  /**
   * Troubleshooting
   */
  troubleshooting: {
    'redirect_uri_mismatch': {
      problem: 'Error: redirect_uri_mismatch',
      solution: 'Ensure the redirect URI in your code exactly matches one configured in Google Cloud Console (including protocol, domain, path, and trailing slash)'
    },
    'invalid_client': {
      problem: 'Error: invalid_client',
      solution: 'Check that Client ID and Client Secret are correct and the API is enabled'
    },
    'access_denied': {
      problem: 'User denied access',
      solution: 'Handle this gracefully in your app - show appropriate message to user'
    },
    'invalid_grant': {
      problem: 'Error: invalid_grant when refreshing',
      solution: 'Refresh token expired or revoked. User needs to re-authenticate'
    }
  }
});

export default authOAuthGoogle;
