import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketService, createWebSocketService, createWebSocketFactory } from '../service';
import {
  WebSocketInitializationError,
  WebSocketSendError,
  WebSocketRoomError,
  WebSocketConnectionError,
} from '../errors';
import type { WebSocketConfig } from '../types';

/**
 * WebSocket Service Tests
 *
 * NOTE: There is a design issue in the WebSocketService where connect() calls ensureInitialized(),
 * but initialize() calls connect() before setting this.initialized = true. This causes initialization
 * to fail. These tests use Socket.IO and WS stub adapters which bypass some of these issues.
 *
 * For production use, the service code would need to be refactored to either:
 * 1. Not call ensureInitialized() in connect() when called from initialize()
 * 2. Set initialized=true before calling connect() in initialize()
 * 3. Have a separate internal _connect() method that doesn't check initialization
 */

describe('WebSocketService', () => {
  let service: WebSocketService;

  afterEach(async () => {
    if (service) {
      try {
        await service.cleanup();
      } catch (e) {
        // Ignore cleanup errors in tests
      }
    }
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create service instance with socket.io provider', async () => {
      // Socket.IO stub provider works because it simulates connection immediately
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });

      expect(service).toBeDefined();
      expect(service.isConnected()).toBe(true);
      expect(service.getConfig().provider).toBe('socket.io');
    });

    it('should create service instance with ws provider', async () => {
      service = await createWebSocketService({
        provider: 'ws',
        url: 'ws://localhost:3000',
      });

      expect(service).toBeDefined();
      expect(service.isConnected()).toBe(true);
      expect(service.getConfig().provider).toBe('ws');
    });

    it('should throw error on double initialization', async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });

      await expect(service.initialize()).rejects.toThrow(WebSocketInitializationError);
      await expect(service.initialize()).rejects.toThrow('WebSocket service already initialized');
    });

    it('should throw error when using service before initialization', async () => {
      service = new WebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });

      // These operations should fail before initialization
      await expect(service.send('test', {})).rejects.toThrow(WebSocketInitializationError);
      await expect(service.join('room')).rejects.toThrow(WebSocketInitializationError);
      await expect(service.emit('event', {})).rejects.toThrow(WebSocketInitializationError);
    });

    it('should merge with default configuration', async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });

      const config = service.getConfig();
      expect(config.reconnect).toBe(true);
      expect(config.heartbeat).toBe(true);
      expect(config.queueMessages).toBe(true);
      expect(config.maxQueueSize).toBe(100);
    });

    it('should accept custom configuration', async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
        reconnect: false,
        heartbeat: false,
        maxQueueSize: 50,
      });

      const config = service.getConfig();
      expect(config.reconnect).toBe(false);
      expect(config.heartbeat).toBe(false);
      expect(config.maxQueueSize).toBe(50);
    });
  });

  describe('Connection State', () => {
    beforeEach(async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });
    });

    it('should report connected state', () => {
      expect(service.isConnected()).toBe(true);
    });

    it('should report disconnected state after disconnect', async () => {
      await service.disconnect();
      expect(service.isConnected()).toBe(false);
    });

    it('should have connected state in statistics', () => {
      const stats = service.getStats();
      expect(stats.state).toBe('CONNECTED');
      expect(stats.connections).toBe(1);
    });
  });

  describe('Message Sending', () => {
    beforeEach(async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });
    });

    it('should send message with event and data', async () => {
      await expect(
        service.send('chat:message', { text: 'Hello World', userId: 1 })
      ).resolves.not.toThrow();
    });

    it('should send message with options', async () => {
      await expect(
        service.send('test', { data: 'value' }, {
          retry: true,
          retries: 3,
          compress: true,
        })
      ).resolves.not.toThrow();
    });

    it('should throw error when sending while disconnected without queue', async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
        queueMessages: false,
      });

      await service.disconnect();

      await expect(
        service.send('test', {})
      ).rejects.toThrow(WebSocketSendError);
    });

    it('should track statistics on send', async () => {
      await service.send('test1', { value: 1 });
      await service.send('test2', { value: 2 });

      const stats = service.getStats();
      expect(stats.messagesSent).toBeGreaterThanOrEqual(2);
      expect(stats.bytesSent).toBeGreaterThan(0);
    });
  });

  describe('Broadcasting', () => {
    beforeEach(async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });
    });

    it('should broadcast message to single room', async () => {
      await service.join('lobby');
      await expect(
        service.broadcast('announcement', { text: 'Hello all' }, {
          rooms: 'lobby',
        })
      ).resolves.not.toThrow();
    });

    it('should broadcast message to multiple rooms', async () => {
      await service.join('lobby');
      await service.join('general');

      await expect(
        service.broadcast('announcement', { text: 'Hello all' }, {
          rooms: ['lobby', 'general'],
        })
      ).resolves.not.toThrow();
    });

    it('should broadcast to all when no rooms specified', async () => {
      await expect(
        service.broadcast('global', { message: 'Everyone' })
      ).resolves.not.toThrow();
    });

    it('should throw error when broadcasting while disconnected', async () => {
      await service.disconnect();

      await expect(
        service.broadcast('test', {})
      ).rejects.toThrow(WebSocketSendError);
    });
  });

  describe('Room Management', () => {
    beforeEach(async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });
    });

    it('should join a room', async () => {
      await service.join('lobby');

      const rooms = service.getRooms();
      expect(rooms).toContain('lobby');
    });

    it('should leave a room', async () => {
      await service.join('lobby');
      await service.leave('lobby');

      const rooms = service.getRooms();
      expect(rooms).not.toContain('lobby');
    });

    it('should join multiple rooms', async () => {
      await service.join('lobby');
      await service.join('general');
      await service.join('announcements');

      const rooms = service.getRooms();
      expect(rooms).toHaveLength(3);
      expect(rooms).toContain('lobby');
      expect(rooms).toContain('general');
      expect(rooms).toContain('announcements');
    });

    it('should throw error for invalid room name', async () => {
      await expect(service.join('')).rejects.toThrow(WebSocketRoomError);
      await expect(service.join('room with spaces')).rejects.toThrow(WebSocketRoomError);
      await expect(service.join('room@invalid')).rejects.toThrow(WebSocketRoomError);
    });

    it('should throw error when joining while disconnected', async () => {
      await service.disconnect();
      await expect(service.join('lobby')).rejects.toThrow(WebSocketRoomError);
    });

    it('should throw error when leaving while disconnected', async () => {
      await service.join('lobby');
      await service.disconnect();
      await expect(service.leave('lobby')).rejects.toThrow(WebSocketRoomError);
    });

    it('should track room statistics', async () => {
      await service.join('lobby');
      await service.join('general');

      const stats = service.getStats();
      expect(stats.rooms).toBe(2);
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });
    });

    it('should register event handler', () => {
      const handler = vi.fn();
      service.on('test', handler);

      // Handler should be registered
      expect(handler).not.toHaveBeenCalled();
    });

    it('should trigger event handler', async () => {
      const handler = vi.fn();
      service.on('test', handler);

      await service.emit('test', { data: 'value' });
      expect(handler).toHaveBeenCalledWith({ data: 'value' });
    });

    it('should remove event handler', async () => {
      const handler = vi.fn();
      service.on('test', handler);
      service.off('test', handler);

      await service.emit('test', { data: 'value' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should register once event handler', async () => {
      const handler = vi.fn();
      service.once('test', handler);

      await service.emit('test', { data: '1' });
      await service.emit('test', { data: '2' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ data: '1' });
    });

    it('should handle multiple event handlers', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      service.on('test', handler1);
      service.on('test', handler2);
      service.on('test', handler3);

      await service.emit('test', { data: 'value' });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
    });

    it('should handle async event handlers', async () => {
      let executed = false;
      const handler = vi.fn(async (data: any) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        executed = true;
      });

      service.on('test', handler);
      await service.emit('test', { data: 'value' });

      expect(handler).toHaveBeenCalled();
      expect(executed).toBe(true);
    });

    it('should throw error when emitting while disconnected', async () => {
      await service.disconnect();
      await expect(service.emit('test', {})).rejects.toThrow(WebSocketSendError);
    });
  });

  describe('Message Queue', () => {
    beforeEach(async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
        queueMessages: true,
        maxQueueSize: 5,
      });
    });

    it('should queue messages when disconnected', async () => {
      await service.disconnect();

      // These should be queued without throwing
      await service.send('test1', { data: '1' });
      await service.send('test2', { data: '2' });

      // Messages are queued, no error
      expect(service.isConnected()).toBe(false);
    });

    it('should not queue when queueMessages is false', async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
        queueMessages: false,
      });

      await service.disconnect();

      await expect(service.send('test', {})).rejects.toThrow(WebSocketSendError);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });
    });

    it('should track messages sent', async () => {
      await service.send('test1', { data: 1 });
      await service.send('test2', { data: 2 });

      const stats = service.getStats();
      expect(stats.messagesSent).toBeGreaterThanOrEqual(2);
    });

    it('should track bytes sent', async () => {
      await service.send('test', { data: 'value' });

      const stats = service.getStats();
      expect(stats.bytesSent).toBeGreaterThan(0);
    });

    it('should track connection state', () => {
      const stats = service.getStats();
      expect(stats.state).toBe('CONNECTED');
      expect(stats.connections).toBe(1);
    });

    it('should track uptime', async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));

      const stats = service.getStats();
      expect(stats.uptime).toBeGreaterThan(0);
    });

    it('should track rooms', async () => {
      await service.join('room1');
      await service.join('room2');

      const stats = service.getStats();
      expect(stats.rooms).toBe(2);
    });

    it('should return initial stats when not initialized', () => {
      const uninitializedService = new WebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });

      const stats = uninitializedService.getStats();
      expect(stats.state).toBe('DISCONNECTED');
      expect(stats.messagesSent).toBe(0);
      expect(stats.uptime).toBe(0);
    });
  });

  describe('Cleanup', () => {
    beforeEach(async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });
    });

    it('should cleanup resources', async () => {
      await service.join('room1');
      await service.send('test', { data: 'value' });

      await service.cleanup();

      expect(service.isConnected()).toBe(false);
      expect(service.getRooms()).toHaveLength(0);
    });

    it('should handle cleanup when not initialized', async () => {
      const uninitializedService = new WebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });

      await expect(uninitializedService.cleanup()).resolves.not.toThrow();
    });

    it('should clear event handlers on cleanup', async () => {
      const handler = vi.fn();
      service.on('test', handler);

      await service.cleanup();

      // After cleanup, trying to emit should fail since service is not initialized
      try {
        await service.emit('test', {});
      } catch (e) {
        // Expected - service not initialized
      }
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Health Check', () => {
    beforeEach(async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });
    });

    it('should return health status', async () => {
      const health = await service.healthCheck();

      expect(health.healthy).toBe(true);
      expect(health.connected).toBe(true);
      expect(health.provider).toBe('socket.io');
      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should report unhealthy when disconnected', async () => {
      await service.disconnect();

      const health = await service.healthCheck();
      expect(health.healthy).toBe(false);
      expect(health.connected).toBe(false);
    });

    it('should include statistics in health check', async () => {
      await service.send('test', { data: 'value' });

      const health = await service.healthCheck();
      expect(health.stats).toBeDefined();
      expect(health.stats.messagesSent).toBeGreaterThan(0);
    });
  });

  describe('Factory Functions', () => {
    it('should create service using factory', async () => {
      const factory = createWebSocketFactory({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });

      service = await factory();
      expect(service).toBeDefined();
      expect(service.isConnected()).toBe(true);
    });

    it('should override config in factory', async () => {
      const factory = createWebSocketFactory({
        provider: 'socket.io',
        url: 'http://localhost:3000',
        reconnect: false,
      });

      service = await factory({
        reconnect: true,
        reconnectAttempts: 10,
      });

      const config = service.getConfig();
      expect(config.reconnect).toBe(true);
      expect(config.reconnectAttempts).toBe(10);
    });
  });

  describe('Configuration', () => {
    it('should get current configuration', async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
        reconnect: true,
        heartbeat: true,
        maxQueueSize: 50,
      });

      const config = service.getConfig();
      expect(config.provider).toBe('socket.io');
      expect(config.reconnect).toBe(true);
      expect(config.heartbeat).toBe(true);
      expect(config.maxQueueSize).toBe(50);
    });

    it('should return readonly configuration', async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
      });

      const config = service.getConfig();
      // Modifying returned config should not affect service
      (config as any).provider = 'ws';

      const newConfig = service.getConfig();
      expect(newConfig.provider).toBe('socket.io');
    });
  });

  describe('Integration Scenarios', () => {
    beforeEach(async () => {
      service = await createWebSocketService({
        provider: 'socket.io',
        url: 'http://localhost:3000',
        reconnect: true,
        queueMessages: true,
      });
    });

    it('should handle complete chat flow', async () => {
      // Join chat room
      await service.join('chat');

      // Send messages
      await service.send('chat:message', { text: 'Hello', user: 'Alice' });
      await service.send('chat:message', { text: 'Hi there!', user: 'Bob' });

      // Broadcast announcement
      await service.broadcast('chat:announcement', {
        text: 'Welcome everyone!',
      }, { rooms: 'chat' });

      // Verify stats
      const stats = service.getStats();
      expect(stats.messagesSent).toBeGreaterThanOrEqual(3);
      expect(stats.rooms).toBe(1);
    });

    it('should handle multiple rooms and broadcasts', async () => {
      // Join multiple rooms
      await service.join('lobby');
      await service.join('game1');
      await service.join('game2');

      // Broadcast to specific rooms
      await service.broadcast('update', { type: 'game' }, {
        rooms: ['game1', 'game2'],
      });

      // Leave a room
      await service.leave('game1');

      // Verify final state
      const rooms = service.getRooms();
      expect(rooms).toContain('lobby');
      expect(rooms).toContain('game2');
      expect(rooms).not.toContain('game1');
    });

    it('should handle event-driven architecture', async () => {
      const receivedMessages: any[] = [];

      // Register handlers for different events
      service.on('user:join', (data) => {
        receivedMessages.push({ event: 'join', data });
      });

      service.on('user:leave', (data) => {
        receivedMessages.push({ event: 'leave', data });
      });

      service.on('message', (data) => {
        receivedMessages.push({ event: 'message', data });
      });

      // Emit events
      await service.emit('user:join', { userId: 1, username: 'Alice' });
      await service.emit('message', { text: 'Hello' });
      await service.emit('user:leave', { userId: 1 });

      // Verify all events were received
      expect(receivedMessages).toHaveLength(3);
      expect(receivedMessages[0].event).toBe('join');
      expect(receivedMessages[1].event).toBe('message');
      expect(receivedMessages[2].event).toBe('leave');
    });
  });
});
