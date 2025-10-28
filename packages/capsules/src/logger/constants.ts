/**
 * Logger Capsule - Constants
 *
 * Default values, limits, and constant definitions
 */

import { LoggerConfig, LogLevel, ColorOptions, DEFAULT_COLORS } from './types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Default logger configuration
 */
export const DEFAULT_CONFIG: Required<Omit<LoggerConfig, 'transports' | 'filter' | 'format' | 'metadata'>> = {
  level: 'info',
  context: {},
  silent: false,
  exitOnError: true,
  buffer: {
    enabled: false,
    size: 100,
    flushInterval: 5000,
  },
  handleExceptions: false,
  handleRejections: false,
};

// ============================================================================
// LOG LEVELS
// ============================================================================

/**
 * All available log levels in order
 */
export const LOG_LEVEL_ORDER: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

/**
 * Log level display names
 */
export const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  fatal: 'FATAL',
};

/**
 * Log level short names (for compact formatting)
 */
export const LOG_LEVEL_SHORT: Record<LogLevel, string> = {
  debug: 'DBG',
  info: 'INF',
  warn: 'WRN',
  error: 'ERR',
  fatal: 'FTL',
};

// ============================================================================
// COLORS
// ============================================================================

/**
 * Export default colors from types
 */
export { DEFAULT_COLORS, COLOR_RESET } from './types';

/**
 * Additional color codes
 */
export const COLORS = {
  ...DEFAULT_COLORS,
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

// ============================================================================
// BUFFER LIMITS
// ============================================================================

/**
 * Minimum buffer size
 */
export const MIN_BUFFER_SIZE = 10;

/**
 * Maximum buffer size
 */
export const MAX_BUFFER_SIZE = 10000;

/**
 * Default buffer size
 */
export const DEFAULT_BUFFER_SIZE = 100;

/**
 * Minimum flush interval (ms)
 */
export const MIN_FLUSH_INTERVAL = 100;

/**
 * Maximum flush interval (ms)
 */
export const MAX_FLUSH_INTERVAL = 60000;

/**
 * Default flush interval (ms)
 */
export const DEFAULT_FLUSH_INTERVAL = 5000;

// ============================================================================
// FILE ROTATION
// ============================================================================

/**
 * Default max file size (10MB)
 */
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Maximum file size (100MB)
 */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * Default max files to keep
 */
export const DEFAULT_MAX_FILES = 10;

/**
 * Maximum number of files to keep
 */
export const MAX_FILES_LIMIT = 100;

/**
 * Default date pattern for rotation
 */
export const DEFAULT_DATE_PATTERN = 'YYYY-MM-DD';

// ============================================================================
// HTTP TRANSPORT
// ============================================================================

/**
 * Default HTTP method
 */
export const DEFAULT_HTTP_METHOD = 'POST';

/**
 * Default batch size
 */
export const DEFAULT_BATCH_SIZE = 10;

/**
 * Maximum batch size
 */
export const MAX_BATCH_SIZE = 1000;

/**
 * Default batch interval (ms)
 */
export const DEFAULT_BATCH_INTERVAL = 5000;

/**
 * Default HTTP timeout (ms)
 */
export const DEFAULT_HTTP_TIMEOUT = 10000;

/**
 * Maximum HTTP timeout (ms)
 */
export const MAX_HTTP_TIMEOUT = 60000;

/**
 * Default retry attempts
 */
export const DEFAULT_RETRY_ATTEMPTS = 3;

/**
 * Maximum retry attempts
 */
export const MAX_RETRY_ATTEMPTS = 10;

/**
 * Retry delay base (ms)
 */
export const RETRY_DELAY_BASE = 1000;

/**
 * Retry backoff multiplier
 */
export const RETRY_BACKOFF_MULTIPLIER = 2;

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Default timestamp format
 */
export const DEFAULT_TIMESTAMP_FORMAT = 'iso';

/**
 * Maximum message length
 */
export const MAX_MESSAGE_LENGTH = 10000;

/**
 * Maximum metadata depth
 */
export const MAX_METADATA_DEPTH = 5;

/**
 * Maximum array length in logs
 */
export const MAX_ARRAY_LENGTH = 100;

/**
 * Maximum string length in metadata
 */
export const MAX_STRING_LENGTH = 1000;

// ============================================================================
// SERIALIZATION
// ============================================================================

/**
 * Default serializer options
 */
export const DEFAULT_SERIALIZER_OPTIONS = {
  maxDepth: MAX_METADATA_DEPTH,
  maxArrayLength: MAX_ARRAY_LENGTH,
  maxStringLength: MAX_STRING_LENGTH,
  circularReplacement: '[Circular]',
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * Standard error messages
 */
export const ERROR_MESSAGES = {
  INVALID_LEVEL: 'Invalid log level',
  INVALID_FORMAT: 'Invalid format type',
  BUFFER_OVERFLOW: 'Buffer overflow - logs dropped',
  FILE_WRITE_FAILED: 'Failed to write to file',
  NETWORK_ERROR: 'Network error during HTTP transport',
  TRANSPORT_ERROR: 'Transport error',
  INITIALIZATION_ERROR: 'Logger initialization failed',
  PERMISSION_DENIED: 'Permission denied',
  INVALID_CONFIG: 'Invalid configuration',
  ROTATION_FAILED: 'File rotation failed',
};

// ============================================================================
// PLATFORM DETECTION
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
 * Platform capabilities matrix
 */
export const PLATFORM_CAPABILITIES = {
  [Platform.NODE]: {
    supportsFileSystem: true,
    supportsConsoleColors: true,
    supportsStreams: true,
    supportsWorkers: true,
  },
  [Platform.WEB]: {
    supportsFileSystem: false,
    supportsConsoleColors: false,
    supportsStreams: false,
    supportsWorkers: true,
  },
  [Platform.MOBILE]: {
    supportsFileSystem: true,
    supportsConsoleColors: false,
    supportsStreams: false,
    supportsWorkers: false,
  },
  [Platform.DESKTOP]: {
    supportsFileSystem: true,
    supportsConsoleColors: true,
    supportsStreams: true,
    supportsWorkers: true,
  },
  [Platform.UNKNOWN]: {
    supportsFileSystem: false,
    supportsConsoleColors: false,
    supportsStreams: false,
    supportsWorkers: false,
  },
};

// ============================================================================
// INITIAL STATISTICS
// ============================================================================

/**
 * Initial statistics object
 */
export const INITIAL_STATS = {
  logsWritten: 0,
  logsFailed: 0,
  totalSize: 0,
  logsByLevel: {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    fatal: 0,
  },
  transportStats: {},
  uptime: 0,
};

// ============================================================================
// RESERVED KEYS
// ============================================================================

/**
 * Reserved log entry keys (cannot be used in metadata)
 */
export const RESERVED_KEYS = [
  'timestamp',
  'level',
  'message',
  'error',
  'namespace',
  'context',
  'metadata',
];

// ============================================================================
// MIME TYPES
// ============================================================================

/**
 * Content types for HTTP transport
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  TEXT: 'text/plain',
  FORM: 'application/x-www-form-urlencoded',
};

// ============================================================================
// TIME FORMATS
// ============================================================================

/**
 * Time format patterns
 */
export const TIME_FORMATS = {
  ISO: 'iso',
  UNIX: 'unix',
  LOCALE: 'locale',
  CUSTOM: 'custom',
};

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Default cleanup interval (ms)
 */
export const DEFAULT_CLEANUP_INTERVAL = 60000; // 1 minute

/**
 * Cleanup batch size
 */
export const CLEANUP_BATCH_SIZE = 100;
