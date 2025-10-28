/**
 * Encryption Capsule - Service
 */

import type { EncryptionConfig, EncryptionResult, DecryptionResult, HashAlgorithm, HashResult, EncryptionStats } from './types';
import { CryptoAdapter } from './adapters';
import { INITIAL_STATS } from './constants';

export class EncryptionService {
  private adapter: CryptoAdapter;
  private stats: EncryptionStats = { ...INITIAL_STATS };
  private initialized = false;

  constructor(private config: EncryptionConfig) {
    this.adapter = new CryptoAdapter(config);
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  encrypt(text: string): EncryptionResult {
    const result = this.adapter.encrypt(text);
    this.stats.totalEncryptions++;
    this.stats.bytesProcessed += text.length;
    return result;
  }

  decrypt(encrypted: string, iv: string, tag?: string): DecryptionResult {
    const result = this.adapter.decrypt(encrypted, iv, tag);
    this.stats.totalDecryptions++;
    this.stats.bytesProcessed += encrypted.length;
    return result;
  }

  hash(text: string, algorithm: HashAlgorithm = 'sha256'): HashResult {
    const result = this.adapter.hash(text, algorithm);
    this.stats.totalHashes++;
    return result;
  }

  getStats(): EncryptionStats {
    return { ...this.stats };
  }

  getConfig(): Readonly<EncryptionConfig> {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    this.initialized = false;
  }
}

export async function createEncryptionService(config: EncryptionConfig): Promise<EncryptionService> {
  const service = new EncryptionService(config);
  await service.initialize();
  return service;
}
