import type { ThemeConfig, Theme, ThemeMode } from './types';
import { LIGHT_COLORS, DARK_COLORS } from './constants';
import { detectSystemTheme, applyThemeColors } from './utils';

export class ThemeAdapter {
  private mediaQuery: MediaQueryList | null = null;

  constructor(private _config: ThemeConfig) {
    if (this._config.syncWithSystem && typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }
  }

  getEffectiveMode(mode: ThemeMode): 'light' | 'dark' {
    if (mode === 'system') {
      return detectSystemTheme();
    }
    return mode;
  }

  buildTheme(mode: ThemeMode, colorScheme: string, customColors?: Record<string, string>): Theme {
    const effectiveMode = this.getEffectiveMode(mode);
    const baseColors = effectiveMode === 'dark' ? { ...DARK_COLORS } : { ...LIGHT_COLORS };

    if (customColors) {
      Object.assign(baseColors, customColors);
    }

    return {
      mode,
      colorScheme: colorScheme as any,
      colors: baseColors,
      fonts: {
        sans: 'system-ui, sans-serif',
        mono: '"IBM Plex Mono", monospace',
        heading: 'system-ui, sans-serif',
      },
    };
  }

  applyTheme(theme: Theme): void {
    applyThemeColors(theme.colors);

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', this.getEffectiveMode(theme.mode));
      document.documentElement.setAttribute('data-color-scheme', theme.colorScheme);
    }
  }

  watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
    if (!this.mediaQuery) {
      return () => {};
    }

    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };

    this.mediaQuery.addEventListener('change', handler);

    return () => {
      this.mediaQuery?.removeEventListener('change', handler);
    };
  }
}

export function createAdapter(config: ThemeConfig): ThemeAdapter {
  return new ThemeAdapter(config);
}
