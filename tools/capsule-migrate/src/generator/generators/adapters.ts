/**
 * Adapters file generator - generates adapters.ts for platform-specific implementations
 * @module capsule-migrate/generator/generators/adapters
 */

import { TemplateContext, GeneratorOptions } from '../../types';

/**
 * Generate adapters.ts file
 */
export async function generateAdapters(
  context: TemplateContext,
  options: GeneratorOptions
): Promise<string> {
  const { capsule } = context;
  const className = toPascalCase(capsule.name);

  if (!context.isMultiPlatform) {
    // Single platform - simple implementation
    return generateSinglePlatformAdapter(context);
  }

  // Multi-platform - adapter pattern
  return generateMultiPlatformAdapters(context);
}

/**
 * Generate single-platform adapter (simpler)
 */
function generateSinglePlatformAdapter(context: TemplateContext): string {
  const { capsule } = context;
  const className = toPascalCase(capsule.name);

  return `/**
 * Adapter implementation for ${capsule.name} capsule
 * @category ${capsule.category}
 * @module @capsulas/${capsule.id}/adapters
 */

// ============================================================================
// Platform Detection
// ============================================================================

export type Platform = 'node' | 'web' | 'mobile' | 'desktop' | 'universal';

/**
 * Detect current platform
 */
export function detectPlatform(): Platform {
  // Node.js environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return 'node';
  }

  // Web browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'web';
  }

  // Fallback
  return 'universal';
}

/**
 * Get platform capabilities
 */
export function getPlatformCapabilities() {
  const platform = detectPlatform();

  return {
    platform,
    supportsFileSystem: platform === 'node' || platform === 'desktop',
    supportsNetwork: true,
    supportsStorage: true,
    supportsWorkers: platform !== 'mobile',
  };
}

// ============================================================================
// Platform-Specific Implementations
// ============================================================================

// TODO: Add platform-specific implementation logic here
`;
}

/**
 * Generate multi-platform adapters
 */
function generateMultiPlatformAdapters(context: TemplateContext): string {
  const { capsule } = context;
  const className = toPascalCase(capsule.name);

  return `/**
 * Platform-specific adapters for ${capsule.name} capsule
 * @category ${capsule.category}
 * @module @capsulas/${capsule.id}/adapters
 */

import type { ${className}Config, Platform } from './types';

// ============================================================================
// Adapter Interface
// ============================================================================

/**
 * Base adapter interface
 */
export interface ${className}Adapter {
  name: string;
  platform: Platform;

  /**
   * Initialize the adapter
   */
  initialize(config: ${className}Config): Promise<void>;

  /**
   * Execute platform-specific operation
   */
  execute(input: any): Promise<any>;

  /**
   * Clean up adapter resources
   */
  cleanup(): Promise<void>;

  /**
   * Check if adapter is available on current platform
   */
  isAvailable(): boolean;
}

// ============================================================================
// Node.js Adapter
// ============================================================================

export class NodeAdapter implements ${className}Adapter {
  name = 'node';
  platform: Platform = 'node';

  async initialize(config: ${className}Config): Promise<void> {
    // TODO: Initialize Node.js-specific resources
  }

  async execute(input: any): Promise<any> {
    // TODO: Implement Node.js-specific logic
    throw new Error('Not implemented');
  }

  async cleanup(): Promise<void> {
    // TODO: Clean up Node.js-specific resources
  }

  isAvailable(): boolean {
    return typeof process !== 'undefined' && !!process.versions?.node;
  }
}

// ============================================================================
// Web Adapter
// ============================================================================

export class WebAdapter implements ${className}Adapter {
  name = 'web';
  platform: Platform = 'web';

  async initialize(config: ${className}Config): Promise<void> {
    // TODO: Initialize Web-specific resources
  }

  async execute(input: any): Promise<any> {
    // TODO: Implement Web-specific logic
    throw new Error('Not implemented');
  }

  async cleanup(): Promise<void> {
    // TODO: Clean up Web-specific resources
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
}

// ============================================================================
// Universal Adapter (Fallback)
// ============================================================================

export class UniversalAdapter implements ${className}Adapter {
  name = 'universal';
  platform: Platform = 'universal';

  async initialize(config: ${className}Config): Promise<void> {
    // Universal initialization
  }

  async execute(input: any): Promise<any> {
    // Universal execution logic
    throw new Error('Not implemented');
  }

  async cleanup(): Promise<void> {
    // Universal cleanup
  }

  isAvailable(): boolean {
    return true;
  }
}

// ============================================================================
// Adapter Factory
// ============================================================================

/**
 * Create appropriate adapter for current platform
 */
export function createAdapter(): ${className}Adapter {
  // Try Node adapter
  const nodeAdapter = new NodeAdapter();
  if (nodeAdapter.isAvailable()) {
    return nodeAdapter;
  }

  // Try Web adapter
  const webAdapter = new WebAdapter();
  if (webAdapter.isAvailable()) {
    return webAdapter;
  }

  // Fallback to universal
  return new UniversalAdapter();
}

/**
 * Get all available adapters
 */
export function getAvailableAdapters(): ${className}Adapter[] {
  const adapters = [
    new NodeAdapter(),
    new WebAdapter(),
    new UniversalAdapter(),
  ];

  return adapters.filter(adapter => adapter.isAvailable());
}

/**
 * Detect current platform
 */
export function detectPlatform(): Platform {
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'node';
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'web';
  }

  return 'universal';
}
`;
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
