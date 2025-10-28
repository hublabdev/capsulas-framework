/**
 * Storage Capsule - Service
 */

import type {
  StorageConfig,
  UploadOptions,
  UploadResult,
  DownloadOptions,
  DownloadResult,
  ListOptions,
  ListResult,
  DeleteOptions,
  StorageStats,
  SignedUrlOptions,
  CopyOptions,
} from './types';
import { createAdapter, StorageAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import {
  validateFileSize,
  validateMimeType,
  getMimeType,
  generateStorageKey,
} from './utils';
import {
  createFileSizeError,
  createMimeTypeError,
  createUploadError,
  createDownloadError,
} from './errors';

export class StorageService {
  private adapter: StorageAdapter | null = null;
  private config: StorageConfig;
  private stats: StorageStats = { ...INITIAL_STATS };
  private initialized = false;
  private uploadTimes: number[] = [];
  private downloadTimes: number[] = [];

  constructor(config: StorageConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.adapter = createAdapter(this.config);
    this.initialized = true;
  }

  async upload(
    data: Buffer | string,
    filename?: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

    // Validate file size
    if (!validateFileSize(buffer.length, this.config.maxFileSize)) {
      throw createFileSizeError(buffer.length, this.config.maxFileSize!);
    }

    // Determine content type
    const contentType = options.contentType || (filename ? getMimeType(filename) : 'application/octet-stream');

    // Validate MIME type
    if (!validateMimeType(contentType, this.config.allowedMimeTypes)) {
      throw createMimeTypeError(contentType, this.config.allowedMimeTypes!);
    }

    // Generate key if not provided
    if (!options.key && filename) {
      options.key = generateStorageKey(filename);
    }

    options.contentType = contentType;

    const startTime = Date.now();
    try {
      const result = await this.adapter!.upload(buffer, options);
      const uploadTime = Date.now() - startTime;

      this.updateUploadStats(result.size, uploadTime);
      return result;
    } catch (error) {
      this.stats.failedOperations++;
      throw createUploadError('Upload failed', error as Error);
    }
  }

  async download(key: string, options: DownloadOptions = {}): Promise<DownloadResult> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const startTime = Date.now();
    try {
      const result = await this.adapter!.download(key, options);
      const downloadTime = Date.now() - startTime;

      this.updateDownloadStats(result.data.length, downloadTime);
      return result;
    } catch (error) {
      this.stats.failedOperations++;
      throw createDownloadError('Download failed', error as Error);
    }
  }

  async delete(key: string, options: DeleteOptions = {}): Promise<boolean> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    try {
      const result = await this.adapter!.delete(key, options);
      if (result) {
        this.stats.totalDeletes++;
      }
      return result;
    } catch (error) {
      this.stats.failedOperations++;
      throw error;
    }
  }

  async list(options: ListOptions = {}): Promise<ListResult> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    return this.adapter!.list(options);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    try {
      await this.adapter!.download(key, {});
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSignedUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    return this.adapter!.getSignedUrl(key, options);
  }

  async copy(sourceKey: string, destinationKey: string, options: CopyOptions = {}): Promise<UploadResult> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    // Download source
    const downloadResult = await this.download(sourceKey, {
      bucket: options.sourceBucket,
    });

    // Upload to destination
    const uploadResult = await this.upload(downloadResult.data, destinationKey, {
      bucket: options.destinationBucket,
      contentType: downloadResult.metadata.contentType,
      metadata: options.metadata || downloadResult.metadata.metadata,
    });

    return uploadResult;
  }

  async move(sourceKey: string, destinationKey: string, options: CopyOptions = {}): Promise<UploadResult> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    // Copy file
    const result = await this.copy(sourceKey, destinationKey, options);

    // Delete source
    await this.delete(sourceKey, { bucket: options.sourceBucket });

    return result;
  }

  async uploadFromUrl(url: string, options: UploadOptions = {}): Promise<UploadResult> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    // Fetch file from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw createUploadError(`Failed to fetch URL: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine filename from URL
    const urlPath = new URL(url).pathname;
    const filename = urlPath.split('/').pop() || 'downloaded-file';

    return this.upload(buffer, filename, options);
  }

  private updateUploadStats(bytes: number, time: number): void {
    this.stats.totalUploads++;
    this.stats.bytesUploaded += bytes;
    this.stats.byProvider[this.config.provider]++;

    this.uploadTimes.push(time);
    if (this.uploadTimes.length > 100) {
      this.uploadTimes.shift();
    }

    const sum = this.uploadTimes.reduce((a, b) => a + b, 0);
    this.stats.averageUploadTime = Math.round(sum / this.uploadTimes.length);
  }

  private updateDownloadStats(bytes: number, time: number): void {
    this.stats.totalDownloads++;
    this.stats.bytesDownloaded += bytes;

    this.downloadTimes.push(time);
    if (this.downloadTimes.length > 100) {
      this.downloadTimes.shift();
    }

    const sum = this.downloadTimes.reduce((a, b) => a + b, 0);
    this.stats.averageDownloadTime = Math.round(sum / this.downloadTimes.length);
  }

  getStats(): StorageStats {
    return { ...this.stats };
  }

  getConfig(): Readonly<StorageConfig> {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    this.uploadTimes = [];
    this.downloadTimes = [];
    this.adapter = null;
    this.initialized = false;
  }
}

export async function createStorageService(config: StorageConfig): Promise<StorageService> {
  const service = new StorageService(config);
  await service.initialize();
  return service;
}
