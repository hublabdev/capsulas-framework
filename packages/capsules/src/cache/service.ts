/**
 * Cache Capsule - Service
 *
 * Main CacheService class with lifecycle methods
 */

import type {
  CacheConfig,
  CacheAdapter,
  CacheStats,
  CacheEntry,
  CacheResult,
} from './types';
import { createAdapter } from './adapters';
import {
  CacheInitializationError,
  CacheOperationError,
  CacheKeyNotFoundError,
  CacheInvalidTTLError,
} from './errors';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import {
  generateKey,
  validateKey,
  validateTTL,
  getRemainingTTL,
  matchPattern,
} from './utils';

/**
 * Cache Service
 * Main service class implementing cache operations
 */
export class CacheService {
  private adapter: CacheAdapter | null = null;
  private config: CacheConfig;
  private initialized = false;
  private startTime = 0;

  constructor(config: CacheConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Initialize cache service
   * Sets up adapter connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new CacheInitializationError('Cache service already initialized');
    }

    try {
      this.adapter = createAdapter(this.config);
      await this.adapter.connect();
      this.startTime = Date.now();
      this.initialized = true;
    } catch (error: any) {
      throw new CacheInitializationError(
        'Failed to initialize cache service',
        {
          adapter: this.config.adapter,
          error: error.message,
        }
      );
    }
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<CacheResult<T>> {
    this.ensureInitialized();

    if (!validateKey(key)) {
      throw new CacheOperationError('Invalid cache key', { key });
    }

    try {
      const fullKey = generateKey(key, this.config.prefix);
      const value = await this.adapter!.get<T>(fullKey);

      if (value === null) {
        return {
          success: false,
          value: null,
          cached: false,
          error: 'Key not found',
        };
      }

      return {
        success: true,
        value,
        cached: true,
      };
    } catch (error: any) {
      return {
        success: false,
        value: null,
        cached: false,
        error: error.message,
      };
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<CacheResult<void>> {
    this.ensureInitialized();

    if (!validateKey(key)) {
      throw new CacheOperationError('Invalid cache key', { key });
    }

    if (ttl !== undefined && !validateTTL(ttl)) {
      throw new CacheInvalidTTLError('Invalid TTL value', { ttl });
    }

    try {
      const fullKey = generateKey(key, this.config.prefix);
      await this.adapter!.set(fullKey, value, ttl);

      return {
        success: true,
        value: undefined,
        cached: true,
      };
    } catch (error: any) {
      return {
        success: false,
        value: undefined,
        cached: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<CacheResult<boolean>> {
    this.ensureInitialized();

    if (!validateKey(key)) {
      throw new CacheOperationError('Invalid cache key', { key });
    }

    try {
      const fullKey = generateKey(key, this.config.prefix);
      const deleted = await this.adapter!.delete(fullKey);

      return {
        success: true,
        value: deleted,
        cached: false,
      };
    } catch (error: any) {
      return {
        success: false,
        value: false,
        cached: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    this.ensureInitialized();

    if (!validateKey(key)) {
      return false;
    }

    try {
      const fullKey = generateKey(key, this.config.prefix);
      return await this.adapter!.has(fullKey);
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Get multiple keys at once
   */
  async getMany<T = any>(keys: string[]): Promise<Map<string, T | null>> {
    this.ensureInitialized();

    const results = new Map<string, T | null>();

    await Promise.all(
      keys.map(async (key) => {
        const result = await this.get<T>(key);
        results.set(key, result.value);
      })
    );

    return results;
  }

  /**
   * Set multiple keys at once
   */
  async setMany(
    entries: Array<{ key: string; value: any; ttl?: number }>
  ): Promise<void> {
    this.ensureInitialized();

    await Promise.all(
      entries.map((entry) => this.set(entry.key, entry.value, entry.ttl))
    );
  }

  /**
   * Delete multiple keys at once
   */
  async deleteMany(keys: string[]): Promise<number> {
    this.ensureInitialized();

    const results = await Promise.all(keys.map((key) => this.delete(key)));

    return results.filter((r) => r.value === true).length;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.ensureInitialized();

    try {
      await this.adapter!.clear();
    } catch (error: any) {
      throw new CacheOperationError('Failed to clear cache', {
        error: error.message,
      });
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern?: string): Promise<string[]> {
    this.ensureInitialized();

    try {
      const allKeys = await this.adapter!.keys(pattern);

      // Remove prefix if present
      if (this.config.prefix) {
        return allKeys.map((key) =>
          key.replace(new RegExp(`^${this.config.prefix}:`), '')
        );
      }

      return allKeys;
    } catch (error: any) {
      throw new CacheOperationError('Failed to get keys', {
        pattern,
        error: error.message,
      });
    }
  }

  /**
   * Get cache size (number of entries)
   */
  async size(): Promise<number> {
    this.ensureInitialized();

    try {
      return await this.adapter!.size();
    } catch (error: any) {
      throw new CacheOperationError('Failed to get cache size', {
        error: error.message,
      });
    }
  }

  /**
   * Get or set pattern (cache-aside)
   * If key exists, return value
   * Otherwise, call factory function, cache result, and return
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    this.ensureInitialized();

    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached.success && cached.value !== null) {
      return cached.value;
    }

    // Not in cache, call factory
    const value = await factory();

    // Store in cache
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Refresh TTL for a key without changing value
   */
  async touch(key: string, ttl?: number): Promise<boolean> {
    this.ensureInitialized();

    try {
      // Get current value
      const result = await this.get(key);
      if (!result.success || result.value === null) {
        return false;
      }

      // Re-set with new TTL
      await this.set(key, result.value, ttl);
      return true;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Increment numeric value
   */
  async increment(key: string, delta: number = 1): Promise<number> {
    this.ensureInitialized();

    const result = await this.get<number>(key);
    const current = result.success && result.value !== null ? result.value : 0;
    const newValue = current + delta;

    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement numeric value
   */
  async decrement(key: string, delta: number = 1): Promise<number> {
    return this.increment(key, -delta);
  }

  /**
   * Delete keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    this.ensureInitialized();

    const keys = await this.keys(pattern);
    return await this.deleteMany(keys);
  }

  /**
   * Wrap a function with caching
   * Automatically caches function results based on arguments
   */
  wrap<T extends (...args: any[]) => any>(
    fn: T,
    options?: {
      keyPrefix?: string;
      ttl?: number;
      keyGenerator?: (...args: Parameters<T>) => string;
    }
  ): T {
    const keyPrefix = options?.keyPrefix || fn.name || 'wrapped';
    const ttl = options?.ttl;
    const keyGenerator =
      options?.keyGenerator ||
      ((...args: any[]) => {
        return `${keyPrefix}:${JSON.stringify(args)}`;
      });

    return (async (...args: Parameters<T>) => {
      const cacheKey = keyGenerator(...args);

      return await this.getOrSet(
        cacheKey,
        async () => {
          return await fn(...args);
        },
        ttl
      );
    }) as T;
  }

  /**
   * Remember value for duration
   * Simplified version of getOrSet
   */
  async remember<T>(
    key: string,
    ttl: number,
    factory: () => Promise<T> | T
  ): Promise<T> {
    return this.getOrSet(key, factory, ttl);
  }

  /**
   * Remember value forever (no expiration)
   */
  async rememberForever<T>(
    key: string,
    factory: () => Promise<T> | T
  ): Promise<T> {
    return this.getOrSet(key, factory, 0);
  }

  /**
   * Flush cache and reinitialize
   */
  async flush(): Promise<void> {
    this.ensureInitialized();
    await this.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    if (!this.initialized || !this.adapter) {
      return {
        ...INITIAL_STATS,
        uptime: 0,
      };
    }

    const stats = this.adapter.getStats();
    stats.uptime = Date.now() - this.startTime;

    return stats;
  }

  /**
   * Get cache configuration
   */
  getConfig(): Readonly<CacheConfig> {
    return { ...this.config };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    adapter: string;
    uptime: number;
    stats: CacheStats;
  }> {
    const healthy = this.initialized && this.adapter !== null;
    const stats = this.getStats();

    return {
      healthy,
      adapter: this.config.adapter || 'none',
      uptime: stats.uptime,
      stats,
    };
  }

  /**
   * Cleanup resources and disconnect
   */
  async cleanup(): Promise<void> {
    if (!this.initialized || !this.adapter) {
      return;
    }

    try {
      await this.adapter.disconnect();
      this.adapter = null;
      this.initialized = false;
    } catch (error: any) {
      throw new CacheOperationError('Failed to cleanup cache service', {
        error: error.message,
      });
    }
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.adapter) {
      throw new CacheInitializationError(
        'Cache service not initialized. Call initialize() first.'
      );
    }
  }
}

/**
 * Create and initialize cache service
 */
export async function createCacheService(
  config: CacheConfig
): Promise<CacheService> {
  const service = new CacheService(config);
  await service.initialize();
  return service;
}

/**
 * Create cache service factory
 * Returns a function that creates pre-configured cache instances
 */
export function createCacheFactory(defaultConfig: CacheConfig) {
  return async (overrides?: Partial<CacheConfig>): Promise<CacheService> => {
    const config = { ...defaultConfig, ...overrides };
    return await createCacheService(config);
  };
}
