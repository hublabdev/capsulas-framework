/**
 * Email Capsule - Utils
 */

import type { EmailAddress } from './types';
import { EMAIL_REGEX } from './constants';
import { EmailValidationError } from './errors';

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function parseEmailAddress(input: string | EmailAddress): EmailAddress {
  if (typeof input === 'string') {
    if (!validateEmail(input)) {
      throw new EmailValidationError(`Invalid email: ${input}`);
    }
    return { email: input };
  }
  return input;
}

export function formatEmailAddress(address: EmailAddress): string {
  if (address.name) {
    return `"${address.name}" <${address.email}>`;
  }
  return address.email;
}

export function calculateEmailSize(message: any): number {
  return JSON.stringify(message).length;
}

export function generateMessageId(): string {
  return `${Date.now()}.${Math.random().toString(36).substr(2, 9)}@capsulas.email`;
}
