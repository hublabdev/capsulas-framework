# Logger Capsule

Multi-transport logging system with formatters, rotation, and batching capabilities. Production-ready logging for Node.js, Web, Mobile, and Desktop platforms.

## Features

- **Multiple Transports**: Console, File, HTTP
- **5 Built-in Formatters**: JSON, Pretty, Simple, Logfmt, Colorized
- **File Rotation**: Size-based and date-based rotation
- **HTTP Batching**: Batch logs for efficient network transmission
- **Child Loggers**: Create contextual child loggers
- **Buffer Support**: Optional buffering with auto-flush
- **Platform Detection**: Adapts to Node, Web, Mobile, Desktop
- **TypeScript**: Full type safety with strict mode
- **Statistics**: Track logs written, failed, and by level
- **Error Handling**: 10 specific error types

## Quick Start

### Console Logging

```typescript
import { createConsoleLogger } from '@capsulas/logger';

const logger = createConsoleLogger({
  level: 'info',
});

logger.info('Application started');
logger.warn('Low memory warning');
logger.error('Failed to connect', new Error('Connection refused'));
```

### File Logging

```typescript
import { createFileLogger } from '@capsulas/logger';

const logger = createFileLogger('app.log', {
  level: 'debug',
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
});

logger.debug('Debug information');
logger.info('User logged in', { userId: 123 });
```

### HTTP Logging

```typescript
import { createHttpLogger } from '@capsulas/logger';

const logger = createHttpLogger('https://logs.example.com/api/logs', {
  level: 'warn',
  batch: true,
  batchSize: 10,
});

logger.error('Payment failed', { orderId: 456 });
await logger.flush(); // Send immediately
```

## Installation

```bash
npm install @capsulas/logger
# or
pnpm add @capsulas/logger
# or
yarn add @capsulas/logger
```

## Configuration

### Basic Configuration

```typescript
import { createLogger } from '@capsulas/logger';
import { jsonFormatter } from '@capsulas/logger';

const logger = createLogger({
  level: 'info',
  format: jsonFormatter,
  silent: false,
  exitOnError: true,
});
```

### Log Levels

Available log levels (in order of severity):

- `debug` - Detailed debugging information
- `info` - General informational messages
- `warn` - Warning messages
- `error` - Error messages
- `fatal` - Fatal errors (process exits by default)

```typescript
logger.debug('Detailed debug info');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred', error);
logger.fatal('Fatal error'); // Exits process by default
```

### Checking Log Levels

```typescript
logger.setLevel('warn');
logger.getLevel(); // 'warn'

if (logger.isLevelEnabled('debug')) {
  logger.debug('This will not be logged');
}
```

## Transports

### Console Transport

Logs to console with optional colors and stderr redirection.

```typescript
import { createLogger, createConsoleTransport } from '@capsulas/logger';

const logger = createLogger({
  transports: [
    createConsoleTransport({
      level: 'debug',
      colors: true,
      stderr: ['error', 'fatal'], // These levels go to stderr
    }),
  ],
});
```

### File Transport

Logs to files with automatic rotation.

```typescript
import { createLogger, createFileTransport } from '@capsulas/logger';

const logger = createLogger({
  transports: [
    createFileTransport({
      filename: 'app.log',
      level: 'info',
      maxSize: 10 * 1024 * 1024, // 10MB per file
      maxFiles: 5, // Keep 5 rotated files
      append: true,
    }),
  ],
});
```

**File Rotation**: When `app.log` reaches 10MB:
- `app.log` → `app.1.log`
- `app.1.log` → `app.2.log`
- ... continues to `maxFiles`
- Oldest file is deleted

### HTTP Transport

Sends logs to an HTTP endpoint with batching and retry support.

```typescript
import { createLogger, createHttpTransport } from '@capsulas/logger';

const logger = createLogger({
  transports: [
    createHttpTransport({
      url: 'https://logs.example.com/api/logs',
      level: 'warn',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'X-App-Version': '1.0.0',
      },
      batch: true,
      batchSize: 10,
      batchInterval: 5000, // Flush every 5 seconds
      timeout: 10000,
      retries: 3,
    }),
  ],
});
```

