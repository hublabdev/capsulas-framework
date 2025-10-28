export * from './types';
export * from './errors';
export * from './service';
export { SMSService } from './service';

import { SMSConfig } from './types';
import { SMSService } from './service';

export function createSMSService(config: SMSConfig): SMSService {
  return new SMSService(config);
}
