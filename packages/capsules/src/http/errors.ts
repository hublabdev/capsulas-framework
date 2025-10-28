/**
 * HTTP Capsule - Errors
 *
 * Comprehensive error handling for HTTP operations
 */

import type { HttpErrorResponse, HttpRequestOptions } from './types';

/**
 * HTTP error types enumeration
 */
export enum HttpErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  ABORT_ERROR = 'ABORT_ERROR',
  REQUEST_ERROR = 'REQUEST_ERROR',
  RESPONSE_ERROR = 'RESPONSE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  CIRCUIT_BREAKER_ERROR = 'CIRCUIT_BREAKER_ERROR',
  RETRY_EXHAUSTED_ERROR = 'RETRY_EXHAUSTED_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  REDIRECT_ERROR = 'REDIRECT_ERROR',
}

/**
 * Base HTTP Error class
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly type: HttpErrorType,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'HttpError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      details: this.details,
    };
  }
}

/**
 * Network connection error
 */
export class HttpNetworkError extends HttpError {
  constructor(message: string, details?: any) {
    super(message, HttpErrorType.NETWORK_ERROR, details);
    this.name = 'HttpNetworkError';
  }
}

/**
 * Request timeout error
 */
export class HttpTimeoutError extends HttpError {
  constructor(message: string = 'Request timeout', details?: any) {
    super(message, HttpErrorType.TIMEOUT_ERROR, details);
    this.name = 'HttpTimeoutError';
  }
}

/**
 * Request aborted error
 */
export class HttpAbortError extends HttpError {
  constructor(message: string = 'Request aborted', details?: any) {
    super(message, HttpErrorType.ABORT_ERROR, details);
    this.name = 'HttpAbortError';
  }
}

/**
 * Invalid request error
 */
export class HttpRequestError extends HttpError {
  constructor(message: string, details?: any) {
    super(message, HttpErrorType.REQUEST_ERROR, details);
    this.name = 'HttpRequestError';
  }
}

/**
 * HTTP response error (4xx, 5xx)
 */
export class HttpResponseError extends HttpError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly response?: HttpErrorResponse;

  constructor(
    message: string,
    status: number,
    statusText: string,
    response?: HttpErrorResponse
  ) {
    super(message, HttpErrorType.RESPONSE_ERROR, { status, statusText, response });
    this.name = 'HttpResponseError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }

  /**
   * Check if error is 4xx client error
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is 5xx server error
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
}

/**
 * Request validation error
 */
export class HttpValidationError extends HttpError {
  constructor(message: string, details?: any) {
    super(message, HttpErrorType.VALIDATION_ERROR, details);
    this.name = 'HttpValidationError';
  }
}

/**
 * Authentication/Authorization error
 */
export class HttpAuthError extends HttpError {
  constructor(message: string, details?: any) {
    super(message, HttpErrorType.AUTH_ERROR, details);
    this.name = 'HttpAuthError';
  }
}

/**
 * Rate limit exceeded error
 */
export class HttpRateLimitError extends HttpError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, details?: any) {
    super(message, HttpErrorType.RATE_LIMIT_ERROR, { retryAfter, ...details });
    this.name = 'HttpRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Circuit breaker open error
 */
export class HttpCircuitBreakerError extends HttpError {
  constructor(message: string = 'Circuit breaker is open', details?: any) {
    super(message, HttpErrorType.CIRCUIT_BREAKER_ERROR, details);
    this.name = 'HttpCircuitBreakerError';
  }
}

/**
 * All retry attempts exhausted
 */
export class HttpRetryExhaustedError extends HttpError {
  public readonly attempts: number;
  public readonly lastError: Error;

