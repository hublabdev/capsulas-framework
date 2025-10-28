/**
 * @capsulas/capsules - HTTP Client Capsule
 *
 * High-performance HTTP client with retry logic, caching, and comprehensive error handling
 *
 * @category Network
 * @version 1.0.0
 */

// Export types
export type {
  HttpMethod,
  HttpConfig,
  RetryConfig,
  AuthConfig,
  ProxyConfig,
  HttpRequestOptions,
  ProgressEvent,
  HttpResponse,
  HttpErrorResponse,
  RequestInterceptor,
  ResponseInterceptor,
  HttpStats,
  CachedResponse,
  HttpClient,
  UploadConfig,
  DownloadConfig,
  GraphQLRequest,
  GraphQLResponse,
  WebhookConfig,
  RateLimitConfig,
  CircuitBreakerState,
  CircuitBreakerConfig,
  CircuitBreakerStats,
} from './types';

// Export errors
export {
  HttpError,
  HttpErrorType,
  HttpNetworkError,
  HttpTimeoutError,
  HttpAbortError,
  HttpRequestError,
  HttpResponseError,
  HttpValidationError,
  HttpAuthError,
  HttpRateLimitError,
  HttpCircuitBreakerError,
  HttpRetryExhaustedError,
  HttpParseError,
  HttpRedirectError,
  parseHttpError,
  isRetryableError,
  getRetryDelay,
  createErrorFromResponse,
} from './errors';

// Export constants
export {
  DEFAULT_CONFIG,
  DEFAULT_RETRY_CONFIG,
  INITIAL_STATS,
  HTTP_STATUS,
  HTTP_HEADERS,
  CONTENT_TYPES,
  TIMEOUTS,
  RETRY_STRATEGIES,
  DEFAULT_CIRCUIT_BREAKER_CONFIG,
  DEFAULT_RATE_LIMIT_CONFIG,
  HTTP_METHODS,
  API_FORMATS,
  AUTH_SCHEMES,
  CACHE_CONTROL,
  USER_AGENTS,
  GRAPHQL_OPERATIONS,
  WEBHOOK_EVENTS,
  PERFORMANCE,
  SIZE_LIMITS,
  ERROR_MESSAGES,
  HTTP_EVENTS,
} from './constants';

// Export utilities
export {
  buildURL,
  serializeParams,
  parseQueryString,
  mergeHeaders,
  normalizeHeaderName,
  getHeader,
  setHeader,
  removeHeader,
  isValidURL,
  isValidMethod,
  parseContentType,
  detectContentType,
  serializeBody,
  parseResponseBody,
  calculateProgress,
  formatBytes,
  formatDuration,
  createTimeoutSignal,
  combineSignals,
  createBasicAuth,
  createBearerAuth,
  parseBearerToken,
  deepMerge,
  isObject,
  sleep,
  retry,
  debounce,
  throttle,
  generateRequestId,
  validateRequestOptions,
  cloneRequestOptions,
  extractFilename,
  isJSONResponse,
  isSuccessStatus,
  isRedirectStatus,
  isClientErrorStatus,
  isServerErrorStatus,
} from './utils';

// Export adapters
export { FetchAdapter, createAdapter } from './adapters';

// Export service
export { HttpService, createHttpService } from './service';

// Re-export default service
import { HttpService } from './service';
export default HttpService;

/**
 * Quick start factory function
 */
export async function createHttp(config?: HttpConfig): Promise<HttpService> {
  const { createHttpService } = await import('./service');
  return createHttpService(config);
}

/**
 * Capsule metadata for Capsulas Framework
 */
