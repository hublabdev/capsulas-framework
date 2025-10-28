/**
 * File Upload Capsule - Types
 */

export type UploadStrategy = 'direct' | 'chunked' | 'resumable';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface FileUploadConfig {
  uploadDir?: string;
  maxFileSize?: number;
  maxFiles?: number;
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
  strategy?: UploadStrategy;
  chunkSize?: number;
  generateThumbnails?: boolean;
  thumbnailSizes?: ThumbnailSize[];
  virusScan?: boolean;
}

export interface ThumbnailSize {
  name: string;
  width: number;
  height: number;
  fit?: 'cover' | 'contain' | 'fill';
}

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  extension: string;
  uploadedAt: number;
  metadata?: FileMetadata;
  thumbnails?: Thumbnail[];
  url?: string;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  encoding?: string;
  hash?: string;
  uploadedBy?: string;
  tags?: string[];
  [key: string]: any;
}

export interface Thumbnail {
  name: string;
  path: string;
  url?: string;
  width: number;
  height: number;
  size: number;
}

export interface UploadOptions {
  filename?: string;
  metadata?: FileMetadata;
  generateThumbnails?: boolean;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  bytesPerSecond?: number;
  estimatedTimeRemaining?: number;
}

export interface ChunkedUpload {
  uploadId: string;
  filename: string;
  totalChunks: number;
  chunkSize: number;
  uploadedChunks: number[];
  completedAt?: number;
  createdAt: number;
}

export interface ChunkUploadOptions {
  uploadId?: string;
  chunkIndex: number;
  totalChunks: number;
  filename: string;
}

export interface MultipartUploadResult {
  files: UploadedFile[];
  errors: UploadError[];
}

export interface UploadError {
  filename: string;
  error: string;
  code?: string;
}

export interface FileUploadStats {
  totalUploads: number;
  totalBytes: number;
  failedUploads: number;
  chunkedUploads: number;
  byMimeType: Record<string, number>;
  byExtension: Record<string, number>;
  averageFileSize: number;
  averageUploadTime: number;
  thumbnailsGenerated: number;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ProcessingJob {
  id: string;
  fileId: string;
  type: 'thumbnail' | 'virus-scan' | 'metadata-extraction' | 'conversion';
  status: ProcessingStatus;
  progress?: number;
  result?: any;
  error?: string;
  createdAt: number;
  completedAt?: number;
}
