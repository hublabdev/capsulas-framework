# Capsule Architecture Standard

**Version**: 1.0.0
**Last Updated**: October 26, 2025

## Analysis of Existing Capsules

After analyzing all 23 existing capsules, I've identified the best architectural patterns:

### Best Patterns Found

**From capsule-auth-jwt** (⭐ Best Architecture):
- ✅ Clean separation: `core/`, `adapters/`, `examples/`, `tests/`
- ✅ Service class with dependency injection
- ✅ Platform-agnostic core with adapter pattern
- ✅ Complete TypeScript types in separate file
- ✅ Comprehensive statistics tracking
- ✅ Factory functions for easy instantiation
- ✅ Detailed error handling with custom error types

**From capsule-database**:
- ✅ Multi-adapter support (PostgreSQL, MySQL, MongoDB)
- ✅ Connection pooling
- ✅ Query builder pattern

**From capsule-ai-chat**:
- ✅ Streaming support
- ✅ Multiple provider adapters

**From capsule-auth-oauth**:
- ✅ PKCE implementation
- ✅ Multiple OAuth providers in one capsule

### Common Structure Across All

```
capsule-name/
├── index.ts              # Main export file
├── package.json          # Package definition
├── tsconfig.json         # TypeScript config
├── README.md             # Documentation
├── core/
│   ├── service.ts        # Main service class
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # Helper functions
├── adapters/
│   ├── interfaces.ts     # Adapter contracts
│   └── implementations/
│       ├── provider-a.ts
│       └── provider-b.ts
├── examples/             # Usage examples
│   └── basic.ts
└── tests/                # Unit tests
    └── service.test.ts
```

---

## THE STANDARD CAPSULE ARCHITECTURE

Based on analysis, here's the homogeneous pattern all 300 capsules should follow:

### File Structure (Mandatory)

```
packages/capsules/src/[capsule-name]/
├── index.ts              # ✅ Public API exports
├── service.ts            # ✅ Main service class
├── types.ts              # ✅ TypeScript interfaces
├── adapters.ts           # ✅ Platform adapters (if needed)
├── utils.ts              # ✅ Helper functions
├── errors.ts             # ✅ Custom error classes
├── constants.ts          # ✅ Constants and defaults
├── examples.ts           # ✅ Usage examples
└── README.md             # ✅ Documentation
```

### 1. types.ts - Type Definitions

```typescript
/**
 * @capsulas/capsules - [Capsule Name] Types
 * Complete TypeScript type definitions
 */

/**
 * Configuration for the capsule
 */
export interface [CapsuleName]Config {
  // Required config
  requiredField: string;

  // Optional config with defaults
  optionalField?: string;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * Input parameters for execute()
 */
export interface [CapsuleName]Input {
  field1: string;
  field2?: number;
}

/**
 * Output/Result from execute()
 */
export interface [CapsuleName]Result {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    timestamp: Date;
    duration: number;
  };
}

/**
 * Statistics tracking
 */
export interface [CapsuleName]Stats {
  operationsPerformed: number;
  operationsSucceeded: number;
  operationsFailed: number;
  averageDuration: number;
}

/**
 * Platform information (for adapters)
 */
export interface PlatformInfo {
  type: 'web' | 'node' | 'mobile' | 'desktop';
  userAgent?: string;
  version?: string;
}
```

### 2. errors.ts - Custom Errors

```typescript
/**
 * @capsulas/capsules - [Capsule Name] Errors
 * Custom error types for better error handling
 */

export enum [CapsuleName]ErrorType {
  CONFIG_ERROR = 'CONFIG_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  EXECUTION_ERROR = 'EXECUTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class [CapsuleName]Error extends Error {
  public readonly type: [CapsuleName]ErrorType;
  public readonly originalError?: any;
  public readonly timestamp: Date;

  constructor(
    type: [CapsuleName]ErrorType,
    message: string,
    originalError?: any
  ) {
    super(message);
    this.name = '[CapsuleName]Error';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date();

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, [CapsuleName]Error);
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      timestamp: this.timestamp,
      originalError: this.originalError?.message,
    };
  }
}
```

