/**
 * 🛒 E-commerce Store Template
 *
 * A complete e-commerce store built with Capsulas Framework
 *
 * Features:
 * - Product catalog with search
 * - Shopping cart management
 * - Stripe checkout
 * - Order management
 * - Email notifications
 * - Image uploads for products
 *
 * Generated with Capsulas Framework
 * https://github.com/hublabdev/capsulas-framework
 */

const { createDatabaseService } = require('@capsulas/capsules/database');
const { createPaymentsService } = require('@capsulas/capsules/payments');
const { createEmailService } = require('@capsulas/capsules/email');
const { createCacheService } = require('@capsulas/capsules/cache');
const { createFileUploadService } = require('@capsulas/capsules/file-upload');
const { createLoggerService } = require('@capsulas/capsules/logger');

// ============================================================================
// Configuration
// ============================================================================

const config = {
  database: {
    provider: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'ecommerce',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },

  payments: {
    provider: 'stripe',
    apiKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
  },

  email: {
    provider: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.EMAIL_FROM || 'orders@yourstore.com'
  },

  cache: {
    provider: 'memory',
    ttl: 3600
  },

  fileUpload: {
    provider: 's3',
    bucket: process.env.S3_BUCKET || 'product-images',
    region: process.env.AWS_REGION || 'us-east-1'
  },

  logger: {
    provider: 'winston',
    level: 'info'
  }
};

// ============================================================================
// Initialize Services
// ============================================================================

const db = createDatabaseService(config.database);
const payments = createPaymentsService(config.payments);
const email = createEmailService(config.email);
const cache = createCacheService(config.cache);
const fileUpload = createFileUploadService(config.fileUpload);
const logger = createLoggerService(config.logger);

// ============================================================================
// Product Management
// ============================================================================

/**
 * Get all products with optional filters
 */
async function getProducts(filters = {}) {
  logger.info('Fetching products', { filters });

  const cacheKey = `products:${JSON.stringify(filters)}`;
  let products = await cache.get(cacheKey);

  if (products) {
    logger.info('Products cache hit');
    return products;
  }

  const query = {
    where: { active: true },
    orderBy: { created_at: 'desc' }
  };

  if (filters.category) {
    query.where.category = filters.category;
  }

  if (filters.search) {
    query.where.name = { contains: filters.search };
  }

  products = await db.find('products', query);

  // Cache for 1 hour
  await cache.set(cacheKey, products, { ttl: 3600 });

  return products;
}

/**
 * Get product by ID
 */
async function getProduct(productId) {
  const cacheKey = `product:${productId}`;
  let product = await cache.get(cacheKey);

  if (!product) {
    product = await db.findById('products', productId);
    await cache.set(cacheKey, product, { ttl: 3600 });
  }

  return product;
}

/**
 * Create a new product
 */
async function createProduct(productData) {
  logger.info('Creating product', { name: productData.name });

  const product = await db.create('products', {
    ...productData,
    active: true,
    created_at: new Date()
  });

  // Invalidate products cache
  await cache.deletePattern('products:*');

  logger.info('Product created', { productId: product.id });

  return product;
}

// ============================================================================
// Shopping Cart
// ============================================================================

/**
 * Add item to cart
 */
async function addToCart(sessionId, productId, quantity = 1) {
  logger.info('Adding to cart', { sessionId, productId, quantity });

  const product = await getProduct(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    throw new Error('Insufficient stock');
  }

  const cartKey = `cart:${sessionId}`;
  let cart = await cache.get(cartKey) || { items: [] };

  const existingItem = cart.items.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image
    });
  }

  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.updatedAt = new Date();

  await cache.set(cartKey, cart, { ttl: 86400 }); // 24 hours

  logger.info('Item added to cart', { cartTotal: cart.total });

  return cart;
}

/**
 * Get cart
 */
async function getCart(sessionId) {
  const cartKey = `cart:${sessionId}`;
  const cart = await cache.get(cartKey) || { items: [], total: 0 };
  return cart;
}

/**
 * Remove item from cart
 */
async function removeFromCart(sessionId, productId) {
  const cartKey = `cart:${sessionId}`;
  let cart = await cache.get(cartKey);

  if (!cart) {
    return { items: [], total: 0 };
  }

  cart.items = cart.items.filter(item => item.productId !== productId);
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  await cache.set(cartKey, cart, { ttl: 86400 });

  return cart;
}

// ============================================================================
// Checkout & Orders
// ============================================================================

/**
 * Create checkout session
 */
