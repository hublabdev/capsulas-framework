import type { OAuthProvider } from './types';

export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function buildAuthUrl(
  provider: OAuthProvider,
  clientId: string,
  redirectUri: string,
  state: string,
  scopes: string[]
): string {
  const endpoints: Record<OAuthProvider, string> = {
    google: 'https://accounts.google.com/o/oauth2/v2/auth',
    github: 'https://github.com/login/oauth/authorize',
    facebook: 'https://www.facebook.com/v12.0/dialog/oauth',
    twitter: 'https://twitter.com/i/oauth2/authorize',
    linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
    microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  };

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    scope: scopes.join(' '),
  });

  return `${endpoints[provider]}?${params.toString()}`;
}

export function parseTokenResponse(data: any): {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
} {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 3600,
  };
}
