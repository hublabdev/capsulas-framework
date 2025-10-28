import type {
  StateConfig,
  StateStats,
  StatePath,
  StateValue,
  StateListener,
  StateSelector,
  StateSnapshot,
} from './types';
import { createAdapter, StateAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import { StateError, StateErrorType } from './errors';
import { getByPath, setByPath, deepClone, calculateSize } from './utils';

export class StateService {
  private adapter: StateAdapter | null = null;
  private config: StateConfig;
  private stats: StateStats = { ...INITIAL_STATS };
  private initialized = false;
  private state: Record<string, any> = {};
  private listeners: Map<StatePath, Set<StateListener>> = new Map();
  private history: StateSnapshot[] = [];

  constructor(config: StateConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = { ...this.config.initialState };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.adapter = createAdapter(this.config);

      // Load persisted state if available
      if (this.config.persist) {
        const persisted = this.adapter.getAll();
        if (Object.keys(persisted).length > 0) {
          this.state = { ...this.state, ...persisted };
        }
      }

      this.stats.stateSize = calculateSize(this.state);
      this.initialized = true;

      if (this.config.debug) {
        console.log('[State] Initialized with state:', this.state);
      }
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  get<T = any>(path: StatePath): T {
    if (!this.initialized) {
      throw new StateError(StateErrorType.INVALID_PATH, 'State service not initialized');
    }

    this.stats.totalReads++;
    const value = getByPath(this.state, path);

    if (this.config.debug) {
      console.log(`[State] Get '${path}':`, value);
    }

    return value as T;
  }

  set(path: StatePath, value: StateValue): void {
    if (!this.initialized) {
      throw new StateError(StateErrorType.INVALID_PATH, 'State service not initialized');
    }

    const oldValue = getByPath(this.state, path);

    // Create snapshot
    if (this.config.debug) {
      this.history.push({
        state: deepClone(this.state),
        timestamp: Date.now(),
      });
    }

    // Update state
    this.state = deepClone(this.state);
    setByPath(this.state, path, value);

    this.stats.totalUpdates++;
    this.stats.stateSize = calculateSize(this.state);

    // Persist if enabled
    if (this.config.persist && this.adapter) {
      this.adapter.set(path, value);
    }

    // Notify listeners
    this.notifyListeners(path, value, oldValue);

    if (this.config.debug) {
      console.log(`[State] Set '${path}':`, value);
    }
  }

  update(path: StatePath, updater: (value: any) => any): void {
    const currentValue = this.get(path);
    const newValue = updater(currentValue);
    this.set(path, newValue);
  }

  delete(path: StatePath): void {
    if (!this.initialized) {
      throw new StateError(StateErrorType.INVALID_PATH, 'State service not initialized');
    }

    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const parentPath = keys.join('.');
    const parent = parentPath ? getByPath(this.state, parentPath) : this.state;

    if (parent && typeof parent === 'object') {
      delete parent[lastKey];
      this.stats.totalUpdates++;

      if (this.config.persist && this.adapter) {
        this.adapter.delete(path);
      }

      if (this.config.debug) {
        console.log(`[State] Deleted '${path}'`);
      }
    }
  }

  on(path: StatePath, listener: StateListener): () => void {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }

    this.listeners.get(path)!.add(listener);
    this.stats.listenerCount = this.countListeners();

    return () => {
      const set = this.listeners.get(path);
      if (set) {
        set.delete(listener);
        if (set.size === 0) {
          this.listeners.delete(path);
        }
        this.stats.listenerCount = this.countListeners();
      }
    };
  }

  select<T = any>(selector: StateSelector<T>): T {
    if (!this.initialized) {
      throw new StateError(StateErrorType.SELECTOR_ERROR, 'State service not initialized');
    }

    try {
      this.stats.totalReads++;
      return selector(this.state);
    } catch (error) {
      this.stats.errors++;
      throw new StateError(
        StateErrorType.SELECTOR_ERROR,
        `Selector failed: ${error}`
      );
    }
  }

  getSnapshot(): StateSnapshot {
    return {
      state: deepClone(this.state),
      timestamp: Date.now(),
    };
  }

  restoreSnapshot(snapshot: StateSnapshot): void {
    this.state = deepClone(snapshot.state);
    this.stats.totalUpdates++;
    this.stats.stateSize = calculateSize(this.state);

    if (this.config.debug) {
      console.log('[State] Restored snapshot from:', new Date(snapshot.timestamp));
    }
  }

  getHistory(): StateSnapshot[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  private notifyListeners(path: StatePath, value: StateValue, oldValue: StateValue): void {
    const listeners = this.listeners.get(path);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(value, oldValue);
        } catch (error) {
          this.stats.errors++;
          if (this.config.debug) {
            console.error('[State] Listener error:', error);
          }
        }
      });
    }
  }

  private countListeners(): number {
    let count = 0;
    for (const set of this.listeners.values()) {
      count += set.size;
    }
    return count;
  }

  getStats(): StateStats {
    return { ...this.stats };
  }

  getConfig(): StateConfig {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    if (this.config.debug) {
      console.log('[State] Cleaning up service');
    }

    this.listeners.clear();
    this.history = [];
    this.adapter = null;
    this.initialized = false;
  }
}

export async function createStateService(config: StateConfig): Promise<StateService> {
  const service = new StateService(config);
  await service.initialize();
  return service;
}
