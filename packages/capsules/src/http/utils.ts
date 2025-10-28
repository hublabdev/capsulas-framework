/**
 * HTTP Capsule - Utils
 *
 * Utility functions for HTTP operations
 */

import type { HttpRequestOptions, ProgressEvent } from './types';
import { HttpValidationError } from './errors';

/**
 * Build URL with query parameters
 */
export function buildURL(baseURL: string, path: string, params?: Record<string, any>): string {
  // Combine base URL and path
  let url = baseURL;
  if (path) {
    url = url.endsWith('/') ? url + path.replace(/^\//, '') : url + '/' + path.replace(/^\//, '');
  }

  // Add query parameters
  if (params && Object.keys(params).length > 0) {
    const queryString = serializeParams(params);
    url += (url.includes('?') ? '&' : '?') + queryString;
  }

  return url;
}

/**
 * Serialize object to URL query string
 */
export function serializeParams(params: Record<string, any>): string {
  const pairs: string[] = [];

  Object.keys(params).forEach((key) => {
    const value = params[key];

    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        pairs.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(String(item))}`);
      });
    } else if (typeof value === 'object') {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`);
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });

  return pairs.join('&');
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, any> {
  const params: Record<string, any> = {};

  if (!queryString) {
    return params;
  }

  const pairs = queryString.replace(/^\?/, '').split('&');

  pairs.forEach((pair) => {
    const [key, value] = pair.split('=').map(decodeURIComponent);

    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      if (!params[arrayKey]) {
        params[arrayKey] = [];
      }
      params[arrayKey].push(value);
    } else {
      params[key] = value;
    }
  });

  return params;
}

/**
 * Merge headers objects
 */
export function mergeHeaders(
  ...headersList: Array<Record<string, string> | undefined>
): Record<string, string> {
  const merged: Record<string, string> = {};

  headersList.forEach((headers) => {
    if (headers) {
      Object.keys(headers).forEach((key) => {
        // Normalize header names to lowercase
        const normalizedKey = key.toLowerCase();
        merged[normalizedKey] = headers[key];
      });
    }
  });

  return merged;
}

/**
 * Normalize header name (lowercase)
 */
export function normalizeHeaderName(name: string): string {
  return name.toLowerCase();
}

/**
 * Get header value (case-insensitive)
 */
export function getHeader(headers: Record<string, string>, name: string): string | undefined {
  const normalizedName = normalizeHeaderName(name);
  return headers[normalizedName];
}

/**
 * Set header value
 */
export function setHeader(
  headers: Record<string, string>,
  name: string,
  value: string
): Record<string, string> {
  const normalizedName = normalizeHeaderName(name);
  return {
    ...headers,
    [normalizedName]: value,
  };
}

/**
 * Remove header
 */
export function removeHeader(
  headers: Record<string, string>,
  name: string
): Record<string, string> {
  const normalizedName = normalizeHeaderName(name);
  const { [normalizedName]: removed, ...rest } = headers;
  return rest;
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate HTTP method
 */
export function isValidMethod(method: string): boolean {
  const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  return validMethods.includes(method.toUpperCase());
}

/**
 * Parse content type header
 */
export function parseContentType(contentType: string): { type: string; charset?: string } {
  const parts = contentType.split(';');
  const type = parts[0].trim();
  const charset = parts
    .find((p) => p.trim().startsWith('charset='))
    ?.split('=')[1]
    ?.trim();

  return { type, charset };
}

/**
 * Detect content type from data
 */
export function detectContentType(data: any): string {
  if (typeof data === 'string') {
    return 'text/plain';
  }

  if (data instanceof FormData) {
    return 'multipart/form-data';
  }

  if (data instanceof URLSearchParams) {
    return 'application/x-www-form-urlencoded';
  }

  if (data instanceof ArrayBuffer || data instanceof Blob) {
    return 'application/octet-stream';
  }

  // Default to JSON for objects
  return 'application/json';
}

/**
 * Serialize request body based on content type
 */
export function serializeBody(data: any, contentType: string): string | FormData | URLSearchParams | ArrayBuffer {
  if (!data) {
    return '';
  }

  // Already serialized types
  if (typeof data === 'string') {
    return data;
  }

  if (data instanceof FormData || data instanceof URLSearchParams || data instanceof ArrayBuffer) {
    return data;
  }

  // JSON
  if (contentType.includes('application/json')) {
    return JSON.stringify(data);
  }

  // Form URL encoded
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return serializeParams(data);
  }

  // Default to JSON
  return JSON.stringify(data);
}

