import type { GeolocationConfig, Location, IPLocation, Coordinates } from './types';
import { GeolocationError, GeolocationErrorType } from './errors';

export abstract class GeolocationAdapter {
  constructor(protected config: GeolocationConfig) {}
  abstract getCurrentPosition(): Promise<Location>;
  abstract getLocationFromIP(ip: string): Promise<IPLocation>;
}

export class BrowserAdapter extends GeolocationAdapter {
  async getCurrentPosition(): Promise<Location> {
    if (!navigator.geolocation) {
      throw new GeolocationError(
        GeolocationErrorType.UNSUPPORTED_BROWSER,
        'Geolocation not supported'
      );
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          };

          resolve({
            coordinates: coords,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let errorType: GeolocationErrorType;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorType = GeolocationErrorType.PERMISSION_DENIED;
              break;
            case error.POSITION_UNAVAILABLE:
              errorType = GeolocationErrorType.POSITION_UNAVAILABLE;
              break;
            case error.TIMEOUT:
              errorType = GeolocationErrorType.TIMEOUT;
              break;
            default:
              errorType = GeolocationErrorType.API_ERROR;
          }
          reject(new GeolocationError(errorType, error.message));
        },
        {
          enableHighAccuracy: this.config.enableHighAccuracy,
          timeout: this.config.timeout,
          maximumAge: this.config.maximumAge,
        }
      );
    });
  }

  async getLocationFromIP(ip: string): Promise<IPLocation> {
    throw new GeolocationError(
      GeolocationErrorType.API_ERROR,
      'Browser adapter does not support IP lookup'
    );
  }
}

export class IPAPIAdapter extends GeolocationAdapter {
  async getCurrentPosition(): Promise<Location> {
    const ipLocation = await this.getLocationFromIP('');
    return {
      coordinates: {
        latitude: ipLocation.latitude || 0,
        longitude: ipLocation.longitude || 0,
      },
      city: ipLocation.city,
      region: ipLocation.region,
      country: ipLocation.country,
      countryCode: ipLocation.countryCode,
      timezone: ipLocation.timezone,
      timestamp: Date.now(),
    };
  }

  async getLocationFromIP(ip: string): Promise<IPLocation> {
    const url = ip
      ? `https://ipapi.co/${ip}/json/`
      : 'https://ipapi.co/json/';

    const response = await fetch(url);
    if (!response.ok) {
      throw new GeolocationError(
        GeolocationErrorType.API_ERROR,
        'Failed to fetch IP location'
      );
    }

    const data = await response.json();
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country_name,
      countryCode: data.country_code,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    };
  }
}

export function createAdapter(config: GeolocationConfig): GeolocationAdapter {
  switch (config.provider) {
    case 'browser':
      return new BrowserAdapter(config);
    case 'ipapi':
      return new IPAPIAdapter(config);
    default:
      throw new GeolocationError(
        GeolocationErrorType.API_ERROR,
        `Unsupported provider: ${config.provider}`
      );
  }
}