  constructor(message: string, attempts: number, lastError: Error) {
    super(message, HttpErrorType.RETRY_EXHAUSTED_ERROR, { attempts, lastError });
    this.name = 'HttpRetryExhaustedError';
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

/**
 * Response parse error
 */
export class HttpParseError extends HttpError {
  constructor(message: string, details?: any) {
    super(message, HttpErrorType.PARSE_ERROR, details);
    this.name = 'HttpParseError';
  }
}

/**
 * Too many redirects error
 */
export class HttpRedirectError extends HttpError {
  constructor(message: string, details?: any) {
    super(message, HttpErrorType.REDIRECT_ERROR, details);
    this.name = 'HttpRedirectError';
  }
}

/**
 * Parse standard fetch/axios errors into our error types
 */
export function parseHttpError(error: any, config?: HttpRequestOptions): HttpError {
  // Network error
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
    return new HttpNetworkError(
      `Network error: ${error.message}`,
      { code: error.code, config }
    );
  }

  // Timeout
  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET' || error.message?.includes('timeout')) {
    return new HttpTimeoutError(
      `Request timeout: ${error.message}`,
      { code: error.code, config }
    );
  }

  // Abort
  if (error.name === 'AbortError' || error.code === 'ABORT_ERR') {
    return new HttpAbortError(
      'Request was aborted',
      { config }
    );
  }

  // Response error (status codes)
  if (error.response) {
    const status = error.response.status || error.response.statusCode;
    const statusText = error.response.statusText || '';

    // Auth errors
    if (status === 401 || status === 403) {
      return new HttpAuthError(
        `Authentication failed: ${status} ${statusText}`,
        { status, statusText, response: error.response, config }
      );
    }

    // Rate limit
    if (status === 429) {
      const retryAfter = error.response.headers?.['retry-after'];
      return new HttpRateLimitError(
        'Rate limit exceeded',
        retryAfter ? parseInt(retryAfter, 10) : undefined,
        { status, statusText, response: error.response, config }
      );
    }

    // General response error
    return new HttpResponseError(
      `HTTP error: ${status} ${statusText}`,
      status,
      statusText,
      {
        message: error.message,
        status,
        statusText,
        headers: error.response.headers,
        data: error.response.data,
        config,
      }
    );
  }

  // Parse error
  if (error.name === 'SyntaxError' || error.message?.includes('JSON')) {
    return new HttpParseError(
      `Failed to parse response: ${error.message}`,
      { error: error.message, config }
    );
  }

  // Too many redirects
  if (error.message?.includes('redirect')) {
    return new HttpRedirectError(
      `Too many redirects: ${error.message}`,
      { error: error.message, config }
    );
  }

  // Generic request error
  return new HttpRequestError(
    error.message || 'Unknown HTTP error',
    { error, config }
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: HttpError): boolean {
  // Network errors are retryable
  if (error instanceof HttpNetworkError) {
    return true;
  }

  // Timeout errors are retryable
  if (error instanceof HttpTimeoutError) {
    return true;
  }

  // Some 5xx errors are retryable
  if (error instanceof HttpResponseError) {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.status);
  }

  return false;
}

/**
 * Get retry delay from error (especially for rate limits)
 */
export function getRetryDelay(error: HttpError, defaultDelay: number = 1000): number {
  if (error instanceof HttpRateLimitError && error.retryAfter) {
    return error.retryAfter * 1000; // Convert seconds to ms
  }

  if (error instanceof HttpResponseError && error.status === 429) {
    const retryAfter = error.response?.headers?.['retry-after'];
    if (retryAfter) {
      return parseInt(retryAfter, 10) * 1000;
    }
  }

  return defaultDelay;
}

/**
 * Create error from response
 */
export function createErrorFromResponse(
  status: number,
  statusText: string,
  data: any,
  config?: HttpRequestOptions
): HttpError {
  // Auth errors
  if (status === 401) {
    return new HttpAuthError('Unauthorized', {
      status,
      statusText,
      data,
      config,
    });
  }

  if (status === 403) {
    return new HttpAuthError('Forbidden', {
      status,
      statusText,
      data,
      config,
    });
  }

  // Rate limit
  if (status === 429) {
    return new HttpRateLimitError('Too Many Requests', undefined, {
      status,
      statusText,
      data,
      config,
    });
  }

  // General response error
  return new HttpResponseError(
    `HTTP ${status}: ${statusText}`,
    status,
    statusText,
    {
      message: statusText,
      status,
      statusText,
      data,
      config,
    }
  );
}
