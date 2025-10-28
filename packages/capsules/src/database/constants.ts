/**
 * Database Capsule - Constants
 *
 * Default values, limits, and constant definitions
 */

import { DatabaseServiceConfig, DatabaseType } from './types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

/**
 * Default database service configuration
 */
export const DEFAULT_CONFIG: Required<Omit<DatabaseServiceConfig, 'type' | 'filename' | 'host' | 'port' | 'username' | 'password' | 'database' | 'connectionString'>> = {
  // Connection pool
  poolMin: 2,
  poolMax: 10,
  poolSize: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,

  // Database options
  provider: undefined as any,
  inMemory: false,
  ssl: false,
  debug: false,
  timeout: 30000,
  timezone: 'UTC',
  charset: 'utf8mb4',

  // Migrations
  migrationsPath: './migrations',
  migrationsTable: '_migrations',
  autoMigrate: false,
  autoSeed: false,

  // Logging
  logQueries: false,
  logLevel: 'info',

  // Service options
  retryAttempts: 3,
  retryDelay: 1000,
  enableCache: false,
  cacheMaxSize: 1000,
  enableStatistics: true,
};

// ============================================================================
// DEFAULT PORTS
// ============================================================================

/**
 * Default ports for different database types
 */
export const DEFAULT_PORTS: Record<Exclude<DatabaseType, 'sqlite'>, number> = {
  postgres: 5432,
  mysql: 3306,
  sqlserver: 1433,
  mongodb: 27017,
};

// ============================================================================
// QUERY LIMITS
// ============================================================================

/**
 * Maximum number of rows to return in a single query
 */
export const MAX_QUERY_ROWS = 10000;

/**
 * Default page size for paginated queries
 */
export const DEFAULT_PAGE_SIZE = 100;

/**
 * Maximum page size for paginated queries
 */
export const MAX_PAGE_SIZE = 1000;

/**
 * Default timeout for queries (milliseconds)
 */
export const DEFAULT_QUERY_TIMEOUT = 30000;

/**
 * Maximum timeout for queries (milliseconds)
 */
export const MAX_QUERY_TIMEOUT = 300000;

// ============================================================================
// CONNECTION LIMITS
// ============================================================================

/**
 * Minimum connection pool size
 */
export const MIN_POOL_SIZE = 1;

/**
 * Maximum connection pool size
 */
export const MAX_POOL_SIZE = 100;

/**
 * Default connection timeout (milliseconds)
 */
export const DEFAULT_CONNECTION_TIMEOUT = 5000;

/**
 * Maximum connection timeout (milliseconds)
 */
export const MAX_CONNECTION_TIMEOUT = 60000;

/**
 * Default idle timeout (milliseconds)
 */
export const DEFAULT_IDLE_TIMEOUT = 30000;

/**
 * Maximum idle timeout (milliseconds)
 */
export const MAX_IDLE_TIMEOUT = 600000;

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

/**
 * Maximum number of retry attempts
 */
export const MAX_RETRY_ATTEMPTS = 5;

/**
 * Default retry delay (milliseconds)
 */
export const DEFAULT_RETRY_DELAY = 1000;

/**
 * Maximum retry delay (milliseconds)
 */
export const MAX_RETRY_DELAY = 30000;

/**
 * Retry backoff multiplier
 */
export const RETRY_BACKOFF_MULTIPLIER = 2;

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

/**
 * Default cache TTL (milliseconds)
 */
export const DEFAULT_CACHE_TTL = 300000; // 5 minutes

/**
 * Maximum cache size (number of entries)
 */
export const MAX_CACHE_SIZE = 10000;

/**
 * Cache cleanup interval (milliseconds)
 */
export const CACHE_CLEANUP_INTERVAL = 60000; // 1 minute

// ============================================================================
// MIGRATION CONFIGURATION
// ============================================================================

/**
 * Default migrations table name
 */
export const DEFAULT_MIGRATIONS_TABLE = '_migrations';

/**
 * Default migrations directory
 */
export const DEFAULT_MIGRATIONS_DIR = './migrations';

/**
 * Migration file name pattern
 */
export const MIGRATION_FILE_PATTERN = /^(\d+)_(.+)\.(ts|js)$/;

// ============================================================================
// COLUMN DEFAULTS
// ============================================================================

/**
 * Default string column length
 */
export const DEFAULT_STRING_LENGTH = 255;

/**
 * Default text column length
 */
export const DEFAULT_TEXT_LENGTH = 65535;

/**
 * Default decimal precision
 */
export const DEFAULT_DECIMAL_PRECISION = 10;

/**
 * Default decimal scale
 */
export const DEFAULT_DECIMAL_SCALE = 2;

// ============================================================================
// RESERVED KEYWORDS
// ============================================================================

/**
 * SQL reserved keywords (common across databases)
 */
