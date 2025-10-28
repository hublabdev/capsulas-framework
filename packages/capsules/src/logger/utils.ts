/**
 * Logger Capsule - Utils
 *
 * Helper functions for logging operations
 */

import { LogEntry, LogLevel, Formatter, Platform, PlatformCapabilities } from './types';
import { COLORS, DEFAULT_SERIALIZER_OPTIONS, MAX_MESSAGE_LENGTH } from './constants';

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

/**
 * Detect current platform
 */
export function detectPlatform(): Platform {
  if (typeof process !== 'undefined' && process.versions?.node) {
    return Platform.NODE;
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return Platform.WEB;
  }
  if (typeof process !== 'undefined' && process.versions?.electron) {
    return Platform.DESKTOP;
  }
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return Platform.MOBILE;
  }
  return Platform.UNKNOWN;
}

/**
 * Get platform capabilities
 */
export function getPlatformCapabilities(platform?: Platform): PlatformCapabilities {
  const currentPlatform = platform || detectPlatform();

  switch (currentPlatform) {
    case Platform.NODE:
    case Platform.DESKTOP:
      return {
        supportsFileSystem: true,
        supportsConsoleColors: true,
        supportsStreams: true,
        supportsWorkers: true,
      };
    case Platform.WEB:
      return {
        supportsFileSystem: false,
        supportsConsoleColors: false,
        supportsStreams: false,
        supportsWorkers: true,
      };
    case Platform.MOBILE:
      return {
        supportsFileSystem: true,
        supportsConsoleColors: false,
        supportsStreams: false,
        supportsWorkers: false,
      };
    default:
      return {
        supportsFileSystem: false,
        supportsConsoleColors: false,
        supportsStreams: false,
        supportsWorkers: false,
      };
  }
}

// ============================================================================
// FORMATTERS
// ============================================================================

/**
 * JSON formatter
 */
export function jsonFormatter(log: LogEntry): string {
  return JSON.stringify(log);
}

/**
 * Pretty formatter (human-readable)
 */
export function prettyFormatter(log: LogEntry): string {
  const timestamp = log.timestamp.toISOString();
  const level = log.level.toUpperCase().padEnd(5);
  const message = log.message;

  let output = `[${timestamp}] ${level} ${message}`;

  if (log.namespace) {
    output = `[${timestamp}] ${level} [${log.namespace}] ${message}`;
  }

  if (log.metadata && Object.keys(log.metadata).length > 0) {
    output += '\n' + JSON.stringify(log.metadata, null, 2);
  }

  if (log.error) {
    output += '\n' + formatError(log.error);
  }

  return output;
}

/**
 * Simple formatter (minimal)
 */
export function simpleFormatter(log: LogEntry): string {
  const level = log.level.toUpperCase();
  return `${level}: ${log.message}`;
}

/**
 * Logfmt formatter (key=value pairs)
 */
export function logfmtFormatter(log: LogEntry): string {
  const pairs: string[] = [
    `timestamp="${log.timestamp.toISOString()}"`,
    `level=${log.level}`,
    `message="${escapeQuotes(log.message)}"`,
  ];

  if (log.namespace) {
    pairs.push(`namespace="${log.namespace}"`);
  }

  if (log.metadata) {
    for (const [key, value] of Object.entries(log.metadata)) {
      pairs.push(`${key}="${escapeQuotes(String(value))}"`);
    }
  }

  return pairs.join(' ');
}

/**
 * Colorized formatter (with ANSI colors)
 */
export function colorizedFormatter(log: LogEntry): string {
  const capabilities = getPlatformCapabilities();
  if (!capabilities.supportsConsoleColors) {
    return simpleFormatter(log);
  }

  const color = getLevelColor(log.level);
  const reset = COLORS.reset;
  const timestamp = COLORS.dim + log.timestamp.toISOString() + reset;
  const level = color + log.level.toUpperCase().padEnd(5) + reset;
  const message = log.message;

  let output = `${timestamp} ${level} ${message}`;

  if (log.namespace) {
    output = `${timestamp} ${level} ${COLORS.cyan}[${log.namespace}]${reset} ${message}`;
  }

  if (log.metadata && Object.keys(log.metadata).length > 0) {
    output += '\n' + COLORS.dim + JSON.stringify(log.metadata, null, 2) + reset;
  }

  if (log.error) {
    output += '\n' + COLORS.red + formatError(log.error) + reset;
  }

  return output;
}

