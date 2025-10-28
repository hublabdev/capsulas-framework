/**
 * Push Notifications Capsule - Types
 * Send push notifications to web and mobile devices
 */

export type PushProvider = 'firebase' | 'apns' | 'onesignal' | 'expo';

export interface PushNotificationsConfig {
  provider: PushProvider;
  serverKey?: string; // Firebase
  certificatePath?: string; // APNS
  appId?: string; // OneSignal, Expo
  apiKey?: string; // OneSignal
  production?: boolean; // APNS environment
}

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  icon?: string;
  image?: string;
  clickAction?: string;
  priority?: 'high' | 'normal';
  ttl?: number; // Time to live in seconds
}

export interface PushTarget {
  token?: string; // Single device token
  tokens?: string[]; // Multiple device tokens
  topic?: string; // Topic subscription
  condition?: string; // Firebase condition
}

export interface PushRequest {
  notification: PushNotification;
  target: PushTarget;
}

export interface PushResult {
  success: boolean;
  messageId?: string;
  provider: PushProvider;
  successCount: number;
  failureCount: number;
  failedTokens?: string[];
  timestamp: Date;
}

export interface PushStats {
  totalSent: number;
  totalSuccess: number;
  totalFailed: number;
  totalDevices: number;
  lastSent?: Date;
}
