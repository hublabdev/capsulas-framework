/**
 * Email Capsule - Types
 */

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'ses' | 'mailgun';
  smtp?: SMTPConfig;
  sendgrid?: { apiKey: string };
  ses?: AWSConfig;
  mailgun?: MailgunConfig;
  from?: EmailAddress;
  replyTo?: EmailAddress;
  templates?: TemplateConfig;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

export interface AWSConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface MailgunConfig {
  apiKey: string;
  domain: string;
}

export interface TemplateConfig {
  engine: 'handlebars' | 'ejs' | 'pug';
  directory: string;
}

export interface EmailAddress {
  name?: string;
  email: string;
}

export interface EmailMessage {
  to: EmailAddress | EmailAddress[] | string | string[];
  from?: EmailAddress | string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
  cc?: EmailAddress | EmailAddress[] | string | string[];
  bcc?: EmailAddress | EmailAddress[] | string | string[];
  replyTo?: EmailAddress | string;
  headers?: Record<string, string>;
  template?: {
    name: string;
    data: Record<string, any>;
  };
}

export interface Attachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
  encoding?: string;
}

export interface EmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  response?: string;
}

export interface EmailStats {
  sent: number;
  failed: number;
  totalBytes: number;
  averageSize: number;
  providers: Record<string, number>;
}
