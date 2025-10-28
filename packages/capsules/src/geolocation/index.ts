export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { GeolocationAdapter, createAdapter } from './adapters';
export { GeolocationService, createGeolocationService } from './service';
import { GeolocationService } from './service';
export default GeolocationService;
export const geolocationCapsule = {
  id: 'geolocation',
  name: 'Geolocation',
  description: 'GPS and IP geolocation services',
  icon: '❯',
  category: 'location',
  version: '1.0.0',
  tags: ['geolocation'],
};