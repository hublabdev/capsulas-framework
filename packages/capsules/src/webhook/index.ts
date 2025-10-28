export * from './types';
export * from './errors';
export * from './service';
export { WebhookService } from './service';

import { WebhookConfig } from './types';
import { WebhookService } from './service';

export function createWebhookService(config?: WebhookConfig): WebhookService {
  return new WebhookService(config);
}
