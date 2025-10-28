import type { PaymentsConfig, PaymentsStats } from './types';

export const DEFAULT_CONFIG: Partial<PaymentsConfig> = {
  currency: 'USD',
  sandbox: true,
  debug: false,
  timeout: 30000,
  retryAttempts: 3,
  captureMethod: 'automatic',
};

export const INITIAL_STATS: PaymentsStats = {
  totalPayments: 0,
  successfulPayments: 0,
  failedPayments: 0,
  refundedPayments: 0,
  totalAmount: 0,
  totalRefunded: 0,
  averageAmount: 0,
  errors: 0,
  apiCalls: 0,
  webhooksReceived: 0,
};

export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
  'MXN',
  'BRL',
] as const;

export const PAYMENT_STATUS_MESSAGES = {
  pending: 'Payment is being processed',
  processing: 'Payment is in progress',
  succeeded: 'Payment completed successfully',
  failed: 'Payment failed',
  canceled: 'Payment was canceled',
  refunded: 'Payment was refunded',
};

export const DEFAULT_TIMEOUT = 30000;
export const MAX_RETRY_ATTEMPTS = 5;
export const MIN_PAYMENT_AMOUNT = 50; // $0.50 in cents
export const MAX_PAYMENT_AMOUNT = 99999999; // ~$1M in cents