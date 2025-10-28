/**
 * HTTP Capsule - Constants
 *
 * Default configurations and constant values
 */

import type { HttpConfig, RetryConfig, HttpStats, CircuitBreakerConfig, RateLimitConfig } from './types';

/**
 * Default HTTP configuration
 */
export const DEFAULT_CONFIG: Required<Omit<HttpConfig, 'baseURL' | 'auth' | 'proxy' | 'agent'>> = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Capsulas-HTTP/1.0.0',
  },
  maxRedirects: 5,
  validateStatus: (status: number) => status >= 200 && status < 300,
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryOn: [408, 429, 500, 502, 503, 504],
  },
  cache: false,
  cacheTime: 60000, // 1 minute
};

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  retries: 3,
  retryDelay: 1000, // 1 second
  retryCondition: () => true,
  retryOn: [408, 429, 500, 502, 503, 504],
};

/**
 * Initial HTTP statistics
 */
export const INITIAL_STATS: HttpStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalBytes: 0,
  totalDuration: 0,
  averageDuration: 0,
  requestsByMethod: {
    GET: 0,
    POST: 0,
    PUT: 0,
    PATCH: 0,
    DELETE: 0,
    HEAD: 0,
    OPTIONS: 0,
  },
  requestsByStatus: {},
  cacheHits: 0,
  cacheMisses: 0,
  retries: 0,
};

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
  // 1xx Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,

  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,

  // 3xx Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTH_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
} as const;

/**
 * Common HTTP headers
 */
export const HTTP_HEADERS = {
  // Request headers
  ACCEPT: 'Accept',
  ACCEPT_ENCODING: 'Accept-Encoding',
  ACCEPT_LANGUAGE: 'Accept-Language',
  AUTHORIZATION: 'Authorization',
  CACHE_CONTROL: 'Cache-Control',
  CONNECTION: 'Connection',
  CONTENT_LENGTH: 'Content-Length',
  CONTENT_TYPE: 'Content-Type',
  COOKIE: 'Cookie',
  HOST: 'Host',
  IF_MODIFIED_SINCE: 'If-Modified-Since',
  IF_NONE_MATCH: 'If-None-Match',
  ORIGIN: 'Origin',
  REFERER: 'Referer',
  USER_AGENT: 'User-Agent',

  // Response headers
  ACCESS_CONTROL_ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
  ACCESS_CONTROL_ALLOW_METHODS: 'Access-Control-Allow-Methods',
  ACCESS_CONTROL_ALLOW_HEADERS: 'Access-Control-Allow-Headers',
  ALLOW: 'Allow',
  CONTENT_ENCODING: 'Content-Encoding',
  DATE: 'Date',
  ETAG: 'ETag',
  EXPIRES: 'Expires',
  LAST_MODIFIED: 'Last-Modified',
  LOCATION: 'Location',
  RETRY_AFTER: 'Retry-After',
  SERVER: 'Server',
  SET_COOKIE: 'Set-Cookie',
  VARY: 'Vary',
  WWW_AUTHENTICATE: 'WWW-Authenticate',

  // Custom headers
  X_REQUEST_ID: 'X-Request-ID',
  X_API_KEY: 'X-API-Key',
  X_FORWARDED_FOR: 'X-Forwarded-For',
  X_FORWARDED_PROTO: 'X-Forwarded-Proto',
  X_RATE_LIMIT_LIMIT: 'X-RateLimit-Limit',
  X_RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  X_RATE_LIMIT_RESET: 'X-RateLimit-Reset',
} as const;

/**
 * Common content types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
  PDF: 'application/pdf',
  OCTET_STREAM: 'application/octet-stream',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  SVG: 'image/svg+xml',
} as const;

/**
 * Common timeout values (in milliseconds)
 */
export const TIMEOUTS = {
  INSTANT: 1000,       // 1 second
  FAST: 5000,          // 5 seconds
  NORMAL: 30000,       // 30 seconds
  SLOW: 60000,         // 1 minute
  VERY_SLOW: 300000,   // 5 minutes
  UPLOAD: 600000,      // 10 minutes
  DOWNLOAD: 900000,    // 15 minutes
} as const;

/**
 * Retry strategies
 */
export const RETRY_STRATEGIES = {
  /**
   * Linear backoff: delay increases linearly
   */
  LINEAR: (attempt: number, baseDelay: number) => baseDelay * attempt,

  /**
   * Exponential backoff: delay doubles each attempt
   */
  EXPONENTIAL: (attempt: number, baseDelay: number) => baseDelay * Math.pow(2, attempt - 1),

  /**
   * Fibonacci backoff
   */
  FIBONACCI: (attempt: number, baseDelay: number) => {
    const fib = (n: number): number => {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    };
    return baseDelay * fib(attempt);
  },

  /**
   * Fixed delay: same delay for all attempts
   */
  FIXED: (attempt: number, baseDelay: number) => baseDelay,

  /**
   * Jittered exponential backoff: adds randomness to prevent thundering herd
   */
  JITTERED_EXPONENTIAL: (attempt: number, baseDelay: number) => {
    const exponential = baseDelay * Math.pow(2, attempt - 1);
    return exponential * (0.5 + Math.random() * 0.5); // 50-100% of exponential
  },
} as const;

