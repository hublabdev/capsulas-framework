/**
 * WebSocket Capsule - Adapters
 *
 * Abstract adapter interface and concrete implementations for different WebSocket providers
 */

import type { WebSocketConfig, WebSocketMessage, WebSocketStats, Room } from './types';
import { WebSocketAdapterError, WebSocketConnectionError, WebSocketSendError } from './errors';
import { INITIAL_STATS } from './constants';
import { buildAuthHeaders, buildAuthQuery, serializeMessage, deserializeMessage } from './utils';

/**
 * Abstract WebSocket adapter interface
 */
export abstract class WebSocketAdapter {
  protected config: WebSocketConfig;
  protected stats: WebSocketStats;
  protected rooms: Map<string, Room>;
  protected connected: boolean;

  constructor(config: WebSocketConfig) {
    this.config = config;
    this.stats = { ...INITIAL_STATS };
    this.rooms = new Map();
    this.connected = false;
  }

  /**
   * Connect to WebSocket server
   */
  abstract connect(): Promise<void>;

  /**
   * Disconnect from WebSocket server
   */
  abstract disconnect(): Promise<void>;

  /**
   * Send message
   */
  abstract send(message: WebSocketMessage): Promise<void>;

  /**
   * Broadcast message to room
   */
  abstract broadcast(room: string, message: WebSocketMessage): Promise<void>;

  /**
   * Join a room
   */
  abstract join(room: string): Promise<void>;

  /**
   * Leave a room
   */
  abstract leave(room: string): Promise<void>;

  /**
   * Register event handler
   */
  abstract on(event: string, handler: (data: any) => void): void;

  /**
   * Remove event handler
   */
  abstract off(event: string, handler: (data: any) => void): void;

  /**
   * Emit event
   */
  abstract emit(event: string, data: any): Promise<void>;

  /**
   * Get connection statistics
   */
  getStats(): WebSocketStats {
    return { ...this.stats };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get rooms
   */
  getRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}

/**
 * Socket.IO adapter implementation (stub)
 */
export class SocketIOAdapter extends WebSocketAdapter {
  private socket: any = null;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();

  async connect(): Promise<void> {
    try {
      // Stub implementation - would use socket.io-client in production
      console.warn('Socket.IO adapter is a stub implementation');

      // Simulate connection
      this.socket = {
        connected: true,
        id: 'socketio_' + Math.random().toString(36).substring(7),
      };

      this.connected = true;
      this.stats.state = 'CONNECTED';
      this.stats.connectedAt = Date.now();
      this.stats.connections = 1;
    } catch (error: any) {
      throw new WebSocketConnectionError('Failed to connect via Socket.IO', {
        error: error.message,
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket = null;
      this.connected = false;
      this.stats.state = 'DISCONNECTED';
      this.stats.connections = 0;
    }
  }

  async send(message: WebSocketMessage): Promise<void> {
    if (!this.connected || !this.socket) {
      throw new WebSocketSendError('Not connected');
    }

    try {
      // Stub implementation
      console.log('[SocketIO Stub] Send:', message);
      this.stats.messagesSent++;
      this.stats.bytesSent += JSON.stringify(message).length;
    } catch (error: any) {
      this.stats.errors++;
      throw new WebSocketSendError('Failed to send message', { error: error.message });
    }
  }

  async broadcast(room: string, message: WebSocketMessage): Promise<void> {
    if (!this.connected) {
      throw new WebSocketSendError('Not connected');
    }

    console.log('[SocketIO Stub] Broadcast to room:', room, message);
    this.stats.messagesSent++;
  }

  async join(room: string): Promise<void> {
    if (!this.connected) {
      throw new WebSocketAdapterError('Not connected');
    }

    if (!this.rooms.has(room)) {
      this.rooms.set(room, {
        name: room,
        members: new Set(),
        createdAt: Date.now(),
      });
      this.stats.rooms = this.rooms.size;
    }

    console.log('[SocketIO Stub] Joined room:', room);
  }

  async leave(room: string): Promise<void> {
    if (this.rooms.has(room)) {
      this.rooms.delete(room);
      this.stats.rooms = this.rooms.size;
    }

    console.log('[SocketIO Stub] Left room:', room);
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  async emit(event: string, data: any): Promise<void> {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      // Execute all handlers and wait for them to complete
      await Promise.all(Array.from(handlers).map(async (handler) => {
        try {
          await handler(data);
        } catch (error) {
          console.error(`Error in handler for event ${event}:`, error);
        }
      }));
    }
  }
}

/**
 * Native WebSocket adapter implementation
 */
export class NativeWSAdapter extends WebSocketAdapter {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.buildConnectionUrl();
        this.ws = new WebSocket(url, this.config.protocols);

        const timeout = setTimeout(() => {
          reject(new WebSocketConnectionError('Connection timeout'));
        }, this.config.timeout || 20000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.connected = true;
          this.stats.state = 'CONNECTED';
          this.stats.connectedAt = Date.now();
          this.stats.connections = 1;
          this.setupEventListeners();
          resolve();
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          this.stats.errors++;
          reject(new WebSocketConnectionError('Connection failed', { error }));
        };
      } catch (error: any) {
        reject(new WebSocketConnectionError('Failed to create WebSocket', {
          error: error.message,
        }));
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.stats.state = 'DISCONNECTED';
      this.stats.connections = 0;
    }
  }

  async send(message: WebSocketMessage): Promise<void> {
    if (!this.connected || !this.ws) {
      throw new WebSocketSendError('Not connected');
    }

    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new WebSocketSendError('WebSocket is not open');
    }

