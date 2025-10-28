import { CronConfig, CronJob, ScheduleOptions, CronStats } from './types';
import { CronError, JobNotFoundError } from './errors';
import { validateCronExpression, generateJobId, calculateNextRun } from './utils';
import { DEFAULT_CRON_CONFIG, INITIAL_STATS } from './constants';

export class CronService {
  private config: CronConfig;
  private jobs: Map<string, CronJob> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private stats: CronStats = { ...INITIAL_STATS };
  private initialized = false;

  constructor(config: CronConfig = {}) {
    this.config = { ...DEFAULT_CRON_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  schedule(options: ScheduleOptions): string {
    if (!this.initialized) {
      throw new CronError('Service not initialized');
    }

    validateCronExpression(options.schedule);

    if (this.jobs.size >= (this.config.maxJobs || 100)) {
      throw new CronError('Maximum number of jobs reached');
    }

    const jobId = generateJobId();
    const job: CronJob = {
      id: jobId,
      name: options.name,
      schedule: options.schedule,
      handler: options.handler,
      enabled: options.enabled !== false,
      nextRun: calculateNextRun(options.schedule),
      runCount: 0
    };

    this.jobs.set(jobId, job);
    this.stats.totalJobs++;

    if (job.enabled) {
      this.startJob(jobId);
      this.stats.activeJobs++;
    }

    if (options.runImmediately) {
      this.runJob(jobId);
    }

    return jobId;
  }

  private startJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Simplified interval execution
    // In production, use proper cron scheduling library
    const timer = setInterval(async () => {
      await this.runJob(jobId);
    }, 60000); // Run every minute for demo

    this.timers.set(jobId, timer);
  }

  private async runJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || !job.enabled) return;

    try {
      await job.handler();

      job.lastRun = new Date();
      job.nextRun = calculateNextRun(job.schedule);
      job.runCount++;

      this.stats.totalRuns++;
      this.stats.lastExecution = new Date();
    } catch (error) {
      console.error(`Error running job ${jobId}:`, error);
    }
  }

  stop(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new JobNotFoundError(jobId);
    }

    job.enabled = false;

    const timer = this.timers.get(jobId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(jobId);
    }

    this.stats.activeJobs = Math.max(0, this.stats.activeJobs - 1);
  }

  start(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new JobNotFoundError(jobId);
    }

    if (!job.enabled) {
      job.enabled = true;
      this.startJob(jobId);
      this.stats.activeJobs++;
    }
  }

  remove(jobId: string): void {
    this.stop(jobId);
    this.jobs.delete(jobId);
    this.stats.totalJobs = Math.max(0, this.stats.totalJobs - 1);
  }

  getJob(jobId: string): CronJob | undefined {
    return this.jobs.get(jobId);
  }

  listJobs(): CronJob[] {
    return Array.from(this.jobs.values());
  }

  getStats(): CronStats {
    return { ...this.stats };
  }

  stopAll(): void {
    for (const jobId of this.jobs.keys()) {
      this.stop(jobId);
    }
  }
}
