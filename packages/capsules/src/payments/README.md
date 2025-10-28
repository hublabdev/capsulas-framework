# Payments Capsule ◇

Enterprise-grade payment processing with support for Stripe, PayPal, Square, and Braintree. Handle payments, subscriptions, refunds, and customer management with a unified API.

## Features

- Multiple payment providers (Stripe, PayPal, Square, Braintree)
- One-time and recurring payments
- Subscription management
- Customer management
- Refund processing
- Invoice generation
- Webhook verification
- Multi-currency support
- Automatic retry with exponential backoff
- Card validation and formatting
- Comprehensive error handling
- Detailed statistics tracking

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

### Stripe Integration

```typescript
import { createPaymentsService } from '@capsulas/capsules/payments';

const payments = await createPaymentsService({
  provider: 'stripe',
  apiKey: 'sk_test_...',
  currency: 'USD',
  sandbox: true,
  debug: true,
});

// Create a payment
const payment = await payments.createPayment(5000, 'USD', {
  description: 'Premium subscription',
  customer: 'cus_12345',
});

// Confirm the payment
const confirmed = await payments.confirmPayment(payment.id);
console.log('Payment status:', confirmed.status);
```

### PayPal Integration

```typescript
const payments = await createPaymentsService({
  provider: 'paypal',
  apiKey: 'YOUR_CLIENT_ID',
  secretKey: 'YOUR_SECRET',
  currency: 'USD',
  sandbox: true,
});

const payment = await payments.createPayment(10000, 'USD', {
  description: 'Product purchase',
});
```

## API Reference

### Configuration

```typescript
interface PaymentsConfig {
  provider: 'stripe' | 'paypal' | 'square' | 'braintree';
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  currency?: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'MXN' | 'BRL';
  sandbox?: boolean;
  debug?: boolean;
  timeout?: number;
  retryAttempts?: number;
  captureMethod?: 'automatic' | 'manual';
}
```

### Payment Operations

#### Create Payment

```typescript
const payment = await payments.createPayment(
  5000, // Amount in smallest currency unit (cents)
  'USD',
  {
    customer: 'cus_12345',
    description: 'Premium subscription',
    metadata: { orderId: 'order_123' },
  }
);
```

#### Confirm Payment

```typescript
const confirmed = await payments.confirmPayment('pi_12345');
```

#### Cancel Payment

```typescript
const canceled = await payments.cancelPayment('pi_12345');
```

#### Capture Payment (Manual Capture)

```typescript
const captured = await payments.capturePayment('pi_12345');
```

#### Create Charge (Direct)

```typescript
const charge = await payments.createCharge(
  5000,
  'USD',
  'tok_visa', // Token or source
  {
    customer: 'cus_12345',
    description: 'Product purchase',
  }
);
```

#### Refund

```typescript
// Full refund
const refund = await payments.refund('ch_12345');

// Partial refund
const partialRefund = await payments.refund('ch_12345', 2500);
```

### Customer Management

#### Create Customer

```typescript
const customer = await payments.createCustomer('customer@example.com', {
  name: 'John Doe',
  phone: '+1234567890',
  address: {
    line1: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'US',
  },
  metadata: { userId: 'user_123' },
});
```

#### Get Customer

```typescript
const customer = await payments.getCustomer('cus_12345');
```

#### Update Customer

```typescript
const updated = await payments.updateCustomer('cus_12345', {
  name: 'Jane Doe',
  email: 'jane@example.com',
});
```

#### Delete Customer

```typescript
const deleted = await payments.deleteCustomer('cus_12345');
```

#### Attach Payment Method

```typescript
await payments.attachPaymentMethod('cus_12345', 'pm_12345');
```

### Subscription Management

#### Create Subscription

```typescript
const subscription = await payments.createSubscription(
  'cus_12345',
  'plan_premium',
  {
    metadata: { tier: 'premium' },
  }
);
```

#### Cancel Subscription

```typescript
const canceled = await payments.cancelSubscription('sub_12345');
```

### Invoice Management

#### Create Invoice

```typescript
const invoice = await payments.createInvoice('cus_12345', [
  {
    description: 'Premium Plan',
    amount: 2999,
    quantity: 1,
  },
  {
    description: 'Extra Storage',
    amount: 500,
    quantity: 2,
  },
]);
```

### Webhook Handling

