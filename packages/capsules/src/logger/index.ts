/**
 * Logger Capsule - Public API
 *
 * Main entry point for the logger capsule
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export * from './types';
export * from './errors';
export * from './constants';

// ============================================================================
// SERVICE
// ============================================================================

export { LoggerService, createLogger } from './service';

// ============================================================================
// TRANSPORTS
// ============================================================================

export {
  ConsoleTransport,
  FileTransport,
  HttpTransport,
  createConsoleTransport,
  createFileTransport,
  createHttpTransport,
} from './adapters';

// ============================================================================
// UTILITIES
// ============================================================================

export {
  // Formatters
  jsonFormatter,
  prettyFormatter,
  simpleFormatter,
  logfmtFormatter,
  colorizedFormatter,
  // Platform
  detectPlatform,
  getPlatformCapabilities,
  // Validation
  isValidLogLevel,
  validateLogEntry,
  // Utilities
  safeStringify,
  formatError,
  formatTimestamp,
  truncateMessage,
  mergeMetadata,
  cleanMetadata,
} from './utils';

// ============================================================================
// CAPSULE DEFINITION
// ============================================================================

import { LoggerConfig, LoggerExecutionResult } from './types';
import { createLogger, LoggerService } from './service';

/**
 * Logger Capsule Definition
 */
export const LoggerCapsule = {
  id: 'logger',
  name: 'Logger',
  version: '1.0.0',
  category: 'Infrastructure',
  description: 'Multi-transport logging with formatters and rotation',

  // Input port types
  inputs: {
    config: {
      type: 'OBJECT',
      required: false,
      description: 'Logger configuration',
    },
    level: {
      type: 'STRING',
      required: true,
      description: 'Log level (debug, info, warn, error, fatal)',
    },
    message: {
      type: 'STRING',
      required: true,
      description: 'Log message',
    },
    metadata: {
      type: 'OBJECT',
      required: false,
      description: 'Additional metadata',
    },
    error: {
      type: 'ERROR',
      required: false,
      description: 'Error object',
    },
  },

  // Output port types
  outputs: {
    success: {
      type: 'BOOLEAN',
      description: 'Whether logging succeeded',
    },
    stats: {
      type: 'OBJECT',
      description: 'Logger statistics',
    },
    error: {
      type: 'STRING',
      description: 'Error message if failed',
    },
  },

  // Configuration schema
  config: {
    level: {
      type: 'select',
      options: ['debug', 'info', 'warn', 'error', 'fatal'],
      default: 'info',
      description: 'Minimum log level',
    },
    format: {
      type: 'select',
      options: ['json', 'pretty', 'simple', 'logfmt', 'colorized'],
      default: 'pretty',
      description: 'Log format',
    },
    silent: {
      type: 'boolean',
      default: false,
      description: 'Disable all logging',
    },
    exitOnError: {
      type: 'boolean',
      default: true,
      description: 'Exit process on fatal errors',
    },
  },

  // Example usage
  examples: [
    {
      name: 'Console Logging',
      config: {
        level: 'info',
        transports: [{ type: 'console', colors: true }],
      },
      input: {
        level: 'info',
        message: 'Application started',
        metadata: { version: '1.0.0' },
      },
    },
    {
      name: 'File Logging with Rotation',
      config: {
        level: 'debug',
        transports: [
          {
            type: 'file',
            filename: 'app.log',
            maxSize: 10485760, // 10MB
            maxFiles: 5,
          },
        ],
      },
      input: {
        level: 'debug',
        message: 'Debug information',
      },
    },
    {
      name: 'HTTP Transport',
      config: {
        level: 'warn',
        transports: [
          {
            type: 'http',
            url: 'https://logs.example.com/api/logs',
            batch: true,
            batchSize: 10,
          },
        ],
      },
      input: {
        level: 'error',
        message: 'Something went wrong',
        error: new Error('Connection failed'),
      },
    },
  ],

  // Environment variables
  envVars: ['LOG_LEVEL', 'LOG_FORMAT'],

  // Tags
  tags: ['logging', 'monitoring', 'debug', 'infrastructure'],
};

// ============================================================================
// CONVENIENCE FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a console logger
 */
export function createConsoleLogger(config?: Partial<LoggerConfig>) {
  return createLogger({
    ...config,
    transports: [
      ...(config?.transports || []),
      {
        level: config?.level || 'info',
        format: colorizedFormatter,
      } as any,
    ],
  });
}

/**
 * Create a file logger
 */
export function createFileLogger(filename: string, config?: Partial<LoggerConfig>) {
  return createLogger({
    ...config,
    transports: [
      ...(config?.transports || []),
      {
        filename,
        level: config?.level || 'info',
      } as any,
    ],
  });
}

/**
 * Create an HTTP logger
 */
export function createHttpLogger(url: string, config?: Partial<LoggerConfig>) {
  return createLogger({
    ...config,
    transports: [
      ...(config?.transports || []),
      {
        url,
        level: config?.level || 'info',
        batch: true,
      } as any,
    ],
  });
}

/**
 * Create a logger from environment variables
 */
export function createLoggerFromEnv() {
  const level = (process.env.LOG_LEVEL as any) || 'info';
  const format = process.env.LOG_FORMAT || 'pretty';

  return createLogger({
    level,
    format: format as any,
  });
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  LoggerCapsule,
  LoggerService,
  createLogger,
  createConsoleLogger,
  createFileLogger,
  createHttpLogger,
  createLoggerFromEnv,
};
