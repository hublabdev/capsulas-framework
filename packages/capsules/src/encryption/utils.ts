/**
 * Encryption Capsule - Utils
 */

import crypto from 'crypto';
import { IV_LENGTH } from './constants';

export function generateKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

export function generateIV(): Buffer {
  return crypto.randomBytes(IV_LENGTH);
}

export function bufferToHex(buffer: Buffer): string {
  return buffer.toString('hex');
}

export function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}
