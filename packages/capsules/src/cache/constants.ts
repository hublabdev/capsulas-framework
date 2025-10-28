/**
 * Cache Capsule - Constants
 *
 * Default configurations and constant values
 */

import type { CacheConfig, CacheStats } from './types';

/**
 * Default cache configuration
 */
export const DEFAULT_CONFIG: Required<Omit<CacheConfig, 'redis' | 'memcached'>> = {
  adapter: 'memory',
  ttl: 3600, // 1 hour in seconds
  maxSize: 100 * 1024 * 1024, // 100 MB
  maxEntries: 10000,
  evictionStrategy: 'lru',
  prefix: '',
  serializer: 'json',
  compression: false,
  compressionThreshold: 1024, // 1 KB
};

/**
 * Initial cache statistics
 */
export const INITIAL_STATS: CacheStats = {
  totalGets: 0,
  hits: 0,
  misses: 0,
  hitRate: 0,
  totalSets: 0,
  totalDeletes: 0,
  entries: 0,
  size: 0,
  evictions: 0,
  expirations: 0,
  uptime: 0,
};

/**
 * TTL constants (in seconds)
 */
export const TTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600,
  THIRTY_MINUTES: 1800,
  ONE_HOUR: 3600,
  SIX_HOURS: 21600,
  TWELVE_HOURS: 43200,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  ONE_MONTH: 2592000,
  ONE_YEAR: 31536000,
  NEVER: 0, // Never expire
} as const;

/**
 * Size constants (in bytes)
 */
export const SIZE = {
  ONE_KB: 1024,
  TEN_KB: 10240,
  ONE_MB: 1048576,
  TEN_MB: 10485760,
  FIFTY_MB: 52428800,
  ONE_GB: 1073741824,
} as const;

/**
 * Default Redis configuration
 */
export const DEFAULT_REDIS_CONFIG = {
  host: 'localhost',
  port: 6379,
  db: 0,
  tls: false,
  connectionTimeout: 5000,
} as const;

/**
 * Default Memcached configuration
 */
export const DEFAULT_MEMCACHED_CONFIG = {
  servers: ['localhost:11211'],
  options: {
    maxConnections: 10,
    retries: 3,
    timeout: 5000,
  },
} as const;

/**
 * Key naming conventions
 */
export const KEY_PATTERNS = {
  USER: 'user:',
  SESSION: 'session:',
  AUTH: 'auth:',
  API: 'api:',
  QUERY: 'query:',
  PAGE: 'page:',
  ASSET: 'asset:',
  TEMP: 'temp:',
} as const;

/**
 * Cache operation timeouts (in milliseconds)
 */
export const TIMEOUTS = {
  GET: 1000,
  SET: 2000,
  DELETE: 1000,
  CLEAR: 5000,
  CONNECT: 5000,
} as const;

/**
 * Eviction strategies
 */
export const EVICTION_STRATEGIES = {
  LRU: 'lru', // Least Recently Used
  LFU: 'lfu', // Least Frequently Used
  FIFO: 'fifo', // First In First Out
} as const;

/**
 * Compression algorithms
 */
export const COMPRESSION_TYPES = {
  GZIP: 'gzip',
  DEFLATE: 'deflate',
  BROTLI: 'brotli',
} as const;

/**
 * Serialization formats
 */
export const SERIALIZERS = {
  JSON: 'json',
  MSGPACK: 'msgpack',
  NONE: 'none',
} as const;

/**
 * Cache event types
 */
export const CACHE_EVENTS = {
  HIT: 'hit',
  MISS: 'miss',
  SET: 'set',
  DELETE: 'delete',
  CLEAR: 'clear',
  EVICT: 'evict',
  EXPIRE: 'expire',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
} as const;

/**
 * Redis commands
 */
export const REDIS_COMMANDS = {
  GET: 'GET',
  SET: 'SET',
  DEL: 'DEL',
  EXISTS: 'EXISTS',
  TTL: 'TTL',
  EXPIRE: 'EXPIRE',
  KEYS: 'KEYS',
  FLUSHDB: 'FLUSHDB',
  PING: 'PING',
  INFO: 'INFO',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NOT_INITIALIZED: 'Cache service not initialized. Call initialize() first.',
  ALREADY_INITIALIZED: 'Cache service already initialized.',
  INVALID_KEY: 'Invalid cache key provided.',
  INVALID_VALUE: 'Invalid cache value provided.',
  INVALID_TTL: 'Invalid TTL value. Must be >= 0.',
  CACHE_FULL: 'Cache is full and eviction failed.',
  CONNECTION_FAILED: 'Failed to connect to cache server.',
  OPERATION_TIMEOUT: 'Cache operation timed out.',
  SERIALIZATION_FAILED: 'Failed to serialize value.',
  DESERIALIZATION_FAILED: 'Failed to deserialize cached value.',
  ADAPTER_NOT_SUPPORTED: 'Cache adapter not supported.',
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE = {
  MAX_KEY_LENGTH: 250,
  MAX_VALUE_SIZE: 1 * 1024 * 1024, // 1 MB
  MIN_COMPRESSION_SIZE: 1024, // 1 KB
  WARNING_HIT_RATE: 0.5, // Below 50% hit rate is concerning
  OPTIMAL_HIT_RATE: 0.8, // Above 80% is optimal
  CLEANUP_INTERVAL: 60000, // 1 minute
  STATS_UPDATE_INTERVAL: 5000, // 5 seconds
} as const;

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 100, // milliseconds
  MAX_DELAY: 5000, // milliseconds
  BACKOFF_MULTIPLIER: 2,
} as const;

/**
 * Health check configuration
 */
export const HEALTH_CHECK = {
  INTERVAL: 30000, // 30 seconds
  TIMEOUT: 5000, // 5 seconds
  KEY: '__health_check__',
  VALUE: 'OK',
} as const;

/**
 * Metric collection intervals
 */
export const METRICS = {
  COLLECT_INTERVAL: 10000, // 10 seconds
  RETENTION_PERIOD: 3600000, // 1 hour
  AGGREGATION_WINDOW: 60000, // 1 minute
} as const;

/**
 * Default tags for common use cases
 */
export const COMMON_TAGS = {
  USER_DATA: 'user-data',
  SESSION_DATA: 'session-data',
  API_RESPONSE: 'api-response',
  QUERY_RESULT: 'query-result',
  PAGE_CACHE: 'page-cache',
  ASSET_CACHE: 'asset-cache',
  TEMPORARY: 'temporary',
} as const;

/**
 * Cache warming configuration
 */
export const WARMING = {
  BATCH_SIZE: 100,
  DELAY_BETWEEN_BATCHES: 100, // milliseconds
  PRIORITY_KEYS: [] as string[],
} as const;

/**
 * Debug configuration
 */
export const DEBUG = {
  LOG_HITS: false,
  LOG_MISSES: false,
  LOG_SETS: false,
  LOG_DELETES: false,
  LOG_EVICTIONS: true,
  LOG_ERRORS: true,
  VERBOSE: false,
} as const;
