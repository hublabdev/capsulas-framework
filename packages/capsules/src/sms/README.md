# SMS Capsule

Send SMS messages via multiple providers (Twilio, AWS SNS, Vonage, MessageBird).

## Features

- Multiple provider support (Twilio, AWS SNS)
- Phone number validation (E.164 format)
- Message length validation (max 1600 chars)
- Usage statistics tracking
- TypeScript support

## Installation

```bash
npm install @capsulas/capsules
```

## Usage

### Twilio

```typescript
import { createSMSService } from '@capsulas/capsules/sms';

const smsService = createSMSService({
  provider: 'twilio',
  accountSid: 'your-account-sid',
  authToken: 'your-auth-token',
  fromNumber: '+1234567890'
});

await smsService.initialize();

const result = await smsService.send({
  to: '+1987654321',
  message: 'Hello from Capsulas Framework!'
});

console.log(result);
// {
//   success: true,
//   messageId: 'twilio_1234567890',
//   provider: 'twilio',
//   to: '+1987654321',
//   status: 'sent',
//   timestamp: 2025-10-28T14:00:00.000Z
// }
```

### AWS SNS

```typescript
const smsService = createSMSService({
  provider: 'aws-sns',
  region: 'us-east-1',
  apiKey: 'your-aws-api-key'
});

await smsService.initialize();

await smsService.send({
  to: '+1987654321',
  message: 'Hello from AWS SNS!'
});
```

## API

### `createSMSService(config: SMSConfig): SMSService`

Creates a new SMS service instance.

**Config:**
- `provider` - SMS provider ('twilio' | 'aws-sns')
- `accountSid` - Twilio account SID (Twilio only)
- `authToken` - Twilio auth token (Twilio only)
- `fromNumber` - Phone number to send from
- `region` - AWS region (AWS SNS only)
- `apiKey` - AWS API key (AWS SNS only)

### `smsService.initialize(): Promise<void>`

Initializes the service with the configured provider.

### `smsService.send(request: SMSRequest): Promise<SMSResult>`

Sends an SMS message.

**Request:**
- `to` - Recipient phone number (E.164 format)
- `message` - Message content (max 1600 chars)
- `from` - (Optional) Override sender number

**Result:**
- `success` - Whether the message was sent successfully
- `messageId` - Unique message identifier
- `provider` - Provider used
- `to` - Recipient number
- `status` - Message status ('sent' | 'queued' | 'failed')
- `timestamp` - Send timestamp

### `smsService.getStats(): SMSStats`

Returns usage statistics.

**Stats:**
- `totalSent` - Total messages sent
- `totalFailed` - Total failed messages
- `totalQueued` - Total queued messages
- `lastSent` - Last message timestamp

## Examples

### Send with error handling

```typescript
try {
  const result = await smsService.send({
    to: '+1234567890',
    message: 'Your verification code is: 123456'
  });

  console.log('SMS sent:', result.messageId);
} catch (error) {
  console.error('Failed to send SMS:', error.message);
}
```

### Check usage stats

```typescript
const stats = smsService.getStats();

console.log(`Total sent: ${stats.totalSent}`);
console.log(`Total failed: ${stats.totalFailed}`);
console.log(`Last sent: ${stats.lastSent}`);
```

## Providers

### Twilio
- Most popular SMS provider
- Excellent delivery rates
- Global coverage
- [Documentation](https://www.twilio.com/docs/sms)

### AWS SNS
- Amazon's notification service
- Integrates with AWS ecosystem
- Pay-per-message pricing
- [Documentation](https://docs.aws.amazon.com/sns/)

## Error Handling

The capsule throws these errors:

- `SMSError` - General SMS errors
- `SMSProviderError` - Provider-specific errors
- `SMSValidationError` - Validation errors

```typescript
import { SMSError, SMSValidationError } from '@capsulas/capsules/sms';

try {
  await smsService.send({...});
} catch (error) {
  if (error instanceof SMSValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof SMSError) {
    console.error('SMS error:', error.message);
  }
}
```

## Phone Number Format

Phone numbers must be in E.164 format:
- Start with `+`
- Country code (1-3 digits)
- Subscriber number (up to 14 digits)

Examples:
- US: `+1234567890`
- UK: `+447911123456`
- India: `+919876543210`

## License

MIT