export const SQL_RESERVED_KEYWORDS = [
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'JOIN', 'LEFT',
  'RIGHT', 'INNER', 'OUTER', 'ON', 'AS', 'TABLE', 'CREATE', 'DROP', 'ALTER',
  'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CONSTRAINT', 'UNIQUE',
  'NOT', 'NULL', 'DEFAULT', 'CHECK', 'CASCADE', 'SET', 'ORDER', 'BY', 'GROUP',
  'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'EXCEPT', 'INTERSECT', 'DISTINCT',
  'ALL', 'AND', 'OR', 'IN', 'BETWEEN', 'LIKE', 'IS', 'EXISTS', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END', 'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION',
];

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

/**
 * Column type mappings from generic to database-specific
 */
export const TYPE_MAPPINGS = {
  postgres: {
    string: 'VARCHAR',
    text: 'TEXT',
    integer: 'INTEGER',
    bigint: 'BIGINT',
    float: 'REAL',
    decimal: 'DECIMAL',
    boolean: 'BOOLEAN',
    date: 'DATE',
    datetime: 'TIMESTAMP',
    timestamp: 'TIMESTAMP',
    json: 'JSONB',
    blob: 'BYTEA',
  },
  mysql: {
    string: 'VARCHAR',
    text: 'TEXT',
    integer: 'INT',
    bigint: 'BIGINT',
    float: 'FLOAT',
    decimal: 'DECIMAL',
    boolean: 'BOOLEAN',
    date: 'DATE',
    datetime: 'DATETIME',
    timestamp: 'TIMESTAMP',
    json: 'JSON',
    blob: 'BLOB',
  },
  sqlite: {
    string: 'TEXT',
    text: 'TEXT',
    integer: 'INTEGER',
    bigint: 'INTEGER',
    float: 'REAL',
    decimal: 'REAL',
    boolean: 'INTEGER',
    date: 'TEXT',
    datetime: 'TEXT',
    timestamp: 'TEXT',
    json: 'TEXT',
    blob: 'BLOB',
  },
  sqlserver: {
    string: 'NVARCHAR',
    text: 'NTEXT',
    integer: 'INT',
    bigint: 'BIGINT',
    float: 'FLOAT',
    decimal: 'DECIMAL',
    boolean: 'BIT',
    date: 'DATE',
    datetime: 'DATETIME2',
    timestamp: 'DATETIME2',
    json: 'NVARCHAR(MAX)',
    blob: 'VARBINARY(MAX)',
  },
  mongodb: {
    string: 'String',
    text: 'String',
    integer: 'Number',
    bigint: 'Number',
    float: 'Number',
    decimal: 'Decimal128',
    boolean: 'Boolean',
    date: 'Date',
    datetime: 'Date',
    timestamp: 'Date',
    json: 'Object',
    blob: 'BinData',
  },
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * Standard error messages
 */
export const ERROR_MESSAGES = {
  CONNECTION_REQUIRED: 'Database connection is required',
  ALREADY_CONNECTED: 'Database is already connected',
  NOT_CONNECTED: 'Database is not connected',
  INVALID_CONFIG: 'Invalid database configuration',
  INVALID_QUERY: 'Invalid SQL query',
  TRANSACTION_IN_PROGRESS: 'Transaction already in progress',
  NO_TRANSACTION: 'No transaction in progress',
  TABLE_NOT_FOUND: 'Table not found',
  COLUMN_NOT_FOUND: 'Column not found',
  MIGRATION_FAILED: 'Migration failed',
  INVALID_ADAPTER: 'Invalid database adapter',
  TIMEOUT: 'Database operation timed out',
  RETRY_EXCEEDED: 'Maximum retry attempts exceeded',
};

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Initial statistics object
 */
export const INITIAL_STATS = {
  queriesExecuted: 0,
  queriesFailed: 0,
  totalQueryTime: 0,
  averageQueryTime: 0,
  connectionsCreated: 0,
  connectionsActive: 0,
  transactionsStarted: 0,
  transactionsCommitted: 0,
  transactionsRolledBack: 0,
  migrationsRun: 0,
  seedersRun: 0,
};

// ============================================================================
// CLEANUP CONFIGURATION
// ============================================================================

/**
 * Default cleanup interval (milliseconds)
 */
export const DEFAULT_CLEANUP_INTERVAL = 60000; // 1 minute

/**
 * Default cleanup batch size
 */
export const DEFAULT_CLEANUP_BATCH_SIZE = 100;

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
 * Supported database types per platform
 */
export const PLATFORM_DATABASE_SUPPORT: Record<Platform, DatabaseType[]> = {
  [Platform.NODE]: ['sqlite', 'postgres', 'mysql', 'sqlserver', 'mongodb'],
  [Platform.WEB]: ['sqlite'], // IndexedDB-based SQLite
  [Platform.MOBILE]: ['sqlite'],
  [Platform.DESKTOP]: ['sqlite', 'postgres', 'mysql', 'sqlserver', 'mongodb'],
  [Platform.UNKNOWN]: [],
};
