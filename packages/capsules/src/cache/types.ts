/**
 * Cache Capsule - Type Definitions
 *
 * Type-safe cache system with support for Memory, Redis, and Memcached
 */

/**
 * Supported cache adapter types
 */
export type CacheAdapterType = 'memory' | 'redis' | 'memcached';

/**
 * Cache entry metadata
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  ttl?: number;
  createdAt: number;
  expiresAt?: number;
  size: number;
  tags?: string[];
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /**
   * Adapter type to use
   */
  adapter: CacheAdapterType;

  /**
   * Default TTL in seconds (0 = never expire)
   */
  ttl?: number;

  /**
   * Maximum cache size in bytes (for memory adapter)
   */
  maxSize?: number;

  /**
   * Maximum number of entries (for memory adapter)
   */
  maxEntries?: number;

  /**
   * Eviction strategy for memory adapter
   */
  evictionStrategy?: 'lru' | 'lfu' | 'fifo';

  /**
   * Key prefix for namespacing
   */
  prefix?: string;

  /**
   * Redis configuration (if adapter is 'redis')
   */
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    tls?: boolean;
    connectionTimeout?: number;
  };

  /**
   * Memcached configuration (if adapter is 'memcached')
   */
  memcached?: {
    servers: string[];
    options?: {
      maxConnections?: number;
      retries?: number;
      timeout?: number;
    };
  };

  /**
   * Serialization format
   */
  serializer?: 'json' | 'msgpack' | 'none';

  /**
   * Enable compression for large values
   */
  compression?: boolean;

  /**
   * Compression threshold in bytes
   */
  compressionThreshold?: number;
}

/**
 * Cache input for operations
 */
export interface CacheInput {
  /**
   * Operation type
   */
  operation: 'get' | 'set' | 'delete' | 'clear' | 'has' | 'ttl' | 'keys';

  /**
   * Cache key
   */
  key?: string;

  /**
   * Value to cache (for set operation)
   */
  value?: any;

  /**
   * TTL in seconds (for set operation)
   */
  ttl?: number;

  /**
   * Tags for grouping (for set operation)
   */
  tags?: string[];

  /**
   * Pattern for keys operation
   */
  pattern?: string;
}

/**
 * Cache operation result
 */
export interface CacheResult {
  /**
   * Whether operation was successful
   */
  success: boolean;

  /**
   * Retrieved value (for get operation)
   */
  value?: any;

  /**
   * Cache hit indicator (for get operation)
   */
  hit?: boolean;

  /**
   * Remaining TTL in seconds (for ttl operation)
   */
  ttl?: number;

  /**
   * Whether key exists (for has operation)
   */
  exists?: boolean;

  /**
   * List of keys (for keys operation)
   */
  keys?: string[];

  /**
   * Number of entries affected
   */
  count?: number;

  /**
   * Error message if operation failed
   */
  error?: string;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /**
   * Total number of get operations
   */
  totalGets: number;

  /**
   * Number of cache hits
   */
  hits: number;

  /**
   * Number of cache misses
   */
  misses: number;

  /**
   * Cache hit rate (0-1)
   */
  hitRate: number;

  /**
   * Total number of set operations
   */
  totalSets: number;

  /**
   * Total number of delete operations
   */
  totalDeletes: number;

  /**
   * Current number of entries
   */
  entries: number;

  /**
   * Current cache size in bytes
   */
  size: number;

  /**
   * Number of evictions
   */
  evictions: number;

  /**
   * Number of expirations
   */
  expirations: number;

  /**
   * Uptime in milliseconds
   */
  uptime: number;
}

/**
 * Cache event types
 */
export type CacheEventType = 'hit' | 'miss' | 'set' | 'delete' | 'clear' | 'evict' | 'expire';

/**
 * Cache event
 */
export interface CacheEvent {
  type: CacheEventType;
  key?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Cache entry with metadata for internal use
 */
export interface InternalCacheEntry<T = any> extends CacheEntry<T> {
  hits: number;
  lastAccessed: number;
  frequency: number;
}

/**
 * Cache key pattern matching options
 */
export interface KeyPatternOptions {
  /**
   * Pattern to match (supports wildcards *)
   */
  pattern: string;

  /**
   * Maximum number of keys to return
   */
  limit?: number;

  /**
   * Match by tags
   */
  tags?: string[];
}

/**
 * Bulk cache operations
 */
export interface BulkCacheOperation {
  /**
   * Operation type
   */
  type: 'get' | 'set' | 'delete';

  /**
   * Keys to operate on
   */
  keys: string[];

  /**
   * Values for bulk set
   */
  values?: any[];

  /**
   * TTL for bulk set
   */
  ttl?: number;
}

/**
 * Bulk operation result
 */
export interface BulkCacheResult {
  /**
   * Number of successful operations
   */
  successful: number;

  /**
   * Number of failed operations
   */
  failed: number;

  /**
   * Results per key
   */
  results: Map<string, { success: boolean; value?: any; error?: string }>;
}
