export * from './types';
export * from './errors';
export * from './constants';
export * from './service';
export { CronService } from './service';

import { CronConfig } from './types';
import { CronService } from './service';

export function createCronService(config?: CronConfig): CronService {
  return new CronService(config);
}
