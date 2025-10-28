export * from './types';
export * from './errors';
export * from './service';
export { SearchService } from './service';

import { SearchConfig } from './types';
import { SearchService } from './service';

export function createSearchService(config: SearchConfig): SearchService {
  return new SearchService(config);
}
