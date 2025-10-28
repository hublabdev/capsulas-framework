import type { GeolocationConfig, GeolocationStats } from './types';

export const DEFAULT_CONFIG: Partial<GeolocationConfig> = {
  provider: 'browser',
  timeout: 10000,
  enableHighAccuracy: false,
  maximumAge: 0,
  debug: false,
};

export const INITIAL_STATS: GeolocationStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  errors: 0,
};
