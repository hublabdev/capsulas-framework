/**
 * Queue Capsule - Adapters
 */

import type { QueueConfig, Job, JobProcessor } from './types';
import { QueueConnectionError } from './errors';
import { generateJobId } from './utils';

export class MemoryQueueAdapter {
  private jobs = new Map<string, Job>();
  private waiting: Job[] = [];
  private active: Job[] = [];
  private completed: Job[] = [];
  private failed: Job[] = [];

  async addJob<T>(name: string, data: T, opts: any = {}): Promise<Job<T>> {
    const job: Job<T> = {
      id: generateJobId(),
      name,
      data,
      opts,
      status: 'waiting',
      progress: 0,
      attemptsMade: 0,
      timestamp: Date.now(),
    };

    this.jobs.set(job.id, job);
    this.waiting.push(job);
    return job;
  }

  async process(processor: JobProcessor): Promise<void> {
    while (this.waiting.length > 0) {
      const job = this.waiting.shift()!;
      job.status = 'active';
      this.active.push(job);

      try {
        const result = await processor(job);
        job.returnvalue = result;
        job.status = 'completed';
        job.finishedOn = Date.now();
        this.completed.push(job);
      } catch (error: any) {
        job.status = 'failed';
        job.failedReason = error.message;
        job.attemptsMade++;
        this.failed.push(job);
      }

      const activeIndex = this.active.indexOf(job);
      if (activeIndex > -1) this.active.splice(activeIndex, 1);
    }
  }

  async getJob(id: string): Promise<Job | null> {
    return this.jobs.get(id) || null;
  }

  async close(): Promise<void> {
    this.jobs.clear();
    this.waiting = [];
    this.active = [];
    this.completed = [];
    this.failed = [];
  }
}

export function createAdapter(config: QueueConfig): MemoryQueueAdapter {
  return new MemoryQueueAdapter();
}
