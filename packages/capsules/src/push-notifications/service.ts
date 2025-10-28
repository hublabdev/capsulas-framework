/**
 * Push Notifications Capsule - Service
 */

import {
  PushNotificationsConfig,
  PushRequest,
  PushResult,
  PushStats,
  PushProvider
} from './types';
import { PushNotificationsError } from './errors';
import { createAdapter, PushAdapter } from './adapters';
import { validateNotification, validateTarget } from './utils';
import { DEFAULT_PUSH_CONFIG, INITIAL_STATS } from './constants';

export class PushNotificationsService {
  private config: PushNotificationsConfig;
  private adapter: PushAdapter | null = null;
  private initialized: boolean = false;
  private stats: PushStats;

  constructor(config: PushNotificationsConfig) {
    this.config = { ...DEFAULT_PUSH_CONFIG, ...config };
    this.stats = { ...INITIAL_STATS };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.adapter = createAdapter(this.config);
    await this.adapter.initialize();
    this.initialized = true;
  }

  async send(request: PushRequest): Promise<PushResult> {
    if (!this.initialized || !this.adapter) {
      throw new PushNotificationsError('Service not initialized. Call initialize() first.');
    }

    validateNotification(request.notification);
    validateTarget(request.target);

    try {
      const result = await this.adapter.send(request);

      this.stats.totalSent++;
      this.stats.totalSuccess += result.successCount;
      this.stats.totalFailed += result.failureCount;
      this.stats.lastSent = new Date();

      // Update device count based on target
      if (request.target.token) {
        this.stats.totalDevices = Math.max(this.stats.totalDevices, 1);
      } else if (request.target.tokens) {
        this.stats.totalDevices = Math.max(
          this.stats.totalDevices,
          request.target.tokens.length
        );
      }

      return result;
    } catch (error) {
      this.stats.totalFailed++;
      throw error;
    }
  }

  async sendToDevice(
    token: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<PushResult> {
    return this.send({
      notification: { title, body, data },
      target: { token }
    });
  }

  async sendToDevices(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<PushResult> {
    return this.send({
      notification: { title, body, data },
      target: { tokens }
    });
  }

  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<PushResult> {
    return this.send({
      notification: { title, body, data },
      target: { topic }
    });
  }

  getStats(): PushStats {
    return { ...this.stats };
  }

  getProvider(): PushProvider {
    if (!this.adapter) {
      throw new PushNotificationsError('Service not initialized');
    }
    return this.adapter.getProvider();
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
