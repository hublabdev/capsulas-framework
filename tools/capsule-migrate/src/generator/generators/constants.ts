/**
 * Constants file generator - generates constants.ts with defaults and configurations
 * @module capsule-migrate/generator/generators/constants
 */

import { TemplateContext, GeneratorOptions } from '../../types';

/**
 * Generate constants.ts file
 */
export async function generateConstants(
  context: TemplateContext,
  options: GeneratorOptions
): Promise<string> {
  const { capsule } = context;
  const className = toPascalCase(capsule.name);

  const code = `/**
 * Constants and default configurations for ${capsule.name} capsule
 * @category ${capsule.category}
 * @module @capsulas/${capsule.id}/constants
 */

import type {
  ${className}Config,
  ${className}Stats,
} from './types';

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Default configuration for ${capsule.name}
 */
export const DEFAULT_CONFIG: Required<${className}Config> = {
  debug: false,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
${generateDefaultConfigValues(context)}
};

// ============================================================================
// Initial Statistics
// ============================================================================

/**
 * Initial statistics state
 */
export const INITIAL_STATS: ${className}Stats = {
  totalOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,
  averageExecutionTime: 0,
  lastExecutionTime: undefined,
  uptime: 0,
${generateInitialStatsValues(context)}
};

// ============================================================================
// Operation Constants
// ============================================================================

/**
 * Maximum retry attempts for operations
 */
export const MAX_RETRY_ATTEMPTS = 5;

/**
 * Base delay for retry backoff (milliseconds)
 */
export const RETRY_DELAY_BASE = 1000;

/**
 * Retry backoff multiplier
 */
export const RETRY_BACKOFF_MULTIPLIER = 2;

/**
 * Default operation timeout (milliseconds)
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Maximum operation timeout (milliseconds)
 */
export const MAX_TIMEOUT = 300000; // 5 minutes

// ============================================================================
// ${context.hasNetwork ? 'Network ' : ''}Constants
// ============================================================================

${generateNetworkConstants(context)}

// ============================================================================
// ${context.hasFileSystem ? 'File System ' : ''}Constants
// ============================================================================

${generateFileSystemConstants(context)}

// ============================================================================
// ${context.hasDatabase ? 'Database ' : ''}Constants
// ============================================================================

${generateDatabaseConstants(context)}

// ============================================================================
// Validation Constants
// ============================================================================

/**
 * Maximum input size (bytes)
 */
export const MAX_INPUT_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Minimum timeout value (milliseconds)
 */
export const MIN_TIMEOUT = 100;

/**
 * Maximum retry attempts allowed
 */
export const MAX_RETRIES = 10;

// ============================================================================
// Error Messages
// ============================================================================

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  NOT_INITIALIZED: 'Service not initialized. Call initialize() first.',
  ALREADY_INITIALIZED: 'Service is already initialized.',
  INVALID_CONFIG: 'Invalid configuration provided.',
  INVALID_INPUT: 'Invalid input parameters.',
  OPERATION_TIMEOUT: 'Operation timed out.',
  OPERATION_FAILED: 'Operation failed.',
  CLEANUP_FAILED: 'Cleanup failed.',
  RESOURCE_NOT_FOUND: 'Resource not found.',
  PERMISSION_DENIED: 'Permission denied.',
  RESOURCE_EXHAUSTED: 'Resource exhausted.',
} as const;

// ============================================================================
// Platform Detection
// ============================================================================

/**
 * Detect current platform
 */
export const CURRENT_PLATFORM = detectPlatform();

function detectPlatform(): 'node' | 'web' | 'mobile' | 'desktop' | 'universal' {
  // Node.js environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return 'node';
  }

  // Web browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'web';
  }

  // Fallback
  return 'universal';
}

// ============================================================================
// Version Information
// ============================================================================

/**
 * Capsule version
 */
export const VERSION = '${capsule.version}';

/**
 * Minimum supported platform versions
 */
export const MIN_PLATFORM_VERSIONS = {
  node: '18.0.0',
  npm: '9.0.0',
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

/**
 * Feature flags for ${capsule.name}
 */
export const FEATURES = {
  RETRY_LOGIC: true,
  STATISTICS: true,
  DEBUG_LOGGING: true,
  TIMEOUT_HANDLING: true,
${generateFeatureFlags(context)}
} as const;

// ============================================================================
// Limits and Thresholds
// ============================================================================

/**
 * System limits and thresholds
 */
export const LIMITS = {
  MAX_CONCURRENT_OPERATIONS: 10,
  MAX_QUEUE_SIZE: 1000,
  MAX_MEMORY_MB: 512,
  MAX_EXECUTION_TIME_MS: 60000, // 1 minute
${generateContextLimits(context)}
} as const;

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for various operations
 */
export const DEFAULTS = {
  ENCODING: 'utf-8' as BufferEncoding,
  BUFFER_SIZE: 64 * 1024, // 64KB
  CHUNK_SIZE: 1024 * 1024, // 1MB
  POLL_INTERVAL: 1000, // 1 second
} as const;
`;

  return code;
}

/**
 * Generate default config values
 */
