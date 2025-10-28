/**
 * File Upload Capsule - Adapters
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  FileUploadConfig,
  UploadedFile,
  UploadOptions,
  ChunkedUpload,
  ChunkUploadOptions,
  Thumbnail,
} from './types';
import {
  generateFileId,
  generateUniqueFilename,
  getFileExtension,
  buildFilePath,
  calculateFileHash,
  isImageFile,
} from './utils';
import {
  createUploadError,
  createStorageError,
  createChunkError,
  createThumbnailError,
} from './errors';

export class FileUploadAdapter {
  private chunkedUploads = new Map<string, ChunkedUpload>();

  constructor(private config: FileUploadConfig) {}

  async uploadDirect(buffer: Buffer, originalName: string, options?: UploadOptions): Promise<UploadedFile> {
    try {
      const filename = options?.filename || generateUniqueFilename(originalName);
      const filePath = buildFilePath(this.config.uploadDir!, filename);
      const extension = getFileExtension(originalName);

      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Write file
      await fs.writeFile(filePath, buffer);

      const file: UploadedFile = {
        id: generateFileId(),
        originalName,
        filename,
        path: filePath,
        size: buffer.length,
        mimeType: options?.metadata?.mimeType || 'application/octet-stream',
        extension,
        uploadedAt: Date.now(),
        metadata: {
          ...options?.metadata,
          hash: calculateFileHash(buffer),
        },
      };

      // Generate thumbnails if needed
      if (
        this.config.generateThumbnails &&
        isImageFile(file.mimeType) &&
        this.config.thumbnailSizes
      ) {
        file.thumbnails = await this.generateThumbnails(buffer, filename);
      }

      return file;
    } catch (error) {
      throw createUploadError('Direct upload failed', error as Error);
    }
  }

  async uploadChunk(
    chunk: Buffer,
    options: ChunkUploadOptions
  ): Promise<ChunkedUpload> {
    try {
      const uploadId = options.uploadId || generateFileId();
      let upload = this.chunkedUploads.get(uploadId);

      if (!upload) {
        upload = {
          uploadId,
          filename: options.filename,
          totalChunks: options.totalChunks,
          chunkSize: chunk.length,
          uploadedChunks: [],
          createdAt: Date.now(),
        };
        this.chunkedUploads.set(uploadId, upload);
      }

      // Save chunk to temp directory
      const tempDir = path.join(this.config.uploadDir!, 'chunks', uploadId);
      await fs.mkdir(tempDir, { recursive: true });

      const chunkPath = path.join(tempDir, `chunk_${options.chunkIndex}`);
      await fs.writeFile(chunkPath, chunk);

      // Mark chunk as uploaded
      if (!upload.uploadedChunks.includes(options.chunkIndex)) {
        upload.uploadedChunks.push(options.chunkIndex);
      }

      return upload;
    } catch (error) {
      throw createChunkError('Chunk upload failed', options.chunkIndex);
    }
  }

  async assembleChunks(uploadId: string): Promise<UploadedFile> {
    const upload = this.chunkedUploads.get(uploadId);
    if (!upload) {
      throw createChunkError('Upload not found');
    }

    // Check all chunks uploaded
    if (upload.uploadedChunks.length !== upload.totalChunks) {
      throw createChunkError(
        `Missing chunks: ${upload.totalChunks - upload.uploadedChunks.length}`
      );
    }

    try {
      const tempDir = path.join(this.config.uploadDir!, 'chunks', uploadId);
      const filename = generateUniqueFilename(upload.filename);
      const filePath = buildFilePath(this.config.uploadDir!, filename);

      // Assemble chunks in order
      const chunks: Buffer[] = [];
      for (let i = 0; i < upload.totalChunks; i++) {
        const chunkPath = path.join(tempDir, `chunk_${i}`);
        const chunkData = await fs.readFile(chunkPath);
        chunks.push(chunkData);
      }

      const completeBuffer = Buffer.concat(chunks);

      // Write assembled file
      await fs.writeFile(filePath, completeBuffer);

      // Clean up chunks
      await fs.rm(tempDir, { recursive: true, force: true });
      this.chunkedUploads.delete(uploadId);

      upload.completedAt = Date.now();

      const file: UploadedFile = {
        id: uploadId,
        originalName: upload.filename,
        filename,
        path: filePath,
        size: completeBuffer.length,
        mimeType: 'application/octet-stream',
        extension: getFileExtension(upload.filename),
        uploadedAt: upload.completedAt,
        metadata: {
          hash: calculateFileHash(completeBuffer),
        },
      };

      return file;
    } catch (error) {
      throw createChunkError('Failed to assemble chunks', undefined);
    }
  }

  private async generateThumbnails(
    buffer: Buffer,
    filename: string
  ): Promise<Thumbnail[]> {
    // Simplified implementation - in production use a library like 'sharp'
    // This is a placeholder that simulates thumbnail generation
    try {
      const thumbnails: Thumbnail[] = [];
      const thumbnailDir = path.join(this.config.uploadDir!, 'thumbnails');
      await fs.mkdir(thumbnailDir, { recursive: true });

      for (const size of this.config.thumbnailSizes || []) {
        const thumbnailFilename = `${path.parse(filename).name}_${size.name}${path.extname(filename)}`;
        const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);

        // In production: use sharp to resize
        // await sharp(buffer).resize(size.width, size.height, { fit: size.fit }).toFile(thumbnailPath);

        // Placeholder: just copy the original for now
        await fs.writeFile(thumbnailPath, buffer);

        const stats = await fs.stat(thumbnailPath);

        thumbnails.push({
          name: size.name,
          path: thumbnailPath,
          width: size.width,
          height: size.height,
          size: stats.size,
        });
      }

      return thumbnails;
    } catch (error) {
      throw createThumbnailError('Thumbnail generation failed', error as Error);
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      throw createStorageError('Failed to delete file', error as Error);
    }
  }

  async readFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw createStorageError('Failed to read file', error as Error);
    }
  }

  getChunkedUpload(uploadId: string): ChunkedUpload | undefined {
    return this.chunkedUploads.get(uploadId);
  }

  cancelChunkedUpload(uploadId: string): boolean {
    return this.chunkedUploads.delete(uploadId);
  }
}

export function createAdapter(config: FileUploadConfig): FileUploadAdapter {
  return new FileUploadAdapter(config);
}
