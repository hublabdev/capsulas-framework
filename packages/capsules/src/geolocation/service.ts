import type { GeolocationConfig, GeolocationStats, Location, IPLocation } from './types';
import { createAdapter, GeolocationAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import { GeolocationError } from './errors';

export class GeolocationService {
  private adapter: GeolocationAdapter | null = null;
  private config: GeolocationConfig;
  private stats: GeolocationStats = { ...INITIAL_STATS };
  private initialized = false;
  private cache: Map<string, Location> = new Map();

  constructor(config: GeolocationConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.adapter = createAdapter(this.config);
      this.initialized = true;

      if (this.config.debug) {
        console.log('[Geolocation] Initialized with provider:', this.config.provider);
      }
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  async getCurrentPosition(): Promise<Location> {
    if (!this.initialized || !this.adapter) await this.initialize();

    const cacheKey = 'current';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < (this.config.maximumAge || 0)) {
      this.stats.cacheHits++;
      return cached;
    }

    try {
      this.stats.totalRequests++;
      const location = await this.adapter!.getCurrentPosition();
      this.stats.successfulRequests++;
      this.cache.set(cacheKey, location);

      if (this.config.debug) {
        console.log('[Geolocation] Position:', location.coordinates);
      }

      return location;
    } catch (error) {
      this.stats.errors++;
      this.stats.failedRequests++;
      throw error;
    }
  }

  async getLocationFromIP(ip: string): Promise<IPLocation> {
    if (!this.initialized || !this.adapter) await this.initialize();

    try {
      this.stats.totalRequests++;
      const location = await this.adapter!.getLocationFromIP(ip);
      this.stats.successfulRequests++;

      if (this.config.debug) {
        console.log('[Geolocation] IP location:', location.city, location.country);
      }

      return location;
    } catch (error) {
      this.stats.errors++;
      this.stats.failedRequests++;
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getStats(): GeolocationStats {
    return { ...this.stats };
  }

  getConfig(): GeolocationConfig {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    if (this.config.debug) {
      console.log('[Geolocation] Cleaning up service');
    }
    this.adapter = null;
    this.initialized = false;
    this.cache.clear();
  }
}

export async function createGeolocationService(
  config: GeolocationConfig
): Promise<GeolocationService> {
  const service = new GeolocationService(config);
  await service.initialize();
  return service;
}
