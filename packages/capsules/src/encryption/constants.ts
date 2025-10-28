/**
 * Encryption Capsule - Constants
 */

export const DEFAULT_ALGORITHM = 'aes-256-gcm';
export const DEFAULT_KEY_LENGTH = 32;
export const IV_LENGTH = 16;

export const INITIAL_STATS = {
  totalEncryptions: 0,
  totalDecryptions: 0,
  totalHashes: 0,
  bytesProcessed: 0,
};