export const httpCapsule = {
  id: 'http',
  name: 'HTTP Client',
  description: 'High-performance HTTP client with retry, caching, and error handling',
  icon: '⊹',
  category: 'network',
  version: '1.0.0',

  inputs: [
    {
      id: 'method',
      name: 'HTTP Method',
      type: 'string',
      required: true,
      description: 'HTTP method: GET, POST, PUT, PATCH, DELETE',
    },
    {
      id: 'url',
      name: 'URL',
      type: 'string',
      required: true,
      description: 'Request URL',
    },
    {
      id: 'data',
      name: 'Body Data',
      type: 'any',
      required: false,
      description: 'Request body data',
    },
    {
      id: 'headers',
      name: 'Headers',
      type: 'object',
      required: false,
      description: 'HTTP headers',
    },
  ],

  outputs: [
    {
      id: 'data',
      name: 'Response Data',
      type: 'any',
      description: 'Response data',
    },
    {
      id: 'status',
      name: 'Status Code',
      type: 'number',
      description: 'HTTP status code',
    },
    {
      id: 'headers',
      name: 'Response Headers',
      type: 'object',
      description: 'Response headers',
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if failed',
    },
  ],

  configSchema: {
    baseURL: {
      type: 'string',
      required: false,
      description: 'Base URL for all requests',
    },
    timeout: {
      type: 'number',
      required: false,
      default: 30000,
      description: 'Request timeout in milliseconds',
    },
    retry: {
      type: 'object',
      required: false,
      description: 'Retry configuration',
    },
  },

  examples: [
    {
      name: 'Basic GET Request',
      description: 'Simple GET request with error handling',
      code: `
import { createHttp } from '@capsulas/capsules/http';

const http = await createHttp({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});

try {
  const response = await http.get('/users');
  console.log(response.data);
} catch (error) {
  console.error('Request failed:', error);
}
`,
    },
    {
      name: 'POST with Retry',
      description: 'POST request with automatic retry on failure',
      code: `
import { createHttp, TIMEOUTS } from '@capsulas/capsules/http';

const http = await createHttp({
  baseURL: 'https://api.example.com',
  timeout: TIMEOUTS.NORMAL,
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryOn: [408, 429, 500, 502, 503, 504],
  },
});

const response = await http.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});
`,
    },
    {
      name: 'GraphQL Query',
      description: 'Execute GraphQL queries',
      code: `
import { createHttp } from '@capsulas/capsules/http';

const http = await createHttp({
  baseURL: 'https://api.example.com',
});

const data = await http.graphql(\`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
\`, { id: '123' });
`,
    },
    {
      name: 'Request with Authentication',
      description: 'Bearer token authentication',
      code: `
import { createHttp, createBearerAuth } from '@capsulas/capsules/http';

const http = await createHttp({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': createBearerAuth(process.env.API_TOKEN),
  },
});

const response = await http.get('/protected/resource');
`,
    },
    {
      name: 'Statistics and Monitoring',
      description: 'Track HTTP request statistics',
      code: `
import { createHttp } from '@capsulas/capsules/http';

const http = await createHttp();

// Make some requests
await http.get('https://api.example.com/users');
await http.post('https://api.example.com/users', { name: 'John' });

// Get statistics
const stats = http.getStats();
console.log(\`Total requests: \${stats.totalRequests}\`);
console.log(\`Success rate: \${(stats.successfulRequests / stats.totalRequests * 100).toFixed(2)}%\`);
console.log(\`Average duration: \${stats.averageDuration.toFixed(2)}ms\`);
console.log(\`Cache hit rate: \${(stats.cacheHits / (stats.cacheHits + stats.cacheMisses) * 100).toFixed(2)}%\`);
`,
    },
  ],

  environmentVariables: [
    {
      name: 'API_BASE_URL',
      description: 'Base URL for API requests',
      required: false,
    },
    {
      name: 'API_TOKEN',
      description: 'API authentication token',
      required: false,
      secret: true,
    },
  ],

  tags: ['http', 'client', 'rest', 'api', 'fetch', 'network'],

  links: {
    documentation: 'https://docs.capsulas.dev/capsules/http',
    github: 'https://github.com/capsulas-framework/capsulas/tree/main/packages/capsules/src/http',
    npm: 'https://www.npmjs.com/package/@capsulas/capsules',
  },
};
