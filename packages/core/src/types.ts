/**
 * @capsulas/core - Type definitions for Capsulas framework
 *
 * This module contains all core type definitions used across the framework.
 */

/**
 * Port type definitions - Used for type-safe connections between capsules
 */
export interface PortType {
  id: string;
  name: string;
  color: string;
}

export const PORT_TYPES = {
  AUTH: { id: 'auth', name: 'Auth', color: '#9c27b0' },
  USER: { id: 'user', name: 'User', color: '#2196f3' },
  DATA: { id: 'data', name: 'Data', color: '#4caf50' },
  STRING: { id: 'string', name: 'String', color: '#ff9800' },
  NUMBER: { id: 'number', name: 'Number', color: '#f44336' },
  OBJECT: { id: 'object', name: 'Object', color: '#00bcd4' },
  ARRAY: { id: 'array', name: 'Array', color: '#8bc34a' },
  FILE: { id: 'file', name: 'File', color: '#795548' },
  EVENT: { id: 'event', name: 'Event', color: '#e91e63' },
  MESSAGE: { id: 'message', name: 'Message', color: '#3f51b5' },
  JOB: { id: 'job', name: 'Job', color: '#607d8b' },
  EMAIL: { id: 'email', name: 'Email', color: '#009688' },
  ANY: { id: 'any', name: 'Any', color: '#9e9e9e' }
} as const;

/**
 * Port definition for capsule inputs/outputs
 */
export interface Port {
  id: string;
  name: string;
  type: PortType;
  required?: boolean;
  description?: string;
}

/**
 * Capsule category for organization
 */
export type CapsuleCategory =
  | 'auth'
  | 'data'
  | 'ai'
  | 'communication'
  | 'storage'
  | 'processing'
  | 'monitoring'
  | 'integration';

/**
 * Capsule definition - The core building block
 */
export interface Capsule {
  id: string;
  name: string;
  version?: string;
  description: string;
  icon: string;
  category: CapsuleCategory;
  inputs: Port[];
  outputs: Port[];
  config?: Record<string, any>;
  execute?: (inputs: Record<string, any>, config?: Record<string, any>) => Promise<Record<string, any>>;
}

/**
 * Node instance in the visual flow
 */
export interface Node {
  id: string;
  capsule: Capsule;
  position: { x: number; y: number };
  config?: Record<string, any>;
}

/**
 * Connection between two ports
 */
export interface Connection {
  id: string;
  fromNode: string;
  fromPort: string;
  toNode: string;
  toPort: string;
  color: string;
}

/**
 * Complete flow/workflow definition
 */
export interface Flow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  connections: Connection[];
  metadata?: {
    created: string;
    updated: string;
    author?: string;
    tags?: string[];
  };
}

/**
 * Execution context for running flows
 */
export interface ExecutionContext {
  flowId: string;
  variables: Record<string, any>;
  env: Record<string, string>;
  logger?: {
    info: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
  };
}

/**
 * Result of executing a flow
 */
export interface ExecutionResult {
  success: boolean;
  nodeResults: Record<string, any>;
  errors?: Array<{
    nodeId: string;
    error: string;
  }>;
  executionTime: number;
}

/**
 * Capsule definition function for creating custom capsules
 */
export type DefineCapsuleConfig = Omit<Capsule, 'id'> & {
  id?: string;
};

export function defineCapsule(config: DefineCapsuleConfig): Capsule {
  return {
    id: config.id || config.name.toLowerCase().replace(/\s+/g, '-'),
    ...config
  } as Capsule;
}
