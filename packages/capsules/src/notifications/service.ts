/**
 * Notifications Capsule - Service
 */

import type {
  NotificationConfig,
  Notification,
  EmailNotification,
  PushNotification,
  SMSNotification,
  SlackNotification,
  NotificationResult,
  NotificationStats,
} from './types';
import { createAdapter, NotificationAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import {
  generateNotificationId,
  calculateSuccessRate,
  calculateBackoff,
  sleep,
} from './utils';
import { NotificationConfigError, NotificationSendError } from './errors';

export class NotificationService {
  private adapter: NotificationAdapter | null = null;
  private config: NotificationConfig;
  private stats: NotificationStats = { ...INITIAL_STATS };
  private initialized = false;
  private deliveryTimes: number[] = [];

  constructor(config: NotificationConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (!this.config.provider) {
      throw new NotificationConfigError('Provider is required in config');
    }

    this.adapter = createAdapter(this.config);
    this.initialized = true;
  }

  async send(notification: Notification): Promise<NotificationResult> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const startTime = Date.now();
    const retryAttempts = this.config.retryAttempts || 3;
    let lastError: Error | undefined;

    // Add notification metadata
    notification.id = notification.id || generateNotificationId();
    notification.createdAt = notification.createdAt || Date.now();
    notification.priority = notification.priority || 'normal';
    notification.status = 'pending';

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const result = await this.adapter!.send(notification);
        const deliveryTime = Date.now() - startTime;

        // Update notification status
        notification.status = result.success ? 'sent' : 'failed';
        notification.sentAt = Date.now();

        this.updateStats(result, deliveryTime, notification);
        return result;
      } catch (error) {
        lastError = error as Error;
        notification.error = lastError.message;

        if (attempt < retryAttempts) {
          const backoff = calculateBackoff(
            attempt,
            this.config.retryDelay || 1000
          );
          await sleep(backoff);
        }
      }
    }

    // All retries failed
    notification.status = 'failed';
    this.stats.totalFailed++;
    this.updateErrorStats(lastError?.message || 'Unknown error');

    const deliveryTime = Date.now() - startTime;
    this.updateDeliveryTime(deliveryTime);

    return {
      success: false,
      notificationId: notification.id,
      provider: this.config.provider,
      sentCount: 0,
      failedCount: 1,
      timestamp: Date.now(),
      error: lastError?.message,
    };
  }

  async sendEmail(notification: Omit<EmailNotification, 'provider'>): Promise<NotificationResult> {
    if (this.config.provider !== 'email') {
      throw new NotificationConfigError(
        `Service configured for ${this.config.provider}, not email`
      );
    }

    return this.send({ ...notification, provider: 'email' } as EmailNotification);
  }

  async sendPush(notification: Omit<PushNotification, 'provider'>): Promise<NotificationResult> {
    if (this.config.provider !== 'push') {
      throw new NotificationConfigError(
        `Service configured for ${this.config.provider}, not push`
      );
    }

    return this.send({ ...notification, provider: 'push' } as PushNotification);
  }

  async sendSMS(notification: Omit<SMSNotification, 'provider'>): Promise<NotificationResult> {
    if (this.config.provider !== 'sms') {
      throw new NotificationConfigError(
        `Service configured for ${this.config.provider}, not sms`
      );
    }

    return this.send({ ...notification, provider: 'sms' } as SMSNotification);
  }

  async sendSlack(notification: Omit<SlackNotification, 'provider'>): Promise<NotificationResult> {
    if (this.config.provider !== 'slack') {
      throw new NotificationConfigError(
        `Service configured for ${this.config.provider}, not slack`
      );
    }

    return this.send({ ...notification, provider: 'slack' } as SlackNotification);
  }

  private updateStats(
    result: NotificationResult,
    deliveryTime: number,
    notification: Notification
  ): void {
    if (result.success) {
      this.stats.totalSent += result.sentCount;
    } else {
      this.stats.totalFailed += result.failedCount;
      this.updateErrorStats(result.error || 'Unknown error');
    }

    // Update provider stats
    if (!this.stats.byProvider[this.config.provider]) {
      this.stats.byProvider[this.config.provider] = 0;
    }
    this.stats.byProvider[this.config.provider] += result.sentCount;

    // Update priority stats
    const priority = notification.priority || 'normal';
    if (!this.stats.byPriority[priority]) {
      this.stats.byPriority[priority] = 0;
    }
    this.stats.byPriority[priority]++;

    // Update delivery time
    this.updateDeliveryTime(deliveryTime);

    // Update success rate
    this.stats.successRate = calculateSuccessRate(
      this.stats.totalSent,
      this.stats.totalFailed
    );

    // Update last sent timestamp
    this.stats.lastSentAt = Date.now();
  }

  private updateDeliveryTime(time: number): void {
    this.deliveryTimes.push(time);

    // Keep only last 100 delivery times for rolling average
    if (this.deliveryTimes.length > 100) {
      this.deliveryTimes.shift();
    }

    const sum = this.deliveryTimes.reduce((a, b) => a + b, 0);
    this.stats.averageDeliveryTime = Math.round(sum / this.deliveryTimes.length);
  }

  private updateErrorStats(error: string): void {
    if (!this.stats.errors[error]) {
      this.stats.errors[error] = 0;
    }
    this.stats.errors[error]++;
  }

  getStats(): NotificationStats {
    return { ...this.stats };
  }

  getConfig(): Readonly<NotificationConfig> {
    return { ...this.config };
  }

  resetStats(): void {
    this.stats = { ...INITIAL_STATS };
    this.deliveryTimes = [];
  }

  async cleanup(): Promise<void> {
    this.adapter = null;
    this.initialized = false;
    this.deliveryTimes = [];
  }
}

export async function createNotificationService(
  config: NotificationConfig
): Promise<NotificationService> {
  const service = new NotificationService(config);
  await service.initialize();
  return service;
}
