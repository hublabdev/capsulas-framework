/**
 * WebSocket Capsule - Utility Functions
 *
 * Helper functions for WebSocket operations
 */

import type { WebSocketMessage, WebSocketAuthConfig } from './types';
import { WebSocketInvalidMessageError } from './errors';
import { MAX_MESSAGE_SIZE, MAX_ROOM_NAME_LENGTH } from './constants';

/**
 * Validate WebSocket message structure
 */
export function validateMessage(message: any): boolean {
  if (!message || typeof message !== 'object') {
    return false;
  }

  if (typeof message.event !== 'string' || message.event.length === 0) {
    return false;
  }

  if (message.data === undefined) {
    return false;
  }

  if (message.id && typeof message.id !== 'string') {
    return false;
  }

  if (message.timestamp && typeof message.timestamp !== 'number') {
    return false;
  }

  if (message.room && typeof message.room !== 'string') {
    return false;
  }

  return true;
}

/**
 * Serialize WebSocket message to string
 */
export function serializeMessage(message: WebSocketMessage): string {
  if (!validateMessage(message)) {
    throw new WebSocketInvalidMessageError('Invalid message structure', { message });
  }

  try {
    const serialized = JSON.stringify({
      event: message.event,
      data: message.data,
      id: message.id,
      timestamp: message.timestamp || Date.now(),
      room: message.room,
      metadata: message.metadata,
    });

    // Check message size
    const size = new Blob([serialized]).size;
    if (size > MAX_MESSAGE_SIZE) {
      throw new WebSocketInvalidMessageError(
        `Message size ${size} exceeds maximum ${MAX_MESSAGE_SIZE}`,
        { size, maxSize: MAX_MESSAGE_SIZE }
      );
    }

    return serialized;
  } catch (error: any) {
    if (error instanceof WebSocketInvalidMessageError) {
      throw error;
    }
    throw new WebSocketInvalidMessageError('Failed to serialize message', {
      error: error.message,
      message,
    });
  }
}

/**
 * Deserialize WebSocket message from string
 */
export function deserializeMessage<T = any>(data: string): WebSocketMessage<T> {
  try {
    const parsed = JSON.parse(data);

    if (!validateMessage(parsed)) {
      throw new WebSocketInvalidMessageError('Invalid message format', { data });
    }

    return {
      event: parsed.event,
      data: parsed.data,
      id: parsed.id,
      timestamp: parsed.timestamp,
      room: parsed.room,
      metadata: parsed.metadata,
    };
  } catch (error: any) {
    if (error instanceof WebSocketInvalidMessageError) {
      throw error;
    }
    throw new WebSocketInvalidMessageError('Failed to deserialize message', {
      error: error.message,
      data,
    });
  }
}

/**
 * Generate unique connection ID
 */
export function generateConnectionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `ws_${timestamp}_${random}`;
}

/**
 * Generate unique message ID
 */
export function generateMessageId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `msg_${timestamp}_${random}`;
}

/**
 * Parse WebSocket URL
 */
export function parseUrl(url: string): {
  protocol: string;
  host: string;
  port: number;
  path: string;
  secure: boolean;
} {
  try {
    const parsed = new URL(url);

    return {
      protocol: parsed.protocol.replace(':', ''),
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : parsed.protocol === 'wss:' ? 443 : 80,
      path: parsed.pathname + parsed.search,
      secure: parsed.protocol === 'wss:' || parsed.protocol === 'https:',
    };
  } catch (error: any) {
    throw new Error(`Invalid WebSocket URL: ${url}`);
  }
}

/**
 * Build WebSocket URL from components
 */
export function buildUrl(
  host: string,
  port?: number,
  path?: string,
  secure: boolean = false
): string {
  const protocol = secure ? 'wss' : 'ws';
  const portStr = port ? `:${port}` : '';
  const pathStr = path || '';

  return `${protocol}://${host}${portStr}${pathStr}`;
}

/**
 * Validate room name
 */
export function validateRoomName(room: string): boolean {
  if (!room || typeof room !== 'string') {
    return false;
  }

  if (room.length === 0 || room.length > MAX_ROOM_NAME_LENGTH) {
    return false;
  }

  // Check for invalid characters
  if (!/^[a-zA-Z0-9_-]+$/.test(room)) {
    return false;
  }

  return true;
}

/**
 * Calculate reconnection delay with exponential backoff
 */
export function calculateReconnectDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoff: number = 1.5,
  jitter: number = 0.1
): number {
  const exponentialDelay = baseDelay * Math.pow(backoff, attempt - 1);
  const delayWithMax = Math.min(exponentialDelay, maxDelay);

  // Add jitter to prevent thundering herd
  const jitterAmount = delayWithMax * jitter * (Math.random() - 0.5) * 2;
  const finalDelay = Math.max(0, delayWithMax + jitterAmount);

  return Math.round(finalDelay);
}

/**
 * Build authentication headers/params
 */
export function buildAuthHeaders(auth?: WebSocketAuthConfig): Record<string, string> {
  if (!auth) {
    return {};
  }

  const headers: Record<string, string> = {};

  switch (auth.type) {
    case 'token':
      if (auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
      }
      break;

    case 'basic':
      if (auth.username && auth.password) {
        const credentials = btoa(`${auth.username}:${auth.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
      }
      break;

    case 'custom':
      if (auth.headers) {
        Object.assign(headers, auth.headers);
      }
      break;
  }

  return headers;
}

/**
 * Build authentication query parameters
 */
export function buildAuthQuery(auth?: WebSocketAuthConfig): Record<string, string> {
  if (!auth) {
    return {};
  }

  const query: Record<string, string> = {};

  if (auth.type === 'query' && auth.query) {
    Object.assign(query, auth.query);
  }

  if (auth.type === 'token' && auth.token) {
    query['token'] = auth.token;
  }

  return query;
}

/**
 * Estimate message size in bytes
 */
export function estimateMessageSize(message: WebSocketMessage): number {
  try {
    const serialized = serializeMessage(message);
    return new Blob([serialized]).size;
  } catch {
    return 0;
  }
}

/**
 * Check if message is binary
 */
export function isBinaryMessage(data: any): boolean {
  return (
    data instanceof ArrayBuffer ||
    data instanceof Blob ||
    ArrayBuffer.isView(data)
  );
}

/**
 * Convert binary data to string
 */
export async function binaryToString(data: ArrayBuffer | Blob): Promise<string> {
  if (data instanceof ArrayBuffer) {
    return new TextDecoder().decode(data);
  }

  if (data instanceof Blob) {
    const buffer = await data.arrayBuffer();
    return new TextDecoder().decode(buffer);
  }

  throw new Error('Unsupported binary data type');
}

/**
 * Convert string to binary data
 */
export function stringToBinary(data: string, type: 'arraybuffer' | 'blob' = 'arraybuffer'): ArrayBuffer | Blob {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);

  if (type === 'blob') {
    return new Blob([buffer]);
  }

  return buffer.buffer;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Create timeout promise
 */
export function createTimeout(ms: number, message?: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message || `Timeout after ${ms}ms`));
    }, ms);
  });
}

/**
 * Wait for condition with timeout
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  backoff: number = 2
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt < maxAttempts) {
        const delay = calculateReconnectDelay(attempt, baseDelay, baseDelay * 10, backoff, 0);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}
