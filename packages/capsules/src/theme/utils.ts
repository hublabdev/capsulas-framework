export function detectSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyThemeColors(colors: Record<string, string>): void {
  const root = document.documentElement;

  for (const [key, value] of Object.entries(colors)) {
    root.style.setProperty(`--color-${key}`, value);
  }
}

export function saveToStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

export function loadFromStorage(key: string): any | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
}