/**
 * Get ANSI color for log level
 */
function getLevelColor(level: LogLevel): string {
  switch (level) {
    case 'debug':
      return COLORS.cyan;
    case 'info':
      return COLORS.green;
    case 'warn':
      return COLORS.yellow;
    case 'error':
      return COLORS.red;
    case 'fatal':
      return COLORS.magenta;
    default:
      return COLORS.reset;
  }
}

// ============================================================================
// SERIALIZATION
// ============================================================================

/**
 * Safe JSON stringify (handles circular references)
 */
export function safeStringify(
  obj: any,
  options = DEFAULT_SERIALIZER_OPTIONS
): string {
  const seen = new WeakSet();

  return JSON.stringify(obj, (key, value) => {
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return options.circularReplacement;
      }
      seen.add(value);
    }

    // Truncate long strings
    if (typeof value === 'string' && value.length > options.maxStringLength!) {
      return value.substring(0, options.maxStringLength) + '...';
    }

    // Truncate large arrays
    if (Array.isArray(value) && value.length > options.maxArrayLength!) {
      return value.slice(0, options.maxArrayLength);
    }

    return value;
  }, 2);
}

/**
 * Serialize object with depth limit
 */
export function serializeWithDepth(obj: any, maxDepth: number = 5): any {
  if (maxDepth <= 0) return '[Max Depth]';

  if (obj === null || obj === undefined) return obj;

  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => serializeWithDepth(item, maxDepth - 1));
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = serializeWithDepth(value, maxDepth - 1);
  }

  return result;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format error object
 */
export function formatError(error: Error): string {
  let output = `${error.name}: ${error.message}`;

  if (error.stack) {
    output += '\n' + error.stack;
  }

  // Add custom error properties
  const customProps = Object.keys(error).filter(
    key => !['name', 'message', 'stack'].includes(key)
  );

  if (customProps.length > 0) {
    output += '\nAdditional properties:';
    for (const prop of customProps) {
      output += `\n  ${prop}: ${(error as any)[prop]}`;
    }
  }

  return output;
}

/**
 * Format timestamp
 */
export function formatTimestamp(
  date: Date,
  format: 'iso' | 'unix' | 'locale' = 'iso'
): string {
  switch (format) {
    case 'iso':
      return date.toISOString();
    case 'unix':
      return String(Math.floor(date.getTime() / 1000));
    case 'locale':
      return date.toLocaleString();
    default:
      return date.toISOString();
  }
}

/**
 * Truncate message if too long
 */
export function truncateMessage(message: string, maxLength = MAX_MESSAGE_LENGTH): string {
  if (message.length <= maxLength) {
    return message;
  }
  return message.substring(0, maxLength) + '...';
}

/**
 * Escape quotes in string
 */
export function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate log level
 */
export function isValidLogLevel(level: string): level is LogLevel {
  return ['debug', 'info', 'warn', 'error', 'fatal'].includes(level);
}

/**
 * Validate log entry
 */
export function validateLogEntry(entry: any): entry is LogEntry {
  return (
    entry &&
    typeof entry === 'object' &&
    entry.timestamp instanceof Date &&
    isValidLogLevel(entry.level) &&
    typeof entry.message === 'string'
  );
}

// ============================================================================
// FILE UTILITIES
// ============================================================================

/**
 * Ensure directory exists (Node.js only)
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  if (detectPlatform() !== Platform.NODE) {
    throw new Error('File system operations not supported on this platform');
  }

  const fs = require('fs').promises;
  const path = require('path');

  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Get file size (Node.js only)
 */
export async function getFileSize(filePath: string): Promise<number> {
  if (detectPlatform() !== Platform.NODE) {
    throw new Error('File system operations not supported on this platform');
  }

  const fs = require('fs').promises;

  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Format file size (bytes to human readable)
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// ============================================================================
// TIME UTILITIES
// ============================================================================

/**
 * Calculate time difference in human readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Get current timestamp
 */
export function now(): number {
  return Date.now();
}

// ============================================================================
// METADATA UTILITIES
// ============================================================================

/**
 * Merge metadata objects
 */
export function mergeMetadata(...sources: Array<Record<string, any> | undefined>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const source of sources) {
    if (source && typeof source === 'object') {
      Object.assign(result, source);
    }
  }

  return result;
}

/**
 * Clean metadata (remove undefined/null values)
 */
export function cleanMetadata(metadata: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}
