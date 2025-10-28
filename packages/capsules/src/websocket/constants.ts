/**
 * WebSocket Capsule - Constants
 *
 * Default configurations and constant values
 */

import type { WebSocketConfig, WebSocketStats } from './types';

/**
 * Default WebSocket configuration
 */
export const DEFAULT_CONFIG: Partial<WebSocketConfig> = {
  provider: 'native',
  port: 3000,
  path: '/socket.io',
  protocols: [],
  reconnect: true,
  reconnectDelay: 1000,
  reconnectAttempts: 5,
  reconnectBackoff: 1.5,
  maxReconnectDelay: 30000,
  heartbeat: true,
  heartbeatInterval: 30000,
  timeout: 20000,
  compression: false,
  binaryType: 'arraybuffer',
  maxMessageSize: 1024 * 1024, // 1MB
  queueMessages: true,
  maxQueueSize: 100,
  autoJoinRooms: [],
};

/**
 * Initial statistics
 */
export const INITIAL_STATS: WebSocketStats = {
  state: 'DISCONNECTED',
  messagesSent: 0,
  messagesReceived: 0,
  bytesSent: 0,
  bytesReceived: 0,
  reconnectAttempts: 0,
  errors: 0,
  connections: 0,
  rooms: 0,
  uptime: 0,
  averageLatency: 0,
};

/**
 * Reconnection configuration
 */
export const RECONNECT_CONFIG = {
  /**
   * Initial delay in milliseconds
   */
  INITIAL_DELAY: 1000,

  /**
   * Maximum delay in milliseconds
   */
  MAX_DELAY: 30000,

  /**
   * Backoff multiplier
   */
  BACKOFF_MULTIPLIER: 1.5,

  /**
   * Maximum reconnection attempts (0 = unlimited)
   */
  MAX_ATTEMPTS: 5,

  /**
   * Jitter factor (0-1) to add randomness to delay
   */
  JITTER: 0.1,
} as const;

/**
 * Ping/Pong configuration
 */
export const PING_CONFIG = {
  /**
   * Ping interval in milliseconds
   */
  INTERVAL: 30000,

  /**
   * Ping timeout in milliseconds
   */
  TIMEOUT: 5000,

  /**
   * Maximum missed pings before reconnect
   */
  MAX_MISSED: 3,
} as const;

/**
 * Message queue configuration
 */
export const QUEUE_CONFIG = {
  /**
   * Maximum queue size
   */
  MAX_SIZE: 100,

  /**
   * Maximum message age in milliseconds
   */
  MAX_AGE: 60000,

  /**
   * Maximum retry attempts per message
   */
  MAX_RETRIES: 3,
} as const;

/**
 * Connection timeout values
 */
export const TIMEOUT_CONFIG = {
  /**
   * Connection timeout in milliseconds
   */
  CONNECTION: 20000,

  /**
   * Message send timeout in milliseconds
   */
  SEND: 5000,

  /**
   * Message acknowledgment timeout in milliseconds
   */
  ACK: 10000,

  /**
   * Handshake timeout in milliseconds
   */
  HANDSHAKE: 10000,
} as const;

/**
 * WebSocket close codes
 */
export const CLOSE_CODES = {
  NORMAL: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  NO_STATUS: 1005,
  ABNORMAL: 1006,
  INVALID_PAYLOAD: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  MANDATORY_EXTENSION: 1010,
  INTERNAL_ERROR: 1011,
  SERVICE_RESTART: 1012,
  TRY_AGAIN_LATER: 1013,
  BAD_GATEWAY: 1014,
  TLS_HANDSHAKE: 1015,
} as const;

/**
 * Socket.IO event names
 */
export const SOCKETIO_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_ERROR: 'reconnect_error',
  RECONNECT_FAILED: 'reconnect_failed',
  PING: 'ping',
  PONG: 'pong',
} as const;

/**
 * Native WebSocket event names
 */
export const NATIVE_EVENTS = {
  OPEN: 'open',
  CLOSE: 'close',
  ERROR: 'error',
  MESSAGE: 'message',
} as const;

/**
 * Room operation types
 */
export const ROOM_OPERATIONS = {
  JOIN: 'join',
  LEAVE: 'leave',
  BROADCAST: 'broadcast',
  LIST: 'list',
} as const;

/**
 * Message priority levels
 */
export const MESSAGE_PRIORITY = {
  LOW: 0,
  NORMAL: 50,
  HIGH: 100,
  CRITICAL: 200,
} as const;

/**
 * Authentication types
 */
export const AUTH_TYPES = {
  TOKEN: 'token',
  BASIC: 'basic',
  QUERY: 'query',
  CUSTOM: 'custom',
} as const;

/**
 * Compression threshold in bytes
 */
export const COMPRESSION_THRESHOLD = 1024;

/**
 * Maximum message size in bytes
 */
export const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB

/**
 * Maximum room name length
 */
export const MAX_ROOM_NAME_LENGTH = 100;

/**
 * Maximum connections per room
 */
export const MAX_ROOM_CONNECTIONS = 1000;

/**
 * Event handler priority range
 */
export const HANDLER_PRIORITY = {
  MIN: 0,
  MAX: 1000,
  DEFAULT: 500,
} as const;
