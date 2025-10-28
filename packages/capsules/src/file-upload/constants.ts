/**
 * File Upload Capsule - Constants
 */

import type { FileUploadConfig, FileUploadStats } from './types';

export const DEFAULT_CONFIG: Partial<FileUploadConfig> = {
  uploadDir: './uploads',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  strategy: 'direct',
  chunkSize: 1024 * 1024, // 1MB
  generateThumbnails: false,
  virusScan: false,
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt'],
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
};

export const INITIAL_STATS: FileUploadStats = {
  totalUploads: 0,
  totalBytes: 0,
  failedUploads: 0,
  chunkedUploads: 0,
  byMimeType: {},
  byExtension: {},
  averageFileSize: 0,
  averageUploadTime: 0,
  thumbnailsGenerated: 0,
};

export const DEFAULT_THUMBNAIL_SIZES = [
  { name: 'small', width: 150, height: 150, fit: 'cover' as const },
  { name: 'medium', width: 300, height: 300, fit: 'cover' as const },
  { name: 'large', width: 800, height: 600, fit: 'contain' as const },
];

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

export const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

export const MAX_CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_CHUNK_SIZE = 256 * 1024; // 256KB
