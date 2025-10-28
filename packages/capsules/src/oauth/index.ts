export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { OAuthAdapter, createAdapter } from './adapters';
export { OAuthService, createOAuthService } from './service';
import { OAuthService } from './service';
export default OAuthService;
export const oauthCapsule = {
  id: 'oauth',
  name: 'Oauth',
  description: 'OAuth 2.0 social authentication',
  icon: '♚',
  category: 'auth',
  version: '1.0.0',
  tags: ['oauth'],
};