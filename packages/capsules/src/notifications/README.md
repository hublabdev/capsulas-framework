# Notifications Capsule

Multi-channel notification system supporting Email, Push, SMS, and Slack with retry logic, statistics tracking, and provider flexibility.

## Features

- **Multi-Channel Support**: Email, Push notifications, SMS, and Slack
- **Multiple Providers**: Support for various providers per channel
  - Email: SMTP, SendGrid, AWS SES, Mailgun
  - Push: Firebase FCM, Apple APNS, OneSignal
  - SMS: Twilio, Vonage, AWS SNS
  - Slack: Webhooks and API
- **Retry Logic**: Automatic retry with exponential backoff
- **Statistics**: Track delivery rates, failures, and performance metrics
- **Type Safety**: Full TypeScript support with detailed types
- **Extensible**: Easy to add custom adapters

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

### Email Notifications

```typescript
import { createNotificationService } from '@capsulas/capsules/notifications';

const notifications = await createNotificationService({
  provider: 'email',
  email: {
    type: 'smtp',
    host: 'smtp.gmail.com',
    port: 587,
    username: 'your-email@gmail.com',
    password: 'your-password',
    from: 'noreply@example.com'
  }
});

const result = await notifications.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  message: 'Thanks for signing up!',
  html: '<h1>Welcome!</h1><p>Thanks for signing up!</p>'
});

console.log(`Sent: ${result.sentCount}, Failed: ${result.failedCount}`);
```

### Push Notifications

```typescript
import { createNotificationService } from '@capsulas/capsules/notifications';

const notifications = await createNotificationService({
  provider: 'push',
  push: {
    type: 'firebase',
    apiKey: 'your-firebase-api-key',
    projectId: 'your-project-id'
  }
});

const result = await notifications.sendPush({
  to: 'device-token',
  title: 'New Message',
  body: 'You have a new message!',
  message: 'You have a new message!',
  icon: '/icon.png',
  data: { messageId: '123' }
});
```

### SMS Notifications

```typescript
import { createNotificationService } from '@capsulas/capsules/notifications';

const notifications = await createNotificationService({
  provider: 'sms',
  sms: {
    type: 'twilio',
    accountSid: 'your-account-sid',
    authToken: 'your-auth-token',
    from: '+1234567890'
  }
});

const result = await notifications.sendSMS({
  to: '+19876543210',
  message: 'Your verification code is: 123456'
});
```

### Slack Notifications

```typescript
import { createNotificationService } from '@capsulas/capsules/notifications';

const notifications = await createNotificationService({
  provider: 'slack',
  slack: {
    webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
  }
});

const result = await notifications.sendSlack({
  to: '#general',
  message: 'Deployment completed successfully!',
  channel: '#deployments',
  username: 'DeployBot',
  iconEmoji: ':rocket:'
});
```

## API Reference

### Configuration

```typescript
interface NotificationConfig {
  provider: 'email' | 'push' | 'sms' | 'slack';
  email?: EmailProviderConfig;
  push?: PushProviderConfig;
  sms?: SMSProviderConfig;
  slack?: SlackProviderConfig;
  retryAttempts?: number;        // Default: 3
  retryDelay?: number;           // Default: 1000ms
  timeout?: number;              // Default: 30000ms
  debug?: boolean;               // Default: false
}
```

### NotificationService Methods

#### `send(notification: Notification): Promise<NotificationResult>`

Send a notification through the configured provider.

```typescript
const result = await notifications.send({
  provider: 'email',
  to: 'user@example.com',
  subject: 'Hello',
  message: 'Hello World!'
});
```

#### `sendEmail(notification: Omit<EmailNotification, 'provider'>): Promise<NotificationResult>`

Send an email notification (requires email provider configuration).

```typescript
const result = await notifications.sendEmail({
  to: 'user@example.com',
  subject: 'Password Reset',
  message: 'Click here to reset your password',
  html: '<a href="...">Reset Password</a>',
  from: 'noreply@example.com',
  replyTo: 'support@example.com'
});
```

#### `sendPush(notification: Omit<PushNotification, 'provider'>): Promise<NotificationResult>`

Send a push notification (requires push provider configuration).

```typescript
const result = await notifications.sendPush({
  to: 'device-token',
  title: 'Update Available',
  body: 'A new version is ready to install',
  message: 'A new version is ready to install',
  badge: 1,
  sound: 'default',
  data: { version: '2.0.0' }
});
```

#### `sendSMS(notification: Omit<SMSNotification, 'provider'>): Promise<NotificationResult>`

Send an SMS notification (requires SMS provider configuration).

