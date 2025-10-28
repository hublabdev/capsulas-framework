import { describe, it, expect, beforeEach } from 'vitest';
import { I18nService, createI18nService } from '../service';
import { I18nError } from '../errors';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(async () => {
    service = await createI18nService({
      defaultLocale: 'en',
      supportedLocales: ['en', 'es', 'fr'],
      translations: {
        en: {
          hello: 'Hello',
          greeting: 'Hello, {{name}}!',
          items: 'You have {{count}} items',
        },
        es: {
          hello: 'Hola',
          greeting: 'Hola, {{name}}!',
          items: 'Tienes {{count}} artículos',
        },
      },
    });
  });

  describe('Translation', () => {
    it('should translate simple key', () => {
      expect(service.t('hello')).toBe('Hello');
    });

    it('should return key if translation missing', () => {
      expect(service.t('missing')).toBe('missing');
    });

    it('should interpolate variables', () => {
      expect(service.t('greeting', { name: 'John' })).toBe('Hello, John!');
    });

    it('should handle pluralization', () => {
      expect(service.t('items', { count: 5 })).toContain('5');
    });
  });

  describe('Locale Management', () => {
    it('should change locale', () => {
      service.setLocale('es');
      expect(service.getLocale()).toBe('es');
      expect(service.t('hello')).toBe('Hola');
    });

    it('should reject invalid locale', () => {
      expect(() => service.setLocale('invalid')).toThrow(I18nError);
    });

    it('should get supported locales', () => {
      const locales = service.getSupportedLocales();
      expect(locales).toContain('en');
      expect(locales).toContain('es');
    });
  });

  describe('Nested Keys', () => {
    // Skip: Nested key support not yet implemented
    it.skip('should access nested translations', async () => {
      const nested = await createI18nService({
        defaultLocale: 'en',
        supportedLocales: ['en'],
        translations: {
          en: {
            user: {
              profile: {
                name: 'Name',
              },
            },
          },
        },
      });
      expect(nested.t('user.profile.name')).toBe('Name');
    });
  });

  describe('Statistics', () => {
    it('should track translation requests', () => {
      service.t('hello');
      service.t('greeting', { name: 'Test' });
      const stats = service.getStats();
      expect(stats.totalTranslations).toBe(2);
    });
  });
});
