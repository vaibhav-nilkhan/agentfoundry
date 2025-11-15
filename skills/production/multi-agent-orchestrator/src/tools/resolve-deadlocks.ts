import { z } from 'zod';

/**
 * Resolve Deadlocks - Break circular dependencies and deadlock situations
 *
 * Analyzes dependency graphs to detect deadlocks and applies resolution strategies
 * to break cycles and restore progress.
 */

export const ResolveDeadlocksInputSchema = z.object({
  dependency_graph: z.record(z.object({
    agent_id: z.string(),
    waiting_for: z.array(z.string()),
    holding_resources: z.array(z.string()),
    priority: z.number().min(0).max(10).default(5),
    start_time: z.number().optional(),
  })),
  resolution_strategy: z.enum(['kill_lowest_priority', 'timeout', 'manual']).default('timeout'),
  timeout_ms: z.number().min(0).default(30000),
});

export const ResolveDeadlocksOutputSchema = z.object({
  deadlock_detected: z.boolean(),
  affected_agents: z.array(z.string()),
  resolution: z.object({
    strategy_used: z.string(),
    actions_taken: z.array(z.object({
      action: z.string(),
      agent_id: z.string(),
      reason: z.string(),
    })),
    resolved: z.boolean(),
  }),
  cycles: z.array(z.array(z.string())),
  execution_time_ms: z.number(),
});

export type ResolveDeadlocksInput = z.infer<typeof ResolveDeadlocksInputSchema>;
export type ResolveDeadlocksOutput = z.infer<typeof ResolveDeadlocksOutputSchema>;

interface AgentNode {
  agent_id: string;
  waiting_for: string[];
  holding_resources: string[];
  priority: number;
  start_time?: number;
}

/**
 * Detect cycles in dependency graph using DFS
 */
function detectCycles(graph: Map<string, AgentNode>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(nodeId: string): void {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const node = graph.get(nodeId);
    if (!node) {
      path.pop();
      recursionStack.delete(nodeId);
      return;
    }

    for (const dependencyId of node.waiting_for) {
      if (!recursionStack.has(dependencyId)) {
        dfs(dependencyId);
      } else {
        // Found a cycle
        const cycleStart = path.indexOf(dependencyId);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart);
          cycles.push([...cycle, dependencyId]);
        }
      }
    }

    path.pop();
    recursionStack.delete(nodeId);
  }

  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  }

  return cycles;
}

/**
 * Find agent with lowest priority in a cycle
 */
function findLowestPriorityAgent(cycle: string[], graph: Map<string, AgentNode>): string {
  let lowestPriority = Infinity;
  let lowestAgent = cycle[0];

  for (const agentId of cycle) {
    const node = graph.get(agentId);
    if (node && node.priority < lowestPriority) {
      lowestPriority = node.priority;
      lowestAgent = agentId;
    }
  }

  return lowestAgent;
}

/**
 * Find agent that has been waiting longest
 */
function findLongestWaitingAgent(cycle: string[], graph: Map<string, AgentNode>): string {
  let longestWaitTime = 0;
  let longestAgent = cycle[0];
  const now = Date.now();

  for (const agentId of cycle) {
    const node = graph.get(agentId);
    if (node && node.start_time) {
      const waitTime = now - node.start_time;
      if (waitTime > longestWaitTime) {
        longestWaitTime = waitTime;
        longestAgent = agentId;
      }
    }
  }

  return longestAgent;
}

/**
 * Apply kill_lowest_priority strategy
 */
function applyKillLowestPriority(
  cycles: string[][],
  graph: Map<string, AgentNode>
): Array<{ action: string; agent_id: string; reason: string }> {
  const actions: Array<{ action: string; agent_id: string; reason: string }> = [];

  for (const cycle of cycles) {
    const victimAgent = findLowestPriorityAgent(cycle, graph);
    const node = graph.get(victimAgent);

    actions.push({
      action: 'terminate',
      agent_id: victimAgent,
      reason: `Lowest priority (${node?.priority}) agent in deadlock cycle: ${cycle.join(' → ')}`,
    });

    // Remove agent from graph
    graph.delete(victimAgent);

    // Remove dependencies on this agent
    for (const [_, agentNode] of graph) {
      agentNode.waiting_for = agentNode.waiting_for.filter(id => id !== victimAgent);
    }
  }

  return actions;
}

