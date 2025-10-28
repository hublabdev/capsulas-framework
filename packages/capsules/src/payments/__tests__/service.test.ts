import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentsService, createPaymentsService } from '../service';
import { PaymentsError, PaymentsErrorType } from '../errors';
import { validateAmount, validateCurrency, maskCardNumber, getCardBrand } from '../utils';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    service = await createPaymentsService({
      provider: 'stripe',
      apiKey: 'test_key',
      currency: 'USD',
      sandbox: true,
    });
  });

  describe('Initialization', () => {
    it('should initialize correctly', () => {
      expect(service).toBeDefined();
      expect(service.getConfig().provider).toBe('stripe');
    });

    it('should throw error with invalid provider', async () => {
      await expect(
        createPaymentsService({
          provider: 'invalid' as any,
          apiKey: 'test',
        })
      ).rejects.toThrow(PaymentsError);
    });

    it('should use default configuration', () => {
      const config = service.getConfig();
      expect(config.currency).toBe('USD');
      expect(config.sandbox).toBe(true);
    });
  });

  describe('Payment Creation', () => {
    it('should create payment intent', async () => {
      const payment = await service.createPayment(5000, 'USD');
      expect(payment).toBeDefined();
      expect(payment.amount).toBe(5000);
      expect(payment.currency).toBe('USD');
      expect(payment.id).toMatch(/^pi_/);
    });

    it('should reject invalid amount', async () => {
      await expect(service.createPayment(0, 'USD')).rejects.toThrow(PaymentsError);
    });

    it('should reject negative amount', async () => {
      await expect(service.createPayment(-100, 'USD')).rejects.toThrow();
    });

    it('should accept valid currencies', async () => {
      const payment = await service.createPayment(1000, 'EUR');
      expect(payment.currency).toBe('EUR');
    });

    it('should track statistics', async () => {
      await service.createPayment(5000, 'USD');
      const stats = service.getStats();
      expect(stats.totalPayments).toBe(1);
      expect(stats.apiCalls).toBeGreaterThan(0);
    });
  });

  describe('Payment Confirmation', () => {
    it('should confirm payment', async () => {
      const payment = await service.createPayment(5000, 'USD');
      const confirmed = await service.confirmPayment(payment.id);
      expect(confirmed.status).toBe('succeeded');
    });

    it('should update statistics on confirmation', async () => {
      const payment = await service.createPayment(5000, 'USD');
      await service.confirmPayment(payment.id);
      const stats = service.getStats();
      expect(stats.successfulPayments).toBeGreaterThan(0);
    });
  });

  describe('Refunds', () => {
    it('should create refund', async () => {
      const charge = await service.createCharge(5000, 'USD', 'tok_visa');
      const refund = await service.refund(charge.id);
      expect(refund).toBeDefined();
      expect(refund.chargeId).toBe(charge.id);
    });

    it('should create partial refund', async () => {
      const charge = await service.createCharge(5000, 'USD', 'tok_visa');
      const refund = await service.refund(charge.id, 2500);
      expect(refund.amount).toBe(2500);
    });

    it('should track refund statistics', async () => {
      const charge = await service.createCharge(5000, 'USD', 'tok_visa');
      await service.refund(charge.id);
      const stats = service.getStats();
      expect(stats.refundedPayments).toBeGreaterThan(0);
    });
  });

  describe('Customer Management', () => {
    it('should create customer', async () => {
      const customer = await service.createCustomer('test@example.com');
      expect(customer).toBeDefined();
      expect(customer.email).toBe('test@example.com');
    });

    it('should get customer', async () => {
      const created = await service.createCustomer('test@example.com');
      const customer = await service.getCustomer(created.id);
      expect(customer.id).toBe(created.id);
    });

    it('should update customer', async () => {
      const created = await service.createCustomer('test@example.com');
      const updated = await service.updateCustomer(created.id, {
        name: 'John Doe',
      });
      expect(updated.name).toBe('John Doe');
    });

    it('should delete customer', async () => {
      const created = await service.createCustomer('test@example.com');
      const result = await service.deleteCustomer(created.id);
      expect(result).toBe(true);
    });
  });

  describe('Subscriptions', () => {
    it('should create subscription', async () => {
      const customer = await service.createCustomer('test@example.com');
      const subscription = await service.createSubscription(customer.id, 'plan_test');
      expect(subscription).toBeDefined();
      expect(subscription.customerId).toBe(customer.id);
    });

    it('should cancel subscription', async () => {
      const customer = await service.createCustomer('test@example.com');
      const subscription = await service.createSubscription(customer.id, 'plan_test');
      const canceled = await service.cancelSubscription(subscription.id);
      expect(canceled.status).toBe('canceled');
    });
  });

  describe('Statistics', () => {
    it('should track all operations', async () => {
      await service.createPayment(5000, 'USD');
      const stats = service.getStats();
      expect(stats.totalPayments).toBeGreaterThan(0);
      expect(stats.apiCalls).toBeGreaterThan(0);
    });

    it('should calculate average amount', async () => {
      await service.createPayment(5000, 'USD');
      await service.createPayment(3000, 'USD');
      const stats = service.getStats();
      expect(stats.averageAmount).toBe(4000);
    });
  });
});

describe('Payment Utils', () => {
  describe('validateAmount', () => {
    it('should accept valid amounts', () => {
      expect(() => validateAmount(100)).not.toThrow();
      expect(() => validateAmount(0.01)).not.toThrow();
    });

    it('should reject zero', () => {
      expect(() => validateAmount(0)).toThrow(PaymentsError);
    });

    it('should reject negative', () => {
      expect(() => validateAmount(-100)).toThrow();
    });

    it('should reject non-finite', () => {
      expect(() => validateAmount(Infinity)).toThrow();
    });
  });

  describe('validateCurrency', () => {
    it('should accept valid currencies', () => {
      expect(() => validateCurrency('USD')).not.toThrow();
      expect(() => validateCurrency('EUR')).not.toThrow();
    });

    it('should reject invalid currencies', () => {
      expect(() => validateCurrency('XXX')).toThrow(PaymentsError);
    });
  });

  describe('maskCardNumber', () => {
    it('should mask card number', () => {
      expect(maskCardNumber('4242424242424242')).toBe('****-****-****-4242');
    });
  });

  describe('getCardBrand', () => {
    it('should detect Visa', () => {
      expect(getCardBrand('4242424242424242')).toBe('visa');
    });

    it('should detect Mastercard', () => {
      expect(getCardBrand('5555555555554444')).toBe('mastercard');
    });

    it('should return unknown for invalid', () => {
      expect(getCardBrand('1234')).toBe('unknown');
    });
  });
});
