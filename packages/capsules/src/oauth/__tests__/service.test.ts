import { describe, it, expect, beforeEach } from 'vitest';
import { OAuthService, createOAuthService } from '../service';
import { OAuthError } from '../errors';

describe('OAuthService', () => {
  let service: OAuthService;

  beforeEach(async () => {
    service = await createOAuthService({
      provider: 'google',
      clientId: 'test_client_id',
      clientSecret: 'test_secret',
      redirectUri: 'http://localhost:3000/callback',
      scopes: ['profile', 'email'],
    });
  });

  describe('Initialization', () => {
    it('should initialize correctly', () => {
      expect(service).toBeDefined();
      expect(service.getConfig().provider).toBe('google');
    });

    it('should throw error with invalid provider', async () => {
      await expect(
        createOAuthService({
          provider: 'invalid' as any,
          clientId: 'test',
          clientSecret: 'test',
          redirectUri: 'http://localhost',
        })
      ).rejects.toThrow(OAuthError);
    });
  });

  describe('Authorization URL', () => {
    it('should generate authorization URL', () => {
      const url = service.getAuthorizationUrl();
      expect(url).toContain('oauth2');
      expect(url).toContain('client_id=test_client_id');
    });

    it('should include state parameter', () => {
      const url = service.getAuthorizationUrl();
      expect(url).toContain('state=');
    });

    it('should include scopes', () => {
      const url = service.getAuthorizationUrl();
      expect(url).toContain('scope=');
    });
  });

  describe('Token Exchange', () => {
    // Skip: requires mock adapter - real API calls not suitable for unit tests
    it.skip('should exchange code for token', async () => {
      const token = await service.exchangeCodeForToken('test_code');
      expect(token).toBeDefined();
      expect(token.accessToken).toBeDefined();
      expect(token.tokenType).toBe('Bearer');
    });

    it('should handle invalid code', async () => {
      await expect(service.exchangeCodeForToken('')).rejects.toThrow(OAuthError);
    });
  });

  describe('Token Refresh', () => {
    // Skip: requires mock adapter - real API calls not suitable for unit tests
    it.skip('should refresh access token', async () => {
      const token = await service.refreshToken('refresh_token');
      expect(token).toBeDefined();
      expect(token.accessToken).toBeDefined();
    });
  });

  describe('User Info', () => {
    // Skip: requires mock adapter - real API calls not suitable for unit tests
    it.skip('should get user information', async () => {
      const user = await service.getUserInfo('access_token');
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
    });
  });

  describe('Statistics', () => {
    it('should track operations', async () => {
      service.getAuthorizationUrl();
      const stats = service.getStats();
      expect(stats.totalAuthorizations).toBeGreaterThan(0);
    });
  });
});
