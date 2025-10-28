/**
 * Storage Capsule - Adapters
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  StorageConfig,
  UploadOptions,
  UploadResult,
  DownloadOptions,
  DownloadResult,
  ListOptions,
  ListResult,
  DeleteOptions,
  FileMetadata,
  SignedUrlOptions,
  CopyOptions,
} from './types';
import {
  generateStorageKey,
  getMimeType,
  buildS3Url,
  buildLocalUrl,
  isValidKey,
  validateFilePath,
} from './utils';
import {
  createUploadError,
  createDownloadError,
  createDeleteError,
  createFileNotFoundError,
  createBucketError,
  createValidationError,
} from './errors';

/**
 * Abstract base class for storage adapters
 */
export abstract class StorageAdapter {
  constructor(protected config: StorageConfig) {}

  abstract upload(data: Buffer, options: UploadOptions): Promise<UploadResult>;
  abstract download(key: string, options: DownloadOptions): Promise<DownloadResult>;
  abstract delete(key: string, options: DeleteOptions): Promise<boolean>;
  abstract list(options: ListOptions): Promise<ListResult>;
  abstract getSignedUrl(key: string, options: SignedUrlOptions): Promise<string>;
}

/**
 * S3 Storage Adapter
 */
export class S3Adapter extends StorageAdapter {
  async upload(data: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    const key = options.key || generateStorageKey('file');
    const contentType = options.contentType || 'application/octet-stream';

    if (!validateFilePath(key)) {
      throw createValidationError(`Invalid key: ${key}`);
    }

    // In production: use AWS SDK
    // const s3 = new S3Client({ region: this.config.s3!.region });
    // await s3.send(new PutObjectCommand({ Bucket, Key, Body: data }));

    const bucket = options.bucket || this.config.s3!.bucket;
    const url = buildS3Url(bucket, key, this.config.s3!.region);

    return {
      key,
      url,
      size: data.length,
      contentType,
      etag: `"${Date.now()}"`,
      bucket,
      provider: 's3',
      uploadedAt: Date.now(),
    };
  }

  async download(key: string, options: DownloadOptions = {}): Promise<DownloadResult> {
    // In production: use AWS SDK
    return {
      data: Buffer.from('mock-s3-data'),
      metadata: {
        key,
        size: 1024,
        contentType: 'application/octet-stream',
        lastModified: new Date(),
        etag: `"${Date.now()}"`,
      },
    };
  }

  async delete(key: string, options: DeleteOptions = {}): Promise<boolean> {
    // In production: use AWS SDK
    return true;
  }

  async list(options: ListOptions = {}): Promise<ListResult> {
    // In production: use AWS SDK
    return {
      files: [],
      isTruncated: false,
    };
  }

  async getSignedUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    // In production: use AWS SDK
    const bucket = options.bucket || this.config.s3!.bucket;
    return buildS3Url(bucket, key, this.config.s3!.region) + '?signed=true';
  }
}

/**
 * GCS (Google Cloud Storage) Adapter
 */
export class GCSAdapter extends StorageAdapter {
  async upload(data: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    const key = options.key || generateStorageKey('file');
    const contentType = options.contentType || 'application/octet-stream';
    const bucket = options.bucket || this.config.gcs!.bucket;
    const url = `https://storage.googleapis.com/${bucket}/${key}`;

    return {
      key,
      url,
      size: data.length,
      contentType,
      bucket,
      provider: 'gcs',
      uploadedAt: Date.now(),
    };
  }

  async download(key: string, options: DownloadOptions = {}): Promise<DownloadResult> {
    return {
      data: Buffer.from('mock-gcs-data'),
      metadata: {
        key,
        size: 1024,
        contentType: 'application/octet-stream',
        lastModified: new Date(),
      },
    };
  }

  async delete(key: string, options: DeleteOptions = {}): Promise<boolean> {
    return true;
  }

  async list(options: ListOptions = {}): Promise<ListResult> {
    return { files: [], isTruncated: false };
  }

  async getSignedUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    const bucket = options.bucket || this.config.gcs!.bucket;
    return `https://storage.googleapis.com/${bucket}/${key}?signed=true`;
  }
}

/**
 * Azure Blob Storage Adapter
 */
export class AzureAdapter extends StorageAdapter {
  async upload(data: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    const key = options.key || generateStorageKey('file');
    const contentType = options.contentType || 'application/octet-stream';
    const container = this.config.azure!.containerName;
    const url = `https://${this.config.azure!.accountName}.blob.core.windows.net/${container}/${key}`;

    return {
      key,
      url,
      size: data.length,
      contentType,
      provider: 'azure',
      uploadedAt: Date.now(),
    };
  }

  async download(key: string, options: DownloadOptions = {}): Promise<DownloadResult> {
    return {
      data: Buffer.from('mock-azure-data'),
      metadata: {
        key,
        size: 1024,
        contentType: 'application/octet-stream',
        lastModified: new Date(),
      },
    };
  }

  async delete(key: string, options: DeleteOptions = {}): Promise<boolean> {
    return true;
  }

