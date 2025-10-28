import type {
  PaymentsConfig,
  PaymentIntent,
  Customer,
  Charge,
  Refund,
  Subscription,
  Invoice,
  WebhookEvent,
} from './types';
import { PaymentsError, PaymentsErrorType } from './errors';

export abstract class PaymentsAdapter {
  constructor(protected config: PaymentsConfig) {}

  abstract initialize(): Promise<void>;
  abstract createPaymentIntent(
    amount: number,
    currency: string,
    options?: any
  ): Promise<PaymentIntent>;
  abstract confirmPayment(paymentIntentId: string): Promise<PaymentIntent>;
  abstract cancelPayment(paymentIntentId: string): Promise<PaymentIntent>;
  abstract capturePayment(paymentIntentId: string): Promise<PaymentIntent>;
  abstract createCharge(
    amount: number,
    currency: string,
    source: string,
    options?: any
  ): Promise<Charge>;
  abstract refundCharge(chargeId: string, amount?: number): Promise<Refund>;
  abstract createCustomer(email: string, options?: any): Promise<Customer>;
  abstract getCustomer(customerId: string): Promise<Customer>;
  abstract updateCustomer(customerId: string, updates: any): Promise<Customer>;
  abstract deleteCustomer(customerId: string): Promise<boolean>;
  abstract attachPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<boolean>;
  abstract createSubscription(
    customerId: string,
    planId: string,
    options?: any
  ): Promise<Subscription>;
  abstract cancelSubscription(subscriptionId: string): Promise<Subscription>;
  abstract createInvoice(customerId: string, items: any[]): Promise<Invoice>;
  abstract verifyWebhook(payload: string, signature: string): WebhookEvent;
}

export class StripeAdapter extends PaymentsAdapter {
  private stripe: any = null;

  async initialize(): Promise<void> {
    if (!this.config.apiKey) {
      throw new PaymentsError(
        PaymentsErrorType.INVALID_API_KEY,
        'Stripe API key is required'
      );
    }
    // In production, this would initialize the actual Stripe SDK
    // const Stripe = require('stripe');
    // this.stripe = new Stripe(this.config.apiKey);
    this.stripe = { initialized: true }; // Mock for now
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    options: any = {}
  ): Promise<PaymentIntent> {
    const now = Date.now();
    return {
      id: `pi_${now}_${Math.random().toString(36).substring(2, 11)}`,
      amount,
      currency: currency as any,
      status: 'pending',
      customerId: options.customer,
      description: options.description,
      metadata: options.metadata,
      paymentMethod: options.payment_method || 'card',
      createdAt: now,
      updatedAt: now,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    // Mock confirmation
    const now = Date.now();
    return {
      id: paymentIntentId,
      amount: 5000,
      currency: 'USD',
      status: 'succeeded',
      createdAt: now - 1000,
      updatedAt: now,
    };
  }

  async cancelPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const now = Date.now();
    return {
      id: paymentIntentId,
      amount: 5000,
      currency: 'USD',
      status: 'canceled',
      createdAt: now - 1000,
      updatedAt: now,
    };
  }

  async capturePayment(paymentIntentId: string): Promise<PaymentIntent> {
    const now = Date.now();
    return {
      id: paymentIntentId,
      amount: 5000,
      currency: 'USD',
      status: 'succeeded',
      createdAt: now - 1000,
      updatedAt: now,
    };
  }

  async createCharge(
    amount: number,
    currency: string,
    source: string,
    options: any = {}
  ): Promise<Charge> {
    const now = Date.now();
    return {
      id: `ch_${now}_${Math.random().toString(36).substring(2, 11)}`,
      amount,
      currency: currency as any,
      status: 'succeeded',
      customerId: options.customer,
      captured: true,
      refunded: false,
      createdAt: now,
    };
  }

  async refundCharge(chargeId: string, amount?: number): Promise<Refund> {
    const now = Date.now();
    return {
      id: `re_${now}_${Math.random().toString(36).substring(2, 11)}`,
      chargeId,
      amount: amount || 5000,
      currency: 'USD',
      status: 'succeeded',
      createdAt: now,
    };
  }

