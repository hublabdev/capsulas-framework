export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { I18nAdapter, createAdapter } from './adapters';
export { I18nService, createI18nService } from './service';
import { I18nService } from './service';
export default I18nService;
export const i18nCapsule = {
  id: 'i18n',
  name: 'I18N',
  description: 'Internationalization and localization',
  icon: '✿',
  category: 'i18n',
  version: '1.0.0',
  tags: ['i18n'],
};