/**
 * @capsulas/capsules - Analytics Capsule
 *
 * Event tracking and analytics with Google Analytics, Mixpanel, Segment, Amplitude
 * Features: Multiple providers, session tracking, funnels, cohorts, offline queue
 *
 * @category Analytics
 * @version 1.0.0
 */

// Export types
export type {
  AnalyticsProvider,
  AnalyticsConfig,
  AnalyticsEvent,
  AnalyticsResult,
  AnalyticsStats,
  PageViewEvent,
  UserProperties,
  GroupProperties,
  Session,
  Funnel,
  Cohort,
  QueuedEvent,
  EventValidation,
} from './types';

// Export errors
export {
  AnalyticsError,
  AnalyticsErrorType,
  AnalyticsInitializationError,
  AnalyticsTrackingError,
  AnalyticsProviderError,
  AnalyticsInvalidEventError,
  AnalyticsInvalidUserError,
  AnalyticsSessionError,
  AnalyticsNetworkError,
  AnalyticsRateLimitError,
  AnalyticsQueueFullError,
  AnalyticsValidationError,
  AnalyticsConfigurationError,
  AnalyticsAdapterError,
  isAnalyticsError,
  isAnalyticsErrorType,
  createTrackingError,
  createProviderError,
  createInvalidEventError,
  createNetworkError,
  createConfigError,
  parseProviderError,
} from './errors';

// Export constants
export {
  DEFAULT_CONFIG,
  INITIAL_STATS,
  EVENT_VALIDATION,
  RESERVED_EVENT_NAMES,
  EVENT_CATEGORIES,
  SESSION_CONFIG,
  QUEUE_CONFIG,
  BATCH_CONFIG,
  RATE_LIMIT_CONFIG,
  PROVIDER_DEFAULTS,
  STANDARD_USER_PROPERTIES,
  STANDARD_EVENT_PROPERTIES,
  DEVICE_TYPES,
  PLATFORM_TYPES,
  ERROR_MESSAGES,
  DEBUG,
  PERFORMANCE,
  TIMEOUTS,
  SAMPLING,
  COMMON_EVENTS,
  PROPERTY_CONVENTIONS,
} from './constants';

// Export utilities
export {
  generateEventId,
  generateSessionId,
  sanitizeEventName,
  sanitizePropertyKey,
  sanitizePropertyValue,
  sanitizeProperties,
  validateEventName,
  validateEvent,
  validateUserProperties,
  isValidEmail,
  getUserAgent,
  getScreenResolution,
  getViewportSize,
  getCurrentUrl,
  getPageTitle,
  getReferrer,
  getLanguage,
  getTimezone,
  getDeviceType,
  getPlatform,
  enrichEvent,
  calculateSessionDuration,
  shouldSample,
  debounce,
  throttle,
  deepClone,
  formatDuration,
  calculateEventSize,
  anonymizeIp,
  hashValue,
} from './utils';

// Export adapters
export {
  AnalyticsAdapter,
  GoogleAnalyticsAdapter,
  MixpanelAdapter,
  SegmentAdapter,
  AmplitudeAdapter,
  createAdapter,
} from './adapters';

// Export service
export { AnalyticsService, createAnalyticsService, createAnalyticsFactory } from './service';

// Re-export default service for convenience
import { AnalyticsService } from './service';
export default AnalyticsService;

/**
 * Capsule metadata for Capsulas Framework
 */
export const analyticsCapsule = {
  id: 'analytics',
  name: 'Analytics',
  description: 'Event tracking and analytics with multiple provider support',
  icon: '╣',
  category: 'analytics',
  version: '1.0.0',
  tags: [
    'analytics',
    'tracking',
    'events',
    'metrics',
    'google-analytics',
    'mixpanel',
    'segment',
    'amplitude',
    'funnels',
    'cohorts',
  ],
  links: {
    documentation: 'https://docs.capsulas.dev/capsules/analytics',
    github:
      'https://github.com/capsulas-framework/capsulas/tree/main/packages/capsules/src/analytics',
    npm: 'https://www.npmjs.com/package/@capsulas/capsules',
  },
};
