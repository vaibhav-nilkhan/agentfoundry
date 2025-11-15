import { z } from 'zod';

/**
 * Detect Conflicts - Identify resource conflicts and race conditions between agents
 *
 * Analyzes planned agent actions to detect potential conflicts such as:
 * - Resource contention (multiple agents accessing same resource)
 * - Race conditions (order-dependent outcomes)
 * - Data consistency issues (concurrent writes)
 */

const AgentActionSchema = z.object({
  agent_id: z.string(),
  action_type: z.enum(['read', 'write', 'execute', 'delete']),
  resource_id: z.string(),
  timestamp: z.number().optional(),
  lock_required: z.boolean().default(false),
  priority: z.number().min(0).max(10).default(5),
});

export const DetectConflictsInputSchema = z.object({
  agent_actions: z.array(AgentActionSchema),
  check_resources: z.array(z.string()).optional(),
});

export const DetectConflictsOutputSchema = z.object({
  conflicts: z.array(z.object({
    conflict_type: z.enum(['resource_contention', 'race_condition', 'write_conflict', 'deadlock_risk']),
    severity: z.enum(['low', 'medium', 'high']),
    involved_agents: z.array(z.string()),
    resource: z.string(),
    description: z.string(),
  })),
  severity: z.enum(['none', 'low', 'medium', 'high']),
  resolution_suggestions: z.array(z.object({
    conflict_id: z.number(),
    suggestion: z.string(),
    implementation: z.string(),
  })),
  total_conflicts: z.number(),
  safe_to_proceed: z.boolean(),
});

export type DetectConflictsInput = z.infer<typeof DetectConflictsInputSchema>;
export type DetectConflictsOutput = z.infer<typeof DetectConflictsOutputSchema>;

type AgentAction = z.infer<typeof AgentActionSchema>;

interface Conflict {
  conflict_type: 'resource_contention' | 'race_condition' | 'write_conflict' | 'deadlock_risk';
  severity: 'low' | 'medium' | 'high';
  involved_agents: string[];
  resource: string;
  description: string;
}

/**
 * Group actions by resource
 */
function groupByResource(actions: AgentAction[]): Map<string, AgentAction[]> {
  const groups = new Map<string, AgentAction[]>();

  for (const action of actions) {
    if (!groups.has(action.resource_id)) {
      groups.set(action.resource_id, []);
    }
    groups.get(action.resource_id)!.push(action);
  }

  return groups;
}

/**
 * Detect write-write conflicts (multiple concurrent writes)
 */
function detectWriteConflicts(actions: AgentAction[], resource: string): Conflict[] {
  const conflicts: Conflict[] = [];
  const writeActions = actions.filter(a => a.action_type === 'write' || a.action_type === 'delete');

  if (writeActions.length > 1) {
    // Check if writes are happening concurrently (no clear ordering)
    const hasTimestamps = writeActions.every(a => a.timestamp !== undefined);

    if (!hasTimestamps || !isSequentiallyOrdered(writeActions)) {
      const involvedAgents = writeActions.map(a => a.agent_id);

      conflicts.push({
        conflict_type: 'write_conflict',
        severity: 'high',
        involved_agents: Array.from(new Set(involvedAgents)),
        resource,
        description: `${writeActions.length} agents attempting concurrent writes to ${resource}. Data corruption risk.`,
      });
    }
  }

  return conflicts;
}

/**
 * Detect read-write conflicts (dirty reads)
 */
