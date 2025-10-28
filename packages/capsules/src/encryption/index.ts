/**
 * @capsulas/capsules - Encryption Capsule
 *
 * AES encryption, decryption, and hashing
 *
 * @category Security
 * @version 1.0.0
 */

export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { CryptoAdapter } from './adapters';
export { EncryptionService, createEncryptionService } from './service';

import { EncryptionService } from './service';
export default EncryptionService;

export const encryptionCapsule = {
  id: 'encryption',
  name: 'Encryption',
  description: 'AES encryption and hashing',
  icon: '♜',
  category: 'security',
  version: '1.0.0',
  tags: ['encryption', 'aes', 'crypto', 'security', 'hash'],
};
