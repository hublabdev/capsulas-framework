import type { OAuthConfig, OAuthToken, OAuthUser } from './types';
import { OAuthError, OAuthErrorType } from './errors';
import { parseTokenResponse } from './utils';

export abstract class OAuthAdapter {
  constructor(protected config: OAuthConfig) {}

  abstract getAuthorizationUrl(state: string): string;
  abstract exchangeCodeForToken(code: string): Promise<OAuthToken>;
  abstract refreshToken(refreshToken: string): Promise<OAuthToken>;
  abstract getUserInfo(accessToken: string): Promise<OAuthUser>;
}

export class GoogleAdapter extends OAuthAdapter {
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: (this.config.scopes || ['profile', 'email']).join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<OAuthToken> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new OAuthError(OAuthErrorType.TOKEN_EXCHANGE_FAILED, 'Failed to exchange code for token');
    }

    const data = await response.json();
    const parsed = parseTokenResponse(data);
    return {
      ...parsed,
      tokenType: 'Bearer',
      createdAt: Date.now(),
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthToken> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    const parsed = parseTokenResponse(data);
    return {
      ...parsed,
      tokenType: 'Bearer',
      createdAt: Date.now(),
    };
  }

  async getUserInfo(accessToken: string): Promise<OAuthUser> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new OAuthError(OAuthErrorType.USER_INFO_FAILED, 'Failed to get user info');
    }

    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
      locale: data.locale,
      provider: 'google',
      raw: data,
    };
  }
}

export class GitHubAdapter extends OAuthAdapter {
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: (this.config.scopes || ['user', 'repo']).join(' '),
      state,
    });
    return `https://github.com/login/oauth/authorize?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<OAuthToken> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      }),
    });

    const data = await response.json();
    const parsed = parseTokenResponse(data);
    return {
      ...parsed,
      tokenType: 'Bearer',
      createdAt: Date.now(),
    };
  }

  async refreshToken(refreshToken: string): Promise<OAuthToken> {
    throw new OAuthError(OAuthErrorType.REFRESH_FAILED, 'GitHub does not support token refresh');
  }

  async getUserInfo(accessToken: string): Promise<OAuthUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();
    return {
      id: data.id.toString(),
      email: data.email,
      name: data.name,
      picture: data.avatar_url,
      provider: 'github',
      raw: data,
    };
  }
}

export function createAdapter(config: OAuthConfig): OAuthAdapter {
  switch (config.provider) {
    case 'google':
      return new GoogleAdapter(config);
    case 'github':
      return new GitHubAdapter(config);
    default:
      throw new OAuthError(
        OAuthErrorType.INVALID_PROVIDER,
        `Unsupported OAuth provider: ${config.provider}`
      );
  }
}
