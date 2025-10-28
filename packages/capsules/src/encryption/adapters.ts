/**
 * Encryption Capsule - Adapters
 */

import crypto from 'crypto';
import type { EncryptionConfig, EncryptionResult, DecryptionResult, HashAlgorithm, HashResult } from './types';
import { generateIV, bufferToHex, hexToBuffer } from './utils';
import { DEFAULT_ALGORITHM } from './constants';

export class CryptoAdapter {
  constructor(private config: EncryptionConfig) {}

  encrypt(text: string): EncryptionResult {
    const algorithm = this.config.algorithm || DEFAULT_ALGORITHM;
    const key = Buffer.from(this.config.key!, 'utf8');
    const iv = generateIV();
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const result: EncryptionResult = {
      encrypted,
      iv: bufferToHex(iv),
    };

    if (algorithm.includes('gcm')) {
      result.tag = bufferToHex(cipher.getAuthTag());
    }

    return result;
  }

  decrypt(encrypted: string, iv: string, tag?: string): DecryptionResult {
    const algorithm = this.config.algorithm || DEFAULT_ALGORITHM;
    const key = Buffer.from(this.config.key!, 'utf8');
    const ivBuffer = hexToBuffer(iv);
    const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);

    if (tag && algorithm.includes('gcm')) {
      decipher.setAuthTag(hexToBuffer(tag));
    }

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return { decrypted };
  }

  hash(text: string, algorithm: HashAlgorithm = 'sha256'): HashResult {
    const hash = crypto.createHash(algorithm).update(text).digest('hex');
    return { hash, algorithm };
  }
}
