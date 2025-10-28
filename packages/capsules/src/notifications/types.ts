/**
 * Notifications Capsule - Types
 */

export type NotificationProvider = 'email' | 'push' | 'sms' | 'slack';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'delivered';

export interface NotificationConfig {
  provider: NotificationProvider;
  email?: EmailProviderConfig;
  push?: PushProviderConfig;
  sms?: SMSProviderConfig;
  slack?: SlackProviderConfig;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
  debug?: boolean;
}

export interface EmailProviderConfig {
  type: 'smtp' | 'sendgrid' | 'ses' | 'mailgun';
  apiKey?: string;
  from?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
}

export interface PushProviderConfig {
  type: 'firebase' | 'apns' | 'onesignal';
  apiKey?: string;
  projectId?: string;
  serverKey?: string;
  bundleId?: string;
}

export interface SMSProviderConfig {
  type: 'twilio' | 'vonage' | 'aws-sns';
  accountSid?: string;
  authToken?: string;
  apiKey?: string;
  apiSecret?: string;
  from?: string;
}

export interface SlackProviderConfig {
  webhookUrl?: string;
  token?: string;
  channel?: string;
}

export interface Notification {
  id?: string;
  provider: NotificationProvider;
  to: string | string[];
  subject?: string;
  message: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  createdAt?: number;
  sentAt?: number;
  deliveredAt?: number;
  error?: string;
}

export interface EmailNotification extends Notification {
  provider: 'email';
  subject: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  html?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface PushNotification extends Notification {
  provider: 'push';
  title: string;
  body: string;
  icon?: string;
  badge?: number;
  sound?: string;
  clickAction?: string;
  imageUrl?: string;
  tokens?: string[];
  topic?: string;
}

export interface SMSNotification extends Notification {
  provider: 'sms';
  from?: string;
  mediaUrls?: string[];
}

export interface SlackNotification extends Notification {
  provider: 'slack';
  channel?: string;
  username?: string;
  iconEmoji?: string;
  iconUrl?: string;
  attachments?: SlackAttachment[];
  blocks?: any[];
}

export interface SlackAttachment {
  fallback?: string;
  color?: string;
  pretext?: string;
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: SlackField[];
  image_url?: string;
  thumb_url?: string;
  footer?: string;
  footer_icon?: string;
  ts?: number;
}

export interface SlackField {
  title: string;
  value: string;
  short?: boolean;
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  provider: NotificationProvider;
  sentCount: number;
  failedCount: number;
  timestamp: number;
  error?: string;
  details?: any;
}

export interface NotificationStats {
  totalSent: number;
  totalFailed: number;
  successRate: number;
  byProvider: Record<NotificationProvider, number>;
  byPriority: Record<NotificationPriority, number>;
  averageDeliveryTime: number;
  lastSentAt?: number;
  errors: Record<string, number>;
}
