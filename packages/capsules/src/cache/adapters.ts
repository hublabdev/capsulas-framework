/**
 * Cache Capsule - Adapters
 *
 * Platform-specific cache implementations (Memory, Redis, Memcached)
 */

import type {
  CacheAdapter,
  CacheConfig,
  CacheEntry,
  InternalCacheEntry,
  CacheStats,
} from './types';
import {
  CacheConnectionError,
  CacheTimeoutError,
  CacheKeyNotFoundError,
  CacheFullError,
  CacheAdapterError,
} from './errors';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import {
  serialize,
  deserialize,
  compress,
  decompress,
  shouldCompress,
  isExpired,
  sortByLRU,
  sortByLFU,
  sortByFIFO,
  calculateExpiration,
} from './utils';

/**
 * In-Memory Cache Adapter
 * Implements LRU/LFU/FIFO eviction strategies
 */
export class MemoryAdapter implements CacheAdapter {
  private cache = new Map<string, InternalCacheEntry>();
  private stats: CacheStats = { ...INITIAL_STATS };
  private config: Required<Omit<CacheConfig, 'redis' | 'memcached'>>;
  private cleanupInterval?: NodeJS.Timeout;
  private currentSize = 0;

  constructor(config: CacheConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  async connect(): Promise<void> {
    // Memory adapter is always ready
    this.startCleanupInterval();
  }

  async disconnect(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }

  async get<T = any>(key: string): Promise<T | null> {
    this.stats.totalGets++;

    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check expiration
    if (isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.expirations++;
      this.currentSize -= entry.size;
      return null;
    }

    // Update access tracking
    entry.lastAccessed = Date.now();
    entry.frequency++;

    this.stats.hits++;
    this.updateHitRate();

    // Deserialize value
    let value = entry.value;

    if (entry.compressed && typeof value === 'string') {
      const buffer = Buffer.from(value, 'base64');
      value = await decompress(buffer);
    }

    return deserialize<T>(value, this.config.serializer);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.stats.totalSets++;

    // Serialize value
    let serialized = serialize(value, this.config.serializer);
    let compressed = false;

    // Compress if needed
    if (
      this.config.compression &&
      shouldCompress(serialized, this.config.compressionThreshold)
    ) {
      const buffer = await compress(serialized);
      serialized = buffer.toString('base64');
      compressed = true;
    }

    const size = Buffer.byteLength(serialized, 'utf-8');
    const effectiveTtl = ttl ?? this.config.ttl;

    // Check if we need to evict
    while (
      this.cache.size >= this.config.maxEntries ||
      this.currentSize + size > this.config.maxSize
    ) {
      const evicted = await this.evictOne();
      if (!evicted) {
        throw new CacheFullError('Cache is full and eviction failed', {
          maxEntries: this.config.maxEntries,
          maxSize: this.config.maxSize,
          currentSize: this.currentSize,
        });
      }
    }

    const entry: InternalCacheEntry = {
      key,
      value: serialized,
      size,
      compressed,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: calculateExpiration(effectiveTtl),
      frequency: 1,
      tags: [],
    };

    // Update size tracking
    const existing = this.cache.get(key);
    if (existing) {
      this.currentSize -= existing.size;
    }

    this.cache.set(key, entry);
    this.currentSize += size;
    this.stats.entries = this.cache.size;
    this.stats.size = this.currentSize;
  }

  async delete(key: string): Promise<boolean> {
    this.stats.totalDeletes++;

    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    this.cache.delete(key);
    this.currentSize -= entry.size;
    this.stats.entries = this.cache.size;
    this.stats.size = this.currentSize;

    return true;
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (isExpired(entry)) {
      await this.delete(key);
      return false;
    }

    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.currentSize = 0;
    this.stats.entries = 0;
    this.stats.size = 0;
  }

  async keys(pattern?: string): Promise<string[]> {
    const allKeys = Array.from(this.cache.keys());

    if (!pattern) {
      return allKeys;
    }

    // Simple pattern matching (supports * wildcard)
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );

    return allKeys.filter((key) => regex.test(key));
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Evict one entry based on strategy
   */
  private async evictOne(): Promise<boolean> {
    if (this.cache.size === 0) {
      return false;
    }

    const entries = Array.from(this.cache.values());
    let toEvict: InternalCacheEntry | undefined;

    switch (this.config.evictionStrategy) {
      case 'lru':
        toEvict = sortByLRU(entries)[0];
        break;
      case 'lfu':
        toEvict = sortByLFU(entries)[0];
        break;
      case 'fifo':
        toEvict = sortByFIFO(entries)[0];
        break;
    }

    if (!toEvict) {
      return false;
    }

    await this.delete(toEvict.key);
    this.stats.evictions++;

    return true;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Every minute
  }

  /**
   * Remove all expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now >= entry.expiresAt) {
        this.cache.delete(key);
        this.currentSize -= entry.size;
        removed++;
      }
    }

    if (removed > 0) {
      this.stats.expirations += removed;
      this.stats.entries = this.cache.size;
      this.stats.size = this.currentSize;
    }
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * Redis Cache Adapter
 * Uses ioredis for Redis connection
 */
export class RedisAdapter implements CacheAdapter {
  private client: any; // Redis client (dynamic import)
  private config: CacheConfig;
  private stats: CacheStats = { ...INITIAL_STATS };
  private connected = false;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // Dynamic import of ioredis
      const Redis = (await import('ioredis')).default;

      this.client = new Redis({
        host: this.config.redis?.host || 'localhost',
        port: this.config.redis?.port || 6379,
        password: this.config.redis?.password,
        db: this.config.redis?.db || 0,
        connectTimeout: this.config.redis?.connectionTimeout || 5000,
        retryStrategy: (times: number) => {
          if (times > 3) {
            return null; // Stop retrying
          }
          return Math.min(times * 100, 2000);
        },
      });

      await this.client.ping();
      this.connected = true;
    } catch (error: any) {
      throw new CacheConnectionError('Failed to connect to Redis', {
        error: error.message,
        config: this.config.redis,
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    this.ensureConnected();
    this.stats.totalGets++;

    try {
      const prefixedKey = this.getPrefixedKey(key);
      const value = await this.client.get(prefixedKey);

      if (!value) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();

      // Redis stores as string, deserialize
      return deserialize<T>(value, this.config.serializer || 'json');
    } catch (error: any) {
      throw new CacheAdapterError('Redis GET failed', {
        key,
        error: error.message,
      });
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.ensureConnected();
    this.stats.totalSets++;

    try {
      const prefixedKey = this.getPrefixedKey(key);
      const serialized = serialize(value, this.config.serializer || 'json');
      const effectiveTtl = ttl ?? this.config.ttl ?? 3600;

      if (effectiveTtl === 0) {
        // No expiration
        await this.client.set(prefixedKey, serialized);
      } else {
        // Set with expiration
        await this.client.setex(prefixedKey, effectiveTtl, serialized);
      }

      this.stats.entries++;
    } catch (error: any) {
      throw new CacheAdapterError('Redis SET failed', {
        key,
        error: error.message,
      });
    }
  }

  async delete(key: string): Promise<boolean> {
    this.ensureConnected();
    this.stats.totalDeletes++;

    try {
      const prefixedKey = this.getPrefixedKey(key);
      const result = await this.client.del(prefixedKey);
      return result > 0;
    } catch (error: any) {
      throw new CacheAdapterError('Redis DELETE failed', {
        key,
        error: error.message,
      });
    }
  }

  async has(key: string): Promise<boolean> {
    this.ensureConnected();

    try {
      const prefixedKey = this.getPrefixedKey(key);
      const exists = await this.client.exists(prefixedKey);
      return exists === 1;
    } catch (error: any) {
      throw new CacheAdapterError('Redis EXISTS failed', {
        key,
        error: error.message,
      });
    }
  }

  async clear(): Promise<void> {
    this.ensureConnected();

    try {
      if (this.config.prefix) {
        // Delete keys with prefix
        const pattern = `${this.config.prefix}:*`;
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } else {
        // Flush entire database
        await this.client.flushdb();
      }
    } catch (error: any) {
      throw new CacheAdapterError('Redis CLEAR failed', {
        error: error.message,
      });
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    this.ensureConnected();

    try {
      const searchPattern = pattern
        ? `${this.config.prefix || ''}:${pattern}`
        : `${this.config.prefix || ''}:*`;

      const keys = await this.client.keys(searchPattern);

      // Remove prefix from keys
      if (this.config.prefix) {
        return keys.map((key: string) =>
          key.replace(`${this.config.prefix}:`, '')
        );
      }

      return keys;
    } catch (error: any) {
      throw new CacheAdapterError('Redis KEYS failed', {
        error: error.message,
      });
    }
  }

  async size(): Promise<number> {
    this.ensureConnected();

    try {
      return await this.client.dbsize();
    } catch (error: any) {
      throw new CacheAdapterError('Redis DBSIZE failed', {
        error: error.message,
      });
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private ensureConnected(): void {
    if (!this.connected || !this.client) {
      throw new CacheConnectionError('Redis client not connected');
    }
  }

  private getPrefixedKey(key: string): string {
    return this.config.prefix ? `${this.config.prefix}:${key}` : key;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * Memcached Cache Adapter
 * Uses memcached client
 */
export class MemcachedAdapter implements CacheAdapter {
  private client: any; // Memcached client (dynamic import)
  private config: CacheConfig;
  private stats: CacheStats = { ...INITIAL_STATS };
  private connected = false;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      // Dynamic import of memcached
      const Memcached = (await import('memcached')).default;

      const servers =
        this.config.memcached?.servers || ['localhost:11211'];

      this.client = new Memcached(servers, {
        maxConnections: this.config.memcached?.options?.maxConnections || 10,
        retries: this.config.memcached?.options?.retries || 3,
        timeout: this.config.memcached?.options?.timeout || 5000,
      });

      // Test connection
      await new Promise<void>((resolve, reject) => {
        this.client.version((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      this.connected = true;
    } catch (error: any) {
      throw new CacheConnectionError('Failed to connect to Memcached', {
        error: error.message,
        config: this.config.memcached,
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.end();
      this.connected = false;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    this.ensureConnected();
    this.stats.totalGets++;

    return new Promise((resolve, reject) => {
      const prefixedKey = this.getPrefixedKey(key);

      this.client.get(prefixedKey, (err: any, data: any) => {
        if (err) {
          reject(
            new CacheAdapterError('Memcached GET failed', {
              key,
              error: err.message,
            })
          );
          return;
        }

        if (!data) {
          this.stats.misses++;
          resolve(null);
          return;
        }

        this.stats.hits++;
        this.updateHitRate();

        try {
          const deserialized = deserialize<T>(
            data,
            this.config.serializer || 'json'
          );
          resolve(deserialized);
        } catch (error: any) {
          reject(error);
        }
      });
    });
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.ensureConnected();
    this.stats.totalSets++;

    return new Promise((resolve, reject) => {
      const prefixedKey = this.getPrefixedKey(key);
      const serialized = serialize(value, this.config.serializer || 'json');
      const effectiveTtl = ttl ?? this.config.ttl ?? 3600;

      this.client.set(
        prefixedKey,
        serialized,
        effectiveTtl,
        (err: any) => {
          if (err) {
            reject(
              new CacheAdapterError('Memcached SET failed', {
                key,
                error: err.message,
              })
            );
          } else {
            this.stats.entries++;
            resolve();
          }
        }
      );
    });
  }

  async delete(key: string): Promise<boolean> {
    this.ensureConnected();
    this.stats.totalDeletes++;

    return new Promise((resolve, reject) => {
      const prefixedKey = this.getPrefixedKey(key);

      this.client.del(prefixedKey, (err: any, result: boolean) => {
        if (err) {
          reject(
            new CacheAdapterError('Memcached DELETE failed', {
              key,
              error: err.message,
            })
          );
        } else {
          resolve(result);
        }
      });
    });
  }

  async has(key: string): Promise<boolean> {
    // Memcached doesn't have EXISTS, use GET
    const value = await this.get(key);
    return value !== null;
  }

  async clear(): Promise<void> {
    this.ensureConnected();

    return new Promise((resolve, reject) => {
      this.client.flush((err: any) => {
        if (err) {
          reject(
            new CacheAdapterError('Memcached FLUSH failed', {
              error: err.message,
            })
          );
        } else {
          resolve();
        }
      });
    });
  }

  async keys(pattern?: string): Promise<string[]> {
    // Memcached doesn't support key listing
    throw new CacheAdapterError(
      'Memcached does not support key listing',
      {
        operation: 'keys',
      }
    );
  }

  async size(): Promise<number> {
    // Memcached doesn't provide size info easily
    return this.stats.entries;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private ensureConnected(): void {
    if (!this.connected || !this.client) {
      throw new CacheConnectionError('Memcached client not connected');
    }
  }

  private getPrefixedKey(key: string): string {
    return this.config.prefix ? `${this.config.prefix}:${key}` : key;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * Create cache adapter based on configuration
 */
export function createAdapter(config: CacheConfig): CacheAdapter {
  switch (config.adapter) {
    case 'memory':
      return new MemoryAdapter(config);
    case 'redis':
      return new RedisAdapter(config);
    case 'memcached':
      return new MemcachedAdapter(config);
    default:
      throw new CacheAdapterError(
        `Unsupported cache adapter: ${config.adapter}`,
        { adapter: config.adapter }
      );
  }
}
