import type { I18nConfig, I18nStats, Locale, TranslationKey, TranslationValue } from './types';
import { createAdapter, I18nAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import { I18nError, I18nErrorType } from './errors';
import { detectBrowserLocale, interpolate, pluralize } from './utils';

export class I18nService {
  private adapter: I18nAdapter | null = null;
  private config: I18nConfig;
  private stats: I18nStats = { ...INITIAL_STATS };
  private initialized = false;
  private currentLocale: Locale;

  constructor(config: I18nConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentLocale = this.config.defaultLocale;

    if (this.config.detectBrowserLocale) {
      const browserLocale = detectBrowserLocale();
      if (this.config.supportedLocales.includes(browserLocale)) {
        this.currentLocale = browserLocale;
      }
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.adapter = createAdapter(this.config);
      this.stats.localesLoaded = this.config.supportedLocales.length;
      this.initialized = true;

      if (this.config.debug) {
        console.log('[I18n] Initialized with locale:', this.currentLocale);
      }
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  t(key: TranslationKey, params?: Record<string, any>): string {
    if (!this.initialized || !this.adapter) {
      throw new I18nError(I18nErrorType.INVALID_CONFIG, 'I18n service not initialized');
    }

    this.stats.lookups++;

    let value = this.adapter.get(this.currentLocale, key);

    if (!value && this.config.fallbackLocale) {
      value = this.adapter.get(this.config.fallbackLocale, key);
    }

    if (!value) {
      this.stats.missingKeys++;
      if (this.config.debug) {
        console.warn(`[I18n] Missing translation for key: ${key}`);
      }
      return key;
    }

    let result: string;

    if (params?.count !== undefined && typeof value === 'object') {
      result = pluralize(value, params.count, this.currentLocale);
    } else if (typeof value === 'string') {
      result = value;
    } else {
      result = key;
    }

    if (params) {
      result = interpolate(result, params);
    }

    this.stats.totalTranslations++;
    return result;
  }

  setLocale(locale: Locale): void {
    if (!this.config.supportedLocales.includes(locale)) {
      throw new I18nError(
        I18nErrorType.INVALID_LOCALE,
        `Locale ${locale} is not supported`
      );
    }

    this.currentLocale = locale;

    if (this.config.debug) {
      console.log('[I18n] Locale changed to:', locale);
    }
  }

  getLocale(): Locale {
    return this.currentLocale;
  }

  getSupportedLocales(): Locale[] {
    return [...this.config.supportedLocales];
  }

  addTranslations(locale: Locale, translations: Record<string, TranslationValue>): void {
    if (!this.initialized || !this.adapter) {
      throw new I18nError(I18nErrorType.INVALID_CONFIG, 'I18n service not initialized');
    }

    for (const [key, value] of Object.entries(translations)) {
      this.adapter.set(locale, key, value);
    }

    if (this.config.debug) {
      console.log(`[I18n] Added ${Object.keys(translations).length} translations for ${locale}`);
    }
  }

  getStats(): I18nStats {
    return { ...this.stats };
  }

  getConfig(): I18nConfig {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    if (this.config.debug) {
      console.log('[I18n] Cleaning up service');
    }
    this.adapter = null;
    this.initialized = false;
  }
}

export async function createI18nService(config: I18nConfig): Promise<I18nService> {
  const service = new I18nService(config);
  await service.initialize();
  return service;
}
