# File Upload Capsule ⭡

File upload with support for direct, chunked, and resumable upload strategies, validation, and thumbnail generation.

## Features

- **Multiple Upload Strategies**: Direct, chunked, and resumable uploads
- **File Validation**: Size, MIME type, and extension validation
- **Thumbnail Generation**: Automatic thumbnail creation for images
- **Progress Tracking**: Upload progress callbacks
- **Multipart Upload**: Upload multiple files at once
- **Chunked Upload**: Support for large file uploads
- **Statistics**: Track upload metrics
- **Type Safety**: Full TypeScript support

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

```typescript
import { createFileUploadService } from '@capsulas/capsules/file-upload';

const upload = await createFileUploadService({
  uploadDir: './uploads',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['jpg', 'png', 'pdf'],
  strategy: 'direct'
});

// Upload file
const fileBuffer = await fs.readFile('photo.jpg');
const result = await upload.upload(fileBuffer, 'photo.jpg');

console.log('File uploaded:', result.url);
console.log('File ID:', result.id);
```

## API Reference

### Configuration

```typescript
interface FileUploadConfig {
  uploadDir?: string;                // Default: './uploads'
  maxFileSize?: number;              // Default: 10MB
  maxFiles?: number;                 // Default: 10
  allowedExtensions?: string[];      // Default: common types
  allowedMimeTypes?: string[];       // Default: common MIME types
  strategy?: UploadStrategy;         // Default: 'direct'
  chunkSize?: number;                // Default: 1MB
  generateThumbnails?: boolean;      // Default: false
  thumbnailSizes?: ThumbnailSize[];
  virusScan?: boolean;               // Default: false
}
```

### Methods

#### `upload(buffer: Buffer, originalName: string, options?: UploadOptions): Promise<UploadedFile>`

Upload a single file.

```typescript
const file = await upload.upload(buffer, 'document.pdf', {
  metadata: { uploadedBy: 'user-123' },
  onProgress: (progress) => {
    console.log(`${progress.percentage}% complete`);
  }
});
```

#### `uploadMultiple(files: Array<{buffer, originalName, options?}>): Promise<MultipartUploadResult>`

Upload multiple files.

```typescript
const result = await upload.uploadMultiple([
  { buffer: file1Buffer, originalName: 'file1.jpg' },
  { buffer: file2Buffer, originalName: 'file2.png' }
]);

console.log('Uploaded:', result.files.length);
console.log('Errors:', result.errors.length);
```

#### `uploadChunk(chunk: Buffer, options: ChunkUploadOptions): Promise<ChunkedUpload>`

Upload file chunk (for large files).

```typescript
const upload = await service.uploadChunk(chunk, {
  chunkIndex: 0,
  totalChunks: 10,
  filename: 'large-video.mp4'
});
```

#### `completeChunkedUpload(uploadId: string): Promise<UploadedFile>`

Complete chunked upload and assemble file.

```typescript
const file = await upload.completeChunkedUpload(uploadId);
```

#### `delete(fileId: string): Promise<boolean>`

Delete uploaded file.

```typescript
const deleted = await upload.delete(file.id);
```

#### `getFile(fileId: string): Promise<Buffer | null>`

Retrieve file contents.

```typescript
const buffer = await upload.getFile(file.id);
```

#### `getFileMetadata(fileId: string): UploadedFile | undefined`

Get file metadata.

```typescript
const metadata = upload.getFileMetadata(file.id);
console.log('Size:', metadata.size);
console.log('MIME type:', metadata.mimeType);
```

#### `listFiles(): UploadedFile[]`

List all uploaded files.

```typescript
const files = upload.listFiles();
files.forEach(file => {
  console.log(`${file.originalName} - ${file.size} bytes`);
});
```

#### `getStats(): FileUploadStats`

Get upload statistics.

```typescript
const stats = upload.getStats();
console.log('Total uploads:', stats.totalUploads);
console.log('Total bytes:', stats.totalBytes);
```

#### `cleanup(): Promise<void>`

Cleanup resources.

```typescript
await upload.cleanup();
```

## Examples

### Basic File Upload

```typescript
import { createFileUploadService } from '@capsulas/capsules/file-upload';
import fs from 'fs/promises';

const upload = await createFileUploadService({
  uploadDir: './uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif']
});

// Read file
const fileBuffer = await fs.readFile('/path/to/photo.jpg');

// Upload
const result = await upload.upload(fileBuffer, 'photo.jpg', {
  metadata: {
    uploadedBy: 'user-123',
    tags: ['profile', 'avatar']
  }
});

console.log('File uploaded successfully!');
console.log('ID:', result.id);
console.log('Path:', result.path);
console.log('Size:', result.size, 'bytes');
console.log('Hash:', result.metadata?.hash);
```

