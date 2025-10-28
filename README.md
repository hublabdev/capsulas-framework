<div align="center">
  <h1>🎨 Capsulas Framework</h1>

  ### The WordPress of Apps

  **Build production-ready applications visually in minutes, not weeks.**

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
  [![Tests](https://img.shields.io/badge/tests-500%20passing-success)](https://github.com/hublabdev/capsulas-framework)
  [![Capsules](https://img.shields.io/badge/capsules-23-orange)](./packages/capsules)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

  [Getting Started](./docs/GETTING_STARTED.md) • [Documentation](./docs/README.md) • [Examples](./examples) • [Contributing](./CONTRIBUTING.md)

</div>

---

## 🚀 What is Capsulas?

Capsulas is an **open-source visual development framework** that lets you build complete applications by connecting pre-built, type-safe modules—just like WordPress plugins, but for any type of app.

### 💡 The Problem

Building modern apps requires:
- ❌ Weeks of boilerplate code
- ❌ Complex API integrations
- ❌ Repetitive authentication logic
- ❌ Database setup and migrations
- ❌ Deployment configuration
- ❌ Type safety across services

**Result:** 2-4 weeks just to build an MVP.

### ✨ The Solution

```bash
# Clone and build (npm package coming soon)
git clone https://github.com/hublabdev/capsulas-framework.git
cd capsulas-framework
npm install && npm run build

# Use a template
cd examples/saas-starter
npm install
node index.js
```

**Result:** Production app running in 5 minutes. ⚡

---

## 🎯 Why Capsulas?

<table>
<tr>
<td width="33%" align="center">

### 🎨 Visual First
Drag, drop, and connect modules in our n8n-style editor. No more boilerplate.

</td>
<td width="33%" align="center">

### 🔒 Type Safe
Full TypeScript support. Connections are validated at compile-time.

</td>
<td width="33%" align="center">

### 💻 Real Code
Generates clean TypeScript you own. No vendor lock-in. Deploy anywhere.

</td>
</tr>
<tr>
<td width="33%" align="center">

### 📦 23 Capsules
Auth, databases, AI, payments, email, and more. Batteries included.

</td>
<td width="33%" align="center">

### 🚀 One-Click Deploy
Deploy to Vercel, Railway, AWS, or anywhere with a single command.

</td>
<td width="33%" align="center">

### 🌍 Open Source
MIT licensed. Built by the community, for the community.

</td>
</tr>
</table>

---

## 📊 Capsulas vs Alternatives

| Feature | Capsulas | n8n | Zapier | Bubble | Retool |
|---------|----------|-----|--------|--------|--------|
| **Visual Builder** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Generates Code** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Type Safety** | ✅ | ❌ | ❌ | ❌ | ⚠️ |
| **Self-Hosted** | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| **Own the Code** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Open Source** | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| **Pricing** | **Free** | Free/Paid | Paid | Paid | Paid |

---

## 🏗️ Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/hublabdev/capsulas-framework.git
cd capsulas-framework

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests (500 tests passing)
npm test
```

### Your First Application

Choose a template to get started:

#### Option 1: SaaS Starter

```bash
cd examples/saas-starter
npm install
node index.js
```

**Features:**
- ✅ JWT Authentication (register/login)
- ✅ PostgreSQL Database
- ✅ Stripe Subscriptions ($29/$99/$299 plans)
- ✅ Email Notifications
- ✅ Redis Cache
- ✅ Complete demo included

[View SaaS Starter →](./examples/saas-starter)

#### Option 2: E-commerce Store

```bash
cd examples/ecommerce-store
npm install
node index.js
```

**Features:**
- ✅ Product Catalog with Search
- ✅ Shopping Cart Management
- ✅ Stripe Checkout Integration
- ✅ Order Processing
- ✅ Email Confirmations
- ✅ File Uploads

[View E-commerce Template →](./examples/ecommerce-store)

---

## 🧩 Available Capsules (23 Total)

### 🔐 Authentication
- **jwt-auth** - JWT token-based authentication
- **oauth** - OAuth 2.0 (Google, GitHub, Facebook, Twitter, Microsoft, LinkedIn)

### 🗄️ Data & Storage
- **database** - SQL/NoSQL databases (PostgreSQL, MongoDB, MySQL, SQLite)
- **cache** - Caching (Redis, Memory)
- **storage** - File storage (S3, Google Cloud Storage, Azure, Cloudflare R2)

### 🤖 AI & ML
- **ai-chat** - Chat completions (OpenAI, Anthropic, Llama)

### 📧 Communication
- **email** - Email sending (SendGrid, Resend, Nodemailer)
- **notifications** - Multi-channel notifications (Email, Push, SMS, Slack)
- **websocket** - Real-time WebSocket connections

### 💳 Payments
- **payments** - Payment processing (Stripe, PayPal, Square, Braintree)

### ⚙️ Processing
- **queue** - Job queues with retry logic
- **http** - HTTP client with retries

### 🎨 UI & Frontend
- **form-builder** - Dynamic form generation
- **theme** - Theme management (light/dark/system)
- **router** - Client-side routing (Hash, History, Memory)
- **state** - State management (Redux-style)

### 🛠️ Utilities
- **validator** - Input validation (Zod, Yup, Joi)
- **logger** - Structured logging (Winston, Pino, Bunyan)
- **encryption** - Data encryption (AES, RSA)
- **file-upload** - File upload handling
- **geolocation** - Geolocation services
- **i18n** - Internationalization
- **analytics** - Analytics (Google Analytics, Mixpanel, Segment)

[See all capsules →](./packages/capsules)

---

## 🎨 Example Templates

### 1. SaaS Starter

Complete SaaS application with authentication, billing, and database.

```javascript
const { initialize, registerUser, subscribeToPlan } = require('./examples/saas-starter');

await initialize();

// Register new user with 14-day trial
const user = await registerUser({
  email: 'user@example.com',
  password: 'SecurePass123!',
  name: 'John Doe',
  company: 'Acme Inc'
});

// Subscribe to Pro plan ($99/month)
await subscribeToPlan(user.id, 'pro');
```

**Use Cases:**
- SaaS products
- Subscription services
- B2B platforms
- Member portals

[Full Documentation →](./examples/saas-starter/README.md)

### 2. E-commerce Store

Complete online store with products, cart, and checkout.

```javascript
const { initialize, createProduct, addToCart, createCheckout } = require('./examples/ecommerce-store');

await initialize();

// Create a product
const product = await createProduct({
  name: 'Wireless Headphones',
  price: 99.99,
  stock: 50
});

// Add to cart and checkout
await addToCart('session-123', product.id, 2);
const checkout = await createCheckout('session-123', 'customer@example.com');
```

**Use Cases:**
- Online stores
- Marketplaces
- Digital products
- Physical goods

[Full Documentation →](./examples/ecommerce-store)

---

## 📦 Architecture

This is a monorepo containing:

- **[@capsulas/core](./packages/core)** - Core types, validators, and execution engine
- **[@capsulas/cli](./packages/cli)** - Command-line interface
- **[@capsulas/web](./packages/web)** - Visual flow editor
- **[@capsulas/capsules](./packages/capsules)** - Official capsules library (23 capsules)
- **[@capsulas/desktop](./packages/desktop)** - Electron desktop app
- **[tools/](./tools)** - Migration and development tools

---

## 🛠️ Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup

```bash
# Clone repository
git clone https://github.com/hublabdev/capsulas-framework.git
cd capsulas-framework

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Start visual editor
cd packages/web
node server.cjs
# Open http://localhost:3050
```

### Running Tests

```bash
# Run all tests (500 tests)
npm test

# Run specific test file
npm test -- packages/capsules/src/database/__tests__/service.test.ts

# Watch mode
npm test -- --watch
```

---

## 🚀 Deployment

### Vercel

```bash
cd examples/saas-starter
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node", "index.js"]
```

### Railway / AWS / Others

See our [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for platform-specific instructions.

---

## 📖 Documentation

- **[Getting Started](./docs/GETTING_STARTED.md)** - Build your first app in 10 minutes
- **[Documentation Home](./docs/README.md)** - Complete documentation
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Deploy to any platform
- **[AI Assistant Guide](./docs/AI_ASSISTANT_GUIDE.md)** - For AI-powered development
- **[FAQ](./docs/FAQ.md)** - Frequently asked questions

---

## 🤝 Contributing

We love contributions! Capsulas is built by the community.

### Ways to contribute:

- 🐛 [Report bugs](https://github.com/hublabdev/capsulas-framework/issues/new)
- 💡 [Request features](https://github.com/hublabdev/capsulas-framework/issues/new)
- 📝 [Improve docs](https://github.com/hublabdev/capsulas-framework/tree/master/docs)
- 🧩 Create new capsules
- 💻 [Submit PRs](CONTRIBUTING.md)

[Contributing guide →](CONTRIBUTING.md)

---

## 📊 Project Stats

- **23 Capsules** - Production-ready modules
- **500 Tests** - 100% passing
- **290 Files** - Clean, organized codebase
- **TypeScript** - Full type safety
- **MIT License** - Free forever

---

## 🌟 Community

- 💬 Discord (coming soon)
- 📧 Email: info@hublab.dev
- 🐛 [GitHub Issues](https://github.com/hublabdev/capsulas-framework/issues)
- 📖 [Documentation](./docs/README.md)

---

## 📄 License

MIT © [hublab.dev](https://github.com/hublabdev)

See [LICENSE](LICENSE) for more information.

---

## 🙏 Acknowledgments

Built with:
- TypeScript
- Node.js
- Vitest
- And the amazing open-source community

---

<div align="center">

### ⭐ Star us on GitHub — it helps!

**Made with ❤️ by the Capsulas community**

[Get Started](./docs/GETTING_STARTED.md) • [View Examples](./examples) • [Read Docs](./docs/README.md)

</div>
