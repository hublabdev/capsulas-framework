/**
 * Analytics Capsule - Service
 *
 * Main AnalyticsService class with lifecycle methods
 */

import type {
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
} from './types';
import { createAdapter, AnalyticsAdapter } from './adapters';
import {
  AnalyticsInitializationError,
  AnalyticsTrackingError,
  AnalyticsQueueFullError,
  createTrackingError,
} from './errors';
import { DEFAULT_CONFIG, INITIAL_STATS, SESSION_CONFIG, QUEUE_CONFIG } from './constants';
import {
  generateSessionId,
  generateEventId,
  enrichEvent,
  validateEvent,
  validateUserProperties,
  shouldSample,
  sanitizeEventName,
  sanitizeProperties,
  calculateSessionDuration,
} from './utils';

/**
 * Analytics Service
 * Main service class implementing analytics operations
 */
export class AnalyticsService {
  private adapter: AnalyticsAdapter | null = null;
  private config: AnalyticsConfig;
  private stats: AnalyticsStats = { ...INITIAL_STATS };
  private initialized = false;
  private startTime = 0;

  // Session management
  private currentSession: Session | null = null;
  private sessionTimeout?: NodeJS.Timeout;

  // User and event tracking
  private users = new Set<string>();
  private eventCounts = new Map<string, number>();

  // Funnels and cohorts
  private funnels = new Map<string, Funnel>();
  private cohorts = new Map<string, Cohort>();

  // Offline queue
  private eventQueue: QueuedEvent[] = [];
  private queueFlushInterval?: NodeJS.Timeout;

  constructor(config: AnalyticsConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Initialize analytics service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new AnalyticsInitializationError('Analytics service already initialized');
    }

