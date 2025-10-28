/**
 * Types file generator - generates types.ts with all type definitions
 * @module capsule-migrate/generator/generators/types
 */

import { TemplateContext, GeneratorOptions, InterfaceDefinition, TypeDefinition } from '../../types';

/**
 * Generate types.ts file
 */
export async function generateTypes(
  context: TemplateContext,
  options: GeneratorOptions
): Promise<string> {
  const { capsule, types, interfaces } = context;
  const className = toPascalCase(capsule.name);

  const code = `/**
 * Type definitions for ${capsule.name} capsule
 * @category ${capsule.category}
 * @module @capsulas/${capsule.id}/types
 */

// ============================================================================
// Platform Types
// ============================================================================

export type Platform = 'node' | 'web' | 'mobile' | 'desktop' | 'universal';

// ============================================================================
// Extracted Types
// ============================================================================

${generateExtractedTypes(types)}

// ============================================================================
// Extracted Interfaces
// ============================================================================

${generateExtractedInterfaces(interfaces)}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configuration options for ${capsule.name}
 */
export interface ${className}Config {
${generateConfigProperties(context)}
}

// ============================================================================
// Input/Output
// ============================================================================

/**
 * Input parameters for ${capsule.name} execution
 */
export interface ${className}Input {
  // TODO: Define input parameters based on capsule functionality
  [key: string]: any;
}

/**
 * Execution result from ${capsule.name}
 */
export interface ${className}Result {
  /**
   * Whether the execution was successful
   */
  success: boolean;

  /**
   * Result data (if successful)
   */
  data?: any;

  /**
   * Error message (if failed)
   */
  error?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Statistics for ${capsule.name} operations
 */
export interface ${className}Stats {
  /**
   * Total number of operations executed
   */
  totalOperations: number;

  /**
   * Number of successful operations
   */
  successfulOperations: number;

  /**
   * Number of failed operations
   */
  failedOperations: number;

  /**
   * Average execution time (milliseconds)
   */
  averageExecutionTime: number;

  /**
   * Last execution timestamp
   */
  lastExecutionTime?: number;

  /**
   * Service uptime (milliseconds)
   */
  uptime: number;

${generateAdditionalStatsProperties(context)}
}

// ============================================================================
// Service Interface
// ============================================================================

/**
 * ${className} service interface
 */
export interface ${className}Service {
  /**
   * Initialize the service
   */
  initialize(): Promise<void>;

  /**
   * Execute the main service operation
   * @param input - Input parameters
   * @returns Execution result
   */
  execute(input: ${className}Input): Promise<${className}Result>;

  /**
   * Clean up resources and shut down the service
   */
  cleanup(): Promise<void>;

  /**
   * Get current service statistics
   * @returns Service statistics
   */
  getStats(): ${className}Stats;

  /**
   * Check if service is initialized
   * @returns True if initialized
   */
  isInitialized(): boolean;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Partial configuration (all fields optional)
 */
export type Partial${className}Config = Partial<${className}Config>;

/**
 * Required configuration fields
 */
export type Required${className}Config = Required<${className}Config>;

/**
 * Service state
 */
export type ${className}ServiceState = 'uninitialized' | 'initializing' | 'ready' | 'executing' | 'error' | 'cleanup';

/**
 * Operation status
 */
export type ${className}OperationStatus = 'pending' | 'running' | 'success' | 'failed';

// ============================================================================
// Event Types
// ============================================================================

/**
 * Event types emitted by ${capsule.name}
 */
export type ${className}Event =
  | 'initialized'
  | 'execute:start'
  | 'execute:success'
  | 'execute:error'
  | 'cleanup'
  | 'error';

/**
 * Event handler type
 */
export type ${className}EventHandler = (data?: any) => void;

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Validator function type
 */
export type ValidatorFunction<T = any> = (value: T) => ValidationResult;
`;

  return code;
}

/**
 * Generate extracted type definitions
 */