### Multiple Transports

Combine multiple transports for different purposes.

```typescript
import {
  createLogger,
  createConsoleTransport,
  createFileTransport,
  createHttpTransport,
} from '@capsulas/logger';

const logger = createLogger({
  level: 'debug',
  transports: [
    // Console: All levels with colors
    createConsoleTransport({
      level: 'debug',
      colors: true,
    }),

    // File: Info and above to file
    createFileTransport({
      filename: 'app.log',
      level: 'info',
      maxSize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),

    // HTTP: Only errors to remote service
    createHttpTransport({
      url: 'https://logs.example.com/api/logs',
      level: 'error',
      batch: true,
    }),
  ],
});

logger.debug('This goes to console only');
logger.info('This goes to console and file');
logger.error('This goes to all three transports');
```

## Formatters

### JSON Formatter

```typescript
import { createLogger, jsonFormatter } from '@capsulas/logger';

const logger = createLogger({
  format: jsonFormatter,
});

logger.info('User logged in', { userId: 123 });
// Output: {"timestamp":"2025-01-26T10:30:00.000Z","level":"info","message":"User logged in","metadata":{"userId":123}}
```

### Pretty Formatter

Human-readable format with indentation.

```typescript
import { createLogger, prettyFormatter } from '@capsulas/logger';

const logger = createLogger({
  format: prettyFormatter,
});

logger.info('User logged in', { userId: 123, email: 'user@example.com' });
// Output:
// 2025-01-26T10:30:00.000Z [INFO] User logged in
// {
//   "userId": 123,
//   "email": "user@example.com"
// }
```

### Simple Formatter

Compact single-line format.

```typescript
import { createLogger, simpleFormatter } from '@capsulas/logger';

const logger = createLogger({
  format: simpleFormatter,
});

logger.info('User logged in');
// Output: 2025-01-26T10:30:00.000Z [INFO] User logged in
```

### Logfmt Formatter

Key-value pair format (logfmt standard).

```typescript
import { createLogger, logfmtFormatter } from '@capsulas/logger';

const logger = createLogger({
  format: logfmtFormatter,
});

logger.info('Request completed', { method: 'GET', path: '/api/users', duration: 45 });
// Output: timestamp=2025-01-26T10:30:00.000Z level=info message="Request completed" method=GET path=/api/users duration=45
```

### Colorized Formatter

Console-optimized with ANSI colors.

```typescript
import { createLogger, colorizedFormatter } from '@capsulas/logger';

const logger = createLogger({
  format: colorizedFormatter,
});

logger.debug('Debug info');  // Cyan
logger.info('Information');  // Green
logger.warn('Warning');      // Yellow
logger.error('Error');       // Red
logger.fatal('Fatal');       // Magenta
```

### Custom Formatter

Create your own formatter:

```typescript
import { createLogger, Formatter, LogEntry } from '@capsulas/logger';

const customFormatter: Formatter = (log: LogEntry): string => {
  return `[${log.level.toUpperCase()}] ${log.message} | ${log.timestamp.toISOString()}`;
};

const logger = createLogger({
  format: customFormatter,
});
```

## Child Loggers

Create child loggers with additional context.

```typescript
import { createConsoleLogger } from '@capsulas/logger';

const logger = createConsoleLogger({ level: 'info' });

// Create child logger for a specific module
const dbLogger = logger.child({ module: 'database' });
const apiLogger = logger.child({ module: 'api', version: '2.0' });

dbLogger.info('Connection established');
// Output includes: {"module":"database"}

apiLogger.info('Request received');
// Output includes: {"module":"api","version":"2.0"}

// Nested child loggers
const userApiLogger = apiLogger.child({ endpoint: '/users' });
userApiLogger.info('Fetching users');
// Output includes: {"module":"api","version":"2.0","endpoint":"/users"}
```

## Metadata and Errors

### Adding Metadata

```typescript
logger.info('User action', {
  userId: 123,
  action: 'login',
  timestamp: Date.now(),
  ip: '192.168.1.1',
});
```

### Logging Errors

