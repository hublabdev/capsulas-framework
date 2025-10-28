export type Locale = string;
export type TranslationKey = string;
export type TranslationValue = string | Record<string, any>;

export interface I18nConfig {
  defaultLocale: Locale;
  supportedLocales: Locale[];
  fallbackLocale?: Locale;
  translations?: Record<Locale, Record<TranslationKey, TranslationValue>>;
  detectBrowserLocale?: boolean;
  debug?: boolean;
}

export interface Translation {
  key: TranslationKey;
  value: TranslationValue;
  locale: Locale;
}

export interface I18nStats {
  totalTranslations: number;
  missingKeys: number;
  localesLoaded: number;
  lookups: number;
  errors: number;
}