function generateExtractedTypes(types: TypeDefinition[]): string {
  if (types.length === 0) {
    return '// No additional types found in original capsule';
  }

  return types
    .filter(t => t.exported)
    .map(t => {
      const jsdoc = t.jsdoc ? `/**\n * ${t.jsdoc}\n */\n` : '';
      return `${jsdoc}export type ${t.name} = ${t.definition};`;
    })
    .join('\n\n');
}

/**
 * Generate extracted interface definitions
 */
function generateExtractedInterfaces(interfaces: InterfaceDefinition[]): string {
  if (interfaces.length === 0) {
    return '// No additional interfaces found in original capsule';
  }

  return interfaces
    .filter(i => i.exported)
    .filter(i => !i.name.endsWith('Config') && !i.name.endsWith('Options')) // Exclude config interfaces
    .map(i => {
      const jsdoc = i.jsdoc ? `/**\n * ${i.jsdoc}\n */\n` : '';
      const extendsClause = i.extends && i.extends.length > 0
        ? ` extends ${i.extends.join(', ')}`
        : '';

      const properties = i.properties
        .map(p => {
          const propJsdoc = p.jsdoc ? `  /**\n   * ${p.jsdoc}\n   */\n` : '';
          const optional = p.optional ? '?' : '';
          const readonly = p.readonly ? 'readonly ' : '';
          return `${propJsdoc}  ${readonly}${p.name}${optional}: ${p.type};`;
        })
        .join('\n');

      return `${jsdoc}export interface ${i.name}${extendsClause} {\n${properties}\n}`;
    })
    .join('\n\n');
}

/**
 * Generate config properties
 */
function generateConfigProperties(context: TemplateContext): string {
  const properties: string[] = [];

  // Always include these base properties
  properties.push(`  /**
   * Enable debug logging
   */
  debug?: boolean;`);

  properties.push(`  /**
   * Timeout for operations (milliseconds)
   */
  timeout?: number;`);

  properties.push(`  /**
   * Number of retry attempts on failure
   */
  retryAttempts?: number;`);

  properties.push(`  /**
   * Delay between retries (milliseconds)
   */
  retryDelay?: number;`);

  // Add context-specific properties
  if (context.hasNetwork) {
    properties.push(`  /**
   * Network request timeout (milliseconds)
   */
  networkTimeout?: number;`);

    properties.push(`  /**
   * Maximum number of concurrent connections
   */
  maxConnections?: number;`);
  }

  if (context.hasFileSystem) {
    properties.push(`  /**
   * Base directory path
   */
  basePath?: string;`);

    properties.push(`  /**
   * File encoding
   */
  encoding?: BufferEncoding;`);
  }

  if (context.hasDatabase) {
    properties.push(`  /**
   * Database connection string
   */
  connectionString?: string;`);

    properties.push(`  /**
   * Connection pool size
   */
  poolSize?: number;`);
  }

  // Add extracted config properties from original capsule
  if (context.configs && context.configs.length > 0) {
    for (const config of context.configs) {
      const optional = config.required ? '' : '?';
      properties.push(`  /**
   * ${config.description || config.name}
   */
  ${config.name}${optional}: ${config.type};`);
    }
  }

  return properties.join('\n\n');
}

/**
 * Generate additional stats properties
 */
function generateAdditionalStatsProperties(context: TemplateContext): string {
  const properties: string[] = [];

  if (context.hasNetwork) {
    properties.push(`  /**
   * Total bytes sent
   */
  bytesSent?: number;

  /**
   * Total bytes received
   */
  bytesReceived?: number;`);
  }

  if (context.hasFileSystem) {
    properties.push(`  /**
   * Number of files processed
   */
  filesProcessed?: number;

  /**
   * Total bytes written
   */
  bytesWritten?: number;`);
  }

  if (context.hasDatabase) {
    properties.push(`  /**
   * Total queries executed
   */
  queriesExecuted?: number;

  /**
   * Active connections
   */
  activeConnections?: number;`);
  }

  return properties.length > 0 ? '\n' + properties.join('\n\n') : '';
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
