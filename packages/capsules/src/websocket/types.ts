/**
 * WebSocket Capsule - Type Definitions
 *
 * Type-safe WebSocket system with support for Socket.IO, native WebSocket, and ws
 */

/**
 * Supported WebSocket provider types
 */
export type WebSocketProvider = 'socket.io' | 'native' | 'ws';

/**
 * WebSocket connection state
 */
export type WebSocketState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR';

/**
 * WebSocket event types
 */
export type WebSocketEventType =
  | 'connection'
  | 'disconnect'
  | 'error'
  | 'message'
  | 'reconnect'
  | 'reconnect_attempt'
  | 'reconnect_failed'
  | 'ping'
  | 'pong';

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  /**
   * Provider type to use
   */
  provider: WebSocketProvider;

  /**
   * WebSocket server URL
   */
  url?: string;

  /**
   * Server port (for Socket.IO and ws)
   */
  port?: number;

  /**
   * Server path (for Socket.IO)
   */
  path?: string;

  /**
   * WebSocket protocols
   */
  protocols?: string | string[];

  /**
   * Enable automatic reconnection
   */
  reconnect?: boolean;

  /**
   * Reconnection delay in milliseconds
   */
  reconnectDelay?: number;

  /**
   * Maximum reconnection attempts (0 = unlimited)
   */
  reconnectAttempts?: number;

  /**
   * Reconnection backoff multiplier
   */
  reconnectBackoff?: number;

  /**
   * Maximum reconnection delay
   */
  maxReconnectDelay?: number;

  /**
   * Enable heartbeat/ping-pong
   */
  heartbeat?: boolean;

  /**
   * Heartbeat interval in milliseconds
   */
  heartbeatInterval?: number;

  /**
   * Connection timeout in milliseconds
   */
  timeout?: number;

  /**
   * Custom headers for connection
   */
  headers?: Record<string, string>;

  /**
   * Authentication configuration
   */
  auth?: WebSocketAuthConfig;

  /**
   * Enable compression
   */
  compression?: boolean;

  /**
   * Binary message type
   */
  binaryType?: 'blob' | 'arraybuffer';

  /**
   * Maximum message size in bytes
   */
  maxMessageSize?: number;

  /**
   * Enable message queue when disconnected
   */
  queueMessages?: boolean;

  /**
   * Maximum queued messages
   */
  maxQueueSize?: number;

  /**
   * Auto-join rooms on connect
   */
  autoJoinRooms?: string[];
}

/**
 * WebSocket authentication configuration
 */
export interface WebSocketAuthConfig {
  /**
   * Auth type
   */
  type: 'token' | 'basic' | 'query' | 'custom';

  /**
   * Auth token
   */
  token?: string;

  /**
   * Username for basic auth
   */
  username?: string;

  /**
   * Password for basic auth
   */
  password?: string;

  /**
   * Query parameters for auth
   */
  query?: Record<string, string>;

  /**
   * Custom auth headers
   */
  headers?: Record<string, string>;
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<T = any> {
  /**
   * Event name/type
   */
  event: string;

  /**
   * Message data/payload
   */
  data: T;

  /**
   * Message ID
   */
  id?: string;

  /**
   * Timestamp
   */
  timestamp?: number;

  /**
   * Target room (for broadcast)
   */
  room?: string;

  /**
   * Message metadata
   */
  metadata?: Record<string, any>;
}

/**
 * WebSocket connection information
 */
export interface Connection {
  /**
   * Unique connection ID
   */
  id: string;

  /**
   * Connection state
   */
  state: WebSocketState;

  /**
   * Connected timestamp
   */
  connectedAt: number;

  /**
   * Reconnection count
   */
  reconnectCount: number;

  /**
   * Current rooms joined
   */
  rooms: Set<string>;

  /**
   * Connection metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Room configuration
 */
export interface Room {
  /**
   * Room name/ID
   */
  name: string;

  /**
   * Connection IDs in room
   */
  members: Set<string>;

  /**
   * Room creation timestamp
   */
  createdAt: number;

  /**
   * Room metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Event handler function
 */
export type EventHandler<T = any> = (data: T, connection?: Connection) => void | Promise<void>;

/**
 * Event handler registration
 */
export interface EventHandlerRegistration {
  /**
   * Event name
   */
  event: string;

  /**
   * Handler function
   */
  handler: EventHandler;

  /**
   * Handler priority (higher = earlier execution)
   */
  priority?: number;

  /**
   * Execute only once
   */
  once?: boolean;
}

/**
 * WebSocket statistics
 */
export interface WebSocketStats {
  /**
   * Current connection state
   */
  state: WebSocketState;

  /**
   * Total messages sent
   */
  messagesSent: number;

  /**
   * Total messages received
   */
  messagesReceived: number;

  /**
   * Total bytes sent
   */
  bytesSent: number;

  /**
   * Total bytes received
   */
  bytesReceived: number;

  /**
   * Total reconnection attempts
   */
  reconnectAttempts: number;

  /**
   * Total errors
   */
  errors: number;

  /**
   * Current connection count
   */
  connections: number;

  /**
   * Total rooms
   */
  rooms: number;

  /**
   * Connection established timestamp
   */
  connectedAt?: number;

  /**
   * Uptime in milliseconds
   */
  uptime: number;

  /**
   * Average latency in milliseconds
   */
  averageLatency: number;

  /**
   * Last ping timestamp
   */
  lastPing?: number;
}

/**
 * Broadcast options
 */
export interface BroadcastOptions {
  /**
   * Target room(s)
   */
  rooms?: string | string[];

  /**
   * Exclude specific connections
   */
  exclude?: string | string[];

  /**
   * Include specific connections only
   */
  include?: string | string[];

  /**
   * Volatile flag (don't queue if offline)
   */
  volatile?: boolean;

  /**
   * Compression flag
   */
  compress?: boolean;
}

/**
 * Send message options
 */
export interface SendOptions {
  /**
   * Expect acknowledgment
   */
  ack?: boolean;

  /**
   * Acknowledgment timeout
   */
  ackTimeout?: number;

  /**
   * Retry on failure
   */
  retry?: boolean;

  /**
   * Number of retry attempts
   */
  retries?: number;

  /**
   * Compression flag
   */
  compress?: boolean;
}

/**
 * Message queue entry
 */
export interface QueuedMessage {
  /**
   * Message to send
   */
  message: WebSocketMessage;

  /**
   * Send options
   */
  options?: SendOptions;

  /**
   * Queued timestamp
   */
  queuedAt: number;

  /**
   * Retry count
   */
  retries: number;
}
