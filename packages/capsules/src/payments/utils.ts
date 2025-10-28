import type { Currency, CardData } from './types';
import { PaymentsError, PaymentsErrorType } from './errors';

export function generatePaymentId(): string {
  return `pi_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateChargeId(): string {
  return `ch_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateCustomerId(): string {
  return `cus_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateRefundId(): string {
  return `re_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateSubscriptionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function generateInvoiceId(): string {
  return `in_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function validateAmount(amount: number): void {
  if (typeof amount !== 'number' || amount <= 0) {
    throw new PaymentsError(
      PaymentsErrorType.INVALID_AMOUNT,
      `Amount must be a positive number, got: ${amount}`
    );
  }
  if (!Number.isFinite(amount)) {
    throw new PaymentsError(
      PaymentsErrorType.INVALID_AMOUNT,
      'Amount must be a finite number'
    );
  }
  if (amount > 99999999) {
    throw new PaymentsError(
      PaymentsErrorType.INVALID_AMOUNT,
      'Amount exceeds maximum allowed value'
    );
  }
}

export function validateCurrency(currency: string): void {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'MXN', 'BRL'];
  if (!validCurrencies.includes(currency)) {
    throw new PaymentsError(
      PaymentsErrorType.INVALID_CURRENCY,
      `Invalid currency: ${currency}. Must be one of: ${validCurrencies.join(', ')}`
    );
  }
}

export function formatAmount(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(amount / 100);
}

export function convertToSmallestUnit(amount: number, currency: Currency): number {
  // Currencies like JPY don't use decimal units
  const noDecimalCurrencies = ['JPY'];
  if (noDecimalCurrencies.includes(currency)) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

export function convertFromSmallestUnit(amount: number, currency: Currency): number {
  const noDecimalCurrencies = ['JPY'];
  if (noDecimalCurrencies.includes(currency)) {
    return amount;
  }
  return amount / 100;
}

export function validateCard(card: CardData): void {
  // Basic Luhn algorithm check
  if (!card.number || !/^\d{13,19}$/.test(card.number.replace(/\s/g, ''))) {
    throw new PaymentsError(
      PaymentsErrorType.INVALID_CARD,
      'Invalid card number format'
    );
  }

  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  if (card.expYear < currentYear || (card.expYear === currentYear && card.expMonth < currentMonth)) {
    throw new PaymentsError(
      PaymentsErrorType.EXPIRED_CARD,
      'Card has expired'
    );
  }

  if (card.expMonth < 1 || card.expMonth > 12) {
    throw new PaymentsError(
      PaymentsErrorType.INVALID_CARD,
      'Invalid expiration month'
    );
  }

  if (!/^\d{3,4}$/.test(card.cvc)) {
    throw new PaymentsError(
      PaymentsErrorType.INVALID_CARD,
      'Invalid CVC format'
    );
  }
}

export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const last4 = cleaned.slice(-4);
  return `****-****-****-${last4}`;
}

export function getCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const patterns: Record<string, RegExp> = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    diners: /^3(?:0[0-5]|[68])/,
    jcb: /^35/,
  };

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleaned)) {
      return brand;
    }
  }
  return 'unknown';
}

export function calculateFee(amount: number, feePercentage: number = 2.9, fixedFee: number = 30): number {
  return Math.round((amount * feePercentage) / 100 + fixedFee);
}

export function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attempt = async () => {
      try {
        attempts++;
        const result = await fn();
        resolve(result);
      } catch (error) {
        if (attempts >= maxAttempts) {
          reject(error);
        } else {
          const delay = delayMs * Math.pow(2, attempts - 1);
          setTimeout(attempt, delay);
        }
      }
    };

    attempt();
  });
}