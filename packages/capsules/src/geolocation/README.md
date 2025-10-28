# Geolocation Capsule ❯

GPS and IP-based geolocation services with support for browser geolocation API and IP lookup providers.

## Features

- Browser geolocation API
- IP-based location lookup
- Multiple providers (IP-API, IPInfo, MaxMind)
- Coordinates and address
- Timezone detection
- Distance calculation
- Location caching
- High accuracy mode

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

### Browser Geolocation

```typescript
import { createGeolocationService } from '@capsulas/capsules/geolocation';

const geo = await createGeolocationService({
  provider: 'browser',
  enableHighAccuracy: true,
  timeout: 10000,
});

// Get current position
const location = await geo.getCurrentPosition();
console.log(location.coordinates);
// { latitude: 37.7749, longitude: -122.4194, accuracy: 10 }
```

### IP-based Geolocation

```typescript
const geo = await createGeolocationService({
  provider: 'ipapi',
  apiKey: 'YOUR_API_KEY',
});

// Get location from IP
const location = await geo.getLocationFromIP('8.8.8.8');
console.log(location);
// { city: 'Mountain View', country: 'US', latitude: 37.4056, longitude: -122.0775 }
```

## License

MIT
