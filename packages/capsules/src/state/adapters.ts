import type { StateConfig } from './types';

export class StateAdapter {
  private storage: Map<string, any> = new Map();

  constructor(private config: StateConfig) {
    if (config.persist && config.storageKey) {
      this.loadFromStorage();
    }
  }

  get(key: string): any {
    return this.storage.get(key);
  }

  set(key: string, value: any): void {
    this.storage.set(key, value);

    if (this.config.persist && this.config.storageKey) {
      this.saveToStorage();
    }
  }

  delete(key: string): void {
    this.storage.delete(key);

    if (this.config.persist && this.config.storageKey) {
      this.saveToStorage();
    }
  }

  clear(): void {
    this.storage.clear();

    if (this.config.persist && this.config.storageKey) {
      this.saveToStorage();
    }
  }

  getAll(): Record<string, any> {
    return Object.fromEntries(this.storage);
  }

  private saveToStorage(): void {
    try {
      const state = this.getAll();
      localStorage.setItem(this.config.storageKey!, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey!);
      if (stored) {
        const state = JSON.parse(stored);
        for (const [key, value] of Object.entries(state)) {
          this.storage.set(key, value);
        }
      }
    } catch (error) {
      console.error('Failed to load state from storage:', error);
    }
  }
}

export function createAdapter(config: StateConfig): StateAdapter {
  return new StateAdapter(config);
}
