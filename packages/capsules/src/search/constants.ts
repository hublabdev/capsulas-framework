/**
 * Search Capsule - Constants
 */

import { SearchConfig, SearchStats } from './types';

export const DEFAULT_SEARCH_CONFIG: Partial<SearchConfig> = {
  indexName: 'default_index'
};

export const INITIAL_STATS: SearchStats = {
  totalSearches: 0,
  totalIndexed: 0,
  totalDeleted: 0,
  averageLatency: 0
};

export const DEFAULT_HITS_PER_PAGE = 20;
export const MAX_HITS_PER_PAGE = 1000;
export const DEFAULT_PAGE = 1;

export const SEARCH_TIMEOUTS = {
  query: 5000,
  index: 30000,
  delete: 10000
};
