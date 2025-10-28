/**
 * WebSocket Capsule - Error Definitions
 *
 * Comprehensive error handling for WebSocket operations
 */

/**
 * WebSocket error types enum
 */
export enum WebSocketErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  DISCONNECTION_ERROR = 'DISCONNECTION_ERROR',
  SEND_FAILED = 'SEND_FAILED',
  RECEIVE_FAILED = 'RECEIVE_FAILED',
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  ROOM_ERROR = 'ROOM_ERROR',
  AUTH_FAILED = 'AUTH_FAILED',
  TIMEOUT = 'TIMEOUT',
  PROTOCOL_ERROR = 'PROTOCOL_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  ADAPTER_ERROR = 'ADAPTER_ERROR',
  RECONNECT_FAILED = 'RECONNECT_FAILED',
  MESSAGE_QUEUE_FULL = 'MESSAGE_QUEUE_FULL',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
}

/**
 * Base WebSocket error class
 */
export class WebSocketError extends Error {
  constructor(
    message: string,
    public readonly type: WebSocketErrorType,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'WebSocketError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Connection failed error
 * Thrown when WebSocket connection cannot be established
 */
export class WebSocketConnectionError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.CONNECTION_FAILED, details);
    this.name = 'WebSocketConnectionError';
  }
}

/**
 * Disconnection error
 * Thrown when WebSocket disconnection fails or is unexpected
 */
export class WebSocketDisconnectionError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.DISCONNECTION_ERROR, details);
    this.name = 'WebSocketDisconnectionError';
  }
}

/**
 * Send failed error
 * Thrown when message cannot be sent
 */
export class WebSocketSendError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.SEND_FAILED, details);
    this.name = 'WebSocketSendError';
  }
}

/**
 * Receive failed error
 * Thrown when message cannot be received or parsed
 */
export class WebSocketReceiveError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.RECEIVE_FAILED, details);
    this.name = 'WebSocketReceiveError';
  }
}

/**
 * Invalid message error
 * Thrown when message format is invalid
 */
export class WebSocketInvalidMessageError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.INVALID_MESSAGE, details);
    this.name = 'WebSocketInvalidMessageError';
  }
}

/**
 * Room error
 * Thrown when room operations fail
 */
export class WebSocketRoomError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.ROOM_ERROR, details);
    this.name = 'WebSocketRoomError';
  }
}

/**
 * Authentication failed error
 * Thrown when WebSocket authentication fails
 */
export class WebSocketAuthError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.AUTH_FAILED, details);
    this.name = 'WebSocketAuthError';
  }
}

/**
 * Timeout error
 * Thrown when WebSocket operation times out
 */
export class WebSocketTimeoutError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.TIMEOUT, details);
    this.name = 'WebSocketTimeoutError';
  }
}

/**
 * Protocol error
 * Thrown when WebSocket protocol violation occurs
 */
export class WebSocketProtocolError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.PROTOCOL_ERROR, details);
    this.name = 'WebSocketProtocolError';
  }
}

/**
 * Configuration error
 * Thrown when WebSocket configuration is invalid
 */
export class WebSocketConfigurationError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.CONFIGURATION_ERROR, details);
    this.name = 'WebSocketConfigurationError';
  }
}

/**
 * Adapter error
 * Thrown when WebSocket adapter encounters an error
 */
export class WebSocketAdapterError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.ADAPTER_ERROR, details);
    this.name = 'WebSocketAdapterError';
  }
}

/**
 * Reconnect failed error
 * Thrown when reconnection attempts are exhausted
 */
export class WebSocketReconnectError extends WebSocketError {
  constructor(attempts: number, details?: any) {
    super(
      `Failed to reconnect after ${attempts} attempts`,
      WebSocketErrorType.RECONNECT_FAILED,
      { ...details, attempts }
    );
    this.name = 'WebSocketReconnectError';
  }
}

/**
 * Message queue full error
 * Thrown when message queue reaches maximum size
 */
