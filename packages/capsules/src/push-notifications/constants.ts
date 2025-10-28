/**
 * Push Notifications Capsule - Constants
 */

import { PushNotificationsConfig, PushStats } from './types';

export const DEFAULT_PUSH_CONFIG: Partial<PushNotificationsConfig> = {
  production: false
};

export const INITIAL_STATS: PushStats = {
  totalSent: 0,
  totalSuccess: 0,
  totalFailed: 0,
  totalDevices: 0
};

export const MAX_NOTIFICATION_TITLE_LENGTH = 65;
export const MAX_NOTIFICATION_BODY_LENGTH = 240;
export const MAX_BATCH_SIZE = 500;
export const DEFAULT_TTL = 2419200; // 28 days in seconds
export const DEFAULT_PRIORITY = 'high';

export const FIREBASE_ENDPOINT = 'https://fcm.googleapis.com/fcm/send';
export const ONESIGNAL_ENDPOINT = 'https://onesignal.com/api/v1/notifications';
export const EXPO_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
