export type PaymentProvider = 'stripe' | 'paypal' | 'square' | 'braintree';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'MXN' | 'BRL';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'paypal' | 'apple_pay' | 'google_pay' | 'crypto';

export interface PaymentsConfig {
  provider: PaymentProvider;
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  currency?: Currency;
  sandbox?: boolean;
  debug?: boolean;
  timeout?: number;
  retryAttempts?: number;
  captureMethod?: 'automatic' | 'manual';
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  customerId?: string;
  description?: string;
  metadata?: Record<string, any>;
  paymentMethod?: PaymentMethod;
  createdAt: number;
  updatedAt: number;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: Address;
  metadata?: Record<string, any>;
  createdAt: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethodData {
  type: PaymentMethod;
  card?: CardData;
  bankAccount?: BankAccountData;
  metadata?: Record<string, any>;
}

export interface CardData {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  name?: string;
}

export interface BankAccountData {
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
}

export interface Charge {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  customerId?: string;
  paymentIntentId?: string;
  captured: boolean;
  refunded: boolean;
  refundAmount?: number;
  failureCode?: string;
  failureMessage?: string;
  receiptUrl?: string;
  createdAt: number;
}

export interface Refund {
  id: string;
  chargeId: string;
  amount: number;
  currency: Currency;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  metadata?: Record<string, any>;
  createdAt: number;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  metadata?: Record<string, any>;
  createdAt: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  amount: number;
  currency: Currency;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate?: number;
  paidAt?: number;
  items: InvoiceItem[];
  metadata?: Record<string, any>;
  createdAt: number;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
  unitAmount: number;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
  livemode: boolean;
}

export interface PaymentsStats {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalAmount: number;
  totalRefunded: number;
  averageAmount: number;
  errors: number;
  apiCalls: number;
  webhooksReceived: number;
}