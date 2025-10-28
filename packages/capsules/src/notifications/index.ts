/**
 * @capsulas/capsules - Notifications Capsule
 *
 * Multi-channel notifications: Email, Push, SMS, and Slack
 *
 * @category Communication
 * @version 1.0.0
 */

export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export {
  NotificationAdapter,
  EmailAdapter,
  PushAdapter,
  SMSAdapter,
  SlackAdapter,
  createAdapter,
} from './adapters';
export { NotificationService, createNotificationService } from './service';

import { NotificationService } from './service';
export default NotificationService;

export const notificationsCapsule = {
  id: 'notifications',
  name: 'Notifications',
  description: 'Multi-channel notifications: Email, Push, SMS, and Slack',
  icon: '●',
  category: 'communication',
  version: '1.0.0',
  tags: ['notifications', 'email', 'push', 'sms', 'slack', 'messaging', 'communication'],
};
