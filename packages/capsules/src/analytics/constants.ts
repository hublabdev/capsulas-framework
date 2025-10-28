/**
 * Analytics Capsule - Constants
 *
 * Default configurations and constant values
 */

import type { AnalyticsConfig, AnalyticsStats } from './types';

/**
 * Default analytics configuration
 */
export const DEFAULT_CONFIG: Partial<AnalyticsConfig> = {
  enableAutoTracking: false,
  debug: false,
  anonymizeIp: true,
  sampleRate: 1.0,
  enableOfflineQueue: false,
  maxQueueSize: 100,
  batchEvents: false,
  batchSize: 10,
  batchTimeout: 5000,
};

/**
 * Initial analytics statistics
 */
export const INITIAL_STATS: AnalyticsStats = {
  totalEvents: 0,
  eventsByCategory: {},
  uniqueUsers: 0,
  sessions: 0,
  averageSessionDuration: 0,
  pageViews: 0,
  queuedEvents: 0,
  failedEvents: 0,
  uptime: 0,
};

/**
 * Event validation constants
 */
export const EVENT_VALIDATION = {
  MAX_EVENT_NAME_LENGTH: 100,
  MAX_PROPERTY_KEY_LENGTH: 40,
  MAX_PROPERTY_VALUE_LENGTH: 500,
  MAX_PROPERTIES_PER_EVENT: 50,
  MIN_EVENT_NAME_LENGTH: 1,
} as const;

/**
 * Reserved event names (standard analytics events)
 */
export const RESERVED_EVENT_NAMES = [
  'page_view',
  'screen_view',
  'session_start',
  'session_end',
  'first_visit',
  'user_engagement',
  'app_open',
  'app_close',
  'click',
  'scroll',
  'search',
  'login',
  'logout',
  'signup',
  'purchase',
  'add_to_cart',
  'remove_from_cart',
  'begin_checkout',
  'add_payment_info',
  'add_shipping_info',
] as const;

/**
 * Standard event categories
 */
export const EVENT_CATEGORIES = {
  NAVIGATION: 'navigation',
  USER: 'user',
  ECOMMERCE: 'ecommerce',
  ENGAGEMENT: 'engagement',
  CONVERSION: 'conversion',
  CUSTOM: 'custom',
} as const;

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  DEFAULT_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_DURATION: 4 * 60 * 60 * 1000, // 4 hours
  MIN_DURATION: 1000, // 1 second
  HEARTBEAT_INTERVAL: 60 * 1000, // 1 minute
} as const;

/**
 * Queue configuration
 */
export const QUEUE_CONFIG = {
  MAX_SIZE: 100,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  RETRY_BACKOFF_MULTIPLIER: 2,
  MAX_RETRY_DELAY: 30000, // 30 seconds
  FLUSH_INTERVAL: 10000, // 10 seconds
} as const;

/**
 * Batch configuration
 */
export const BATCH_CONFIG = {
  DEFAULT_SIZE: 10,
  MAX_SIZE: 100,
  DEFAULT_TIMEOUT: 5000, // 5 seconds
  MAX_TIMEOUT: 60000, // 60 seconds
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  MAX_EVENTS_PER_SECOND: 100,
  MAX_EVENTS_PER_MINUTE: 1000,
  MAX_EVENTS_PER_HOUR: 10000,
  WINDOW_SIZE: 1000, // 1 second
} as const;

/**
 * Provider-specific defaults
 */
export const PROVIDER_DEFAULTS = {
  'google-analytics': {
    endpoint: 'https://www.google-analytics.com/mp/collect',
    apiVersion: '2',
    defaultMeasurementId: 'G-XXXXXXXXXX',
  },
  mixpanel: {
    endpoint: 'https://api.mixpanel.com/track',
    importEndpoint: 'https://api.mixpanel.com/import',
    apiVersion: '2',
  },
  segment: {
    endpoint: 'https://api.segment.io/v1/track',
    apiVersion: 'v1',
  },
  amplitude: {
    endpoint: 'https://api2.amplitude.com/2/httpapi',
    batchEndpoint: 'https://api2.amplitude.com/batch',
    apiVersion: '2',
  },
} as const;

/**
 * Standard user properties
 */
export const STANDARD_USER_PROPERTIES = [
  'userId',
  'email',
  'name',
  'username',
  'phone',
  'plan',
  'createdAt',
  'country',
  'language',
  'timezone',
  'avatar',
] as const;

