# 🚀 SaaS Starter Template

A complete, production-ready SaaS application starter built with **Capsulas Framework**.

## ✨ Features

This template includes everything you need to launch a SaaS product:

- ✅ **JWT Authentication** - Secure user registration and login
- ✅ **PostgreSQL Database** - Users, subscriptions, and usage tracking
- ✅ **Stripe Payments** - Subscription management and billing
- ✅ **Email Notifications** - Welcome emails and payment confirmations
- ✅ **Redis Cache** - Fast session and data caching
- ✅ **Structured Logging** - Winston logger with multiple levels

## 📦 What's Included

### Capsules Used

1. **@capsulas/capsules/jwt-auth** - Token-based authentication
2. **@capsulas/capsules/database** - PostgreSQL integration
3. **@capsulas/capsules/payments** - Stripe payments
4. **@capsulas/capsules/email** - SendGrid email service
5. **@capsulas/capsules/cache** - Redis/Memory caching
6. **@capsulas/capsules/logger** - Winston logging

### Business Logic

- **User Registration** - Create account with 14-day free trial
- **User Login** - Authenticate and return JWT token
- **Subscription Management** - Subscribe to Starter ($29), Pro ($99), or Enterprise ($299) plans
- **Dashboard** - Get user data, subscription status, and usage stats

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- Redis (optional, will use memory cache if not available)
- Stripe account
- SendGrid account (optional)

### Installation

```bash
# Clone the Capsulas Framework repo
git clone https://github.com/hublabdev/capsulas-framework.git
cd capsulas-framework

# Install dependencies
npm install

# Build the framework
npm run build

# Navigate to this example
cd examples/saas-starter

# Install example dependencies
npm install
```

### Configuration

Create a `.env` file:

```bash
# JWT
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_starter
DB_USER=postgres
DB_PASSWORD=your-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional)
SENDGRID_API_KEY=SG....
EMAIL_FROM=noreply@yoursaas.com

# Redis (optional - uses memory cache if not set)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
```

### Database Setup

Create the database and tables:

```sql
-- Create database
CREATE DATABASE saas_starter;

-- Connect to database
\c saas_starter;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'trial',
  trial_ends_at TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_usage_user ON usage(user_id);
```

### Run the Demo

```bash
npm start
```

**Expected Output:**

```
🚀 SaaS Starter Demo

1️⃣ Registering new user...
✅ User registered: {
  id: 1,
  email: 'john@example.com',
  name: 'John Doe',
  plan: 'trial'
}
🔑 Token: eyJhbGciOiJIUzI1NiIs...

2️⃣ Logging in...
✅ Logged in: { id: 1, email: 'john@example.com', name: 'John Doe', plan: 'trial' }

3️⃣ Fetching dashboard...
✅ Dashboard: {
  user: { ... },
  subscription: null,
  usage: [],
  stats: { ... }
}

4️⃣ Subscribing to Pro plan...
✅ Subscription created: {
  id: 'sub_...',
  plan: 'pro',
  amount: 99,
  status: 'active'
}

✨ Demo completed successfully!
```

## 📚 Usage

### Integrate into Your App

```javascript
const saasStarter = require('./index');

// Initialize all services
await saasStarter.initialize();

// Register a new user
const result = await saasStarter.registerUser({
  email: 'user@example.com',
  password: 'SecurePass123!',
  name: 'Jane Smith',
  company: 'Tech Startup Inc'
});

console.log('Token:', result.token);

// Login
const login = await saasStarter.loginUser({
  email: 'user@example.com',
  password: 'SecurePass123!'
});

// Subscribe to a plan
const subscription = await saasStarter.subscribeToPlan(
  login.user.id,
  'pro' // or 'starter', 'enterprise'
);

// Get dashboard data
const dashboard = await saasStarter.getDashboard(login.user.id);
```

### Available Plans

```javascript
{
  starter: {
    price: 29,
    features: ['Up to 1,000 users', 'Basic support', '10 GB storage']
  },
  pro: {
    price: 99,
    features: ['Up to 10,000 users', 'Priority support', '100 GB storage', 'Advanced features']
  },
  enterprise: {
    price: 299,
    features: ['Unlimited users', '24/7 support', 'Unlimited storage', 'Custom features']
  }
}
```

## 🎨 Customization

### Add More Features

This template is designed to be extended. Here are some ideas:

**Team Management:**
```javascript
const { createDatabaseService } = require('@capsulas/capsules/database');

async function inviteTeamMember(userId, email) {
  // Create team_members table
  await dbService.create('team_members', {
    user_id: userId,
    email: email,
    role: 'member',
    invited_at: new Date()
  });

  // Send invitation email
  await emailService.send({
    to: email,
    subject: 'You\'ve been invited!',
    html: '...'
  });
}
```

**API Rate Limiting:**
```javascript
const { createCacheService } = require('@capsulas/capsules/cache');

async function checkRateLimit(userId) {
  const key = `ratelimit:${userId}`;
  const current = await cacheService.get(key) || 0;

  if (current >= 100) { // 100 requests per minute
    throw new Error('Rate limit exceeded');
  }

  await cacheService.set(key, current + 1, { ttl: 60 });
}
```

**Webhooks:**
```javascript
async function handleStripeWebhook(event) {
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;

    // Downgrade user to free plan
    await dbService.update('users', userId, {
      plan: 'free',
      subscription_status: 'cancelled'
    });
  }
}
```

## 🔒 Security Checklist

Before going to production:

- [ ] Change `JWT_SECRET` to a secure random string (min 32 chars)
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure CORS properly
- [ ] Add input validation (see `@capsulas/capsules/validator`)
- [ ] Enable rate limiting
- [ ] Set up Stripe webhooks for payment events
- [ ] Configure proper database user permissions
- [ ] Enable Redis authentication if using cloud Redis
- [ ] Set up monitoring and alerts

## 🚀 Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [{ "src": "index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "index.js" }],
  "env": {
    "JWT_SECRET": "@jwt-secret",
    "DB_HOST": "@db-host",
    "STRIPE_SECRET_KEY": "@stripe-secret"
  }
}
```

### Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

Build and run:

```bash
docker build -t saas-starter .
docker run -p 3000:3000 --env-file .env saas-starter
```

## 📖 Learn More

- [Capsulas Framework Documentation](../../docs/README.md)
- [Getting Started Guide](../../docs/GETTING_STARTED.md)
- [Deployment Guide](../../docs/DEPLOYMENT_GUIDE.md)
- [Stripe Documentation](https://stripe.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contributing

Found a bug or want to add a feature? Please open an issue or PR!

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details

---

**Built with [Capsulas Framework](https://github.com/hublabdev/capsulas-framework)**

*Build production-ready SaaS applications in minutes, not weeks.*
