/**
 * @capsulas/capsules - JWT Auth Capsule
 *
 * JWT authentication with signing, verification, and token management
 *
 * @category Security
 * @version 1.0.0
 */

export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { JWTAdapter, createAdapter } from './adapters';
export { JWTAuthService, createJWTAuthService } from './service';

import { JWTAuthService } from './service';
export default JWTAuthService;

export const jwtAuthCapsule = {
  id: 'jwt-auth',
  name: 'JWT Auth',
  description: 'JWT authentication with token management',
  icon: '♔',
  category: 'security',
  version: '1.0.0',
  tags: ['jwt', 'auth', 'authentication', 'tokens', 'security'],
};
