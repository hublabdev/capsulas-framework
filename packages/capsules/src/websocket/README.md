# WebSocket Capsule

A comprehensive WebSocket client implementation with support for multiple providers (Socket.IO, native WebSocket, ws library), automatic reconnection, rooms, and event handling.

## Features

- **Multiple Providers**: Support for Socket.IO, native WebSocket, and ws library
- **Automatic Reconnection**: Exponential backoff with configurable retry limits
- **Room Support**: Join/leave rooms and broadcast to specific rooms
- **Event System**: Type-safe event handlers with priority support
- **Message Queuing**: Queue messages when disconnected for later delivery
- **Heartbeat/Ping-Pong**: Keep connections alive with configurable intervals
- **Authentication**: Support for token, basic, query, and custom auth
- **Statistics**: Track messages, bytes, errors, and connection metrics
- **TypeScript**: Full type safety with comprehensive type definitions

## Installation

```bash
npm install @capsulas/capsules
```

## Basic Usage

### Native WebSocket

```typescript
import { WebSocketService } from '@capsulas/capsules';

const ws = new WebSocketService({
  provider: 'native',
  url: 'ws://localhost:3000',
  reconnect: true,
  heartbeat: true,
});

await ws.initialize();

// Listen for messages
ws.on('message', (data) => {
  console.log('Received:', data);
});

// Send a message
await ws.send('chat', { text: 'Hello, World!' });

// Cleanup when done
await ws.cleanup();
```

### Socket.IO (Stub)

```typescript
import { WebSocketService } from '@capsulas/capsules';

const ws = new WebSocketService({
  provider: 'socket.io',
  url: 'http://localhost:3000',
  path: '/socket.io',
  reconnect: true,
});

await ws.initialize();

ws.on('notification', (data) => {
  console.log('Notification:', data);
});

await ws.send('subscribe', { channel: 'updates' });
```

### WS Library (Stub)

```typescript
import { WebSocketService } from '@capsulas/capsules';

const ws = new WebSocketService({
  provider: 'ws',
  url: 'ws://localhost:8080',
  heartbeat: true,
  heartbeatInterval: 20000,
});

await ws.initialize();
```

## Advanced Usage

### Room Management

```typescript
// Join rooms
await ws.join('room1');
await ws.join('lobby');

// Send to specific room
await ws.broadcast('update', { data: 'New content' }, {
  rooms: 'room1',
});

// Send to multiple rooms
await ws.broadcast('alert', { message: 'Alert!' }, {
  rooms: ['room1', 'room2'],
});

// Leave a room
await ws.leave('room1');

// Get current rooms
const rooms = ws.getRooms();
console.log('Joined rooms:', rooms);
```

### Authentication

#### Token Authentication

```typescript
const ws = new WebSocketService({
  provider: 'native',
  url: 'wss://api.example.com/ws',
  auth: {
    type: 'token',
    token: 'your-jwt-token',
  },
});
```

#### Basic Authentication

```typescript
const ws = new WebSocketService({
  provider: 'native',
  url: 'wss://api.example.com/ws',
  auth: {
    type: 'basic',
    username: 'user',
    password: 'pass',
  },
});
```

#### Query Parameters

```typescript
const ws = new WebSocketService({
  provider: 'native',
  url: 'wss://api.example.com/ws',
  auth: {
    type: 'query',
    query: {
      token: 'auth-token',
      userId: '12345',
    },
  },
});
```

#### Custom Headers

```typescript
const ws = new WebSocketService({
  provider: 'native',
  url: 'wss://api.example.com/ws',
  auth: {
    type: 'custom',
    headers: {
      'X-API-Key': 'your-api-key',
      'X-User-ID': 'user-123',
    },
  },
});
```

### Event Handling

```typescript
// Register event handler
ws.on('chat', (message) => {
  console.log('Chat message:', message);
});

// One-time handler
ws.once('welcome', (data) => {
  console.log('Welcome message:', data);
});

// Remove handler
const handler = (data) => console.log(data);
ws.on('event', handler);
ws.off('event', handler);

// System events
ws.on('connection', () => {
  console.log('Connected!');
});

ws.on('disconnect', () => {
  console.log('Disconnected');
});

ws.on('error', (error) => {
  console.error('Error:', error);
});

ws.on('reconnect', ({ attempt }) => {
  console.log('Reconnected after', attempt, 'attempts');
});
```

### Message Queuing

```typescript
const ws = new WebSocketService({
  provider: 'native',
  url: 'ws://localhost:3000',
  queueMessages: true,
  maxQueueSize: 100,
});

await ws.initialize();

// Messages sent while disconnected are queued
await ws.send('event', { data: 'value' });

// Queue is processed when reconnected
```

### Reconnection Configuration

```typescript
const ws = new WebSocketService({
  provider: 'native',
  url: 'ws://localhost:3000',
  reconnect: true,
  reconnectDelay: 1000,        // Initial delay (ms)
  reconnectAttempts: 10,       // Max attempts (0 = unlimited)
  reconnectBackoff: 1.5,       // Backoff multiplier
  maxReconnectDelay: 30000,    // Max delay (ms)
});
```

### Statistics

```typescript
const stats = ws.getStats();

console.log('Messages sent:', stats.messagesSent);
console.log('Messages received:', stats.messagesReceived);
console.log('Bytes sent:', stats.bytesSent);
console.log('Bytes received:', stats.bytesReceived);
console.log('Reconnect attempts:', stats.reconnectAttempts);
console.log('Errors:', stats.errors);
console.log('Uptime:', stats.uptime);
console.log('State:', stats.state);
console.log('Rooms:', stats.rooms);
```

