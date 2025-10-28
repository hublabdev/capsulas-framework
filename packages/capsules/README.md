# @capsulas/capsules

Official capsules library for Capsulas framework. 300 production-ready modules for building applications visually.

## Installation

```bash
npm install @capsulas/capsules
```

## Usage

```typescript
import { authOAuthGoogle } from '@capsulas/capsules';

// Use in your Capsulas flow or standalone
const result = await authOAuthGoogle.execute(
  { action: 'authorize' },
  {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'https://yourapp.com/callback'
  }
);

console.log('Auth URL:', result.authUrl);
```

## Available Capsules

See [CAPSULES_REGISTRY.md](./CAPSULES_REGISTRY.md) for the complete list of 300 capsules.

### Quick Reference

**Authentication (25)**
- OAuth providers: Google, GitHub, Microsoft, Apple, Facebook, etc.
- Token management: JWT, Session, API Keys, 2FA

**Database (30)**
- SQL: PostgreSQL, MySQL, SQLite, etc.
- NoSQL: MongoDB, Redis, DynamoDB, etc.
- ORMs: Prisma, TypeORM, Sequelize

**AI & ML (35)**
- LLMs: OpenAI, Anthropic, Google, Cohere, etc.
- Image: DALL-E, Stable Diffusion, Midjourney
- Services: Embeddings, Moderation, Translation, OCR

**Communication (25)**
- Email: SendGrid, AWS SES, Resend
- SMS: Twilio, Vonage
- Real-time: WebSocket, SSE, Push Notifications

**Payment (20)**
- Processors: Stripe, PayPal, Square, etc.
- Financial: Plaid, Wise, Revolut

**Storage (20)**
- Cloud: S3, GCS, Azure, Cloudflare R2
- Media: Cloudinary, ImageKit, Uploadcare

**Processing (25)**
- Queues: BullMQ, SQS, RabbitMQ, Kafka
- Jobs: Cron, Agenda, Temporal
- Transform: JSON, CSV, XML, encryption

**Analytics (20)**
- Platforms: Google Analytics, Mixpanel, Amplitude
- Monitoring: Sentry, Datadog, New Relic

**Integration (30)**
- SaaS: Slack, GitHub, Notion, Airtable, etc.
- APIs: REST, GraphQL, Webhooks

**Security (20)**
- Protection: Rate limiting, DDoS, WAF
- Auth: reCAPTCHA, 2FA, TOTP
- Encryption: AES, JWT, Password hashing

**Media (15)**
- Image: Resize, crop, compress, watermark
- Video: Transcode, thumbnail, streaming
- Audio: Transcode, normalize

**Search (10)**
- Services: Algolia, Elasticsearch, Meilisearch
- Types: Full-text, fuzzy, vector search

**Monitoring (15)**
- Logging: Winston, Pino
- Monitoring: Uptime, health checks
- APM: Sentry, Datadog, Grafana

**DevOps (10)**
- Deploy: Vercel, Netlify, Railway, Fly.io
- CI/CD: GitHub Actions, GitLab CI
- Containers: Docker, Kubernetes

## Example: Google OAuth Capsule

The Google OAuth capsule provides complete OAuth 2.0 authentication:

```typescript
import { authOAuthGoogle } from '@capsulas/capsules';

// Step 1: Get authorization URL
const step1 = await authOAuthGoogle.execute(
  { action: 'authorize' },
  {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'https://yourapp.com/callback'
  }
);

// Redirect user to step1.authUrl

// Step 2: Exchange code for tokens (after callback)
const step2 = await authOAuthGoogle.execute(
  {
    action: 'exchange',
    code: 'code-from-callback'
  },
  {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'https://yourapp.com/callback'
  }
);

console.log('Access Token:', step2.tokens.access_token);
console.log('User:', step2.user);
// {
//   id: '1234567890',
//   email: 'user@example.com',
//   name: 'John Doe',
//   picture: 'https://...',
//   ...
// }
```

## Features

### Type-Safe
Every capsule uses TypeScript with full type definitions.

### Well-Documented
Each capsule includes:
- Complete API documentation
- Usage examples
- Environment variables
- Setup instructions
- Troubleshooting guide

### Production-Ready
- Error handling
- Input validation
- Retry logic where appropriate
- Security best practices
- Rate limiting support

### Standalone or Visual
Use capsules:
- In Capsulas visual editor
- Programmatically in code
- Via CLI
- In any TypeScript/JavaScript project

## Environment Variables

Capsules follow consistent naming:

```bash
# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...

# Database
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb://...

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Email
SENDGRID_API_KEY=SG...

# Payment
STRIPE_SECRET_KEY=sk_...

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=...
```

## Creating Custom Capsules

```typescript
import { defineCapsule, PORT_TYPES } from '@capsulas/core';

export const myCustomCapsule = defineCapsule({
  id: 'my-custom-capsule',
  name: 'My Capsule',
  description: 'What it does',
  icon: '⚡',
  category: 'processing',

  inputs: [
    {
      id: 'input1',
      name: 'Input 1',
      type: PORT_TYPES.STRING,
      required: true
    }
  ],

  outputs: [
    {
      id: 'output1',
      name: 'Output 1',
      type: PORT_TYPES.OBJECT
    }
  ],

  async execute(inputs, config) {
    // Your logic here
    return {
      output1: { result: 'success' }
    };
  }
});
```

See [Creating Capsules Guide](../../docs/creating-capsules.md) for details.

## Port Types

Capsules use 13 standard port types:

- `AUTH` - Authentication data
- `USER` - User objects
- `DATA` - Generic data
- `STRING` - Text
- `NUMBER` - Numeric values
- `OBJECT` - JSON objects
- `ARRAY` - Arrays
- `FILE` - File references
- `EVENT` - Event data
- `MESSAGE` - Messages
- `JOB` - Job queue items
- `EMAIL` - Email data
- `ANY` - Universal type

## Contributing

We welcome contributions!

1. See which capsules need implementation: [CAPSULES_REGISTRY.md](./CAPSULES_REGISTRY.md)
2. Follow the pattern from existing capsules
3. Include tests and documentation
4. Submit a PR

See [Contributing Guide](../../CONTRIBUTING.md).

## License

MIT

## Support

- **Documentation**: https://docs.capsulas.dev
- **Discord**: https://discord.gg/capsulas
- **GitHub**: https://github.com/yourusername/capsulas
- **Issues**: https://github.com/yourusername/capsulas/issues
