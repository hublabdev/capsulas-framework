/**
 * Cache Capsule - Utility Functions
 *
 * Helper functions for serialization, compression, key generation, and more
 */

import { createHash } from 'crypto';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';
import type { CacheEntry, InternalCacheEntry } from './types';
import { CacheSerializationError, CacheDeserializationError, CacheCompressionError } from './errors';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * Serialize value to string
 */
export function serialize(value: any, format: 'json' | 'msgpack' | 'none' = 'json'): string {
  try {
    if (format === 'none') {
      return String(value);
    }

    if (format === 'json') {
      return JSON.stringify(value);
    }

    // msgpack placeholder (would use msgpack library)
    return JSON.stringify(value);
  } catch (error: any) {
    throw new CacheSerializationError('Failed to serialize value', {
      format,
      error: error.message,
    });
  }
}

/**
 * Deserialize string to value
 */
export function deserialize<T = any>(data: string, format: 'json' | 'msgpack' | 'none' = 'json'): T {
  try {
    if (format === 'none') {
      return data as any;
    }

    if (format === 'json') {
      return JSON.parse(data);
    }

    // msgpack placeholder
    return JSON.parse(data);
  } catch (error: any) {
    throw new CacheDeserializationError('Failed to deserialize value', {
      format,
      error: error.message,
    });
  }
}

/**
 * Compress data
 */
export async function compress(data: string | Buffer): Promise<Buffer> {
  try {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data;
    return await gzipAsync(buffer);
  } catch (error: any) {
    throw new CacheCompressionError('Failed to compress data', {
      error: error.message,
    });
  }
}

/**
 * Decompress data
 */
export async function decompress(data: Buffer): Promise<string> {
  try {
    const decompressed = await gunzipAsync(data);
    return decompressed.toString('utf-8');
  } catch (error: any) {
    throw new CacheCompressionError('Failed to decompress data', {
      error: error.message,
    });
  }
}

/**
 * Generate cache key with prefix
 */
export function generateKey(key: string, prefix?: string): string {
  if (!key) {
    throw new Error('Key cannot be empty');
  }

  const sanitizedKey = sanitizeKey(key);
  return prefix ? `${prefix}:${sanitizedKey}` : sanitizedKey;
}

/**
 * Sanitize cache key (remove invalid characters)
 */
export function sanitizeKey(key: string): string {
  // Remove or replace invalid characters
  return key
    .replace(/[^a-zA-Z0-9:._-]/g, '_')
    .slice(0, 250); // Max key length
}

/**
 * Generate hash key from object
 */
export function hashKey(data: any): string {
  const serialized = JSON.stringify(data);
  return createHash('sha256').update(serialized).digest('hex');
}

/**
 * Calculate size of value in bytes
 */
export function calculateSize(value: any): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'string') {
    return Buffer.byteLength(value, 'utf-8');
  }

  if (Buffer.isBuffer(value)) {
    return value.length;
  }

  // Estimate size for objects
  const serialized = JSON.stringify(value);
  return Buffer.byteLength(serialized, 'utf-8');
}

/**
 * Check if value should be compressed
 */
export function shouldCompress(value: any, threshold: number): boolean {
  const size = calculateSize(value);
  return size >= threshold;
}

/**
 * Calculate TTL expiration timestamp
 */
export function calculateExpiration(ttl: number): number | undefined {
  if (ttl === 0) {
    return undefined; // Never expire
  }

  if (ttl < 0) {
    throw new Error('TTL must be >= 0');
  }

  return Date.now() + ttl * 1000;
}

/**
 * Check if entry has expired
 */
export function isExpired(entry: CacheEntry): boolean {
  if (!entry.expiresAt) {
    return false;
  }

  return Date.now() >= entry.expiresAt;
}

/**
 * Get remaining TTL for entry
 */
export function getRemainingTTL(entry: CacheEntry): number {
  if (!entry.expiresAt) {
    return 0; // Never expires
  }

  const remaining = Math.floor((entry.expiresAt - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Match key against pattern (supports wildcards)
 */
export function matchPattern(key: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex chars
    .replace(/\*/g, '.*') // Convert * to .*
    .replace(/\?/g, '.'); // Convert ? to .

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(key);
}

/**
 * Parse cache key to extract components
 */
export function parseKey(key: string): { prefix?: string; name: string } {
  const parts = key.split(':');

  if (parts.length === 1) {
    return { name: parts[0] };
  }

  return {
    prefix: parts.slice(0, -1).join(':'),
    name: parts[parts.length - 1],
  };
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format duration to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return '0s';

  const units = [
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
    { label: 's', seconds: 1 },
  ];

  const parts: string[] = [];

  for (const unit of units) {
    const value = Math.floor(seconds / unit.seconds);
    if (value > 0) {
      parts.push(`${value}${unit.label}`);
      seconds -= value * unit.seconds;
    }
  }

  return parts.join(' ');
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  }
): Promise<T> {
  let lastError: any;
  let delay = options.initialDelay;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < options.maxAttempts) {
        await sleep(delay);
        delay = Math.min(delay * options.backoffMultiplier, options.maxDelay);
      }
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone((obj as any)[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Create LRU node list for eviction
 */
export function sortByLRU(entries: InternalCacheEntry[]): InternalCacheEntry[] {
  return entries.sort((a, b) => a.lastAccessed - b.lastAccessed);
}

/**
 * Create LFU node list for eviction
 */
export function sortByLFU(entries: InternalCacheEntry[]): InternalCacheEntry[] {
  return entries.sort((a, b) => a.frequency - b.frequency);
}

/**
 * Create FIFO node list for eviction
 */
export function sortByFIFO(entries: InternalCacheEntry[]): InternalCacheEntry[] {
  return entries.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Validate cache key
 */
export function validateKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  if (key.length === 0 || key.length > 250) {
    return false;
  }

  return true;
}

/**
 * Validate TTL value
 */
export function validateTTL(ttl: number): boolean {
  return typeof ttl === 'number' && ttl >= 0 && isFinite(ttl);
}

/**
 * Generate cache statistics summary
 */
export function generateStatsSummary(stats: any): string {
  return `
Cache Statistics:
  - Hit Rate: ${(stats.hitRate * 100).toFixed(2)}%
  - Total Gets: ${stats.totalGets}
  - Hits: ${stats.hits}
  - Misses: ${stats.misses}
  - Total Sets: ${stats.totalSets}
  - Total Deletes: ${stats.totalDeletes}
  - Entries: ${stats.entries}
  - Size: ${formatBytes(stats.size)}
  - Evictions: ${stats.evictions}
  - Uptime: ${formatDuration(stats.uptime / 1000)}
  `.trim();
}
