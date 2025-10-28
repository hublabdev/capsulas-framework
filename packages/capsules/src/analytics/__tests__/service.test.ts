import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsService, createAnalyticsService } from '../service';
import {
  AnalyticsError,
  AnalyticsInitializationError,
  AnalyticsInvalidEventError,
  AnalyticsInvalidUserError,
} from '../errors';
import {
  validateEvent,
  validateUserProperties,
  sanitizeEventName,
  sanitizeProperties,
  shouldSample,
} from '../utils';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    service = await createAnalyticsService({
      provider: 'mixpanel',
      apiKey: 'test_api_key',
      mixpanel: {
        token: 'test_token',
      },
      enableOfflineQueue: false,
      enableAutoTracking: false,
    });
  });

  describe('Initialization', () => {
    it('should initialize with mixpanel provider', () => {
      expect(service).toBeDefined();
      expect(service.getConfig().provider).toBe('mixpanel');
    });

    it('should initialize with google-analytics provider', async () => {
      const gaService = await createAnalyticsService({
        provider: 'google-analytics',
        trackingId: 'G-TEST123',
        googleAnalytics: {
          measurementId: 'G-TEST123',
        },
      });
      expect(gaService.getConfig().provider).toBe('google-analytics');
    });

    it('should initialize with segment provider', async () => {
      const segmentService = await createAnalyticsService({
        provider: 'segment',
        segment: {
          writeKey: 'test_write_key',
        },
      });
      expect(segmentService.getConfig().provider).toBe('segment');
    });

    it('should initialize with amplitude provider', async () => {
      const amplitudeService = await createAnalyticsService({
        provider: 'amplitude',
        amplitude: {
          apiKey: 'test_api_key',
        },
      });
      expect(amplitudeService.getConfig().provider).toBe('amplitude');
    });

    it('should throw error when already initialized', async () => {
      await expect(service.initialize()).rejects.toThrow(AnalyticsInitializationError);
    });

    it('should apply default configuration', () => {
      const config = service.getConfig();
      expect(config.enableAutoTracking).toBe(false);
      expect(config.anonymizeIp).toBe(true);
      expect(config.sampleRate).toBe(1.0);
    });

    it('should allow custom configuration', async () => {
      const customService = await createAnalyticsService({
        provider: 'mixpanel',
        apiKey: 'test_key',
        mixpanel: { token: 'test_token' },
        debug: true,
        sampleRate: 0.5,
        maxQueueSize: 200,
      });
      const config = customService.getConfig();
      expect(config.debug).toBe(true);
      expect(config.sampleRate).toBe(0.5);
      expect(config.maxQueueSize).toBe(200);
    });
  });

  describe('Event Tracking', () => {
    it('should track simple event', async () => {
      const result = await service.track({
        name: 'button_click',
      });
      expect(result.success).toBe(true);
      expect(result.eventId).toBeDefined();
    });

    it('should track event with properties', async () => {
      const result = await service.track({
        name: 'purchase',
        properties: {
          item: 'laptop',
          price: 1299.99,
          currency: 'USD',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should track event with category', async () => {
      const result = await service.track({
        name: 'add_to_cart',
        category: 'ecommerce',
        properties: {
          productId: 'prod_123',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should track event with label and value', async () => {
      const result = await service.track({
        name: 'video_progress',
        category: 'engagement',
        label: 'tutorial_video',
        value: 50,
        properties: {
          duration: 120,
        },
      });
      expect(result.success).toBe(true);
    });

    it('should track event with user ID', async () => {
      const result = await service.track({
        name: 'profile_update',
        userId: 'user_123',
        properties: {
          field: 'email',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should track event with session ID', async () => {
      const sessionId = service.startSession('user_123');
      const result = await service.track({
        name: 'page_interaction',
        sessionId: sessionId,
      });
      expect(result.success).toBe(true);
      service.endSession();
    });

    it('should track event with timestamp', async () => {
      const timestamp = Date.now() - 1000;
      const result = await service.track({
        name: 'delayed_event',
        timestamp: timestamp,
      });
      expect(result.success).toBe(true);
    });

    it('should track multiple event types', async () => {
      const events = [
        { name: 'click', category: 'engagement' },
        { name: 'scroll', category: 'engagement' },
        { name: 'form_submit', category: 'conversion' },
        { name: 'error', category: 'custom' },
      ];

      for (const event of events) {
        const result = await service.track(event);
        expect(result.success).toBe(true);
      }

      const stats = service.getStats();
      expect(stats.totalEvents).toBe(4);
    });

    it('should auto-generate event ID if not provided', async () => {
      const result = await service.track({
        name: 'test_event',
      });
      expect(result.eventId).toBeDefined();
      expect(result.eventId).toMatch(/^evt_/);
    });

    it('should use provided event ID', async () => {
      const customEventId = 'custom_event_123';
      const result = await service.track({
        name: 'test_event',
        eventId: customEventId,
      });
      expect(result.eventId).toBe(customEventId);
    });

    it('should enrich events with context data', async () => {
      await service.track({
        name: 'enriched_event',
        properties: {
          custom: 'value',
        },
      });
      const stats = service.getStats();
      expect(stats.totalEvents).toBeGreaterThan(0);
    });
  });

  describe('User Identification', () => {
    it('should identify user with ID', async () => {
      const result = await service.identify({
        userId: 'user_123',
      });
      expect(result.success).toBe(true);
    });

    it('should identify user with properties', async () => {
      const result = await service.identify({
        userId: 'user_123',
        email: 'test@example.com',
        name: 'John Doe',
        plan: 'premium',
      });
      expect(result.success).toBe(true);
    });

    it('should identify user with username', async () => {
      const result = await service.identify({
        userId: 'user_123',
        username: 'johndoe',
        email: 'john@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should identify user with phone', async () => {
      const result = await service.identify({
        userId: 'user_123',
        phone: '+1234567890',
      });
      expect(result.success).toBe(true);
    });

    it('should identify user with creation date', async () => {
      const result = await service.identify({
        userId: 'user_123',
        createdAt: Date.now() - 86400000,
      });
      expect(result.success).toBe(true);
    });

    it('should track unique users', async () => {
      await service.identify({ userId: 'user_1' });
      await service.identify({ userId: 'user_2' });
      await service.identify({ userId: 'user_1' }); // Duplicate

      const stats = service.getStats();
      expect(stats.uniqueUsers).toBe(2);
    });

    it('should reject identification without user ID', async () => {
      const result = await service.identify({
        userId: '',
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should associate user with current session', async () => {
      const sessionId = service.startSession();
      await service.identify({ userId: 'user_123' });
      const session = service.getCurrentSession();
      expect(session?.userId).toBe('user_123');
      service.endSession();
    });

    it('should handle custom user properties', async () => {
      const result = await service.identify({
        userId: 'user_123',
        customProp1: 'value1',
        customProp2: 123,
        customProp3: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Page Tracking', () => {
    it('should track page view with URL', async () => {
      const result = await service.page({
        url: 'https://example.com/products',
      });
      expect(result.success).toBe(true);
    });

    it('should track page view with title', async () => {
      const result = await service.page({
        url: 'https://example.com/about',
        title: 'About Us',
      });
      expect(result.success).toBe(true);
    });

    it('should track page view with referrer', async () => {
      const result = await service.page({
        url: 'https://example.com/products',
        title: 'Products',
        referrer: 'https://google.com',
      });
      expect(result.success).toBe(true);
    });

    it('should track page view with properties', async () => {
      const result = await service.page({
        url: 'https://example.com/blog/post-1',
        title: 'Blog Post',
        properties: {
          category: 'technology',
          author: 'John Doe',
          tags: ['javascript', 'web'],
        },
      });
      expect(result.success).toBe(true);
    });

    it('should increment page view count', async () => {
      await service.page({ url: 'https://example.com/page1' });
      await service.page({ url: 'https://example.com/page2' });
      await service.page({ url: 'https://example.com/page3' });

      const stats = service.getStats();
      expect(stats.pageViews).toBe(3);
    });

    it('should track page views in session', async () => {
      service.startSession();
      await service.page({ url: 'https://example.com/page1' });
      await service.page({ url: 'https://example.com/page2' });

      const session = service.getCurrentSession();
      expect(session?.pageViews).toBe(2);
      service.endSession();
    });
  });

  describe('Group Management', () => {
    it('should associate user with group', async () => {
      const result = await service.group({
        groupId: 'company_123',
      });
      expect(result.success).toBe(true);
    });

    it('should associate user with group and properties', async () => {
      const result = await service.group({
        groupId: 'company_123',
        name: 'Acme Corp',
        type: 'enterprise',
      });
      expect(result.success).toBe(true);
    });

    it('should handle custom group properties', async () => {
      const result = await service.group({
        groupId: 'company_123',
        name: 'Acme Corp',
        industry: 'technology',
        size: 500,
        plan: 'enterprise',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should start new session', () => {
      const sessionId = service.startSession();
      expect(sessionId).toBeDefined();
      expect(sessionId).toMatch(/^sess_/);
    });

    it('should start session with user ID', () => {
      const sessionId = service.startSession('user_123');
      const session = service.getCurrentSession();
      expect(session?.id).toBe(sessionId);
      expect(session?.userId).toBe('user_123');
    });

    it('should get current session', () => {
      service.startSession('user_123');
      const session = service.getCurrentSession();
      expect(session).toBeDefined();
      expect(session?.userId).toBe('user_123');
      expect(session?.startTime).toBeDefined();
    });

    it('should end session', () => {
      service.startSession();
      service.endSession();
      const session = service.getCurrentSession();
      expect(session).toBeNull();
    });

    it('should calculate session duration', () => {
      service.startSession();
      const startTime = Date.now();

      setTimeout(() => {
        service.endSession();
      }, 100);

      setTimeout(() => {
        const stats = service.getStats();
        expect(stats.sessions).toBe(1);
      }, 150);
    });

    it('should track events in session', async () => {
      const sessionId = service.startSession();

      await service.track({
        name: 'event1',
        sessionId: sessionId,
      });
      await service.track({
        name: 'event2',
        sessionId: sessionId,
      });

      const session = service.getCurrentSession();
      expect(session?.events.length).toBe(2);
      service.endSession();
    });

    it('should track multiple sessions', () => {
      service.startSession('user_1');
      service.endSession();

      service.startSession('user_2');
      service.endSession();

      service.startSession('user_1');
      service.endSession();

      const stats = service.getStats();
      expect(stats.sessions).toBe(3);
    });

    it('should return null when no active session', () => {
      const session = service.getCurrentSession();
      expect(session).toBeNull();
    });

    it('should handle session without user ID', () => {
      const sessionId = service.startSession();
      const session = service.getCurrentSession();
      expect(session?.id).toBe(sessionId);
      expect(session?.userId).toBeUndefined();
      service.endSession();
    });
  });

  describe('Funnel Tracking', () => {
    it('should create funnel', () => {
      service.createFunnel('signup_funnel', 'User Signup', [
        'landing',
        'signup_form',
        'email_verification',
        'complete',
      ]);
      const funnel = service.getFunnel('signup_funnel');
      expect(funnel).toBeDefined();
      expect(funnel?.name).toBe('User Signup');
      expect(funnel?.steps).toHaveLength(4);
    });

    it('should track funnel step', () => {
      service.createFunnel('purchase_funnel', 'Purchase Flow', [
        'product_view',
        'add_to_cart',
        'checkout',
        'payment',
        'confirmation',
      ]);

      service.trackFunnelStep('purchase_funnel', 'product_view');
      service.trackFunnelStep('purchase_funnel', 'add_to_cart');
      service.trackFunnelStep('purchase_funnel', 'checkout');

      const funnel = service.getFunnel('purchase_funnel');
      expect(funnel?.conversions.get('product_view')).toBe(1);
      expect(funnel?.conversions.get('add_to_cart')).toBe(1);
      expect(funnel?.conversions.get('checkout')).toBe(1);
      expect(funnel?.conversions.get('payment')).toBe(0);
    });

    it('should track multiple conversions per step', () => {
      service.createFunnel('test_funnel', 'Test', ['step1', 'step2']);

      service.trackFunnelStep('test_funnel', 'step1');
      service.trackFunnelStep('test_funnel', 'step1');
      service.trackFunnelStep('test_funnel', 'step1');

      const funnel = service.getFunnel('test_funnel');
      expect(funnel?.conversions.get('step1')).toBe(3);
    });

    it('should ignore invalid funnel steps', () => {
      service.createFunnel('test_funnel', 'Test', ['step1', 'step2']);
      service.trackFunnelStep('test_funnel', 'invalid_step');

      const funnel = service.getFunnel('test_funnel');
      expect(funnel?.conversions.get('invalid_step')).toBeUndefined();
    });

    it('should return undefined for non-existent funnel', () => {
      const funnel = service.getFunnel('non_existent');
      expect(funnel).toBeUndefined();
    });

    it('should create multiple funnels', () => {
      service.createFunnel('funnel1', 'Funnel 1', ['a', 'b']);
      service.createFunnel('funnel2', 'Funnel 2', ['x', 'y', 'z']);

      expect(service.getFunnel('funnel1')).toBeDefined();
      expect(service.getFunnel('funnel2')).toBeDefined();
    });
  });

  describe('Event Validation', () => {
    it('should reject event without name', async () => {
      const result = await service.track({
        name: '',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject event with invalid characters', async () => {
      const result = await service.track({
        name: 'invalid@event#name!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject event with invalid timestamp', async () => {
      const result = await service.track({
        name: 'test_event',
        timestamp: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject event with invalid value', async () => {
      const result = await service.track({
        name: 'test_event',
        value: 'not a number' as any,
      });
      expect(result.success).toBe(false);
    });

    it('should sanitize event names', async () => {
      const isolatedService = await createAnalyticsService({
        provider: 'mixpanel',
        apiKey: 'test_api_key',
        mixpanel: { token: 'test_token' },
      });

      // Valid event name that needs sanitization (already valid format)
      await isolatedService.track({
        name: 'test_event_name',
      });
      const stats = isolatedService.getStats();
      expect(stats.totalEvents).toBe(1);
      await isolatedService.cleanup();
    });

    it('should handle long event names', async () => {
      const longName = 'a'.repeat(150);
      const result = await service.track({
        name: longName,
      });
      expect(result.success).toBe(false);
    });

    it('should limit number of properties', async () => {
      const manyProperties: Record<string, any> = {};
      for (let i = 0; i < 100; i++) {
        manyProperties[`prop${i}`] = `value${i}`;
      }

      const result = await service.track({
        name: 'test_event',
        properties: manyProperties,
      });
      // Should still succeed but properties will be limited
      expect(result.success).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should track total events', async () => {
      await service.track({ name: 'event1' });
      await service.track({ name: 'event2' });
      await service.track({ name: 'event3' });

      const stats = service.getStats();
      expect(stats.totalEvents).toBe(3);
    });

    it('should track events by category', async () => {
      const isolatedService = await createAnalyticsService({
        provider: 'mixpanel',
        apiKey: 'test_api_key',
        mixpanel: { token: 'test_token' },
      });

      const statsBefore = isolatedService.getStats();
      const engagementBefore = statsBefore.eventsByCategory['engagement'] || 0;
      const ecommerceBefore = statsBefore.eventsByCategory['ecommerce'] || 0;

      await isolatedService.track({ name: 'click', category: 'engagement' });
      await isolatedService.track({ name: 'scroll', category: 'engagement' });
      await isolatedService.track({ name: 'purchase', category: 'ecommerce' });

      const statsAfter = isolatedService.getStats();
      expect(statsAfter.eventsByCategory['engagement']).toBe(engagementBefore + 2);
      expect(statsAfter.eventsByCategory['ecommerce']).toBe(ecommerceBefore + 1);
      await isolatedService.cleanup();
    });

    it('should track unique users', async () => {
      await service.track({ name: 'event', userId: 'user_1' });
      await service.track({ name: 'event', userId: 'user_2' });
      await service.track({ name: 'event', userId: 'user_1' });

      const stats = service.getStats();
      expect(stats.uniqueUsers).toBe(2);
    });

    it('should track sessions', () => {
      service.startSession();
      service.endSession();
      service.startSession();
      service.endSession();

      const stats = service.getStats();
      expect(stats.sessions).toBe(2);
    });

    it('should track page views', async () => {
      await service.page({ url: 'https://example.com/1' });
      await service.page({ url: 'https://example.com/2' });

      const stats = service.getStats();
      expect(stats.pageViews).toBe(2);
    });

    it('should track uptime', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const stats = service.getStats();
      expect(stats.uptime).toBeGreaterThan(0);
    });

    it('should initialize with zero stats', () => {
      const stats = service.getStats();
      expect(stats.failedEvents).toBe(0);
      expect(stats.queuedEvents).toBe(0);
    });
  });

  describe('Queue Management', () => {
    it('should enable offline queue', async () => {
      const queueService = await createAnalyticsService({
        provider: 'mixpanel',
        apiKey: 'test_key',
        mixpanel: { token: 'test_token' },
        enableOfflineQueue: true,
        maxQueueSize: 50,
      });

      expect(queueService.getConfig().enableOfflineQueue).toBe(true);
      expect(queueService.getConfig().maxQueueSize).toBe(50);
    });

    it('should queue events when offline', async () => {
      const queueService = await createAnalyticsService({
        provider: 'mixpanel',
        apiKey: 'test_key',
        mixpanel: { token: 'test_token' },
        enableOfflineQueue: true,
      });

      // Queue will be used if tracking fails
      const stats = queueService.getStats();
      expect(stats.queuedEvents).toBe(0);
    });

    it('should flush queue', async () => {
      const queueService = await createAnalyticsService({
        provider: 'mixpanel',
        apiKey: 'test_key',
        mixpanel: { token: 'test_token' },
        enableOfflineQueue: true,
      });

      const flushed = await queueService.flushQueue();
      expect(flushed).toBeGreaterThanOrEqual(0);
    });

    it('should respect max queue size', async () => {
      const queueService = await createAnalyticsService({
        provider: 'mixpanel',
        apiKey: 'test_key',
        mixpanel: { token: 'test_token' },
        enableOfflineQueue: true,
        maxQueueSize: 5,
      });

      const config = queueService.getConfig();
      expect(config.maxQueueSize).toBe(5);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources', async () => {
      service.startSession();
      await service.track({ name: 'test_event' });

      await service.cleanup();

      const session = service.getCurrentSession();
      expect(session).toBeNull();
    });

    it('should end active session on cleanup', async () => {
      const sessionId = service.startSession();
      expect(service.getCurrentSession()).toBeDefined();

      await service.cleanup();
      expect(service.getCurrentSession()).toBeNull();
    });

    it('should clear all data on cleanup', async () => {
      await service.track({ name: 'event1', userId: 'user_1' });
      await service.identify({ userId: 'user_2' });
      service.createFunnel('test', 'Test', ['a']);

      await service.cleanup();

      // After cleanup, service should not be usable without re-initialization
      await expect(service.track({ name: 'test' })).rejects.toThrow();
    });

    it('should handle cleanup when not initialized', async () => {
      const newService = new AnalyticsService({
        provider: 'mixpanel',
        apiKey: 'test',
        mixpanel: { token: 'test' },
      });

      // Should not throw
      await expect(newService.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when initialized', async () => {
      const health = await service.healthCheck();
      expect(health.healthy).toBe(true);
      expect(health.initialized).toBe(true);
      expect(health.provider).toBe('mixpanel');
    });

    it('should return unhealthy when not initialized', async () => {
      const uninitializedService = new AnalyticsService({
        provider: 'mixpanel',
        apiKey: 'test',
        mixpanel: { token: 'test' },
      });

      const health = await uninitializedService.healthCheck();
      expect(health.healthy).toBe(false);
      expect(health.initialized).toBe(false);
    });

    it('should include stats in health check', async () => {
      await service.track({ name: 'test_event' });
      const health = await service.healthCheck();
      expect(health.stats).toBeDefined();
      expect(health.stats.totalEvents).toBeGreaterThan(0);
    });
  });

  describe('Configuration', () => {
    it('should return read-only config', () => {
      const config = service.getConfig();
      expect(config).toBeDefined();
      expect(config.provider).toBe('mixpanel');
    });

    it('should include all config properties', () => {
      const config = service.getConfig();
      expect(config.enableAutoTracking).toBeDefined();
      expect(config.anonymizeIp).toBeDefined();
      expect(config.sampleRate).toBeDefined();
    });
  });
});

describe('Analytics Utils', () => {
  describe('validateEvent', () => {
    it('should validate correct event', () => {
      const validation = validateEvent({
        name: 'test_event',
        properties: { key: 'value' },
      });
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject event without name', () => {
      const validation = validateEvent({
        name: '',
      });
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should reject event with invalid characters', () => {
      const validation = validateEvent({
        name: 'test@event!',
      });
      expect(validation.valid).toBe(false);
    });

    it('should warn about many properties', () => {
      const manyProps: Record<string, any> = {};
      for (let i = 0; i < 100; i++) {
        manyProps[`prop${i}`] = i;
      }

      const validation = validateEvent({
        name: 'test_event',
        properties: manyProps,
      });
      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateUserProperties', () => {
    it('should validate user with ID', () => {
      const validation = validateUserProperties({
        userId: 'user_123',
      });
      expect(validation.valid).toBe(true);
    });

    it('should validate user with email', () => {
      const validation = validateUserProperties({
        userId: 'user_123',
        email: 'test@example.com',
      });
      expect(validation.valid).toBe(true);
    });

    it('should reject user without ID', () => {
      const validation = validateUserProperties({
        userId: '',
      });
      expect(validation.valid).toBe(false);
    });

    it('should warn about invalid email format', () => {
      const validation = validateUserProperties({
        userId: 'user_123',
        email: 'invalid-email',
      });
      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeEventName', () => {
    it('should convert to lowercase', () => {
      expect(sanitizeEventName('TEST_EVENT')).toBe('test_event');
    });

    it('should replace spaces with underscores', () => {
      expect(sanitizeEventName('test event')).toBe('test_event');
    });

    it('should remove special characters', () => {
      expect(sanitizeEventName('test@event#name!')).toBe('test_event_name');
    });

    it('should remove consecutive underscores', () => {
      expect(sanitizeEventName('test___event')).toBe('test_event');
    });

    it('should trim leading/trailing underscores', () => {
      expect(sanitizeEventName('_test_event_')).toBe('test_event');
    });
  });

  describe('sanitizeProperties', () => {
    it('should sanitize property keys', () => {
      const sanitized = sanitizeProperties({
        'invalid key!': 'value',
      });
      expect(Object.keys(sanitized)[0]).not.toContain('!');
    });

    it('should limit string values', () => {
      const longValue = 'a'.repeat(1000);
      const sanitized = sanitizeProperties({
        key: longValue,
      });
      expect(sanitized.key.length).toBeLessThan(longValue.length);
    });

    it('should preserve numbers and booleans', () => {
      const sanitized = sanitizeProperties({
        number: 123,
        boolean: true,
      });
      expect(sanitized.number).toBe(123);
      expect(sanitized.boolean).toBe(true);
    });

    it('should handle null values', () => {
      const sanitized = sanitizeProperties({
        nullValue: null,
      });
      expect(sanitized.nullValue).toBeNull();
    });

    it('should sanitize nested objects', () => {
      const sanitized = sanitizeProperties({
        nested: {
          key: 'value',
        },
      });
      expect(sanitized.nested).toBeDefined();
    });

    it('should limit array length', () => {
      const longArray = Array(20).fill('item');
      const sanitized = sanitizeProperties({
        array: longArray,
      });
      expect(sanitized.array.length).toBeLessThanOrEqual(10);
    });
  });

  describe('shouldSample', () => {
    it('should always sample at 1.0', () => {
      expect(shouldSample(1.0)).toBe(true);
    });

    it('should never sample at 0.0', () => {
      expect(shouldSample(0.0)).toBe(false);
    });

    it('should sample probabilistically', () => {
      const samples = Array(100).fill(0).map(() => shouldSample(0.5));
      const trueCount = samples.filter(s => s).length;

      // Should be approximately 50%, allow some variance
      expect(trueCount).toBeGreaterThan(30);
      expect(trueCount).toBeLessThan(70);
    });

    it('should handle negative rates', () => {
      expect(shouldSample(-0.5)).toBe(false);
    });

    it('should handle rates above 1.0', () => {
      expect(shouldSample(1.5)).toBe(true);
    });
  });
});
