# Capsulas Framework

> **The WordPress of Apps** - Build production-ready applications visually in minutes, not weeks.

[![npm version](https://img.shields.io/npm/v/capsulas-framework.svg)](https://www.npmjs.com/package/capsulas-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

Capsulas is a complete visual development framework with **32 production-ready modules** (capsules) that let you build anything from CRM systems to AI chatbots by connecting pre-built, type-safe components.

## 🚀 Quick Start

\`\`\`bash
npm install capsulas-framework
\`\`\`

\`\`\`typescript
import { createHttpService } from 'capsulas-framework/http';
import { createDatabaseService } from 'capsulas-framework/database';

// Create HTTP client
const http = await createHttpService({
  baseURL: 'https://api.example.com',
  timeout: 5000
});

// Make API calls
const response = await http.get('/users');
console.log(response.data);
\`\`\`

## 📦 All 32 Capsules

### 🔐 Authentication
- **auth-jwt** - JWT token authentication
- **auth-oauth-google** - Google OAuth 2.0  
- **oauth** - Generic OAuth 2.0

### 🗄️ Data & Storage
- **database** - SQL/NoSQL databases
- **cache** - Redis/Memory caching
- **storage** - File storage (S3, GCS, Azure)

### 🤖 AI
- **ai-chat** - OpenAI GPT, Anthropic Claude

### 📧 Communication
- **email** - SendGrid, Resend, Nodemailer
- **sms** - Twilio, AWS SNS
- **notifications** - Multi-channel notifications
- **websocket** - Real-time connections

### 💳 Payments
- **payments** - Stripe, PayPal, Square

And 17 more! See full list at https://hublab.dev

## 📖 Documentation

- [Full Documentation](https://github.com/hublabdev/capsulas-framework)
- [Visual Editor](https://hublab.dev/builder)
- [API Reference](https://github.com/hublabdev/capsulas-framework/tree/main/packages/capsules/src)

## 📄 License

MIT © [HubLab](https://hublab.dev)
