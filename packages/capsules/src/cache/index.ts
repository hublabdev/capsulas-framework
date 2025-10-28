/**
 * @capsulas/capsules - Cache Capsule
 *
 * High-performance caching with multiple backend support (Memory, Redis, Memcached)
 * Features: LRU/LFU/FIFO eviction, compression, serialization, statistics
 *
 * @category Data
 * @version 1.0.0
 */

// Export types
export type {
  CacheConfig,
  CacheAdapter,
  CacheAdapterType,
  CacheEntry,
  InternalCacheEntry,
  CacheResult,
  CacheStats,
  RedisConfig,
  MemcachedConfig,
} from './types';

// Export errors
export {
  CacheError,
  CacheErrorType,
  CacheConfigurationError,
  CacheConnectionError,
  CacheTimeoutError,
  CacheSerializationError,
  CacheDeserializationError,
  CacheFullError,
  CacheKeyNotFoundError,
  CacheInvalidTTLError,
  CacheAdapterError,
  CacheCompressionError,
  CacheInitializationError,
  CacheOperationError,
  parseRedisError,
  parseMemcachedError,
} from './errors';

// Export constants
export {
  DEFAULT_CONFIG,
  INITIAL_STATS,
  TTL,
  SIZE,
  DEFAULT_REDIS_CONFIG,
  DEFAULT_MEMCACHED_CONFIG,
  KEY_PATTERNS,
  TIMEOUTS,
  EVICTION_STRATEGIES,
  COMPRESSION_TYPES,
  SERIALIZERS,
  CACHE_EVENTS,
  REDIS_COMMANDS,
  ERROR_MESSAGES,
  PERFORMANCE,
  RETRY_CONFIG,
  HEALTH_CHECK,
  METRICS,
  COMMON_TAGS,
  WARMING,
  DEBUG,
} from './constants';

// Export utilities
export {
  serialize,
  deserialize,
  compress,
  decompress,
  generateKey,
  sanitizeKey,
  hashKey,
  calculateSize,
  shouldCompress,
  calculateExpiration,
  isExpired,
  getRemainingTTL,
  matchPattern,
  parseKey,
  formatBytes,
  formatDuration,
  debounce,
  throttle,
  retry,
  sleep,
  deepClone,
  sortByLRU,
  sortByLFU,
  sortByFIFO,
  validateKey,
  validateTTL,
  generateStatsSummary,
} from './utils';

// Export adapters
export {
  MemoryAdapter,
  RedisAdapter,
  MemcachedAdapter,
  createAdapter,
} from './adapters';

// Export service
export { CacheService, createCacheService, createCacheFactory } from './service';

// Re-export default service for convenience
import { CacheService } from './service';
export default CacheService;

/**
 * Quick start factory functions
 */

/**
 * Create memory cache instance
 */
export async function createMemoryCache(
  options?: Partial<CacheConfig>
): Promise<CacheService> {
  const { createCacheService } = await import('./service');
  return createCacheService({
    adapter: 'memory',
    ...options,
  });
}

/**
 * Create Redis cache instance
 */
export async function createRedisCache(
  redisConfig: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
  },
  options?: Partial<CacheConfig>
): Promise<CacheService> {
  const { createCacheService } = await import('./service');
  return createCacheService({
    adapter: 'redis',
    redis: redisConfig,
    ...options,
  });
}

/**
 * Create Memcached cache instance
 */
export async function createMemcachedCache(
  servers: string[],
  options?: Partial<CacheConfig>
): Promise<CacheService> {
  const { createCacheService } = await import('./service');
  return createCacheService({
    adapter: 'memcached',
    memcached: { servers },
    ...options,
  });
}

/**
 * Capsule metadata for Capsulas Framework
 */