function detectReadWriteConflicts(actions: AgentAction[], resource: string): Conflict[] {
  const conflicts: Conflict[] = [];
  const readActions = actions.filter(a => a.action_type === 'read');
  const writeActions = actions.filter(a => a.action_type === 'write' || a.action_type === 'delete');

  if (readActions.length > 0 && writeActions.length > 0) {
    // Check for potential dirty reads
    const hasTimestamps = actions.every(a => a.timestamp !== undefined);

    if (!hasTimestamps) {
      // Cannot determine order - assume potential conflict
      const involvedAgents = [...readActions, ...writeActions].map(a => a.agent_id);

      conflicts.push({
        conflict_type: 'race_condition',
        severity: 'medium',
        involved_agents: Array.from(new Set(involvedAgents)),
        resource,
        description: `Concurrent reads and writes to ${resource} without clear ordering. Potential dirty read.`,
      });
    } else {
      // Check if reads and writes are interleaved
      const sorted = [...readActions, ...writeActions].sort((a, b) => a.timestamp! - b.timestamp!);

      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        if (current.action_type === 'write' && next.action_type === 'read') {
          conflicts.push({
            conflict_type: 'race_condition',
            severity: 'low',
            involved_agents: [current.agent_id, next.agent_id],
            resource,
            description: `Agent ${next.agent_id} reading ${resource} immediately after ${current.agent_id} writes. Timing-sensitive.`,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Detect resource contention (multiple agents competing for resource)
 */
function detectResourceContention(actions: AgentAction[], resource: string): Conflict[] {
  const conflicts: Conflict[] = [];

  if (actions.length > 3) {
    // High contention - many agents accessing same resource
    const involvedAgents = Array.from(new Set(actions.map(a => a.agent_id)));

    conflicts.push({
      conflict_type: 'resource_contention',
      severity: involvedAgents.length > 5 ? 'high' : 'medium',
      involved_agents,
      resource,
      description: `${involvedAgents.length} agents competing for ${resource}. Performance bottleneck likely.`,
    });
  }

  return conflicts;
}

/**
 * Detect potential deadlock risks (circular lock dependencies)
 */
function detectDeadlockRisks(actions: AgentAction[]): Conflict[] {
  const conflicts: Conflict[] = [];

  // Group actions by agent
  const actionsByAgent = new Map<string, AgentAction[]>();
  for (const action of actions) {
    if (!actionsByAgent.has(action.agent_id)) {
      actionsByAgent.set(action.agent_id, []);
    }
    actionsByAgent.get(action.agent_id)!.push(action);
  }

  // Check for agents that need locks on multiple resources
  for (const [agentId, agentActions] of actionsByAgent) {
    const lockedResources = agentActions
      .filter(a => a.lock_required)
      .map(a => a.resource_id);

    if (lockedResources.length > 1) {
      // Potential for deadlock if other agents lock resources in different order
      const otherAgentsWithLocks = Array.from(actionsByAgent.entries())
        .filter(([id, _]) => id !== agentId)
        .filter(([_, actions]) => actions.some(a => a.lock_required));

      if (otherAgentsWithLocks.length > 0) {
        const involvedAgents = [agentId, ...otherAgentsWithLocks.map(([id, _]) => id)];

        conflicts.push({
          conflict_type: 'deadlock_risk',
          severity: 'high',
          involved_agents,
          resource: lockedResources.join(', '),
          description: `Multiple agents acquiring locks on resources: ${lockedResources.join(', ')}. Deadlock possible if lock order differs.`,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Check if actions are sequentially ordered
 */
function isSequentiallyOrdered(actions: AgentAction[]): boolean {
  if (!actions.every(a => a.timestamp !== undefined)) {
    return false;
  }

  const sorted = [...actions].sort((a, b) => a.timestamp! - b.timestamp!);

  // Check if time gaps are sufficient (> 100ms between actions)
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1].timestamp! - sorted[i].timestamp! < 100) {
      return false; // Actions too close together
    }
  }

  return true;
}

/**
 * Generate resolution suggestions
 */
function generateResolutions(conflicts: Conflict[]): Array<{
  conflict_id: number;
  suggestion: string;
  implementation: string;
}> {
  return conflicts.map((conflict, index) => {
    let suggestion = '';
    let implementation = '';

    switch (conflict.conflict_type) {
      case 'write_conflict':
        suggestion = 'Serialize writes using distributed lock or queue';
        implementation = 'Apply exclusive write lock or use message queue with ordering guarantees';
        break;

      case 'race_condition':
        suggestion = 'Add happens-before relationship or use optimistic locking';
        implementation = 'Use timestamps/version numbers to detect conflicts and retry on failure';
        break;

      case 'resource_contention':
        suggestion = 'Implement rate limiting or resource pooling';
        implementation = 'Add semaphore limiting concurrent access or replicate resource across agents';
        break;

      case 'deadlock_risk':
        suggestion = 'Establish global lock ordering or use timeout-based locks';
        implementation = 'Always acquire locks in same order (e.g., alphabetically) or use try-lock with timeout';
        break;
    }

    return {
      conflict_id: index,
      suggestion,
      implementation,
    };
  });
}

/**
 * Determine overall severity
 */
function getOverallSeverity(conflicts: Conflict[]): 'none' | 'low' | 'medium' | 'high' {
  if (conflicts.length === 0) return 'none';

  const hasHigh = conflicts.some(c => c.severity === 'high');
  const hasMedium = conflicts.some(c => c.severity === 'medium');

  if (hasHigh) return 'high';
  if (hasMedium) return 'medium';
  return 'low';
}

/**
 * Main conflict detection function
 */
export async function run(input: DetectConflictsInput): Promise<DetectConflictsOutput> {
  // Validate input
  const validated = DetectConflictsInputSchema.parse(input);

  const { agent_actions, check_resources } = validated;

  // Filter actions if specific resources requested
  let actionsToCheck = agent_actions;
  if (check_resources && check_resources.length > 0) {
    actionsToCheck = agent_actions.filter(a => check_resources.includes(a.resource_id));
  }

  const allConflicts: Conflict[] = [];

  // Group actions by resource
  const resourceGroups = groupByResource(actionsToCheck);

  // Detect conflicts for each resource
  for (const [resource, actions] of resourceGroups) {
    allConflicts.push(...detectWriteConflicts(actions, resource));
    allConflicts.push(...detectReadWriteConflicts(actions, resource));
    allConflicts.push(...detectResourceContention(actions, resource));
  }

  // Detect deadlock risks (global check)
  allConflicts.push(...detectDeadlockRisks(actionsToCheck));

  // Generate resolution suggestions
  const resolutions = generateResolutions(allConflicts);

  // Determine overall severity
  const overallSeverity = getOverallSeverity(allConflicts);

  // Safe to proceed if no high-severity conflicts
  const safeToProce = !allConflicts.some(c => c.severity === 'high');

  return {
    conflicts: allConflicts,
    severity: overallSeverity,
    resolution_suggestions: resolutions,
    total_conflicts: allConflicts.length,
    safe_to_proceed: safeToProce,
  };
}