### 3. constants.ts - Constants

```typescript
/**
 * @capsulas/capsules - [Capsule Name] Constants
 * Default values and configuration constants
 */

export const DEFAULT_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const SUPPORTED_VERSIONS = ['1.0', '2.0'] as const;

export const ERROR_MESSAGES = {
  MISSING_CONFIG: 'Configuration is required',
  INVALID_INPUT: 'Invalid input parameters',
  OPERATION_FAILED: 'Operation failed',
} as const;
```

### 4. utils.ts - Helper Functions

```typescript
/**
 * @capsulas/capsules - [Capsule Name] Utils
 * Helper functions and utilities
 */

/**
 * Validate configuration
 */
export function validateConfig(config: any): boolean {
  if (!config) return false;
  // Add validation logic
  return true;
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Parse timeout string (e.g., "30s", "5m")
 */
export function parseTimeout(timeout: string | number): number {
  if (typeof timeout === 'number') return timeout;

  const match = timeout.match(/^(\d+)(ms|s|m|h)$/);
  if (!match) throw new Error(`Invalid timeout format: ${timeout}`);

  const [, value, unit] = match;
  const multipliers = { ms: 1, s: 1000, m: 60000, h: 3600000 };

  return parseInt(value) * multipliers[unit as keyof typeof multipliers];
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### 5. adapters.ts - Platform Adapters (if needed)

```typescript
/**
 * @capsulas/capsules - [Capsule Name] Adapters
 * Platform-specific implementations
 */

import { [CapsuleName]Config } from './types';

/**
 * Adapter interface
 */
export interface [CapsuleName]Adapter {
  initialize?(): Promise<void>;
  execute(input: any, config: [CapsuleName]Config): Promise<any>;
  cleanup?(): Promise<void>;
}

/**
 * Node.js adapter
 */
export class Node[CapsuleName]Adapter implements [CapsuleName]Adapter {
  async execute(input: any, config: [CapsuleName]Config): Promise<any> {
    // Node.js-specific implementation
    return {};
  }
}

/**
 * Web/Browser adapter
 */
export class Web[CapsuleName]Adapter implements [CapsuleName]Adapter {
  async execute(input: any, config: [CapsuleName]Config): Promise<any> {
    // Browser-specific implementation
    return {};
  }
}

/**
 * Auto-detect platform and return appropriate adapter
 */
export function createAdapter(): [CapsuleName]Adapter {
  if (typeof window !== 'undefined') {
    return new Web[CapsuleName]Adapter();
  }
  return new Node[CapsuleName]Adapter();
}
```

### 6. service.ts - Main Service Class

```typescript
/**
 * @capsulas/capsules - [Capsule Name] Service
 * Main service implementation
 */

import {
  [CapsuleName]Config,
  [CapsuleName]Input,
  [CapsuleName]Result,
  [CapsuleName]Stats,
} from './types';
import { [CapsuleName]Error, [CapsuleName]ErrorType } from './errors';
import { DEFAULT_CONFIG } from './constants';
import { validateConfig, retryWithBackoff } from './utils';
import { [CapsuleName]Adapter, createAdapter } from './adapters';

/**
 * Main [Capsule Name] Service
 */
export class [CapsuleName]Service {
  private config: Required<[CapsuleName]Config>;
  private adapter: [CapsuleName]Adapter;
  private stats: [CapsuleName]Stats;
  private initialized: boolean = false;

  constructor(
    config: [CapsuleName]Config,
    adapter?: [CapsuleName]Adapter
  ) {
    // Validate config
    if (!validateConfig(config)) {
      throw new [CapsuleName]Error(
        [CapsuleName]ErrorType.CONFIG_ERROR,
        'Invalid configuration'
      );
    }

    // Merge with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    } as Required<[CapsuleName]Config>;

    // Use provided adapter or auto-detect
    this.adapter = adapter || createAdapter();

    // Initialize stats
    this.stats = {
      operationsPerformed: 0,
      operationsSucceeded: 0,
      operationsFailed: 0,
      averageDuration: 0,
    };
  }

