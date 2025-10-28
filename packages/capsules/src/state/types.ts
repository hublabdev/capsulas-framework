export type StateValue = any;
export type StatePath = string;
export type StateListener = (value: StateValue, oldValue: StateValue) => void;
export type StateSelector<T = any> = (state: any) => T;

export interface StateConfig {
  initialState?: Record<string, any>;
  persist?: boolean;
  storageKey?: string;
  debug?: boolean;
}

export interface StateChange {
  path: StatePath;
  value: StateValue;
  oldValue: StateValue;
  timestamp: number;
}

export interface StateSnapshot {
  state: Record<string, any>;
  timestamp: number;
}

export interface StateStats {
  totalUpdates: number;
  totalReads: number;
  listenerCount: number;
  stateSize: number;
  errors: number;
}