import crypto from 'crypto';
import { WebhookSignature } from './types';

export function generateSignature(payload: string, signature: WebhookSignature): string {
  return crypto
    .createHmac(signature.algorithm, signature.secret)
    .update(payload)
    .digest('hex');
}

export function verifySignature(
  payload: string,
  receivedSignature: string,
  signature: WebhookSignature
): boolean {
  const expected = generateSignature(payload, signature);
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(receivedSignature)
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
