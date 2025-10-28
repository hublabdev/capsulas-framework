/**
 * Capsulas Mock - Simplified demo versions
 *
 * This file provides mock implementations of the capsulas for demo purposes.
 * In a real app, you would import from the actual capsule packages.
 */

// Simple in-memory implementations for demo

// Logger Mock
export class LoggerService {
  constructor(config) {
    this.config = config;
    this.stats = { totalLogs: 0, errorCount: 0, warnCount: 0, infoCount: 0, debugCount: 0 };
  }

  async initialize() {
    console.log('📋 Logger initialized');
  }

  info(message, meta = {}) {
    this.stats.totalLogs++;
    this.stats.infoCount++;
    console.log(`[INFO] ${message}`, meta);
  }

  warn(message, meta = {}) {
    this.stats.totalLogs++;
    this.stats.warnCount++;
    console.log(`[WARN] ${message}`, meta);
  }

  error(message, meta = {}) {
    this.stats.totalLogs++;
    this.stats.errorCount++;
    console.error(`[ERROR] ${message}`, meta);
  }

  debug(message, meta = {}) {
    this.stats.totalLogs++;
    this.stats.debugCount++;
    if (this.config.level === 'debug') {
      console.log(`[DEBUG] ${message}`, meta);
    }
  }

  getStats() {
    return { ...this.stats };
  }

  async cleanup() {}
}

// Cache Mock
export class CacheService {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, hitRate: 0 };
  }

  async initialize() {
    console.log('💾 Cache initialized');
  }

  async get(key) {
    if (this.cache.has(key)) {
      this.stats.hits++;
      const entry = this.cache.get(key);
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        this.cache.delete(key);
        this.stats.misses++;
        return null;
      }
      this.updateHitRate();
      return entry.value;
    }
    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  async set(key, value, ttl = 3600) {
    this.stats.sets++;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl * 1000)
    });
  }

  async delete(key) {
    this.stats.deletes++;
    return this.cache.delete(key);
  }

  updateHitRate() {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? Math.round((this.stats.hits / total) * 100) : 0;
  }

  getStats() {
    return { ...this.stats };
  }

  async cleanup() {
    this.cache.clear();
  }
}

// JWT Auth Mock
export class JWTAuthService {
  constructor(config) {
    this.config = config;
    this.stats = { totalSigned: 0, totalVerified: 0, totalRefreshed: 0, failedVerifications: 0 };
    this.blacklist = new Set();
  }

  async initialize() {
    console.log('🔐 JWT Auth initialized');
  }

  hashPassword(password) {
    // Simple hash for demo (use bcrypt in production)
    const salt = Math.random().toString(36).substring(2, 15);
    const hash = Buffer.from(password + salt).toString('base64');
    return { hash, salt };
  }

  verifyPassword(password, hash, salt) {
    const testHash = Buffer.from(password + salt).toString('base64');
    return testHash === hash;
  }

  async sign(payload, type = 'access') {
    this.stats.totalSigned++;
    const token = Buffer.from(JSON.stringify({
      ...payload,
      iat: Date.now(),
      exp: Date.now() + (type === 'refresh' ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000),
      type
    })).toString('base64');

    return {
      token,
      expiresAt: Date.now() + (type === 'refresh' ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000),
      type,
      payload
    };
  }

  async createTokenPair(payload) {
    const accessResult = await this.sign(payload, 'access');
    const refreshResult = await this.sign(payload, 'refresh');

    return {
      accessToken: accessResult.token,
      refreshToken: refreshResult.token,
      accessExpiresAt: accessResult.expiresAt,
      refreshExpiresAt: refreshResult.expiresAt
    };
  }

  async verify(token) {
    this.stats.totalVerified++;
    if (this.blacklist.has(token)) {
      this.stats.failedVerifications++;
      return { valid: false, error: 'Token blacklisted' };
    }

    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      if (payload.exp < Date.now()) {
        this.stats.failedVerifications++;
        return { valid: false, error: 'Token expired', expired: true };
      }
      return { valid: true, payload };
    } catch {
      this.stats.failedVerifications++;
      return { valid: false, error: 'Invalid token' };
    }
  }

  async verifyFromHeader(authHeader) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return { valid: false, error: 'No token provided' };
    }
    return this.verify(token);
  }

  async revokeToken(token) {
    this.blacklist.add(token);
  }

  getStats() {
    return { ...this.stats };
  }

  async cleanup() {
    this.blacklist.clear();
  }
}

// File Upload Mock
export class FileUploadService {
  constructor(config) {
    this.config = config;
    this.stats = { totalUploads: 0, failedUploads: 0, bytesUploaded: 0, averageUploadTime: 0, byMimeType: {}, byExtension: {} };
    this.uploadTimes = [];
  }

  async initialize() {
    console.log('📤 File Upload initialized');
  }

  async upload(buffer, originalName, options = {}) {
    const startTime = Date.now();

    try {
      const ext = originalName.split('.').pop();
      const mimeType = options.metadata?.mimeType || 'application/octet-stream';
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.stats.totalUploads++;
      this.stats.bytesUploaded += buffer.length;
      this.stats.byMimeType[mimeType] = (this.stats.byMimeType[mimeType] || 0) + 1;
      this.stats.byExtension[ext] = (this.stats.byExtension[ext] || 0) + 1;

      const uploadTime = Date.now() - startTime;
      this.uploadTimes.push(uploadTime);
      if (this.uploadTimes.length > 100) this.uploadTimes.shift();
      this.stats.averageUploadTime = Math.round(this.uploadTimes.reduce((a, b) => a + b, 0) / this.uploadTimes.length);

      return {
        id: fileId,
        originalName,
        filename: `${fileId}_${originalName}`,
        path: `/uploads/${fileId}_${originalName}`,
        size: buffer.length,
        mimeType,
        extension: ext,
        uploadedAt: Date.now(),
        metadata: options.metadata,
        thumbnails: options.generateThumbnails ? [
          { name: 'small', url: `/uploads/thumbnails/${fileId}_small.jpg`, width: 150, height: 150 },
          { name: 'medium', url: `/uploads/thumbnails/${fileId}_medium.jpg`, width: 300, height: 300 }
        ] : []
      };
    } catch (error) {
      this.stats.failedUploads++;
      throw error;
    }
  }

