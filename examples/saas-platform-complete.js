/**
 * Complete SaaS Platform Example
 * Multi-tenant SaaS with all 8 new capsules
 *
 * Features:
 * - Multi-language dashboard (i18n)
 * - Subscription billing (Payments)
 * - Social login (OAuth)
 * - User timezone detection (Geolocation)
 * - Custom branding per tenant (Theme)
 * - Dynamic settings forms (Form-Builder)
 * - App-wide state (State)
 * - Protected routes (Router)
 */

import { createI18nService } from '@capsulas/capsules/i18n';
import { createPaymentsService } from '@capsulas/capsules/payments';
import { createOAuthService } from '@capsulas/capsules/oauth';
import { createGeolocationService } from '@capsulas/capsules/geolocation';
import { createThemeService } from '@capsulas/capsules/theme';
import { createRouterService } from '@capsulas/capsules/router';
import { createStateService } from '@capsulas/capsules/state';
import { createFormBuilderService } from '@capsulas/capsules/form-builder';

class SaaSPlatform {
  async initialize() {
    console.log('🏢 Initializing SaaS Platform...\n');

    // State - Tenant and user management
    this.state = await createStateService({
      initialState: {
        currentTenant: null,
        user: null,
        subscription: null,
        settings: {},
        notifications: [],
      },
      persist: true,
    });

    // i18n - Multi-language support
    this.i18n = await createI18nService({
      defaultLocale: 'en',
      supportedLocales: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
      translations: {
        en: {
          dashboard: 'Dashboard',
          subscription: 'Subscription',
          billing: 'Billing',
          settings: 'Settings',
          users: 'Users',
          analytics: 'Analytics',
          upgrade: 'Upgrade Plan',
          plan: {
            free: 'Free Plan',
            pro: 'Pro Plan - $29/month',
            enterprise: 'Enterprise Plan - $99/month',
          },
        },
        es: {
          dashboard: 'Panel',
          subscription: 'Suscripción',
          billing: 'Facturación',
          settings: 'Configuración',
          users: 'Usuarios',
          analytics: 'Analítica',
          upgrade: 'Actualizar Plan',
          plan: {
            free: 'Plan Gratuito',
            pro: 'Plan Pro - $29/mes',
            enterprise: 'Plan Empresa - $99/mes',
          },
        },
      },
    });

    // Theme - Per-tenant branding
    this.theme = await createThemeService({
      mode: 'light',
      colorScheme: 'default',
      persistToStorage: true,
    });

    // Geolocation - Detect timezone
    this.geo = await createGeolocationService({
      provider: 'ipapi',
    });

    // OAuth - Social login (Google, GitHub)
    this.oauth = await createOAuthService({
      provider: 'google',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: 'http://localhost:3000/auth/callback',
      scopes: ['profile', 'email'],
    });

    // Payments - Subscription management
    this.payments = await createPaymentsService({
      provider: 'stripe',
      apiKey: process.env.STRIPE_API_KEY,
      currency: 'USD',
    });

    // Form Builder - Dynamic settings forms
    this.formBuilder = await createFormBuilderService({
      validateOnChange: true,
    });

    // Router - Protected routes
    this.router = await createRouterService({
      mode: 'history',
      routes: [
        { path: '/', handler: () => this.renderLanding() },
        { path: '/login', handler: () => this.renderLogin() },
        {
          path: '/dashboard',
          handler: () => this.renderDashboard(),
          beforeEnter: () => this.requireAuth(),
        },
        {
          path: '/settings',
          handler: () => this.renderSettings(),
          beforeEnter: () => this.requireAuth(),
        },
        {
          path: '/billing',
          handler: () => this.renderBilling(),
          beforeEnter: () => this.requireAuth(),
        },
      ],
    });

    console.log('✅ SaaS Platform Ready!\n');
    await this.detectUserContext();
  }