```typescript
try {
  throw new Error('Database connection failed');
} catch (error) {
  logger.error('Operation failed', error);
  // Includes full error stack trace
}

// With additional metadata
try {
  await fetchUser(123);
} catch (error) {
  logger.error('Failed to fetch user', error, {
    userId: 123,
    retryCount: 3,
  });
}
```

### Lazy Evaluation

Use function for expensive operations:

```typescript
// Only evaluated if debug level is enabled
logger.debug(() => {
  const expensiveData = computeExpensiveData();
  return `Debug data: ${JSON.stringify(expensiveData)}`;
});
```

## Buffer Support

Enable buffering for high-throughput scenarios.

```typescript
import { createLogger } from '@capsulas/logger';

const logger = createLogger({
  level: 'info',
  buffer: {
    enabled: true,
    size: 100,           // Buffer up to 100 logs
    flushInterval: 5000, // Auto-flush every 5 seconds
  },
});

// Logs are buffered
logger.info('Log 1');
logger.info('Log 2');
logger.info('Log 3');

// Manual flush
await logger.flush();

// Auto-flush on cleanup
await logger.close();
```

## Event Handling

Listen to logger events.

```typescript
import { createLogger } from '@capsulas/logger';

const logger = createLogger({ level: 'info' });

logger.on('log', (logEntry) => {
  console.log('Log emitted:', logEntry);
});

logger.on('error', (error) => {
  console.error('Logger error:', error);
});

logger.on('flush', () => {
  console.log('Buffer flushed');
});

logger.on('close', () => {
  console.log('Logger closed');
});

logger.on('rotate', ({ oldFile, newFile }) => {
  console.log(`Rotated: ${oldFile} → ${newFile}`);
});
```

## Filtering

Filter logs based on custom criteria.

```typescript
import { createLogger, LogEntry } from '@capsulas/logger';

const logger = createLogger({
  level: 'info',
  filter: (log: LogEntry) => {
    // Only log entries with userId
    return log.metadata?.userId !== undefined;
  },
});

logger.info('User action', { userId: 123 }); // Logged
logger.info('System event'); // Filtered out
```

## Environment Variables

Configure logger from environment variables.

```typescript
import { createLoggerFromEnv } from '@capsulas/logger';

// Reads LOG_LEVEL and LOG_FORMAT from environment
const logger = createLoggerFromEnv();
```

**Environment Variables**:
- `LOG_LEVEL`: Set log level (debug, info, warn, error, fatal)
- `LOG_FORMAT`: Set format (json, pretty, simple, logfmt, colorized)

```bash
# .env file
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

## Exception Handling

Capture uncaught exceptions and unhandled rejections.

```typescript
import { createLogger } from '@capsulas/logger';

const logger = createLogger({
  level: 'info',
  handleExceptions: true,
  handleRejections: true,
  exitOnError: true, // Exit process on fatal errors
});

// Uncaught exceptions are automatically logged
throw new Error('Uncaught exception');

// Unhandled promise rejections are automatically logged
Promise.reject(new Error('Unhandled rejection'));
```

## Statistics

Track logger statistics.

```typescript
import { createLogger } from '@capsulas/logger';

const logger = createLogger({ level: 'info' });

logger.info('Message 1');
logger.warn('Message 2');
logger.error('Message 3');

const stats = logger.getStats();
console.log(stats);
// {
//   logsWritten: 3,
//   logsFailed: 0,
//   totalSize: 456,
//   logsByLevel: {
//     debug: 0,
//     info: 1,
//     warn: 1,
//     error: 1,
//     fatal: 0
//   },
//   transportStats: {
//     console: {
//       name: 'console',
//       logsWritten: 3,
//       logsFailed: 0,
//       lastWrite: Date
//     }
//   },
//   uptime: 1234
// }
```

## Platform Support

Logger automatically detects the platform and adjusts capabilities.

| Platform | File System | Console Colors | Streams | Workers |
|----------|-------------|----------------|---------|---------|
| Node.js  | ✅          | ✅             | ✅      | ✅      |
| Web      | ❌          | ❌             | ❌      | ✅      |
| Mobile   | ✅          | ❌             | ❌      | ❌      |
| Desktop  | ✅          | ✅             | ✅      | ✅      |

```typescript
import { detectPlatform, getPlatformCapabilities } from '@capsulas/logger';

