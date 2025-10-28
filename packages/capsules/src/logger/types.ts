/**
 * Logger Capsule - Types
 *
 * Complete type definitions for the logger capsule including:
 * - Log levels and entries
 * - Transports (console, file, HTTP)
 * - Formatters
 * - Configuration and options
 */

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Log severity levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Log level numeric values for comparison
 */
export const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

/**
 * Format type shortcuts
 */
export type FormatType = 'json' | 'pretty' | 'simple' | 'logfmt' | 'colorized';

// ============================================================================
// LOG ENTRY
// ============================================================================

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  error?: Error;
  namespace?: string;
  context?: Record<string, any>;
  [key: string]: any;
}

// ============================================================================
// LOGGER INTERFACE
// ============================================================================

/**
 * Main logger interface
 */
export interface Logger {
  // Log methods
  debug(message: string | (() => string), ...meta: any[]): void;
  info(message: string | (() => string), ...meta: any[]): void;
  warn(message: string | (() => string), ...meta: any[]): void;
  error(message: string | (() => string), error?: Error | any, ...meta: any[]): void;
  fatal(message: string | (() => string), error?: Error | any, ...meta: any[]): void;

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
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Logger service configuration
 */
export interface LoggerConfig {
  level?: LogLevel;
  format?: Formatter | FormatType;
  transports?: Transport[];
  context?: Record<string, any>;
  filter?: FilterFunction;
  silent?: boolean;
  exitOnError?: boolean;
  buffer?: BufferOptions;
  handleExceptions?: boolean;
  handleRejections?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Buffer configuration
 */
export interface BufferOptions {
  enabled: boolean;
  size: number;
  flushInterval?: number;
}

/**
 * Filter function type
 */
export type FilterFunction = (log: LogEntry) => boolean;

// ============================================================================
// FORMATTER
// ============================================================================

/**
 * Formatter function type
 */
export type Formatter = (log: LogEntry) => string;

/**
 * Formatter options
 */
export interface FormatterOptions {
  colors?: boolean;
  timestamp?: boolean;
  prettyPrint?: boolean;
  depth?: number;
  showLevel?: boolean;
  showNamespace?: boolean;
}

// ============================================================================
// TRANSPORT
// ============================================================================

/**
 * Transport base class
 */
export abstract class Transport {
  protected level: LogLevel;
  protected formatter: Formatter;
  protected filter?: FilterFunction;

  constructor(options: TransportOptions) {
    this.level = options.level || 'info';
    this.formatter = options.format || ((log) => JSON.stringify(log));
    this.filter = options.filter;
  }

  abstract write(log: LogEntry): Promise<void> | void;
  abstract close(): Promise<void> | void;

  shouldLog(log: LogEntry): boolean {
    if (LOG_LEVELS[log.level] < LOG_LEVELS[this.level]) {
      return false;
    }
    if (this.filter && !this.filter(log)) {
      return false;
    }
    return true;
  }

  format(log: LogEntry): string {
    return this.formatter(log);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }
}

/**
 * Transport options
 */
export interface TransportOptions {
  level?: LogLevel;
  format?: Formatter;
  filter?: FilterFunction;
}

// ============================================================================
// CONSOLE TRANSPORT
// ============================================================================

/**
 * Console transport options
 */
export interface ConsoleTransportOptions extends TransportOptions {
  colors?: boolean;
  stderr?: LogLevel[];
  timestamp?: boolean;
  prettyPrint?: boolean;
}

// ============================================================================
// FILE TRANSPORT
// ============================================================================

/**
 * File transport options
 */
export interface FileTransportOptions extends TransportOptions {
  filename: string;
  maxSize?: number;
  maxFiles?: number | string;
  datePattern?: string;
  compress?: boolean;
  tailable?: boolean;
  zippedArchive?: boolean;
  append?: boolean;
}

// ============================================================================
// HTTP TRANSPORT
// ============================================================================

/**
 * HTTP transport options
 */
export interface HttpTransportOptions extends TransportOptions {
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  batch?: boolean;
  batchSize?: number;
  batchInterval?: number;
  timeout?: number;
  retries?: number;
  auth?: {
    username?: string;
    password?: string;
    token?: string;
  };
}

// ============================================================================
// EVENTS
// ============================================================================

/**
 * Logger event types
 */
export type LoggerEvent = 'log' | 'error' | 'flush' | 'close' | 'rotate';

/**
 * Event handler type
 */
export type LoggerEventHandler = (data?: any) => void;

/**
 * Event emitter interface
 */
export interface LoggerEventEmitter {
  on(event: LoggerEvent, handler: LoggerEventHandler): void;
  off(event: LoggerEvent, handler: LoggerEventHandler): void;
  emit(event: LoggerEvent, data?: any): void;
}

// ============================================================================
// FILE ROTATION
// ============================================================================

/**
 * File rotation options
 */
export interface RotationOptions {
  maxSize?: number;
  maxFiles?: number;
  datePattern?: string;
  compress?: boolean;
}

/**
 * Rotation state
 */
export interface RotationState {
  currentSize: number;
  currentFile: string;
  rotationDate?: Date;
}

// ============================================================================
// BATCH
// ============================================================================

/**
 * Batch options
 */
export interface BatchOptions {
  size: number;
  interval: number;
  maxRetries?: number;
}

/**
 * Batch state
 */
export interface BatchState {
  logs: LogEntry[];
  lastFlush: Date;
  timer?: NodeJS.Timeout;
}

// ============================================================================
// COLORS
// ============================================================================

/**
 * Color configuration
 */
export interface ColorOptions {
  debug?: string;
  info?: string;
  warn?: string;
  error?: string;
  fatal?: string;
}

/**
 * Default ANSI color codes
 */
export const DEFAULT_COLORS: ColorOptions = {
  debug: '\x1b[36m',   // Cyan
  info: '\x1b[32m',    // Green
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
  fatal: '\x1b[35m',   // Magenta
};

export const COLOR_RESET = '\x1b[0m';

// ============================================================================
// SERIALIZATION
// ============================================================================

/**
 * Serializer options
 */
export interface SerializerOptions {
  maxDepth?: number;
  maxArrayLength?: number;
  maxStringLength?: number;
  circularReplacement?: any;
}

/**
 * Timestamp options
 */
export interface TimestampOptions {
  format?: 'iso' | 'unix' | 'custom';
  customFormat?: (date: Date) => string;
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Logger statistics
 */
export interface LoggerStats {
  logsWritten: number;
  logsFailed: number;
  totalSize: number;
  logsByLevel: Record<LogLevel, number>;
  transportStats: Record<string, TransportStats>;
  uptime: number;
}

/**
 * Transport statistics
 */
export interface TransportStats {
  name: string;
  logsWritten: number;
  logsFailed: number;
  lastWrite?: Date;
}

// ============================================================================
// EXECUTION RESULT
// ============================================================================

/**
 * Logger execution result
 */
export interface LoggerExecutionResult {
  success: boolean;
  logsWritten?: number;
  error?: string;
  stats?: LoggerStats;
}

// ============================================================================
// PLATFORM
// ============================================================================

/**
 * Platform types
 */
export enum Platform {
  NODE = 'node',
  WEB = 'web',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  UNKNOWN = 'unknown',
}

/**
 * Platform capabilities
 */
export interface PlatformCapabilities {
  supportsFileSystem: boolean;
  supportsConsoleColors: boolean;
  supportsStreams: boolean;
  supportsWorkers: boolean;
}