### Express.js Integration

```typescript
import express from 'express';
import multer from 'multer';
import { createFileUploadService } from '@capsulas/capsules/file-upload';

const app = express();
const multerUpload = multer({ storage: multer.memoryStorage() });

const upload = await createFileUploadService({
  uploadDir: './uploads',
  maxFileSize: 10 * 1024 * 1024,
  allowedExtensions: ['jpg', 'png', 'pdf', 'doc', 'docx']
});

app.post('/upload', multerUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = await upload.upload(
      req.file.buffer,
      req.file.originalname,
      {
        metadata: {
          uploadedBy: req.user?.id,
          mimeType: req.file.mimetype
        }
      }
    );

    res.json({
      success: true,
      file: {
        id: result.id,
        filename: result.filename,
        size: result.size,
        url: `/uploads/${result.filename}`
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('./uploads'));

app.listen(3000);
```

### Upload with Progress Tracking

```typescript
import { createFileUploadService } from '@capsulas/capsules/file-upload';

const upload = await createFileUploadService({
  uploadDir: './uploads',
  strategy: 'chunked',
  chunkSize: 1024 * 1024 // 1MB chunks
});

const largeFile = await fs.readFile('large-video.mp4');

const result = await upload.upload(largeFile, 'large-video.mp4', {
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percentage}%`);
    console.log(`Speed: ${(progress.bytesPerSecond! / 1024 / 1024).toFixed(2)} MB/s`);
    console.log(`ETA: ${progress.estimatedTimeRemaining?.toFixed(0)}s`);
  }
});

console.log('Upload complete!', result.id);
```

### Multiple File Upload

```typescript
import { createFileUploadService } from '@capsulas/capsules/file-upload';

const upload = await createFileUploadService({
  uploadDir: './uploads',
  maxFiles: 5,
  maxFileSize: 10 * 1024 * 1024
});

const files = [
  { buffer: await fs.readFile('file1.jpg'), name: 'file1.jpg' },
  { buffer: await fs.readFile('file2.png'), name: 'file2.png' },
  { buffer: await fs.readFile('file3.pdf'), name: 'file3.pdf' }
];

const result = await upload.uploadMultiple(
  files.map(f => ({
    buffer: f.buffer,
    originalName: f.name
  }))
);

console.log(`Successfully uploaded: ${result.files.length} files`);
console.log(`Failed uploads: ${result.errors.length}`);

result.files.forEach(file => {
  console.log(`✓ ${file.originalName} - ${file.id}`);
});

result.errors.forEach(error => {
  console.log(`✗ ${error.filename} - ${error.error}`);
});
```

### Chunked Upload for Large Files

```typescript
import { createFileUploadService } from '@capsulas/capsules/file-upload';

const upload = await createFileUploadService({
  uploadDir: './uploads',
  strategy: 'chunked',
  chunkSize: 5 * 1024 * 1024 // 5MB chunks
});

const largeFile = await fs.readFile('large-file.zip');
const chunkSize = 5 * 1024 * 1024;
const totalChunks = Math.ceil(largeFile.length / chunkSize);

let uploadId: string | undefined;

// Upload chunks
for (let i = 0; i < totalChunks; i++) {
  const start = i * chunkSize;
  const end = Math.min(start + chunkSize, largeFile.length);
  const chunk = largeFile.slice(start, end);

  const result = await upload.uploadChunk(chunk, {
    uploadId,
    chunkIndex: i,
    totalChunks,
    filename: 'large-file.zip'
  });

  uploadId = result.uploadId;
  console.log(`Uploaded chunk ${i + 1}/${totalChunks}`);
}

// Complete upload
const file = await upload.completeChunkedUpload(uploadId!);
console.log('Upload complete!', file.id);
```

### Image Upload with Thumbnails

```typescript
import { createFileUploadService } from '@capsulas/capsules/file-upload';

const upload = await createFileUploadService({
  uploadDir: './uploads',
  generateThumbnails: true,
  thumbnailSizes: [
    { name: 'small', width: 150, height: 150, fit: 'cover' },
    { name: 'medium', width: 300, height: 300, fit: 'cover' },
    { name: 'large', width: 800, height: 600, fit: 'contain' }
  ],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif']
});

const imageBuffer = await fs.readFile('photo.jpg');

const result = await upload.upload(imageBuffer, 'photo.jpg');

console.log('Original:', result.url);
console.log('Thumbnails:');
result.thumbnails?.forEach(thumb => {
  console.log(`  ${thumb.name}: ${thumb.width}x${thumb.height} - ${thumb.url}`);
});
```

### File Validation

```typescript
import {
  createFileUploadService,
  FileUploadError,
  FileUploadErrorType
} from '@capsulas/capsules/file-upload';