function generateDefaultConfigValues(context: TemplateContext): string {
  const values: string[] = [];

  if (context.hasNetwork) {
    values.push(`  networkTimeout: 10000,`);
    values.push(`  maxConnections: 10,`);
  }

  if (context.hasFileSystem) {
    values.push(`  basePath: process.cwd(),`);
    values.push(`  encoding: 'utf-8' as BufferEncoding,`);
  }

  if (context.hasDatabase) {
    values.push(`  connectionString: '',`);
    values.push(`  poolSize: 10,`);
  }

  // Add extracted config defaults
  if (context.configs && context.configs.length > 0) {
    for (const config of context.configs) {
      if (config.defaultValue !== undefined) {
        const value = typeof config.defaultValue === 'string'
          ? `'${config.defaultValue}'`
          : JSON.stringify(config.defaultValue);
        values.push(`  ${config.name}: ${value},`);
      } else {
        // Provide sensible defaults based on type
        const defaultValue = getDefaultValueForType(config.type);
        if (defaultValue !== null) {
          values.push(`  ${config.name}: ${defaultValue},`);
        }
      }
    }
  }

  return values.length > 0 ? '\n' + values.join('\n') : '';
}

/**
 * Generate initial stats values
 */
function generateInitialStatsValues(context: TemplateContext): string {
  const values: string[] = [];

  if (context.hasNetwork) {
    values.push(`  bytesSent: 0,`);
    values.push(`  bytesReceived: 0,`);
  }

  if (context.hasFileSystem) {
    values.push(`  filesProcessed: 0,`);
    values.push(`  bytesWritten: 0,`);
  }

  if (context.hasDatabase) {
    values.push(`  queriesExecuted: 0,`);
    values.push(`  activeConnections: 0,`);
  }

  return values.length > 0 ? '\n' + values.join('\n') : '';
}

/**
 * Generate network constants
 */
function generateNetworkConstants(context: TemplateContext): string {
  if (!context.hasNetwork) {
    return '// No network-specific constants';
  }

  return `/**
 * Default network timeout (milliseconds)
 */
export const NETWORK_TIMEOUT = 10000;

/**
 * Maximum concurrent connections
 */
export const MAX_CONNECTIONS = 10;

/**
 * Connection pool idle timeout (milliseconds)
 */
export const CONNECTION_IDLE_TIMEOUT = 30000;

/**
 * Maximum request size (bytes)
 */
export const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Maximum response size (bytes)
 */
export const MAX_RESPONSE_SIZE = 100 * 1024 * 1024; // 100MB`;
}

/**
 * Generate file system constants
 */
function generateFileSystemConstants(context: TemplateContext): string {
  if (!context.hasFileSystem) {
    return '// No file system-specific constants';
  }

  return `/**
 * Default file encoding
 */
export const DEFAULT_ENCODING: BufferEncoding = 'utf-8';

/**
 * Maximum file size (bytes)
 */
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Default file permissions (octal)
 */
export const DEFAULT_FILE_PERMISSIONS = 0o644;

/**
 * Default directory permissions (octal)
 */
export const DEFAULT_DIR_PERMISSIONS = 0o755;

/**
 * Buffer size for file operations (bytes)
 */
export const FILE_BUFFER_SIZE = 64 * 1024; // 64KB`;
}

/**
 * Generate database constants
 */
function generateDatabaseConstants(context: TemplateContext): string {
  if (!context.hasDatabase) {
    return '// No database-specific constants';
  }

  return `/**
 * Default connection pool size
 */
export const DB_POOL_SIZE = 10;

/**
 * Connection timeout (milliseconds)
 */
export const DB_CONNECTION_TIMEOUT = 5000;

/**
 * Query timeout (milliseconds)
 */
export const DB_QUERY_TIMEOUT = 30000;

/**
 * Maximum number of retries for failed queries
 */
export const DB_MAX_RETRIES = 3;

/**
 * Connection pool idle timeout (milliseconds)
 */
export const DB_POOL_IDLE_TIMEOUT = 30000;`;
}

/**
 * Generate feature flags
 */
function generateFeatureFlags(context: TemplateContext): string {
  const flags: string[] = [];

  if (context.hasNetwork) {
    flags.push(`  NETWORK_OPERATIONS: true,`);
    flags.push(`  CONNECTION_POOLING: true,`);
  }

  if (context.hasFileSystem) {
    flags.push(`  FILE_OPERATIONS: true,`);
    flags.push(`  DIRECTORY_WATCHING: true,`);
  }

  if (context.hasDatabase) {
    flags.push(`  DATABASE_OPERATIONS: true,`);
    flags.push(`  TRANSACTION_SUPPORT: true,`);
  }

  if (context.isMultiPlatform) {
    flags.push(`  MULTI_PLATFORM: true,`);
  }

  return flags.length > 0 ? '\n' + flags.join('\n') : '';
}

/**
 * Generate context-specific limits
 */
function generateContextLimits(context: TemplateContext): string {
  const limits: string[] = [];

  if (context.hasNetwork) {
    limits.push(`  MAX_CONNECTIONS: 100,`);
    limits.push(`  MAX_REQUEST_SIZE_MB: 10,`);
  }

  if (context.hasFileSystem) {
    limits.push(`  MAX_FILE_SIZE_MB: 100,`);
    limits.push(`  MAX_OPEN_FILES: 1000,`);
  }

  if (context.hasDatabase) {
    limits.push(`  MAX_POOL_SIZE: 50,`);
    limits.push(`  MAX_QUERY_SIZE_KB: 1024,`);
  }

  return limits.length > 0 ? '\n' + limits.join('\n') : '';
}

/**
 * Get default value for a type
 */
function getDefaultValueForType(type: string): string | null {
  if (type.includes('string')) return "''";
  if (type.includes('number')) return '0';
  if (type.includes('boolean')) return 'false';
  if (type.includes('[]') || type.includes('Array')) return '[]';
  if (type.includes('{}') || type.includes('Record') || type.includes('object')) return '{}';
  return null;
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
