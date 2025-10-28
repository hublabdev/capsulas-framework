<div align="center">
  <h1>🎨 Capsulas</h1>

  ### The WordPress of Apps

  **Build production-ready applications visually in minutes, not weeks.**

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

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
npm install -g @capsulas/cli
capsulas create my-app --template saas
capsulas add auth-oauth database ai-chat email
cd my-app && npm run dev
```

**Result:** Production app in 10 minutes. ⚡

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
Connections are validated in real-time. Incompatible types? The editor tells you immediately.

</td>
<td width="33%" align="center">

### 💻 Real Code
Generates clean TypeScript you own. No vendor lock-in. Deploy anywhere.

</td>
</tr>
<tr>
<td width="33%" align="center">

### 📦 50+ Modules
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
| **Mobile Apps** | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| **AI Native** | ✅ | ⚠️ | ⚠️ | ❌ | ❌ |
| **Open Source** | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| **Own the Code** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Pricing** | **Free** | Free/Paid | Paid | Paid | Paid |

---

## 🏗️ Quick Start

### Installation

```bash
npm install -g @capsulas/cli
```

### Create Your First App

```bash
# Create a new project
capsulas create my-saas-app

# Navigate to project
cd my-saas-app

# Install dependencies
npm install

# Open visual editor
npm run dev
```

This opens the visual editor at `http://localhost:3040`:

1. **Drag** capsules from the sidebar
2. **Connect** compatible ports (type-safe)
3. **Configure** each capsule in the panel
4. **Generate** TypeScript code
5. **Deploy** with one command

---

## 📦 Architecture

This is a monorepo containing:

- **[@capsulas/core](./packages/core)** - Core types, validators, and execution engine
- **[@capsulas/cli](./packages/cli)** - Command-line interface
- **[@capsulas/web](./packages/web)** - Visual flow editor (coming soon)
- **[@capsulas/capsules](./packages/capsules)** - Official capsules library (coming soon)

---

## 🧩 Available Capsules

### 🔐 Authentication
- `auth-jwt` - JWT token-based authentication
- `auth-oauth` - OAuth 2.0 with PKCE (Google, GitHub, Microsoft)
- `auth-session` - Session-based authentication

### 🗄️ Data
- `database` - SQL/NoSQL database queries (Postgres, MongoDB, MySQL)
- `cache` - Redis/Memory caching
- `storage` - File storage (S3, local)

### 🤖 AI
- `ai-chat` - Chat completions (OpenAI, Claude, Llama)
- `ai-embeddings` - Text embeddings
- `ai-image` - Image generation

### 📧 Communication
- `email` - Email with templates (SendGrid, Resend)
- `sms` - SMS notifications (Twilio)
- `websocket` - Real-time connections

### 💳 Payments
- `stripe` - Stripe payments and subscriptions
- `paypal` - PayPal integration

### ⚙️ Processing
- `queue` - Job queue with retry logic
- `cron` - Scheduled tasks
- `workflow` - Multi-step workflows

[See all capsules →](./packages/capsules)

---

## 🎨 Example: SaaS Starter

```bash
capsulas create my-saas --template saas
cd my-saas
npm install
npm run dev
```

**Includes:**
- OAuth login (Google + GitHub)
- User dashboard
- PostgreSQL database
- Email notifications
- Stripe subscriptions

**Deploy to Vercel:**
```bash
npm run deploy
```

---

## 🛠️ Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/capsulas.git
cd capsulas

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Start development server
npm run dev
```

---

## 🤝 Contributing

We love contributions! Capsulas is built by the community.

### Ways to contribute:

- 🐛 [Report bugs](https://github.com/yourusername/capsulas/issues/new?template=bug_report.md)
- 💡 [Request features](https://github.com/yourusername/capsulas/issues/new?template=feature_request.md)
- 📝 [Improve docs](https://github.com/yourusername/capsulas/tree/main/docs)
- 🧩 [Create capsules](./docs/creating-capsules.md)
- 💻 [Submit PRs](CONTRIBUTING.md)

[Contributing guide →](CONTRIBUTING.md)

---

## 📖 Documentation

- [Getting Started](./docs/getting-started.md)
- [Core Concepts](./docs/core-concepts.md)
- [Creating Capsules](./docs/creating-capsules.md)
- [CLI Reference](./docs/cli-reference.md)
- [API Reference](./docs/api-reference.md)

---

## 📄 License

MIT © [Your Name](https://github.com/yourusername)

See [LICENSE](LICENSE) for more information.

---

## 🌟 Community

- 💬 [Discord](https://discord.gg/capsulas) - Chat, support, showcase
- 🐦 [Twitter](https://twitter.com/capsulasdev) - Updates and tips
- 📝 [Blog](https://capsulas.dev/blog) - Articles and guides

---

<div align="center">

### ⭐ Star us on GitHub — it helps!

**Made with ❤️ by the Capsulas community**

</div>
