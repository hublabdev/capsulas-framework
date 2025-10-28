/**
 * Notifications Capsule - Constants
 */

import type { NotificationStats } from './types';

export const DEFAULT_CONFIG = {
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000,
  debug: false,
};

export const INITIAL_STATS: NotificationStats = {
  totalSent: 0,
  totalFailed: 0,
  successRate: 100,
  byProvider: {
    email: 0,
    push: 0,
    sms: 0,
    slack: 0,
  },
  byPriority: {
    low: 0,
    normal: 0,
    high: 0,
    urgent: 0,
  },
  averageDeliveryTime: 0,
  errors: {},
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/; // E.164 format

export const SLACK_WEBHOOK_REGEX = /^https:\/\/hooks\.slack\.com\/services\/.+$/;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const NOTIFICATION_PROVIDERS = {
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms',
  SLACK: 'slack',
} as const;

export const MAX_RETRY_ATTEMPTS = 5;

export const DEFAULT_TIMEOUT = 30000; // 30 seconds

export const RETRY_BACKOFF_MULTIPLIER = 2;
