# Queue Capsule

**Async job queue with retry, scheduling, and Bull/Redis support**

## Features

✅ Job scheduling and prioritization
✅ Automatic retry with exponential backoff
✅ Progress tracking
✅ Rate limiting
✅ Memory and Redis adapters
✅ 8 specialized error types

## Quick Start

```typescript
import { createQueueService } from '@capsulas/capsules/queue';

const queue = await createQueueService({
  name: 'email-queue',
});

// Add jobs
await queue.add('send-email', {
  to: 'user@example.com',
  subject: 'Welcome!',
});

// Process jobs
queue.process(async (job) => {
  console.log('Processing:', job.data);
  await sendEmail(job.data);
  return { sent: true };
});

// Cleanup
await queue.cleanup();
```

## Examples

### Background Jobs

```typescript
await queue.add('generate-report', { userId: 123 }, {
  priority: 1, // High priority
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
});
```

### Delayed Jobs

```typescript
await queue.add('reminder', data, {
  delay: 3600000, // 1 hour
});
```

### Job Processing

```typescript
queue.process(async (job) => {
  console.log(`Processing job ${job.id}`);

  // Simulate work
  await doWork(job.data);

  return { success: true };
});
```

## API Reference

- `add(name, data, opts?): Promise<Job>`
- `process(processor): void`
- `getJob(id): Promise<Job>`
- `getStats(): QueueStats`
- `cleanup(): Promise<void>`

## License

MIT License
