/**
 * Logger Capsule - Adapters
 *
 * Transport implementations for different output destinations
 */

import {
  Transport,
  TransportOptions,
  ConsoleTransportOptions,
  FileTransportOptions,
  HttpTransportOptions,
  LogEntry,
  LogLevel,
  Platform,
} from './types';
import {
  colorizedFormatter,
  simpleFormatter,
  getPlatformCapabilities,
  detectPlatform,
  ensureDirectory,
  getFileSize,
} from './utils';
import {
  FileWriteError,
  NetworkError,
  TransportError,
  RotationError,
  parseFileSystemError,
  parseNetworkError,
} from './errors';
import {
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_MAX_FILES,
  DEFAULT_BATCH_SIZE,
  DEFAULT_BATCH_INTERVAL,
  DEFAULT_HTTP_TIMEOUT,
  DEFAULT_RETRY_ATTEMPTS,
  RETRY_DELAY_BASE,
  RETRY_BACKOFF_MULTIPLIER,
} from './constants';

// ============================================================================
// CONSOLE TRANSPORT
// ============================================================================

/**
 * Console transport - logs to stdout/stderr
 */
export class ConsoleTransport extends Transport {
  private colors: boolean;
  private stderrLevels: Set<LogLevel>;
  private timestamp: boolean;

  constructor(options: ConsoleTransportOptions = {}) {
    super(options);

    const capabilities = getPlatformCapabilities();
    this.colors = options.colors ?? capabilities.supportsConsoleColors;
    this.stderrLevels = new Set(options.stderr || ['error', 'fatal']);
    this.timestamp = options.timestamp ?? true;

    // Use colorized formatter if colors supported
    if (!this.formatter || this.formatter === super.format) {
      this.formatter = this.colors ? colorizedFormatter : simpleFormatter;
    }
  }

  write(log: LogEntry): void {
    if (!this.shouldLog(log)) return;

    const formatted = this.format(log);
    const useStderr = this.stderrLevels.has(log.level);

    if (useStderr) {
      console.error(formatted);
    } else {
      console.log(formatted);
    }
  }

  close(): void {
    // Nothing to close for console
  }
}

// ============================================================================
// FILE TRANSPORT
// ============================================================================

/**
 * File transport - logs to file with rotation support
 */
export class FileTransport extends Transport {
  private filename: string;
  private maxSize: number;
  private maxFiles: number;
  private append: boolean;
  private compress: boolean;
  private currentSize: number = 0;
  private writeStream: any = null;
  private platform: Platform;

  constructor(options: FileTransportOptions) {
    super(options);

    this.platform = detectPlatform();
    const capabilities = getPlatformCapabilities(this.platform);

    if (!capabilities.supportsFileSystem) {
      throw new TransportError(
        'File transport not supported on this platform',
        'FileTransport'
      );
    }

    this.filename = options.filename;
    this.maxSize = options.maxSize || DEFAULT_MAX_FILE_SIZE;
    this.maxFiles = (options.maxFiles as number) || DEFAULT_MAX_FILES;
    this.append = options.append ?? true;
    this.compress = options.compress ?? false;

    this.initializeStream();
  }

  private initializeStream(): void {
    if (this.platform !== Platform.NODE && this.platform !== Platform.DESKTOP) {
      return;
    }

    const fs = require('fs');
    const path = require('path');

    // Ensure directory exists
    const dir = path.dirname(this.filename);
    if (dir && dir !== '.') {
      const mkdirp = require('fs').promises.mkdir;
      mkdirp(dir, { recursive: true }).catch(() => {});
    }

    // Create or append to file
    const flags = this.append ? 'a' : 'w';
    this.writeStream = fs.createWriteStream(this.filename, { flags });

    // Track current size
    getFileSize(this.filename).then(size => {
      this.currentSize = size;
    });
  }

  async write(log: LogEntry): Promise<void> {
    if (!this.shouldLog(log)) return;

    try {
      const formatted = this.format(log) + '\n';
      const size = Buffer.byteLength(formatted, 'utf8');

      // Check if rotation needed
      if (this.currentSize + size > this.maxSize) {
        await this.rotate();
      }

      // Write to stream
      if (this.writeStream) {
        this.writeStream.write(formatted);
        this.currentSize += size;
      }
    } catch (error: any) {
      throw parseFileSystemError(error, this.filename);
    }
  }

  private async rotate(): Promise<void> {
    if (this.platform !== Platform.NODE && this.platform !== Platform.DESKTOP) {
      return;
    }

    try {
      const fs = require('fs').promises;
      const path = require('path');

      // Close current stream
      if (this.writeStream) {
        this.writeStream.end();
      }

      // Rotate files
      const ext = path.extname(this.filename);
      const base = this.filename.slice(0, -ext.length);

      // Remove oldest file if limit reached
      const oldestFile = `${base}.${this.maxFiles}${ext}`;
      try {
        await fs.unlink(oldestFile);
      } catch {}

      // Shift all files
      for (let i = this.maxFiles - 1; i >= 1; i--) {
        const oldFile = `${base}.${i}${ext}`;
        const newFile = `${base}.${i + 1}${ext}`;
        try {
          await fs.rename(oldFile, newFile);
        } catch {}
      }

      // Rename current file
      await fs.rename(this.filename, `${base}.1${ext}`);

      // Create new stream
      this.initializeStream();
      this.currentSize = 0;
    } catch (error: any) {
      throw new RotationError(
        `Failed to rotate log file: ${error.message}`,
        this.filename,
        error
      );
    }
  }

