/**
 * HTTP Capsule - Adapters
 *
 * HTTP client adapters (fetch, axios-like)
 */

import type { HttpClient, HttpRequestOptions, HttpResponse, HttpConfig } from './types';
import { parseHttpError, HttpTimeoutError } from './errors';
import {
  buildURL,
  mergeHeaders,
  serializeBody,
  detectContentType,
  createTimeoutSignal,
  validateRequestOptions,
} from './utils';
import { DEFAULT_CONFIG } from './constants';

/**
 * Fetch-based HTTP adapter
 */
export class FetchAdapter implements HttpClient {
  private config: HttpConfig;

  constructor(config: HttpConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async request<T = any>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
    validateRequestOptions(options);

    const url = this.config.baseURL
      ? buildURL(this.config.baseURL, options.url, options.params)
      : buildURL('', options.url, options.params);

    const method = options.method || 'GET';
    const headers = mergeHeaders(this.config.headers, options.headers);

    // Handle body
    let body: any;
    if (options.data && method !== 'GET' && method !== 'HEAD') {
      const contentType = headers['content-type'] || detectContentType(options.data);
      headers['content-type'] = contentType;
      body = serializeBody(options.data, contentType);
    }

    // Timeout
    const timeout = options.timeout || this.config.timeout || 30000;
    const signal = createTimeoutSignal(timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: headers as HeadersInit,
        body,
        signal,
        redirect: 'follow',
      };

      const response = await fetch(url, fetchOptions);

      // Parse response
      const contentType = response.headers.get('content-type') || '';
      let data: T;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text() as any;
      } else if (options.responseType === 'blob') {
        data = await response.blob() as any;
      } else if (options.responseType === 'arraybuffer') {
        data = await response.arrayBuffer() as any;
      } else {
        data = await response.json();
      }

      // Build response object
      const httpResponse: HttpResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        config: options,
      };

      // Validate status
      const validateStatus = options.validateStatus || this.config.validateStatus;
      if (validateStatus && !validateStatus(response.status)) {
        throw parseHttpError(
          {
            response: {
              status: response.status,
              statusText: response.statusText,
              data,
              headers: Object.fromEntries(response.headers.entries()),
            },
          },
          options
        );
      }

      return httpResponse;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new HttpTimeoutError('Request timeout', { timeout, url });
      }
      throw parseHttpError(error, options);
    }
  }

  async get<T = any>(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async head(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<void>> {
    return this.request<void>({ ...config, method: 'HEAD', url });
  }

  async options(url: string, config?: Partial<HttpRequestOptions>): Promise<HttpResponse<void>> {
    return this.request<void>({ ...config, method: 'OPTIONS', url });
  }
}

/**
 * Create HTTP adapter
 */
export function createAdapter(config?: HttpConfig): HttpClient {
  return new FetchAdapter(config);
}
