/**
 * 🚀 SaaS Starter Template
 *
 * A complete SaaS application starter built with Capsulas Framework
 *
 * Features:
 * - JWT Authentication (register, login, verify)
 * - PostgreSQL Database (users, subscriptions, usage)
 * - Stripe Payments (subscriptions)
 * - Email Notifications (welcome, payment confirmations)
 * - Redis Cache (session management)
 * - Logger (Winston)
 *
 * Generated with Capsulas Framework
 * https://github.com/hublabdev/capsulas-framework
 */

const { createJWTAuthService } = require('@capsulas/capsules/jwt-auth');
const { createDatabaseService } = require('@capsulas/capsules/database');
const { createPaymentsService } = require('@capsulas/capsules/payments');
const { createEmailService } = require('@capsulas/capsules/email');
const { createCacheService } = require('@capsulas/capsules/cache');
const { createLoggerService } = require('@capsulas/capsules/logger');

// ============================================================================
// Configuration
// ============================================================================

const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-min-32-characters-long',
    expiresIn: '7d'
  },

  database: {
    provider: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'saas_starter',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },

  payments: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },

  email: {
    provider: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.EMAIL_FROM || 'noreply@yoursaas.com'
  },

  cache: {
    provider: process.env.REDIS_URL ? 'redis' : 'memory',
    url: process.env.REDIS_URL
  },

  logger: {
    provider: 'winston',
    level: process.env.LOG_LEVEL || 'info'
  }
};

// ============================================================================
// Initialize Services
// ============================================================================

const authService = createJWTAuthService(config.jwt);
const dbService = createDatabaseService(config.database);
const paymentsService = createPaymentsService(config.payments);
const emailService = createEmailService(config.email);
const cacheService = createCacheService(config.cache);
const logger = createLoggerService(config.logger);

// ============================================================================
// Business Logic
// ============================================================================

/**
 * Register a new user and create a free trial subscription
 */
async function registerUser(userData) {
  logger.info('Starting user registration', { email: userData.email });

  try {
    // 1. Register with auth service
    const authResult = await authService.register({
      email: userData.email,
      password: userData.password
    });

    logger.info('User authenticated', { userId: authResult.user.id });

    // 2. Create user in database
    const user = await dbService.create('users', {
      id: authResult.user.id,
      email: authResult.user.email,
      name: userData.name,
      company: userData.company,
      plan: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      created_at: new Date()
    });

    logger.info('User created in database', { userId: user.id });

    // 3. Create Stripe customer
    const customer = await paymentsService.createCustomer({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id
      }
    });

    // Update user with Stripe customer ID
    await dbService.update('users', user.id, {
      stripe_customer_id: customer.id
    });

    logger.info('Stripe customer created', { customerId: customer.id });

    // 4. Cache user data
    await cacheService.set(`user:${user.id}`, {
      ...user,
      stripe_customer_id: customer.id
    }, { ttl: 3600 });

    // 5. Send welcome email
    await emailService.send({
      to: user.email,
      subject: 'Welcome to SaaS Starter!',
      html: `
        <h1>Welcome ${user.name}!</h1>
        <p>Your 14-day free trial has started.</p>
        <p>You can now start using all features.</p>
        <a href="https://yoursaas.com/dashboard">Go to Dashboard</a>
      `
    });

    logger.info('Welcome email sent', { email: user.email });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan
      },
      token: authResult.token
    };

  } catch (error) {
    logger.error('Registration failed', {
      email: userData.email,
      error: error.message
    });
    throw error;
  }
}

/**
 * Login user
 */
async function loginUser(credentials) {
  logger.info('User login attempt', { email: credentials.email });

  try {
    // 1. Authenticate
    const authResult = await authService.login(credentials);

    // 2. Get user from cache or database
    let user = await cacheService.get(`user:${authResult.user.id}`);

    if (!user) {
      user = await dbService.findById('users', authResult.user.id);

      // Cache for next time
      await cacheService.set(`user:${user.id}`, user, { ttl: 3600 });
    }

    logger.info('User logged in successfully', { userId: user.id });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan
      },
      token: authResult.token
    };

  } catch (error) {
    logger.error('Login failed', {
      email: credentials.email,
      error: error.message
    });
    throw error;
  }
}

/**
 * Subscribe user to a paid plan
 */
