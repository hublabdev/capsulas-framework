/**
 * Analytics Capsule - Adapters
 *
 * Platform-specific analytics implementations (Google Analytics, Mixpanel, Segment, Amplitude)
 */

import type {
  AnalyticsConfig,
  AnalyticsEvent,
  PageViewEvent,
  UserProperties,
  GroupProperties,
} from './types';
import { AnalyticsProviderError, AnalyticsAdapterError } from './errors';
import { sanitizeEventName, sanitizeProperties } from './utils';

/**
 * Abstract base class for analytics adapters
 */
export abstract class AnalyticsAdapter {
  protected config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  /**
   * Initialize adapter
   */
  abstract initialize(): Promise<void>;

  /**
   * Track custom event
   */
  abstract track(event: AnalyticsEvent): Promise<boolean>;

  /**
   * Track page view
   */
  abstract page(pageView: PageViewEvent): Promise<boolean>;

  /**
   * Identify user
   */
  abstract identify(user: UserProperties): Promise<boolean>;

  /**
   * Associate user with a group/organization
   */
  abstract group(group: GroupProperties): Promise<boolean>;

  /**
   * Cleanup resources
   */
  abstract cleanup(): Promise<void>;
}

/**
 * Google Analytics Adapter
 * Supports GA4 Measurement Protocol
 */
export class GoogleAnalyticsAdapter extends AnalyticsAdapter {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.config.debug) {
      console.log('[Analytics] Initializing Google Analytics adapter');
    }

    // In production: Load gtag.js script
    // window.dataLayer = window.dataLayer || [];
    // function gtag(){dataLayer.push(arguments);}
    // gtag('js', new Date());
    // gtag('config', this.config.trackingId);

    this.initialized = true;
  }

  async track(event: AnalyticsEvent): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Google Analytics track:', event);
    }

    try {
      // In production: Send event to GA4
      // gtag('event', event.name, {
      //   event_category: event.category,
      //   event_label: event.label,
      //   value: event.value,
      //   ...event.properties
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('google-analytics', 'Track failed', {
        error: error.message,
        event,
      });
    }
  }

  async page(pageView: PageViewEvent): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Google Analytics page:', pageView);
    }

    try {
      // In production: Send pageview to GA4
      // gtag('event', 'page_view', {
      //   page_title: pageView.title,
      //   page_location: pageView.url,
      //   page_referrer: pageView.referrer,
      //   ...pageView.properties
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('google-analytics', 'Page view failed', {
        error: error.message,
        pageView,
      });
    }
  }

  async identify(user: UserProperties): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Google Analytics identify:', user);
    }

    try {
      // In production: Set user properties
      // gtag('set', 'user_properties', {
      //   user_id: user.userId,
      //   ...user
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('google-analytics', 'Identify failed', {
        error: error.message,
        user,
      });
    }
  }

  async group(group: GroupProperties): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Google Analytics group:', group);
    }

    // GA4 doesn't have native group support, store as user property
    // In production:
    // gtag('set', 'user_properties', {
    //   group_id: group.groupId,
    //   group_name: group.name
    // });

    return true;
  }

  async cleanup(): Promise<void> {
    this.initialized = false;
  }
}

/**
 * Mixpanel Adapter
 */
export class MixpanelAdapter extends AnalyticsAdapter {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.config.debug) {
      console.log('[Analytics] Initializing Mixpanel adapter');
    }

    // In production: Initialize Mixpanel
    // mixpanel.init(this.config.mixpanel.token, {
    //   api_host: this.config.mixpanel.apiHost,
    //   persistence: this.config.mixpanel.persistence
    // });

    this.initialized = true;
  }

  async track(event: AnalyticsEvent): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Mixpanel track:', event);
    }

    try {
      // In production: Track event
      // mixpanel.track(event.name, {
      //   ...event.properties,
      //   event_id: event.eventId,
      //   timestamp: event.timestamp
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('mixpanel', 'Track failed', {
        error: error.message,
        event,
      });
    }
  }

  async page(pageView: PageViewEvent): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Mixpanel page:', pageView);
    }

    try {
      // In production: Track page view as event
      // mixpanel.track('Page View', {
      //   url: pageView.url,
      //   title: pageView.title,
      //   referrer: pageView.referrer,
      //   ...pageView.properties
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('mixpanel', 'Page view failed', {
        error: error.message,
        pageView,
      });
    }
  }

  async identify(user: UserProperties): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Mixpanel identify:', user);
    }

    try {
      // In production: Identify user and set properties
      // mixpanel.identify(user.userId);
      // mixpanel.people.set({
      //   $email: user.email,
      //   $name: user.name,
      //   ...user
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('mixpanel', 'Identify failed', {
        error: error.message,
        user,
      });
    }
  }

  async group(group: GroupProperties): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Mixpanel group:', group);
    }

    try {
      // In production: Set group
      // mixpanel.set_group('company', group.groupId);
      // mixpanel.get_group('company', group.groupId).set({
      //   name: group.name,
      //   ...group
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('mixpanel', 'Group failed', {
        error: error.message,
        group,
      });
    }
  }

  async cleanup(): Promise<void> {
    this.initialized = false;
  }
}

