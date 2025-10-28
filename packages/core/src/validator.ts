/**
 * @capsulas/core - Type validation and compatibility checking
 */

import { PortType, PORT_TYPES } from './types';

/**
 * Port compatibility rules
 * Defines which port types can connect to each other
 */
const COMPATIBILITY_RULES: Record<string, string[]> = {
  user: ['object'],
  auth: ['string'],
  data: ['object', 'array'],
  message: ['object'],
  event: ['object'],
  job: ['object'],
  email: ['object']
};

/**
 * Check if two port types are compatible for connection
 *
 * @param sourceType - The output port type
 * @param targetType - The input port type
 * @returns true if ports can be connected, false otherwise
 */
export function isPortCompatible(sourceType: string, targetType: string): boolean {
  // ANY type is compatible with everything
  if (sourceType === 'any' || targetType === 'any') {
    return true;
  }

  // Same types are compatible
  if (sourceType === targetType) {
    return true;
  }

  // Check custom compatibility rules
  if (COMPATIBILITY_RULES[sourceType]) {
    return COMPATIBILITY_RULES[sourceType].includes(targetType);
  }

  return false;
}

/**
 * Get all compatible port types for a given source type
 *
 * @param sourceType - The source port type
 * @returns Array of compatible port type IDs
 */
export function getCompatibleTypes(sourceType: string): string[] {
  if (sourceType === 'any') {
    return Object.keys(PORT_TYPES).map(key => PORT_TYPES[key as keyof typeof PORT_TYPES].id);
  }

  const compatible = [sourceType];

  if (COMPATIBILITY_RULES[sourceType]) {
    compatible.push(...COMPATIBILITY_RULES[sourceType]);
  }

  return compatible;
}

/**
 * Validate a complete flow for type safety
 *
 * @param nodes - Array of nodes in the flow
 * @param connections - Array of connections in the flow
 * @returns Object with validation result and any errors
 */
export function validateFlow(
  nodes: any[],
  connections: any[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate each connection
  for (const conn of connections) {
    const fromNode = nodes.find(n => n.id === conn.fromNode);
    const toNode = nodes.find(n => n.id === conn.toNode);

    if (!fromNode) {
      errors.push(`Connection ${conn.id}: Source node ${conn.fromNode} not found`);
      continue;
    }

    if (!toNode) {
      errors.push(`Connection ${conn.id}: Target node ${conn.toNode} not found`);
      continue;
    }

    const fromPort = fromNode.capsule.outputs.find((p: any) => p.id === conn.fromPort);
    const toPort = toNode.capsule.inputs.find((p: any) => p.id === conn.toPort);

    if (!fromPort) {
      errors.push(
        `Connection ${conn.id}: Output port ${conn.fromPort} not found on ${fromNode.capsule.name}`
      );
      continue;
    }

    if (!toPort) {
      errors.push(
        `Connection ${conn.id}: Input port ${conn.toPort} not found on ${toNode.capsule.name}`
      );
      continue;
    }

    if (!isPortCompatible(fromPort.type.id, toPort.type.id)) {
      errors.push(
        `Connection ${conn.id}: Incompatible types - ${fromPort.name} (${fromPort.type.name}) → ${toPort.name} (${toPort.type.name})`
      );
    }
  }

  // Check for required inputs
  for (const node of nodes) {
    const requiredInputs = node.capsule.inputs.filter((p: any) => p.required);

    for (const input of requiredInputs) {
      const hasConnection = connections.some(
        c => c.toNode === node.id && c.toPort === input.id
      );

      if (!hasConnection && !node.config?.[input.id]) {
        errors.push(
          `Node ${node.capsule.name}: Required input "${input.name}" is not connected or configured`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
