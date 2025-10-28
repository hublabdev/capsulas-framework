import { InvalidCronExpressionError } from './errors';
import { CronExpression } from './types';

export function validateCronExpression(expression: CronExpression): boolean {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    throw new InvalidCronExpressionError(expression);
  }

  return true;
}

export function parseCronExpression(expression: CronExpression): { minute: string; hour: string; dayOfMonth: string; month: string; dayOfWeek: string } {
  validateCronExpression(expression);

  const [minute, hour, dayOfMonth, month, dayOfWeek] = expression.trim().split(/\s+/);

  return { minute, hour, dayOfMonth, month, dayOfWeek };
}

export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateNextRun(schedule: CronExpression): Date {
  // Simplified next run calculation
  // In production, use a proper cron parser library
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  return now;
}
