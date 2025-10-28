export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red';

export interface ThemeConfig {
  mode?: ThemeMode;
  colorScheme?: ColorScheme;
  customColors?: Record<string, string>;
  persistToStorage?: boolean;
  syncWithSystem?: boolean;
  debug?: boolean;
}

export interface Theme {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  fonts: ThemeFonts;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  [key: string]: string;
}

export interface ThemeFonts {
  sans: string;
  mono: string;
  heading: string;
}

export interface ThemeStats {
  themeChanges: number;
  modeChanges: number;
  colorSchemeChanges: number;
  errors: number;
}