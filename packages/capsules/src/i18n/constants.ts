import type { I18nConfig, I18nStats } from './types';

export const DEFAULT_CONFIG: Partial<I18nConfig> = {
  fallbackLocale: 'en',
  detectBrowserLocale: true,
  debug: false,
};

export const INITIAL_STATS: I18nStats = {
  totalTranslations: 0,
  missingKeys: 0,
  localesLoaded: 0,
  lookups: 0,
  errors: 0,
};
