/**
 * Index file generator - generates index.ts with public API exports
 * @module capsule-migrate/generator/generators/index
 */

import { TemplateContext, GeneratorOptions } from '../../types';

/**
 * Generate index.ts file
 */
export async function generateIndex(
  context: TemplateContext,
  options: GeneratorOptions
): Promise<string> {
  const { capsule } = context;
  const className = toPascalCase(capsule.name);

  const code = `/**
 * Public API for ${capsule.name} capsule
 * @category ${capsule.category}
 * @module @capsulas/${capsule.id}
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  Platform,
  ${className}Config,
  ${className}Input,
  ${className}Result,
  ${className}Stats,
  ${className}Service as I${className}Service,
  ${className}ServiceState,
  ${className}Event,
  ${className}EventHandler,
  Partial${className}Config,
  Required${className}Config,
  ${className}OperationStatus,
  ValidationResult,
  ValidatorFunction,
} from './types';

// ============================================================================
// Error Exports
// ============================================================================

export {
  ${className}ErrorType,
  ${className}Error,
  ConfigurationError,
  ValidationError,
  InitializationError,
  ExecutionError,
  ResourceError,
  TimeoutError,
  PermissionError,
  NotFoundError,
  is${className}Error,
  isConfigurationError,
  isValidationError,
  isInitializationError,
  isExecutionError,
  parseErrorType,
  formatError,
  getErrorSeverity,
} from './errors';

// ============================================================================
// Constants Exports
// ============================================================================

export {
  DEFAULT_CONFIG,
  INITIAL_STATS,
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY_BASE,
  RETRY_BACKOFF_MULTIPLIER,
  DEFAULT_TIMEOUT,
  MAX_TIMEOUT,
  ERROR_MESSAGES,
  VERSION,
  FEATURES,
  LIMITS,
  DEFAULTS,
} from './constants';

// ============================================================================
// Service Exports
// ============================================================================

export {
  ${className}Service,
  create${className},
  create${className}Initialized,
} from './service';

// ============================================================================
// Utility Exports
// ============================================================================

export {
  validateConfig,
  mergeConfig,
  isDefined,
  isNonEmptyString,
  isValidNumber,
  isPositiveNumber,
  isNonNegativeNumber,
  sanitizeString,
  truncate,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  sleep,
  retryWithBackoff,
  withTimeout,
  deepClone,
  deepEqual,
  pick,
  omit,
  toError,
  getErrorMessage,
  isErrorOfType,
  chunk,
  unique,
  groupBy,
} from './utils';

// ============================================================================
// Adapter Exports
// ============================================================================

export {
  ${context.isMultiPlatform ? `${className}Adapter,\n  NodeAdapter,\n  WebAdapter,\n  UniversalAdapter,\n  createAdapter,\n  getAvailableAdapters,` : ''}
  detectPlatform,
  ${context.isMultiPlatform ? '' : 'getPlatformCapabilities,'}
} from './adapters';

// ============================================================================
// Capsule Metadata
// ============================================================================

/**
 * Capsule metadata and information
 */
export const ${className}Capsule = {
  id: '${capsule.id}',
  name: '${capsule.name}',
  version: '${capsule.version}',
  category: '${capsule.category}',
  description: '${capsule.description}',
  platforms: ${JSON.stringify(capsule.platforms)},
  ${capsule.tags ? `tags: ${JSON.stringify(capsule.tags)},` : ''}
  ${capsule.author ? `author: '${capsule.author}',` : ''}
  ${capsule.license ? `license: '${capsule.license}',` : ''}

  /**
   * Create a new instance of ${capsule.name} service
   */
  create(config?: ${className}Config): ${className}Service {
    return create${className}(config);
  },

  /**
   * Create and initialize a new instance
   */
  async createInitialized(config?: ${className}Config): Promise<${className}Service> {
    return create${className}Initialized(config);
  },

  /**
   * Get default configuration
   */
  getDefaultConfig(): Required<${className}Config> {
    return { ...DEFAULT_CONFIG };
  },

  /**
   * Get capsule version
   */
  getVersion(): string {
    return VERSION;
  },

  /**
   * Get supported platforms
   */
  getPlatforms(): Platform[] {
    return ${JSON.stringify(capsule.platforms)};
  },

  /**
   * Check if platform is supported
   */
  isPlatformSupported(platform: Platform): boolean {
    return ${JSON.stringify(capsule.platforms)}.includes(platform);
  },
} as const;

// ============================================================================
// Default Export
// ============================================================================

export default ${className}Capsule;
`;

  return code;
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
