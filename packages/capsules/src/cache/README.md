# Cache Capsule

**High-performance caching with multiple backend support (Memory, Redis, Memcached)**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Capsulas Framework](https://img.shields.io/badge/Capsulas-Cache-orange)](https://capsulas.dev)

---

## Features

✅ **Multiple Adapters**
- In-Memory cache with LRU/LFU/FIFO eviction
- Redis with connection pooling
- Memcached with multi-server support

✅ **Smart Caching**
- Automatic serialization (JSON, msgpack)
- Compression for large values (gzip)
- TTL-based expiration
- Pattern-based operations

✅ **Production Ready**
- Type-safe API with TypeScript
- Comprehensive error handling (12 error types)
- Statistics and monitoring
- Health checks

✅ **Advanced Patterns**
- Cache-aside (lazy loading)
- Write-through
- Function wrapping
- Batch operations

✅ **Performance**
- Zero-copy operations where possible
- Efficient memory management
- Automatic cleanup of expired entries
- Configurable eviction strategies

---

## Installation

```bash
npm install @capsulas/capsules
```

### Optional Dependencies

For Redis support:
```bash
npm install ioredis
```

For Memcached support:
```bash
npm install memcached
```

---

## Quick Start

### 1. Memory Cache (Default)

```typescript
import { createMemoryCache, TTL } from '@capsulas/capsules/cache';

// Create cache instance
const cache = await createMemoryCache({
  maxEntries: 1000,
  maxSize: 100 * 1024 * 1024, // 100 MB
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
console.log(result.value); // { id: 123, ... }

// Cleanup
await cache.cleanup();
```

### 2. Redis Cache

```typescript
import { createRedisCache, TTL } from '@capsulas/capsules/cache';

const cache = await createRedisCache(
  {
    host: 'localhost',
    port: 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0
  },
  {
    prefix: 'myapp',
    ttl: TTL.ONE_HOUR,
    compression: true
  }
);

// Use same API as memory cache
await cache.set('key', 'value', TTL.TEN_MINUTES);
const result = await cache.get('key');
```

### 3. Memcached Cache

```typescript
import { createMemcachedCache, TTL } from '@capsulas/capsules/cache';

const cache = await createMemcachedCache(
  ['localhost:11211', 'server2:11211'],
  {
    prefix: 'myapp',
    ttl: TTL.ONE_HOUR
  }
);

await cache.set('key', 'value');
```

---

## Core API

### Basic Operations

```typescript
// Set with TTL
await cache.set('key', value, TTL.FIVE_MINUTES);

// Get
const result = await cache.get('key');
if (result.success) {
  console.log(result.value);
}

// Delete
await cache.delete('key');

// Check existence
const exists = await cache.has('key');

// Clear all
await cache.clear();

// Get all keys
const keys = await cache.keys();

// Get keys by pattern
const userKeys = await cache.keys('user:*');

// Get cache size
const size = await cache.size();
```

### Advanced Operations

```typescript
// Get or set (cache-aside pattern)
const user = await cache.getOrSet('user:123', async () => {
  return await fetchUserFromDB(123);
}, TTL.ONE_HOUR);

// Batch operations
await cache.setMany([
  { key: 'key1', value: 'value1', ttl: TTL.ONE_HOUR },
  { key: 'key2', value: 'value2', ttl: TTL.ONE_DAY },
]);

const values = await cache.getMany(['key1', 'key2']);
await cache.deleteMany(['key1', 'key2']);

// Pattern-based deletion
await cache.deletePattern('user:*');

// Touch (refresh TTL)
await cache.touch('key', TTL.ONE_HOUR);

// Increment/Decrement
await cache.set('counter', 0);
await cache.increment('counter'); // 1
await cache.increment('counter', 5); // 6
await cache.decrement('counter'); // 5

// Remember patterns
const data = await cache.remember('expensive-key', TTL.TEN_MINUTES, async () => {
  return await expensiveOperation();
});

const permanent = await cache.rememberForever('static-data', async () => {
  return await loadStaticData();
});
```

---

## Function Wrapping

Automatically cache function results based on arguments:

```typescript
import { createMemoryCache, TTL } from '@capsulas/capsules/cache';

const cache = await createMemoryCache();

// Original expensive function
async function fetchUserData(userId: number) {
  console.log('Fetching from database...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: userId, name: `User ${userId}` };
}

// Wrap with caching
const cachedFetchUserData = cache.wrap(fetchUserData, {
  keyPrefix: 'user-data',
  ttl: TTL.FIVE_MINUTES,
  keyGenerator: (userId) => `user:${userId}`
});

// First call - hits database
await cachedFetchUserData(123); // "Fetching from database..."

// Subsequent calls - instant from cache
await cachedFetchUserData(123); // Instant!
await cachedFetchUserData(123); // Instant!

// Different argument - new cache entry
await cachedFetchUserData(456); // "Fetching from database..."
```

---

## Configuration

### Memory Cache Options

```typescript
const cache = await createMemoryCache({
  maxEntries: 10000,           // Maximum number of entries
  maxSize: 100 * 1024 * 1024,  // Maximum size in bytes (100 MB)
  ttl: 3600,                   // Default TTL in seconds
  evictionStrategy: 'lru',     // 'lru' | 'lfu' | 'fifo'
  prefix: 'myapp',             // Key prefix for namespacing
  serializer: 'json',          // 'json' | 'msgpack' | 'none'
  compression: true,           // Enable compression
  compressionThreshold: 1024,  // Min size to compress (1 KB)
});
```

### Redis Options

```typescript
const cache = await createRedisCache(
  {
    host: 'localhost',
    port: 6379,
    password: 'secret',
    db: 0,
    connectionTimeout: 5000,
    tls: false,
    username: 'default',
    family: 4,
  },
  {
    // ... same options as memory cache
  }
);
```

### Memcached Options

```typescript
const cache = await createMemcachedCache(
  ['server1:11211', 'server2:11211'],
  {
    // ... same options as memory cache
  }
);
```

---

## Eviction Strategies

### LRU (Least Recently Used) - Default

Evicts entries that haven't been accessed recently.

```typescript
const cache = await createMemoryCache({
  maxEntries: 1000,
  evictionStrategy: 'lru'
});
```

**Best for:** General-purpose caching, web requests, API responses

### LFU (Least Frequently Used)

Evicts entries with lowest access frequency.

```typescript
const cache = await createMemoryCache({
  maxEntries: 1000,
  evictionStrategy: 'lfu'
});
```

**Best for:** Popular content caching, hot data

### FIFO (First In First Out)

Evicts oldest entries first.

```typescript
const cache = await createMemoryCache({
  maxEntries: 1000,
  evictionStrategy: 'fifo'
});
```

**Best for:** Time-series data, logs, streams

---

## Compression

Automatically compress large values to save memory:

```typescript
const cache = await createMemoryCache({
  compression: true,
  compressionThreshold: 1024, // Compress values >= 1 KB
});

// Large object will be compressed automatically
await cache.set('large-data', {
  // ... large object > 1 KB
});

// Transparent decompression on get
const result = await cache.get('large-data');
```

**Benefits:**
- Reduces memory usage by 50-90% for text data
- Automatic compression/decompression
- Configurable threshold

---

## Statistics and Monitoring

### Get Statistics

```typescript
const stats = cache.getStats();
console.log(stats);

// Output:
// {
//   totalGets: 1500,
//   hits: 1200,
//   misses: 300,
//   hitRate: 0.8,          // 80% hit rate
//   totalSets: 500,
//   totalDeletes: 50,
//   entries: 450,
//   size: 5242880,         // 5 MB
//   evictions: 20,
//   expirations: 100,
//   uptime: 3600000        // 1 hour
// }
```

### Formatted Summary

```typescript
import { generateStatsSummary } from '@capsulas/capsules/cache';

const stats = cache.getStats();
console.log(generateStatsSummary(stats));

// Output:
// Cache Statistics:
//   - Hit Rate: 80.00%
//   - Total Gets: 1500
//   - Hits: 1200
//   - Misses: 300
//   - Total Sets: 500
//   - Total Deletes: 50
//   - Entries: 450
//   - Size: 5.00 MB
//   - Evictions: 20
//   - Uptime: 1h
```

### Health Check

```typescript
const health = await cache.healthCheck();
console.log(health);

// Output:
// {
//   healthy: true,
//   adapter: 'memory',
//   uptime: 3600000,
//   stats: { ... }
// }
```

### Monitoring Hit Rate

```typescript
// Alert if hit rate drops below 50%
setInterval(() => {
  const stats = cache.getStats();

  if (stats.hitRate < 0.5) {
    console.warn(`⚠️ Cache hit rate low: ${(stats.hitRate * 100).toFixed(2)}%`);
    // Consider: increase TTL, cache size, or review caching strategy
  }

  if (stats.hitRate > 0.8) {
    console.log(`✅ Cache performing well: ${(stats.hitRate * 100).toFixed(2)}%`);
  }
}, 60000); // Every minute
```

---

## Caching Patterns

### 1. Cache-Aside (Lazy Loading)

Most common pattern. Load from cache, fallback to source if missing.

```typescript
async function getUser(id: number) {
  // Try cache first
  const cached = await cache.get(`user:${id}`);
  if (cached.success) {
    return cached.value;
  }

  // Cache miss - load from database
  const user = await db.users.findById(id);

  // Store in cache
  await cache.set(`user:${id}`, user, TTL.ONE_HOUR);

  return user;
}

// Simplified with getOrSet
async function getUser(id: number) {
  return await cache.getOrSet(`user:${id}`, async () => {
    return await db.users.findById(id);
  }, TTL.ONE_HOUR);
}
```

### 2. Write-Through

Update cache whenever data is written.

```typescript
async function updateUser(id: number, data: any) {
  // Update database
  const user = await db.users.update(id, data);

  // Update cache
  await cache.set(`user:${id}`, user, TTL.ONE_HOUR);

  return user;
}

async function deleteUser(id: number) {
  // Delete from database
  await db.users.delete(id);

  // Invalidate cache
  await cache.delete(`user:${id}`);
}
```

### 3. Write-Behind (Write-Back)

Write to cache immediately, sync to database asynchronously.

```typescript
async function updateUser(id: number, data: any) {
  // Update cache immediately
  const user = { id, ...data };
  await cache.set(`user:${id}`, user, TTL.ONE_HOUR);

  // Queue database update (don't await)
  queueDatabaseUpdate(id, data);

  return user;
}

// Separate process handles queue
async function processDatabaseQueue() {
  const updates = await getQueuedUpdates();
  for (const update of updates) {
    await db.users.update(update.id, update.data);
  }
}
```

### 4. Refresh-Ahead

Refresh cache before expiration to avoid cache misses.

```typescript
async function getUserWithRefresh(id: number) {
  const key = `user:${id}`;
  const result = await cache.get(key);

  if (result.success && result.value) {
    // If TTL is low, refresh in background
    const remaining = getRemainingTTL(result.value);

    if (remaining < TTL.ONE_MINUTE) {
      // Refresh asynchronously
      db.users.findById(id).then(user => {
        cache.set(key, user, TTL.ONE_HOUR);
      });
    }

    return result.value;
  }

  // Cache miss - load and cache
  return await cache.getOrSet(key, async () => {
    return await db.users.findById(id);
  }, TTL.ONE_HOUR);
}
```

### 5. Time-Based Invalidation

Auto-expire cache based on time.

```typescript
// Short TTL for frequently changing data
await cache.set('trending:posts', posts, TTL.FIVE_MINUTES);

// Long TTL for static data
await cache.set('config:app', config, TTL.ONE_DAY);

// No expiration for permanent data
await cache.set('translations', i18n, 0); // Never expires
```

### 6. Event-Based Invalidation

Invalidate cache when events occur.

```typescript
// User updated event
eventBus.on('user:updated', async (userId) => {
  await cache.delete(`user:${userId}`);
  await cache.deletePattern(`user:${userId}:*`);
});

// Clear all user caches
eventBus.on('users:bulk-update', async () => {
  await cache.deletePattern('user:*');
});
```

---

## Error Handling

The Cache Capsule provides 12 specialized error types:

```typescript
import {
  CacheError,
  CacheErrorType,
  CacheConnectionError,
  CacheTimeoutError,
  CacheFullError,
  CacheKeyNotFoundError
} from '@capsulas/capsules/cache';

try {
  await cache.set('key', 'value');
} catch (error) {
  if (error instanceof CacheConnectionError) {
    console.error('Connection failed:', error.message);
    // Retry logic or fallback
  }

  if (error instanceof CacheFullError) {
    console.error('Cache full:', error.details);
    // Increase cache size or adjust eviction strategy
  }

  if (error instanceof CacheTimeoutError) {
    console.error('Operation timed out');
    // Retry or use default value
  }
}
```

### All Error Types

1. **CacheConfigurationError** - Invalid configuration
2. **CacheConnectionError** - Connection failed
3. **CacheTimeoutError** - Operation timeout
4. **CacheSerializationError** - Serialization failed
5. **CacheDeserializationError** - Deserialization failed
6. **CacheFullError** - Cache full, eviction failed
7. **CacheKeyNotFoundError** - Key not found
8. **CacheInvalidTTLError** - Invalid TTL value
9. **CacheAdapterError** - Adapter-specific error
10. **CacheCompressionError** - Compression/decompression failed
11. **CacheInitializationError** - Initialization failed
12. **CacheOperationError** - General operation error

---

## Best Practices

### 1. Use Appropriate TTLs

```typescript
const TTL_STRATEGY = {
  // Very dynamic data
  realtime: TTL.ONE_MINUTE,

  // Frequently changing
  dynamic: TTL.FIVE_MINUTES,

  // Occasionally changing
  standard: TTL.ONE_HOUR,

  // Rarely changing
  stable: TTL.ONE_DAY,

  // Static data
  permanent: 0 // Never expire
};
```

### 2. Use Key Prefixes for Namespacing

```typescript
const userCache = await createMemoryCache({ prefix: 'user' });
const productCache = await createMemoryCache({ prefix: 'product' });
const apiCache = await createMemoryCache({ prefix: 'api' });

// Keys are automatically prefixed
await userCache.set('123', userData);    // Stored as 'user:123'
await productCache.set('456', product);  // Stored as 'product:456'
```

### 3. Monitor Performance

```typescript
// Log stats periodically
setInterval(() => {
  const stats = cache.getStats();

  console.log({
    hitRate: `${(stats.hitRate * 100).toFixed(2)}%`,
    entries: stats.entries,
    size: formatBytes(stats.size),
    evictions: stats.evictions
  });
}, 300000); // Every 5 minutes
```

### 4. Handle Cache Failures Gracefully

```typescript
async function getDataWithFallback(key: string) {
  try {
    const result = await cache.get(key);
    if (result.success) {
      return result.value;
    }
  } catch (error) {
    console.warn('Cache error, using fallback:', error);
  }

  // Fallback to source
  return await fetchFromSource(key);
}
```

### 5. Use Compression for Large Data

```typescript
const cache = await createMemoryCache({
  compression: true,
  compressionThreshold: 1024 // 1 KB
});

// Large responses benefit from compression
await cache.set('api:large-response', hugeJSONResponse, TTL.TEN_MINUTES);
```

---

## Performance Benchmarks

### Memory Adapter

- **Set**: ~0.01ms per operation
- **Get**: ~0.005ms per operation (hit)
- **Eviction**: ~1ms for LRU (O(n log n))
- **Memory**: ~100 bytes overhead per entry

### Redis Adapter

- **Set**: ~1-2ms per operation (local network)
- **Get**: ~0.5-1ms per operation (local network)
- **Throughput**: ~50,000 ops/sec (local)
- **Network**: Add network latency

### Memcached Adapter

- **Set**: ~1-2ms per operation (local network)
- **Get**: ~0.5-1ms per operation (local network)
- **Throughput**: ~40,000 ops/sec (local)

---

## Troubleshooting

### High Miss Rate

**Problem:** Hit rate below 50%

**Solutions:**
- Increase TTL for stable data
- Increase cache size (`maxEntries`, `maxSize`)
- Review what you're caching (maybe not cacheable)
- Use more specific keys

### Memory Issues

**Problem:** Cache using too much memory

**Solutions:**
- Enable compression
- Reduce `maxSize` or `maxEntries`
- Use shorter TTLs
- Switch to LRU eviction
- Use Redis/Memcached for larger datasets

### Redis Connection Errors

**Problem:** `CacheConnectionError` when using Redis

**Solutions:**
```typescript
// Check Redis is running
// $ redis-cli ping

// Verify configuration
const cache = await createRedisCache({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  connectionTimeout: 10000 // Increase timeout
});
```

### Stale Data

**Problem:** Getting outdated cached data

**Solutions:**
- Reduce TTL
- Implement event-based invalidation
- Use write-through pattern
- Manual invalidation on updates

---

## API Reference

See [types.ts](./types.ts) for complete type definitions.

### CacheService

Main service class with lifecycle methods.

#### Methods

- `initialize(): Promise<void>` - Initialize service
- `get<T>(key: string): Promise<CacheResult<T>>` - Get value
- `set(key: string, value: any, ttl?: number): Promise<CacheResult<void>>` - Set value
- `delete(key: string): Promise<CacheResult<boolean>>` - Delete key
- `has(key: string): Promise<boolean>` - Check if key exists
- `getMany<T>(keys: string[]): Promise<Map<string, T | null>>` - Get multiple
- `setMany(entries): Promise<void>` - Set multiple
- `deleteMany(keys: string[]): Promise<number>` - Delete multiple
- `clear(): Promise<void>` - Clear all
- `keys(pattern?: string): Promise<string[]>` - Get keys
- `size(): Promise<number>` - Get entry count
- `getOrSet<T>(key, factory, ttl?): Promise<T>` - Get or set pattern
- `touch(key, ttl?): Promise<boolean>` - Refresh TTL
- `increment(key, delta?): Promise<number>` - Increment value
- `decrement(key, delta?): Promise<number>` - Decrement value
- `deletePattern(pattern): Promise<number>` - Delete by pattern
- `wrap<T>(fn, options?): T` - Wrap function with caching
- `remember<T>(key, ttl, factory): Promise<T>` - Remember pattern
- `rememberForever<T>(key, factory): Promise<T>` - Remember without expiration
- `flush(): Promise<void>` - Flush cache
- `getStats(): CacheStats` - Get statistics
- `getConfig(): CacheConfig` - Get configuration
- `healthCheck(): Promise<HealthCheckResult>` - Health check
- `cleanup(): Promise<void>` - Cleanup and disconnect

---

## License

MIT License - see [LICENSE](../../../../../LICENSE) for details.

---

## Links

- **Documentation**: https://docs.capsulas.dev/capsules/cache
- **GitHub**: https://github.com/capsulas-framework/capsulas
- **NPM**: https://www.npmjs.com/package/@capsulas/capsules
- **Discord**: https://discord.gg/capsulas

---

Made with ❤️ by the Capsulas Framework team
