/**
 * @capsulas/capsules - Queue Capsule
 *
 * Async job queue with Bull/Redis support
 *
 * @category Processing
 * @version 1.0.0
 */

export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { MemoryQueueAdapter, createAdapter } from './adapters';
export { QueueService, createQueueService } from './service';

import { QueueService } from './service';
export default QueueService;

export const queueCapsule = {
  id: 'queue',
  name: 'Queue',
  description: 'Async job queue with retry and scheduling',
  icon: '⍓',
  category: 'processing',
  version: '1.0.0',
  tags: ['queue', 'jobs', 'async', 'bull', 'redis', 'background'],
};
