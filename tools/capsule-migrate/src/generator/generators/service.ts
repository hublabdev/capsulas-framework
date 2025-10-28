/**
 * Service file generator - generates service.ts with lifecycle methods
 * @module capsule-migrate/generator/generators/service
 */

import { TemplateContext, GeneratorOptions } from '../../types';

/**
 * Generate service.ts file
 */
export async function generateService(
  context: TemplateContext,
  options: GeneratorOptions
): Promise<string> {
  const { capsule } = context;
  const className = toPascalCase(capsule.name);

  const code = `/**
 * ${capsule.name} service implementation
 * @category ${capsule.category}
 * @module @capsulas/${capsule.id}/service
 */

import type {
  ${className}Config,
  ${className}Input,
  ${className}Result,
  ${className}Stats,
  ${className}ServiceState,
  ${className}Event,
  ${className}EventHandler,
} from './types';
import {
  ${className}Error,
  InitializationError,
  ExecutionError,
  ConfigurationError,
  ValidationError,
} from './errors';
import {
  DEFAULT_CONFIG,
  INITIAL_STATS,
  ERROR_MESSAGES,
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY_BASE,
  RETRY_BACKOFF_MULTIPLIER,
} from './constants';
${generateAdditionalImports(context)}

/**
 * ${capsule.name} service class
 */
export class ${className}Service {
  private config: Required<${className}Config>;
  private stats: ${className}Stats;
  private state: ${className}ServiceState = 'uninitialized';
  private startTime: number = 0;
  private eventHandlers: Map<${className}Event, Set<${className}EventHandler>> = new Map();
${generatePrivateProperties(context)}

  constructor(config: ${className}Config = {}) {
    this.config = this.validateAndMergeConfig(config);
    this.stats = { ...INITIAL_STATS };
    this.startTime = Date.now();
  }

  // ==========================================================================
  // Lifecycle Methods
  // ==========================================================================

  /**
   * Initialize the service
   * Must be called before execute()
   */
  async initialize(): Promise<void> {
    if (this.state === 'ready') {
      throw new InitializationError(ERROR_MESSAGES.ALREADY_INITIALIZED);
    }

    if (this.state === 'initializing') {
      throw new InitializationError('Initialization already in progress');
    }

    this.state = 'initializing';
    this.emit('initialized', { timestamp: Date.now() });

    try {
      // TODO: Implement initialization logic
      ${generateInitializationLogic(context)}

      this.state = 'ready';
      this.stats.uptime = Date.now() - this.startTime;

      if (this.config.debug) {
        console.log(\`[\${className}] Service initialized successfully\`);
      }
    } catch (error: any) {
      this.state = 'error';
      throw new InitializationError(
        \`Failed to initialize service: \${error.message}\`,
        { originalError: error }
      );
    }
  }

  /**
   * Execute the main service operation
   * @param input - Input parameters
   * @returns Execution result
   */
  async execute(input: ${className}Input): Promise<${className}Result> {
    if (this.state !== 'ready') {
      throw new ExecutionError(ERROR_MESSAGES.NOT_INITIALIZED);
    }

    const startTime = Date.now();
    this.state = 'executing';
    this.stats.totalOperations++;

    this.emit('execute:start', { input, timestamp: startTime });

    try {
      // Validate input
      this.validateInput(input);

      // Execute with timeout
      const result = await this.executeWithTimeout(input);

      // Update statistics
      const executionTime = Date.now() - startTime;
      this.updateStats(true, executionTime);

      this.state = 'ready';
      this.emit('execute:success', { result, executionTime });

      return result;
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime);

      this.state = 'error';
      this.emit('execute:error', { error, executionTime });

      if (error instanceof ${className}Error) {
        throw error;
      }

      throw new ExecutionError(
        \`Execution failed: \${error.message}\`,
        { originalError: error, input }
      );
    } finally {
      this.state = 'ready';
    }
  }

  /**
   * Clean up resources and shut down the service
   */
  async cleanup(): Promise<void> {
    if (this.state === 'uninitialized') {
      return; // Nothing to clean up
    }

    this.state = 'cleanup';
    this.emit('cleanup', { timestamp: Date.now() });

    try {
      // TODO: Implement cleanup logic
      ${generateCleanupLogic(context)}

      this.state = 'uninitialized';
      this.eventHandlers.clear();

      if (this.config.debug) {
        console.log(\`[\${className}] Service cleaned up successfully\`);
      }
    } catch (error: any) {
      throw new ${className}Error(
        'CLEANUP_ERROR' as any,
        \`Cleanup failed: \${error.message}\`,
        { originalError: error }
      );
    }
  }

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  /**
   * Get current service statistics
   */
  getStats(): ${className}Stats {
    return {
      ...this.stats,
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.state === 'ready' || this.state === 'executing';
  }

  /**
   * Get current service state
   */
  getState(): ${className}ServiceState {
    return this.state;
  }

  /**
   * Register event handler
   */
  on(event: ${className}Event, handler: ${className}EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Unregister event handler
   */
  off(event: ${className}Event, handler: ${className}EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = { ...INITIAL_STATS };
    this.startTime = Date.now();
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Validate and merge configuration
   */
  private validateAndMergeConfig(config: ${className}Config): Required<${className}Config> {
    try {
      const mergedConfig = {
        ...DEFAULT_CONFIG,
        ...config,
      };

      // Validate configuration
      if (mergedConfig.timeout < 0) {
        throw new Error('Timeout must be non-negative');
      }

      if (mergedConfig.retryAttempts < 0 || mergedConfig.retryAttempts > MAX_RETRY_ATTEMPTS) {
        throw new Error(\`Retry attempts must be between 0 and \${MAX_RETRY_ATTEMPTS}\`);
      }

      if (mergedConfig.retryDelay < 0) {
        throw new Error('Retry delay must be non-negative');
      }

      return mergedConfig;
    } catch (error: any) {
      throw new ConfigurationError(
        \`Invalid configuration: \${error.message}\`,
        { config, originalError: error }
      );
    }
  }

  /**
   * Validate input parameters
   */
  private validateInput(input: ${className}Input): void {
    if (!input || typeof input !== 'object') {
      throw new ValidationError(
        'Input must be an object',
        { input }
      );
    }

    // TODO: Add specific input validation
    ${generateInputValidation(context)}
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout(input: ${className}Input): Promise<${className}Result> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new ${className}Error(
          'TIMEOUT_ERROR' as any,
          ERROR_MESSAGES.OPERATION_TIMEOUT,
          { timeout: this.config.timeout }
        ));
      }, this.config.timeout);

      this.executeInternal(input)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Internal execution logic
   */
  private async executeInternal(input: ${className}Input): Promise<${className}Result> {
    try {
      // TODO: Implement actual execution logic
      ${generateExecutionLogic(context)}

      return {
        success: true,
        data: undefined, // Replace with actual result
        metadata: {
          executedAt: new Date().toISOString(),
          executionTime: 0,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        metadata: {
          executedAt: new Date().toISOString(),
          error: error,
        },
      };
    }
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = this.config.retryAttempts
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        if (attempt < maxAttempts) {
          const delay = RETRY_DELAY_BASE * Math.pow(RETRY_BACKOFF_MULTIPLIER, attempt - 1);

          if (this.config.debug) {
            console.log(\`[\${className}] Retry attempt \${attempt}/\${maxAttempts} after \${delay}ms\`);
          }

          await this.sleep(delay);
        }
      }
    }

    throw new ExecutionError(
      \`Operation failed after \${maxAttempts} attempts\`,
      { originalError: lastError, attempts: maxAttempts }
    );
  }

  /**
   * Update statistics
   */
  private updateStats(success: boolean, executionTime: number): void {
    if (success) {
      this.stats.successfulOperations++;
    } else {
      this.stats.failedOperations++;
    }

    // Update average execution time
    const totalOps = this.stats.successfulOperations + this.stats.failedOperations;
    this.stats.averageExecutionTime =
      (this.stats.averageExecutionTime * (totalOps - 1) + executionTime) / totalOps;

    this.stats.lastExecutionTime = Date.now();
    this.stats.uptime = Date.now() - this.startTime;
  }

  /**
   * Emit event to handlers
   */
  private emit(event: ${className}Event, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(\`Error in event handler for '\${event}':\`, error);
        }
      });
    }

    this.emit('error' as ${className}Event, data);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a new ${capsule.name} service instance
 * @param config - Configuration options
 * @returns Service instance
 */
export function create${className}(config?: ${className}Config): ${className}Service {
  return new ${className}Service(config);
}

/**
 * Create and initialize a ${capsule.name} service
 * @param config - Configuration options
 * @returns Initialized service instance
 */
export async function create${className}Initialized(
  config?: ${className}Config
): Promise<${className}Service> {
  const service = new ${className}Service(config);
  await service.initialize();
  return service;
}
`;

  return code;
}

