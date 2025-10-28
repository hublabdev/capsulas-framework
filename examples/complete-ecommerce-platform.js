/**
 * Complete E-commerce Platform
 * Demonstrates integration of 8 new capsules + previous ones
 *
 * Features:
 * - Multi-language support (i18n)
 * - Payment processing (Payments)
 * - User authentication (OAuth)
 * - Location-based features (Geolocation)
 * - Dark mode (Theme)
 * - Client-side routing (Router)
 * - Reactive state management (State)
 * - Dynamic checkout forms (Form-Builder)
 */

import { createI18nService } from '@capsulas/capsules/i18n';
import { createPaymentsService } from '@capsulas/capsules/payments';
import { createOAuthService } from '@capsulas/capsules/oauth';
import { createGeolocationService } from '@capsulas/capsules/geolocation';
import { createThemeService } from '@capsulas/capsules/theme';
import { createRouterService } from '@capsulas/capsules/router';
import { createStateService } from '@capsulas/capsules/state';
import { createFormBuilderService } from '@capsulas/capsules/form-builder';
import { createCacheService } from '@capsulas/capsules/cache';
import { createLoggerService } from '@capsulas/capsules/logger';

class EcommercePlatform {
  constructor() {
    this.services = {};
  }

  async initialize() {
    console.log('🚀 Initializing Complete E-commerce Platform...\n');

    // 1. Logger - Track everything
    this.services.logger = await createLoggerService({
      level: 'info',
      format: 'json',
    });
    this.services.logger.info('Platform initialization started');

    // 2. i18n - Multi-language support
    this.services.i18n = await createI18nService({
      defaultLocale: 'en',
      supportedLocales: ['en', 'es', 'fr', 'de', 'ja'],
      translations: {
        en: {
          welcome: 'Welcome to Global Store',
          checkout: 'Proceed to Checkout',
          total: 'Total: {{amount}}',
          shipping: 'Shipping to {{country}}',
          items: {
            one: '{{count}} item in cart',
            other: '{{count}} items in cart',
          },
        },
        es: {
          welcome: 'Bienvenido a la Tienda Global',
          checkout: 'Proceder al Pago',
          total: 'Total: {{amount}}',
          shipping: 'Envío a {{country}}',
          items: {
            one: '{{count}} artículo en el carrito',
            other: '{{count}} artículos en el carrito',
          },
        },
        fr: {
          welcome: 'Bienvenue sur Global Store',
          checkout: 'Passer à la Caisse',
          total: 'Total: {{amount}}',
          shipping: 'Expédition vers {{country}}',
          items: {
            one: '{{count}} article dans le panier',
            other: '{{count}} articles dans le panier',
          },
        },
      },
      detectBrowserLocale: true,
    });
    this.services.logger.info('i18n initialized', {
      locale: this.services.i18n.getLocale()
    });

    // 3. Theme - Dark mode support
    this.services.theme = await createThemeService({
      mode: 'system',
      colorScheme: 'default',
      persistToStorage: true,
      syncWithSystem: true,
      customColors: {
        brand: '#00ff00',
        brandLight: '#4ade80',
        brandDark: '#15803d',
      },
    });
    this.services.theme.on('change', (theme) => {
      this.services.logger.info('Theme changed', { mode: theme.mode });
    });

    // 4. State - Centralized state management
    this.services.state = await createStateService({
      initialState: {
        user: null,
        cart: {
          items: [],
          total: 0,
          currency: 'USD',
        },
        location: null,
        preferences: {
          locale: 'en',
          theme: 'system',
        },
        checkout: {
          step: 1,
          shipping: null,
          billing: null,
        },
      },
      persist: true,
      storageKey: 'ecommerce-state',
    });

    // 5. Cache - Performance optimization
    this.services.cache = await createCacheService({
      provider: 'memory',
      ttl: 3600,
      maxSize: 1000,
    });

    // 6. Geolocation - Location-based features
    this.services.geo = await createGeolocationService({
      provider: 'ipapi',
      timeout: 10000,
    });

    // Detect user location
    try {
      const location = await this.services.geo.getLocationFromIP('');
      this.services.state.set('location', location);
      this.services.logger.info('Location detected', {
        city: location.city,
        country: location.country
      });

      // Auto-set locale based on location
      const localeMap = {
        'US': 'en', 'GB': 'en', 'ES': 'es', 'MX': 'es',
        'FR': 'fr', 'CA': 'fr', 'DE': 'de', 'JP': 'ja',
      };
      const locale = localeMap[location.countryCode] || 'en';
      this.services.i18n.setLocale(locale);
      this.services.state.set('preferences.locale', locale);
    } catch (error) {
      this.services.logger.error('Geolocation failed', { error: error.message });
    }

    // 7. OAuth - Social authentication
    this.services.oauth = await createOAuthService({
      provider: 'google',
      clientId: process.env.GOOGLE_CLIENT_ID || 'demo-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-secret',
      redirectUri: 'http://localhost:3000/auth/callback',
      scopes: ['profile', 'email'],
    });

    // 8. Payments - Stripe integration
    this.services.payments = await createPaymentsService({
      provider: 'stripe',
      apiKey: process.env.STRIPE_API_KEY || 'sk_test_demo',
      currency: 'USD',
      sandbox: true,
    });

    // 9. Form Builder - Dynamic forms
    this.services.formBuilder = await createFormBuilderService({
      validateOnChange: true,
      validateOnBlur: true,
      validateOnSubmit: true,
    });

    // 10. Router - Client-side routing
    this.services.router = await createRouterService({
      mode: 'history',
      basePath: '/',
      routes: [
        {
          path: '/',
          name: 'home',
          handler: (ctx) => this.renderHome(ctx),
        },
        {
          path: '/products',
          name: 'products',
          handler: (ctx) => this.renderProducts(ctx),
        },
        {
          path: '/products/:id',
          name: 'product-detail',
          handler: (ctx) => this.renderProductDetail(ctx),
        },
        {
          path: '/cart',
          name: 'cart',
          handler: (ctx) => this.renderCart(ctx),
        },
        {
          path: '/checkout',
          name: 'checkout',
          handler: (ctx) => this.renderCheckout(ctx),
          beforeEnter: async (to, from) => {
            // Require items in cart
            const cart = this.services.state.get('cart');
            if (cart.items.length === 0) {
              this.services.logger.warn('Checkout blocked - empty cart');
              return false;
            }
            return true;
          },
        },
        {
          path: '/auth/login',
          name: 'login',
          handler: (ctx) => this.renderLogin(ctx),
        },
        {
          path: '/auth/callback',
          name: 'oauth-callback',
          handler: (ctx) => this.handleOAuthCallback(ctx),
        },
        {
          path: '/account',
          name: 'account',
          handler: (ctx) => this.renderAccount(ctx),
          beforeEnter: async (to, from) => {
            // Require authentication
            const user = this.services.state.get('user');
            if (!user) {
              this.services.router.push('/auth/login');
              return false;
            }
            return true;
          },
        },
      ],
    });

    // Listen to state changes
    this.setupStateListeners();

    this.services.logger.info('Platform initialized successfully');
    console.log('✅ Platform Ready!\n');
    this.displayStats();
  }