/**
 * Standard event properties
 */
export const STANDARD_EVENT_PROPERTIES = [
  'timestamp',
  'eventId',
  'sessionId',
  'userId',
  'category',
  'label',
  'value',
  'url',
  'referrer',
  'userAgent',
  'screen',
  'viewport',
  'language',
  'timezone',
  'platform',
  'device',
] as const;

/**
 * Device types
 */
export const DEVICE_TYPES = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  TV: 'tv',
  WEARABLE: 'wearable',
  CONSOLE: 'console',
  UNKNOWN: 'unknown',
} as const;

/**
 * Platform types
 */
export const PLATFORM_TYPES = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
  WINDOWS: 'windows',
  MACOS: 'macos',
  LINUX: 'linux',
  OTHER: 'other',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NOT_INITIALIZED: 'Analytics service not initialized. Call initialize() first.',
  ALREADY_INITIALIZED: 'Analytics service already initialized.',
  INVALID_PROVIDER: 'Invalid analytics provider.',
  INVALID_EVENT_NAME: 'Invalid event name.',
  INVALID_USER_ID: 'Invalid user ID.',
  EVENT_NAME_TOO_LONG: 'Event name exceeds maximum length.',
  TOO_MANY_PROPERTIES: 'Too many event properties.',
  PROPERTY_VALUE_TOO_LONG: 'Property value exceeds maximum length.',
  QUEUE_FULL: 'Event queue is full.',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded.',
  NETWORK_ERROR: 'Network request failed.',
  PROVIDER_ERROR: 'Provider API error.',
  MISSING_API_KEY: 'API key is required.',
  MISSING_TRACKING_ID: 'Tracking ID is required.',
} as const;

/**
 * Debug configuration
 */
export const DEBUG = {
  LOG_EVENTS: false,
  LOG_USER_ACTIONS: false,
  LOG_SESSIONS: false,
  LOG_ERRORS: true,
  LOG_NETWORK: false,
  VERBOSE: false,
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE = {
  MAX_EVENT_SIZE: 32 * 1024, // 32 KB
  MAX_BATCH_SIZE: 512 * 1024, // 512 KB
  WARNING_QUEUE_SIZE: 80, // 80% of max
  OPTIMAL_BATCH_SIZE: 10,
  MAX_PROPERTY_DEPTH: 5, // For nested objects
} as const;

/**
 * Timeouts
 */
export const TIMEOUTS = {
  TRACK: 5000, // 5 seconds
  IDENTIFY: 5000,
  PAGE_VIEW: 3000,
  GROUP: 5000,
  FLUSH: 10000,
  NETWORK_REQUEST: 10000,
} as const;

/**
 * Sampling strategies
 */
export const SAMPLING = {
  ALWAYS: 1.0,
  NEVER: 0.0,
  HALF: 0.5,
  QUARTER: 0.25,
  TEN_PERCENT: 0.1,
  ONE_PERCENT: 0.01,
} as const;

/**
 * Common event names
 */
export const COMMON_EVENTS = {
  // Navigation
  PAGE_VIEW: 'page_view',
  SCREEN_VIEW: 'screen_view',
  NAVIGATION: 'navigation',

  // User actions
  CLICK: 'click',
  SUBMIT: 'submit',
  SCROLL: 'scroll',
  SEARCH: 'search',
  DOWNLOAD: 'download',
  SHARE: 'share',
  LIKE: 'like',
  COMMENT: 'comment',

  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',
  PASSWORD_RESET: 'password_reset',

  // E-commerce
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
  REFUND: 'refund',

  // Engagement
  VIDEO_START: 'video_start',
  VIDEO_COMPLETE: 'video_complete',
  TUTORIAL_BEGIN: 'tutorial_begin',
  TUTORIAL_COMPLETE: 'tutorial_complete',
  LEVEL_UP: 'level_up',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',

  // Session
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  FIRST_VISIT: 'first_visit',

  // Errors
  ERROR: 'error',
  EXCEPTION: 'exception',
} as const;

/**
 * Property name conventions
 */
export const PROPERTY_CONVENTIONS = {
  // Use snake_case for property names
  CASE_STYLE: 'snake_case',

  // Standard prefixes
  PREFIX_USER: 'user_',
  PREFIX_SESSION: 'session_',
  PREFIX_PAGE: 'page_',
  PREFIX_DEVICE: 'device_',
  PREFIX_APP: 'app_',
} as const;
