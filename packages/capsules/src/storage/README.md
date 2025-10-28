# Storage Capsule ╩

File storage with support for AWS S3, Google Cloud Storage, Azure Blob Storage, Cloudflare R2, and Local filesystem.

## Features

- **Multi-Provider Support**: S3, GCS, Azure, Cloudflare R2, Local
- **File Upload/Download**: Efficient file operations
- **File Validation**: Size and MIME type validation
- **Signed URLs**: Generate temporary access URLs
- **File Operations**: Copy, move, delete, list files
- **Progress Tracking**: Upload/download progress callbacks
- **Metadata Support**: Custom file metadata
- **Statistics**: Track storage usage and performance
- **Type Safety**: Full TypeScript support

## Installation

```bash
npm install @capsulas/capsules
```

## Quick Start

```typescript
import { createStorageService } from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 's3',
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: 'us-east-1',
    bucket: 'my-bucket'
  },
  maxFileSize: 10 * 1024 * 1024 // 10MB
});

// Upload file
const file = Buffer.from('Hello World');
const result = await storage.upload(file, 'hello.txt');
console.log('File URL:', result.url);

// Download file
const downloaded = await storage.download(result.key);
console.log('Content:', downloaded.data.toString());
```

## API Reference

### Configuration

```typescript
interface StorageConfig {
  provider: 's3' | 'gcs' | 'azure' | 'cloudflare-r2' | 'local';
  s3?: S3Config;
  local?: LocalConfig;
  gcs?: GCSConfig;
  azure?: AzureConfig;
  cloudflareR2?: CloudflareR2Config;
  defaultBucket?: string;
  maxFileSize?: number;           // Default: 100MB
  allowedMimeTypes?: string[];    // Default: common types
}
```

### Methods

#### `upload(data: Buffer | string, filename?: string, options?: UploadOptions): Promise<UploadResult>`

Upload a file.

```typescript
const result = await storage.upload(fileBuffer, 'document.pdf', {
  contentType: 'application/pdf',
  visibility: 'public',
  metadata: { userId: '123' }
});
```

#### `download(key: string, options?: DownloadOptions): Promise<DownloadResult>`

Download a file.

```typescript
const result = await storage.download('path/to/file.pdf');
console.log(result.data);         // Buffer
console.log(result.metadata.size); // File size
```

#### `delete(key: string, options?: DeleteOptions): Promise<boolean>`

Delete a file.

```typescript
const deleted = await storage.delete('path/to/file.pdf');
console.log('Deleted:', deleted);
```

#### `list(options?: ListOptions): Promise<ListResult>`

List files.

```typescript
const result = await storage.list({
  prefix: 'uploads/',
  maxKeys: 100
});
console.log('Files:', result.files.length);
```

#### `exists(key: string): Promise<boolean>`

Check if file exists.

```typescript
const exists = await storage.exists('path/to/file.pdf');
console.log('File exists:', exists);
```

#### `getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string>`

Generate signed URL for temporary access.

```typescript
const url = await storage.getSignedUrl('private-file.pdf', {
  expiresIn: 3600 // 1 hour
});
console.log('Access URL:', url);
```

#### `copy(sourceKey: string, destinationKey: string, options?: CopyOptions): Promise<UploadResult>`

Copy a file.

```typescript
const result = await storage.copy(
  'source/file.pdf',
  'destination/file.pdf'
);
```

#### `move(sourceKey: string, destinationKey: string, options?: CopyOptions): Promise<UploadResult>`

Move a file.

```typescript
const result = await storage.move(
  'old-location/file.pdf',
  'new-location/file.pdf'
);
```

#### `uploadFromUrl(url: string, options?: UploadOptions): Promise<UploadResult>`

Upload file from URL.

```typescript
const result = await storage.uploadFromUrl(
  'https://example.com/image.jpg'
);
```

#### `getStats(): StorageStats`

Get storage statistics.

```typescript
const stats = storage.getStats();
console.log('Total uploads:', stats.totalUploads);
console.log('Bytes uploaded:', stats.bytesUploaded);
console.log('Average upload time:', stats.averageUploadTime);
```

#### `cleanup(): Promise<void>`

Cleanup resources.