  async close(): Promise<void> {
    if (this.writeStream) {
      return new Promise(resolve => {
        this.writeStream.end(() => resolve());
      });
    }
  }
}

// ============================================================================
// HTTP TRANSPORT
// ============================================================================

/**
 * HTTP transport - sends logs to HTTP endpoint
 */
export class HttpTransport extends Transport {
  private url: string;
  private method: 'POST' | 'PUT' | 'PATCH';
  private headers: Record<string, string>;
  private batch: boolean;
  private batchSize: number;
  private batchInterval: number;
  private timeout: number;
  private retries: number;
  private buffer: LogEntry[] = [];
  private timer?: NodeJS.Timeout;

  constructor(options: HttpTransportOptions) {
    super(options);

    this.url = options.url;
    this.method = options.method || 'POST';
    this.headers = options.headers || {};
    this.batch = options.batch ?? true;
    this.batchSize = options.batchSize || DEFAULT_BATCH_SIZE;
    this.batchInterval = options.batchInterval || DEFAULT_BATCH_INTERVAL;
    this.timeout = options.timeout || DEFAULT_HTTP_TIMEOUT;
    this.retries = options.retries || DEFAULT_RETRY_ATTEMPTS;

    // Set default headers
    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/json';
    }

    // Add auth headers if provided
    if (options.auth) {
      if (options.auth.token) {
        this.headers['Authorization'] = `Bearer ${options.auth.token}`;
      } else if (options.auth.username && options.auth.password) {
        const credentials = Buffer.from(
          `${options.auth.username}:${options.auth.password}`
        ).toString('base64');
        this.headers['Authorization'] = `Basic ${credentials}`;
      }
    }

    // Start batch timer if batching enabled
    if (this.batch && this.batchInterval > 0) {
      this.startBatchTimer();
    }
  }

  async write(log: LogEntry): Promise<void> {
    if (!this.shouldLog(log)) return;

    if (this.batch) {
      this.buffer.push(log);

      if (this.buffer.length >= this.batchSize) {
        await this.flush();
      }
    } else {
      await this.sendLog(log);
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    await this.sendLogs(logs);
  }

  private async sendLog(log: LogEntry): Promise<void> {
    const formatted = this.format(log);
    await this.sendRequest(formatted);
  }

  private async sendLogs(logs: LogEntry[]): Promise<void> {
    const formatted = logs.map(log => this.format(log));
    await this.sendRequest(JSON.stringify(formatted));
  }

  private async sendRequest(body: string): Promise<void> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        await this.makeRequest(body);
        return; // Success
      } catch (error: any) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }

        // Wait before retry
        if (attempt < this.retries) {
          const delay = RETRY_DELAY_BASE * Math.pow(RETRY_BACKOFF_MULTIPLIER, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw parseNetworkError(lastError, this.url);
  }

  private async makeRequest(body: string): Promise<void> {
    // Use fetch if available (modern environments)
    if (typeof fetch !== 'undefined') {
      const response = await fetch(this.url, {
        method: this.method,
        headers: this.headers,
        body,
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          this.url,
          response.status
        );
      }
      return;
    }

    // Fallback to Node.js http/https
    const https = require('https');
    const http = require('http');
    const urlModule = require('url');

    return new Promise((resolve, reject) => {
      const parsedUrl = new urlModule.URL(this.url);
      const lib = parsedUrl.protocol === 'https:' ? https : http;

      const req = lib.request(
        {
          method: this.method,
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname + parsedUrl.search,
          headers: this.headers,
          timeout: this.timeout,
        },
        (res: any) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(
              new NetworkError(
                `HTTP ${res.statusCode}: ${res.statusMessage}`,
                this.url,
                res.statusCode
              )
            );
          }
        }
      );

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new NetworkError('Request timeout', this.url));
      });

      req.write(body);
      req.end();
    });
  }

  private startBatchTimer(): void {
    this.timer = setInterval(() => {
      this.flush().catch(() => {
        // Ignore flush errors in timer
      });
    }, this.batchInterval);

    // Don't block process exit
    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  async close(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
    }

    await this.flush();
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create console transport
 */
export function createConsoleTransport(
  options: ConsoleTransportOptions = {}
): ConsoleTransport {
  return new ConsoleTransport(options);
}

/**
 * Create file transport
 */
export function createFileTransport(options: FileTransportOptions): FileTransport {
  return new FileTransport(options);
}

/**
 * Create HTTP transport
 */
export function createHttpTransport(options: HttpTransportOptions): HttpTransport {
  return new HttpTransport(options);
}