/**
 * Default circuit breaker configuration
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,      // Open after 5 failures
  successThreshold: 2,      // Close after 2 successes in half-open
  timeout: 60000,           // 1 minute timeout
  resetTimeout: 30000,      // Try half-open after 30 seconds
};

/**
 * Default rate limit configuration
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 100,         // 100 requests
  perMilliseconds: 60000,   // per minute
  maxConcurrent: 10,        // max 10 concurrent requests
};

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

/**
 * Common API response formats
 */
export const API_FORMATS = {
  JSON: 'json',
  XML: 'xml',
  YAML: 'yaml',
  CSV: 'csv',
  TEXT: 'text',
} as const;

/**
 * Common authentication schemes
 */
export const AUTH_SCHEMES = {
  BASIC: 'Basic',
  BEARER: 'Bearer',
  DIGEST: 'Digest',
  OAUTH: 'OAuth',
  AWS4: 'AWS4-HMAC-SHA256',
} as const;

/**
 * Cache control directives
 */
export const CACHE_CONTROL = {
  NO_CACHE: 'no-cache',
  NO_STORE: 'no-store',
  MUST_REVALIDATE: 'must-revalidate',
  PUBLIC: 'public',
  PRIVATE: 'private',
  MAX_AGE: (seconds: number) => `max-age=${seconds}`,
} as const;

/**
 * Common user agents
 */
export const USER_AGENTS = {
  CHROME: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  FIREFOX: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  SAFARI: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  MOBILE: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  BOT: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
} as const;

/**
 * GraphQL operation types
 */
export const GRAPHQL_OPERATIONS = {
  QUERY: 'query',
  MUTATION: 'mutation',
  SUBSCRIPTION: 'subscription',
} as const;

/**
 * Webhook events
 */
export const WEBHOOK_EVENTS = {
  REQUEST_START: 'request.start',
  REQUEST_END: 'request.end',
  REQUEST_ERROR: 'request.error',
  RETRY: 'retry',
  RATE_LIMIT: 'rate_limit',
  CIRCUIT_BREAKER_OPEN: 'circuit_breaker.open',
  CIRCUIT_BREAKER_CLOSE: 'circuit_breaker.close',
} as const;

/**
 * Performance thresholds (in milliseconds)
 */
export const PERFORMANCE = {
  FAST: 100,           // < 100ms is fast
  ACCEPTABLE: 500,     // < 500ms is acceptable
  SLOW: 1000,          // > 1s is slow
  VERY_SLOW: 3000,     // > 3s is very slow
} as const;

/**
 * Size limits (in bytes)
 */
export const SIZE_LIMITS = {
  ONE_KB: 1024,
  ONE_MB: 1048576,
  FIVE_MB: 5242880,
  TEN_MB: 10485760,
  FIFTY_MB: 52428800,
  ONE_GB: 1073741824,
} as const;

/**
 * Default request pool size
 */
export const DEFAULT_POOL_SIZE = 10;

/**
 * Maximum redirect follow depth
 */
export const MAX_REDIRECTS = 10;

/**
 * Default cache TTL (in milliseconds)
 */
export const DEFAULT_CACHE_TTL = 60000; // 1 minute

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed',
  TIMEOUT: 'Request timeout',
  ABORT: 'Request was aborted',
  INVALID_URL: 'Invalid URL provided',
  INVALID_METHOD: 'Invalid HTTP method',
  INVALID_STATUS: 'Invalid status code',
  RATE_LIMIT: 'Rate limit exceeded',
  CIRCUIT_OPEN: 'Circuit breaker is open',
  RETRY_EXHAUSTED: 'All retry attempts exhausted',
  PARSE_ERROR: 'Failed to parse response',
  AUTH_REQUIRED: 'Authentication required',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
} as const;

/**
 * Event types emitted by HTTP client
 */
export const HTTP_EVENTS = {
  REQUEST: 'request',
  RESPONSE: 'response',
  ERROR: 'error',
  RETRY: 'retry',
  CACHE_HIT: 'cache:hit',
  CACHE_MISS: 'cache:miss',
  UPLOAD_PROGRESS: 'upload:progress',
  DOWNLOAD_PROGRESS: 'download:progress',
} as const;