  async createCustomer(email: string, options: any = {}): Promise<Customer> {
    const now = Date.now();
    return {
      id: `cus_${now}_${Math.random().toString(36).substring(2, 11)}`,
      email,
      name: options.name,
      phone: options.phone,
      address: options.address,
      metadata: options.metadata,
      createdAt: now,
    };
  }

  async getCustomer(customerId: string): Promise<Customer> {
    return {
      id: customerId,
      email: 'customer@example.com',
      createdAt: Date.now(),
    };
  }

  async updateCustomer(customerId: string, updates: any): Promise<Customer> {
    return {
      id: customerId,
      email: updates.email || 'customer@example.com',
      name: updates.name,
      createdAt: Date.now(),
    };
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    return true;
  }

  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<boolean> {
    return true;
  }

  async createSubscription(
    customerId: string,
    planId: string,
    options: any = {}
  ): Promise<Subscription> {
    const now = Date.now();
    const monthFromNow = now + 30 * 24 * 60 * 60 * 1000;
    return {
      id: `sub_${now}_${Math.random().toString(36).substring(2, 11)}`,
      customerId,
      planId,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: monthFromNow,
      cancelAtPeriodEnd: false,
      metadata: options.metadata,
      createdAt: now,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const now = Date.now();
    return {
      id: subscriptionId,
      customerId: 'cus_12345',
      planId: 'plan_12345',
      status: 'canceled',
      currentPeriodStart: now - 15 * 24 * 60 * 60 * 1000,
      currentPeriodEnd: now + 15 * 24 * 60 * 60 * 1000,
      cancelAtPeriodEnd: true,
      createdAt: now - 30 * 24 * 60 * 60 * 1000,
    };
  }

  async createInvoice(customerId: string, items: any[]): Promise<Invoice> {
    const now = Date.now();
    const invoiceItems = items.map((item) => ({
      description: item.description,
      amount: item.amount,
      quantity: item.quantity || 1,
      unitAmount: item.amount,
    }));
    const totalAmount = invoiceItems.reduce(
      (sum, item) => sum + item.amount * item.quantity,
      0
    );

    return {
      id: `in_${now}_${Math.random().toString(36).substring(2, 11)}`,
      customerId,
      amount: totalAmount,
      currency: 'USD',
      status: 'draft',
      items: invoiceItems,
      createdAt: now,
    };
  }

  verifyWebhook(payload: string, signature: string): WebhookEvent {
    // In production, this would verify the webhook signature
    // using the webhook secret
    const event = JSON.parse(payload);
    return {
      id: event.id || `evt_${Date.now()}`,
      type: event.type,
      data: event.data,
      created: event.created || Date.now(),
      livemode: event.livemode || false,
    };
  }
}

export class PayPalAdapter extends PaymentsAdapter {
  private paypal: any = null;

