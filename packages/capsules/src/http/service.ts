/**
 * HTTP Capsule - Service
 *
 * Main HTTP service with lifecycle methods, retry logic, and statistics
 */

import type { HttpConfig, HttpClient, HttpRequestOptions, HttpResponse, HttpStats, CachedResponse } from './types';
import { createAdapter } from './adapters';
import { isRetryableError, getRetryDelay } from './errors';
import { INITIAL_STATS, DEFAULT_CONFIG, RETRY_STRATEGIES } from './constants';
import { sleep, generateRequestId } from './utils';

/**
 * HTTP Service with lifecycle
 */
export class HttpService {
  private client: HttpClient | null = null;
  private config: HttpConfig;
  private stats: HttpStats = { ...INITIAL_STATS };
  private cache = new Map<string, CachedResponse>();
  private initialized = false;

  constructor(config: HttpConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize HTTP service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.client = createAdapter(this.config);
    this.initialized = true;
  }

  /**
   * Execute HTTP request with retry logic
   */
  async execute<T = any>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
    if (!this.initialized || !this.client) {
      await this.initialize();
    }

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      // Check cache
      if (this.config.cache && options.method === 'GET') {
        const cacheKey = this.getCacheKey(options);
        const cached = this.cache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
          this.stats.cacheHits++;
          return cached.response as HttpResponse<T>;
        }

        this.stats.cacheMisses++;
      }

      // Execute with retry
      const response = await this.executeWithRetry<T>(options);

      // Update stats
      this.stats.successfulRequests++;
      this.stats.requestsByMethod[options.method || 'GET']++;
      this.stats.requestsByStatus[response.status] = (this.stats.requestsByStatus[response.status] || 0) + 1;

      const duration = Date.now() - startTime;
      this.stats.totalDuration += duration;
      this.stats.averageDuration = this.stats.totalDuration / this.stats.totalRequests;

      // Calculate response size
      if (response.data) {
        const size = JSON.stringify(response.data).length;
        this.stats.totalBytes += size;
      }

      // Cache response
      if (this.config.cache && options.method === 'GET') {
        const cacheKey = this.getCacheKey(options);
        this.cache.set(cacheKey, {
          response,
          timestamp: Date.now(),
          expiresAt: Date.now() + (this.config.cacheTime || 60000),
        });
      }

      return response;
    } catch (error) {
      this.stats.failedRequests++;
      throw error;
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
    const retryConfig = this.config.retry || {};
    const maxRetries = retryConfig.retries || 0;
    let attempt = 0;

    while (true) {
      try {
        return await this.client!.request<T>(options);
      } catch (error: any) {
        attempt++;

        // Check if should retry
        const shouldRetry =
          attempt <= maxRetries &&
          isRetryableError(error) &&
          (!retryConfig.retryCondition || retryConfig.retryCondition(error));

        if (!shouldRetry) {
          throw error;
        }

        // Calculate delay
        const delay = getRetryDelay(error, retryConfig.retryDelay || 1000);
        this.stats.retries++;

        // Wait before retry
        await sleep(delay);
      }
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>> {
    return this.execute<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>> {
    return this.execute<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>> {
    return this.execute<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>> {
    return this.execute<T>({ ...config, method: 'PATCH', url, data });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>> {
    return this.execute<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * HEAD request
   */
  async head(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<void>> {
    return this.execute<void>({ ...config, method: 'HEAD', url });
  }

  /**
   * OPTIONS request
   */
  async options(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<void>> {
    return this.execute<void>({ ...config, method: 'OPTIONS', url });
  }

  /**
   * GraphQL query
   */
  async graphql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    const response = await this.post<{ data?: T; errors?: any[] }>('/graphql', {
      query,
      variables,
    });

    if (response.data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data.data!;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache key for request
   */
  private getCacheKey(options: HttpRequestOptions): string {
    return `${options.method || 'GET'}:${options.url}:${JSON.stringify(options.params || {})}`;
  }

  /**
   * Get statistics
   */
  getStats(): HttpStats {
    return { ...this.stats };
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<HttpConfig> {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.clearCache();
    this.client = null;
    this.initialized = false;
  }
}

/**
 * Create HTTP service
 */
export async function createHttpService(config?: HttpConfig): Promise<HttpService> {
  const service = new HttpService(config);
  await service.initialize();
  return service;
}
