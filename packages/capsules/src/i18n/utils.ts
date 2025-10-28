import type { Locale, TranslationValue } from './types';

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language.split('-')[0];
}

export function interpolate(template: string, params: Record<string, any>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

export function pluralize(
  value: TranslationValue,
  count: number,
  locale: Locale
): string {
  if (typeof value === 'string') return value;

  const rules = getPluralRules(locale);
  const form = rules.select(count);

  return value[form] || value['other'] || String(count);
}

function getPluralRules(locale: Locale): Intl.PluralRules {
  return new Intl.PluralRules(locale);
}

export function flattenTranslations(
  obj: Record<string, any>,
  prefix = ''
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenTranslations(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
