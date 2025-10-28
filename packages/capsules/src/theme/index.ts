export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { ThemeAdapter, createAdapter } from './adapters';
export { ThemeService, createThemeService } from './service';
import { ThemeService } from './service';
export default ThemeService;
export const themeCapsule = {
  id: 'theme',
  name: 'Theme',
  description: 'Theme and dark mode management',
  icon: '░',
  category: 'ui',
  version: '1.0.0',
  tags: ['theme'],
};