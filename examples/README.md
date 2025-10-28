# Capsulas Framework - Integration Examples

Complete integration examples demonstrating the power of combining multiple capsules to build real-world applications.

## 📚 Available Examples

### 1. Complete E-commerce Platform
**File**: [complete-ecommerce-platform.js](./complete-ecommerce-platform.js)

A full-featured e-commerce platform showcasing integration of 10 capsules:

**Capsules Used**:
- 🌐 **i18n** - Multi-language support (EN, ES, FR, DE, JA)
- 💳 **Payments** - Stripe integration for checkout
- 🔐 **OAuth** - Google social authentication
- 📍 **Geolocation** - Location-based shipping & currency
- 🎨 **Theme** - Dark mode and custom branding
- 🗺️ **Router** - Client-side routing with guards
- 💾 **State** - Reactive cart and user state
- 📝 **Form-Builder** - Dynamic checkout forms
- 🚀 **Cache** - Product caching for performance
- 📊 **Logger** - Activity tracking

**Features**:
- Browse products with caching
- Multi-language product descriptions
- Location-based shipping estimates
- Dynamic checkout forms with validation
- Stripe payment processing
- Social login with Google
- Dark mode toggle
- Reactive shopping cart
- Protected routes

**Key Integration Points**:

```javascript
// Auto-detect user language from location
const location = await geo.getLocationFromIP('');
const locale = localeMap[location.countryCode] || 'en';
i18n.setLocale(locale);

// Cart updates trigger UI changes
state.on('cart.items', (newItems) => {
  const message = i18n.t('items', { count: newItems.length });
  console.log(message);
});

// Checkout requires items in cart (Router guard)
{
  path: '/checkout',
  beforeEnter: async () => {
    const cart = state.get('cart');
    return cart.items.length > 0;
  },
}
```

**Run the Demo**:
```bash
cd /Users/c/capsulas-framework/examples
node complete-ecommerce-platform.js
```

---

### 2. SaaS Platform
**File**: [saas-platform-complete.js](./saas-platform-complete.js)

Multi-tenant SaaS application with subscription billing:

**Capsules Used**:
- 🌐 **i18n** - Multi-language dashboard
- 💳 **Payments** - Subscription management
- 🔐 **OAuth** - Social login (Google, GitHub)
- 📍 **Geolocation** - Timezone detection
- 🎨 **Theme** - Per-tenant branding
- 🗺️ **Router** - Protected admin routes
- 💾 **State** - Tenant and user management
- 📝 **Form-Builder** - Dynamic settings forms

**Features**:
- Multi-tenant architecture
- Subscription plans (Free, Pro, Enterprise)
- Automatic timezone detection
- Custom branding per tenant
- Dynamic settings forms
- Social authentication
- Protected routes with auth guards
- Per-tenant theme customization

**Key Integration Points**:

```javascript
// Detect timezone automatically
const location = await geo.getLocationFromIP('');
state.set('location', {
  timezone: location.timezone,
  country: location.country,
});

// Dynamic per-tenant settings
const settingsForm = formBuilder.createForm({
  fields: [
    { name: 'locale', type: 'select', options: locales },
    { name: 'theme', type: 'select', options: themes },
    { name: 'brandColor', type: 'text' },
  ],
});

// Apply settings reactively
settingsForm.onSubmit((values) => {
  i18n.setLocale(values.locale);
  theme.setMode(values.theme);
  theme.setCustomColors({ brand: values.brandColor });
});
```

---

## 🔗 Integration Patterns

### Pattern 1: Location-Based Localization

Automatically set language based on user's location:

```javascript
const geo = await createGeolocationService({ provider: 'ipapi' });
const i18n = await createI18nService({
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr', 'de'],
});

// Detect and set locale
const location = await geo.getLocationFromIP('');
const localeMap = { 'ES': 'es', 'FR': 'fr', 'DE': 'de' };
i18n.setLocale(localeMap[location.countryCode] || 'en');
```

### Pattern 2: Themed Payment Forms

Dynamic payment forms with theme integration:

```javascript
const theme = await createThemeService({ mode: 'dark' });
const formBuilder = await createFormBuilderService();

const paymentForm = formBuilder.createForm({
  fields: [
    { name: 'cardNumber', type: 'text', required: true },
    { name: 'expiry', type: 'text', required: true },
  ],
});

// Apply theme colors to form
theme.on('change', (newTheme) => {
  applyColorsToForm(paymentForm, newTheme.colors);
});
```

### Pattern 3: State-Synced Navigation

Router navigation synchronized with state:

```javascript
const router = await createRouterService({ mode: 'history' });
const state = await createStateService({ initialState: {} });

// Update state on navigation
router.addRoute({
  path: '/products/:category',
  handler: (ctx) => {
    state.set('currentCategory', ctx.params.category);
  },
});

// Navigate when state changes
state.on('currentCategory', (category) => {
  router.push(`/products/${category}`);
});
```

### Pattern 4: OAuth + Payments Integration

Link social auth with payment profiles:

```javascript
const oauth = await createOAuthService({ provider: 'google' });
const payments = await createPaymentsService({ provider: 'stripe' });
const cache = await createCacheService({ provider: 'memory' });

// After OAuth login
const user = await oauth.getUserInfo(token);

// Check cache for existing customer
let customerId = await cache.get(`customer:${user.id}`);

if (!customerId) {
  // Create Stripe customer
  const customer = await payments.createCustomer(user.email, {
    name: user.name,
  });
  customerId = customer.id;
  await cache.set(`customer:${user.id}`, customerId);
}
```

### Pattern 5: Multi-Language Forms

Forms that adapt to user's language:

```javascript
const i18n = await createI18nService({ defaultLocale: 'en' });
const formBuilder = await createFormBuilderService();

function createLocalizedForm() {
  return formBuilder.createForm({
    fields: [
      {
        name: 'email',
        type: 'email',
        label: i18n.t('form.email'),
        validation: {
          rules: ['required', 'email'],
          message: i18n.t('form.emailError'),
        },
      },
      {
        name: 'message',
        type: 'textarea',
        label: i18n.t('form.message'),
        placeholder: i18n.t('form.messagePlaceholder'),
      },
    ],
  });
}

// Recreate form when language changes
i18n.on('localeChange', () => {
  const form = createLocalizedForm();
});
```

---

## 🎯 Real-World Use Cases

### E-commerce
- Product catalogs with i18n
- Location-based shipping (Geolocation)
- Secure checkout (Payments + Form-Builder)
- Customer accounts (OAuth + State)
- Order tracking (Router + State)

### SaaS Platforms
- Multi-tenant architecture (State + Theme)
- Subscription billing (Payments)
- User onboarding (OAuth + Router)
- Settings management (Form-Builder + i18n)
- Admin dashboards (All capsules)

### Content Platforms
- Multi-language content (i18n)
- User preferences (Theme + State)
- Premium subscriptions (Payments + OAuth)
- Geographic content (Geolocation + Router)
- Dynamic forms (Form-Builder)

### Marketplaces
- Buyer/seller accounts (OAuth + State)
- Payment splitting (Payments)
- Location-based search (Geolocation)
- Multi-currency (i18n + Payments)
- Custom storefronts (Theme)

---

## 🚀 Performance Optimizations

### Caching Strategy

```javascript
// Cache translation bundles
const translationKey = `i18n:${locale}`;
let translations = await cache.get(translationKey);

if (!translations) {
  translations = await loadTranslations(locale);
  await cache.set(translationKey, translations, 3600);
}

// Cache geolocation lookups
const geoKey = `geo:${ip}`;
let location = await cache.get(geoKey);

if (!location) {
  location = await geo.getLocationFromIP(ip);
  await cache.set(geoKey, location, 86400);
}

// Cache customer records
const customerKey = `customer:${userId}`;
let customer = await cache.get(customerKey);

if (!customer) {
  customer = await payments.getCustomer(customerId);
  await cache.set(customerKey, customer, 1800);
}
```

### State Optimization

```javascript
// Use selectors for derived state
const cartTotal = state.select((s) =>
  s.cart.items.reduce((sum, item) => sum + item.price, 0)
);

// Batch updates
state.update('cart', (cart) => ({
  ...cart,
  items: [...cart.items, newItem],
  total: cart.total + newItem.price,
}));

// Debounce expensive operations
const debouncedSave = debounce(() => {
  state.set('preferences', getPreferences());
}, 1000);
```

---

## 📖 Additional Resources

- [Capsulas Framework Documentation](../README.md)
- [Individual Capsule READMEs](../packages/capsules/src/)
- [API Reference](../docs/api/)
- [Visual Flow Editor](http://localhost:3050)

---

## 🤝 Contributing

Have a great integration example? Submit a PR!

1. Create your example in `examples/`
2. Add documentation to this README
3. Ensure it runs without errors
4. Submit PR with description

---

## 📝 License

MIT - See [LICENSE](../LICENSE) for details

---

**Generated**: October 27, 2025
**Framework Version**: 1.0.0-rc
**Examples**: 2 complete applications