export class WebSocketQueueFullError extends WebSocketError {
  constructor(maxSize: number, details?: any) {
    super(
      `Message queue is full (max: ${maxSize})`,
      WebSocketErrorType.MESSAGE_QUEUE_FULL,
      { ...details, maxSize }
    );
    this.name = 'WebSocketQueueFullError';
  }
}

/**
 * Initialization error
 * Thrown when WebSocket service fails to initialize
 */
export class WebSocketInitializationError extends WebSocketError {
  constructor(message: string, details?: any) {
    super(message, WebSocketErrorType.INITIALIZATION_ERROR, details);
    this.name = 'WebSocketInitializationError';
  }
}

/**
 * Type guard to check if error is a WebSocketError
 */
export function isWebSocketError(error: any): error is WebSocketError {
  return error instanceof WebSocketError;
}

/**
 * Type guard for specific WebSocket error types
 */
export function isWebSocketErrorType(error: any, type: WebSocketErrorType): boolean {
  return isWebSocketError(error) && error.type === type;
}

/**
 * Parse native WebSocket errors
 */
export function parseNativeWebSocketError(event: any): WebSocketError {
  const message = event.message || 'WebSocket error occurred';
  const code = event.code;

  if (code === 1000) {
    return new WebSocketDisconnectionError('Normal closure', { code });
  }

  if (code === 1001) {
    return new WebSocketDisconnectionError('Going away', { code });
  }

  if (code === 1002) {
    return new WebSocketProtocolError('Protocol error', { code });
  }

  if (code === 1003) {
    return new WebSocketProtocolError('Unsupported data', { code });
  }

  if (code === 1006) {
    return new WebSocketConnectionError('Abnormal closure', { code });
  }

  if (code === 1007) {
    return new WebSocketInvalidMessageError('Invalid frame payload data', { code });
  }

  if (code === 1008) {
    return new WebSocketProtocolError('Policy violation', { code });
  }

  if (code === 1009) {
    return new WebSocketInvalidMessageError('Message too big', { code });
  }

  if (code === 1011) {
    return new WebSocketError('Internal server error', WebSocketErrorType.CONNECTION_FAILED, {
      code,
    });
  }

  return new WebSocketError(message, WebSocketErrorType.CONNECTION_FAILED, { code });
}

/**
 * Parse Socket.IO errors
 */
export function parseSocketIOError(error: any): WebSocketError {
  const message = error.message || 'Socket.IO error occurred';
  const type = error.type;

  if (type === 'TransportError') {
    return new WebSocketConnectionError('Transport error', { originalError: error });
  }

  if (message.includes('timeout')) {
    return new WebSocketTimeoutError('Socket.IO timeout', { originalError: error });
  }

  if (message.includes('unauthorized') || message.includes('authentication')) {
    return new WebSocketAuthError('Authentication failed', { originalError: error });
  }

  return new WebSocketAdapterError(`Socket.IO error: ${message}`, {
    originalError: error,
  });
}

/**
 * Parse ws library errors
 */
export function parseWsError(error: any): WebSocketError {
  const message = error.message || 'ws library error occurred';

  if (message.includes('ECONNREFUSED') || message.includes('connect')) {
    return new WebSocketConnectionError('Connection refused', { originalError: error });
  }

  if (message.includes('ETIMEDOUT') || message.includes('timeout')) {
    return new WebSocketTimeoutError('Connection timeout', { originalError: error });
  }

  if (message.includes('certificate') || message.includes('SSL')) {
    return new WebSocketConnectionError('SSL/TLS error', { originalError: error });
  }

  return new WebSocketAdapterError(`ws error: ${message}`, { originalError: error });
}

/**
 * Helper to create configuration errors
 */
export function createConfigError(field: string, reason: string): WebSocketConfigurationError {
  return new WebSocketConfigurationError(`Invalid configuration for '${field}': ${reason}`, {
    field,
    reason,
  });
}

/**
 * Helper to create room errors
 */
export function createRoomError(operation: string, room: string, reason?: string): WebSocketRoomError {
  const message = reason
    ? `Room ${operation} failed for '${room}': ${reason}`
    : `Room ${operation} failed for '${room}'`;

  return new WebSocketRoomError(message, { operation, room, reason });
}