/**
 * Generate additional imports based on context
 */
function generateAdditionalImports(context: TemplateContext): string {
  const imports: string[] = [];

  if (context.hasFileSystem) {
    imports.push("import * as fs from 'fs/promises';");
    imports.push("import * as path from 'path';");
  }

  if (context.hasNetwork) {
    imports.push("// TODO: Add network library imports (axios, fetch, etc.)");
  }

  if (context.hasDatabase) {
    imports.push("// TODO: Add database library imports");
  }

  return imports.length > 0 ? '\n' + imports.join('\n') : '';
}

/**
 * Generate private properties
 */
function generatePrivateProperties(context: TemplateContext): string {
  const properties: string[] = [];

  if (context.hasNetwork) {
    properties.push('  // TODO: Add network connection properties');
  }

  if (context.hasFileSystem) {
    properties.push('  // TODO: Add file system state properties');
  }

  if (context.hasDatabase) {
    properties.push('  // TODO: Add database connection properties');
  }

  return properties.length > 0 ? '\n' + properties.join('\n') : '';
}

/**
 * Generate initialization logic
 */
function generateInitializationLogic(context: TemplateContext): string {
  const logic: string[] = [];

  if (context.hasNetwork) {
    logic.push('      // TODO: Initialize network connections');
  }

  if (context.hasFileSystem) {
    logic.push('      // TODO: Verify file system access and create directories');
  }

  if (context.hasDatabase) {
    logic.push('      // TODO: Establish database connection');
  }

  if (logic.length === 0) {
    logic.push('      // Add initialization logic here');
  }

  return logic.join('\n');
}

/**
 * Generate cleanup logic
 */
function generateCleanupLogic(context: TemplateContext): string {
  const logic: string[] = [];

  if (context.hasNetwork) {
    logic.push('      // TODO: Close network connections');
  }

  if (context.hasFileSystem) {
    logic.push('      // TODO: Clean up file system resources');
  }

  if (context.hasDatabase) {
    logic.push('      // TODO: Close database connections');
  }

  if (logic.length === 0) {
    logic.push('      // Add cleanup logic here');
  }

  return logic.join('\n');
}

/**
 * Generate input validation
 */
function generateInputValidation(context: TemplateContext): string {
  return '// Add specific validation rules for your input parameters';
}

/**
 * Generate execution logic
 */
function generateExecutionLogic(context: TemplateContext): string {
  const logic: string[] = [];

  logic.push('      // Implement your main business logic here');

  if (context.hasNetwork) {
    logic.push('      // Example: Make network request');
  }

  if (context.hasFileSystem) {
    logic.push('      // Example: Read/write files');
  }

  if (context.hasDatabase) {
    logic.push('      // Example: Execute database queries');
  }

  return logic.join('\n');
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
