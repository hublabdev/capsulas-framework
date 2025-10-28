/**
 * Email Capsule - Service
 */

import type { EmailConfig, EmailMessage, EmailResult, EmailStats } from './types';
import { createAdapter, SMTPAdapter } from './adapters';
import { INITIAL_STATS } from './constants';
import { calculateEmailSize } from './utils';

export class EmailService {
  private adapter: SMTPAdapter | null = null;
  private config: EmailConfig;
  private stats: EmailStats = { ...INITIAL_STATS };
  private initialized = false;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.adapter = createAdapter(this.config);
    this.initialized = true;
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    try {
      const result = await this.adapter!.send(message);

      this.stats.sent++;
      this.stats.totalBytes += calculateEmailSize(message);
      this.stats.averageSize = this.stats.totalBytes / this.stats.sent;

      if (!this.stats.providers[this.config.provider]) {
        this.stats.providers[this.config.provider] = 0;
      }
      this.stats.providers[this.config.provider]++;

      return result;
    } catch (error) {
      this.stats.failed++;
      throw error;
    }
  }

  getStats(): EmailStats {
    return { ...this.stats };
  }

  getConfig(): Readonly<EmailConfig> {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    this.adapter = null;
    this.initialized = false;
  }
}

export async function createEmailService(config: EmailConfig): Promise<EmailService> {
  const service = new EmailService(config);
  await service.initialize();
  return service;
}
