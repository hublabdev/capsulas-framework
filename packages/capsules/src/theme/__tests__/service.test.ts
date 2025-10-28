import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeService, createThemeService } from '../service';
import { ThemeError } from '../errors';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(async () => {
    service = await createThemeService({
      mode: 'light',
      colorScheme: 'default',
    });
  });

  describe('Theme Mode', () => {
    it('should set theme mode', () => {
      service.setMode('dark');
      expect(service.getMode()).toBe('dark');
    });

    it('should toggle theme', () => {
      const initialMode = service.getMode();
      service.toggle();
      expect(service.getMode()).not.toBe(initialMode);
    });

    it('should detect system theme', () => {
      service.setMode('system');
      const mode = service.getMode();
      expect(['light', 'dark']).toContain(mode);
    });
  });

  describe('Color Schemes', () => {
    it('should set color scheme', () => {
      service.setColorScheme('blue');
      expect(service.getColorScheme()).toBe('blue');
    });

    it('should get theme colors', () => {
      const colors = service.getColors();
      expect(colors).toBeDefined();
      expect(colors.primary).toBeDefined();
    });
  });

  describe('Custom Colors', () => {
    it('should set custom colors', () => {
      service.setCustomColors({
        primary: '#FF0000',
        secondary: '#00FF00',
      });
      const colors = service.getColors();
      expect(colors.primary).toBe('#FF0000');
    });
  });

  describe('Listeners', () => {
    it('should notify on theme change', () => {
      let notified = false;
      service.on('change', () => {
        notified = true;
      });
      service.setMode('dark');
      expect(notified).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should track theme changes', () => {
      service.setMode('dark');
      service.setMode('light');
      const stats = service.getStats();
      expect(stats.themeChanges).toBeGreaterThan(0);
    });
  });
});
