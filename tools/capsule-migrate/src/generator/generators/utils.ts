/**
 * Utils file generator - generates utils.ts with helper functions
 * @module capsule-migrate/generator/generators/utils
 */

import { TemplateContext, GeneratorOptions, FunctionDefinition } from '../../types';

/**
 * Generate utils.ts file
 */
export async function generateUtils(
  context: TemplateContext,
  options: GeneratorOptions
): Promise<string> {
  const { capsule, functions } = context;
  const className = toPascalCase(capsule.name);

  const code = `/**
 * Utility functions for ${capsule.name} capsule
 * @category ${capsule.category}
 * @module @capsulas/${capsule.id}/utils
 */

import type { ${className}Config, ValidationResult } from './types';
import { ValidationError } from './errors';

// ============================================================================
// Configuration Utilities
// ============================================================================

/**
 * Validate configuration object
 * @param config - Configuration to validate
 * @returns Validation result
 */
export function validateConfig(config: ${className}Config): ValidationResult {
  const errors: string[] = [];

  if (config.timeout !== undefined && (config.timeout < 0 || config.timeout > 300000)) {
    errors.push('Timeout must be between 0 and 300000ms');
  }

  if (config.retryAttempts !== undefined && (config.retryAttempts < 0 || config.retryAttempts > 10)) {
    errors.push('Retry attempts must be between 0 and 10');
  }

  if (config.retryDelay !== undefined && config.retryDelay < 0) {
    errors.push('Retry delay must be non-negative');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deep merge two configuration objects
 * @param defaults - Default configuration
 * @param overrides - Configuration overrides
 * @returns Merged configuration
 */
export function mergeConfig<T extends Record<string, any>>(
  defaults: T,
  overrides: Partial<T>
): T {
  return {
    ...defaults,
    ...overrides,
  };
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Check if value is defined and not null
 * @param value - Value to check
 * @returns True if defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if value is a non-empty string
 * @param value - Value to check
 * @returns True if non-empty string
 */
export function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if value is a valid number
 * @param value - Value to check
 * @returns True if valid number
 */
export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is a positive number
 * @param value - Value to check
 * @returns True if positive number
 */
export function isPositiveNumber(value: any): value is number {
  return isValidNumber(value) && value > 0;
}

/**
 * Check if value is a non-negative number
 * @param value - Value to check
 * @returns True if non-negative number
 */
export function isNonNegativeNumber(value: any): value is number {
  return isValidNumber(value) && value >= 0;
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Sanitize string input (remove dangerous characters)
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input.replace(/[<>\"']/g, '');
}

/**
 * Truncate string to maximum length
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Convert string to camelCase
 * @param str - String to convert
 * @returns camelCase string
 */
export function toCamelCase(str: string): string {
  return str
    .split(/[-_\\s]+/)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

/**
 * Convert string to PascalCase
 * @param str - String to convert
 * @returns PascalCase string
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_\\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert string to snake_case
 * @param str - String to convert
 * @returns snake_case string
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/[A-Z]/g, letter => \`_\${letter.toLowerCase()}\`)
    .replace(/^_/, '')
    .replace(/[-\\s]+/g, '_')
    .toLowerCase();
}

// ============================================================================
// Async Utilities
// ============================================================================

/**
 * Sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 * @param operation - Operation to retry
 * @param maxAttempts - Maximum retry attempts
 * @param baseDelay - Base delay in milliseconds
 * @param backoffMultiplier - Backoff multiplier
 * @returns Operation result
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Execute operation with timeout
 * @param operation - Operation to execute
 * @param timeoutMs - Timeout in milliseconds
 * @returns Operation result
 */
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    operation,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(\`Operation timed out after \${timeoutMs}ms\`)), timeoutMs)
    ),
  ]);
}

// ============================================================================
// Object Utilities
// ============================================================================

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if two objects are deeply equal
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns True if equal
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Pick specific keys from an object
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns Object with picked keys
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific keys from an object
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns Object without omitted keys
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Convert unknown error to Error instance
 * @param error - Unknown error value
 * @returns Error instance
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}

/**
 * Get error message from unknown error
 * @param error - Unknown error value
 * @returns Error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Check if error is of specific type
 * @param error - Error to check
 * @param errorType - Error type constructor
 * @returns True if error is of type
 */
export function isErrorOfType<T extends Error>(
  error: unknown,
  errorType: new (...args: any[]) => T
): error is T {
  return error instanceof errorType;
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Chunk array into smaller arrays
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from array
 * @param array - Array with duplicates
 * @returns Array without duplicates
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array items by key
 * @param array - Array to group
 * @param keyFn - Function to get grouping key
 * @returns Grouped items
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

// ============================================================================
// Extracted Functions
// ============================================================================

${generateExtractedFunctions(functions)}
`;

  return code;
}

/**
 * Generate extracted utility functions from original capsule
 */
function generateExtractedFunctions(functions: FunctionDefinition[]): string {
  if (functions.length === 0) {
    return '// No additional utility functions found in original capsule';
  }

  return functions
    .filter(f => f.exported && !f.name.startsWith('create'))
    .map(f => {
      const jsdoc = f.jsdoc ? `/**\n * ${f.jsdoc}\n */\n` : '/**\n * TODO: Add function description\n */\n';
      const asyncModifier = f.async ? 'async ' : '';
      const params = f.params.map(p => `${p.name}: ${p.type}`).join(', ');

      return `${jsdoc}export ${asyncModifier}function ${f.name}(${params}): ${f.returnType} {
  // TODO: Implement function logic
  throw new Error('Not implemented');
}`;
    })
    .join('\n\n');
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
