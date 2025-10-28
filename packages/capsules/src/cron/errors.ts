export class CronError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CronError';
  }
}

export class InvalidCronExpressionError extends CronError {
  constructor(expression: string) {
    super(`Invalid cron expression: ${expression}`);
    this.name = 'InvalidCronExpressionError';
  }
}

export class JobNotFoundError extends CronError {
  constructor(jobId: string) {
    super(`Job not found: ${jobId}`);
    this.name = 'JobNotFoundError';
  }
}