const upload = await createFileUploadService({
  uploadDir: './uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedExtensions: ['jpg', 'png', 'pdf'],
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
});

try {
  const file = await fs.readFile('document.docx');
  await upload.upload(file, 'document.docx');
} catch (error) {
  if (error instanceof FileUploadError) {
    switch (error.type) {
      case FileUploadErrorType.FILE_TOO_LARGE_ERROR:
        console.error('File is too large');
        break;
      case FileUploadErrorType.INVALID_EXTENSION_ERROR:
        console.error('File type not allowed');
        break;
      case FileUploadErrorType.INVALID_FILE_TYPE_ERROR:
        console.error('Invalid MIME type');
        break;
      default:
        console.error('Upload failed:', error.message);
    }
  }
}
```

### File Download Endpoint

```typescript
import express from 'express';
import { createFileUploadService } from '@capsulas/capsules/file-upload';

const app = express();
const upload = await createFileUploadService({
  uploadDir: './uploads'
});

app.get('/files/:fileId/download', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const metadata = upload.getFileMetadata(fileId);

    if (!metadata) {
      return res.status(404).json({ error: 'File not found' });
    }

    const buffer = await upload.getFile(fileId);
    if (!buffer) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.setHeader('Content-Type', metadata.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalName}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

app.listen(3000);
```

### File Management

```typescript
import { createFileUploadService } from '@capsulas/capsules/file-upload';

const upload = await createFileUploadService({
  uploadDir: './uploads'
});

// List all files
const files = upload.listFiles();
console.log(`Total files: ${files.length}`);

files.forEach(file => {
  console.log(`${file.originalName}:`);
  console.log(`  ID: ${file.id}`);
  console.log(`  Size: ${(file.size / 1024).toFixed(2)} KB`);
  console.log(`  Type: ${file.mimeType}`);
  console.log(`  Uploaded: ${new Date(file.uploadedAt).toLocaleString()}`);
});

// Delete old files (older than 30 days)
const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
const oldFiles = files.filter(f => f.uploadedAt < thirtyDaysAgo);

for (const file of oldFiles) {
  await upload.delete(file.id);
  console.log(`Deleted old file: ${file.originalName}`);
}
```

### Upload Statistics

```typescript
import { createFileUploadService } from '@capsulas/capsules/file-upload';

const upload = await createFileUploadService({
  uploadDir: './uploads'
});

// Perform uploads...
await upload.upload(file1, 'file1.jpg');
await upload.upload(file2, 'file2.png');
await upload.upload(file3, 'file3.pdf');

// Get statistics
const stats = upload.getStats();

console.log('=== Upload Statistics ===');
console.log(`Total uploads: ${stats.totalUploads}`);
console.log(`Failed uploads: ${stats.failedUploads}`);
console.log(`Total bytes: ${(stats.totalBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`Average file size: ${(stats.averageFileSize / 1024).toFixed(2)} KB`);
console.log(`Average upload time: ${stats.averageUploadTime}ms`);
console.log(`Chunked uploads: ${stats.chunkedUploads}`);
console.log(`Thumbnails generated: ${stats.thumbnailsGenerated}`);

console.log('\nBy MIME Type:');
Object.entries(stats.byMimeType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

console.log('\nBy Extension:');
Object.entries(stats.byExtension).forEach(([ext, count]) => {
  console.log(`  .${ext}: ${count}`);
});
```

## Error Types

The File Upload Capsule includes 10 specialized error types:

- `UPLOAD_ERROR` - Generic upload failure
- `FILE_TOO_LARGE_ERROR` - File exceeds maximum size
- `INVALID_FILE_TYPE_ERROR` - MIME type not allowed
- `INVALID_EXTENSION_ERROR` - Extension not allowed
- `TOO_MANY_FILES_ERROR` - Too many files in multipart upload
- `CHUNK_ERROR` - Chunked upload error
- `THUMBNAIL_ERROR` - Thumbnail generation failed
- `VIRUS_DETECTED_ERROR` - Virus detected in file
- `STORAGE_ERROR` - Storage operation failed
- `VALIDATION_ERROR` - File validation failed

## Best Practices

1. **File Validation**: Always validate file size, type, and extension
2. **Chunked Uploads**: Use chunked strategy for files > 5MB
3. **Progress Tracking**: Implement progress callbacks for better UX
4. **Security**: Validate MIME types, not just extensions
5. **Storage**: Use dedicated storage service for production (S3, etc.)
6. **Cleanup**: Regularly delete orphaned or expired files
7. **Thumbnails**: Generate thumbnails async for better performance
8. **Error Handling**: Handle all error types appropriately

## License

MIT
