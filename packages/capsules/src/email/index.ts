/**
 * @capsulas/capsules - Email Capsule
 *
 * Email sending with SMTP, SendGrid, AWS SES, and Mailgun
 *
 * @category Communication
 * @version 1.0.0
 */

export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { SMTPAdapter, createAdapter } from './adapters';
export { EmailService, createEmailService } from './service';

import { EmailService } from './service';
export default EmailService;

export const emailCapsule = {
  id: 'email',
  name: 'Email',
  description: 'Email sending with multiple provider support',
  icon: '⌘',
  category: 'communication',
  version: '1.0.0',
  tags: ['email', 'smtp', 'sendgrid', 'ses', 'mailgun', 'communication'],
};