  async initialize(): Promise<void> {
    if (!this.config.apiKey || !this.config.secretKey) {
      throw new PaymentsError(
        PaymentsErrorType.INVALID_API_KEY,
        'PayPal client ID and secret are required'
      );
    }
    // In production, this would initialize the PayPal SDK
    this.paypal = { initialized: true }; // Mock for now
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    options: any = {}
  ): Promise<PaymentIntent> {
    const now = Date.now();
    return {
      id: `PAYID-${now}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      amount,
      currency: currency as any,
      status: 'pending',
      customerId: options.customer,
      description: options.description,
      metadata: options.metadata,
      paymentMethod: 'paypal',
      createdAt: now,
      updatedAt: now,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const now = Date.now();
    return {
      id: paymentIntentId,
      amount: 5000,
      currency: 'USD',
      status: 'succeeded',
      paymentMethod: 'paypal',
      createdAt: now - 1000,
      updatedAt: now,
    };
  }

  async cancelPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const now = Date.now();
    return {
      id: paymentIntentId,
      amount: 5000,
      currency: 'USD',
      status: 'canceled',
      createdAt: now - 1000,
      updatedAt: now,
    };
  }

  async capturePayment(paymentIntentId: string): Promise<PaymentIntent> {
    const now = Date.now();
    return {
      id: paymentIntentId,
      amount: 5000,
      currency: 'USD',
      status: 'succeeded',
      createdAt: now - 1000,
      updatedAt: now,
    };
  }

  async createCharge(
    amount: number,
    currency: string,
    source: string,
    options: any = {}
  ): Promise<Charge> {
    const now = Date.now();
    return {
      id: `PAY-${now}${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      amount,
      currency: currency as any,
      status: 'succeeded',
      customerId: options.customer,
      captured: true,
      refunded: false,
      createdAt: now,
    };
  }

  async refundCharge(chargeId: string, amount?: number): Promise<Refund> {
    const now = Date.now();
    return {
      id: `REF-${now}`,
      chargeId,
      amount: amount || 5000,
      currency: 'USD',
      status: 'succeeded',
      createdAt: now,
    };
  }

  async createCustomer(email: string, options: any = {}): Promise<Customer> {
    const now = Date.now();
    return {
      id: `PP-CUS-${now}`,
      email,
      name: options.name,
      phone: options.phone,
      metadata: options.metadata,
      createdAt: now,
    };
  }

  async getCustomer(customerId: string): Promise<Customer> {
    return {
      id: customerId,
      email: 'customer@example.com',
      createdAt: Date.now(),
    };
  }

  async updateCustomer(customerId: string, updates: any): Promise<Customer> {
    return {
      id: customerId,
      email: updates.email || 'customer@example.com',
      name: updates.name,
      createdAt: Date.now(),
    };
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    return true;
  }

  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<boolean> {
    return true;
  }

  async createSubscription(
    customerId: string,
    planId: string,
    options: any = {}
  ): Promise<Subscription> {
    const now = Date.now();
    const monthFromNow = now + 30 * 24 * 60 * 60 * 1000;
    return {
      id: `I-${now}${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      customerId,
      planId,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: monthFromNow,
      cancelAtPeriodEnd: false,
      metadata: options.metadata,
      createdAt: now,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const now = Date.now();
    return {
      id: subscriptionId,
      customerId: 'PP-CUS-12345',
      planId: 'P-12345',
      status: 'canceled',
      currentPeriodStart: now - 15 * 24 * 60 * 60 * 1000,
      currentPeriodEnd: now + 15 * 24 * 60 * 60 * 1000,
      cancelAtPeriodEnd: true,
      createdAt: now - 30 * 24 * 60 * 60 * 1000,
    };
  }

  async createInvoice(customerId: string, items: any[]): Promise<Invoice> {
    const now = Date.now();
    const invoiceItems = items.map((item) => ({
      description: item.description,
      amount: item.amount,
      quantity: item.quantity || 1,
      unitAmount: item.amount,
    }));
    const totalAmount = invoiceItems.reduce(
      (sum, item) => sum + item.amount * item.quantity,
      0
    );

    return {
      id: `INV-${now}`,
      customerId,
      amount: totalAmount,
      currency: 'USD',
      status: 'draft',
      items: invoiceItems,
      createdAt: now,
    };
  }

  verifyWebhook(payload: string, signature: string): WebhookEvent {
    const event = JSON.parse(payload);
    return {
      id: event.id || `WH-${Date.now()}`,
      type: event.event_type,
      data: event.resource,
      created: event.create_time ? new Date(event.create_time).getTime() : Date.now(),
      livemode: !this.config.sandbox,
    };
  }
}

export function createAdapter(config: PaymentsConfig): PaymentsAdapter {
  switch (config.provider) {
    case 'stripe':
      return new StripeAdapter(config);
    case 'paypal':
      return new PayPalAdapter(config);
    default:
      throw new PaymentsError(
        PaymentsErrorType.PROVIDER_ERROR,
        `Unsupported payment provider: ${config.provider}`
      );
  }
}