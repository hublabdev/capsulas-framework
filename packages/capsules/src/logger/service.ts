/**
 * Logger Capsule - Service
 *
 * Main service class with lifecycle methods
 */

import {
  Logger,
  LoggerConfig,
  LogEntry,
  LogLevel,
  Transport,
  LoggerEvent,
  LoggerEventHandler,
  LoggerStats,
  LoggerExecutionResult,
  FilterFunction,
} from './types';
import { LOG_LEVELS, DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import { ConfigurationError, BufferOverflowError } from './errors';
import { validateLogEntry, mergeMetadata, now } from './utils';

/**
 * Logger Service
 * Main logging service with lifecycle support
 */
export class LoggerService implements Logger {
  private config: Required<LoggerConfig>;
  private transports: Transport[];
  private context: Record<string, any>;
  private filter?: FilterFunction;
  private silent: boolean;
  private exitOnError: boolean;
  private buffer?: BufferState;
  private eventHandlers: Map<LoggerEvent, LoggerEventHandler[]>;
  private stats: LoggerStats;
  private initialized: boolean;
  private startTime: number;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      transports: config.transports || [],
    } as Required<LoggerConfig>;

    this.transports = this.config.transports;
    this.context = this.config.context || {};
    this.filter = this.config.filter;
    this.silent = this.config.silent;
    this.exitOnError = this.config.exitOnError;
    this.eventHandlers = new Map();
    this.stats = { ...INITIAL_STATS };
    this.initialized = false;
    this.startTime = now();

    // Setup buffer if enabled
    if (this.config.buffer?.enabled) {
      this.setupBuffer(this.config.buffer);
    }

    // Handle uncaught exceptions
    if (this.config.handleExceptions) {
      this.setupExceptionHandler();
    }

    // Handle unhandled rejections
    if (this.config.handleRejections) {
      this.setupRejectionHandler();
    }
  }

  // ============================================================================
  // LIFECYCLE METHODS
  // ============================================================================

  /**
   * Initialize the logger
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize all transports if they have init method
      for (const transport of this.transports) {
        if ((transport as any).initialize) {
          await (transport as any).initialize();
        }
      }

      this.initialized = true;
      this.emit('log', { message: 'Logger initialized', level: 'info' });
    } catch (error: any) {
      throw new ConfigurationError(
        `Failed to initialize logger: ${error.message}`
      );
    }
  }

  /**
   * Execute logging operation (capsule pattern)
   */
  async execute(input: {
    level: LogLevel;
    message: string;
    metadata?: Record<string, any>;
    error?: Error;
  }): Promise<LoggerExecutionResult> {
    try {
      this.log(input.level, input.message, input.metadata);

      if (input.error) {
        this.error(input.message, input.error, input.metadata);
      }

      return {
        success: true,
        logsWritten: 1,
        stats: this.getStats(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        stats: this.getStats(),
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.flush();
    await this.close();
  }

  // ============================================================================
  // LOG METHODS
  // ============================================================================

  debug(message: string | (() => string), ...meta: any[]): void {
    this.log('debug', message, ...meta);
  }

  info(message: string | (() => string), ...meta: any[]): void {
    this.log('info', message, ...meta);
  }

  warn(message: string | (() => string), ...meta: any[]): void {
    this.log('warn', message, ...meta);
  }

  error(message: string | (() => string), error?: Error | any, ...meta: any[]): void {
    if (error instanceof Error) {
      this.log('error', message, { error, ...mergeMetadata(meta) });
    } else {
      this.log('error', message, error, ...meta);
    }
  }

  fatal(message: string | (() => string), error?: Error | any, ...meta: any[]): void {
    if (error instanceof Error) {
      this.log('fatal', message, { error, ...mergeMetadata(meta) });
    } else {
      this.log('fatal', message, error, ...meta);
    }

    if (this.exitOnError) {
      this.close().then(() => {
        if (typeof process !== 'undefined') {
          process.exit(1);
        }
      });
    }
  }

  log(level: LogLevel, message: string | (() => string), ...meta: any[]): void {
    // Silent mode
    if (this.silent) {
      return;
    }

    // Check if level is enabled
    if (!this.isLevelEnabled(level)) {
      return;
    }

    // Lazy evaluation
    const resolvedMessage = typeof message === 'function' ? message() : message;

    // Create log entry
    const logEntry = this.createLogEntry(level, resolvedMessage, meta);

    // Apply filter
    if (this.filter && !this.filter(logEntry)) {
      return;
    }

    // Emit log event
    this.emit('log', logEntry);

    // Update stats
    this.stats.logsWritten++;
    this.stats.logsByLevel[level]++;

    // Buffer or write
    if (this.buffer) {
      this.addToBuffer(logEntry);
    } else {
      this.writeToTransports(logEntry);
    }
  }

  // ============================================================================
  // CHILD LOGGERS
  // ============================================================================

  child(context: Record<string, any>): Logger {
    return new LoggerService({
      level: this.config.level,
      transports: this.transports,
      context: { ...this.context, ...context },
      filter: this.filter,
      silent: this.silent,
      exitOnError: this.exitOnError,
    });
  }

  withContext(context: Record<string, any>): Logger {
    return this.child(context);
  }

  // ============================================================================
  // LEVEL MANAGEMENT
  // ============================================================================

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  getLevel(): LogLevel {
    return this.config.level;
  }

  isLevelEnabled(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  async flush(): Promise<void> {
    if (this.buffer) {
      await this.flushBuffer();
    }

    this.emit('flush');
  }

  async close(): Promise<void> {
    // Flush buffer
    await this.flush();

    // Close all transports
    await Promise.all(
      this.transports.map((transport) => {
        try {
          return transport.close();
        } catch {
          return Promise.resolve();
        }
      })
    );

    // Clear buffer timer
    if (this.buffer?.timer) {
      clearInterval(this.buffer.timer);
    }

    this.emit('close');
    this.initialized = false;
  }

  // ============================================================================
  // EVENTS
  // ============================================================================

  on(event: LoggerEvent, handler: LoggerEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: LoggerEvent, handler: LoggerEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: LoggerEvent, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          // Prevent emit errors from breaking logger
          console.error('Error in logger event handler:', error);
        }
      });
    }
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  getStats(): LoggerStats {
    return {
      ...this.stats,
      uptime: now() - this.startTime,
    };
  }

  resetStats(): void {
    this.stats = { ...INITIAL_STATS };
    this.startTime = now();
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private createLogEntry(
    level: LogLevel,
    message: string,
    meta: any[]
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      ...this.context,
    };

    // Merge metadata
    const metadata = mergeMetadata(...meta);
    if (Object.keys(metadata).length > 0) {
      entry.metadata = metadata;
    }

    // Extract error if present
    const errorMeta = meta.find((m) => m && m.error instanceof Error);
    if (errorMeta?.error) {
      entry.error = errorMeta.error;
    }

    return entry;
  }

  private writeToTransports(log: LogEntry): void {
    for (const transport of this.transports) {
      try {
        if (transport.shouldLog(log)) {
          const result = transport.write(log);

          // Handle async transports
          if (result instanceof Promise) {
            result.catch((error) => {
              this.stats.logsFailed++;
              this.emit('error', { transport, error, log });
            });
          }
        }
      } catch (error) {
        this.stats.logsFailed++;
        this.emit('error', { transport, error, log });
      }
    }
  }

  // ============================================================================
  // BUFFER
  // ============================================================================

  private setupBuffer(options: { enabled: boolean; size: number; flushInterval?: number }): void {
    this.buffer = {
      logs: [],
      size: options.size,
      interval: options.flushInterval,
    };

    // Auto-flush timer
    if (options.flushInterval) {
      this.buffer.timer = setInterval(() => {
        this.flushBuffer().catch((error) => {
          this.emit('error', { message: 'Buffer flush failed', error });
        });
      }, options.flushInterval);

      // Don't block process exit
      if (this.buffer.timer.unref) {
        this.buffer.timer.unref();
      }
    }
  }

  private addToBuffer(log: LogEntry): void {
    if (!this.buffer) return;

    // Check for overflow
    if (this.buffer.logs.length >= this.buffer.size) {
      this.stats.logsFailed++;
      this.emit('error', new BufferOverflowError('Buffer full - log dropped', this.buffer.size));
      return;
    }

    this.buffer.logs.push(log);

    // Flush if buffer is full
    if (this.buffer.logs.length >= this.buffer.size) {
      this.flushBuffer().catch((error) => {
        this.emit('error', { message: 'Buffer flush failed', error });
      });
    }
  }

  private async flushBuffer(): Promise<void> {
    if (!this.buffer || this.buffer.logs.length === 0) {
      return;
    }

    const logsToFlush = [...this.buffer.logs];
    this.buffer.logs = [];

    // Write all buffered logs
    for (const log of logsToFlush) {
      this.writeToTransports(log);
    }

    // Wait for async transports
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // ============================================================================
  // EXCEPTION HANDLING
  // ============================================================================

  private setupExceptionHandler(): void {
    if (typeof process !== 'undefined') {
      process.on('uncaughtException', (error: Error) => {
        this.fatal('Uncaught Exception', error);
      });
    }
  }

  private setupRejectionHandler(): void {
    if (typeof process !== 'undefined') {
      process.on('unhandledRejection', (reason: any) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        this.fatal('Unhandled Rejection', error);
      });
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a logger instance
 */
export function createLogger(config?: LoggerConfig): Logger {
  const logger = new LoggerService(config);
  logger.initialize().catch((error) => {
    console.error('Failed to initialize logger:', error);
  });
  return logger;
}

// ============================================================================
// BUFFER STATE
// ============================================================================

interface BufferState {
  logs: LogEntry[];
  size: number;
  interval?: number;
  timer?: NodeJS.Timeout;
}
