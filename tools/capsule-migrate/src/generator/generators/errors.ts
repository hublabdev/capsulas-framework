/**
 * Error file generator - generates errors.ts with minimum 8 error types
 * @module capsule-migrate/generator/generators/errors
 */

import { TemplateContext, GeneratorOptions } from '../../types';

/**
 * Generate errors.ts file
 */
export async function generateErrors(
  context: TemplateContext,
  options: GeneratorOptions
): Promise<string> {
  const { capsule } = context;
  const className = toPascalCase(capsule.name);

  // Ensure we have at least 8 error types
  const errorTypes = getErrorTypes(context);

  const code = `/**
 * Error types and classes for ${capsule.name} capsule
 * @category ${capsule.category}
 * @module @capsulas/${capsule.id}/errors
 */

// ============================================================================
// Error Types Enum
// ============================================================================

export enum ${className}ErrorType {
${errorTypes.map(type => `  ${type.constant} = '${type.constant}',`).join('\n')}
}

// ============================================================================
// Base Error Class
// ============================================================================

/**
 * Base error class for ${capsule.name} capsule
 */
export class ${className}Error extends Error {
  public readonly timestamp: number;

  constructor(
    message: string,
    public readonly type: ${className}ErrorType,
    public readonly details?: any
  ) {
    super(message);
    this.name = '${className}Error';
    this.timestamp = Date.now();

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ${className}Error);
    }
  }

  /**
   * Convert error to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Create error from unknown value
   */
  static from(error: unknown, type: ${className}ErrorType): ${className}Error {
    if (error instanceof ${className}Error) {
      return error;
    }

    if (error instanceof Error) {
      return new ${className}Error(error.message, type, {
        originalError: error,
        stack: error.stack,
      });
    }

    return new ${className}Error(
      String(error),
      type,
      { originalValue: error }
    );
  }
}

// ============================================================================
// Specific Error Classes
// ============================================================================

${errorTypes.map(type => generateSpecificErrorClass(className, type)).join('\n\n')}

// ============================================================================
// Error Type Guards
// ============================================================================

/**
 * Check if error is a ${className}Error
 */
export function is${className}Error(error: unknown): error is ${className}Error {
  return error instanceof ${className}Error;
}

${errorTypes.map(type => `/**
 * Check if error is ${type.name}
 */
export function is${type.name}(error: unknown): error is ${type.name} {
  return error instanceof ${type.name};
}`).join('\n\n')}

// ============================================================================
// Error Helpers
// ============================================================================

/**
 * Parse error type from error message or code
 */
export function parseErrorType(error: any): ${className}ErrorType {
  if (is${className}Error(error)) {
    return error.type;
  }

${generateErrorTypeParsing(errorTypes)}

  return ${className}ErrorType.UNKNOWN_ERROR;
}

/**
 * Format error for logging
 */
export function formatError(error: unknown): string {
  if (is${className}Error(error)) {
    return \`[\${error.type}] \${error.message}\${
      error.details ? ' - ' + JSON.stringify(error.details) : ''
    }\`;
  }

  if (error instanceof Error) {
    return \`[ERROR] \${error.message}\`;
  }

  return \`[ERROR] \${String(error)}\`;
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: ${className}Error): 'low' | 'medium' | 'high' | 'critical' {
  switch (error.type) {
    case ${className}ErrorType.FATAL_ERROR:
    case ${className}ErrorType.RESOURCE_EXHAUSTED_ERROR:
      return 'critical';

    case ${className}ErrorType.EXECUTION_ERROR:
    case ${className}ErrorType.TIMEOUT_ERROR:
      return 'high';

    case ${className}ErrorType.VALIDATION_ERROR:
    case ${className}ErrorType.CONFIGURATION_ERROR:
      return 'medium';

    default:
      return 'low';
  }
}
`;

  return code;
}

/**
 * Get error types for the capsule (minimum 8)
 */
