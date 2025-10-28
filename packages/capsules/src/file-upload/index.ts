/**
 * @capsulas/capsules - File Upload Capsule
 *
 * File upload with direct, chunked, and resumable upload strategies
 *
 * @category Storage
 * @version 1.0.0
 */

export type * from './types';
export * from './errors';
export * from './constants';
export * from './utils';
export { FileUploadAdapter, createAdapter } from './adapters';
export { FileUploadService, createFileUploadService } from './service';

import { FileUploadService } from './service';
export default FileUploadService;

export const fileUploadCapsule = {
  id: 'file-upload',
  name: 'File Upload',
  description: 'File upload with multiple strategies',
  icon: '⭡',
  category: 'storage',
  version: '1.0.0',
  tags: ['upload', 'files', 'chunked', 'multipart', 'storage'],
};