  /**
   * Initialize the service (async setup if needed)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (this.adapter.initialize) {
        await this.adapter.initialize();
      }
      this.initialized = true;
    } catch (error) {
      throw new [CapsuleName]Error(
        [CapsuleName]ErrorType.CONFIG_ERROR,
        'Failed to initialize service',
        error
      );
    }
  }

  /**
   * Main execute method
   */
  async execute(input: [CapsuleName]Input): Promise<[CapsuleName]Result> {
    const startTime = Date.now();
    this.stats.operationsPerformed++;

    try {
      // Ensure initialized
      if (!this.initialized) {
        await this.initialize();
      }

      // Validate input
      if (!input) {
        throw new [CapsuleName]Error(
          [CapsuleName]ErrorType.VALIDATION_ERROR,
          'Input is required'
        );
      }

      // Execute with retry logic
      const data = await retryWithBackoff(
        () => this.adapter.execute(input, this.config),
        this.config.retryAttempts
      );

      // Update stats
      const duration = Date.now() - startTime;
      this.stats.operationsSucceeded++;
      this.updateAverageDuration(duration);

      return {
        success: true,
        data,
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    } catch (error) {
      this.stats.operationsFailed++;

      return {
        success: false,
        error: error instanceof [CapsuleName]Error
          ? error.message
          : 'Unknown error occurred',
        metadata: {
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Get current statistics
   */
  getStats(): [CapsuleName]Stats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      operationsPerformed: 0,
      operationsSucceeded: 0,
      operationsFailed: 0,
      averageDuration: 0,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<[CapsuleName]Config>> {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.adapter.cleanup) {
      await this.adapter.cleanup();
    }
    this.initialized = false;
  }

  // Private helper methods
  private updateAverageDuration(duration: number): void {
    const total = this.stats.averageDuration * (this.stats.operationsSucceeded - 1) + duration;
    this.stats.averageDuration = total / this.stats.operationsSucceeded;
  }
}

/**
 * Factory function for easy service creation
 */
export function create[CapsuleName]Service(
  config: [CapsuleName]Config
): [CapsuleName]Service {
  return new [CapsuleName]Service(config);
}
```

### 7. index.ts - Public API

```typescript
/**
 * @capsulas/capsules - [Capsule Name]
 *
 * @category [Category]
 * @version 1.0.0
 */

import { defineCapsule, PORT_TYPES } from '@capsulas/core';
import { [CapsuleName]Service, create[CapsuleName]Service } from './service';
import type {
  [CapsuleName]Config,
  [CapsuleName]Input,
  [CapsuleName]Result,
} from './types';

// Export all types
export * from './types';
export * from './errors';
export * from './constants';

// Export service
export { [CapsuleName]Service, create[CapsuleName]Service };

/**
 * Capsule definition for visual editor
 */
export const [capsuleName] = defineCapsule({
  id: '[capsule-id]',
  name: '[Capsule Name]',
  description: 'Brief description of what this capsule does',
  icon: '⚡', // Choose appropriate emoji or icon
  category: 'category-name',
  version: '1.0.0',

  inputs: [
    {
      id: 'input1',
      name: 'Input 1',
      type: PORT_TYPES.STRING,
      required: true,
      description: 'Description of input 1',
    },
    {
      id: 'input2',
      name: 'Input 2',
      type: PORT_TYPES.NUMBER,
      required: false,
      description: 'Description of input 2',
    },
  ],

  outputs: [
    {
      id: 'result',
      name: 'Result',
      type: PORT_TYPES.OBJECT,
      description: 'Operation result',
    },
    {
      id: 'error',
      name: 'Error',
      type: PORT_TYPES.STRING,
      description: 'Error message if operation failed',
    },
  ],

  /**
   * Execute the capsule
   */
  async execute(inputs, config) {
    try {
      // Create service instance
      const service = create[CapsuleName]Service({
        requiredField: config.requiredField || process.env.[ENV_VAR],
        timeout: config.timeout,
        retryAttempts: config.retryAttempts,
      });

      // Execute
      const result = await service.execute({
        field1: inputs.input1,
        field2: inputs.input2,
      });

      // Cleanup
      await service.cleanup();

      return {
        result: result.data,
        error: result.error || null,
      };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Configuration schema for visual editor
   */
  configSchema: {
    requiredField: {
      type: 'string',
      required: true,
      description: 'Required configuration field',
      placeholder: 'Enter value',
    },
    timeout: {
      type: 'number',
      required: false,
      description: 'Timeout in milliseconds',
      default: 30000,
    },
    retryAttempts: {
      type: 'number',
      required: false,
      description: 'Number of retry attempts',
      default: 3,
    },
  },

  /**
   * Environment variables
   */
  environmentVariables: [
    {
      name: '[ENV_VAR_NAME]',
      description: 'Description of environment variable',
      required: true,
      secret: true,
    },
  ],

  /**
   * Usage examples
   */
  examples: [
    {
      name: 'Basic Usage',
      description: 'Simple example of using this capsule',
      code: `
const result = await [capsuleName].execute(
  { input1: 'value' },
  { requiredField: 'config-value' }
);
console.log(result);
      `.trim(),
    },
  ],

  /**
   * Setup instructions
   */
  setupInstructions: `
# [Capsule Name] Setup

1. Obtain necessary credentials/API keys
2. Set environment variables:
   \`\`\`bash
   [ENV_VAR_NAME]=your-value
   \`\`\`
3. Configure the capsule
4. Start using!
  `.trim(),

  /**
   * Troubleshooting
   */
  troubleshooting: {
    'common-error-1': {
      problem: 'Description of the problem',
      solution: 'How to fix it',
    },
  },
});

export default [capsuleName];
```

### 8. README.md - Documentation

```markdown
# [Capsule Name]

Brief description of the capsule.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install @capsulas/capsules
\`\`\`

## Usage

\`\`\`typescript
import { create[CapsuleName]Service } from '@capsulas/capsules';

const service = create[CapsuleName]Service({
  requiredField: 'value',
});

const result = await service.execute({
  field1: 'input',
});

console.log(result);
\`\`\`

## Configuration

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| requiredField | string | Yes | - | Required field |
| timeout | number | No | 30000 | Timeout in ms |

## API Reference

See TypeScript types for complete API documentation.

## Examples

See `examples.ts` for more examples.

## License

MIT
```

---

## Summary: Standard Capsule Checklist

Every capsule MUST have:

1. ✅ **types.ts** - All TypeScript interfaces
2. ✅ **errors.ts** - Custom error classes
3. ✅ **constants.ts** - Default values
4. ✅ **utils.ts** - Helper functions
5. ✅ **adapters.ts** - Platform adapters (if multi-platform)
6. ✅ **service.ts** - Main service class with:
   - Constructor with config validation
   - initialize() method
   - execute() main method
   - getStats() statistics
   - cleanup() resource cleanup
7. ✅ **index.ts** - Capsule definition with defineCapsule()
8. ✅ **README.md** - Documentation

### Code Quality Standards

- ✅ Full TypeScript with strict mode
- ✅ JSDoc comments on all public methods
- ✅ Error handling with custom error types
- ✅ Statistics tracking
- ✅ Retry logic with exponential backoff
- ✅ Resource cleanup
- ✅ Environment variable support
- ✅ Configuration validation
- ✅ Examples and documentation
- ✅ Troubleshooting guide

### Testing Requirements

- ✅ Unit tests for service class
- ✅ Integration tests for adapters
- ✅ Error scenario tests
- ✅ >80% code coverage

---

This standard ensures all 300 capsules are:
- **Consistent** - Same structure and patterns
- **Maintainable** - Easy to understand and modify
- **Testable** - Designed for testing
- **Documented** - Complete documentation
- **Production-ready** - Error handling, stats, cleanup
- **AI-friendly** - Clear patterns for AI assistance
