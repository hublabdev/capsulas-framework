/**
 * Queue Capsule - Types
 */

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
export type JobPriority = 'low' | 'normal' | 'high' | 'critical';

export interface QueueConfig {
  name: string;
  redis?: RedisConfig;
  defaultJobOptions?: JobOptions;
  limiter?: RateLimiter;
  settings?: QueueSettings;
}

export interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
}

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: number | BackoffOptions;
  timeout?: number;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

export interface BackoffOptions {
  type: 'fixed' | 'exponential';
  delay: number;
}

export interface RateLimiter {
  max: number;
  duration: number;
}

export interface QueueSettings {
  lockDuration?: number;
  stalledInterval?: number;
  maxStalledCount?: number;
}

export interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  opts: JobOptions;
  status: JobStatus;
  progress: number;
  returnvalue?: any;
  failedReason?: string;
  stacktrace?: string[];
  attemptsMade: number;
  processedOn?: number;
  finishedOn?: number;
  timestamp: number;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  total: number;
  throughput: number;
}

export interface JobProcessor<T = any> {
  (job: Job<T>): Promise<any> | any;
}
