/**
 * Queue Capsule - Constants
 */

import type { QueueConfig, QueueStats, JobOptions } from './types';

export const DEFAULT_CONFIG: Partial<QueueConfig> = {
  redis: {
    host: 'localhost',
    port: 6379,
    db: 0,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
  settings: {
    lockDuration: 30000,
    stalledInterval: 30000,
    maxStalledCount: 1,
  },
};

export const INITIAL_STATS: QueueStats = {
  waiting: 0,
  active: 0,
  completed: 0,
  failed: 0,
  delayed: 0,
  paused: 0,
  total: 0,
  throughput: 0,
};

export const JOB_PRIORITIES = {
  CRITICAL: 1,
  HIGH: 5,
  NORMAL: 10,
  LOW: 15,
} as const;

export const JOB_EVENTS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PROGRESS: 'progress',
  STALLED: 'stalled',
  REMOVED: 'removed',
} as const;
