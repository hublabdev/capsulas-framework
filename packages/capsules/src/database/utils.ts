/**
 * Database Capsule - Utilities
 *
 * Helper functions for database operations
 */

import {
  WhereClause,
  DatabaseType,
  DatabaseConfig,
  ColumnDefinition,
  QueryResult,
} from './types';
import {
  SQL_RESERVED_KEYWORDS,
  TYPE_MAPPINGS,
  DEFAULT_STRING_LENGTH,
  PLATFORM_DATABASE_SUPPORT,
  Platform,
} from './constants';

// Re-export Platform for use in adapters
export { Platform } from './constants';
import { ValidationError } from './errors';

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Escape identifier (table name, column name) for SQL
 */
export function escapeIdentifier(identifier: string, dbType: DatabaseType = 'postgres'): string {
  const escaped = identifier.replace(/"/g, '""');

  switch (dbType) {
    case 'mysql':
      return `\`${escaped.replace(/`/g, '``')}\``;
    case 'sqlserver':
      return `[${escaped.replace(/]/g, ']]')}]`;
    default:
      return `"${escaped}"`;
  }
}

/**
 * Escape LIKE pattern special characters
 */
export function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}

/**
 * Check if identifier is a SQL reserved keyword
 */
export function isReservedKeyword(identifier: string): boolean {
  return SQL_RESERVED_KEYWORDS.includes(identifier.toUpperCase());
}

/**
 * Sanitize identifier (remove special characters, spaces)
 */