function getErrorTypes(context: TemplateContext): ErrorTypeDefinition[] {
  const baseErrors: ErrorTypeDefinition[] = [
    {
      constant: 'CONFIGURATION_ERROR',
      name: 'ConfigurationError',
      description: 'Invalid configuration provided',
      defaultMessage: 'Invalid configuration',
    },
    {
      constant: 'VALIDATION_ERROR',
      name: 'ValidationError',
      description: 'Input validation failed',
      defaultMessage: 'Validation failed',
    },
    {
      constant: 'INITIALIZATION_ERROR',
      name: 'InitializationError',
      description: 'Service initialization failed',
      defaultMessage: 'Initialization failed',
    },
    {
      constant: 'EXECUTION_ERROR',
      name: 'ExecutionError',
      description: 'Execution failed',
      defaultMessage: 'Execution failed',
    },
    {
      constant: 'RESOURCE_ERROR',
      name: 'ResourceError',
      description: 'Resource not available',
      defaultMessage: 'Resource error',
    },
    {
      constant: 'TIMEOUT_ERROR',
      name: 'TimeoutError',
      description: 'Operation timed out',
      defaultMessage: 'Operation timed out',
    },
    {
      constant: 'PERMISSION_ERROR',
      name: 'PermissionError',
      description: 'Permission denied',
      defaultMessage: 'Permission denied',
    },
    {
      constant: 'NOT_FOUND_ERROR',
      name: 'NotFoundError',
      description: 'Resource not found',
      defaultMessage: 'Resource not found',
    },
  ];

  // Add context-specific errors
  const additionalErrors: ErrorTypeDefinition[] = [];

  if (context.hasNetwork) {
    additionalErrors.push({
      constant: 'NETWORK_ERROR',
      name: 'NetworkError',
      description: 'Network operation failed',
      defaultMessage: 'Network error',
    });
  }

  if (context.hasFileSystem) {
    additionalErrors.push({
      constant: 'FILE_SYSTEM_ERROR',
      name: 'FileSystemError',
      description: 'File system operation failed',
      defaultMessage: 'File system error',
    });
  }

  if (context.hasDatabase) {
    additionalErrors.push({
      constant: 'DATABASE_ERROR',
      name: 'DatabaseError',
      description: 'Database operation failed',
      defaultMessage: 'Database error',
    });
  }

  // Always add these common ones
  additionalErrors.push(
    {
      constant: 'RESOURCE_EXHAUSTED_ERROR',
      name: 'ResourceExhaustedError',
      description: 'Resource exhausted (memory, connections, etc.)',
      defaultMessage: 'Resource exhausted',
    },
    {
      constant: 'FATAL_ERROR',
      name: 'FatalError',
      description: 'Fatal error - service cannot continue',
      defaultMessage: 'Fatal error',
    },
    {
      constant: 'UNKNOWN_ERROR',
      name: 'UnknownError',
      description: 'Unknown error occurred',
      defaultMessage: 'Unknown error',
    }
  );

  return [...baseErrors, ...additionalErrors];
}

/**
 * Generate specific error class
 */
function generateSpecificErrorClass(
  className: string,
  errorType: ErrorTypeDefinition
): string {
  return `/**
 * ${errorType.description}
 */
export class ${errorType.name} extends ${className}Error {
  constructor(message: string = '${errorType.defaultMessage}', details?: any) {
    super(message, ${className}ErrorType.${errorType.constant}, details);
    this.name = '${errorType.name}';
  }
}`;
}

/**
 * Generate error type parsing logic
 */
function generateErrorTypeParsing(errorTypes: ErrorTypeDefinition[]): string {
  return errorTypes
    .filter(t => t.constant !== 'UNKNOWN_ERROR')
    .map(type => {
      const keywords = getErrorKeywords(type.constant);
      return `  // Check for ${type.constant}
  if (${keywords.map(k => `error.message?.toLowerCase().includes('${k}')`).join(' || ')}) {
    return ${type.constant.split('_ERROR')[0]}_ERROR;
  }`;
    })
    .join('\n\n');
}

/**
 * Get keywords for error type detection
 */
function getErrorKeywords(constant: string): string[] {
  const baseKeyword = constant.replace('_ERROR', '').toLowerCase();

  const keywordMap: Record<string, string[]> = {
    'configuration': ['config', 'configuration', 'settings'],
    'validation': ['validation', 'invalid', 'validate'],
    'initialization': ['initialization', 'initialize', 'init'],
    'execution': ['execution', 'execute', 'run'],
    'resource': ['resource', 'allocation'],
    'timeout': ['timeout', 'timed out', 'deadline'],
    'permission': ['permission', 'access denied', 'forbidden', 'unauthorized'],
    'not_found': ['not found', 'missing', 'does not exist'],
    'network': ['network', 'connection', 'socket', 'http', 'request'],
    'file_system': ['file', 'directory', 'path', 'enoent', 'eacces'],
    'database': ['database', 'query', 'connection', 'sql'],
    'resource_exhausted': ['exhausted', 'memory', 'out of memory', 'limit exceeded'],
    'fatal': ['fatal', 'critical', 'unrecoverable'],
  };

  return keywordMap[baseKeyword] || [baseKeyword];
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

// ============================================================================
// Types
// ============================================================================

interface ErrorTypeDefinition {
  constant: string;
  name: string;
  description: string;
  defaultMessage: string;
}