```typescript
const result = await notifications.sendSMS({
  to: '+19876543210',
  message: 'Your order #12345 has been shipped!',
  from: '+1234567890'
});
```

#### `sendSlack(notification: Omit<SlackNotification, 'provider'>): Promise<NotificationResult>`

Send a Slack notification (requires Slack provider configuration).

```typescript
const result = await notifications.sendSlack({
  to: '#alerts',
  message: 'Server CPU usage above 90%',
  channel: '#monitoring',
  attachments: [{
    color: 'danger',
    title: 'Server Alert',
    text: 'CPU: 95%, Memory: 87%'
  }]
});
```

#### `getStats(): NotificationStats`

Get notification statistics.

```typescript
const stats = notifications.getStats();
console.log(`Total Sent: ${stats.totalSent}`);
console.log(`Success Rate: ${stats.successRate}%`);
console.log(`Avg Delivery Time: ${stats.averageDeliveryTime}ms`);
```

#### `getConfig(): Readonly<NotificationConfig>`

Get the current configuration.

```typescript
const config = notifications.getConfig();
console.log(`Provider: ${config.provider}`);
```

#### `resetStats(): void`

Reset statistics counters.

```typescript
notifications.resetStats();
```

#### `cleanup(): Promise<void>`

Cleanup resources and connections.

```typescript
await notifications.cleanup();
```

## Examples

### Email with Attachments

```typescript
const notifications = await createNotificationService({
  provider: 'email',
  email: {
    type: 'sendgrid',
    apiKey: 'your-sendgrid-api-key',
    from: 'noreply@example.com'
  }
});

const result = await notifications.sendEmail({
  to: 'user@example.com',
  subject: 'Invoice #12345',
  message: 'Please find your invoice attached.',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [{
    filename: 'invoice.pdf',
    path: '/path/to/invoice.pdf',
    contentType: 'application/pdf'
  }]
});
```

### Multiple Recipients

```typescript
// Email to multiple recipients
const result = await notifications.sendEmail({
  to: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
  subject: 'Team Update',
  message: 'Important team announcement',
  cc: ['manager@example.com'],
  bcc: ['archive@example.com']
});

// SMS to multiple recipients
const result = await notifications.sendSMS({
  to: ['+19876543210', '+19876543211', '+19876543212'],
  message: 'Emergency alert: Office closed today'
});
```

### Rich Slack Messages

```typescript
const notifications = await createNotificationService({
  provider: 'slack',
  slack: {
    webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
  }
});

const result = await notifications.sendSlack({
  to: '#releases',
  message: 'New release deployed!',
  attachments: [{
    color: 'good',
    title: 'Release v2.1.0',
    text: 'Successfully deployed to production',
    fields: [
      { title: 'Version', value: '2.1.0', short: true },
      { title: 'Environment', value: 'Production', short: true },
      { title: 'Time', value: new Date().toISOString(), short: false }
    ],
    footer: 'CI/CD Pipeline',
    footer_icon: 'https://example.com/icon.png'
  }]
});
```

### Error Handling

```typescript
import {
  createNotificationService,
  NotificationError,
  NotificationErrorType
} from '@capsulas/capsules/notifications';

const notifications = await createNotificationService({
  provider: 'email',
  email: {
    type: 'smtp',
    host: 'smtp.gmail.com',
    port: 587,
    username: 'your-email@gmail.com',
    password: 'your-password'
  },
  retryAttempts: 3,
  retryDelay: 1000
});

try {
  const result = await notifications.sendEmail({
    to: 'invalid-email',
    subject: 'Test',
    message: 'Test message'
  });

  if (!result.success) {
    console.error('Failed to send:', result.error);
  }
} catch (error) {
  if (error instanceof NotificationError) {
    switch (error.type) {
      case NotificationErrorType.VALIDATION_ERROR:
        console.error('Invalid email address');
        break;
      case NotificationErrorType.AUTH_ERROR:
        console.error('Authentication failed');
        break;
      case NotificationErrorType.NETWORK_ERROR:
        console.error('Network error, check connection');
        break;
      default:
        console.error('Notification error:', error.message);
    }
  }
}
```

### Statistics Monitoring

