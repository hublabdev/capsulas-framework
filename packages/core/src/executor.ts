/**
 * @capsulas/core - Flow execution engine
 */

import { Flow, Node, Connection, ExecutionContext, ExecutionResult } from './types';

/**
 * Topological sort for dependency resolution
 * Orders nodes based on their connections so dependencies execute first
 */
function topologicalSort(nodes: Node[], connections: Connection[]): Node[] {
  const sorted: Node[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(nodeId: string) {
    if (visited.has(nodeId)) return;
    if (visiting.has(nodeId)) {
      throw new Error(`Circular dependency detected at node ${nodeId}`);
    }

    visiting.add(nodeId);

    // Visit all dependencies (nodes that connect TO this node)
    const dependencies = connections
      .filter(c => c.toNode === nodeId)
      .map(c => c.fromNode);

    for (const depId of dependencies) {
      visit(depId);
    }

    visiting.delete(nodeId);
    visited.add(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      sorted.push(node);
    }
  }

  // Start from nodes with no incoming connections
  const nodesWithNoInput = nodes.filter(
    node => !connections.some(c => c.toNode === node.id)
  );

  for (const node of nodesWithNoInput) {
    visit(node.id);
  }

  // Visit any remaining nodes (in case of disconnected graphs)
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      visit(node.id);
    }
  }

  return sorted;
}

/**
 * Execute a flow
 *
 * @param flow - The flow to execute
 * @param context - Execution context with variables and environment
 * @returns Execution result with node outputs and errors
 */
export async function executeFlow(
  flow: Flow,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const nodeResults: Record<string, any> = {};
  const errors: Array<{ nodeId: string; error: string }> = [];

  const logger = context.logger || {
    info: (msg: string) => console.log(`[INFO] ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${msg}`),
    warn: (msg: string) => console.warn(`[WARN] ${msg}`)
  };

  try {
    // Sort nodes by dependencies
    const sortedNodes = topologicalSort(flow.nodes, flow.connections);

    logger.info(`Executing flow "${flow.name}" with ${sortedNodes.length} nodes`);

    // Execute each node in order
    for (const node of sortedNodes) {
      try {
        logger.info(`Executing node: ${node.capsule.name} (${node.id})`);

        // Gather inputs from connected nodes
        const inputs: Record<string, any> = {};

        const inputConnections = flow.connections.filter(c => c.toNode === node.id);

        for (const conn of inputConnections) {
          const sourceResult = nodeResults[conn.fromNode];
          if (sourceResult) {
            inputs[conn.toPort] = sourceResult[conn.fromPort];
          }
        }

        // Merge with node config
        const config = { ...node.config };

        // Execute the capsule
        if (node.capsule.execute) {
          const result = await node.capsule.execute(inputs, config);
          nodeResults[node.id] = result;
          logger.info(`Node ${node.id} completed successfully`);
        } else {
          logger.warn(`Node ${node.id} has no execute function - skipping`);
          nodeResults[node.id] = {};
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Node ${node.id} failed: ${errorMessage}`);
        errors.push({
          nodeId: node.id,
          error: errorMessage
        });

        // Continue execution despite errors (can be configured)
        nodeResults[node.id] = { error: errorMessage };
      }
    }

    const executionTime = Date.now() - startTime;
    logger.info(`Flow execution completed in ${executionTime}ms`);

    return {
      success: errors.length === 0,
      nodeResults,
      errors: errors.length > 0 ? errors : undefined,
      executionTime
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Flow execution failed: ${errorMessage}`);

    return {
      success: false,
      nodeResults,
      errors: [{ nodeId: 'flow', error: errorMessage }],
      executionTime: Date.now() - startTime
    };
  }
}

/**
 * Validate flow execution order
 * Useful for debugging and visualization
 */
export function getExecutionOrder(flow: Flow): string[] {
  try {
    const sorted = topologicalSort(flow.nodes, flow.connections);
    return sorted.map(n => n.id);
  } catch (error) {
    throw new Error(`Cannot determine execution order: ${error}`);
  }
}