export const cacheCapsule = {
  id: 'cache',
  name: 'Cache',
  description: 'High-performance caching with multiple backend support',
  icon: '⊕',
  category: 'data',
  version: '1.0.0',

  // Capsule inputs
  inputs: [
    {
      id: 'operation',
      name: 'Operation',
      type: 'string',
      required: true,
      description: 'Cache operation: get, set, delete, clear, keys',
    },
    {
      id: 'key',
      name: 'Key',
      type: 'string',
      required: false,
      description: 'Cache key',
    },
    {
      id: 'value',
      name: 'Value',
      type: 'any',
      required: false,
      description: 'Value to cache',
    },
    {
      id: 'ttl',
      name: 'TTL (seconds)',
      type: 'number',
      required: false,
      description: 'Time to live in seconds',
    },
    {
      id: 'pattern',
      name: 'Pattern',
      type: 'string',
      required: false,
      description: 'Key pattern for bulk operations',
    },
  ],

  // Capsule outputs
  outputs: [
    {
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Operation success status',
    },
    {
      id: 'value',
      name: 'Value',
      type: 'any',
      description: 'Retrieved value',
    },
    {
      id: 'cached',
      name: 'Cached',
      type: 'boolean',
      description: 'Whether value was cached',
    },
    {
      id: 'stats',
      name: 'Statistics',
      type: 'object',
      description: 'Cache statistics',
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if failed',
    },
  ],

  // Configuration schema
  configSchema: {
    adapter: {
      type: 'string',
      required: true,
      enum: ['memory', 'redis', 'memcached'],
      default: 'memory',
      description: 'Cache adapter type',
    },
    ttl: {
      type: 'number',
      required: false,
      default: 3600,
      description: 'Default TTL in seconds (0 = never expire)',
    },
    maxSize: {
      type: 'number',
      required: false,
      default: 104857600, // 100 MB
      description: 'Maximum cache size in bytes',
    },
    maxEntries: {
      type: 'number',
      required: false,
      default: 10000,
      description: 'Maximum number of cache entries',
    },
    evictionStrategy: {
      type: 'string',
      required: false,
      enum: ['lru', 'lfu', 'fifo'],
      default: 'lru',
      description: 'Eviction strategy',
    },
    prefix: {
      type: 'string',
      required: false,
      default: '',
      description: 'Key prefix for namespacing',
    },
    compression: {
      type: 'boolean',
      required: false,
      default: false,
      description: 'Enable compression for large values',
    },
    compressionThreshold: {
      type: 'number',
      required: false,
      default: 1024,
      description: 'Minimum size in bytes to compress',
    },
  },

  // Usage examples
  examples: [
    {
      name: 'Memory Cache - Basic Usage',
      description: 'Simple in-memory caching',
      code: `
import { createMemoryCache, TTL } from '@capsulas/capsules/cache';

// Create memory cache
const cache = await createMemoryCache({
  maxEntries: 1000,
  ttl: TTL.ONE_HOUR,
  evictionStrategy: 'lru'
});

// Set value
await cache.set('user:123', {
  id: 123,
  name: 'John Doe',
  email: 'john@example.com'
});

// Get value
const result = await cache.get('user:123');
console.log(result.value); // { id: 123, name: 'John Doe', ... }

// Get or set pattern
const user = await cache.getOrSet('user:456', async () => {
  return await fetchUserFromDB(456);
}, TTL.FIVE_MINUTES);

// Cleanup
await cache.cleanup();
      `,
    },
    {
      name: 'Redis Cache - Production Setup',
      description: 'Redis cache for distributed systems',
      code: `
import { createRedisCache, TTL } from '@capsulas/capsules/cache';

// Create Redis cache
const cache = await createRedisCache(
  {
    host: process.env.REDIS_HOST || 'localhost',
    port: 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0
  },
  {
    prefix: 'myapp',
    ttl: TTL.ONE_HOUR,
    compression: true,
    compressionThreshold: 1024
  }
);

// Cache API responses
const data = await cache.remember(
  'api:users:list',
  TTL.TEN_MINUTES,
  async () => {
    return await fetch('https://api.example.com/users').then(r => r.json());
  }
);

// Batch operations
await cache.setMany([
  { key: 'user:1', value: { name: 'Alice' }, ttl: TTL.ONE_HOUR },
  { key: 'user:2', value: { name: 'Bob' }, ttl: TTL.ONE_HOUR },
  { key: 'user:3', value: { name: 'Charlie' }, ttl: TTL.ONE_HOUR },
]);

// Get statistics
const stats = cache.getStats();
console.log(\`Hit rate: \${(stats.hitRate * 100).toFixed(2)}%\`);
      `,
    },
    {
      name: 'Function Wrapping',
      description: 'Automatically cache function results',
      code: `
import { createMemoryCache, TTL } from '@capsulas/capsules/cache';

const cache = await createMemoryCache();

// Expensive function
async function fetchUserData(userId: number) {
  console.log('Fetching from database...');
  // Simulate expensive DB query
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: userId, name: \`User \${userId}\` };
}

// Wrap function with caching
const cachedFetchUserData = cache.wrap(fetchUserData, {
  keyPrefix: 'user-data',
  ttl: TTL.FIVE_MINUTES,
  keyGenerator: (userId) => \`user:\${userId}\`
});

// First call - hits database
const user1 = await cachedFetchUserData(123); // Fetching from database...

// Second call - uses cache
const user2 = await cachedFetchUserData(123); // Instant!

console.log(user1 === user2); // false (different objects)
console.log(JSON.stringify(user1) === JSON.stringify(user2)); // true
      `,
    },
    {
      name: 'Cache Patterns - Advanced',
      description: 'Advanced caching patterns and techniques',
      code: `
import { createMemoryCache, TTL } from '@capsulas/capsules/cache';

const cache = await createMemoryCache();

// 1. Cache-aside pattern
async function getUser(id: number) {
  return await cache.getOrSet(\`user:\${id}\`, async () => {
    return await db.users.findById(id);
  }, TTL.ONE_HOUR);
}

// 2. Write-through pattern
async function updateUser(id: number, data: any) {
  const user = await db.users.update(id, data);
  await cache.set(\`user:\${id}\`, user, TTL.ONE_HOUR);
  return user;
}

// 3. Refresh-ahead pattern
async function getUserWithRefresh(id: number) {
  const result = await cache.get(\`user:\${id}\`);

  // If TTL is low, refresh in background
  if (result.success && result.value) {
    // Check if TTL < 10% remaining (implement getRemainingTTL)
    // If yes, refresh in background without blocking
    return result.value;
  }

  return await getUser(id);
}

// 4. Increment/Decrement for counters
await cache.set('page:views', 0);
await cache.increment('page:views'); // 1
await cache.increment('page:views', 10); // 11
await cache.decrement('page:views', 5); // 6

// 5. Pattern-based deletion
await cache.set('user:123:profile', { ... });
await cache.set('user:123:settings', { ... });
await cache.set('user:123:permissions', { ... });

// Delete all user:123 keys
await cache.deletePattern('user:123:*');
      `,
    },
    {
      name: 'Statistics and Monitoring',
      description: 'Monitor cache performance',
      code: `
import { createMemoryCache, generateStatsSummary } from '@capsulas/capsules/cache';

const cache = await createMemoryCache({
  maxEntries: 10000,
  maxSize: 100 * 1024 * 1024 // 100 MB
});

// Perform operations
await cache.set('key1', 'value1');
await cache.get('key1'); // hit
await cache.get('key2'); // miss

// Get detailed statistics
const stats = cache.getStats();
console.log(generateStatsSummary(stats));

// Output:
// Cache Statistics:
//   - Hit Rate: 50.00%
//   - Total Gets: 2
//   - Hits: 1
//   - Misses: 1
//   - Total Sets: 1
//   - Total Deletes: 0
//   - Entries: 1
//   - Size: 6 B
//   - Evictions: 0
//   - Uptime: 5s

// Health check
const health = await cache.healthCheck();
console.log(health);
// {
//   healthy: true,
//   adapter: 'memory',
//   uptime: 5000,
//   stats: { ... }
// }

// Monitor hit rate over time
setInterval(() => {
  const stats = cache.getStats();
  if (stats.hitRate < 0.5) {
    console.warn('Cache hit rate below 50%! Consider adjusting TTL or size.');
  }
}, 60000); // Every minute
      `,
    },
  ],

  // Environment variables
  environmentVariables: [
    {
      name: 'REDIS_HOST',
      description: 'Redis server hostname',
      required: false,
      default: 'localhost',
    },
    {
      name: 'REDIS_PORT',
      description: 'Redis server port',
      required: false,
      default: '6379',
    },
    {
      name: 'REDIS_PASSWORD',
      description: 'Redis authentication password',
      required: false,
      secret: true,
    },
    {
      name: 'MEMCACHED_SERVERS',
      description: 'Comma-separated list of Memcached servers',
      required: false,
      example: 'localhost:11211,server2:11211',
    },
  ],

  // Tags for discovery
  tags: ['cache', 'redis', 'memcached', 'memory', 'performance', 'storage'],

  // Links
  links: {
    documentation: 'https://docs.capsulas.dev/capsules/cache',
    github: 'https://github.com/capsulas-framework/capsulas/tree/main/packages/capsules/src/cache',
    npm: 'https://www.npmjs.com/package/@capsulas/capsules',
  },
};
