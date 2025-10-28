# Email Capsule

**Email sending with SMTP, SendGrid, AWS SES, and Mailgun support**

## Features

✅ Multiple providers (SMTP, SendGrid, SES, Mailgun)
✅ Email templates (Handlebars, EJS, Pug)
✅ Attachments support
✅ HTML and plain text
✅ CC/BCC support
✅ Statistics and monitoring
✅ 9 specialized error types

## Quick Start

```typescript
import { createEmailService } from '@capsulas/capsules/email';

const email = await createEmailService({
  provider: 'smtp',
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'your@email.com',
      pass: 'your-password',
    },
  },
  from: {
    name: 'Your App',
    email: 'noreply@yourapp.com',
  },
});

// Send email
const result = await email.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  text: 'Welcome to our service!',
  html: '<h1>Welcome!</h1><p>Thanks for joining.</p>',
});

console.log('Sent:', result.messageId);

// Cleanup
await email.cleanup();
```

## Examples

### With Template

```typescript
await email.send({
  to: 'user@example.com',
  subject: 'Order Confirmation',
  template: {
    name: 'order-confirmation',
    data: {
      orderId: '12345',
      total: '$99.99',
      items: [...],
    },
  },
});
```

### With Attachments

```typescript
await email.send({
  to: 'user@example.com',
  subject: 'Invoice',
  text: 'Please find attached your invoice.',
  attachments: [
    {
      filename: 'invoice.pdf',
      path: '/path/to/invoice.pdf',
      contentType: 'application/pdf',
    },
  ],
});
```

### SendGrid Provider

```typescript
const email = await createEmailService({
  provider: 'sendgrid',
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
  },
});
```

### AWS SES Provider

```typescript
const email = await createEmailService({
  provider: 'ses',
  ses: {
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});
```

## API Reference

- `send(message): Promise<EmailResult>`
- `getStats(): EmailStats`
- `cleanup(): Promise<void>`

## License

MIT License