const platform = detectPlatform();
console.log(platform); // 'node', 'web', 'mobile', 'desktop', 'unknown'

const capabilities = getPlatformCapabilities();
console.log(capabilities);
// {
//   supportsFileSystem: true,
//   supportsConsoleColors: true,
//   supportsStreams: true,
//   supportsWorkers: true
// }
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// Debug: Detailed diagnostic information
logger.debug('Query executed', { sql, params, duration });

// Info: General informational messages
logger.info('Server started', { port: 3000 });

// Warn: Warning messages (recoverable issues)
logger.warn('Retry attempt', { attempt: 2, maxAttempts: 3 });

// Error: Error messages (failures that need attention)
logger.error('Database query failed', error, { query });

// Fatal: Critical errors (application cannot continue)
logger.fatal('Out of memory', error);
```

### 2. Use Child Loggers for Context

```typescript
// Create module-specific loggers
const authLogger = logger.child({ module: 'auth' });
const dbLogger = logger.child({ module: 'database' });

// All logs automatically include context
authLogger.info('User authenticated'); // Includes {"module":"auth"}
dbLogger.error('Connection failed'); // Includes {"module":"database"}
```

### 3. Use Lazy Evaluation for Expensive Operations

```typescript
// Bad: Always computed even if not logged
logger.debug(`State: ${JSON.stringify(largeObject)}`);

// Good: Only computed if debug is enabled
logger.debug(() => `State: ${JSON.stringify(largeObject)}`);
```

### 4. Structure Metadata Consistently

```typescript
// Good: Structured metadata
logger.info('Request completed', {
  method: 'GET',
  path: '/api/users',
  statusCode: 200,
  duration: 45,
});

// Bad: Concatenated strings
logger.info(`Request GET /api/users completed with 200 in 45ms`);
```

### 5. Handle Errors Properly

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error, {
    operation: 'riskyOperation',
    userId: currentUser.id,
  });
  throw error; // Re-throw if needed
}
```

### 6. Clean Up Resources

```typescript
// In application shutdown
process.on('SIGTERM', async () => {
  await logger.flush(); // Flush pending logs
  await logger.close(); // Close transports
  process.exit(0);
});
```

## Troubleshooting

### Logs Not Appearing

**Problem**: Logs not being written

**Solutions**:
1. Check log level: `logger.getLevel()`
2. Check if silent mode is enabled
3. Verify transport level matches log level
4. Check filter function if configured

```typescript
// Debug configuration
console.log('Level:', logger.getLevel());
console.log('Silent:', logger.config.silent);
console.log('Level enabled:', logger.isLevelEnabled('debug'));
```

### File Permission Errors

**Problem**: `EACCES` or `EPERM` errors when writing files

**Solutions**:
1. Check file/directory permissions
2. Ensure directory exists
3. Use absolute paths
4. Check disk space

```typescript
import { createFileLogger } from '@capsulas/logger';
import path from 'path';

const logger = createFileLogger(
  path.resolve(__dirname, 'logs', 'app.log'),
  { level: 'info' }
);
```

### File Rotation Not Working

**Problem**: Log files growing beyond `maxSize`

**Solutions**:
1. Verify `maxSize` is set correctly
2. Check file system supports file operations
3. Ensure sufficient disk space
4. Check write permissions

```typescript
const logger = createFileLogger('app.log', {
  maxSize: 10 * 1024 * 1024, // 10MB in bytes
  maxFiles: 5,
});
```

### HTTP Transport Failing

**Problem**: Logs not reaching HTTP endpoint

**Solutions**:
1. Check network connectivity
2. Verify URL is correct
3. Check authentication headers
4. Increase timeout
5. Check batch settings

```typescript
import { createHttpLogger } from '@capsulas/logger';

const logger = createHttpLogger('https://logs.example.com/api', {
  timeout: 30000, // Increase timeout
  retries: 5, // More retries
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
  },
});

// Listen for errors
logger.on('error', (error) => {
  console.error('HTTP transport error:', error);
});
```

### Memory Leaks

**Problem**: Memory usage increasing over time

