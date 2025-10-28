/**
 * @capsulas/capsules - Storage Capsule
 *
 * File storage with S3, Local, GCS, Azure support
 *
 * @category Storage
 * @version 1.0.0
 */

export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export {
  StorageAdapter,
  S3Adapter,
  GCSAdapter,
  AzureAdapter,
  CloudflareR2Adapter,
  LocalAdapter,
  createAdapter,
} from './adapters';
export { StorageService, createStorageService } from './service';

import { StorageService } from './service';
export default StorageService;

export const storageCapsule = {
  id: 'storage',
  name: 'Storage',
  description: 'File storage with multi-provider support',
  icon: '╩',
  category: 'storage',
  version: '1.0.0',
  tags: ['storage', 'files', 's3', 'upload', 'download'],
};
