import type { RouterConfig, RouterStats } from './types';

export const DEFAULT_CONFIG: Partial<RouterConfig> = {
  mode: 'history',
  basePath: '/',
  debug: false,
};

export const INITIAL_STATS: RouterStats = {
  totalNavigations: 0,
  successfulNavigations: 0,
  failedNavigations: 0,
  backNavigations: 0,
  forwardNavigations: 0,
  errors: 0,
};