/**
 * Segment Adapter
 */
export class SegmentAdapter extends AnalyticsAdapter {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.config.debug) {
      console.log('[Analytics] Initializing Segment adapter');
    }

    // In production: Load Segment snippet
    // analytics.load(this.config.segment.writeKey);

    this.initialized = true;
  }

  async track(event: AnalyticsEvent): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Segment track:', event);
    }

    try {
      // In production: Track event
      // analytics.track(event.name, {
      //   ...event.properties,
      //   event_id: event.eventId,
      //   category: event.category,
      //   label: event.label,
      //   value: event.value
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('segment', 'Track failed', {
        error: error.message,
        event,
      });
    }
  }

  async page(pageView: PageViewEvent): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Segment page:', pageView);
    }

    try {
      // In production: Track page view
      // analytics.page(pageView.title, {
      //   url: pageView.url,
      //   referrer: pageView.referrer,
      //   ...pageView.properties
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('segment', 'Page view failed', {
        error: error.message,
        pageView,
      });
    }
  }

  async identify(user: UserProperties): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Segment identify:', user);
    }

    try {
      // In production: Identify user
      // analytics.identify(user.userId, {
      //   email: user.email,
      //   name: user.name,
      //   ...user
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('segment', 'Identify failed', {
        error: error.message,
        user,
      });
    }
  }

  async group(group: GroupProperties): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Segment group:', group);
    }

    try {
      // In production: Associate with group
      // analytics.group(group.groupId, {
      //   name: group.name,
      //   type: group.type,
      //   ...group
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('segment', 'Group failed', {
        error: error.message,
        group,
      });
    }
  }

  async cleanup(): Promise<void> {
    this.initialized = false;
  }
}

/**
 * Amplitude Adapter
 */
export class AmplitudeAdapter extends AnalyticsAdapter {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.config.debug) {
      console.log('[Analytics] Initializing Amplitude adapter');
    }

    // In production: Initialize Amplitude
    // amplitude.init(this.config.amplitude.apiKey, {
    //   endpoint: this.config.amplitude.endpoint
    // });

    this.initialized = true;
  }

  async track(event: AnalyticsEvent): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Amplitude track:', event);
    }

    try {
      // In production: Log event
      // amplitude.logEvent(event.name, {
      //   ...event.properties,
      //   event_id: event.eventId
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('amplitude', 'Track failed', {
        error: error.message,
        event,
      });
    }
  }

  async page(pageView: PageViewEvent): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Amplitude page:', pageView);
    }

    try {
      // In production: Track page view as event
      // amplitude.logEvent('Page View', {
      //   url: pageView.url,
      //   title: pageView.title,
      //   referrer: pageView.referrer,
      //   ...pageView.properties
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('amplitude', 'Page view failed', {
        error: error.message,
        pageView,
      });
    }
  }

  async identify(user: UserProperties): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Amplitude identify:', user);
    }

    try {
      // In production: Set user ID and properties
      // amplitude.setUserId(user.userId);
      // amplitude.setUserProperties({
      //   email: user.email,
      //   name: user.name,
      //   ...user
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('amplitude', 'Identify failed', {
        error: error.message,
        user,
      });
    }
  }

  async group(group: GroupProperties): Promise<boolean> {
    if (this.config.debug) {
      console.log('[Analytics] Amplitude group:', group);
    }

    try {
      // In production: Set group
      // amplitude.setGroup('company', group.groupId);
      // amplitude.groupIdentify('company', group.groupId, {
      //   name: group.name,
      //   ...group
      // });

      return true;
    } catch (error: any) {
      throw new AnalyticsProviderError('amplitude', 'Group failed', {
        error: error.message,
        group,
      });
    }
  }

  async cleanup(): Promise<void> {
    this.initialized = false;
  }
}

/**
 * Create analytics adapter based on configuration
 */
export function createAdapter(config: AnalyticsConfig): AnalyticsAdapter {
  switch (config.provider) {
    case 'google-analytics':
      return new GoogleAnalyticsAdapter(config);
    case 'mixpanel':
      return new MixpanelAdapter(config);
    case 'segment':
      return new SegmentAdapter(config);
    case 'amplitude':
      return new AmplitudeAdapter(config);
    default:
      throw new AnalyticsAdapterError(
        `Unsupported analytics provider: ${config.provider}`,
        { provider: config.provider }
      );
  }
}