  async detectUserContext() {
    // Detect location and set timezone
    const location = await this.geo.getLocationFromIP('');
    this.state.set('location', {
      country: location.country,
      timezone: location.timezone,
      city: location.city,
    });

    // Auto-set locale based on location
    const localeMap = {
      'ES': 'es', 'MX': 'es', 'FR': 'fr', 'DE': 'de', 'JP': 'ja', 'CN': 'zh',
    };
    const locale = localeMap[location.countryCode] || 'en';
    this.i18n.setLocale(locale);

    console.log(`🌍 Detected: ${location.city}, ${location.country}`);
    console.log(`🕐 Timezone: ${location.timezone}`);
    console.log(`🌐 Locale: ${locale}\n`);
  }

  requireAuth() {
    const user = this.state.get('user');
    if (!user) {
      console.log('🔒 Authentication required');
      return false;
    }
    return true;
  }

  async renderDashboard() {
    console.log('📊 DASHBOARD');
    const user = this.state.get('user');
    const subscription = this.state.get('subscription');

    console.log(`   User: ${user.name}`);
    console.log(`   Plan: ${subscription?.plan || 'Free'}`);
    console.log(`   Timezone: ${this.state.get('location.timezone')}`);
  }

  async renderBilling() {
    console.log('💳 BILLING');

    // Create subscription upgrade form
    const billingForm = this.formBuilder.createForm({
      fields: [
        {
          name: 'plan',
          type: 'select',
          label: 'Select Plan',
          options: [
            { label: this.i18n.t('plan.free'), value: 'free' },
            { label: this.i18n.t('plan.pro'), value: 'pro' },
            { label: this.i18n.t('plan.enterprise'), value: 'enterprise' },
          ],
        },
        {
          name: 'cardNumber',
          type: 'text',
          label: 'Card Number',
          required: true,
        },
      ],
    });

    billingForm.onSubmit(async (values) => {
      await this.upgradeSubscription(values.plan);
    });

    console.log('   Subscription form ready');
  }

  async upgradeSubscription(plan) {
    const prices = { pro: 2900, enterprise: 9900 };
    const amount = prices[plan];

    const user = this.state.get('user');
    const customer = await this.payments.createCustomer(user.email);

    const subscription = await this.payments.createSubscription(
      customer.id,
      `plan_${plan}`
    );

    this.state.set('subscription', {
      id: subscription.id,
      plan,
      status: subscription.status,
    });

    console.log(`✅ Upgraded to ${plan} plan`);
  }

  async renderSettings() {
    console.log('⚙️  SETTINGS');

    // Dynamic settings form based on tenant
    const settingsForm = this.formBuilder.createForm({
      fields: [
        {
          name: 'companyName',
          type: 'text',
          label: 'Company Name',
        },
        {
          name: 'locale',
          type: 'select',
          label: 'Language',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Español', value: 'es' },
            { label: 'Français', value: 'fr' },
          ],
        },
        {
          name: 'theme',
          type: 'select',
          label: 'Theme',
          options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
            { label: 'System', value: 'system' },
          ],
        },
        {
          name: 'brandColor',
          type: 'text',
          label: 'Brand Color',
          placeholder: '#00ff00',
        },
      ],
    });

    settingsForm.onSubmit(async (values) => {
      // Apply settings
      this.i18n.setLocale(values.locale);
      this.theme.setMode(values.theme);

      if (values.brandColor) {
        this.theme.setCustomColors({
          brand: values.brandColor,
        });
      }

      this.state.set('settings', values);
      console.log('✅ Settings saved');
    });
  }

  renderLanding() {
    console.log('🏠 LANDING PAGE');
    console.log(this.i18n.t('dashboard'));
  }

  renderLogin() {
    console.log('🔐 LOGIN');
    const authUrl = this.oauth.getAuthorizationUrl();
    console.log('   Sign in with Google');
  }
}

async function main() {
  const platform = new SaaSPlatform();
  await platform.initialize();

  console.log('\n🎬 Running SaaS Demo...\n');
  await platform.router.push('/dashboard');
}

main().catch(console.error);