async function subscribeToPlan(userId, planId) {
  logger.info('Starting subscription', { userId, planId });

  try {
    // 1. Get user
    let user = await cacheService.get(`user:${userId}`);
    if (!user) {
      user = await dbService.findById('users', userId);
    }

    // 2. Plan pricing
    const plans = {
      starter: { price: 29, priceId: 'price_starter' },
      pro: { price: 99, priceId: 'price_pro' },
      enterprise: { price: 299, priceId: 'price_enterprise' }
    };

    const plan = plans[planId];
    if (!plan) {
      throw new Error('Invalid plan');
    }

    // 3. Create Stripe subscription
    const subscription = await paymentsService.createSubscription({
      customerId: user.stripe_customer_id,
      priceId: plan.priceId
    });

    logger.info('Stripe subscription created', {
      subscriptionId: subscription.id
    });

    // 4. Update database
    await dbService.update('users', userId, {
      plan: planId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status
    });

    // 5. Create subscription record
    await dbService.create('subscriptions', {
      user_id: userId,
      plan: planId,
      amount: plan.price,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      created_at: new Date()
    });

    // 6. Invalidate cache
    await cacheService.delete(`user:${userId}`);

    // 7. Send confirmation email
    await emailService.send({
      to: user.email,
      subject: `Subscription Confirmed - ${planId} Plan`,
      html: `
        <h1>Thank you for subscribing!</h1>
        <p>Your ${planId} plan is now active.</p>
        <p>Amount: $${plan.price}/month</p>
      `
    });

    logger.info('Subscription completed', { userId, planId });

    return {
      success: true,
      subscription: {
        id: subscription.id,
        plan: planId,
        amount: plan.price,
        status: subscription.status
      }
    };

  } catch (error) {
    logger.error('Subscription failed', {
      userId,
      planId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get user dashboard data
 */
async function getDashboard(userId) {
  logger.info('Fetching dashboard', { userId });

  try {
    // Get from cache first
    const cacheKey = `dashboard:${userId}`;
    let dashboard = await cacheService.get(cacheKey);

    if (dashboard) {
      logger.info('Dashboard cache hit', { userId });
      return dashboard;
    }

    // Fetch from database
    const user = await dbService.findById('users', userId);

    const subscriptions = await dbService.find('subscriptions', {
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    const usage = await dbService.find('usage', {
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      limit: 10
    });

    dashboard = {
      user: {
        email: user.email,
        name: user.name,
        company: user.company,
        plan: user.plan
      },
      subscription: subscriptions[0] || null,
      usage: usage,
      stats: {
        total_usage: usage.length,
        trial_ends: user.trial_ends_at
      }
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, dashboard, { ttl: 300 });

    logger.info('Dashboard fetched', { userId });

    return dashboard;

  } catch (error) {
    logger.error('Dashboard fetch failed', {
      userId,
      error: error.message
    });
    throw error;
  }
}

// ============================================================================
// Initialize and Export
// ============================================================================

async function initialize() {
  logger.info('Initializing SaaS Starter services...');

  await authService.initialize();
  await dbService.initialize();
  await paymentsService.initialize();
  await emailService.initialize();
  await cacheService.initialize();
  await logger.initialize();

  logger.info('All services initialized successfully');
}

module.exports = {
  initialize,
  registerUser,
  loginUser,
  subscribeToPlan,
  getDashboard,

  // Export services for advanced usage
  services: {
    auth: authService,
    database: dbService,
    payments: paymentsService,
    email: emailService,
    cache: cacheService,
    logger
  }
};

// ============================================================================
// Demo Usage (if run directly)
// ============================================================================

if (require.main === module) {
  (async () => {
    try {
      await initialize();

      console.log('\n🚀 SaaS Starter Demo\n');

      // 1. Register a new user
      console.log('1️⃣ Registering new user...');
      const registration = await registerUser({
        email: 'john@example.com',
        password: 'SecurePass123!',
        name: 'John Doe',
        company: 'Acme Inc'
      });

      console.log('✅ User registered:', registration.user);
      console.log('🔑 Token:', registration.token.substring(0, 20) + '...');

      // 2. Login
      console.log('\n2️⃣ Logging in...');
      const login = await loginUser({
        email: 'john@example.com',
        password: 'SecurePass123!'
      });

      console.log('✅ Logged in:', login.user);

      // 3. Get dashboard
      console.log('\n3️⃣ Fetching dashboard...');
      const dashboard = await getDashboard(registration.user.id);

      console.log('✅ Dashboard:', dashboard);

      // 4. Subscribe to Pro plan
      console.log('\n4️⃣ Subscribing to Pro plan...');
      const subscription = await subscribeToPlan(
        registration.user.id,
        'pro'
      );

      console.log('✅ Subscription created:', subscription.subscription);

      console.log('\n✨ Demo completed successfully!\n');

      process.exit(0);

    } catch (error) {
      console.error('\n❌ Demo failed:', error.message);
      process.exit(1);
    }
  })();
}