/**
 * Apply timeout strategy
 */
function applyTimeout(
  cycles: string[][],
  graph: Map<string, AgentNode>,
  timeoutMs: number
): Array<{ action: string; agent_id: string; reason: string }> {
  const actions: Array<{ action: string; agent_id: string; reason: string }> = [];
  const now = Date.now();

  for (const cycle of cycles) {
    // Find agents that have exceeded timeout
    const timedOutAgents = cycle.filter(agentId => {
      const node = graph.get(agentId);
      if (!node || !node.start_time) return false;
      return (now - node.start_time) > timeoutMs;
    });

    if (timedOutAgents.length > 0) {
      // Kill the agent that's been waiting longest
      const victimAgent = findLongestWaitingAgent(timedOutAgents, graph);
      const node = graph.get(victimAgent);
      const waitTime = node?.start_time ? now - node.start_time : 0;

      actions.push({
        action: 'timeout_kill',
        agent_id: victimAgent,
        reason: `Exceeded timeout (${(waitTime / 1000).toFixed(1)}s > ${(timeoutMs / 1000).toFixed(1)}s) in deadlock cycle`,
      });

      // Remove agent from graph
      graph.delete(victimAgent);

      // Remove dependencies on this agent
      for (const [_, agentNode] of graph) {
        agentNode.waiting_for = agentNode.waiting_for.filter(id => id !== victimAgent);
      }
    } else {
      // No timeout yet - mark for monitoring
      actions.push({
        action: 'monitor',
        agent_id: cycle[0],
        reason: `Deadlock detected but timeout not exceeded. Monitoring cycle: ${cycle.join(' → ')}`,
      });
    }
  }

  return actions;
}

/**
 * Apply manual strategy (just report, no automatic action)
 */
function applyManual(
  cycles: string[][]
): Array<{ action: string; agent_id: string; reason: string }> {
  const actions: Array<{ action: string; agent_id: string; reason: string }> = [];

  for (const cycle of cycles) {
    actions.push({
      action: 'report',
      agent_id: cycle[0],
      reason: `Manual resolution required for deadlock cycle: ${cycle.join(' → ')}. Suggested: kill one agent in cycle.`,
    });
  }

  return actions;
}

/**
 * Verify deadlock is resolved
 */
function isDeadlockResolved(graph: Map<string, AgentNode>): boolean {
  const remainingCycles = detectCycles(graph);
  return remainingCycles.length === 0;
}

/**
 * Main deadlock resolution function
 */
export async function run(input: ResolveDeadlocksInput): Promise<ResolveDeadlocksOutput> {
  const startTime = Date.now();

  // Validate input
  const validated = ResolveDeadlocksInputSchema.parse(input);

  const { dependency_graph, resolution_strategy, timeout_ms } = validated;

  // Convert to Map for easier manipulation
  const graph = new Map<string, AgentNode>();
  for (const [agentId, node] of Object.entries(dependency_graph)) {
    graph.set(agentId, { ...node, agent_id: agentId });
  }

  // Detect deadlock cycles
  const cycles = detectCycles(graph);
  const deadlockDetected = cycles.length > 0;

  // Collect all affected agents
  const affectedAgents = Array.from(new Set(cycles.flat()));

  let actionsTaken: Array<{ action: string; agent_id: string; reason: string }> = [];
  let resolved = false;

  if (deadlockDetected) {
    // Apply resolution strategy
    switch (resolution_strategy) {
      case 'kill_lowest_priority':
        actionsTaken = applyKillLowestPriority(cycles, graph);
        resolved = isDeadlockResolved(graph);
        break;

      case 'timeout':
        actionsTaken = applyTimeout(cycles, graph, timeout_ms);
        resolved = isDeadlockResolved(graph);
        break;

      case 'manual':
        actionsTaken = applyManual(cycles);
        resolved = false; // Manual strategy doesn't automatically resolve
        break;
    }
  }

  const executionTime = Date.now() - startTime;

  return {
    deadlock_detected: deadlockDetected,
    affected_agents: affectedAgents,
    resolution: {
      strategy_used: resolution_strategy,
      actions_taken: actionsTaken,
      resolved,
    },
    cycles,
    execution_time_ms: executionTime,
  };
}
