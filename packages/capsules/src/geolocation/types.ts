export type LocationProvider = 'browser' | 'ipapi' | 'ipinfo' | 'maxmind';

export interface GeolocationConfig {
  provider: LocationProvider;
  apiKey?: string;
  timeout?: number;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  debug?: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface Location {
  coordinates: Coordinates;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  postalCode?: string;
  timezone?: string;
  timestamp: number;
}

export interface IPLocation {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  continent?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
}

export interface GeolocationStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  errors: number;
}