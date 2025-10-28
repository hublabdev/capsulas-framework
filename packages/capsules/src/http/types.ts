/**
 * HTTP Capsule - Types
 *
 * Complete type system for HTTP client operations
 */

/**
 * HTTP methods supported
 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

/**
 * HTTP request configuration
 */
export interface HttpConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  maxRedirects?: number;
  validateStatus?: (status: number) => boolean;
  retry?: RetryConfig;
  auth?: AuthConfig;
  proxy?: ProxyConfig;
  cache?: boolean;
  cacheTime?: number;
  agent?: any; // HTTP/HTTPS agent
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
  retryOn?: number[]; // Status codes to retry
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
  type: 'basic' | 'bearer' | 'api-key' | 'oauth2';
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyHeader?: string;
}

/**
 * Proxy configuration
 */
export interface ProxyConfig {
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  method?: HttpMethod;
  url: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer' | 'stream';
  validateStatus?: (status: number) => boolean;
  maxRedirects?: number;
  onUploadProgress?: (progress: ProgressEvent) => void;
  onDownloadProgress?: (progress: ProgressEvent) => void;
}

/**
 * Progress event
 */
export interface ProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * HTTP response
 */
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: HttpRequestOptions;
  request?: any;
}

/**
 * HTTP error response
 */
export interface HttpErrorResponse {
  message: string;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: any;
  config?: HttpRequestOptions;
}

/**
 * Request interceptor
 */
export interface RequestInterceptor {
  onFulfilled?: (config: HttpRequestOptions) => HttpRequestOptions | Promise<HttpRequestOptions>;
  onRejected?: (error: any) => any;
}

/**
 * Response interceptor
 */
export interface ResponseInterceptor {
  onFulfilled?: <T = any>(response: HttpResponse<T>) => HttpResponse<T> | Promise<HttpResponse<T>>;
  onRejected?: (error: any) => any;
}

/**
 * HTTP statistics
 */
export interface HttpStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalBytes: number;
  totalDuration: number;
  averageDuration: number;
  requestsByMethod: Record<HttpMethod, number>;
  requestsByStatus: Record<number, number>;
  cacheHits: number;
  cacheMisses: number;
  retries: number;
}

/**
 * Cached response
 */
export interface CachedResponse<T = any> {
  response: HttpResponse<T>;
  timestamp: number;
  expiresAt: number;
}

/**
 * HTTP client interface
 */
export interface HttpClient {
  request<T = any>(options: HttpRequestOptions): Promise<HttpResponse<T>>;
  get<T = any>(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>>;
  post<T = any>(url: string, data?: any, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>>;
  put<T = any>(url: string, data?: any, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>>;
  delete<T = any>(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>>;
  head(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<void>>;
  options(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<void>>;
}

/**
 * Upload file configuration
 */
export interface UploadConfig {
  file: File | Blob | Buffer;
  filename?: string;
  field?: string;
  additionalData?: Record<string, any>;
  onProgress?: (progress: ProgressEvent) => void;
}

/**
 * Download configuration
 */
export interface DownloadConfig {
  url: string;
  destination?: string;
  onProgress?: (progress: ProgressEvent) => void;
}

/**
 * GraphQL request
 */
export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

/**
 * GraphQL response
 */
export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  url: string;
  secret?: string;
  events?: string[];
  headers?: Record<string, string>;
  retryConfig?: RetryConfig;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  perMilliseconds: number;
  maxConcurrent?: number;
}

/**
 * Circuit breaker state
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
}

/**
 * Circuit breaker stats
 */
export interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  lastFailureTime?: number;
  nextAttemptTime?: number;
}
