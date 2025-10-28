/**
 * Cron/Scheduler Capsule - Types
 * Schedule and run tasks at specific times or intervals
 */

export type CronExpression = string; // e.g., "0 0 * * *" for daily at midnight

export interface CronConfig {
  timezone?: string; // e.g., "America/New_York"
  maxJobs?: number;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: CronExpression;
  handler: () => Promise<void> | void;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
}

export interface ScheduleOptions {
  name: string;
  schedule: CronExpression;
  handler: () => Promise<void> | void;
  enabled?: boolean;
  runImmediately?: boolean;
}

export interface CronStats {
  totalJobs: number;
  activeJobs: number;
  totalRuns: number;
  lastExecution?: Date;
}
