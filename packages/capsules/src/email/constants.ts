/**
 * Email Capsule - Constants
 */

import type { EmailStats } from './types';

export const DEFAULT_SMTP_CONFIG = {
  port: 587,
  secure: false,
};

export const INITIAL_STATS: EmailStats = {
  sent: 0,
  failed: 0,
  totalBytes: 0,
  averageSize: 0,
  providers: {},
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const COMMON_PORTS = {
  SMTP: 25,
  SMTP_SECURE: 465,
  SMTP_TLS: 587,
} as const;

export const PROVIDERS = {
  SMTP: 'smtp',
  SENDGRID: 'sendgrid',
  SES: 'ses',
  MAILGUN: 'mailgun',
} as const;
