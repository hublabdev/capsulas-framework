/**
 * Storage Capsule - Types
 */

export type StorageProvider = 's3' | 'gcs' | 'azure' | 'cloudflare-r2' | 'local';
export type FileVisibility = 'public' | 'private';

export interface StorageConfig {
  provider: StorageProvider;
  s3?: S3Config;
  local?: LocalConfig;
  gcs?: GCSConfig;
  azure?: AzureConfig;
  cloudflareR2?: CloudflareR2Config;
  defaultBucket?: string;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  endpoint?: string;
}

export interface LocalConfig {
  basePath: string;
  urlPrefix?: string;
}

export interface GCSConfig {
  projectId: string;
  keyFilename: string;
  bucket: string;
}

export interface AzureConfig {
  accountName: string;
  accountKey: string;
  containerName: string;
}

export interface CloudflareR2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint?: string;
}

export interface StorageObject {
  key: string;
  url: string;
  size: number;
  contentType: string;
  etag?: string;
  lastModified: Date;
  metadata?: Record<string, string>;
}

export interface UploadOptions {
  bucket?: string;
  key?: string;
  contentType?: string;
  visibility?: FileVisibility;
  metadata?: Record<string, string>;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
  etag?: string;
  bucket?: string;
  provider: StorageProvider;
  uploadedAt: number;
}

export interface FileMetadata {
  key: string;
  size: number;
  contentType: string;
  lastModified: Date;
  etag?: string;
  metadata?: Record<string, string>;
}

export interface DownloadOptions {
  bucket?: string;
  versionId?: string;
  range?: { start: number; end: number };
}

export interface DownloadResult {
  data: Buffer;
  metadata: FileMetadata;
}

export interface ListOptions {
  bucket?: string;
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface ListResult {
  files: FileMetadata[];
  continuationToken?: string;
  isTruncated: boolean;
}

export interface DeleteOptions {
  bucket?: string;
  versions?: string[];
}

export interface StorageStats {
  totalUploads: number;
  totalDownloads: number;
  totalDeletes: number;
  bytesUploaded: number;
  bytesDownloaded: number;
  averageUploadTime: number;
  averageDownloadTime: number;
  byProvider: Record<StorageProvider, number>;
  failedOperations: number;
}

export interface SignedUrlOptions {
  bucket?: string;
  expiresIn?: number; // seconds
  contentType?: string;
}

export interface CopyOptions {
  sourceBucket?: string;
  destinationBucket?: string;
  metadata?: Record<string, string>;
}