    try {
      this.adapter = createAdapter(this.config);
      await this.adapter.initialize();

      this.startTime = Date.now();
      this.initialized = true;

      // Start queue flush interval if offline queue enabled
      if (this.config.enableOfflineQueue) {
        this.startQueueFlush();
      }

      // Enable auto-tracking if configured
      if (this.config.enableAutoTracking) {
        this.enableAutoTracking();
      }
    } catch (error: any) {
      throw new AnalyticsInitializationError('Failed to initialize analytics service', {
        provider: this.config.provider,
        error: error.message,
      });
    }
  }

  /**
   * Track custom event
   */
  async track(event: AnalyticsEvent): Promise<AnalyticsResult> {
    this.ensureInitialized();

    // Validate event
    const validation = validateEvent(event);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    // Check sampling
    if (!shouldSample(this.config.sampleRate || 1.0)) {
      return {
        success: true,
        queued: false,
      };
    }

    try {
      // Enrich event with context
      const enrichedEvent = enrichEvent({
        ...event,
        eventId: event.eventId || generateEventId(),
        timestamp: event.timestamp || Date.now(),
        sessionId: event.sessionId || this.currentSession?.id,
      });

      // Sanitize event data
      enrichedEvent.name = sanitizeEventName(enrichedEvent.name);
      if (enrichedEvent.properties) {
        enrichedEvent.properties = sanitizeProperties(enrichedEvent.properties);
      }

      // Track via adapter
      await this.adapter!.track(enrichedEvent);

      // Update statistics
      this.updateStats(enrichedEvent);

      // Add to current session
      if (this.currentSession) {
        this.currentSession.events.push(enrichedEvent);
      }

      return {
        success: true,
        eventId: enrichedEvent.eventId,
      };
    } catch (error: any) {
      this.stats.failedEvents++;

      // Queue event if offline queue enabled
      if (this.config.enableOfflineQueue) {
        return this.queueEvent(event);
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Track page view
   */
  async page(pageView: PageViewEvent): Promise<AnalyticsResult> {
    this.ensureInitialized();

    try {
      await this.adapter!.page(pageView);

      this.stats.pageViews++;
      this.stats.totalEvents++;

      if (this.currentSession) {
        this.currentSession.pageViews++;
      }

      return {
        success: true,
      };
    } catch (error: any) {
      this.stats.failedEvents++;

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Identify user
   */
  async identify(user: UserProperties): Promise<AnalyticsResult> {
    this.ensureInitialized();

    // Validate user
    const validation = validateUserProperties(user);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    try {
      await this.adapter!.identify(user);

      this.users.add(user.userId);
      this.stats.uniqueUsers = this.users.size;

      // Associate with current session
      if (this.currentSession) {
        this.currentSession.userId = user.userId;
      }

      // Check cohort membership
      this.cohorts.forEach((cohort) => {
        if (cohort.filter(user)) {
          cohort.users.add(user.userId);
        }
      });

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Associate user with group/organization
   */
  async group(group: GroupProperties): Promise<AnalyticsResult> {
    this.ensureInitialized();

    try {
      await this.adapter!.group(group);

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Start new session
   */
  startSession(userId?: string): string {
    const sessionId = generateSessionId();

    this.currentSession = {
      id: sessionId,
      userId,
      startTime: Date.now(),
      events: [],
      pageViews: 0,
    };

    this.stats.sessions++;

    // Set session timeout
    this.resetSessionTimeout();

    return sessionId;
  }

  /**
   * End current session
   */
  endSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

    // Update average session duration
    this.updateSessionDuration(this.currentSession.duration);

    // Clear session timeout
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = undefined;
    }

    this.currentSession = null;
  }

  /**
   * Get current session
   */
  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  /**
   * Create analytics funnel
   */
  createFunnel(id: string, name: string, steps: string[]): void {
    this.funnels.set(id, {
      id,
      name,
      steps,
      conversions: new Map(steps.map((step) => [step, 0])),
    });
  }

  /**
   * Track funnel step
   */
  trackFunnelStep(funnelId: string, step: string): void {
    const funnel = this.funnels.get(funnelId);
    if (funnel && funnel.steps.includes(step)) {
      const current = funnel.conversions.get(step) || 0;
      funnel.conversions.set(step, current + 1);
    }
  }

  /**
   * Get funnel data
   */
  getFunnel(id: string): Funnel | undefined {
    return this.funnels.get(id);
  }

  /**
   * Create user cohort
   */
  createCohort(id: string, name: string, filter: (user: UserProperties) => boolean): void {
    this.cohorts.set(id, {
      id,
      name,
      filter,
      users: new Set(),
    });
  }

  /**
   * Get cohort data
   */
  getCohort(id: string): Cohort | undefined {
    return this.cohorts.get(id);
  }

  /**
   * Get analytics statistics
   */
  getStats(): AnalyticsStats {
    const stats = { ...this.stats };
    stats.uptime = Date.now() - this.startTime;
    stats.queuedEvents = this.eventQueue.length;
    return stats;
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<AnalyticsConfig> {
    return { ...this.config };
  }

  /**
   * Flush offline queue
   */
  async flushQueue(): Promise<number> {
    if (this.eventQueue.length === 0) {
      return 0;
    }

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    let flushed = 0;

    for (const queuedEvent of eventsToFlush) {
      try {
        const result = await this.track(queuedEvent.event);
        if (result.success) {
          flushed++;
        } else {
          // Re-queue if still failing and under retry limit
          if (queuedEvent.retries < QUEUE_CONFIG.MAX_RETRY_ATTEMPTS) {
            this.eventQueue.push({
              ...queuedEvent,
              retries: queuedEvent.retries + 1,
            });
          }
        }
      } catch (error) {
        // Re-queue on error
        if (queuedEvent.retries < QUEUE_CONFIG.MAX_RETRY_ATTEMPTS) {
          this.eventQueue.push({
            ...queuedEvent,
            retries: queuedEvent.retries + 1,
          });
        }
      }
    }

    return flushed;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    provider: string;
    initialized: boolean;
    stats: AnalyticsStats;
  }> {
    return {
      healthy: this.initialized && this.adapter !== null,
      provider: this.config.provider,
      initialized: this.initialized,
      stats: this.getStats(),
    };
  }

  /**
   * Cleanup resources and disconnect
   */
  async cleanup(): Promise<void> {
    this.endSession();

    if (this.queueFlushInterval) {
      clearInterval(this.queueFlushInterval);
      this.queueFlushInterval = undefined;
    }

    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = undefined;
    }

    if (this.adapter) {
      await this.adapter.cleanup();
      this.adapter = null;
    }

    this.users.clear();
    this.eventCounts.clear();
    this.funnels.clear();
    this.cohorts.clear();
    this.eventQueue = [];

    this.initialized = false;
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.adapter) {
      throw new AnalyticsInitializationError(
        'Analytics service not initialized. Call initialize() first.'
      );
    }
  }

  /**
   * Update statistics
   */
  private updateStats(event: AnalyticsEvent): void {
    this.stats.totalEvents++;

    // Update category stats
    if (event.category) {
      this.stats.eventsByCategory[event.category] = (this.stats.eventsByCategory[event.category] || 0) + 1;
    }

    // Track unique users
    if (event.userId) {
      this.users.add(event.userId);
      this.stats.uniqueUsers = this.users.size;
    }

    // Track event frequency
    const count = this.eventCounts.get(event.name) || 0;
    this.eventCounts.set(event.name, count + 1);
  }

  /**
   * Update average session duration
   */
  private updateSessionDuration(duration: number): void {
    const durationSeconds = duration / 1000;
    const totalDuration = this.stats.averageSessionDuration * (this.stats.sessions - 1) + durationSeconds;
    this.stats.averageSessionDuration = Math.round(totalDuration / this.stats.sessions);
  }

  /**
   * Reset session timeout
   */
  private resetSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = setTimeout(() => {
      this.endSession();
    }, SESSION_CONFIG.DEFAULT_TIMEOUT);
  }

  /**
   * Queue event for offline sending
   */
  private queueEvent(event: AnalyticsEvent): AnalyticsResult {
    if (this.eventQueue.length >= (this.config.maxQueueSize || QUEUE_CONFIG.MAX_SIZE)) {
      return {
        success: false,
        error: 'Event queue is full',
        queued: false,
      };
    }

    this.eventQueue.push({
      event,
      queuedAt: Date.now(),
      retries: 0,
    });

    return {
      success: true,
      queued: true,
      eventId: event.eventId,
    };
  }

  /**
   * Start periodic queue flush
   */
  private startQueueFlush(): void {
    this.queueFlushInterval = setInterval(async () => {
      await this.flushQueue();
    }, QUEUE_CONFIG.FLUSH_INTERVAL);
  }

  /**
   * Enable automatic tracking
   */
  private enableAutoTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page views
    window.addEventListener('load', () => {
      this.page({
        url: window.location.href,
        title: document.title,
        referrer: document.referrer,
      });
    });

    // Track clicks (debounced)
    let clickTimeout: NodeJS.Timeout;
    document.addEventListener('click', (e) => {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        const target = e.target as HTMLElement;
        this.track({
          name: 'click',
          category: 'engagement',
          properties: {
            element: target.tagName,
            id: target.id,
            className: target.className,
            text: target.textContent?.slice(0, 100),
          },
        });
      }, 100);
    });
  }
}

/**
 * Create and initialize analytics service
 */
export async function createAnalyticsService(config: AnalyticsConfig): Promise<AnalyticsService> {
  const service = new AnalyticsService(config);
  await service.initialize();
  return service;
}

/**
 * Create analytics service factory
 */
export function createAnalyticsFactory(defaultConfig: AnalyticsConfig) {
  return async (overrides?: Partial<AnalyticsConfig>): Promise<AnalyticsService> => {
    const config = { ...defaultConfig, ...overrides };
    return await createAnalyticsService(config);
  };
}
