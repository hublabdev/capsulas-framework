/**
 * Analytics Capsule - Type Definitions
 *
 * Type-safe analytics system with support for multiple providers
 */

/**
 * Supported analytics provider types
 */
export type AnalyticsProvider = 'google-analytics' | 'mixpanel' | 'segment' | 'amplitude';

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  /**
   * Provider type to use
   */
  provider: AnalyticsProvider;

  /**
   * Tracking ID or API key
   */
  trackingId?: string;

  /**
   * API key (for Mixpanel, Amplitude)
   */
  apiKey?: string;

  /**
   * API secret (for server-side tracking)
   */
  apiSecret?: string;

  /**
   * Enable automatic page view tracking
   */
  enableAutoTracking?: boolean;

  /**
   * Enable debug mode
   */
  debug?: boolean;

  /**
   * Anonymize IP addresses
   */
  anonymizeIp?: boolean;

  /**
   * Sample rate (0-1)
   */
  sampleRate?: number;

  /**
   * Enable offline queue
   */
  enableOfflineQueue?: boolean;

  /**
   * Maximum queue size
   */
  maxQueueSize?: number;

  /**
   * Batch events before sending
   */
  batchEvents?: boolean;

  /**
   * Batch size
   */
  batchSize?: number;

  /**
   * Batch timeout in milliseconds
   */
  batchTimeout?: number;

  /**
   * Google Analytics specific config
   */
  googleAnalytics?: {
    measurementId?: string;
    debugMode?: boolean;
    sendPageView?: boolean;
  };

  /**
   * Mixpanel specific config
   */
  mixpanel?: {
    token: string;
    apiHost?: string;
    persistence?: 'cookie' | 'localStorage' | 'memory';
  };

  /**
   * Segment specific config
   */
  segment?: {
    writeKey: string;
    apiHost?: string;
  };

  /**
   * Amplitude specific config
   */
  amplitude?: {
    apiKey: string;
    endpoint?: string;
    useBatch?: boolean;
  };
}

/**
 * Analytics event data
 */
export interface AnalyticsEvent {
  /**
   * Event name
   */
  name: string;

  /**
   * Event properties
   */
  properties?: Record<string, any>;

  /**
   * Event timestamp
   */
  timestamp?: number;

  /**
   * User ID
   */
  userId?: string;

  /**
   * Session ID
   */
  sessionId?: string;

  /**
   * Event ID (auto-generated)
   */
  eventId?: string;

  /**
   * Event category
   */
  category?: string;

  /**
   * Event label
   */
  label?: string;

  /**
   * Event value
   */
  value?: number;
}

/**
 * Page view event
 */
export interface PageViewEvent {
  /**
   * Page URL
   */
  url: string;

  /**
   * Page title
   */
  title?: string;

  /**
   * Referrer URL
   */
  referrer?: string;

  /**
   * Additional properties
   */
  properties?: Record<string, any>;
}

/**
 * User properties for identification
 */
export interface UserProperties {
  /**
   * User ID
   */
  userId: string;

  /**
   * Email address
   */
  email?: string;

  /**
   * Full name
   */
  name?: string;

  /**
   * Username
   */
  username?: string;

  /**
   * Phone number
   */
  phone?: string;

  /**
   * User plan/tier
   */
  plan?: string;

  /**
   * Account creation date
   */
  createdAt?: number;

  /**
   * Custom user properties
   */
  [key: string]: any;
}

/**
 * Group/organization properties
 */
export interface GroupProperties {
  /**
   * Group ID
   */
  groupId: string;

  /**
   * Group name
   */
  name?: string;

  /**
   * Group type
   */
  type?: string;

  /**
   * Custom group properties
   */
  [key: string]: any;
}

/**
 * Analytics statistics
 */
export interface AnalyticsStats {
  /**
   * Total events tracked
   */
  totalEvents: number;

  /**
   * Events by category
   */
  eventsByCategory: Record<string, number>;

  /**
   * Unique users tracked
   */
  uniqueUsers: number;

  /**
   * Total sessions
   */
  sessions: number;

  /**
   * Average session duration in seconds
   */
  averageSessionDuration: number;

  /**
   * Total page views
   */
  pageViews: number;

  /**
   * Events in queue (offline)
   */
  queuedEvents: number;

  /**
   * Failed events
   */
  failedEvents: number;

  /**
   * Uptime in milliseconds
   */
  uptime: number;
}

/**
 * Session data
 */
export interface Session {
  /**
   * Session ID
   */
  id: string;

  /**
   * User ID
   */
  userId?: string;

  /**
   * Session start time
   */
  startTime: number;

  /**
   * Session end time
   */
  endTime?: number;

  /**
   * Session duration in milliseconds
   */
  duration?: number;

  /**
   * Events in this session
   */
  events: AnalyticsEvent[];

  /**
   * Page views in this session
   */
  pageViews: number;

  /**
   * Session properties
   */
  properties?: Record<string, any>;
}

/**
 * Analytics result
 */
export interface AnalyticsResult {
  /**
   * Whether operation was successful
   */
  success: boolean;

  /**
   * Event ID if tracked
   */
  eventId?: string;

  /**
   * Error message if failed
   */
  error?: string;

  /**
   * Whether event was queued (offline)
   */
  queued?: boolean;
}

/**
 * Funnel definition
 */
export interface Funnel {
  /**
   * Funnel ID
   */
  id: string;

  /**
   * Funnel name
   */
  name: string;

  /**
   * Funnel steps (event names)
   */
  steps: string[];

  /**
   * Conversions per step
   */
  conversions: Map<string, number>;
}

/**
 * Cohort definition
 */
export interface Cohort {
  /**
   * Cohort ID
   */
  id: string;

  /**
   * Cohort name
   */
  name: string;

  /**
   * Filter function to determine membership
   */
  filter: (user: UserProperties) => boolean;

  /**
   * Users in this cohort
   */
  users: Set<string>;
}

/**
 * Event validation result
 */
export interface EventValidation {
  /**
   * Whether event is valid
   */
  valid: boolean;

  /**
   * Validation errors
   */
  errors: string[];

  /**
   * Validation warnings
   */
  warnings: string[];
}

/**
 * Queued event (for offline support)
 */
export interface QueuedEvent {
  /**
   * Event data
   */
  event: AnalyticsEvent;

  /**
   * Queue timestamp
   */
  queuedAt: number;

  /**
   * Retry count
   */
  retries: number;
}