### Health Check

```typescript
const health = await ws.healthCheck();

console.log('Healthy:', health.healthy);
console.log('Provider:', health.provider);
console.log('Connected:', health.connected);
console.log('Uptime:', health.uptime);
console.log('Stats:', health.stats);
```

## Configuration

```typescript
interface WebSocketConfig {
  // Provider type
  provider: 'socket.io' | 'native' | 'ws';

  // Connection
  url?: string;
  port?: number;
  path?: string;
  protocols?: string | string[];
  timeout?: number;

  // Reconnection
  reconnect?: boolean;
  reconnectDelay?: number;
  reconnectAttempts?: number;
  reconnectBackoff?: number;
  maxReconnectDelay?: number;

  // Heartbeat
  heartbeat?: boolean;
  heartbeatInterval?: number;

  // Authentication
  auth?: {
    type: 'token' | 'basic' | 'query' | 'custom';
    token?: string;
    username?: string;
    password?: string;
    query?: Record<string, string>;
    headers?: Record<string, string>;
  };

  // Message handling
  queueMessages?: boolean;
  maxQueueSize?: number;
  maxMessageSize?: number;

  // Compression
  compression?: boolean;
  binaryType?: 'blob' | 'arraybuffer';

  // Custom headers
  headers?: Record<string, string>;

  // Auto-join rooms
  autoJoinRooms?: string[];
}
```

## API Reference

### WebSocketService

#### Methods

- `initialize()`: Initialize and connect to WebSocket server
- `connect()`: Establish connection
- `disconnect()`: Close connection
- `send(event, data, options?)`: Send message to server
- `broadcast(event, data, options?)`: Broadcast to room(s)
- `join(room)`: Join a room
- `leave(room)`: Leave a room
- `on(event, handler)`: Register event handler
- `off(event, handler)`: Remove event handler
- `once(event, handler)`: One-time event handler
- `emit(event, data)`: Emit event locally
- `getRooms()`: Get list of joined rooms
- `getStats()`: Get connection statistics
- `getConfig()`: Get current configuration
- `isConnected()`: Check connection status
- `healthCheck()`: Get health status
- `cleanup()`: Cleanup and disconnect

#### Factory Functions

```typescript
// Create and initialize service
const ws = await createWebSocketService(config);

// Create factory with default config
const factory = createWebSocketFactory({
  provider: 'native',
  reconnect: true,
});

const ws1 = await factory();
const ws2 = await factory({ url: 'ws://other-server' });
```

## Error Handling

```typescript
import {
  WebSocketError,
  WebSocketConnectionError,
  WebSocketSendError,
  isWebSocketError,
} from '@capsulas/capsules';

try {
  await ws.send('event', data);
} catch (error) {
  if (isWebSocketError(error)) {
    console.error('WebSocket error:', error.type);
    console.error('Details:', error.details);
  }

  if (error instanceof WebSocketSendError) {
    console.error('Failed to send message');
  }
}
```

### Error Types

- `WebSocketConnectionError`: Connection failed
- `WebSocketDisconnectionError`: Disconnection error
- `WebSocketSendError`: Send failed
- `WebSocketReceiveError`: Receive failed
- `WebSocketInvalidMessageError`: Invalid message format
- `WebSocketRoomError`: Room operation failed
- `WebSocketAuthError`: Authentication failed
- `WebSocketTimeoutError`: Operation timeout
- `WebSocketProtocolError`: Protocol violation
- `WebSocketConfigurationError`: Invalid configuration
- `WebSocketAdapterError`: Adapter error
- `WebSocketReconnectError`: Reconnection failed
- `WebSocketQueueFullError`: Message queue full
- `WebSocketInitializationError`: Initialization failed

## Best Practices

1. **Always cleanup**: Call `cleanup()` when done to prevent memory leaks
2. **Handle errors**: Wrap operations in try-catch blocks
3. **Monitor stats**: Track connection health with `getStats()`
4. **Use rooms**: Organize communication with rooms for better scalability
5. **Configure reconnection**: Set appropriate limits for your use case
6. **Enable queuing**: Use message queuing for unreliable connections
7. **Heartbeat**: Enable heartbeat for long-lived connections
8. **Authentication**: Secure connections with proper auth configuration

## Example: Chat Application

```typescript
import { WebSocketService } from '@capsulas/capsules';

class ChatClient {
  private ws: WebSocketService;

  async connect(username: string) {
    this.ws = new WebSocketService({
      provider: 'native',
      url: 'wss://chat.example.com',
      auth: {
        type: 'query',
        query: { username },
      },
      reconnect: true,
      heartbeat: true,
      autoJoinRooms: ['lobby'],
    });

    await this.ws.initialize();

    // Setup event handlers
    this.ws.on('message', (msg) => {
      console.log(`${msg.from}: ${msg.text}`);
    });

    this.ws.on('user-joined', (user) => {
      console.log(`${user} joined`);
    });

    this.ws.on('reconnect', () => {
      console.log('Reconnected to chat');
    });
  }

  async sendMessage(text: string) {
    await this.ws.send('chat', { text });
  }

  async joinRoom(room: string) {
    await this.ws.join(room);
  }

  async disconnect() {
    await this.ws.cleanup();
  }
}
```

## License

MIT
