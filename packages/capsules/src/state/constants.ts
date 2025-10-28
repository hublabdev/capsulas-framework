import type { StateConfig, StateStats } from './types';

export const DEFAULT_CONFIG: Partial<StateConfig> = {
  initialState: {},
  persist: false,
  storageKey: 'app-state',
  debug: false,
};

export const INITIAL_STATS: StateStats = {
  totalUpdates: 0,
  totalReads: 0,
  listenerCount: 0,
  stateSize: 0,
  errors: 0,
};
