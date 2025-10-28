/**
 * Storage Capsule - Utils
 */

import * as crypto from 'crypto';
import { MIME_TYPE_MAP } from './constants';

/**
 * Validate file path to prevent directory traversal attacks
 */
export function validateFilePath(filePath: string): boolean {
  if (!filePath || filePath.trim().length === 0) return false;
  if (filePath.includes('..')) return false; // Prevent path traversal
  if (filePath.startsWith('/') || filePath.startsWith('\\')) return false;
  if (/[<>:"|?*\x00-\x1f]/.test(filePath)) return false; // Invalid characters
  return true;
}

/**
 * Generate a unique object key for storage
 */
export function generateObjectKey(filename: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const sanitized = sanitizeFilename(filename);
  const key = `${timestamp}_${random}_${sanitized}`;
  return prefix ? `${prefix}/${key}` : key;
}

/**
 * Legacy alias for generateObjectKey
 */
export function generateStorageKey(filename: string, prefix?: string): string {
  return generateObjectKey(filename, prefix);
}

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100);
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  return MIME_TYPE_MAP[ext] || 'application/octet-stream';
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * Calculate checksum (MD5 hash) of data
 */
export function calculateChecksum(data: Buffer | string): string {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Legacy alias for formatFileSize
 */
export function formatBytes(bytes: number): string {
  return formatFileSize(bytes);
}

export function validateFileSize(size: number, maxSize?: number): boolean {
  if (!maxSize) return true;
  return size <= maxSize;
}

export function validateMimeType(mimeType: string, allowed?: string[]): boolean {
  if (!allowed || allowed.length === 0) return true;
  return allowed.includes(mimeType);
}

export function parseS3Url(url: string): { bucket: string; key: string } | null {
  // Parse s3://bucket/key or https://bucket.s3.region.amazonaws.com/key
  const s3Match = url.match(/^s3:\/\/([^/]+)\/(.+)$/);
  if (s3Match) {
    return { bucket: s3Match[1], key: s3Match[2] };
  }

  const httpsMatch = url.match(/^https?:\/\/([^.]+)\.s3[^/]*\.amazonaws\.com\/(.+)$/);
  if (httpsMatch) {
    return { bucket: httpsMatch[1], key: httpsMatch[2] };
  }

  return null;
}

export function buildS3Url(bucket: string, key: string, region: string): string {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function buildLocalUrl(key: string, urlPrefix?: string): string {
  const prefix = urlPrefix || '/uploads';
  return `${prefix}/${key}`;
}

export function calculateProgress(loaded: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((loaded / total) * 100);
}

export function isValidKey(key: string): boolean {
  if (!key || key.trim().length === 0) return false;
  if (key.includes('..')) return false; // Prevent path traversal
  if (key.startsWith('/') || key.startsWith('\\')) return false;
  return true;
}

export async function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export function extractMetadataFromHeaders(headers: Record<string, string>): Record<string, string> {
  const metadata: Record<string, string> = {};
  Object.entries(headers).forEach(([key, value]) => {
    if (key.toLowerCase().startsWith('x-amz-meta-')) {
      const metaKey = key.slice(11); // Remove 'x-amz-meta-' prefix
      metadata[metaKey] = value;
    }
  });
  return metadata;
}
