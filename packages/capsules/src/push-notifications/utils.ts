/**
 * Push Notifications Capsule - Utils
 */

import { PushNotification, PushTarget } from './types';
import { PushValidationError } from './errors';
import {
  MAX_NOTIFICATION_TITLE_LENGTH,
  MAX_NOTIFICATION_BODY_LENGTH,
  MAX_BATCH_SIZE
} from './constants';

export function validateNotification(notification: PushNotification): void {
  if (!notification.title || notification.title.trim().length === 0) {
    throw new PushValidationError('Notification title is required');
  }

  if (notification.title.length > MAX_NOTIFICATION_TITLE_LENGTH) {
    throw new PushValidationError(
      `Title exceeds maximum length of ${MAX_NOTIFICATION_TITLE_LENGTH} characters`
    );
  }

  if (!notification.body || notification.body.trim().length === 0) {
    throw new PushValidationError('Notification body is required');
  }

  if (notification.body.length > MAX_NOTIFICATION_BODY_LENGTH) {
    throw new PushValidationError(
      `Body exceeds maximum length of ${MAX_NOTIFICATION_BODY_LENGTH} characters`
    );
  }

  if (notification.badge !== undefined && notification.badge < 0) {
    throw new PushValidationError('Badge count cannot be negative');
  }

  if (notification.ttl !== undefined && notification.ttl < 0) {
    throw new PushValidationError('TTL cannot be negative');
  }
}

export function validateTarget(target: PushTarget): void {
  const hasToken = target.token && target.token.trim().length > 0;
  const hasTokens = target.tokens && target.tokens.length > 0;
  const hasTopic = target.topic && target.topic.trim().length > 0;
  const hasCondition = target.condition && target.condition.trim().length > 0;

  if (!hasToken && !hasTokens && !hasTopic && !hasCondition) {
    throw new PushValidationError(
      'Target must have at least one: token, tokens, topic, or condition'
    );
  }

  if (hasTokens && target.tokens!.length > MAX_BATCH_SIZE) {
    throw new PushValidationError(
      `Cannot send to more than ${MAX_BATCH_SIZE} tokens at once`
    );
  }
}

export function validateDeviceToken(token: string): boolean {
  // Basic validation - tokens should not be empty
  if (!token || token.trim().length === 0) {
    return false;
  }

  // Firebase tokens are typically 152-163 characters
  // APNS tokens are 64 hex characters
  // Expo tokens start with ExponentPushToken[...]
  // OneSignal tokens are UUIDs

  // Allow reasonable token lengths
  return token.length >= 32 && token.length <= 300;
}

export function batchTokens(tokens: string[], batchSize: number = MAX_BATCH_SIZE): string[][] {
  const batches: string[][] = [];

  for (let i = 0; i < tokens.length; i += batchSize) {
    batches.push(tokens.slice(i, i + batchSize));
  }

  return batches;
}

export function generateMessageId(): string {
  return `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
