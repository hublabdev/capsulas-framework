/**
 * WebSocket Capsule - Service
 *
 * Main WebSocketService class with lifecycle methods
 */

import type {
  WebSocketConfig,
  WebSocketMessage,
  WebSocketStats,
  EventHandler,
  BroadcastOptions,
  SendOptions,
  QueuedMessage,
} from './types';
import { createAdapter, WebSocketAdapter } from './adapters';
import {
  WebSocketInitializationError,
  WebSocketSendError,
  WebSocketRoomError,
  WebSocketQueueFullError,
  WebSocketConnectionError,
  WebSocketReconnectError,
} from './errors';
import { DEFAULT_CONFIG, INITIAL_STATS, RECONNECT_CONFIG, PING_CONFIG, QUEUE_CONFIG } from './constants';
import {
  generateMessageId,
  calculateReconnectDelay,
  validateRoomName,
  createTimeout,
} from './utils';

/**
 * WebSocket Service
 * Main service class implementing WebSocket operations
 */
export class WebSocketService {
  private adapter: WebSocketAdapter | null = null;
  private config: WebSocketConfig;
  private initialized = false;
  private startTime = 0;
  private reconnectAttempt = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private messageQueue: QueuedMessage[] = [];
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Initialize WebSocket service
   * Sets up adapter and establishes connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new WebSocketInitializationError('WebSocket service already initialized');
    }

    try {
      this.adapter = createAdapter(this.config);
      this.startTime = Date.now();
      this.initialized = true; // Set before connect() to avoid circular dependency

      await this.connect();

      // Auto-join rooms if configured
      if (this.config.autoJoinRooms && this.config.autoJoinRooms.length > 0) {
        for (const room of this.config.autoJoinRooms) {
          await this.join(room);
        }
      }
    } catch (error: any) {
      this.initialized = false; // Reset on failure
      throw new WebSocketInitializationError('Failed to initialize WebSocket service', {
        error: error.message,
      });
    }
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    this.ensureInitialized();

    try {
      await this.adapter!.connect();
      this.reconnectAttempt = 0;

      // Start ping/pong if enabled
      if (this.config.heartbeat) {
        this.startPing();
      }

      // Process queued messages
      await this.processMessageQueue();

      // Emit connection event
      await this.emitLocal('connection', {});
    } catch (error: any) {
      throw new WebSocketConnectionError('Failed to connect', {
        error: error.message,
      });
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  async disconnect(): Promise<void> {
    this.ensureInitialized();

    try {
      this.stopPing();
      this.stopReconnect();

      if (this.adapter) {
        await this.adapter.disconnect();
      }

      await this.emitLocal('disconnect', {});
    } catch (error: any) {
      throw new WebSocketConnectionError('Failed to disconnect', {
        error: error.message,
      });
    }
  }

  /**
   * Send message to server
   */
  async send(event: string, data: any, options?: SendOptions): Promise<void> {
    this.ensureInitialized();

    const message: WebSocketMessage = {
      event,
      data,
      id: generateMessageId(),
      timestamp: Date.now(),
    };

    // Check if connected
    if (!this.adapter!.isConnected()) {
      if (this.config.queueMessages) {
        this.queueMessage(message, options);
        return;
      }
      throw new WebSocketSendError('Not connected and message queuing is disabled');
    }

    try {
      await this.adapter!.send(message);
    } catch (error: any) {
      // Retry if configured
      if (options?.retry && (options.retries || 0) > 0) {
        this.queueMessage(message, {
          ...options,
          retries: (options.retries || 0) - 1,
        });
      } else {
        throw new WebSocketSendError('Failed to send message', {
          error: error.message,
          message,
        });
      }
    }
  }

  /**
   * Broadcast message to room(s)
   */
  async broadcast(
    event: string,
    data: any,
    options?: BroadcastOptions
  ): Promise<void> {
    this.ensureInitialized();

    if (!this.adapter!.isConnected()) {
      throw new WebSocketSendError('Not connected');
    }

    const message: WebSocketMessage = {
      event,
      data,
      id: generateMessageId(),
      timestamp: Date.now(),
    };

    try {
      // Handle room-based broadcast
      if (options?.rooms) {
        const rooms = Array.isArray(options.rooms) ? options.rooms : [options.rooms];

        for (const room of rooms) {
          await this.adapter!.broadcast(room, message);
        }
      } else {
        // Broadcast to all
        await this.adapter!.send(message);
      }
    } catch (error: any) {
      throw new WebSocketSendError('Failed to broadcast message', {
        error: error.message,
        message,
        options,
      });
    }
  }

  /**
   * Join a room
   */
  async join(room: string): Promise<void> {
    this.ensureInitialized();

    if (!validateRoomName(room)) {
      throw new WebSocketRoomError(`Invalid room name: ${room}`, { room });
    }

    if (!this.adapter!.isConnected()) {
      throw new WebSocketRoomError('Not connected', { room });
    }

    try {
      await this.adapter!.join(room);
    } catch (error: any) {
      throw new WebSocketRoomError(`Failed to join room: ${room}`, {
        error: error.message,
        room,
      });
    }
  }

  /**
   * Leave a room
   */
  async leave(room: string): Promise<void> {
    this.ensureInitialized();

    if (!this.adapter!.isConnected()) {
      throw new WebSocketRoomError('Not connected', { room });
    }

    try {
      await this.adapter!.leave(room);
    } catch (error: any) {
      throw new WebSocketRoomError(`Failed to leave room: ${room}`, {
        error: error.message,
        room,
      });
    }
  }

  /**
   * Register event handler
   */
  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);

    // Register with adapter
    if (this.adapter) {
      this.adapter.on(event, handler);
    }
  }

  /**
   * Remove event handler
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }

    // Remove from adapter as well
    if (this.adapter) {
      this.adapter.off(event, handler);
    }
  }

  /**
   * Register one-time event handler
   */
  once(event: string, handler: EventHandler): void {
    const onceHandler: EventHandler = async (data) => {
      await handler(data);
      this.off(event, onceHandler);
    };

    this.on(event, onceHandler);
  }

  /**
   * Emit event locally (triggers registered handlers)
   */
  async emit(event: string, data: any): Promise<void> {
    this.ensureInitialized();

    if (!this.adapter!.isConnected()) {
      throw new WebSocketSendError('Not connected');
    }

    await this.adapter!.emit(event, data);
  }

  /**
   * Get list of joined rooms
   */
  getRooms(): string[] {
    if (!this.adapter) {
      return [];
    }

    return this.adapter.getRooms();
  }

  /**
   * Get connection statistics
   */
  getStats(): WebSocketStats {
    if (!this.adapter) {
      return {
        ...INITIAL_STATS,
        uptime: 0,
      };
    }

    const stats = this.adapter.getStats();
    stats.uptime = this.startTime > 0 ? Date.now() - this.startTime : 0;

    return stats;
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<WebSocketConfig> {
    return { ...this.config };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.adapter ? this.adapter.isConnected() : false;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    provider: string;
    connected: boolean;
    uptime: number;
    stats: WebSocketStats;
  }> {
    const stats = this.getStats();
    const connected = this.isConnected();

    return {
      healthy: this.initialized && connected,
      provider: this.config.provider || 'none',
      connected,
      uptime: stats.uptime,
      stats,
    };
  }

  /**
   * Cleanup resources and disconnect
   */
  async cleanup(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      this.stopPing();
      this.stopReconnect();
      this.messageQueue = [];
      this.eventHandlers.clear();

      if (this.adapter) {
        await this.adapter.disconnect();
        this.adapter = null;
      }

      this.initialized = false;
    } catch (error: any) {
      throw new Error(`Failed to cleanup WebSocket service: ${error.message}`);
    }
  }

  /**
   * Start automatic reconnection
   */
  private async attemptReconnect(): Promise<void> {
    if (!this.config.reconnect) {
      return;
    }

    const maxAttempts = this.config.reconnectAttempts || RECONNECT_CONFIG.MAX_ATTEMPTS;

    if (maxAttempts > 0 && this.reconnectAttempt >= maxAttempts) {
      await this.emitLocal('reconnect_failed', { attempts: this.reconnectAttempt });
      throw new WebSocketReconnectError(this.reconnectAttempt);
    }

    this.reconnectAttempt++;
    await this.emitLocal('reconnect_attempt', { attempt: this.reconnectAttempt });

    const delay = calculateReconnectDelay(
      this.reconnectAttempt,
      this.config.reconnectDelay || RECONNECT_CONFIG.INITIAL_DELAY,
      this.config.maxReconnectDelay || RECONNECT_CONFIG.MAX_DELAY,
      this.config.reconnectBackoff || RECONNECT_CONFIG.BACKOFF_MULTIPLIER,
      RECONNECT_CONFIG.JITTER
    );

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
        await this.emitLocal('reconnect', { attempt: this.reconnectAttempt });
      } catch (error: any) {
        await this.attemptReconnect();
      }
    }, delay);
  }

  /**
   * Stop reconnection attempts
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempt = 0;
  }

  /**
   * Start ping/pong heartbeat
   */
  private startPing(): void {
    const interval = this.config.heartbeatInterval || PING_CONFIG.INTERVAL;

    this.pingTimer = setInterval(async () => {
      try {
        await this.send('ping', { timestamp: Date.now() });
      } catch (error) {
        // Ping failed, might need to reconnect
        console.error('Ping failed:', error);
      }
    }, interval);
  }

  /**
   * Stop ping/pong heartbeat
   */
  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /**
   * Queue message for later delivery
   */
  private queueMessage(message: WebSocketMessage, options?: SendOptions): void {
    const maxSize = this.config.maxQueueSize || QUEUE_CONFIG.MAX_SIZE;

    if (this.messageQueue.length >= maxSize) {
      throw new WebSocketQueueFullError(maxSize);
    }

    this.messageQueue.push({
      message,
      options,
      queuedAt: Date.now(),
      retries: 0,
    });
  }

  /**
   * Process queued messages
   */
  private async processMessageQueue(): Promise<void> {
    const maxAge = QUEUE_CONFIG.MAX_AGE;
    const now = Date.now();

    // Filter out old messages
    this.messageQueue = this.messageQueue.filter(
      (queued) => now - queued.queuedAt < maxAge
    );

    // Send queued messages
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const queued of queue) {
      try {
        await this.adapter!.send(queued.message);
      } catch (error) {
        // Re-queue if retries remain
        if (queued.retries < QUEUE_CONFIG.MAX_RETRIES) {
          this.messageQueue.push({
            ...queued,
            retries: queued.retries + 1,
          });
        }
      }
    }
  }

  /**
   * Emit event locally (without sending to server)
   */
  private async emitLocal(event: string, data: any): Promise<void> {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.adapter) {
      throw new WebSocketInitializationError(
        'WebSocket service not initialized. Call initialize() first.'
      );
    }
  }
}

/**
 * Create and initialize WebSocket service
 */
export async function createWebSocketService(
  config: WebSocketConfig
): Promise<WebSocketService> {
  const service = new WebSocketService(config);
  await service.initialize();
  return service;
}

/**
 * Create WebSocket service factory
 * Returns a function that creates pre-configured WebSocket instances
 */
export function createWebSocketFactory(defaultConfig: WebSocketConfig) {
  return async (overrides?: Partial<WebSocketConfig>): Promise<WebSocketService> => {
    const config = { ...defaultConfig, ...overrides };
    return await createWebSocketService(config);
  };
}
