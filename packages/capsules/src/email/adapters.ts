/**
 * Email Capsule - Adapters
 */

import type { EmailConfig, EmailMessage, EmailResult } from './types';
import { EmailSendError } from './errors';
import { parseEmailAddress, formatEmailAddress, generateMessageId } from './utils';

export class SMTPAdapter {
  constructor(private config: EmailConfig) {}

  async send(message: EmailMessage): Promise<EmailResult> {
    // Simulate SMTP sending (in production, use nodemailer)
    try {
      const to = Array.isArray(message.to) ? message.to : [message.to];
      const accepted = to.map(addr =>
        typeof addr === 'string' ? addr : addr.email
      );

      return {
        messageId: generateMessageId(),
        accepted,
        rejected: [],
        response: 'Email sent successfully',
      };
    } catch (error: any) {
      throw new EmailSendError('SMTP send failed', error);
    }
  }
}

export function createAdapter(config: EmailConfig): SMTPAdapter {
  return new SMTPAdapter(config);
}
