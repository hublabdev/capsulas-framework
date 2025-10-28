/**
 * Storage Capsule - Constants
 */

import type { StorageConfig, StorageStats } from './types';

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'application/json',
  'application/xml',
  'text/csv',
  'video/mp4',
  'audio/mpeg',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const DEFAULT_CONFIG: Partial<StorageConfig> = {
  maxFileSize: MAX_FILE_SIZE,
  allowedMimeTypes: ALLOWED_MIME_TYPES,
};

export const INITIAL_STATS: StorageStats = {
  totalUploads: 0,
  totalDownloads: 0,
  totalDeletes: 0,
  bytesUploaded: 0,
  bytesDownloaded: 0,
  averageUploadTime: 0,
  averageDownloadTime: 0,
  byProvider: {
    s3: 0,
    gcs: 0,
    azure: 0,
    'cloudflare-r2': 0,
    local: 0,
  },
  failedOperations: 0,
};

export const DEFAULT_SIGNED_URL_EXPIRY = 3600; // 1 hour in seconds

export const MAX_LIST_KEYS = 1000;

export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for multipart uploads

export const MIME_TYPE_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
  txt: 'text/plain',
  json: 'application/json',
  xml: 'application/xml',
  csv: 'text/csv',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
  zip: 'application/zip',
};
