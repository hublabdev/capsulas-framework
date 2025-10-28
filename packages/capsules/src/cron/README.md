# Cron/Scheduler Capsule

Schedule and run tasks at specific times or intervals using cron expressions.

## Features

- Cron expression support
- Start, stop, and remove jobs
- Job statistics tracking
- Run immediately option
- List all jobs
- Full TypeScript support

## Installation

```bash
npm install @capsulas/capsules
```

## Usage

### Basic Scheduling

```typescript
import { createCronService, COMMON_SCHEDULES } from '@capsulas/capsules/cron';

const cronService = createCronService({
  timezone: 'America/New_York',
  maxJobs: 50
});

await cronService.initialize();

// Schedule a job to run every minute
const jobId = cronService.schedule({
  name: 'Send daily report',
  schedule: COMMON_SCHEDULES.EVERY_MINUTE,
  handler: async () => {
    console.log('Sending daily report...');
    // Your task logic here
  }
});

console.log(`Job scheduled with ID: ${jobId}`);
```

### Common Schedules

```typescript
import { COMMON_SCHEDULES } from '@capsulas/capsules/cron';

// Every minute
cronService.schedule({
  name: 'Every minute',
  schedule: COMMON_SCHEDULES.EVERY_MINUTE, // "* * * * *"
  handler: async () => console.log('Running every minute')
});

// Every 5 minutes
cronService.schedule({
  name: 'Every 5 minutes',
  schedule: COMMON_SCHEDULES.EVERY_5_MINUTES, // "*/5 * * * *"
  handler: async () => console.log('Running every 5 minutes')
});

// Daily at midnight
cronService.schedule({
  name: 'Daily backup',
  schedule: COMMON_SCHEDULES.EVERY_DAY_AT_MIDNIGHT, // "0 0 * * *"
  handler: async () => console.log('Running daily backup')
});

// Every Monday at noon
cronService.schedule({
  name: 'Weekly report',
  schedule: COMMON_SCHEDULES.EVERY_WEEK, // "0 0 * * 0"
  handler: async () => console.log('Sending weekly report')
});
```

### Custom Cron Expressions

```typescript
// Run every day at 3:30 PM
cronService.schedule({
  name: 'Afternoon task',
  schedule: '30 15 * * *',
  handler: async () => console.log('Running at 3:30 PM')
});

// Run every weekday at 9 AM
cronService.schedule({
  name: 'Weekday morning task',
  schedule: '0 9 * * 1-5',
  handler: async () => console.log('Running weekday mornings')
});

// Run on the 1st of every month at midnight
cronService.schedule({
  name: 'Monthly task',
  schedule: '0 0 1 * *',
  handler: async () => console.log('Running monthly')
});
```

## API

### `createCronService(config?: CronConfig): CronService`

Creates a new cron service instance.

**Config:**
- `timezone` - Timezone for job scheduling (default: 'UTC')
- `maxJobs` - Maximum number of concurrent jobs (default: 100)

### `cronService.schedule(options: ScheduleOptions): string`

Schedules a new job.

**Options:**
- `name` - Job name
- `schedule` - Cron expression
- `handler` - Async function to execute
- `enabled` - Whether job is enabled (default: true)
- `runImmediately` - Run job immediately upon scheduling (default: false)

**Returns:** Job ID

### `cronService.stop(jobId: string): void`

Stops a running job without removing it.

### `cronService.start(jobId: string): void`

Starts a stopped job.

### `cronService.remove(jobId: string): void`

Stops and removes a job.

### `cronService.getJob(jobId: string): CronJob | undefined`

Gets job details by ID.

### `cronService.listJobs(): CronJob[]`

Returns all scheduled jobs.

### `cronService.getStats(): CronStats`

Returns service statistics.

### `cronService.stopAll(): void`

Stops all running jobs.

## Examples

### Database Cleanup Job

```typescript
const jobId = cronService.schedule({
  name: 'Cleanup old records',
  schedule: COMMON_SCHEDULES.EVERY_DAY_AT_MIDNIGHT,
  handler: async () => {
    const db = createDatabaseService({...});
    await db.initialize();

    await db.query('DELETE FROM logs WHERE created_at < NOW() - INTERVAL 30 DAY');

    console.log('Database cleanup completed');
  }
});
```

### Email Reminder Job

```typescript
cronService.schedule({
  name: 'Send daily reminders',
  schedule: '0 9 * * *', // Every day at 9 AM
  handler: async () => {
    const emailService = createEmailService({...});
    await emailService.initialize();

    const users = await getActiveUsers();

    for (const user of users) {
      await emailService.send({
        to: user.email,
        subject: 'Daily Reminder',
        html: '<p>Don\'t forget to check your tasks!</p>'
      });
    }
  }
});
```

### Health Check Job

```typescript
cronService.schedule({
  name: 'Health check',
  schedule: COMMON_SCHEDULES.EVERY_5_MINUTES,
  handler: async () => {
    try {
      const response = await fetch('https://api.example.com/health');

      if (!response.ok) {
        // Send alert
        await sendAlert('API health check failed');
      }
    } catch (error) {
      console.error('Health check error:', error);
    }
  }
});
```

### Job Management

```typescript
// List all jobs
const jobs = cronService.listJobs();
console.log(`Total jobs: ${jobs.length}`);

jobs.forEach(job => {
  console.log(`${job.name}: ${job.enabled ? 'enabled' : 'disabled'}`);
  console.log(`  Last run: ${job.lastRun}`);
  console.log(`  Next run: ${job.nextRun}`);
  console.log(`  Run count: ${job.runCount}`);
});

// Stop a specific job
cronService.stop(jobId);

// Restart it later
cronService.start(jobId);

// Remove when no longer needed
cronService.remove(jobId);
```

### Get Statistics

```typescript
const stats = cronService.getStats();

console.log(`Total jobs: ${stats.totalJobs}`);
console.log(`Active jobs: ${stats.activeJobs}`);
console.log(`Total runs: ${stats.totalRuns}`);
console.log(`Last execution: ${stats.lastExecution}`);
```

## Cron Expression Format

Cron expressions have 5 fields:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Examples:**
- `* * * * *` - Every minute
- `0 * * * *` - Every hour
- `0 0 * * *` - Every day at midnight
- `0 12 * * *` - Every day at noon
- `0 0 * * 0` - Every Sunday at midnight
- `0 0 1 * *` - First day of every month
- `*/15 * * * *` - Every 15 minutes
- `0 9-17 * * 1-5` - Every hour from 9 AM to 5 PM, Monday to Friday

## Error Handling

```typescript
import { CronError, InvalidCronExpressionError } from '@capsulas/capsules/cron';

try {
  const jobId = cronService.schedule({
    name: 'Invalid job',
    schedule: 'invalid expression',
    handler: async () => {}
  });
} catch (error) {
  if (error instanceof InvalidCronExpressionError) {
    console.error('Invalid cron expression:', error.message);
  } else if (error instanceof CronError) {
    console.error('Cron error:', error.message);
  }
}
```

## Notes

- Jobs are executed based on cron expressions
- Handlers should be async or return void
- Long-running tasks should be handled carefully
- Consider using a job queue for heavy tasks
- Jobs persist only during service runtime

## License

MIT