  setupStateListeners() {
    // Listen to cart changes
    this.services.state.on('cart.items', (newItems, oldItems) => {
      const count = newItems.length;
      this.services.logger.info('Cart updated', { count });

      // Update UI with translated text
      const locale = this.services.state.get('preferences.locale');
      const message = this.services.i18n.t('items', { count });
      console.log(`📦 ${message}`);
    });

    // Listen to user changes
    this.services.state.on('user', (newUser, oldUser) => {
      if (newUser && !oldUser) {
        this.services.logger.info('User logged in', {
          email: newUser.email
        });

        // Welcome message in user's language
        const welcome = this.services.i18n.t('welcome');
        console.log(`👋 ${welcome}, ${newUser.name}!`);
      } else if (!newUser && oldUser) {
        this.services.logger.info('User logged out');
      }
    });
  }

  // ==================== ROUTE HANDLERS ====================

  async renderHome(ctx) {
    console.log('\n🏠 HOME PAGE');
    const welcome = this.services.i18n.t('welcome');
    console.log(`   ${welcome}`);

    // Show location-based banner
    const location = this.services.state.get('location');
    if (location) {
      const shipping = this.services.i18n.t('shipping', {
        country: location.country
      });
      console.log(`   🌍 ${shipping}`);
    }
  }

  async renderProducts(ctx) {
    console.log('\n📦 PRODUCTS PAGE');

    // Check cache first
    const cacheKey = `products:${ctx.query.category || 'all'}`;
    let products = await this.services.cache.get(cacheKey);

    if (!products) {
      // Simulate API call
      products = this.getMockProducts();
      await this.services.cache.set(cacheKey, products);
      console.log('   📊 Products loaded from API');
    } else {
      console.log('   ⚡ Products loaded from cache');
    }

    console.log(`   Found ${products.length} products`);
  }

