/**
 * WebSocket Capsule - Main Entry Point
 *
 * Exports all public APIs for the WebSocket capsule
 */

// Types
export type {
  WebSocketProvider,
  WebSocketState,
  WebSocketEventType,
  WebSocketConfig,
  WebSocketAuthConfig,
  WebSocketMessage,
  Connection,
  Room,
  EventHandler,
  EventHandlerRegistration,
  WebSocketStats,
  BroadcastOptions,
  SendOptions,
  QueuedMessage,
} from './types';

// Errors
export {
  WebSocketErrorType,
  WebSocketError,
  WebSocketConnectionError,
  WebSocketDisconnectionError,
  WebSocketSendError,
  WebSocketReceiveError,
  WebSocketInvalidMessageError,
  WebSocketRoomError,
  WebSocketAuthError,
  WebSocketTimeoutError,
  WebSocketProtocolError,
  WebSocketConfigurationError,
  WebSocketAdapterError,
  WebSocketReconnectError,
  WebSocketQueueFullError,
  WebSocketInitializationError,
  isWebSocketError,
  isWebSocketErrorType,
  parseNativeWebSocketError,
  parseSocketIOError,
  parseWsError,
  createConfigError,
  createRoomError,
} from './errors';

// Constants
export {
  DEFAULT_CONFIG,
  INITIAL_STATS,
  RECONNECT_CONFIG,
  PING_CONFIG,
  QUEUE_CONFIG,
  TIMEOUT_CONFIG,
  CLOSE_CODES,
  SOCKETIO_EVENTS,
  NATIVE_EVENTS,
  ROOM_OPERATIONS,
  MESSAGE_PRIORITY,
  AUTH_TYPES,
  COMPRESSION_THRESHOLD,
  MAX_MESSAGE_SIZE,
  MAX_ROOM_NAME_LENGTH,
  MAX_ROOM_CONNECTIONS,
  HANDLER_PRIORITY,
} from './constants';

// Utils
export {
  validateMessage,
  serializeMessage,
  deserializeMessage,
  generateConnectionId,
  generateMessageId,
  parseUrl,
  buildUrl,
  validateRoomName,
  calculateReconnectDelay,
  buildAuthHeaders,
  buildAuthQuery,
  estimateMessageSize,
  isBinaryMessage,
  binaryToString,
  stringToBinary,
  debounce,
  throttle,
  createTimeout,
  waitFor,
  retry,
} from './utils';

// Adapters
export {
  WebSocketAdapter,
  SocketIOAdapter,
  NativeWSAdapter,
  WSAdapter,
  createAdapter,
} from './adapters';

// Service
export {
  WebSocketService,
  createWebSocketService,
  createWebSocketFactory,
} from './service';

// Default export
export { WebSocketService as default } from './service';
