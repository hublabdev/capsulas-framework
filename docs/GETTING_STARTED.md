# 🚀 Getting Started with Capsulas Framework

Welcome to Capsulas! This guide will help you build your first application in just 10 minutes.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Your First Project](#your-first-project)
- [Understanding Capsules](#understanding-capsules)
- [Using the Visual Editor](#using-the-visual-editor)
- [Adding More Capsules](#adding-more-capsules)
- [Deploying Your App](#deploying-your-app)
- [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js** >= 18.0.0 ([Download here](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))
- Basic knowledge of JavaScript/TypeScript

Check your versions:

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

---

## Installation

### Option 1: Clone the Repository (Recommended for now)

```bash
# Clone the repository
git clone https://github.com/hublabdev/capsulas-framework.git

# Navigate to the project
cd capsulas-framework

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests to verify installation
npm test
```

You should see:
```
✓ Test Files  14 passed (14)
✓ Tests  500 passed | 4 skipped (504)
```

### Option 2: Using npm (Coming soon)

```bash
# This will be available soon
npm install -g @capsulas/cli
capsulas create my-app
```

---

## Your First Project

Let's build a simple authentication system with JWT in just a few steps!

### Step 1: Create a New Project Directory

```bash
mkdir my-first-capsulas-app
cd my-first-capsulas-app
npm init -y
```

### Step 2: Install Capsulas

```bash
# For now, link to the local build
# (This will change to npm install once published)
npm link ../capsulas-framework/packages/capsules
```

### Step 3: Create Your First File

Create `index.js`:

```javascript
// Import the JWT Auth capsule
const { createJWTAuthService } = require('@capsulas/capsules/jwt-auth');

// Initialize the auth service
const authService = createJWTAuthService({
  secret: 'your-super-secret-key-change-this-in-production',
  expiresIn: '7d'
});

async function main() {
  // Initialize the service
  await authService.initialize();

  // Register a new user
  const registerResult = await authService.register({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  });

  console.log('✅ User registered!');
  console.log('Token:', registerResult.token);

  // Login with the user
  const loginResult = await authService.login({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  });

  console.log('\n✅ User logged in!');
  console.log('Token:', loginResult.token);

  // Verify the token
  const decoded = await authService.verifyToken(loginResult.token);
  console.log('\n✅ Token verified!');
  console.log('User ID:', decoded.userId);
  console.log('Email:', decoded.email);

  // Get service stats
  const stats = authService.getStats();
  console.log('\n📊 Stats:', stats);
}

main().catch(console.error);
```

### Step 4: Run Your App

```bash
node index.js
```

**Output:**
```
✅ User registered!
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

✅ User logged in!
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

✅ Token verified!
User ID: 1
Email: user@example.com

📊 Stats: {
  totalRegistrations: 1,
  totalLogins: 1,
  activeTokens: 1
}
```

🎉 **Congratulations!** You just built a working authentication system!

---

## Understanding Capsules

Capsules are **modular, reusable services** that follow a consistent pattern. Every capsule has:

### 1. The 8-File Pattern

```
capsule-name/
├── types.ts          # TypeScript types and interfaces
├── errors.ts         # Custom error classes
├── constants.ts      # Default values and configurations
├── utils.ts          # Helper functions
├── adapters.ts       # Provider implementations (e.g., Stripe, PayPal)
├── service.ts        # Main service class
├── index.ts          # Public exports
└── README.md         # Documentation
```

### 2. Factory Function Pattern

All capsules use a `createXService()` factory function:

```javascript
const service = createJWTAuthService({
  secret: 'your-secret',
  expiresIn: '7d'
});

await service.initialize();
```

### 3. Adapter Pattern

Capsules support multiple providers through adapters:

```javascript
// Example: Payments capsule with different providers
const paymentsService = createPaymentsService({
  provider: 'stripe',  // or 'paypal', 'square', 'braintree'
  apiKey: 'sk_test_...'
});

// Switch providers without changing your code!
```

---

## Using the Visual Editor

The Visual Editor lets you build applications by **dragging and dropping** capsules and connecting them visually.

### Step 1: Start the Visual Editor

```bash
cd capsulas-framework/packages/web
node server.cjs
```

The editor will open at: **http://localhost:3050**

### Step 2: Build Visually

1. **Drag capsules** from the left sidebar
2. **Connect ports** between capsules (type-safe connections)
3. **Configure** each capsule in the right panel
4. **Generate code** with one click
5. **Copy and use** the generated TypeScript/JavaScript

### Example: Visual Flow for User Registration

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Validator  │────────▶│   JWT Auth   │────────▶│    Email    │
│             │         │              │         │             │
│ Validate    │         │ Register     │         │ Send        │
│ Input       │         │ User         │         │ Welcome     │
└─────────────┘         └──────────────┘         └─────────────┘
```

**Generated Code:**
```javascript
const validator = createValidatorService();
const auth = createJWTAuthService({ secret: '...' });
const email = createEmailService({ provider: 'sendgrid' });

// Validate input
const validatedData = validator.validate(userInput, schema);

// Register user
const { user, token } = await auth.register(validatedData);

// Send welcome email
await email.send({
  to: user.email,
  template: 'welcome',
  data: { name: user.name }
});
```

---

## Adding More Capsules

### Available Capsules (23 total)

#### 🔐 Authentication
- `jwt-auth` - JWT token authentication
- `oauth` - OAuth 2.0 (Google, GitHub, Facebook, Twitter, Microsoft, LinkedIn)

#### 🗄️ Data & Storage
- `database` - SQL/NoSQL databases (PostgreSQL, MongoDB, MySQL, SQLite)
- `cache` - Caching (Redis, Memory)
- `storage` - File storage (S3, Google Cloud Storage, Azure, Cloudflare R2)

#### 🤖 AI & ML
- `ai-chat` - Chat completions (OpenAI, Anthropic, Llama)

#### 📧 Communication
- `email` - Email sending (SendGrid, Resend, Nodemailer)
- `notifications` - Multi-channel notifications (Email, Push, SMS, Slack)
- `websocket` - Real-time WebSocket connections

#### 💳 Payments
- `payments` - Payment processing (Stripe, PayPal, Square, Braintree)

#### ⚙️ Processing
- `queue` - Job queues with retry logic
- `http` - HTTP client with retries

#### 🎨 UI & Frontend
- `form-builder` - Dynamic form generation
- `theme` - Theme management (light/dark/system)
- `router` - Client-side routing (Hash, History, Memory)
- `state` - State management (Redux-style)

#### 🛠️ Utilities
- `validator` - Input validation (Zod, Yup, Joi)
- `logger` - Structured logging (Winston, Pino, Bunyan)
- `encryption` - Data encryption (AES, RSA)
- `file-upload` - File upload handling
- `geolocation` - Geolocation services
- `i18n` - Internationalization
- `analytics` - Analytics (Google Analytics, Mixpanel, Segment)

### Example: Adding Database

```javascript
const { createDatabaseService } = require('@capsulas/capsules/database');

const db = createDatabaseService({
  provider: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  username: 'user',
  password: 'pass'
});

await db.initialize();

// Create a user
const user = await db.create('users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Find users
const users = await db.find('users', {
  where: { active: true }
});

// Update a user
await db.update('users', user.id, {
  name: 'Jane Doe'
});
```

### Example: Combining Multiple Capsules

```javascript
const auth = createJWTAuthService({ secret: 'secret' });
const db = createDatabaseService({ provider: 'postgres', ... });
const email = createEmailService({ provider: 'sendgrid', ... });
const cache = createCacheService({ provider: 'redis', ... });

async function registerUser(userData) {
  // 1. Register with auth
  const { user, token } = await auth.register(userData);

  // 2. Save to database
  await db.create('users', {
    id: user.id,
    email: user.email,
    name: userData.name
  });

  // 3. Cache the user
  await cache.set(`user:${user.id}`, user, { ttl: 3600 });

  // 4. Send welcome email
  await email.send({
    to: user.email,
    subject: 'Welcome!',
    template: 'welcome',
    data: { name: userData.name }
  });

  return { user, token };
}
```

---

## Deploying Your App

### Deploy to Vercel

1. Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

2. Deploy:

```bash
npm install -g vercel
vercel
```

### Deploy to AWS Lambda

See our [Deployment Guide](./DEPLOYMENT_GUIDE.md) for detailed instructions on:
- AWS Lambda
- Docker containers
- Traditional servers
- Cloudflare Workers
- Railway

---

## Next Steps

### 📚 Learn More

- [Code Generation Template](./CODE_GENERATION_TEMPLATE.md) - AI-powered code generation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Deploy to any platform
- [AI Assistant Guide](./AI_ASSISTANT_GUIDE.md) - Use AI to build with Capsulas
- [FAQ](./FAQ.md) - Common questions

### 🎯 Try These Examples

1. **SaaS Starter** - Full app with auth, database, payments
2. **E-commerce** - Product catalog with Stripe integration
3. **Dashboard** - Analytics dashboard with real-time updates
4. **API Backend** - RESTful API with authentication

### 🤝 Get Involved

- ⭐ [Star us on GitHub](https://github.com/hublabdev/capsulas-framework)
- 🐛 [Report issues](https://github.com/hublabdev/capsulas-framework/issues)
- 💡 [Request features](https://github.com/hublabdev/capsulas-framework/issues/new)
- 📖 [Read the docs](https://github.com/hublabdev/capsulas-framework/tree/master/docs)
- 💬 Join our Discord (coming soon)

---

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module '@capsulas/capsules'`
- **Solution**: Make sure you've run `npm install` and `npm run build`

**Issue**: `Error: Secret is required`
- **Solution**: Always provide required configuration options

**Issue**: Tests failing
- **Solution**: Run `npm run build` before running tests

**Issue**: Port already in use
- **Solution**: Kill the process: `lsof -ti:3050 | xargs kill -9`

### Need Help?

- 📧 Email: info@hublab.dev
- 🐛 GitHub Issues: [Report a bug](https://github.com/hublabdev/capsulas-framework/issues)
- 📖 Documentation: [Full docs](https://github.com/hublabdev/capsulas-framework/tree/master/docs)

---

<div align="center">

**Happy Building with Capsulas! 🎉**

[⬅️ Back to Main README](../README.md) | [Next: Deployment Guide ➡️](./DEPLOYMENT_GUIDE.md)

</div>
