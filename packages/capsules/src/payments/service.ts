import type {
  PaymentsConfig,
  PaymentsStats,
  PaymentIntent,
  Customer,
  Charge,
  Refund,
  Subscription,
  Invoice,
  WebhookEvent,
} from './types';
import { createAdapter, PaymentsAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import { PaymentsError, PaymentsErrorType } from './errors';
import { validateAmount, validateCurrency, retryWithBackoff } from './utils';

export class PaymentsService {
  private adapter: PaymentsAdapter | null = null;
  private config: PaymentsConfig;
  private stats: PaymentsStats = { ...INITIAL_STATS };
  private initialized = false;

  constructor(config: PaymentsConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.adapter = createAdapter(this.config);
      await this.adapter.initialize();
      this.initialized = true;

      if (this.config.debug) {
        console.log('[Payments] Initialized with provider:', this.config.provider);
      }
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.INITIALIZATION_ERROR,
        `Failed to initialize payment service: ${error}`
      );
    }
  }

  async createPayment(
    amount: number,
    currency: string = 'USD',
    options: any = {}
  ): Promise<PaymentIntent> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      validateAmount(amount);
      validateCurrency(currency);

      const payment = await retryWithBackoff(
        () => this.adapter!.createPaymentIntent(amount, currency, options),
        this.config.retryAttempts
      );

      this.stats.totalPayments++;
      this.stats.apiCalls++;
      this.updateAverageAmount(amount);

      if (this.config.debug) {
        console.log('[Payments] Created payment:', payment.id);
      }

      return payment;
    } catch (error) {
      this.stats.errors++;
      this.stats.failedPayments++;
      throw new PaymentsError(
        PaymentsErrorType.PAYMENT_FAILED,
        `Failed to create payment: ${error}`,
        error
      );
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const payment = await retryWithBackoff(
        () => this.adapter!.confirmPayment(paymentIntentId),
        this.config.retryAttempts
      );

      if (payment.status === 'succeeded') {
        this.stats.successfulPayments++;
        this.stats.totalAmount += payment.amount;
      } else {
        this.stats.failedPayments++;
      }

      this.stats.apiCalls++;

      if (this.config.debug) {
        console.log('[Payments] Confirmed payment:', paymentIntentId, 'Status:', payment.status);
      }

      return payment;
    } catch (error) {
      this.stats.errors++;
      this.stats.failedPayments++;
      throw new PaymentsError(
        PaymentsErrorType.PAYMENT_FAILED,
        `Failed to confirm payment: ${error}`,
        error
      );
    }
  }

  async cancelPayment(paymentIntentId: string): Promise<PaymentIntent> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const payment = await this.adapter!.cancelPayment(paymentIntentId);
      this.stats.apiCalls++;

      if (this.config.debug) {
        console.log('[Payments] Canceled payment:', paymentIntentId);
      }

      return payment;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.PAYMENT_FAILED,
        `Failed to cancel payment: ${error}`,
        error
      );
    }
  }

  async capturePayment(paymentIntentId: string): Promise<PaymentIntent> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const payment = await this.adapter!.capturePayment(paymentIntentId);

      if (payment.status === 'succeeded') {
        this.stats.successfulPayments++;
        this.stats.totalAmount += payment.amount;
      }

      this.stats.apiCalls++;

      if (this.config.debug) {
        console.log('[Payments] Captured payment:', paymentIntentId);
      }

      return payment;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.CHARGE_FAILED,
        `Failed to capture payment: ${error}`,
        error
      );
    }
  }

  async createCharge(
    amount: number,
    currency: string = 'USD',
    source: string,
    options: any = {}
  ): Promise<Charge> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      validateAmount(amount);
      validateCurrency(currency);

      const charge = await retryWithBackoff(
        () => this.adapter!.createCharge(amount, currency, source, options),
        this.config.retryAttempts
      );

      this.stats.totalPayments++;
      this.stats.apiCalls++;

      if (charge.status === 'succeeded') {
        this.stats.successfulPayments++;
        this.stats.totalAmount += amount;
      } else {
        this.stats.failedPayments++;
      }

      this.updateAverageAmount(amount);

      if (this.config.debug) {
        console.log('[Payments] Created charge:', charge.id);
      }

      return charge;
    } catch (error) {
      this.stats.errors++;
      this.stats.failedPayments++;
      throw new PaymentsError(
        PaymentsErrorType.CHARGE_FAILED,
        `Failed to create charge: ${error}`,
        error
      );
    }
  }

  async refund(chargeId: string, amount?: number): Promise<Refund> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      if (amount) {
        validateAmount(amount);
      }

      const refund = await retryWithBackoff(
        () => this.adapter!.refundCharge(chargeId, amount),
        this.config.retryAttempts
      );

      this.stats.refundedPayments++;
      this.stats.totalRefunded += refund.amount;
      this.stats.apiCalls++;

      if (this.config.debug) {
        console.log('[Payments] Created refund:', refund.id, 'for charge:', chargeId);
      }

      return refund;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.REFUND_FAILED,
        `Failed to create refund: ${error}`,
        error
      );
    }
  }

  async createCustomer(email: string, options: any = {}): Promise<Customer> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const customer = await this.adapter!.createCustomer(email, options);
      this.stats.apiCalls++;

      if (this.config.debug) {
        console.log('[Payments] Created customer:', customer.id);
      }

      return customer;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.PROVIDER_ERROR,
        `Failed to create customer: ${error}`,
        error
      );
    }
  }

  async getCustomer(customerId: string): Promise<Customer> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const customer = await this.adapter!.getCustomer(customerId);
      this.stats.apiCalls++;
      return customer;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.CUSTOMER_NOT_FOUND,
        `Failed to get customer: ${error}`,
        error
      );
    }
  }

  async updateCustomer(customerId: string, updates: any): Promise<Customer> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const customer = await this.adapter!.updateCustomer(customerId, updates);
      this.stats.apiCalls++;

      if (this.config.debug) {
        console.log('[Payments] Updated customer:', customerId);
      }

      return customer;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.PROVIDER_ERROR,
        `Failed to update customer: ${error}`,
        error
      );
    }
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const result = await this.adapter!.deleteCustomer(customerId);
      this.stats.apiCalls++;

      if (this.config.debug) {
        console.log('[Payments] Deleted customer:', customerId);
      }

      return result;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.PROVIDER_ERROR,
        `Failed to delete customer: ${error}`,
        error
      );
    }
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<boolean> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const result = await this.adapter!.attachPaymentMethod(customerId, paymentMethodId);
      this.stats.apiCalls++;

      if (this.config.debug) {
        console.log('[Payments] Attached payment method:', paymentMethodId, 'to customer:', customerId);
      }

      return result;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.PROVIDER_ERROR,
        `Failed to attach payment method: ${error}`,
        error
      );
    }
  }

  async createSubscription(
    customerId: string,
    planId: string,
    options: any = {}
  ): Promise<Subscription> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const subscription = await this.adapter!.createSubscription(customerId, planId, options);
      this.stats.apiCalls++;

      if (this.config.debug) {
        console.log('[Payments] Created subscription:', subscription.id);
      }

      return subscription;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.SUBSCRIPTION_ERROR,
        `Failed to create subscription: ${error}`,
        error
      );
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const subscription = await this.adapter!.cancelSubscription(subscriptionId);
      this.stats.apiCalls++;

      if (this.config.debug) {
        console.log('[Payments] Canceled subscription:', subscriptionId);
      }

      return subscription;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.SUBSCRIPTION_ERROR,
        `Failed to cancel subscription: ${error}`,
        error
      );
    }
  }

  async createInvoice(customerId: string, items: any[]): Promise<Invoice> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      const invoice = await this.adapter!.createInvoice(customerId, items);
      this.stats.apiCalls++;

      if (this.config.debug) {
        console.log('[Payments] Created invoice:', invoice.id);
      }

      return invoice;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.PROVIDER_ERROR,
        `Failed to create invoice: ${error}`,
        error
      );
    }
  }

  verifyWebhook(payload: string, signature: string): WebhookEvent {
    if (!this.initialized || !this.adapter) {
      throw new PaymentsError(
        PaymentsErrorType.WEBHOOK_VERIFICATION_FAILED,
        'Service not initialized'
      );
    }

    try {
      const event = this.adapter!.verifyWebhook(payload, signature);
      this.stats.webhooksReceived++;

      if (this.config.debug) {
        console.log('[Payments] Webhook received:', event.type);
      }

      return event;
    } catch (error) {
      this.stats.errors++;
      throw new PaymentsError(
        PaymentsErrorType.WEBHOOK_VERIFICATION_FAILED,
        `Failed to verify webhook: ${error}`,
        error
      );
    }
  }

  private updateAverageAmount(amount: number): void {
    const totalPrevious = this.stats.averageAmount * (this.stats.totalPayments - 1);
    this.stats.averageAmount = (totalPrevious + amount) / this.stats.totalPayments;
  }

  getStats(): PaymentsStats {
    return { ...this.stats };
  }

  getConfig(): PaymentsConfig {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    if (this.config.debug) {
      console.log('[Payments] Cleaning up service');
    }
    this.adapter = null;
    this.initialized = false;
  }
}

export async function createPaymentsService(config: PaymentsConfig): Promise<PaymentsService> {
  const service = new PaymentsService(config);
  await service.initialize();
  return service;
}