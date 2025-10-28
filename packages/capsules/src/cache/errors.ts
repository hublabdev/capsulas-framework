/**
 * Cache Capsule - Error Definitions
 *
 * Comprehensive error handling for cache operations
 */

/**
 * Cache error types enum
 */
export enum CacheErrorType {
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  DESERIALIZATION_ERROR = 'DESERIALIZATION_ERROR',
  CACHE_FULL_ERROR = 'CACHE_FULL_ERROR',
  KEY_NOT_FOUND_ERROR = 'KEY_NOT_FOUND_ERROR',
  INVALID_TTL_ERROR = 'INVALID_TTL_ERROR',
  ADAPTER_ERROR = 'ADAPTER_ERROR',
  COMPRESSION_ERROR = 'COMPRESSION_ERROR',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  OPERATION_ERROR = 'OPERATION_ERROR',
}

/**
 * Base cache error class
 */
export class CacheError extends Error {
  constructor(
    message: string,
    public readonly type: CacheErrorType,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'CacheError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Configuration error
 * Thrown when cache configuration is invalid
 */
export class CacheConfigurationError extends CacheError {
  constructor(message: string, details?: any) {
    super(message, CacheErrorType.CONFIGURATION_ERROR, details);
    this.name = 'CacheConfigurationError';
  }
}

/**
 * Connection error
 * Thrown when unable to connect to cache server (Redis/Memcached)
 */
export class CacheConnectionError extends CacheError {
  constructor(message: string, details?: any) {
    super(message, CacheErrorType.CONNECTION_ERROR, details);
    this.name = 'CacheConnectionError';
  }
}

/**
 * Timeout error
 * Thrown when cache operation times out
 */
export class CacheTimeoutError extends CacheError {
  constructor(message: string, details?: any) {
    super(message, CacheErrorType.TIMEOUT_ERROR, details);
    this.name = 'CacheTimeoutError';
  }
}

/**
 * Serialization error
 * Thrown when unable to serialize value
 */
export class CacheSerializationError extends CacheError {
  constructor(message: string, details?: any) {
    super(message, CacheErrorType.SERIALIZATION_ERROR, details);
    this.name = 'CacheSerializationError';
  }
}

/**
 * Deserialization error
 * Thrown when unable to deserialize cached value
 */
export class CacheDeserializationError extends CacheError {
  constructor(message: string, details?: any) {
    super(message, CacheErrorType.DESERIALIZATION_ERROR, details);
    this.name = 'CacheDeserializationError';
  }
}

/**
 * Cache full error
 * Thrown when cache reaches maximum size/entries and eviction fails
 */
export class CacheFullError extends CacheError {
  constructor(message: string, details?: any) {
    super(message, CacheErrorType.CACHE_FULL_ERROR, details);
    this.name = 'CacheFullError';
  }
}

/**
 * Key not found error
 * Thrown when requested key doesn't exist in cache
 */
export class CacheKeyNotFoundError extends CacheError {
  constructor(key: string, details?: any) {
    super(`Cache key not found: ${key}`, CacheErrorType.KEY_NOT_FOUND_ERROR, {
      ...details,
      key,
    });
    this.name = 'CacheKeyNotFoundError';
  }
}

/**
 * Invalid TTL error
 * Thrown when TTL value is invalid
 */
export class CacheInvalidTTLError extends CacheError {
  constructor(ttl: number, details?: any) {
    super(`Invalid TTL value: ${ttl}`, CacheErrorType.INVALID_TTL_ERROR, {
      ...details,
      ttl,
    });
    this.name = 'CacheInvalidTTLError';
  }
}

/**
 * Adapter error
 * Thrown when cache adapter encounters an error
 */
export class CacheAdapterError extends CacheError {
  constructor(message: string, details?: any) {
    super(message, CacheErrorType.ADAPTER_ERROR, details);
    this.name = 'CacheAdapterError';
  }
}

/**
 * Compression error
 * Thrown when compression/decompression fails
 */
export class CacheCompressionError extends CacheError {
  constructor(message: string, details?: any) {
    super(message, CacheErrorType.COMPRESSION_ERROR, details);
    this.name = 'CacheCompressionError';
  }
}

/**
 * Initialization error
 * Thrown when cache service fails to initialize
 */
export class CacheInitializationError extends CacheError {
  constructor(message: string, details?: any) {
    super(message, CacheErrorType.INITIALIZATION_ERROR, details);
    this.name = 'CacheInitializationError';
  }
}

/**
 * Operation error
 * Thrown when a cache operation fails
 */
export class CacheOperationError extends CacheError {
  constructor(operation: string, details?: any) {
    super(`Cache operation failed: ${operation}`, CacheErrorType.OPERATION_ERROR, {
      ...details,
      operation,
    });
    this.name = 'CacheOperationError';
  }
}

/**
 * Type guard to check if error is a CacheError
 */
export function isCacheError(error: any): error is CacheError {
  return error instanceof CacheError;
}

/**
 * Type guard for specific cache error types
 */
export function isCacheErrorType(error: any, type: CacheErrorType): boolean {
  return isCacheError(error) && error.type === type;
}

/**
 * Parse Redis errors and convert to CacheError
 */
export function parseRedisError(error: any): CacheError {
  const message = error.message || 'Unknown Redis error';

  if (message.includes('ECONNREFUSED') || message.includes('Connection refused')) {
    return new CacheConnectionError('Failed to connect to Redis server', {
      originalError: error,
    });
  }

  if (message.includes('ETIMEDOUT') || message.includes('timeout')) {
    return new CacheTimeoutError('Redis operation timed out', {
      originalError: error,
    });
  }

  if (message.includes('WRONGTYPE') || message.includes('MOVED')) {
    return new CacheOperationError('Redis operation', {
      originalError: error,
      message,
    });
  }

  return new CacheAdapterError(`Redis error: ${message}`, {
    originalError: error,
  });
}

/**
 * Parse Memcached errors and convert to CacheError
 */
export function parseMemcachedError(error: any): CacheError {
  const message = error.message || 'Unknown Memcached error';

  if (message.includes('CONNECTION ERROR') || message.includes('connect')) {
    return new CacheConnectionError('Failed to connect to Memcached server', {
      originalError: error,
    });
  }

  if (message.includes('timeout')) {
    return new CacheTimeoutError('Memcached operation timed out', {
      originalError: error,
    });
  }

  return new CacheAdapterError(`Memcached error: ${message}`, {
    originalError: error,
  });
}

/**
 * Helper to create configuration errors
 */
export function createConfigError(field: string, reason: string): CacheConfigurationError {
  return new CacheConfigurationError(`Invalid configuration for '${field}': ${reason}`, {
    field,
    reason,
  });
}
