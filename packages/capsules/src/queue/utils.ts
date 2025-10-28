/**
 * Queue Capsule - Utils
 */

import type { Job, BackoffOptions } from './types';

export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateBackoff(attempts: number, options: number | BackoffOptions): number {
  if (typeof options === 'number') {
    return options;
  }

  const { type, delay } = options;
  if (type === 'exponential') {
    return delay * Math.pow(2, attempts - 1);
  }
  return delay;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isJobExpired(job: Job): boolean {
  if (!job.opts.timeout) return false;
  const elapsed = Date.now() - job.timestamp;
  return elapsed > job.opts.timeout;
}