**Solutions**:
1. Disable buffer if not needed
2. Reduce buffer size
3. Flush regularly
4. Close logger when done

```typescript
const logger = createLogger({
  buffer: {
    enabled: true,
    size: 50, // Smaller buffer
    flushInterval: 2000, // Flush more frequently
  },
});

// Regular cleanup
setInterval(() => logger.flush(), 5000);

// On shutdown
await logger.close();
```

## API Reference

### Logger Methods

```typescript
interface Logger {
  // Logging methods
  debug(message: string | (() => string), ...meta: any[]): void;
  info(message: string | (() => string), ...meta: any[]): void;
  warn(message: string | (() => string), ...meta: any[]): void;
  error(message: string | (() => string), error?: Error, ...meta: any[]): void;
  fatal(message: string | (() => string), error?: Error, ...meta: any[]): void;
  log(level: LogLevel, message: string | (() => string), ...meta: any[]): void;

  // Child loggers
  child(context: Record<string, any>): Logger;
  withContext(context: Record<string, any>): Logger;

  // Level management
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  isLevelEnabled(level: LogLevel): boolean;

  // Lifecycle
  flush(): Promise<void>;
  close(): Promise<void>;

  // Events
  on(event: LoggerEvent, handler: LoggerEventHandler): void;
  off(event: LoggerEvent, handler: LoggerEventHandler): void;

  // Statistics
  getStats(): LoggerStats;
}
```

### Factory Functions

```typescript
// Create logger from environment
createLoggerFromEnv(): Logger;

// Create console logger
createConsoleLogger(config?: Partial<LoggerConfig>): Logger;

// Create file logger
createFileLogger(filename: string, config?: Partial<LoggerConfig>): Logger;

// Create HTTP logger
createHttpLogger(url: string, config?: Partial<LoggerConfig>): Logger;

// Create custom logger
createLogger(config: LoggerConfig): Logger;
```

### Transport Factory Functions

```typescript
createConsoleTransport(options?: ConsoleTransportOptions): ConsoleTransport;
createFileTransport(options: FileTransportOptions): FileTransport;
createHttpTransport(options: HttpTransportOptions): HttpTransport;
```

### Utility Functions

```typescript
// Formatters
jsonFormatter(log: LogEntry): string;
prettyFormatter(log: LogEntry): string;
simpleFormatter(log: LogEntry): string;
logfmtFormatter(log: LogEntry): string;
colorizedFormatter(log: LogEntry): string;

// Platform
detectPlatform(): Platform;
getPlatformCapabilities(): PlatformCapabilities;

// Validation
isValidLogLevel(level: string): boolean;
validateLogEntry(entry: LogEntry): boolean;

// Utilities
safeStringify(obj: any, options?: SerializerOptions): string;
formatError(error: Error): Record<string, any>;
formatTimestamp(date: Date, format?: 'iso' | 'unix' | 'locale'): string;
truncateMessage(message: string, maxLength: number): string;
mergeMetadata(...sources: Record<string, any>[]): Record<string, any>;
cleanMetadata(metadata: Record<string, any>): Record<string, any>;
```

## TypeScript Types

```typescript
import type {
  Logger,
  LogLevel,
  LogEntry,
  LoggerConfig,
  LoggerStats,
  Transport,
  TransportOptions,
  ConsoleTransportOptions,
  FileTransportOptions,
  HttpTransportOptions,
  Formatter,
  FilterFunction,
  Platform,
  PlatformCapabilities,
} from '@capsulas/logger';
```

## Error Types

```typescript
import {
  LoggerError,
  TransportError,
  FileWriteError,
  NetworkError,
  BufferOverflowError,
  InvalidFormatError,
  InvalidLevelError,
  RotationError,
  PermissionError,
  ConfigurationError,
  InitializationError,
} from '@capsulas/logger';
```

## License

MIT

## Support

- Documentation: [https://capsulas.dev/docs/logger](https://capsulas.dev/docs/logger)
- Issues: [https://github.com/capsulas/capsulas/issues](https://github.com/capsulas/capsulas/issues)
- Discord: [https://discord.gg/capsulas](https://discord.gg/capsulas)
