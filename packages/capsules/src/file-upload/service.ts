/**
 * File Upload Capsule - Service
 */

import type {
  FileUploadConfig,
  UploadedFile,
  UploadOptions,
  FileUploadStats,
  MultipartUploadResult,
  ChunkUploadOptions,
  ChunkedUpload,
} from './types';
import { createAdapter, FileUploadAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import {
  validateFile,
  getFileExtension,
  getMimeTypeFromExtension,
  calculateProgress,
} from './utils';
import {
  createFileTooLargeError,
  createInvalidFileTypeError,
  createInvalidExtensionError,
  createTooManyFilesError,
  createValidationError,
} from './errors';

export class FileUploadService {
  private adapter: FileUploadAdapter | null = null;
  private config: FileUploadConfig;
  private stats: FileUploadStats = { ...INITIAL_STATS };
  private initialized = false;
  private uploadTimes: number[] = [];
  private uploadedFiles = new Map<string, UploadedFile>();

  constructor(config: FileUploadConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.adapter = createAdapter(this.config);
    this.initialized = true;
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    options?: UploadOptions
  ): Promise<UploadedFile> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const startTime = Date.now();
    const extension = getFileExtension(originalName);
    const mimeType = options?.metadata?.mimeType || getMimeTypeFromExtension(extension);

    // Validate file
    const validation = validateFile(
      buffer.length,
      mimeType,
      extension,
      this.config.maxFileSize!,
      this.config.allowedMimeTypes || [],
      this.config.allowedExtensions || []
    );

    if (!validation.valid) {
      this.stats.failedUploads++;
      throw createValidationError(validation.errors.join(', '));
    }

    try {
      // Track progress if callback provided
      if (options?.onProgress) {
        const progress = calculateProgress(buffer.length, buffer.length, startTime);
        options.onProgress(progress);
      }

      // Upload based on strategy
      let file: UploadedFile;
      if (this.config.strategy === 'chunked' && buffer.length > this.config.chunkSize!) {
        file = await this.uploadChunked(buffer, originalName, options);
      } else {
        file = await this.adapter!.uploadDirect(buffer, originalName, options);
      }

      // Update stats
      const uploadTime = Date.now() - startTime;
      this.updateStats(file, uploadTime);

      // Store file reference
      this.uploadedFiles.set(file.id, file);

      return file;
    } catch (error) {
      this.stats.failedUploads++;
      throw error;
    }
  }

  async uploadMultiple(
    files: Array<{ buffer: Buffer; originalName: string; options?: UploadOptions }>
  ): Promise<MultipartUploadResult> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    // Validate file count
    if (files.length > this.config.maxFiles!) {
      throw createTooManyFilesError(files.length, this.config.maxFiles!);
    }

    const results: UploadedFile[] = [];
    const errors: any[] = [];

    for (const file of files) {
      try {
        const uploaded = await this.upload(file.buffer, file.originalName, file.options);
        results.push(uploaded);
      } catch (error: any) {
        errors.push({
          filename: file.originalName,
          error: error.message,
          code: error.type,
        });
      }
    }

    return { files: results, errors };
  }

  private async uploadChunked(
    buffer: Buffer,
    originalName: string,
    options?: UploadOptions
  ): Promise<UploadedFile> {
    if (!this.adapter) {
      throw createValidationError('Adapter not initialized');
    }

    const chunkSize = this.config.chunkSize!;
    const totalChunks = Math.ceil(buffer.length / chunkSize);

    let uploadId: string | undefined;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, buffer.length);
      const chunk = buffer.slice(start, end);

      const chunkOptions: ChunkUploadOptions = {
        uploadId,
        chunkIndex: i,
        totalChunks,
        filename: originalName,
      };

      const upload = await this.adapter.uploadChunk(chunk, chunkOptions);
      uploadId = upload.uploadId;

      // Track progress
      if (options?.onProgress) {
        const progress = calculateProgress(end, buffer.length, Date.now());
        options.onProgress(progress);
      }
    }

    // Assemble chunks
    const file = await this.adapter.assembleChunks(uploadId!);
    this.stats.chunkedUploads++;

    return file;
  }

  async uploadChunk(
    chunk: Buffer,
    options: ChunkUploadOptions
  ): Promise<ChunkedUpload> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    return this.adapter!.uploadChunk(chunk, options);
  }

  async completeChunkedUpload(uploadId: string): Promise<UploadedFile> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const file = await this.adapter!.assembleChunks(uploadId);
    this.uploadedFiles.set(file.id, file);
    this.stats.chunkedUploads++;
    this.stats.totalUploads++;
    this.stats.totalBytes += file.size;

    return file;
  }

  getChunkedUploadStatus(uploadId: string): ChunkedUpload | undefined {
    if (!this.adapter) return undefined;
    return this.adapter.getChunkedUpload(uploadId);
  }

  cancelChunkedUpload(uploadId: string): boolean {
    if (!this.adapter) return false;
    return this.adapter.cancelChunkedUpload(uploadId);
  }

  async delete(fileId: string): Promise<boolean> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const file = this.uploadedFiles.get(fileId);
    if (!file) {
      return false;
    }

    const deleted = await this.adapter!.deleteFile(file.path);
    if (deleted) {
      this.uploadedFiles.delete(fileId);

      // Delete thumbnails if any
      if (file.thumbnails) {
        for (const thumbnail of file.thumbnails) {
          try {
            await this.adapter!.deleteFile(thumbnail.path);
          } catch (error) {
            // Continue even if thumbnail deletion fails
          }
        }
      }
    }

    return deleted;
  }

  async getFile(fileId: string): Promise<Buffer | null> {
    if (!this.initialized || !this.adapter) {
      await this.initialize();
    }

    const file = this.uploadedFiles.get(fileId);
    if (!file) {
      return null;
    }

    return this.adapter!.readFile(file.path);
  }

  getFileMetadata(fileId: string): UploadedFile | undefined {
    return this.uploadedFiles.get(fileId);
  }

  listFiles(): UploadedFile[] {
    return Array.from(this.uploadedFiles.values());
  }

  private updateStats(file: UploadedFile, uploadTime: number): void {
    this.stats.totalUploads++;
    this.stats.totalBytes += file.size;

    // Update by MIME type
    if (!this.stats.byMimeType[file.mimeType]) {
      this.stats.byMimeType[file.mimeType] = 0;
    }
    this.stats.byMimeType[file.mimeType]++;

    // Update by extension
    if (!this.stats.byExtension[file.extension]) {
      this.stats.byExtension[file.extension] = 0;
    }
    this.stats.byExtension[file.extension]++;

    // Update average file size
    this.stats.averageFileSize = Math.round(this.stats.totalBytes / this.stats.totalUploads);

    // Update upload time
    this.uploadTimes.push(uploadTime);
    if (this.uploadTimes.length > 100) {
      this.uploadTimes.shift();
    }
    const sum = this.uploadTimes.reduce((a, b) => a + b, 0);
    this.stats.averageUploadTime = Math.round(sum / this.uploadTimes.length);

    // Update thumbnails count
    if (file.thumbnails) {
      this.stats.thumbnailsGenerated += file.thumbnails.length;
    }
  }

  getStats(): FileUploadStats {
    return { ...this.stats };
  }

  getConfig(): Readonly<FileUploadConfig> {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    this.uploadedFiles.clear();
    this.uploadTimes = [];
    this.adapter = null;
    this.initialized = false;
  }
}

export async function createFileUploadService(
  config: FileUploadConfig
): Promise<FileUploadService> {
  const service = new FileUploadService(config);
  await service.initialize();
  return service;
}