  async list(options: ListOptions = {}): Promise<ListResult> {
    return { files: [], isTruncated: false };
  }

  async getSignedUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    const container = this.config.azure!.containerName;
    return `https://${this.config.azure!.accountName}.blob.core.windows.net/${container}/${key}?signed=true`;
  }
}

/**
 * Cloudflare R2 Storage Adapter
 */
export class CloudflareR2Adapter extends StorageAdapter {
  async upload(data: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    const key = options.key || generateStorageKey('file');
    const contentType = options.contentType || 'application/octet-stream';

    if (!validateFilePath(key)) {
      throw createValidationError(`Invalid key: ${key}`);
    }

    // In production: use @cloudflare/workers-types or AWS SDK with R2 endpoint
    const bucket = options.bucket || this.config.cloudflareR2!.bucket;
    const endpoint = this.config.cloudflareR2!.endpoint ||
      `https://${this.config.cloudflareR2!.accountId}.r2.cloudflarestorage.com`;
    const url = `${endpoint}/${bucket}/${key}`;

    return {
      key,
      url,
      size: data.length,
      contentType,
      etag: `"${Date.now()}"`,
      bucket,
      provider: 'cloudflare-r2',
      uploadedAt: Date.now(),
    };
  }

  async download(key: string, options: DownloadOptions = {}): Promise<DownloadResult> {
    // In production: use R2 API
    return {
      data: Buffer.from('mock-r2-data'),
      metadata: {
        key,
        size: 1024,
        contentType: 'application/octet-stream',
        lastModified: new Date(),
        etag: `"${Date.now()}"`,
      },
    };
  }

  async delete(key: string, options: DeleteOptions = {}): Promise<boolean> {
    // In production: use R2 API
    return true;
  }

  async list(options: ListOptions = {}): Promise<ListResult> {
    // In production: use R2 API
    return {
      files: [],
      isTruncated: false,
    };
  }

  async getSignedUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    // In production: use R2 signed URLs
    const bucket = options.bucket || this.config.cloudflareR2!.bucket;
    const endpoint = this.config.cloudflareR2!.endpoint ||
      `https://${this.config.cloudflareR2!.accountId}.r2.cloudflarestorage.com`;
    return `${endpoint}/${bucket}/${key}?signed=true`;
  }
}

/**
 * Local File System Adapter
 */
export class LocalAdapter extends StorageAdapter {

  async upload(data: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    const key = options.key || generateStorageKey('file');
    const contentType = options.contentType || 'application/octet-stream';
    const basePath = this.config.local!.basePath;
    const filePath = path.join(basePath, key);
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, data);

    const url = buildLocalUrl(key, this.config.local?.urlPrefix);

    return {
      key,
      url,
      size: data.length,
      contentType,
      provider: 'local',
      uploadedAt: Date.now(),
    };
  }

  async download(key: string, options: DownloadOptions = {}): Promise<DownloadResult> {
    const basePath = this.config.local!.basePath;
    const filePath = path.join(basePath, key);

    try {
      const data = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);

      return {
        data,
        metadata: {
          key,
          size: stats.size,
          contentType: getMimeType(key),
          lastModified: stats.mtime,
        },
      };
    } catch (error) {
      throw createFileNotFoundError(key);
    }
  }

  async delete(key: string, options: DeleteOptions = {}): Promise<boolean> {
    const basePath = this.config.local!.basePath;
    const filePath = path.join(basePath, key);

    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      throw createDeleteError(`Failed to delete file: ${key}`, error as Error);
    }
  }

  async list(options: ListOptions = {}): Promise<ListResult> {
    const basePath = this.config.local!.basePath;
    const prefix = options.prefix || '';
    const searchPath = path.join(basePath, prefix);

    try {
      const entries = await fs.readdir(searchPath, { withFileTypes: true });
      const files: FileMetadata[] = [];

      for (const entry of entries) {
        if (entry.isFile()) {
          const filePath = path.join(searchPath, entry.name);
          const stats = await fs.stat(filePath);
          const key = path.relative(basePath, filePath);

          files.push({
            key,
            size: stats.size,
            contentType: getMimeType(entry.name),
            lastModified: stats.mtime,
          });
        }
      }

      return {
        files,
        isTruncated: false,
      };
    } catch (error) {
      return { files: [], isTruncated: false };
    }
  }

  async getSignedUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    return buildLocalUrl(key, this.config.local?.urlPrefix);
  }
}

/**
 * Factory function to create the appropriate storage adapter
 */
export function createAdapter(config: StorageConfig): StorageAdapter {
  switch (config.provider) {
    case 's3':
      return new S3Adapter(config);
    case 'gcs':
      return new GCSAdapter(config);
    case 'azure':
      return new AzureAdapter(config);
    case 'cloudflare-r2':
      return new CloudflareR2Adapter(config);
    case 'local':
      return new LocalAdapter(config);
    default:
      throw createValidationError(`Unsupported storage provider: ${config.provider}`);
  }
}
