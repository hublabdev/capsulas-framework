import type { ThemeConfig, ThemeStats, ThemeColors } from './types';

export const DEFAULT_CONFIG: Partial<ThemeConfig> = {
  mode: 'system',
  colorScheme: 'default',
  persistToStorage: true,
  syncWithSystem: true,
  debug: false,
};

export const INITIAL_STATS: ThemeStats = {
  themeChanges: 0,
  modeChanges: 0,
  colorSchemeChanges: 0,
  errors: 0,
};

export const LIGHT_COLORS: ThemeColors = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  primary: '#18181b',
  secondary: '#71717a',
  accent: '#00ff00',
  muted: '#f4f4f5',
  border: '#e4e4e7',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6',
};

export const DARK_COLORS: ThemeColors = {
  background: '#0a0a0a',
  foreground: '#fafafa',
  primary: '#fafafa',
  secondary: '#a1a1aa',
  accent: '#00ff00',
  muted: '#27272a',
  border: '#27272a',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6',
};
