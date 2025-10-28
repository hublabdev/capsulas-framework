export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { PaymentsAdapter, createAdapter } from './adapters';
export { PaymentsService, createPaymentsService } from './service';
import { PaymentsService } from './service';
export default PaymentsService;
export const paymentsCapsule = {
  id: 'payments',
  name: 'Payments',
  description: 'Payment processing with Stripe, PayPal',
  icon: '◇',
  category: 'payments',
  version: '1.0.0',
  tags: ['payments'],
};