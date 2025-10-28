import type { RouterConfig } from './types';

export abstract class RouterAdapter {
  constructor(protected config: RouterConfig) {}

  abstract push(path: string): void;
  abstract replace(path: string): void;
  abstract back(): void;
  abstract forward(): void;
  abstract getCurrentPath(): string;
  abstract listen(callback: (path: string) => void): () => void;
}

export class HistoryAdapter extends RouterAdapter {
  push(path: string): void {
    const fullPath = this.config.basePath + path;
    window.history.pushState({}, '', fullPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  replace(path: string): void {
    const fullPath = this.config.basePath + path;
    window.history.replaceState({}, '', fullPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  back(): void {
    window.history.back();
  }

  forward(): void {
    window.history.forward();
  }

  getCurrentPath(): string {
    const path = window.location.pathname;
    return path.startsWith(this.config.basePath!)
      ? path.slice(this.config.basePath!.length)
      : path;
  }

  listen(callback: (path: string) => void): () => void {
    const handler = () => {
      callback(this.getCurrentPath());
    };

    window.addEventListener('popstate', handler);

    return () => {
      window.removeEventListener('popstate', handler);
    };
  }
}

export class HashAdapter extends RouterAdapter {
  push(path: string): void {
    window.location.hash = path;
  }

  replace(path: string): void {
    const url = window.location.href.split('#')[0];
    window.location.replace(url + '#' + path);
  }

  back(): void {
    window.history.back();
  }

  forward(): void {
    window.history.forward();
  }

  getCurrentPath(): string {
    return window.location.hash.slice(1) || '/';
  }

  listen(callback: (path: string) => void): () => void {
    const handler = () => {
      callback(this.getCurrentPath());
    };

    window.addEventListener('hashchange', handler);

    return () => {
      window.removeEventListener('hashchange', handler);
    };
  }
}

export class MemoryAdapter extends RouterAdapter {
  private currentPath: string;
  private history: string[] = [];
  private historyIndex: number = 0;
  private listeners: Set<(path: string) => void> = new Set();

  constructor(config: RouterConfig) {
    super(config);
    this.currentPath = config.initialPath || '/';
    this.history.push(this.currentPath);
  }

  push(path: string): void {
    // Remove any forward history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(path);
    this.historyIndex++;
    this.currentPath = path;

    // Notify listeners
    this.listeners.forEach(listener => listener(path));
  }

  replace(path: string): void {
    this.history[this.historyIndex] = path;
    this.currentPath = path;

    // Notify listeners
    this.listeners.forEach(listener => listener(path));
  }

  back(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentPath = this.history[this.historyIndex];

      // Notify listeners
      this.listeners.forEach(listener => listener(this.currentPath));
    }
  }

  forward(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.currentPath = this.history[this.historyIndex];

      // Notify listeners
      this.listeners.forEach(listener => listener(this.currentPath));
    }
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  listen(callback: (path: string) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export function createAdapter(config: RouterConfig): RouterAdapter {
  if (config.mode === 'memory') {
    return new MemoryAdapter(config);
  }
  return config.mode === 'hash'
    ? new HashAdapter(config)
    : new HistoryAdapter(config);
}