  async renderProductDetail(ctx) {
    const productId = ctx.params.id;
    console.log(`\n🛍️  PRODUCT DETAIL (ID: ${productId})`);

    const product = this.getMockProducts().find(p => p.id === productId);
    if (product) {
      console.log(`   ${product.name} - $${product.price}`);
      console.log(`   [Add to Cart Button]`);
    }
  }

  async renderCart(ctx) {
    console.log('\n🛒 CART PAGE');
    const cart = this.services.state.get('cart');

    if (cart.items.length === 0) {
      console.log('   Your cart is empty');
      return;
    }

    console.log(`   Items: ${cart.items.length}`);
    const total = this.services.i18n.t('total', {
      amount: `$${cart.total}`
    });
    console.log(`   ${total}`);

    const checkout = this.services.i18n.t('checkout');
    console.log(`   [${checkout} Button]`);
  }

  async renderCheckout(ctx) {
    console.log('\n💳 CHECKOUT PAGE');

    // Create checkout form dynamically
    const checkoutForm = this.services.formBuilder.createForm({
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          required: true,
          validation: {
            rules: ['required', 'email'],
            message: 'Valid email required',
          },
        },
        {
          name: 'cardNumber',
          type: 'text',
          label: 'Card Number',
          required: true,
          validation: {
            rules: ['required', 'pattern'],
            pattern: /^\d{13,19}$/,
            message: 'Invalid card number',
          },
        },
        {
          name: 'cardExpiry',
          type: 'text',
          label: 'Expiry (MM/YY)',
          required: true,
          validation: {
            rules: ['required', 'pattern'],
            pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
            message: 'Format: MM/YY',
          },
        },
        {
          name: 'cardCvc',
          type: 'text',
          label: 'CVC',
          required: true,
          validation: {
            rules: ['required', 'pattern'],
            pattern: /^\d{3,4}$/,
            message: 'Invalid CVC',
          },
        },
        {
          name: 'country',
          type: 'select',
          label: 'Country',
          required: true,
          options: [
            { label: 'United States', value: 'US' },
            { label: 'United Kingdom', value: 'GB' },
            { label: 'Canada', value: 'CA' },
            { label: 'Spain', value: 'ES' },
            { label: 'France', value: 'FR' },
          ],
        },
      ],
    });

    // Pre-fill location
    const location = this.services.state.get('location');
    if (location?.countryCode) {
      checkoutForm.setFieldValue('country', location.countryCode);
    }

    // Handle form submission
    checkoutForm.onSubmit(async (values) => {
      await this.processPayment(values);
    });

    console.log('   Checkout form ready');
    console.log('   Fields:', checkoutForm.fields.map(f => f.name).join(', '));
  }

  async renderLogin(ctx) {
    console.log('\n🔐 LOGIN PAGE');
    const authUrl = this.services.oauth.getAuthorizationUrl();
    console.log('   [Sign in with Google]');
    console.log(`   Auth URL: ${authUrl.substring(0, 50)}...`);
  }

  async handleOAuthCallback(ctx) {
    console.log('\n🔄 OAuth Callback Handler');

    try {
      const code = ctx.query.code;
      const state = ctx.query.state;

      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for token
      const token = await this.services.oauth.exchangeCodeForToken(code, state);
      console.log('   ✅ Token received');

      // Get user info
      const user = await this.services.oauth.getUserInfo(token.accessToken);
      console.log(`   ✅ User: ${user.email}`);

      // Update state
      this.services.state.set('user', user);

      // Redirect to home
      this.services.router.push('/');
    } catch (error) {
      this.services.logger.error('OAuth callback failed', {
        error: error.message
      });
      console.log('   ❌ Authentication failed');
    }
  }

  async renderAccount(ctx) {
    console.log('\n👤 ACCOUNT PAGE');
    const user = this.services.state.get('user');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Locale: ${this.services.state.get('preferences.locale')}`);
    console.log(`   Theme: ${this.services.theme.getTheme().mode}`);
  }

  // ==================== BUSINESS LOGIC ====================

  async processPayment(paymentDetails) {
    console.log('\n💰 Processing Payment...');

    try {
      const cart = this.services.state.get('cart');
      const user = this.services.state.get('user');

      // Create customer if needed
      let customerId;
      if (user) {
        const cached = await this.services.cache.get(`customer:${user.id}`);
        if (cached) {
          customerId = cached;
        } else {
          const customer = await this.services.payments.createCustomer(
            user.email,
            { name: user.name }
          );
          customerId = customer.id;
          await this.services.cache.set(`customer:${user.id}`, customerId);
        }
      }

      // Create payment intent
      const payment = await this.services.payments.createPayment(
        Math.round(cart.total * 100), // Convert to cents
        cart.currency,
        {
          customer: customerId,
          description: `Order - ${cart.items.length} items`,
          metadata: {
            orderId: `order_${Date.now()}`,
            itemCount: cart.items.length,
          },
        }
      );

      console.log(`   ✅ Payment intent created: ${payment.id}`);

      // Confirm payment
      const confirmed = await this.services.payments.confirmPayment(payment.id);

      if (confirmed.status === 'succeeded') {
        console.log('   ✅ Payment successful!');

        // Clear cart
        this.services.state.set('cart', {
          items: [],
          total: 0,
          currency: 'USD',
        });

        // Log success
        this.services.logger.info('Order completed', {
          paymentId: payment.id,
          amount: cart.total,
          customerId,
        });

        // Redirect to success page
        this.services.router.push('/order/success');
      } else {
        throw new Error(`Payment failed: ${confirmed.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Payment failed: ${error.message}`);
      this.services.logger.error('Payment processing failed', {
        error: error.message
      });
    }
  }

  addToCart(product) {
    const cart = this.services.state.get('cart');
    const items = [...cart.items, product];
    const total = items.reduce((sum, item) => sum + item.price, 0);

    this.services.state.set('cart', {
      items,
      total,
      currency: cart.currency,
    });

    this.services.logger.info('Item added to cart', {
      productId: product.id,
      total,
    });
  }

  // ==================== DEMO HELPERS ====================

  getMockProducts() {
    return [
      { id: '1', name: 'Sacred Terminal Tee', price: 29.99, category: 'apparel' },
      { id: '2', name: 'IBM Plex Mono Poster', price: 19.99, category: 'art' },
      { id: '3', name: 'Green Phosphor Mug', price: 14.99, category: 'accessories' },
      { id: '4', name: 'Capsulas Framework Book', price: 49.99, category: 'books' },
      { id: '5', name: 'Developer Sticker Pack', price: 9.99, category: 'accessories' },
    ];
  }

  displayStats() {
    console.log('📊 Platform Statistics:\n');
    console.log(`   i18n:        ${this.services.i18n.getStats().totalTranslations} translations`);
    console.log(`   Theme:       ${this.services.theme.getStats().themeChanges} changes`);
    console.log(`   State:       ${this.services.state.getStats().totalUpdates} updates`);
    console.log(`   Cache:       ${this.services.cache.getStats().hits} hits`);
    console.log(`   Payments:    ${this.services.payments.getStats().totalPayments} payments`);
    console.log(`   OAuth:       ${this.services.oauth.getStats().totalAuthorizations} auths`);
    console.log(`   Geolocation: ${this.services.geo.getStats().totalRequests} requests`);
    console.log(`   Router:      ${this.services.router.getStats().totalNavigations} navigations`);
    console.log('');
  }

  // ==================== DEMO SIMULATION ====================

  async runDemo() {
    console.log('\n🎬 Running E-commerce Demo Simulation...\n');

    // 1. Browse products
    await this.services.router.push('/products');
    await this.sleep(1000);

    // 2. View product detail
    await this.services.router.push('/products/1');
    await this.sleep(1000);

    // 3. Add to cart
    console.log('\n➕ Adding product to cart...');
    this.addToCart(this.getMockProducts()[0]);
    await this.sleep(1000);

    // 4. View cart
    await this.services.router.push('/cart');
    await this.sleep(1000);

    // 5. Try checkout (will create form)
    await this.services.router.push('/checkout');
    await this.sleep(1000);

    // 6. Change language
    console.log('\n🌐 Changing language to Spanish...');
    this.services.i18n.setLocale('es');
    await this.sleep(1000);

    // 7. Toggle theme
    console.log('\n🌙 Toggling dark mode...');
    this.services.theme.setMode('dark');
    await this.sleep(1000);

    // 8. Display final stats
    console.log('\n');
    this.displayStats();

    console.log('✅ Demo completed!\n');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ==================== RUN DEMO ====================

async function main() {
  const platform = new EcommercePlatform();
  await platform.initialize();
  await platform.runDemo();
}

main().catch(console.error);
