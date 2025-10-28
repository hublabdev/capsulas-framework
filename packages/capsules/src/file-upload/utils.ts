/**
 * File Upload Capsule - Utils
 */

import * as crypto from 'crypto';
import * as path from 'path';
import type { FileValidationResult, UploadProgress } from './types';

export function generateFileId(): string {
  return `file_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

export function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, ext);
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${sanitizeFilename(nameWithoutExt)}_${timestamp}_${random}${ext}`;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);
}

export function getFileExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ext.startsWith('.') ? ext.slice(1) : ext;
}

export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
    zip: 'application/zip',
  };
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

export function validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
  if (allowedTypes.length === 0) return true;
  return allowedTypes.includes(mimeType);
}

export function validateExtension(extension: string, allowedExtensions: string[]): boolean {
  if (allowedExtensions.length === 0) return true;
  return allowedExtensions.includes(extension.toLowerCase());
}

export function validateFile(
  size: number,
  mimeType: string,
  extension: string,
  maxSize: number,
  allowedTypes: string[],
  allowedExtensions: string[]
): FileValidationResult {
  const errors: string[] = [];

  if (!validateFileSize(size, maxSize)) {
    errors.push(`File size exceeds maximum of ${formatBytes(maxSize)}`);
  }

  if (!validateMimeType(mimeType, allowedTypes)) {
    errors.push(`MIME type ${mimeType} is not allowed`);
  }

  if (!validateExtension(extension, allowedExtensions)) {
    errors.push(`Extension .${extension} is not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function calculateProgress(loaded: number, total: number, startTime: number): UploadProgress {
  const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;
  const elapsedTime = (Date.now() - startTime) / 1000; // seconds
  const bytesPerSecond = elapsedTime > 0 ? loaded / elapsedTime : 0;
  const remainingBytes = total - loaded;
  const estimatedTimeRemaining = bytesPerSecond > 0 ? remainingBytes / bytesPerSecond : 0;

  return {
    loaded,
    total,
    percentage,
    bytesPerSecond,
    estimatedTimeRemaining,
  };
}

export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

export function isDocumentFile(mimeType: string): boolean {
  const docTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument',
    'text/plain',
  ];
  return docTypes.some((type) => mimeType.startsWith(type));
}

export function chunkBuffer(buffer: Buffer, chunkSize: number): Buffer[] {
  const chunks: Buffer[] = [];
  let offset = 0;

  while (offset < buffer.length) {
    const chunk = buffer.slice(offset, offset + chunkSize);
    chunks.push(chunk);
    offset += chunkSize;
  }

  return chunks;
}

export function calculateTotalChunks(fileSize: number, chunkSize: number): number {
  return Math.ceil(fileSize / chunkSize);
}

export function buildFilePath(uploadDir: string, filename: string): string {
  return path.join(uploadDir, filename);
}

export function extractImageDimensions(buffer: Buffer): { width?: number; height?: number } {
  // Simplified implementation - in production, use a library like 'sharp' or 'image-size'
  // This is just a placeholder
  return { width: undefined, height: undefined };
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
