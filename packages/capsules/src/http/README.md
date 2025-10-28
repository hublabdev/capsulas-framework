# HTTP Client Capsule

**High-performance HTTP client with retry logic, caching, and comprehensive error handling**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Capsulas Framework](https://img.shields.io/badge/Capsulas-HTTP-orange)](https://capsulas.dev)

---

## Features

✅ **Modern HTTP Client**
- Fetch-based implementation
- Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- GraphQL support
- TypeScript with full type safety

✅ **Resilience & Reliability**
- Automatic retry with exponential backoff
- Configurable timeout
- Circuit breaker pattern support
- Request/response caching

✅ **Developer Experience**
- Comprehensive error handling (12 error types)
- Request/response interceptors
- Progress tracking for uploads/downloads
- Statistics and monitoring

✅ **Authentication**
- Basic authentication
- Bearer tokens
- API keys
- Custom auth headers

✅ **Advanced Features**
- Request deduplication
- Rate limiting
- Proxy support
- Custom user agents

---

## Installation

```bash
npm install @capsulas/capsules
```

---

## Quick Start

### Basic Usage

```typescript
import { createHttp } from '@capsulas/capsules/http';

// Create HTTP client
const http = await createHttp({
  baseURL: 'https://api.example.com',
  timeout: 5000,
});

// GET request
const users = await http.get('/users');
console.log(users.data);

// POST request
const newUser = await http.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});
```

### With Retry Logic

```typescript
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

const response = await http.get('/api/data');
```

### GraphQL Queries

```typescript
const http = await createHttp({
  baseURL: 'https://api.example.com',
});

const data = await http.graphql(`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`, { id: '123' });
```

### Authentication

```typescript
import { createHttp, createBearerAuth } from '@capsulas/capsules/http';

const http = await createHttp({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': createBearerAuth(process.env.API_TOKEN),
  },
});
```

### With Caching

```typescript
const http = await createHttp({
  baseURL: 'https://api.example.com',
  cache: true,
  cacheTime: 60000, // 1 minute
});

// First request - hits API
const data1 = await http.get('/api/data');

// Second request - returns cached response
const data2 = await http.get('/api/data');
```

---

## API Reference

### HttpService

Main service class with lifecycle methods.

#### Methods

**Lifecycle:**
- `initialize(): Promise<void>` - Initialize service
- `cleanup(): Promise<void>` - Cleanup resources
- `getStats(): HttpStats` - Get request statistics
- `getConfig(): HttpConfig` - Get configuration

**HTTP Methods:**
- `get<T>(url, config?): Promise<HttpResponse<T>>` - GET request
- `post<T>(url, data?, config?): Promise<HttpResponse<T>>` - POST request
- `put<T>(url, data?, config?): Promise<HttpResponse<T>>` - PUT request
- `patch<T>(url, data?, config?): Promise<HttpResponse<T>>` - PATCH request
- `delete<T>(url, config?): Promise<HttpResponse<T>>` - DELETE request
- `head(url, config?): Promise<HttpResponse<void>>` - HEAD request
- `options(url, config?): Promise<HttpResponse<void>>` - OPTIONS request

**Advanced:**
- `execute<T>(options): Promise<HttpResponse<T>>` - Execute custom request
- `graphql<T>(query, variables?): Promise<T>` - GraphQL query
- `clearCache(): void` - Clear response cache

---

## Configuration

### HttpConfig Options

```typescript
interface HttpConfig {
  baseURL?: string;              // Base URL for requests
  timeout?: number;              // Timeout in milliseconds
  headers?: Record<string, string>; // Default headers
  maxRedirects?: number;         // Maximum redirects to follow
  retry?: RetryConfig;           // Retry configuration
  auth?: AuthConfig;             // Authentication config
  cache?: boolean;               // Enable response caching
  cacheTime?: number;            // Cache TTL in milliseconds
}
```

### Retry Configuration

```typescript
interface RetryConfig {
  retries?: number;                       // Number of retries
  retryDelay?: number;                    // Delay between retries (ms)
  retryCondition?: (error) => boolean;    // Custom retry condition
  retryOn?: number[];                     // Status codes to retry
}
```

---

## Error Handling

The HTTP capsule provides 12 specialized error types:

```typescript
import {
  HttpError,
  HttpNetworkError,
  HttpTimeoutError,
  HttpResponseError,
  HttpAuthError,
  HttpRateLimitError,
} from '@capsulas/capsules/http';

try {
  await http.get('/api/data');
} catch (error) {
  if (error instanceof HttpNetworkError) {
    console.error('Network connection failed');
  } else if (error instanceof HttpTimeoutError) {
    console.error('Request timed out');
  } else if (error instanceof HttpResponseError) {
    console.error(`HTTP ${error.status}: ${error.statusText}`);
  } else if (error instanceof HttpAuthError) {
    console.error('Authentication failed');
  } else if (error instanceof HttpRateLimitError) {
    console.error(`Rate limit exceeded. Retry after ${error.retryAfter}s`);
  }
}
```

### All Error Types

1. **HttpNetworkError** - Network connection failed
2. **HttpTimeoutError** - Request timeout
3. **HttpAbortError** - Request aborted
4. **HttpRequestError** - Invalid request
5. **HttpResponseError** - HTTP error response (4xx, 5xx)
6. **HttpValidationError** - Request validation failed
7. **HttpAuthError** - Authentication/authorization failed
8. **HttpRateLimitError** - Rate limit exceeded
9. **HttpCircuitBreakerError** - Circuit breaker open
10. **HttpRetryExhaustedError** - All retries exhausted
11. **HttpParseError** - Response parse error
12. **HttpRedirectError** - Too many redirects

---

## Statistics and Monitoring

```typescript
const http = await createHttp();

// Make requests
await http.get('https://api.example.com/users');
await http.post('https://api.example.com/users', { name: 'John' });

// Get statistics
const stats = http.getStats();

console.log(`Total requests: ${stats.totalRequests}`);
console.log(`Successful: ${stats.successfulRequests}`);
console.log(`Failed: ${stats.failedRequests}`);
console.log(`Success rate: ${(stats.successfulRequests / stats.totalRequests * 100).toFixed(2)}%`);
console.log(`Average duration: ${stats.averageDuration.toFixed(2)}ms`);
console.log(`Total bytes: ${formatBytes(stats.totalBytes)}`);
console.log(`Cache hit rate: ${(stats.cacheHits / (stats.cacheHits + stats.cacheMisses) * 100).toFixed(2)}%`);
```

---

## Best Practices

### 1. Use Base URL

```typescript
const http = await createHttp({
  baseURL: 'https://api.example.com/v1',
});

// Clean endpoint calls
await http.get('/users');
await http.post('/users', data);
```

### 2. Configure Timeouts

```typescript
import { TIMEOUTS } from '@capsulas/capsules/http';

const http = await createHttp({
  timeout: TIMEOUTS.NORMAL, // 30 seconds
});
```

### 3. Implement Retry Logic

```typescript
const http = await createHttp({
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryOn: [408, 429, 500, 502, 503, 504],
  },
});
```

### 4. Handle Errors Gracefully

```typescript
try {
  const response = await http.get('/api/data');
  return response.data;
} catch (error) {
  if (error instanceof HttpTimeoutError) {
    // Retry with longer timeout
    return await http.get('/api/data', { timeout: 60000 });
  }
  throw error;
}
```

### 5. Use Type Safety

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const response = await http.get<User[]>('/users');
const users: User[] = response.data;
```

---

## Common Patterns

### REST API Client

```typescript
class UserAPI {
  constructor(private http: HttpService) {}

  async getUsers() {
    const response = await this.http.get<User[]>('/users');
    return response.data;
  }

  async getUser(id: string) {
    const response = await this.http.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(user: Partial<User>) {
    const response = await this.http.post<User>('/users', user);
    return response.data;
  }

  async updateUser(id: string, updates: Partial<User>) {
    const response = await this.http.patch<User>(`/users/${id}`, updates);
    return response.data;
  }

  async deleteUser(id: string) {
    await this.http.delete(`/users/${id}`);
  }
}

const http = await createHttp({ baseURL: 'https://api.example.com' });
const userAPI = new UserAPI(http);
```

### File Upload

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'My File');

const response = await http.post('/upload', formData);
```

### Pagination

```typescript
async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const allData: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await http.get<{ data: T[]; hasMore: boolean }>(
      `${endpoint}?page=${page}`
    );

    allData.push(...response.data.data);
    hasMore = response.data.hasMore;
    page++;
  }

  return allData;
}
```

---

## Troubleshooting

### Network Errors

**Problem:** Frequent network errors

**Solutions:**
- Increase timeout
- Enable retry logic
- Check network connectivity
- Verify API endpoint is accessible

### Timeout Errors

**Problem:** Requests timing out

**Solutions:**
```typescript
const http = await createHttp({
  timeout: TIMEOUTS.SLOW, // 60 seconds
});
```

### Rate Limiting

**Problem:** 429 Too Many Requests

**Solutions:**
```typescript
const http = await createHttp({
  retry: {
    retries: 5,
    retryDelay: 2000,
    retryOn: [429],
  },
});
```

---

## License

MIT License - see [LICENSE](../../../../../LICENSE) for details.

---

**Made with ❤️ by the Capsulas Framework team**
