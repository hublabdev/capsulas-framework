/**
 * Queue Capsule - Service
 */

import type { QueueConfig, Job, JobProcessor, QueueStats, JobOptions } from './types';
import { createAdapter, MemoryQueueAdapter } from './adapters';
import { INITIAL_STATS, DEFAULT_CONFIG } from './constants';

export class QueueService {
  private adapter: MemoryQueueAdapter | null = null;
  private config: QueueConfig;
  private stats: QueueStats = { ...INITIAL_STATS };
  private processor: JobProcessor | null = null;
  private initialized = false;

  constructor(config: QueueConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.adapter = createAdapter(this.config);
    this.initialized = true;
  }

  async add<T = any>(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const job = await this.adapter!.addJob(name, data, opts || this.config.defaultJobOptions);
    this.stats.waiting++;
    this.stats.total++;
    return job;
  }

  process(processor: JobProcessor): void {
    this.processor = processor;
    if (this.adapter) {
      this.adapter.process(processor);
    }
  }

  async getJob(id: string): Promise<Job | null> {
    if (!this.adapter) return null;
    return await this.adapter.getJob(id);
  }

  getStats(): QueueStats {
    return { ...this.stats };
  }

  getConfig(): Readonly<QueueConfig> {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    if (this.adapter) {
      await this.adapter.close();
    }
    this.initialized = false;
  }
}

export async function createQueueService(config: QueueConfig): Promise<QueueService> {
  const service = new QueueService(config);
  await service.initialize();
  return service;
}
