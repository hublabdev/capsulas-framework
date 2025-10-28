/**
 * Analytics Capsule - Utility Functions
 *
 * Helper functions for event validation, sanitization, and enrichment
 */

import type { AnalyticsEvent, EventValidation, UserProperties } from './types';
import { EVENT_VALIDATION, RESERVED_EVENT_NAMES } from './constants';

/**
 * Generate unique event ID
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize event name
 * Converts to lowercase, replaces invalid characters with underscores
 */
export function sanitizeEventName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, EVENT_VALIDATION.MAX_EVENT_NAME_LENGTH);
}

/**
 * Sanitize property key
 */
export function sanitizePropertyKey(key: string): string {
  return key
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, EVENT_VALIDATION.MAX_PROPERTY_KEY_LENGTH);
}

/**
 * Sanitize property value
 */
export function sanitizePropertyValue(value: any): any {
  if (typeof value === 'string') {
    return value.slice(0, EVENT_VALIDATION.MAX_PROPERTY_VALUE_LENGTH);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 10).map(sanitizePropertyValue);
  }

  if (typeof value === 'object') {
    return sanitizeProperties(value);
  }

  return String(value).slice(0, EVENT_VALIDATION.MAX_PROPERTY_VALUE_LENGTH);
}

/**
 * Sanitize event properties
 * Limits number of properties and sanitizes keys/values
 */
export function sanitizeProperties(properties: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const entries = Object.entries(properties).slice(0, EVENT_VALIDATION.MAX_PROPERTIES_PER_EVENT);

  for (const [key, value] of entries) {
    const sanitizedKey = sanitizePropertyKey(key);
    sanitized[sanitizedKey] = sanitizePropertyValue(value);
  }

  return sanitized;
}

/**
 * Validate event name
 */
export function validateEventName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  if (
    name.length < EVENT_VALIDATION.MIN_EVENT_NAME_LENGTH ||
    name.length > EVENT_VALIDATION.MAX_EVENT_NAME_LENGTH
  ) {
    return false;
  }

  return /^[a-zA-Z0-9_]+$/.test(name);
}

/**
 * Validate event data
 */
export function validateEvent(event: AnalyticsEvent): EventValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate event name
  if (!event.name) {
    errors.push('Event name is required');
  } else if (!validateEventName(event.name)) {
    errors.push('Event name contains invalid characters');
  } else if (event.name.length > EVENT_VALIDATION.MAX_EVENT_NAME_LENGTH) {
    errors.push(`Event name exceeds maximum length of ${EVENT_VALIDATION.MAX_EVENT_NAME_LENGTH}`);
  }

  // Check reserved names
  if (RESERVED_EVENT_NAMES.includes(event.name as any)) {
    warnings.push(`Event name '${event.name}' is a reserved event name`);
  }

  // Validate properties
  if (event.properties) {
    const propertyCount = Object.keys(event.properties).length;
    if (propertyCount > EVENT_VALIDATION.MAX_PROPERTIES_PER_EVENT) {
      warnings.push(
        `Event has ${propertyCount} properties, exceeding recommended limit of ${EVENT_VALIDATION.MAX_PROPERTIES_PER_EVENT}`
      );
    }

    // Check property sizes
    for (const [key, value] of Object.entries(event.properties)) {
      if (key.length > EVENT_VALIDATION.MAX_PROPERTY_KEY_LENGTH) {
        warnings.push(`Property key '${key}' exceeds maximum length`);
      }

      if (typeof value === 'string' && value.length > EVENT_VALIDATION.MAX_PROPERTY_VALUE_LENGTH) {
        warnings.push(`Property value for '${key}' exceeds maximum length`);
      }
    }
  }

  // Validate timestamp
  if (event.timestamp !== undefined) {
    if (typeof event.timestamp !== 'number' || event.timestamp < 0) {
      errors.push('Invalid timestamp');
    }
  }

  // Validate value
  if (event.value !== undefined) {
    if (typeof event.value !== 'number') {
      errors.push('Event value must be a number');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate user properties
 */
export function validateUserProperties(user: UserProperties): EventValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!user.userId) {
    errors.push('User ID is required');
  }

  if (user.userId && typeof user.userId !== 'string') {
    errors.push('User ID must be a string');
  }

  if (user.email && typeof user.email !== 'string') {
    errors.push('Email must be a string');
  }

  if (user.email && !isValidEmail(user.email)) {
    warnings.push('Email format appears invalid');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get user agent string
 */
export function getUserAgent(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent;
  }
  if (typeof process !== 'undefined' && process.version) {
    return `Node.js/${process.version}`;
  }
  return 'Unknown';
}

/**
 * Get screen resolution
 */
export function getScreenResolution(): { width: number; height: number } | null {
  if (typeof window !== 'undefined' && window.screen) {
    return {
      width: window.screen.width,
      height: window.screen.height,
    };
  }
  return null;
}

/**
 * Get viewport size
 */
export function getViewportSize(): { width: number; height: number } | null {
  if (typeof window !== 'undefined') {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  return null;
}

/**
 * Get current URL
 */
export function getCurrentUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.href;
  }
  return '';
}

/**
 * Get page title
 */
export function getPageTitle(): string {
  if (typeof document !== 'undefined') {
    return document.title;
  }
  return '';
}

/**
 * Get referrer URL
 */
export function getReferrer(): string {
  if (typeof document !== 'undefined') {
    return document.referrer;
  }
  return '';
}

/**
 * Get language/locale
 */
export function getLanguage(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.language || (navigator as any).userLanguage || 'en-US';
  }
  return 'en-US';
}

/**
 * Get timezone
 */
export function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Detect device type
 */
export function getDeviceType(): string {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const ua = navigator.userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }

  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

/**
 * Detect platform
 */
export function getPlatform(): string {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';

  return 'unknown';
}

/**
 * Enrich event with context data
 */
export function enrichEvent(event: AnalyticsEvent): AnalyticsEvent {
  const enriched: AnalyticsEvent = {
    ...event,
    timestamp: event.timestamp || Date.now(),
    eventId: event.eventId || generateEventId(),
    properties: {
      ...event.properties,
      user_agent: getUserAgent(),
      url: getCurrentUrl(),
      referrer: getReferrer(),
      language: getLanguage(),
      timezone: getTimezone(),
      device_type: getDeviceType(),
      platform: getPlatform(),
      screen: getScreenResolution(),
      viewport: getViewportSize(),
    },
  };

  return enriched;
}

/**
 * Calculate session duration
 */
export function calculateSessionDuration(startTime: number, endTime: number): number {
  return Math.floor((endTime - startTime) / 1000); // seconds
}

/**
 * Check if should sample event
 */
export function shouldSample(sampleRate: number): boolean {
  if (sampleRate <= 0) return false;
  if (sampleRate >= 1) return true;
  return Math.random() < sampleRate;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone((obj as any)[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Calculate event size in bytes
 */
export function calculateEventSize(event: AnalyticsEvent): number {
  const serialized = JSON.stringify(event);
  return Buffer.byteLength(serialized, 'utf-8');
}

/**
 * Anonymize IP address
 */
export function anonymizeIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    // IPv4: set last octet to 0
    parts[3] = '0';
    return parts.join('.');
  }

  // IPv6: set last 80 bits to 0
  const ipv6Parts = ip.split(':');
  if (ipv6Parts.length >= 2) {
    return ipv6Parts.slice(0, 4).join(':') + '::';
  }

  return ip;
}

/**
 * Hash value (for user IDs, etc.)
 */
export function hashValue(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