```typescript
// In your webhook endpoint
app.post('/webhooks/payments', (req, res) => {
  const signature = req.headers['stripe-signature'];
  const payload = req.body;

  try {
    const event = payments.verifyWebhook(payload, signature);

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data);
        break;
      case 'payment_intent.failed':
        console.log('Payment failed:', event.data);
        break;
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).send('Webhook verification failed');
  }
});
```

### Utility Functions

```typescript
import {
  formatAmount,
  convertToSmallestUnit,
  convertFromSmallestUnit,
  maskCardNumber,
  getCardBrand,
  calculateFee,
} from '@capsulas/capsules/payments';

// Format amount for display
const formatted = formatAmount(5000, 'USD'); // "$50.00"

// Convert to smallest unit (cents)
const cents = convertToSmallestUnit(50.0, 'USD'); // 5000

// Convert from smallest unit
const dollars = convertFromSmallestUnit(5000, 'USD'); // 50.0

// Mask card number
const masked = maskCardNumber('4242424242424242'); // "****-****-****-4242"

// Get card brand
const brand = getCardBrand('4242424242424242'); // "visa"

// Calculate processing fee
const fee = calculateFee(5000); // 175 (2.9% + $0.30)
```

### Statistics

```typescript
const stats = payments.getStats();
console.log(stats);
// {
//   totalPayments: 150,
//   successfulPayments: 142,
//   failedPayments: 8,
//   refundedPayments: 5,
//   totalAmount: 750000,
//   totalRefunded: 25000,
//   averageAmount: 5000,
//   errors: 3,
//   apiCalls: 305,
//   webhooksReceived: 87
// }
```

## Examples

### E-commerce Checkout

```typescript
async function processCheckout(cartTotal: number, customerId: string) {
  try {
    // Create payment intent
    const payment = await payments.createPayment(cartTotal, 'USD', {
      customer: customerId,
      description: 'Order checkout',
      metadata: { cart_id: 'cart_123' },
    });

    // Return client secret to frontend
    return { clientSecret: payment.id };
  } catch (error) {
    console.error('Checkout failed:', error);
    throw error;
  }
}
```

### Subscription Billing

```typescript
async function setupSubscription(email: string, planId: string) {
  try {
    // Create customer
    const customer = await payments.createCustomer(email, {
      name: 'John Doe',
    });

    // Create subscription
    const subscription = await payments.createSubscription(customer.id, planId, {
      metadata: { source: 'web' },
    });

    return subscription;
  } catch (error) {
    console.error('Subscription setup failed:', error);
    throw error;
  }
}
```

### Marketplace with Split Payments

```typescript
async function processMarketplacePayment(amount: number, sellerId: string) {
  try {
    // Charge customer
    const charge = await payments.createCharge(amount, 'USD', 'tok_visa', {
      description: `Marketplace purchase from ${sellerId}`,
    });

    // Calculate platform fee and seller payout
    const platformFee = calculateFee(amount);
    const sellerPayout = amount - platformFee;

    console.log(`Platform fee: $${platformFee / 100}`);
    console.log(`Seller payout: $${sellerPayout / 100}`);

    return charge;
  } catch (error) {
    console.error('Marketplace payment failed:', error);
    throw error;
  }
}
```

## Error Handling

```typescript
import { PaymentsError, PaymentsErrorType } from '@capsulas/capsules/payments';

try {
  const payment = await payments.createPayment(5000, 'USD');
} catch (error) {
  if (error instanceof PaymentsError) {
    switch (error.type) {
      case PaymentsErrorType.CARD_DECLINED:
        console.log('Card was declined');
        break;
      case PaymentsErrorType.INSUFFICIENT_FUNDS:
        console.log('Insufficient funds');
        break;
      case PaymentsErrorType.EXPIRED_CARD:
        console.log('Card has expired');
        break;
      case PaymentsErrorType.INVALID_AMOUNT:
        console.log('Invalid payment amount');
        break;
      default:
        console.log('Payment error:', error.message);
    }
  }
}
```

## Supported Currencies

USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, MXN, BRL

## Security Best Practices

1. Never expose API keys in client-side code
2. Always validate webhook signatures
3. Use HTTPS for all payment endpoints
4. Implement rate limiting on payment endpoints
5. Log and monitor all payment activities
6. Use PCI-compliant payment methods
7. Store minimal payment information
8. Implement fraud detection rules

## Testing

### Test Cards (Stripe)

- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Insufficient Funds: `4000 0000 0000 9995`
- Expired: `4000 0000 0000 0069`

Use any future expiration date and any 3-digit CVC.

## License

MIT