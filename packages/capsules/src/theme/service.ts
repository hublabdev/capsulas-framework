import type { ThemeConfig, ThemeStats, Theme, ThemeMode, ColorScheme } from './types';
import { createAdapter, ThemeAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import { ThemeError, ThemeErrorType } from './errors';
import { saveToStorage, loadFromStorage } from './utils';

export class ThemeService {
  private adapter: ThemeAdapter | null = null;
  private config: ThemeConfig;
  private stats: ThemeStats = { ...INITIAL_STATS };
  private initialized = false;
  private currentTheme: Theme | null = null;
  private unwatchSystem: (() => void) | null = null;
  private listeners: Set<(theme: Theme) => void> = new Set();

  constructor(config: ThemeConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.adapter = createAdapter(this.config);

      // Load from storage if enabled
      if (this.config.persistToStorage) {
        const saved = loadFromStorage('theme-preferences');
        if (saved) {
          this.config.mode = saved.mode || this.config.mode;
          this.config.colorScheme = saved.colorScheme || this.config.colorScheme;
        }
      }

      // Build initial theme
      this.currentTheme = this.adapter.buildTheme(
        this.config.mode!,
        this.config.colorScheme!,
        this.config.customColors
      );

      // Apply theme
      this.adapter.applyTheme(this.currentTheme);

      // Watch system theme changes
      if (this.config.syncWithSystem) {
        this.unwatchSystem = this.adapter.watchSystemTheme(() => {
          if (this.config.mode === 'system') {
            this.applyCurrentTheme();
          }
        });
      }

      this.initialized = true;

      if (this.config.debug) {
        console.log('[Theme] Initialized with mode:', this.config.mode);
      }
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  setMode(mode: ThemeMode): void {
    if (!this.initialized || !this.adapter) {
      throw new ThemeError(ThemeErrorType.INVALID_MODE, 'Theme service not initialized');
    }

    this.config.mode = mode;
    this.stats.modeChanges++;
    this.applyCurrentTheme();

    if (this.config.persistToStorage) {
      this.persistPreferences();
    }

    if (this.config.debug) {
      console.log('[Theme] Mode changed to:', mode);
    }
  }

  setColorScheme(colorScheme: ColorScheme): void {
    if (!this.initialized || !this.adapter) {
      throw new ThemeError(ThemeErrorType.INVALID_COLOR_SCHEME, 'Theme service not initialized');
    }

    this.config.colorScheme = colorScheme;
    this.stats.colorSchemeChanges++;
    this.applyCurrentTheme();

    if (this.config.persistToStorage) {
      this.persistPreferences();
    }

    if (this.config.debug) {
      console.log('[Theme] Color scheme changed to:', colorScheme);
    }
  }

  setCustomColors(colors: Record<string, string>): void {
    if (!this.initialized || !this.adapter) {
      throw new ThemeError(ThemeErrorType.INVALID_COLORS, 'Theme service not initialized');
    }

    this.config.customColors = colors;
    this.applyCurrentTheme();

    if (this.config.debug) {
      console.log('[Theme] Custom colors applied');
    }
  }

  private applyCurrentTheme(): void {
    if (!this.adapter) return;

    this.currentTheme = this.adapter.buildTheme(
      this.config.mode!,
      this.config.colorScheme!,
      this.config.customColors
    );

    this.adapter.applyTheme(this.currentTheme);
    this.stats.themeChanges++;

    // Notify listeners
    this.listeners.forEach((listener) => listener(this.currentTheme!));
  }

  private persistPreferences(): void {
    saveToStorage('theme-preferences', {
      mode: this.config.mode,
      colorScheme: this.config.colorScheme,
    });
  }

  getTheme(): Theme {
    if (!this.currentTheme) {
      throw new ThemeError(ThemeErrorType.LOAD_FAILED, 'Theme not initialized');
    }
    return { ...this.currentTheme };
  }

  getMode(): string {
    const mode = this.config.mode || 'light';
    // If system mode, resolve to actual system preference
    if (mode === 'system') {
      // In test/node environment, default to light
      if (typeof window === 'undefined') return 'light';
      // In browser, check system preference
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
  }

  getColorScheme(): string {
    return this.config.colorScheme || 'default';
  }

  getColors(): Record<string, string> {
    return this.currentTheme?.colors || {};
  }

  toggle(): void {
    const currentMode = this.config.mode || 'light';
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    this.setMode(newMode);
  }

  on(_event: 'change', listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getStats(): ThemeStats {
    return { ...this.stats };
  }

  getConfig(): ThemeConfig {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    if (this.config.debug) {
      console.log('[Theme] Cleaning up service');
    }

    if (this.unwatchSystem) {
      this.unwatchSystem();
      this.unwatchSystem = null;
    }

    this.listeners.clear();
    this.adapter = null;
    this.initialized = false;
  }
}

export async function createThemeService(config: ThemeConfig): Promise<ThemeService> {
  const service = new ThemeService(config);
  await service.initialize();
  return service;
}
