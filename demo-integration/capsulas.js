/**
 * Capsulas Integration Demo
 *
 * This module initializes and exports all Capsulas services for the demo app.
 * Demonstrates how multiple capsules work together in a real application.
 */

import { LoggerService } from '../packages/capsules/src/logger/service.js';
import { CacheService } from '../packages/capsules/src/cache/service.js';
import { JWTAuthService } from '../packages/capsules/src/jwt-auth/service.js';
import { FileUploadService } from '../packages/capsules/src/file-upload/service.js';
import { StorageService } from '../packages/capsules/src/storage/service.js';
import { EncryptionService } from '../packages/capsules/src/encryption/service.js';
import { EmailService } from '../packages/capsules/src/email/service.js';
import { ValidatorService } from '../packages/capsules/src/validator/service.js';
import { HttpService } from '../packages/capsules/src/http/service.js';

// ============================================================================
// STEP 1: Initialize Logger (for all app logging)
// ============================================================================
console.log('📦 Initializing Capsulas...\n');

export const logger = new LoggerService({
  level: 'info',
  format: 'json',
  transports: ['console', 'file'],
  filename: './logs/app.log',
});

await logger.initialize();
logger.info('Logger Capsule initialized ✓');

// ============================================================================
// STEP 2: Initialize Cache (for session storage and performance)
// ============================================================================
export const cache = new CacheService({
  backend: 'memory',
  ttl: 3600,
  maxSize: 100,
});

await cache.initialize();
logger.info('Cache Capsule initialized ✓');

// ============================================================================
// STEP 3: Initialize Encryption (for sensitive data)
// ============================================================================
export const encryption = new EncryptionService({
  key: 'your-super-secret-encryption-key-32-chars!!',
  algorithm: 'aes-256-gcm',
});

await encryption.initialize();
logger.info('Encryption Capsule initialized ✓');

// ============================================================================
// STEP 4: Initialize JWT Auth (for authentication)
// ============================================================================
export const auth = new JWTAuthService({
  secret: 'your-jwt-secret-key-should-be-very-secure-and-random',
  algorithm: 'HS256',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'capsulas-demo-app',
  audience: 'capsulas-users',
});

await auth.initialize();
logger.info('JWT Auth Capsule initialized ✓');

// ============================================================================
// STEP 5: Initialize Validator (for input validation)
// ============================================================================
export const validator = new ValidatorService({
  strictMode: true,
});

await validator.initialize();
logger.info('Validator Capsule initialized ✓');

// ============================================================================
// STEP 6: Initialize File Upload (for user uploads)
// ============================================================================
export const fileUpload = new FileUploadService({
  uploadDir: './uploads',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
  strategy: 'direct',
  generateThumbnails: true,
  thumbnailSizes: [
    { name: 'small', width: 150, height: 150, fit: 'cover' },
    { name: 'medium', width: 300, height: 300, fit: 'cover' },
  ],
});

await fileUpload.initialize();
logger.info('File Upload Capsule initialized ✓');

// ============================================================================
// STEP 7: Initialize Storage (for cloud storage)
// ============================================================================
export const storage = new StorageService({
  provider: 'local',
  local: {
    basePath: './storage',
    urlPrefix: '/storage',
  },
  maxFileSize: 50 * 1024 * 1024, // 50MB
});

await storage.initialize();
logger.info('Storage Capsule initialized ✓');

// ============================================================================
// STEP 8: Initialize Email (for notifications)
// ============================================================================
export const email = new EmailService({
  provider: 'smtp',
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'demo@example.com',
      pass: 'demo-password',
    },
  },
  from: {
    name: 'Capsulas Demo',
    email: 'noreply@capsulas-demo.com',
  },
});

await email.initialize();
logger.info('Email Capsule initialized ✓');

// ============================================================================
// STEP 9: Initialize HTTP Client (for external API calls)
// ============================================================================
export const http = new HttpService({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
});

await http.initialize();
logger.info('HTTP Client Capsule initialized ✓');

// ============================================================================
// In-Memory User Database (for demo purposes)
// ============================================================================
export const users = new Map();
export const sessions = new Map();
export const posts = new Map();

logger.info('\n✨ All Capsulas initialized successfully!');
logger.info('================================================\n');

/**
 * Cleanup all capsules on shutdown
 */
export async function cleanupCapsulas() {
  logger.info('Cleaning up capsulas...');

  await logger.cleanup();
  await cache.cleanup();
  await encryption.cleanup();
  await auth.cleanup();
  await validator.cleanup();
  await fileUpload.cleanup();
  await storage.cleanup();
  await email.cleanup();
  await http.cleanup();

  console.log('✓ All capsulas cleaned up');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await cleanupCapsulas();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanupCapsulas();
  process.exit(0);
});
