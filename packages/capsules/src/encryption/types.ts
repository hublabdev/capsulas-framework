/**
 * Encryption Capsule - Types
 */

export type EncryptionAlgorithm = 'aes-256-gcm' | 'aes-256-cbc' | 'aes-128-gcm';
export type HashAlgorithm = 'sha256' | 'sha512' | 'md5';

export interface EncryptionConfig {
  algorithm?: EncryptionAlgorithm;
  key?: string;
  keyLength?: number;
}

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  tag?: string;
}

export interface DecryptionResult {
  decrypted: string;
}

export interface HashResult {
  hash: string;
  algorithm: HashAlgorithm;
}

export interface EncryptionStats {
  totalEncryptions: number;
  totalDecryptions: number;
  totalHashes: number;
  bytesProcessed: number;
}