```typescript
await storage.cleanup();
```

## Examples

### AWS S3 Storage

```typescript
import { createStorageService } from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 's3',
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: 'us-west-2',
    bucket: 'my-production-bucket'
  },
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf']
});

// Upload image
const imageBuffer = await fs.readFile('photo.jpg');
const result = await storage.upload(imageBuffer, 'photo.jpg', {
  visibility: 'public',
  metadata: {
    uploadedBy: 'user-123',
    originalName: 'vacation-photo.jpg'
  }
});

console.log('Image URL:', result.url);
console.log('S3 Key:', result.key);
console.log('ETag:', result.etag);
```

### Local File Storage

```typescript
import { createStorageService } from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 'local',
  local: {
    basePath: '/var/www/uploads',
    urlPrefix: '/uploads'
  },
  maxFileSize: 20 * 1024 * 1024 // 20MB
});

// Upload file
const fileBuffer = Buffer.from('Hello World');
const result = await storage.upload(fileBuffer, 'greeting.txt');

console.log('Local path:', result.key);
console.log('Public URL:', result.url); // /uploads/1234_abc_greeting.txt

// List files in directory
const files = await storage.list({ prefix: 'documents/' });
files.files.forEach(file => {
  console.log(`${file.key} - ${file.size} bytes`);
});
```

### Google Cloud Storage

```typescript
import { createStorageService } from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 'gcs',
  gcs: {
    projectId: 'my-project-id',
    keyFilename: './service-account-key.json',
    bucket: 'my-gcs-bucket'
  }
});

// Upload with progress tracking
const largeFile = await fs.readFile('video.mp4');
const result = await storage.upload(largeFile, 'video.mp4', {
  contentType: 'video/mp4',
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
});

console.log('GCS URL:', result.url);
```

### Azure Blob Storage

```typescript
import { createStorageService } from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 'azure',
  azure: {
    accountName: 'mystorageaccount',
    accountKey: process.env.AZURE_STORAGE_KEY!,
    containerName: 'uploads'
  }
});

// Upload document
const docBuffer = await fs.readFile('report.pdf');
const result = await storage.upload(docBuffer, 'report.pdf', {
  metadata: {
    department: 'sales',
    quarter: 'Q1-2024'
  }
});

console.log('Azure Blob URL:', result.url);
```

### Cloudflare R2 Storage

```typescript
import { createStorageService } from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 'cloudflare-r2',
  cloudflareR2: {
    accountId: process.env.CF_ACCOUNT_ID!,
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
    bucket: 'my-r2-bucket'
  }
});

// Upload file to R2
const fileBuffer = await fs.readFile('data.json');
const result = await storage.upload(fileBuffer, 'data.json', {
  visibility: 'public',
  metadata: {
    version: '1.0',
    environment: 'production'
  }
});

console.log('R2 URL:', result.url);
console.log('ETag:', result.etag);
```

### File Upload with Validation

```typescript
import {
  createStorageService,
  StorageError,
  StorageErrorType
} from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 's3',
  s3: { /* config */ },
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
});

try {
  const file = req.file; // From express-fileupload
  const result = await storage.upload(file.data, file.name, {
    contentType: file.mimetype
  });

  res.json({
    success: true,
    url: result.url,
    size: result.size
  });
} catch (error) {
  if (error instanceof StorageError) {
    if (error.type === StorageErrorType.FILE_SIZE_ERROR) {
      res.status(413).json({ error: 'File too large' });
    } else if (error.type === StorageErrorType.MIME_TYPE_ERROR) {
      res.status(415).json({ error: 'Unsupported file type' });
    } else {
      res.status(500).json({ error: 'Upload failed' });
    }
  }
}
```

### Signed URLs for Private Files

```typescript
import { createStorageService } from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 's3',
  s3: { /* config */ }
});

// Upload private file
const result = await storage.upload(fileBuffer, 'private-doc.pdf', {
  visibility: 'private'
});

// Generate signed URL valid for 1 hour
const signedUrl = await storage.getSignedUrl(result.key, {
  expiresIn: 3600
});

// Send URL to authorized user
res.json({
  downloadUrl: signedUrl,
  expiresAt: Date.now() + 3600000
});
```

