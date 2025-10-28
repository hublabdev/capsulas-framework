# Analytics Capsule

Event tracking and analytics with support for multiple providers (Google Analytics, Mixpanel, Segment, Amplitude).

## Features

- **Multiple Providers**: Google Analytics, Mixpanel, Segment, and Amplitude
- **Event Tracking**: Track custom events with rich properties
- **User Identification**: Identify and track users across sessions
- **Session Management**: Automatic session tracking with configurable timeouts
- **Page View Tracking**: Automatic or manual page view tracking
- **Group/Organization Support**: Associate users with groups
- **Funnels**: Define and track conversion funnels
- **Cohorts**: Segment users into cohorts based on properties
- **Offline Queue**: Queue events when offline, flush when online
- **Event Validation**: Automatic validation and sanitization
- **Auto-tracking**: Optional automatic tracking of page views and clicks
- **Type-safe**: Full TypeScript support with comprehensive types

## Installation

```bash
npm install @capsulas/capsules
```

## Basic Usage

```typescript
import { createAnalyticsService } from '@capsulas/capsules/analytics';

// Initialize with Google Analytics
const analytics = await createAnalyticsService({
  provider: 'google-analytics',
  trackingId: 'G-XXXXXXXXXX',
  debug: true,
});

// Track custom event
await analytics.track({
  name: 'button_click',
  category: 'engagement',
  properties: {
    button_name: 'signup',
    page: 'homepage',
  },
});

// Identify user
await analytics.identify({
  userId: 'user_123',
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium',
});

// Track page view
await analytics.page({
  url: 'https://example.com/products',
  title: 'Products Page',
});

// Cleanup when done
await analytics.cleanup();
```

## Provider-Specific Configuration

### Google Analytics (GA4)

```typescript
const analytics = await createAnalyticsService({
  provider: 'google-analytics',
  trackingId: 'G-XXXXXXXXXX',
  googleAnalytics: {
    measurementId: 'G-XXXXXXXXXX',
    debugMode: false,
    sendPageView: true,
  },
  anonymizeIp: true,
});
```

### Mixpanel

```typescript
const analytics = await createAnalyticsService({
  provider: 'mixpanel',
  mixpanel: {
    token: 'YOUR_PROJECT_TOKEN',
    apiHost: 'https://api.mixpanel.com',
    persistence: 'localStorage',
  },
});
```

### Segment

```typescript
const analytics = await createAnalyticsService({
  provider: 'segment',
  segment: {
    writeKey: 'YOUR_WRITE_KEY',
    apiHost: 'https://api.segment.io',
  },
});
```

### Amplitude

```typescript
const analytics = await createAnalyticsService({
  provider: 'amplitude',
  amplitude: {
    apiKey: 'YOUR_API_KEY',
    endpoint: 'https://api2.amplitude.com/2/httpapi',
  },
});
```

## Advanced Features

### Session Management

```typescript
// Start a session
const sessionId = analytics.startSession('user_123');

// Track events in session
await analytics.track({
  name: 'product_view',
  properties: { product_id: '456' },
});

// End session
analytics.endSession();

// Get current session
const session = analytics.getCurrentSession();
```

### Funnels

```typescript
// Define a funnel
analytics.createFunnel('signup_funnel', 'Sign-up Funnel', [
  'view_landing_page',
  'click_signup_button',
  'fill_signup_form',
  'complete_signup',
]);

// Track funnel steps
await analytics.track({ name: 'view_landing_page' });
analytics.trackFunnelStep('signup_funnel', 'view_landing_page');

// Get funnel data
const funnel = analytics.getFunnel('signup_funnel');
console.log(funnel.conversions);
```

### Cohorts

```typescript
// Define cohorts
analytics.createCohort('premium_users', 'Premium Users', (user) => {
  return user.plan === 'premium';
});

// Get cohort data
const cohort = analytics.getCohort('premium_users');
```

### Offline Queue

```typescript
const analytics = await createAnalyticsService({
  provider: 'google-analytics',
  trackingId: 'G-XXXXXXXXXX',
  enableOfflineQueue: true,
  maxQueueSize: 100,
});

// Events are automatically queued when offline
// Manually flush queue
const flushedCount = await analytics.flushQueue();
```

### Statistics

```typescript
// Get analytics statistics
const stats = analytics.getStats();
console.log(stats);
// {
//   totalEvents: 1234,
//   eventsByCategory: { engagement: 500, ... },
//   uniqueUsers: 456,
//   sessions: 789,
//   averageSessionDuration: 180,
//   pageViews: 2000,
//   queuedEvents: 0,
//   failedEvents: 5,
//   uptime: 3600000
// }
```

## API Reference

### AnalyticsService

#### Methods

- `initialize()` - Initialize the service
- `track(event)` - Track custom event
- `page(pageView)` - Track page view
- `identify(user)` - Identify user
- `group(group)` - Associate user with group
- `startSession(userId?)` - Start new session
- `endSession()` - End current session
- `getCurrentSession()` - Get current session data
- `createFunnel(id, name, steps)` - Define funnel
- `trackFunnelStep(funnelId, step)` - Track funnel step
- `getFunnel(id)` - Get funnel data
- `createCohort(id, name, filter)` - Define cohort
- `getCohort(id)` - Get cohort data
- `getStats()` - Get analytics statistics
- `getConfig()` - Get current configuration
- `flushQueue()` - Flush offline queue
- `healthCheck()` - Check service health
- `cleanup()` - Cleanup and disconnect

## License

MIT