```typescript
const notifications = await createNotificationService({
  provider: 'email',
  email: { type: 'smtp', /* ... */ }
});

// Send notifications
await notifications.sendEmail({ /* ... */ });
await notifications.sendEmail({ /* ... */ });
await notifications.sendEmail({ /* ... */ });

// Check statistics
const stats = notifications.getStats();

console.log('=== Notification Statistics ===');
console.log(`Total Sent: ${stats.totalSent}`);
console.log(`Total Failed: ${stats.totalFailed}`);
console.log(`Success Rate: ${stats.successRate}%`);
console.log(`Avg Delivery Time: ${stats.averageDeliveryTime}ms`);
console.log(`Last Sent: ${new Date(stats.lastSentAt || 0).toISOString()}`);

console.log('\nBy Provider:');
Object.entries(stats.byProvider).forEach(([provider, count]) => {
  console.log(`  ${provider}: ${count}`);
});

console.log('\nBy Priority:');
Object.entries(stats.byPriority).forEach(([priority, count]) => {
  console.log(`  ${priority}: ${count}`);
});

console.log('\nErrors:');
Object.entries(stats.errors).forEach(([error, count]) => {
  console.log(`  ${error}: ${count}`);
});
```

### Multi-Provider Setup

```typescript
// Email service
const emailService = await createNotificationService({
  provider: 'email',
  email: {
    type: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY!,
    from: 'noreply@example.com'
  }
});

// SMS service
const smsService = await createNotificationService({
  provider: 'sms',
  sms: {
    type: 'twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    from: process.env.TWILIO_PHONE!
  }
});

// Push service
const pushService = await createNotificationService({
  provider: 'push',
  push: {
    type: 'firebase',
    apiKey: process.env.FIREBASE_API_KEY!,
    projectId: process.env.FIREBASE_PROJECT_ID!
  }
});

// Use different services for different channels
await emailService.sendEmail({ /* ... */ });
await smsService.sendSMS({ /* ... */ });
await pushService.sendPush({ /* ... */ });
```

## Provider-Specific Configuration

### Email Providers

#### SMTP

```typescript
email: {
  type: 'smtp',
  host: 'smtp.gmail.com',
  port: 587,
  username: 'your-email@gmail.com',
  password: 'your-password',
  from: 'noreply@example.com'
}
```

#### SendGrid

```typescript
email: {
  type: 'sendgrid',
  apiKey: 'SG.xxxxx',
  from: 'noreply@example.com'
}
```

#### AWS SES

```typescript
email: {
  type: 'ses',
  apiKey: 'AKIAIOSFODNN7EXAMPLE',
  from: 'noreply@example.com'
}
```

#### Mailgun

```typescript
email: {
  type: 'mailgun',
  apiKey: 'key-xxxxx',
  from: 'noreply@example.com'
}
```

### Push Providers

#### Firebase FCM

```typescript
push: {
  type: 'firebase',
  apiKey: 'your-firebase-api-key',
  projectId: 'your-project-id',
  serverKey: 'your-server-key'
}
```

#### Apple APNS

```typescript
push: {
  type: 'apns',
  apiKey: 'your-apns-key',
  bundleId: 'com.example.app'
}
```

#### OneSignal

```typescript
push: {
  type: 'onesignal',
  apiKey: 'your-onesignal-api-key'
}
```

### SMS Providers

#### Twilio

```typescript
sms: {
  type: 'twilio',
  accountSid: 'ACxxxxx',
  authToken: 'your-auth-token',
  from: '+1234567890'
}
```

#### Vonage

```typescript
sms: {
  type: 'vonage',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  from: 'Example Co'
}
```

#### AWS SNS

```typescript
sms: {
  type: 'aws-sns',
  apiKey: 'AKIAIOSFODNN7EXAMPLE',
  apiSecret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
}
```

### Slack Configuration

#### Webhook

```typescript
slack: {
  webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX'
}
```

#### API Token

```typescript
slack: {
  token: 'xoxb-your-bot-token',
  channel: '#general'
}
```

## Error Types

The Notifications Capsule includes 10 specialized error types:

- `SEND_ERROR` - Failed to send notification
- `VALIDATION_ERROR` - Invalid notification data
- `CONFIG_ERROR` - Invalid configuration
- `PROVIDER_ERROR` - Provider-specific error
- `AUTH_ERROR` - Authentication failed
- `RATE_LIMIT_ERROR` - Rate limit exceeded
- `NETWORK_ERROR` - Network connectivity issue
- `TIMEOUT_ERROR` - Request timeout
- `INVALID_RECIPIENT_ERROR` - Invalid recipient address
- `ATTACHMENT_ERROR` - Attachment processing error

## Best Practices

1. **Environment Variables**: Store API keys and credentials in environment variables
2. **Error Handling**: Always handle errors and check result.success
3. **Validation**: Validate email addresses and phone numbers before sending
4. **Rate Limiting**: Respect provider rate limits using retry configuration
5. **Statistics**: Monitor statistics to identify delivery issues
6. **Cleanup**: Call cleanup() when shutting down your application
7. **Multiple Providers**: Use separate service instances for different channels
8. **Testing**: Test with stub implementations before using real providers

## License

MIT