    try {
      const serialized = serializeMessage(message);
      this.ws.send(serialized);
      this.stats.messagesSent++;
      this.stats.bytesSent += serialized.length;
    } catch (error: any) {
      this.stats.errors++;
      throw new WebSocketSendError('Failed to send message', { error: error.message });
    }
  }

  async broadcast(room: string, message: WebSocketMessage): Promise<void> {
    // Native WebSocket doesn't have built-in room support
    // This would need server-side implementation
    await this.send({ ...message, room });
  }

  async join(room: string): Promise<void> {
    // Native WebSocket doesn't have built-in room support
    // Send join message to server
    await this.send({
      event: 'join',
      data: { room },
    });

    if (!this.rooms.has(room)) {
      this.rooms.set(room, {
        name: room,
        members: new Set(),
        createdAt: Date.now(),
      });
      this.stats.rooms = this.rooms.size;
    }
  }

  async leave(room: string): Promise<void> {
    // Send leave message to server
    await this.send({
      event: 'leave',
      data: { room },
    });

    if (this.rooms.has(room)) {
      this.rooms.delete(room);
      this.stats.rooms = this.rooms.size;
    }
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  async emit(event: string, data: any): Promise<void> {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      // Execute all handlers and wait for them to complete
      await Promise.all(Array.from(handlers).map(async (handler) => {
        try {
          await handler(data);
        } catch (error) {
          console.error(`Error in handler for event ${event}:`, error);
        }
      }));
    }
  }

  private buildConnectionUrl(): string {
    let url = this.config.url || '';

    // Add authentication query parameters
    if (this.config.auth) {
      const query = buildAuthQuery(this.config.auth);
      const queryString = new URLSearchParams(query).toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    return url;
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onmessage = (event) => {
      try {
        this.stats.messagesReceived++;
        this.stats.bytesReceived += event.data.length;

        const message = deserializeMessage(event.data);
        const handlers = this.eventHandlers.get(message.event);

        if (handlers) {
          handlers.forEach((handler) => handler(message.data));
        }

        // Also trigger 'message' event
        const messageHandlers = this.eventHandlers.get('message');
        if (messageHandlers) {
          messageHandlers.forEach((handler) => handler(message));
        }
      } catch (error: any) {
        this.stats.errors++;
        console.error('Error processing message:', error);
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.stats.state = 'DISCONNECTED';
      this.stats.connections = 0;

      const handlers = this.eventHandlers.get('disconnect');
      if (handlers) {
        handlers.forEach((handler) => handler({}));
      }
    };

    this.ws.onerror = (error) => {
      this.stats.errors++;

      const handlers = this.eventHandlers.get('error');
      if (handlers) {
        handlers.forEach((handler) => handler(error));
      }
    };
  }
}

/**
 * WS library adapter implementation (stub)
 */
export class WSAdapter extends WebSocketAdapter {
  private ws: any = null;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();

  async connect(): Promise<void> {
    try {
      // Stub implementation - would use 'ws' library in Node.js production
      console.warn('WS adapter is a stub implementation');

      // Simulate connection
      this.ws = {
        readyState: 1, // OPEN
        send: (data: string) => console.log('[WS Stub] Send:', data),
        close: () => console.log('[WS Stub] Close'),
      };

      this.connected = true;
      this.stats.state = 'CONNECTED';
      this.stats.connectedAt = Date.now();
      this.stats.connections = 1;
    } catch (error: any) {
      throw new WebSocketConnectionError('Failed to connect via ws library', {
        error: error.message,
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.stats.state = 'DISCONNECTED';
      this.stats.connections = 0;
    }
  }

  async send(message: WebSocketMessage): Promise<void> {
    if (!this.connected || !this.ws) {
      throw new WebSocketSendError('Not connected');
    }

    try {
      const serialized = serializeMessage(message);
      this.ws.send(serialized);
      this.stats.messagesSent++;
      this.stats.bytesSent += serialized.length;
    } catch (error: any) {
      this.stats.errors++;
      throw new WebSocketSendError('Failed to send message', { error: error.message });
    }
  }

  async broadcast(room: string, message: WebSocketMessage): Promise<void> {
    console.log('[WS Stub] Broadcast to room:', room, message);
    this.stats.messagesSent++;
  }

  async join(room: string): Promise<void> {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, {
        name: room,
        members: new Set(),
        createdAt: Date.now(),
      });
      this.stats.rooms = this.rooms.size;
    }

    console.log('[WS Stub] Joined room:', room);
  }

  async leave(room: string): Promise<void> {
    if (this.rooms.has(room)) {
      this.rooms.delete(room);
      this.stats.rooms = this.rooms.size;
    }

    console.log('[WS Stub] Left room:', room);
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  async emit(event: string, data: any): Promise<void> {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      // Execute all handlers and wait for them to complete
      await Promise.all(Array.from(handlers).map(async (handler) => {
        try {
          await handler(data);
        } catch (error) {
          console.error(`Error in handler for event ${event}:`, error);
        }
      }));
    }
  }
}

/**
 * Create appropriate adapter based on provider
 */
export function createAdapter(config: WebSocketConfig): WebSocketAdapter {
  switch (config.provider) {
    case 'socket.io':
      return new SocketIOAdapter(config);

    case 'native':
      return new NativeWSAdapter(config);

    case 'ws':
      return new WSAdapter(config);

    default:
      throw new WebSocketAdapterError(`Unknown provider: ${config.provider}`);
  }
}
