export * from './types';
export * from './errors';
export * from './service';
export { PushNotificationsService } from './service';

import { PushNotificationsConfig } from './types';
import { PushNotificationsService } from './service';

export function createPushNotificationsService(config: PushNotificationsConfig): PushNotificationsService {
  return new PushNotificationsService(config);
}
