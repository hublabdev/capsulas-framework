import type { I18nConfig, Locale, TranslationValue } from './types';

export class I18nAdapter {
  private translations: Map<Locale, Map<string, TranslationValue>> = new Map();

  constructor(private config: I18nConfig) {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    if (!this.config.translations) return;

    for (const [locale, trans] of Object.entries(this.config.translations)) {
      const map = new Map(Object.entries(trans));
      this.translations.set(locale, map);
    }
  }

  get(locale: Locale, key: string): TranslationValue | null {
    const localeTranslations = this.translations.get(locale);
    if (!localeTranslations) return null;
    return localeTranslations.get(key) || null;
  }

  set(locale: Locale, key: string, value: TranslationValue): void {
    let localeTranslations = this.translations.get(locale);
    if (!localeTranslations) {
      localeTranslations = new Map();
      this.translations.set(locale, localeTranslations);
    }
    localeTranslations.set(key, value);
  }

  has(locale: Locale): boolean {
    return this.translations.has(locale);
  }

  getAll(locale: Locale): Record<string, TranslationValue> {
    const localeTranslations = this.translations.get(locale);
    if (!localeTranslations) return {};
    return Object.fromEntries(localeTranslations);
  }
}

export function createAdapter(config: I18nConfig): I18nAdapter {
  return new I18nAdapter(config);
}
