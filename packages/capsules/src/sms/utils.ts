import { SMSValidationError } from './errors';

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

export function validateMessage(message: string): void {
  if (!message || message.length === 0) {
    throw new SMSValidationError('message', 'Message cannot be empty');
  }
  if (message.length > 1600) {
    throw new SMSValidationError('message', 'Message too long (max 1600 chars)');
  }
}

export function formatPhoneNumber(phone: string): string {
  return phone.startsWith('+') ? phone : `+${phone}`;
}
