/**
 * Database Capsule - Errors
 *
 * Custom error types for database operations
 */

// ============================================================================
// ERROR TYPES ENUM
// ============================================================================

export enum DatabaseErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  MIGRATION_ERROR = 'MIGRATION_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  SCHEMA_ERROR = 'SCHEMA_ERROR',
  CONSTRAINT_ERROR = 'CONSTRAINT_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  ADAPTER_ERROR = 'ADAPTER_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

// ============================================================================
// BASE DATABASE ERROR
// ============================================================================

/**
 * Base error class for all database errors
 */
export class DatabaseError extends Error {
  public readonly type: DatabaseErrorType;
  public readonly query?: string;
  public readonly originalError?: any;
  public readonly timestamp: number;

  constructor(
    type: DatabaseErrorType,
    message: string,
    query?: string,
    originalError?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.type = type;
    this.query = query;
    this.originalError = originalError;
    this.timestamp = Date.now();

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      query: this.query,
      timestamp: this.timestamp,
      stack: this.stack,
      originalError: this.originalError?.message || this.originalError,
    };
  }
}

// ============================================================================
// SPECIFIC ERROR CLASSES
// ============================================================================

/**
 * Connection error
 */
export class ConnectionError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(DatabaseErrorType.CONNECTION_ERROR, message, undefined, originalError);
    this.name = 'ConnectionError';
  }
}

/**
 * Query error
 */
export class QueryError extends DatabaseError {
  constructor(message: string, query?: string, originalError?: any) {
    super(DatabaseErrorType.QUERY_ERROR, message, query, originalError);
    this.name = 'QueryError';
  }
}

/**
 * Migration error
 */
export class MigrationError extends DatabaseError {
  constructor(message: string, migrationId?: string, originalError?: any) {
    super(DatabaseErrorType.MIGRATION_ERROR, message, migrationId, originalError);
    this.name = 'MigrationError';
  }
}

/**
 * Transaction error
 */
export class TransactionError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(DatabaseErrorType.TRANSACTION_ERROR, message, undefined, originalError);
    this.name = 'TransactionError';
  }
}

/**
 * Schema error
 */
export class SchemaError extends DatabaseError {
  constructor(message: string, tableName?: string, originalError?: any) {
    super(DatabaseErrorType.SCHEMA_ERROR, message, tableName, originalError);
    this.name = 'SchemaError';
  }
}

/**
 * Constraint error (foreign key, unique, etc.)
 */
export class ConstraintError extends DatabaseError {
  constructor(message: string, constraintName?: string, originalError?: any) {
    super(DatabaseErrorType.CONSTRAINT_ERROR, message, constraintName, originalError);
    this.name = 'ConstraintError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends DatabaseError {
  constructor(message: string, query?: string) {
    super(DatabaseErrorType.NOT_FOUND, message, query);
    this.name = 'NotFoundError';
  }
}

/**
 * Duplicate entry error
 */
export class DuplicateEntryError extends DatabaseError {
  constructor(message: string, field?: string, originalError?: any) {
    super(DatabaseErrorType.DUPLICATE_ENTRY, message, field, originalError);
    this.name = 'DuplicateEntryError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends DatabaseError {
  constructor(message: string, query?: string, originalError?: any) {
    super(DatabaseErrorType.TIMEOUT_ERROR, message, query, originalError);
    this.name = 'TimeoutError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends DatabaseError {
  constructor(message: string, field?: string) {
    super(DatabaseErrorType.VALIDATION_ERROR, message, field);
    this.name = 'ValidationError';
  }
}

/**
 * Adapter error
 */
export class AdapterError extends DatabaseError {
  constructor(message: string, adapterName?: string, originalError?: any) {
    super(DatabaseErrorType.ADAPTER_ERROR, message, adapterName, originalError);
    this.name = 'AdapterError';
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends DatabaseError {
  constructor(message: string, configKey?: string) {
    super(DatabaseErrorType.CONFIGURATION_ERROR, message, configKey);
    this.name = 'ConfigurationError';
  }
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Check if error is a database error
 */
export function isDatabaseError(error: any): error is DatabaseError {
  return error instanceof DatabaseError;
}

/**
 * Check if error is a specific type of database error
 */
export function isErrorType(error: any, type: DatabaseErrorType): boolean {
  return isDatabaseError(error) && error.type === type;
}

/**
 * Parse database-specific error codes and convert to appropriate error type
 */
export function parseNativeError(error: any, query?: string): DatabaseError {
  // PostgreSQL error codes
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return new DuplicateEntryError('Duplicate entry', undefined, error);
      case '23503': // foreign_key_violation
        return new ConstraintError('Foreign key constraint violated', undefined, error);
      case '23502': // not_null_violation
        return new ConstraintError('Not null constraint violated', undefined, error);
      case '42P01': // undefined_table
        return new SchemaError('Table does not exist', undefined, error);
      case '42703': // undefined_column
        return new SchemaError('Column does not exist', undefined, error);
      case '08000': // connection_exception
      case '08003': // connection_does_not_exist
      case '08006': // connection_failure
        return new ConnectionError('Database connection error', error);
      case '57014': // query_canceled
        return new TimeoutError('Query was canceled or timed out', query, error);
    }
  }

  // MySQL error codes
  if (error.errno) {
    switch (error.errno) {
      case 1062: // ER_DUP_ENTRY
        return new DuplicateEntryError('Duplicate entry', undefined, error);
      case 1451: // ER_ROW_IS_REFERENCED_2
      case 1452: // ER_NO_REFERENCED_ROW_2
        return new ConstraintError('Foreign key constraint violated', undefined, error);
      case 1146: // ER_NO_SUCH_TABLE
        return new SchemaError('Table does not exist', undefined, error);
      case 1054: // ER_BAD_FIELD_ERROR
        return new SchemaError('Unknown column', undefined, error);
      case 2003: // CR_CONN_HOST_ERROR
      case 2013: // CR_SERVER_LOST
        return new ConnectionError('Database connection error', error);
      case 1205: // ER_LOCK_WAIT_TIMEOUT
        return new TimeoutError('Lock wait timeout exceeded', query, error);
    }
  }

  // SQLite error messages
  if (error.message) {
    if (error.message.includes('UNIQUE constraint')) {
      return new DuplicateEntryError('Duplicate entry', undefined, error);
    }
    if (error.message.includes('FOREIGN KEY constraint')) {
      return new ConstraintError('Foreign key constraint violated', undefined, error);
    }
    if (error.message.includes('no such table')) {
      return new SchemaError('Table does not exist', undefined, error);
    }
    if (error.message.includes('no such column')) {
      return new SchemaError('Column does not exist', undefined, error);
    }
  }

  // Default to query error
  return new QueryError(
    error.message || 'Database query failed',
    query,
    error
  );
}

/**
 * Wrap async database operations with error handling
 */
export async function wrapDatabaseOperation<T>(
  operation: () => Promise<T>,
  errorType: DatabaseErrorType,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (isDatabaseError(error)) {
      throw error;
    }

    const message = context
      ? `${context}: ${error.message || 'Unknown error'}`
      : error.message || 'Unknown error';

    throw new DatabaseError(errorType, message, undefined, error);
  }
}
