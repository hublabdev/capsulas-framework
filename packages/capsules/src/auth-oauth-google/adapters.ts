/**
 * @capsulas/capsules - Google OAuth Adapters
 */

import {
  GoogleOAuthConfig,
  GoogleOAuthTokens,
  GoogleUserProfile,
  TokenExchangeOptions,
} from './types';
import {
  TokenExchangeError,
  TokenRefreshError,
  ProfileFetchError,
} from './errors';
import { GOOGLE_OAUTH_ENDPOINTS } from './constants';

export interface OAuthAdapter {
  exchangeCode(code: string, redirectUri: string): Promise<GoogleOAuthTokens>;
  refreshToken(refreshToken: string): Promise<GoogleOAuthTokens>;
  getUserProfile(accessToken: string): Promise<GoogleUserProfile>;
  revokeToken(token: string): Promise<void>;
}

export class GoogleOAuthAdapter implements OAuthAdapter {
  constructor(private config: GoogleOAuthConfig) {}

  async exchangeCode(
    code: string,
    redirectUri?: string
  ): Promise<GoogleOAuthTokens> {
    try {
      const params = new URLSearchParams({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: redirectUri || this.config.redirectUri,
        grant_type: 'authorization_code',
      });

      const response = await fetch(GOOGLE_OAUTH_ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new TokenExchangeError(
          `Token exchange failed: ${error.error_description || error.error}`,
          error
        );
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        idToken: data.id_token,
      };
    } catch (error) {
      if (error instanceof TokenExchangeError) {
        throw error;
      }
      throw new TokenExchangeError('Failed to exchange authorization code', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<GoogleOAuthTokens> {
    try {
      const params = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token',
      });

      const response = await fetch(GOOGLE_OAUTH_ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new TokenRefreshError(
          `Token refresh failed: ${error.error_description || error.error}`,
          error
        );
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        idToken: data.id_token,
      };
    } catch (error) {
      if (error instanceof TokenRefreshError) {
        throw error;
      }
      throw new TokenRefreshError('Failed to refresh access token', error);
    }
  }

  async getUserProfile(accessToken: string): Promise<GoogleUserProfile> {
    try {
      const response = await fetch(GOOGLE_OAUTH_ENDPOINTS.USERINFO, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ProfileFetchError(
          `Failed to fetch user profile: ${error.error_description || error.error}`,
          error
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ProfileFetchError) {
        throw error;
      }
      throw new ProfileFetchError('Failed to fetch user profile', error);
    }
  }

  async revokeToken(token: string): Promise<void> {
    try {
      const params = new URLSearchParams({ token });

      const response = await fetch(
        `${GOOGLE_OAUTH_ENDPOINTS.REVOKE}?${params.toString()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Token revocation failed');
      }
    } catch (error) {
      // Silently fail token revocation
      console.error('Failed to revoke token:', error);
    }
  }
}

export function createAdapter(config: GoogleOAuthConfig): OAuthAdapter {
  return new GoogleOAuthAdapter(config);
}