  getStats() {
    return { ...this.stats };
  }

  async cleanup() {}
}

// Storage Mock
export class StorageService {
  constructor(config) {
    this.config = config;
    this.stats = { totalUploads: 0, totalDownloads: 0, bytesUploaded: 0, bytesDownloaded: 0 };
  }

  async initialize() {
    console.log('📦 Storage initialized');
  }

  async upload(buffer, filename) {
    this.stats.totalUploads++;
    this.stats.bytesUploaded += buffer.length;

    return {
      key: filename,
      url: `/storage/${filename}`,
      size: buffer.length,
      contentType: 'application/octet-stream',
      uploadedAt: Date.now(),
      provider: 'local'
    };
  }

  getStats() {
    return { ...this.stats };
  }

  async cleanup() {}
}

// Email Mock
export class EmailService {
  constructor(config) {
    this.config = config;
    this.stats = { totalSent: 0, totalFailed: 0, successRate: 100 };
  }

  async initialize() {
    console.log('✉️ Email initialized');
  }

  async send(options) {
    try {
      console.log(`📧 Email sent to: ${options.to.email}`);
      console.log(`   Subject: ${options.subject}`);
      this.stats.totalSent++;
      this.stats.successRate = Math.round((this.stats.totalSent / (this.stats.totalSent + this.stats.totalFailed)) * 100);
      return { success: true, messageId: `msg_${Date.now()}` };
    } catch (error) {
      this.stats.totalFailed++;
      this.stats.successRate = Math.round((this.stats.totalSent / (this.stats.totalSent + this.stats.totalFailed)) * 100);
      throw error;
    }
  }

  getStats() {
    return { ...this.stats };
  }

  async cleanup() {}
}

// Validator Mock
export class ValidatorService {
  constructor(config) {
    this.config = config;
    this.stats = { totalValidations: 0, totalErrors: 0 };
  }

  async initialize() {
    console.log('✓ Validator initialized');
  }

  async validateField(name, value, options) {
    this.stats.totalValidations++;
    const errors = [];

    if (options.rules.required && !value) {
      errors.push(`${name} is required`);
    }

    if (options.rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push(`${name} must be a valid email`);
    }

    if (options.rules.minLength && value && value.length < options.rules.minLength) {
      errors.push(`${name} must be at least ${options.rules.minLength} characters`);
    }

    if (options.rules.maxLength && value && value.length > options.rules.maxLength) {
      errors.push(`${name} must be at most ${options.rules.maxLength} characters`);
    }

    if (errors.length > 0) {
      this.stats.totalErrors += errors.length;
    }

    return errors;
  }

  getStats() {
    return { ...this.stats };
  }

  async cleanup() {}
}

// Encryption Mock
export class EncryptionService {
  constructor(config) {
    this.config = config;
  }

  async initialize() {
    console.log('🔒 Encryption initialized');
  }

  encrypt(text) {
    // Simple demo encryption (use real crypto in production)
    const encrypted = Buffer.from(text).toString('base64');
    return {
      encrypted,
      iv: 'demo-iv',
      authTag: 'demo-tag',
      algorithm: this.config.algorithm
    };
  }

  decrypt(encrypted, iv, authTag) {
    return {
      decrypted: Buffer.from(encrypted, 'base64').toString(),
      algorithm: this.config.algorithm,
      verified: true
    };
  }

  async cleanup() {}
}

// HTTP Mock
export class HttpService {
  constructor(config) {
    this.config = config;
    this.stats = { totalRequests: 0, totalErrors: 0, averageResponseTime: 0 };
  }

  async initialize() {
    console.log('🌐 HTTP Client initialized');
  }

  getStats() {
    return { ...this.stats };
  }

  async cleanup() {}
}

// Create all instances
export const logger = new LoggerService({ level: 'info' });
export const cache = new CacheService({ backend: 'memory' });
export const auth = new JWTAuthService({ secret: 'demo-secret', algorithm: 'HS256' });
export const validator = new ValidatorService({ strictMode: true });
export const fileUpload = new FileUploadService({ uploadDir: './uploads', maxFileSize: 10 * 1024 * 1024 });
export const storage = new StorageService({ provider: 'local' });
export const email = new EmailService({ provider: 'smtp' });
export const encryption = new EncryptionService({ key: 'demo-key', algorithm: 'aes-256-gcm' });
export const http = new HttpService({ baseURL: 'https://api.example.com' });

// In-memory data stores
export const users = new Map();
export const sessions = new Map();
export const posts = new Map();

// Initialize all
await logger.initialize();
await cache.initialize();
await auth.initialize();
await validator.initialize();
await fileUpload.initialize();
await storage.initialize();
await email.initialize();
await encryption.initialize();
await http.initialize();

logger.info('✨ All Capsulas initialized successfully!');

export async function cleanupCapsulas() {
  await logger.cleanup();
  await cache.cleanup();
  await auth.cleanup();
  await validator.cleanup();
  await fileUpload.cleanup();
  await storage.cleanup();
  await email.cleanup();
  await encryption.cleanup();
  await http.cleanup();
}