/**
 * Parse response body based on content type
 */
export async function parseResponseBody(
  body: any,
  contentType: string
): Promise<any> {
  if (!body) {
    return null;
  }

  // JSON
  if (contentType.includes('application/json')) {
    if (typeof body === 'string') {
      return JSON.parse(body);
    }
    return body;
  }

  // Text
  if (contentType.includes('text/')) {
    return String(body);
  }

  // Default: return as-is
  return body;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(loaded: number, total: number): ProgressEvent {
  const percentage = total > 0 ? (loaded / total) * 100 : 0;
  return { loaded, total, percentage };
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
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }

  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

/**
 * Create abort signal with timeout
 */
export function createTimeoutSignal(timeout: number): AbortSignal {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Clean up timeout if signal is manually aborted
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });

  return controller.signal;
}

/**
 * Combine multiple abort signals
 */
export function combineSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  signals.forEach((signal) => {
    if (signal.aborted) {
      controller.abort();
      return;
    }

    signal.addEventListener('abort', () => {
      controller.abort();
    });
  });

  return controller.signal;
}

/**
 * Create basic auth header value
 */
export function createBasicAuth(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
}

/**
 * Create bearer auth header value
 */
export function createBearerAuth(token: string): string {
  return `Bearer ${token}`;
}

/**
 * Parse bearer token from auth header
 */
export function parseBearerToken(authHeader: string): string | null {
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Array<Partial<T>>
): T {
  if (!sources.length) return target;

  const source = sources.shift();
  if (!source) return target;

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (isObject(sourceValue) && isObject(targetValue)) {
      target[key] = deepMerge({ ...targetValue }, sourceValue);
    } else {
      target[key] = sourceValue as any;
    }
  });

  return deepMerge(target, ...sources);
}

/**
 * Check if value is plain object
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries: number;
    delay: number;
    onRetry?: (attempt: number, error: Error) => void;
  }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= options.retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt < options.retries) {
        const delay = options.delay * Math.pow(2, attempt - 1);
        options.onRetry?.(attempt, error);
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate request options
 */
export function validateRequestOptions(options: HttpRequestOptions): void {
  if (!options.url) {
    throw new HttpValidationError('URL is required');
  }

  if (!isValidURL(options.url)) {
    throw new HttpValidationError(`Invalid URL: ${options.url}`);
  }

  if (options.method && !isValidMethod(options.method)) {
    throw new HttpValidationError(`Invalid HTTP method: ${options.method}`);
  }

  if (options.timeout && (options.timeout < 0 || !Number.isFinite(options.timeout))) {
    throw new HttpValidationError(`Invalid timeout: ${options.timeout}`);
  }
}

/**
 * Clone request options
 */
export function cloneRequestOptions(options: HttpRequestOptions): HttpRequestOptions {
  return {
    ...options,
    headers: options.headers ? { ...options.headers } : undefined,
    params: options.params ? { ...options.params } : undefined,
  };
}

/**
 * Extract filename from Content-Disposition header
 */
export function extractFilename(contentDisposition: string): string | null {
  const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1].replace(/['"]/g, '');
  }
  return null;
}

/**
 * Check if response is JSON
 */
export function isJSONResponse(contentType: string): boolean {
  return contentType.includes('application/json') || contentType.includes('+json');
}

/**
 * Check if status code is successful
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Check if status code is redirect
 */
export function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400;
}

/**
 * Check if status code is client error
 */
export function isClientErrorStatus(status: number): boolean {
  return status >= 400 && status < 500;
}

/**
 * Check if status code is server error
 */
export function isServerErrorStatus(status: number): boolean {
  return status >= 500 && status < 600;
}
