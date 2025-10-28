/**
 * @capsulas/core
 *
 * Core package for Capsulas framework
 * Provides types, validators, and execution engine
 */

// Export all types
export * from './types';

// Export validator functions
export * from './validator';

// Export executor functions
export * from './executor';

// Re-export commonly used items for convenience
export { PORT_TYPES, defineCapsule } from './types';
export { isPortCompatible, validateFlow } from './validator';
export { executeFlow, getExecutionOrder } from './executor';
