/**
 * Notifications Capsule - Utils
 */

import { EMAIL_REGEX, PHONE_REGEX, SLACK_WEBHOOK_REGEX } from './constants';
import { NotificationValidationError } from './errors';

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

export function validateSlackWebhook(webhook: string): boolean {
  return SLACK_WEBHOOK_REGEX.test(webhook);
}

export function formatMessage(message: string, maxLength: number = 500): string {
  return message.trim().slice(0, maxLength);
}

export function formatEmailAddress(email: string, name?: string): string {
  if (name) {
    return `"${name}" <${email}>`;
  }
  return email;
}

export function parseEmailAddresses(input: string | string[]): string[] {
  const emails = Array.isArray(input) ? input : [input];
  return emails.filter(email => validateEmail(email));
}

export function parsePhoneNumbers(input: string | string[]): string[] {
  const phones = Array.isArray(input) ? input : [input];
  return phones.map(phone => {
    // Normalize phone number
    const normalized = phone.replace(/[\s\-\(\)]/g, '');
    if (!normalized.startsWith('+')) {
      return `+${normalized}`;
    }
    return normalized;
  }).filter(phone => validatePhoneNumber(phone));
}

export function generateNotificationId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateSuccessRate(sent: number, failed: number): number {
  const total = sent + failed;
  if (total === 0) return 100;
  return Math.round((sent / total) * 100 * 100) / 100; // Round to 2 decimals
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function calculateBackoff(attempt: number, baseDelay: number, multiplier: number = 2): number {
  return baseDelay * Math.pow(multiplier, attempt - 1);
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization (in production, use a library like DOMPurify)
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

export function extractPlainText(html: string): string {
  // Simple HTML to plain text conversion
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function validateRecipient(provider: 'email' | 'sms' | 'slack', recipient: string): boolean {
  switch (provider) {
    case 'email':
      return validateEmail(recipient);
    case 'sms':
      return validatePhoneNumber(recipient);
    case 'slack':
      // Slack channels start with # or are webhook URLs
      return recipient.startsWith('#') || validateSlackWebhook(recipient);
    default:
      return false;
  }
}