async function createCheckout(sessionId, customerEmail) {
  logger.info('Creating checkout', { sessionId, customerEmail });

  const cart = await getCart(sessionId);

  if (!cart.items || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Create Stripe checkout session
  const checkoutSession = await payments.createCheckoutSession({
    lineItems: cart.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : []
        },
        unit_amount: Math.round(item.price * 100) // Stripe uses cents
      },
      quantity: item.quantity
    })),
    mode: 'payment',
    customerEmail,
    successUrl: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.APP_URL}/cart`
  });

  logger.info('Checkout session created', {
    checkoutId: checkoutSession.id
  });

  return {
    checkoutUrl: checkoutSession.url,
    sessionId: checkoutSession.id
  };
}

/**
 * Process successful order
 */
async function processOrder(checkoutSessionId) {
  logger.info('Processing order', { checkoutSessionId });

  // Get checkout session from Stripe
  const session = await payments.getCheckoutSession(checkoutSessionId);

  if (session.payment_status !== 'paid') {
    throw new Error('Payment not completed');
  }

  // Create order in database
  const order = await db.create('orders', {
    stripe_session_id: checkoutSessionId,
    customer_email: session.customer_email,
    amount: session.amount_total / 100,
    status: 'paid',
    created_at: new Date()
  });

  // Create order items
  const lineItems = await payments.getCheckoutSessionLineItems(checkoutSessionId);

  for (const item of lineItems.data) {
    await db.create('order_items', {
      order_id: order.id,
      product_name: item.description,
      quantity: item.quantity,
      price: item.amount_total / 100
    });
  }

  // Update product stock
  // (In real app, you'd need to map line items to product IDs)

  // Send confirmation email
  await email.send({
    to: session.customer_email,
    subject: `Order Confirmation #${order.id}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Order #${order.id}</p>
      <p>Total: $${order.amount}</p>
      <p>We'll send you another email when your order ships.</p>
    `
  });

  logger.info('Order processed', { orderId: order.id });

  return order;
}

/**
 * Get order details
 */
async function getOrder(orderId) {
  const order = await db.findById('orders', orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  const items = await db.find('order_items', {
    where: { order_id: orderId }
  });

  return {
    ...order,
    items
  };
}

// ============================================================================
// Initialize and Export
// ============================================================================

async function initialize() {
  logger.info('Initializing E-commerce services...');

  await db.initialize();
  await payments.initialize();
  await email.initialize();
  await cache.initialize();
  await fileUpload.initialize();
  await logger.initialize();

  logger.info('All services initialized');
}

module.exports = {
  initialize,

  // Products
  getProducts,
  getProduct,
  createProduct,

  // Cart
  addToCart,
  getCart,
  removeFromCart,

  // Checkout
  createCheckout,
  processOrder,
  getOrder,

  // Services
  services: {
    database: db,
    payments,
    email,
    cache,
    fileUpload,
    logger
  }
};

// ============================================================================
// Demo Usage
// ============================================================================

if (require.main === module) {
  (async () => {
    try {
      await initialize();

      console.log('\n🛒 E-commerce Store Demo\n');

      // 1. Create sample products
      console.log('1️⃣ Creating products...');

      const product1 = await createProduct({
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 99.99,
        category: 'Electronics',
        stock: 50,
        image: 'https://example.com/headphones.jpg'
      });

      const product2 = await createProduct({
        name: 'Coffee Maker',
        description: 'Programmable coffee maker with thermal carafe',
        price: 79.99,
        category: 'Home',
        stock: 30,
        image: 'https://example.com/coffee-maker.jpg'
      });

      console.log('✅ Products created');

      // 2. Get products
      console.log('\n2️⃣ Fetching products...');
      const products = await getProducts();
      console.log(`✅ Found ${products.length} products`);

      // 3. Add to cart
      console.log('\n3️⃣ Adding items to cart...');
      const sessionId = 'demo-session-123';

      await addToCart(sessionId, product1.id, 1);
      await addToCart(sessionId, product2.id, 2);

      const cart = await getCart(sessionId);
      console.log('✅ Cart:', {
        items: cart.items.length,
        total: `$${cart.total.toFixed(2)}`
      });

      // 4. Create checkout
      console.log('\n4️⃣ Creating checkout...');
      const checkout = await createCheckout(sessionId, 'customer@example.com');
      console.log('✅ Checkout URL:', checkout.checkoutUrl);

      console.log('\n✨ Demo completed!\n');
      console.log('💡 In production:');
      console.log('   1. Customer would visit the checkout URL');
      console.log('   2. Complete payment on Stripe');
      console.log('   3. Stripe redirects to success page');
      console.log('   4. Your app processes the order\n');

      process.exit(0);

    } catch (error) {
      console.error('\n❌ Demo failed:', error.message);
      process.exit(1);
    }
  })();
}
