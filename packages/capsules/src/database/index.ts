/**
 * Database Capsule - Public API
 *
 * Main entry point for the database capsule
 * Exports all public interfaces, types, and factory functions
 */

// ==========================================================================
// TYPES & INTERFACES
// ==========================================================================

export * from './types';
export * from './errors';
export * from './constants';

// ==========================================================================
// SERVICE
// ==========================================================================

export { DatabaseService, createDatabaseService } from './service';

// ==========================================================================
// ADAPTERS
// ==========================================================================

export { createDatabaseAdapter } from './adapters';

// ==========================================================================
// UTILITIES
// ==========================================================================

export {
  escapeIdentifier,
  escapeLike,
  isReservedKeyword,
  sanitizeIdentifier,
  buildWhereSQL,
  convertColumnType,
  toDbValue,
  fromDbValue,
  validateConfig,
  validateTableName,
  validateColumnName,
  retry,
  sleep,
  calculatePagination,
  calculateOffset,
  normalizeQueryResult,
  detectPlatform,
  isDatabaseSupported,
  parseConnectionString,
  buildConnectionString,
  buildInsertSQL,
  buildUpdateSQL,
  buildDeleteSQL,
} from './utils';

// ==========================================================================
// CAPSULE DEFINITION
// ==========================================================================

import { DatabaseServiceConfig, DatabaseExecutionResult } from './types';
import { createDatabaseService, DatabaseService } from './service';

/**
 * Database Capsule Definition
 *
 * This object provides metadata about the capsule for the Capsulas framework
 */
export const DatabaseCapsule = {
  id: 'database',
  name: 'Database',
  version: '1.0.0',
  category: 'Data',
  description: 'Execute database queries and manage schemas',

  // Input port types
  inputs: {
    config: {
      type: 'OBJECT',
      required: true,
      description: 'Database configuration',
    },
    operation: {
      type: 'STRING',
      required: true,
      description: 'Operation to perform (query, execute, transaction, migrate, seed)',
    },
    sql: {
      type: 'STRING',
      required: false,
      description: 'SQL query or statement',
    },
    params: {
      type: 'ARRAY',
      required: false,
      description: 'Query parameters',
    },
  },

  // Output port types
  outputs: {
    result: {
      type: 'DATA',
      description: 'Query result or operation result',
    },
    stats: {
      type: 'OBJECT',
      description: 'Database statistics',
    },
    error: {
      type: 'STRING',
      description: 'Error message if operation failed',
    },
  },

  // Configuration schema
  config: {
    type: {
      type: 'select',
      options: ['sqlite', 'postgres', 'mysql', 'sqlserver', 'mongodb'],
      required: true,
      description: 'Database type',
    },
    host: {
      type: 'string',
      required: false,
      description: 'Database host (for server databases)',
    },
    port: {
      type: 'number',
      required: false,
      description: 'Database port',
    },
    database: {
      type: 'string',
      required: false,
      description: 'Database name',
    },
    username: {
      type: 'string',
      required: false,
      description: 'Database username',
    },
    password: {
      type: 'password',
      required: false,
      description: 'Database password',
    },
    filename: {
      type: 'string',
      required: false,
      description: 'Database filename (for SQLite)',
    },
    connectionString: {
      type: 'string',
      required: false,
      description: 'Full connection string (alternative to individual fields)',
    },
  },

  // Example usage
  examples: [
    {
      name: 'SQLite Query',
      config: {
        type: 'sqlite',
        filename: './database.sqlite',
      },
      input: {
        operation: 'query',
        sql: 'SELECT * FROM users WHERE active = ?',
        params: [true],
      },
    },
    {
      name: 'PostgreSQL Insert',
      config: {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'mydb',
        username: 'user',
        password: 'password',
      },
      input: {
        operation: 'execute',
        sql: 'INSERT INTO users (name, email) VALUES (?, ?)',
        params: ['John Doe', 'john@example.com'],
      },
    },
  ],

  // Environment variables required
  envVars: [
    'DATABASE_URL', // Optional connection string
  ],

  // Tags for categorization
  tags: ['database', 'sql', 'data', 'storage', 'query'],
};

// ==========================================================================
// CONVENIENCE FACTORY FUNCTIONS
// ==========================================================================

/**
 * Create a database service with SQLite
 *
 * @param filename - Database filename or ':memory:' for in-memory
 * @param options - Additional configuration options
 * @returns DatabaseService instance
 */
export function createSQLiteDatabase(
  filename: string = ':memory:',
  options: Partial<DatabaseServiceConfig> = {}
): DatabaseService {
  return createDatabaseService({
    type: 'sqlite',
    filename: filename === ':memory:' ? undefined : filename,
    inMemory: filename === ':memory:',
    ...options,
  });
}

/**
 * Create a database service with PostgreSQL
 *
 * @param config - PostgreSQL configuration
 * @returns DatabaseService instance
 */
export function createPostgresDatabase(
  config: Omit<DatabaseServiceConfig, 'type'>
): DatabaseService {
  return createDatabaseService({
    type: 'postgres',
    ...config,
  });
}

/**
 * Create a database service with MySQL
 *
 * @param config - MySQL configuration
 * @returns DatabaseService instance
 */
export function createMySQLDatabase(
  config: Omit<DatabaseServiceConfig, 'type'>
): DatabaseService {
  return createDatabaseService({
    type: 'mysql',
    ...config,
  });
}

/**
 * Create a database service from connection string
 *
 * @param connectionString - Database connection string
 * @param options - Additional configuration options
 * @returns DatabaseService instance
 */
export function createDatabaseFromConnectionString(
  connectionString: string,
  options: Partial<DatabaseServiceConfig> = {}
): DatabaseService {
  return createDatabaseService({
    connectionString,
    ...options,
  } as DatabaseServiceConfig);
}

/**
 * Create a database service from environment variables
 *
 * @param options - Additional configuration options
 * @returns DatabaseService instance
 */
export function createDatabaseFromEnv(
  options: Partial<DatabaseServiceConfig> = {}
): DatabaseService {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return createDatabaseFromConnectionString(connectionString, options);
}

// ==========================================================================
// DEFAULT EXPORT
// ==========================================================================

export default {
  DatabaseCapsule,
  DatabaseService,
  createDatabaseService,
  createSQLiteDatabase,
  createPostgresDatabase,
  createMySQLDatabase,
  createDatabaseFromConnectionString,
  createDatabaseFromEnv,
};
