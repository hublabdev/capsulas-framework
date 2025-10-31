/**
 * @capsulas/capsules - Google OAuth Utilities
 */

import { randomBytes, createHash } from 'crypto';
import { GoogleOAuthConfig } from './types';
import { InvalidConfigError } from './errors';

/**
 * Generate a random state string for CSRF protection
 */
export function generateState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate PKCE code verifier and challenge
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

/**
 * Validate OAuth configuration
 */
export function validateConfig(config: GoogleOAuthConfig): void {
  if (!config.clientId) {
    throw new InvalidConfigError('clientId is required');
  }
  if (!config.clientSecret) {
    throw new InvalidConfigError('clientSecret is required');
  }
  if (!config.redirectUri) {
    throw new InvalidConfigError('redirectUri is required');
  }

  // Validate redirect URI format
  try {
    new URL(config.redirectUri);
  } catch {
    throw new InvalidConfigError('redirectUri must be a valid URL');
  }
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value.join(' '))}`;
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join('&');
}

/**
 * Parse query string to object
 */
export function parseQueryString(query: string): Record<string, string> {
  const params: Record<string, string> = {};
  const urlParams = new URLSearchParams(query);

  urlParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresIn: number, buffer: number = 300): boolean {
  return expiresIn <= buffer;
}