export function sanitizeIdentifier(identifier: string): string {
  return identifier
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

// ============================================================================
// WHERE CLAUSE UTILITIES
// ============================================================================

/**
 * Build WHERE clause SQL from WhereClause array
 */
export function buildWhereSQL(
  where: WhereClause[],
  startIndex: number = 1
): { sql: string; params: any[] } {
  if (!where || where.length === 0) {
    return { sql: '', params: [] };
  }

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = startIndex;

  where.forEach((clause, index) => {
    const logic = index > 0 ? (clause.logic || 'AND') : '';
    let condition = '';

    switch (clause.operator) {
      case 'IS NULL':
        condition = `${clause.column} IS NULL`;
        break;
      case 'IS NOT NULL':
        condition = `${clause.column} IS NOT NULL`;
        break;
      case 'IN':
      case 'NOT IN':
        if (Array.isArray(clause.value)) {
          const placeholders = clause.value.map(() => `$${paramIndex++}`).join(', ');
          condition = `${clause.column} ${clause.operator} (${placeholders})`;
          params.push(...clause.value);
        }
        break;
      default:
        condition = `${clause.column} ${clause.operator} $${paramIndex++}`;
        params.push(clause.value);
    }

    if (condition) {
      conditions.push(`${logic} ${condition}`.trim());
    }
  });

  return {
    sql: conditions.join(' '),
    params,
  };
}

// ============================================================================
// TYPE CONVERSION UTILITIES
// ============================================================================

/**
 * Convert generic column type to database-specific type
 */
export function convertColumnType(
  column: ColumnDefinition,
  dbType: DatabaseType
): string {
  const typeMap = TYPE_MAPPINGS[dbType];
  if (!typeMap) {
    throw new Error(`Unsupported database type: ${dbType}`);
  }

  let sqlType = typeMap[column.type];

  // Add length/precision for specific types
  if (column.type === 'string' && column.length) {
    sqlType = `${sqlType}(${column.length})`;
  } else if (column.type === 'string' && !column.length) {
    sqlType = `${sqlType}(${DEFAULT_STRING_LENGTH})`;
  } else if (column.type === 'decimal' && column.precision) {
    const scale = column.scale || 0;
    sqlType = `${sqlType}(${column.precision}, ${scale})`;
  }

  return sqlType;
}

/**
 * Convert JavaScript value to database value
 */
export function toDbValue(value: any, dbType: DatabaseType): any {
  if (value === null || value === undefined) {
    return null;
  }

  // Handle boolean for SQLite (stores as 0/1)
  if (dbType === 'sqlite' && typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  // Handle Date objects
  if (value instanceof Date) {
    switch (dbType) {
      case 'sqlite':
        return value.toISOString();
      case 'postgres':
      case 'mysql':
      case 'sqlserver':
        return value;
      default:
        return value.toISOString();
    }
  }

  // Handle JSON
  if (typeof value === 'object' && !Buffer.isBuffer(value)) {
    return JSON.stringify(value);
  }

  return value;
}

/**
 * Convert database value to JavaScript value
 */
export function fromDbValue(value: any, columnType: string, dbType: DatabaseType): any {
  if (value === null || value === undefined) {
    return null;
  }

  // Handle boolean from SQLite
  if (dbType === 'sqlite' && columnType === 'boolean') {
    return value === 1 || value === '1';
  }

  // Handle dates
  if (['date', 'datetime', 'timestamp'].includes(columnType)) {
    return value instanceof Date ? value : new Date(value);
  }

  // Handle JSON
  if (columnType === 'json' && typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate database configuration
 */
export function validateConfig(config: DatabaseConfig): void {
  if (!config.type) {
    throw new ValidationError('Database type is required', 'type');
  }

  // Validate database type is supported
  const validTypes: DatabaseType[] = ['sqlite', 'postgres', 'mysql', 'sqlserver', 'mongodb'];
  if (!validTypes.includes(config.type)) {
    throw new ValidationError(`Invalid database type: ${config.type}`, 'type');
  }

  // SQLite validation
  if (config.type === 'sqlite') {
    if (!config.filename && !config.inMemory) {
      throw new ValidationError('SQLite requires filename or inMemory option', 'filename');
    }
  }

  // Server database validation
  if (['postgres', 'mysql', 'sqlserver'].includes(config.type)) {
    if (!config.connectionString) {
      if (!config.host) {
        throw new ValidationError(`${config.type} requires host`, 'host');
      }
      if (!config.database) {
        throw new ValidationError(`${config.type} requires database name`, 'database');
      }
    }
  }

  // Pool validation
  if (config.poolMin !== undefined && config.poolMax !== undefined) {
    if (config.poolMin > config.poolMax) {
      throw new ValidationError('poolMin cannot be greater than poolMax', 'poolMin');
    }
  }
}

/**
 * Validate table name
 */
export function validateTableName(tableName: string): void {
  if (!tableName || tableName.trim() === '') {
    throw new ValidationError('Table name cannot be empty', 'tableName');
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    throw new ValidationError(
      'Table name must start with letter or underscore and contain only alphanumeric characters and underscores',
      'tableName'
    );
  }

  if (isReservedKeyword(tableName)) {
    throw new ValidationError(
      `Table name "${tableName}" is a reserved SQL keyword`,
      'tableName'
    );
  }
}

/**
 * Validate column name
 */
export function validateColumnName(columnName: string): void {
  if (!columnName || columnName.trim() === '') {
    throw new ValidationError('Column name cannot be empty', 'columnName');
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
    throw new ValidationError(
      'Column name must start with letter or underscore and contain only alphanumeric characters and underscores',
      'columnName'
    );
  }

  if (isReservedKeyword(columnName)) {
    throw new ValidationError(
      `Column name "${columnName}" is a reserved SQL keyword`,
      'columnName'
    );
  }
}

// ============================================================================
// RETRY UTILITIES
// ============================================================================

/**
 * Retry async operation with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  backoffMultiplier: number = 2,
  shouldRetry?: (error: any) => boolean
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// PAGINATION UTILITIES
// ============================================================================

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  total: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNext,
    hasPrev,
  };
}

/**
 * Calculate offset from page number
 */
export function calculateOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

// ============================================================================
// QUERY RESULT UTILITIES
// ============================================================================

/**
 * Normalize query result across different database drivers
 */
export function normalizeQueryResult<T>(
  result: any,
  dbType: DatabaseType
): QueryResult<T> {
  switch (dbType) {
    case 'postgres':
      return {
        rows: result.rows || [],
        rowCount: result.rowCount || 0,
        fields: result.fields?.map((f: any) => f.name),
      };

    case 'mysql':
      return {
        rows: Array.isArray(result) ? result : result[0] || [],
        rowCount: Array.isArray(result) ? result.length : result[0]?.length || 0,
        affectedRows: result.affectedRows,
        insertId: result.insertId,
      };

    case 'sqlite':
      return {
        rows: Array.isArray(result) ? result : [],
        rowCount: Array.isArray(result) ? result.length : 0,
        affectedRows: result.changes,
        insertId: result.lastID,
      };

    case 'sqlserver':
      return {
        rows: result.recordset || [],
        rowCount: result.rowsAffected?.[0] || 0,
      };

    default:
      return {
        rows: Array.isArray(result) ? result : [],
        rowCount: Array.isArray(result) ? result.length : 0,
      };
  }
}

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

/**
 * Detect current platform
 */
export function detectPlatform(): typeof Platform[keyof typeof Platform] {
  const PlatformEnum = Platform;

  // Node.js environment
  if (typeof process !== 'undefined' && process.versions?.node) {
    return PlatformEnum.NODE;
  }

  // Browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return PlatformEnum.WEB;
  }

  // Electron desktop
  if (typeof process !== 'undefined' && process.versions?.electron) {
    return PlatformEnum.DESKTOP;
  }

  // React Native (simplified detection)
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return PlatformEnum.MOBILE;
  }

  return PlatformEnum.UNKNOWN;
}

/**
 * Check if database type is supported on current platform
 */
export function isDatabaseSupported(
  dbType: DatabaseType,
  platform?: typeof Platform[keyof typeof Platform]
): boolean {
  const currentPlatform = platform || detectPlatform();
  return PLATFORM_DATABASE_SUPPORT[currentPlatform as keyof typeof PLATFORM_DATABASE_SUPPORT]?.includes(dbType) || false;
}

// ============================================================================
// CONNECTION STRING UTILITIES
// ============================================================================

/**
 * Parse connection string into config object
 */
export function parseConnectionString(connectionString: string): Partial<DatabaseConfig> {
  const config: Partial<DatabaseConfig> = {};

  try {
    const url = new URL(connectionString);

    // Determine database type from protocol
    const protocol = url.protocol.replace(':', '');
    if (protocol === 'postgresql' || protocol === 'postgres') {
      config.type = 'postgres';
    } else if (protocol === 'mysql') {
      config.type = 'mysql';
    } else if (protocol === 'sqlserver' || protocol === 'mssql') {
      config.type = 'sqlserver';
    } else if (protocol === 'mongodb') {
      config.type = 'mongodb';
    }

    config.host = url.hostname;
    config.port = url.port ? parseInt(url.port) : undefined;
    config.username = url.username || undefined;
    config.password = url.password || undefined;
    config.database = url.pathname.replace(/^\//, '');

    // Parse query parameters
    url.searchParams.forEach((value, key) => {
      if (key === 'ssl' || key === 'sslmode') {
        config.ssl = value === 'true' || value === 'require';
      }
    });

    config.connectionString = connectionString;
  } catch (error) {
    throw new ValidationError('Invalid connection string format', 'connectionString');
  }

  return config;
}

/**
 * Build connection string from config object
 */
export function buildConnectionString(config: DatabaseConfig): string {
  if (config.connectionString) {
    return config.connectionString;
  }

  if (config.type === 'sqlite') {
    return `sqlite:${config.filename || ':memory:'}`;
  }

  const protocol = config.type === 'postgres' ? 'postgresql' : config.type;
  const auth = config.username
    ? `${config.username}${config.password ? `:${config.password}` : ''}@`
    : '';
  const port = config.port || '';
  const database = config.database || '';

  return `${protocol}://${auth}${config.host}${port ? `:${port}` : ''}/${database}`;
}

// ============================================================================
// SQL UTILITIES
// ============================================================================

/**
 * Build INSERT statement
 */
export function buildInsertSQL(
  tableName: string,
  data: Record<string, any>,
  dbType: DatabaseType = 'postgres'
): { sql: string; params: any[] } {
  const columns = Object.keys(data);
  const values = Object.values(data);

  const columnList = columns.map(c => escapeIdentifier(c, dbType)).join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

  const sql = `INSERT INTO ${escapeIdentifier(tableName, dbType)} (${columnList}) VALUES (${placeholders})`;

  return { sql, params: values };
}

/**
 * Build UPDATE statement
 */
export function buildUpdateSQL(
  tableName: string,
  data: Record<string, any>,
  where: WhereClause[],
  dbType: DatabaseType = 'postgres'
): { sql: string; params: any[] } {
  const columns = Object.keys(data);
  const values = Object.values(data);

  const setClause = columns
    .map((col, i) => `${escapeIdentifier(col, dbType)} = $${i + 1}`)
    .join(', ');

  const whereResult = buildWhereSQL(where, values.length + 1);

  const sql = `UPDATE ${escapeIdentifier(tableName, dbType)} SET ${setClause}${
    whereResult.sql ? ` WHERE ${whereResult.sql}` : ''
  }`;

  return {
    sql,
    params: [...values, ...whereResult.params],
  };
}

/**
 * Build DELETE statement
 */
export function buildDeleteSQL(
  tableName: string,
  where: WhereClause[],
  dbType: DatabaseType = 'postgres'
): { sql: string; params: any[] } {
  const whereResult = buildWhereSQL(where);

  const sql = `DELETE FROM ${escapeIdentifier(tableName, dbType)}${
    whereResult.sql ? ` WHERE ${whereResult.sql}` : ''
  }`;

  return {
    sql,
    params: whereResult.params,
  };
}
