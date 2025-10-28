# Push Notifications Capsule

Send push notifications to web and mobile devices via multiple providers (Firebase, APNS, OneSignal, Expo).

## Features

- Multiple provider support (Firebase, APNS, OneSignal, Expo)
- Send to single device, multiple devices, or topics
- Notification validation (title, body, badge, etc.)
- Usage statistics tracking
- TypeScript support

## Installation

```bash
npm install @capsulas/capsules
```

## Usage

### Firebase Cloud Messaging (FCM)

```typescript
import { createPushNotificationsService } from '@capsulas/capsules/push-notifications';

const pushService = createPushNotificationsService({
  provider: 'firebase',
  serverKey: 'your-firebase-server-key'
});

await pushService.initialize();

const result = await pushService.sendToDevice(
  'device-token-here',
  'Hello!',
  'This is a push notification from Capsulas Framework'
);

console.log(result);
// {
//   success: true,
//   messageId: 'fcm_1234567890',
//   provider: 'firebase',
//   successCount: 1,
//   failureCount: 0,
//   timestamp: 2025-10-28T14:00:00.000Z
// }
```

### Apple Push Notification Service (APNS)

```typescript
const pushService = createPushNotificationsService({
  provider: 'apns',
  certificatePath: '/path/to/certificate.p12',
  production: true
});

await pushService.initialize();

await pushService.sendToDevice(
  'apns-device-token',
  'New Message',
  'You have a new message!'
);
```

### OneSignal

```typescript
const pushService = createPushNotificationsService({
  provider: 'onesignal',
  appId: 'your-onesignal-app-id',
  apiKey: 'your-onesignal-api-key'
});

await pushService.initialize();

await pushService.sendToDevices(
  ['token1', 'token2', 'token3'],
  'Update Available',
  'A new version of the app is available'
);
```

### Expo

```typescript
const pushService = createPushNotificationsService({
  provider: 'expo'
});

await pushService.initialize();

await pushService.sendToDevice(
  'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  'Welcome!',
  'Thanks for installing our app'
);
```

## API

### `createPushNotificationsService(config: PushNotificationsConfig): PushNotificationsService`

Creates a new push notifications service instance.

**Config:**
- `provider` - Push provider ('firebase' | 'apns' | 'onesignal' | 'expo')
- `serverKey` - Firebase server key (Firebase only)
- `certificatePath` - Path to APNS certificate (APNS only)
- `appId` - App ID (OneSignal, Expo)
- `apiKey` - API key (OneSignal)
- `production` - Production mode (APNS only)

### `pushService.initialize(): Promise<void>`

Initializes the service with the configured provider.

### `pushService.send(request: PushRequest): Promise<PushResult>`

Sends a push notification.

**Request:**
- `notification` - Notification details
  - `title` - Notification title (required, max 65 chars)
  - `body` - Notification body (required, max 240 chars)
  - `data` - Custom data payload
  - `badge` - Badge count
  - `sound` - Sound file name
  - `icon` - Icon URL
  - `image` - Image URL
  - `clickAction` - Action when notification is clicked
  - `priority` - Priority ('high' | 'normal')
  - `ttl` - Time to live in seconds
- `target` - Target details
  - `token` - Single device token
  - `tokens` - Multiple device tokens (max 500)
  - `topic` - Topic name
  - `condition` - Firebase condition

**Result:**
- `success` - Whether the notification was sent successfully
- `messageId` - Unique message identifier
- `provider` - Provider used
- `successCount` - Number of successful deliveries
- `failureCount` - Number of failed deliveries
- `failedTokens` - List of tokens that failed
- `timestamp` - Send timestamp

### `pushService.sendToDevice(token: string, title: string, body: string, data?: any): Promise<PushResult>`

Convenience method to send to a single device.

### `pushService.sendToDevices(tokens: string[], title: string, body: string, data?: any): Promise<PushResult>`

Convenience method to send to multiple devices.

### `pushService.sendToTopic(topic: string, title: string, body: string, data?: any): Promise<PushResult>`

Convenience method to send to a topic.

### `pushService.getStats(): PushStats`

Returns usage statistics.

**Stats:**
- `totalSent` - Total notifications sent
- `totalSuccess` - Total successful deliveries
- `totalFailed` - Total failed deliveries
- `totalDevices` - Total unique devices
- `lastSent` - Last notification timestamp

## Examples

### Send with custom data

```typescript
await pushService.send({
  notification: {
    title: 'New Order',
    body: 'You have a new order #1234',
    data: {
      orderId: '1234',
      screen: 'OrderDetails'
    },
    badge: 1,
    sound: 'notification.mp3'
  },
  target: {
    token: 'device-token-here'
  }
});
```

### Send to topic

```typescript
await pushService.sendToTopic(
  'news',
  'Breaking News',
  'Major event just happened!'
);
```

### Batch send to multiple devices

```typescript
const tokens = [
  'token1',
  'token2',
  'token3',
  // ... up to 500 tokens
];

const result = await pushService.sendToDevices(
  tokens,
  'Announcement',
  'Important announcement for all users'
);

console.log(`Sent to ${result.successCount} devices`);
console.log(`Failed: ${result.failureCount} devices`);

if (result.failedTokens) {
  console.log('Failed tokens:', result.failedTokens);
}
```

### Check usage stats

```typescript
const stats = pushService.getStats();

console.log(`Total sent: ${stats.totalSent}`);
console.log(`Success rate: ${(stats.totalSuccess / stats.totalSent * 100).toFixed(2)}%`);
console.log(`Devices: ${stats.totalDevices}`);
console.log(`Last sent: ${stats.lastSent}`);
```

### Error handling

```typescript
import {
  PushNotificationsError,
  PushProviderError,
  PushValidationError
} from '@capsulas/capsules/push-notifications';

try {
  await pushService.send({...});
} catch (error) {
  if (error instanceof PushValidationError) {
    console.error('Invalid notification:', error.message);
  } else if (error instanceof PushProviderError) {
    console.error('Provider error:', error.message);
  } else if (error instanceof PushNotificationsError) {
    console.error('Push error:', error.message);
  }
}
```

## Providers

### Firebase Cloud Messaging (FCM)
- Google's push notification service
- Supports Android, iOS, and web
- Free with generous quotas
- [Documentation](https://firebase.google.com/docs/cloud-messaging)

### Apple Push Notification Service (APNS)
- Apple's native push service
- iOS, macOS, watchOS, tvOS
- Requires Apple Developer account
- [Documentation](https://developer.apple.com/notifications/)

### OneSignal
- Third-party multi-platform service
- Easy to use, feature-rich
- Free tier available
- [Documentation](https://documentation.onesignal.com/)

### Expo
- Perfect for React Native Expo apps
- Simple setup, no certificates needed
- Free to use
- [Documentation](https://docs.expo.dev/push-notifications/overview/)

## Best Practices

1. **Token Management**: Keep device tokens up to date and remove invalid tokens
2. **Batch Sending**: Use `sendToDevices()` for multiple recipients (max 500)
3. **Topics**: Use topics for broadcasting to groups of users
4. **Custom Data**: Include navigation data for deep linking
5. **TTL**: Set appropriate time-to-live for time-sensitive notifications
6. **Error Handling**: Always handle errors and update token database

## Limits

- Title: 65 characters max
- Body: 240 characters max
- Batch size: 500 tokens max per request
- Default TTL: 28 days

## License

MIT