### File Operations (Copy, Move)

```typescript
import { createStorageService } from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 's3',
  s3: { /* config */ }
});

// Copy file to backup location
await storage.copy(
  'documents/important.pdf',
  'backups/2024/important.pdf'
);

// Move file to archive
await storage.move(
  'temp/processed-file.csv',
  'archive/2024-03/processed-file.csv'
);

// Check if file exists before operating
if (await storage.exists('documents/old-file.pdf')) {
  await storage.delete('documents/old-file.pdf');
  console.log('Old file deleted');
}
```

### Upload from External URL

```typescript
import { createStorageService } from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 's3',
  s3: { /* config */ }
});

// Download image from external URL and upload to storage
const result = await storage.uploadFromUrl(
  'https://example.com/images/logo.png',
  {
    key: 'logos/company-logo.png',
    visibility: 'public'
  }
);

console.log('Logo uploaded to:', result.url);
```

### Batch File Operations

```typescript
import { createStorageService } from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 's3',
  s3: { /* config */ }
});

// Upload multiple files
const files = ['file1.pdf', 'file2.pdf', 'file3.pdf'];
const uploadPromises = files.map(async (filename) => {
  const buffer = await fs.readFile(filename);
  return storage.upload(buffer, filename);
});

const results = await Promise.all(uploadPromises);
console.log(`Uploaded ${results.length} files`);

// List and delete old files
const list = await storage.list({ prefix: 'temp/' });
const deletePromises = list.files
  .filter(file => {
    const dayOld = Date.now() - 24 * 60 * 60 * 1000;
    return file.lastModified.getTime() < dayOld;
  })
  .map(file => storage.delete(file.key));

await Promise.all(deletePromises);
console.log('Old temp files deleted');
```

### Monitoring Storage Statistics

```typescript
import { createStorageService } from '@capsulas/capsules/storage';

const storage = await createStorageService({
  provider: 's3',
  s3: { /* config */ }
});

// Perform operations
await storage.upload(file1, 'doc1.pdf');
await storage.upload(file2, 'doc2.pdf');
await storage.download('doc1.pdf');

// Check statistics
const stats = storage.getStats();
console.log('=== Storage Statistics ===');
console.log(`Total uploads: ${stats.totalUploads}`);
console.log(`Total downloads: ${stats.totalDownloads}`);
console.log(`Total deletes: ${stats.totalDeletes}`);
console.log(`Bytes uploaded: ${stats.bytesUploaded}`);
console.log(`Bytes downloaded: ${stats.bytesDownloaded}`);
console.log(`Average upload time: ${stats.averageUploadTime}ms`);
console.log(`Average download time: ${stats.averageDownloadTime}ms`);
console.log(`Failed operations: ${stats.failedOperations}`);

console.log('\nBy Provider:');
Object.entries(stats.byProvider).forEach(([provider, count]) => {
  console.log(`  ${provider}: ${count} operations`);
});
```

## Error Types

The Storage Capsule includes specialized error types:

- `UPLOAD_FAILED` - Upload operation failed
- `DOWNLOAD_FAILED` - Download operation failed
- `DELETE_FAILED` - Delete operation failed
- `NOT_FOUND` - File does not exist
- `PERMISSION_DENIED` - Insufficient permissions
- `QUOTA_EXCEEDED` - Storage quota exceeded
- `INVALID_CONFIG` - Invalid configuration
- `FILE_SIZE_ERROR` - File exceeds maximum size
- `MIME_TYPE_ERROR` - MIME type not allowed
- `BUCKET_ERROR` - Bucket/container error
- `NETWORK_ERROR` - Network connectivity issue
- `VALIDATION_ERROR` - Validation failed

## Best Practices

1. **Security**: Never expose storage credentials in client code
2. **Validation**: Always validate file size and type before upload
3. **Signed URLs**: Use signed URLs for private file access
4. **Cleanup**: Delete temporary files regularly
5. **Monitoring**: Track storage usage with statistics
6. **Backups**: Implement backup strategies for critical files
7. **Naming**: Use consistent file naming conventions
8. **Metadata**: Store useful metadata with files for tracking

## License

MIT
