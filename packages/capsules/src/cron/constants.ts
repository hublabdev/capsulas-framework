export const DEFAULT_CRON_CONFIG = {
  timezone: 'UTC',
  maxJobs: 100
};

export const COMMON_SCHEDULES = {
  EVERY_MINUTE: '* * * * *',
  EVERY_5_MINUTES: '*/5 * * * *',
  EVERY_15_MINUTES: '*/15 * * * *',
  EVERY_30_MINUTES: '*/30 * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_DAY_AT_MIDNIGHT: '0 0 * * *',
  EVERY_DAY_AT_NOON: '0 12 * * *',
  EVERY_WEEK: '0 0 * * 0',
  EVERY_MONTH: '0 0 1 * *'
};

export const INITIAL_STATS = {
  totalJobs: 0,
  activeJobs: 0,
  totalRuns: 0
};
