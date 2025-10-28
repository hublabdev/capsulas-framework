/**
 * Validator Capsule - Utils
 */

import { EMAIL_REGEX, URL_REGEX, NUMERIC_REGEX, ALPHA_REGEX, ALPHANUMERIC_REGEX } from './constants';

export function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

export function isUrl(value: string): boolean {
  return URL_REGEX.test(value);
}

export function isNumeric(value: any): boolean {
  return NUMERIC_REGEX.test(String(value));
}

export function isAlpha(value: string): boolean {
  return ALPHA_REGEX.test(value);
}

export function isAlphanumeric(value: string): boolean {
  return ALPHANUMERIC_REGEX.test(value);
}

export function matchesPattern(value: string, pattern: RegExp | string): boolean {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  return regex.test(value);
}

export function isInRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}
