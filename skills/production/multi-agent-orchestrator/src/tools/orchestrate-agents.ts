import { z } from 'zod';

/**
 * Orchestrate Agents - Hierarchically coordinate multiple sub-agents
 *
 * Manages complex multi-agent workflows with dependency resolution, resource allocation,
 * and intelligent task assignment based on agent capabilities.
 */

const AgentSchema = z.object({
  id: z.string(),
  capabilities: z.array(z.string()),
  max_concurrent: z.number().int().min(1).default(1),
  priority: z.number().min(0).max(10).default(5),
  status: z.enum(['available', 'busy', 'offline']).default('available'),
});

const TaskSchema = z.object({
  id: z.string(),
  required_capabilities: z.array(z.string()),
  priority: z.number().min(0).max(10).default(5),
  estimated_duration: z.number().min(0).optional(),
  dependencies: z.array(z.string()).default([]),
});

export const OrchestrateAgentsInputSchema = z.object({
  agents: z.array(AgentSchema),
  workflow: z.object({
    tasks: z.array(TaskSchema),
    dependencies: z.record(z.array(z.string())).optional(),
  }),
  execution_strategy: z.enum(['sequential', 'parallel', 'hybrid']).default('hybrid'),
});

export const OrchestrateAgentsOutputSchema = z.object({
  execution_plan: z.object({
    total_tasks: z.number(),
    total_agents: z.number(),
    strategy: z.string(),
    estimated_completion_time: z.number(),
  }),
  agent_assignments: z.array(z.object({
    agent_id: z.string(),
    assigned_tasks: z.array(z.string()),
    task_count: z.number(),
    utilization: z.number().min(0).max(1),
  })),
  estimated_time: z.number(),
  execution_phases: z.array(z.object({
    phase_number: z.number(),
    parallel_tasks: z.array(z.string()),
    assigned_agents: z.array(z.string()),
  })),
  warnings: z.array(z.string()).optional(),
});

export type OrchestrateAgentsInput = z.infer<typeof OrchestrateAgentsInputSchema>;
export type OrchestrateAgentsOutput = z.infer<typeof OrchestrateAgentsOutputSchema>;

type Agent = z.infer<typeof AgentSchema>;
type Task = z.infer<typeof TaskSchema>;

/**
 * Find agents capable of handling a task
 */
function findCapableAgents(task: Task, agents: Agent[]): Agent[] {
  return agents.filter(agent => {
    // Check if agent has all required capabilities
    return task.required_capabilities.every(cap =>
      agent.capabilities.includes(cap)
    );
  }).sort((a, b) => {
    // Prioritize by: 1) availability, 2) priority, 3) fewer capabilities (more specialized)
    if (a.status !== b.status) {
      return a.status === 'available' ? -1 : 1;
    }
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return a.capabilities.length - b.capabilities.length;
  });
}

/**
 * Build dependency graph and detect cycles
 */
function buildDependencyGraph(tasks: Task[]): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();

  for (const task of tasks) {
    if (!graph.has(task.id)) {
      graph.set(task.id, new Set());
    }
    for (const dep of task.dependencies) {
      graph.get(task.id)!.add(dep);
    }
  }

  return graph;
}

/**
 * Topological sort to determine execution order
 */
function topologicalSort(tasks: Task[]): Task[][] {
  const graph = buildDependencyGraph(tasks);
  const inDegree = new Map<string, number>();
  const taskMap = new Map<string, Task>();

  // Initialize
  for (const task of tasks) {
    taskMap.set(task.id, task);
    inDegree.set(task.id, 0);
  }

  // Calculate in-degrees
  for (const [_, deps] of graph) {
    for (const dep of deps) {
      inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
    }
  }

  // Group tasks into phases (tasks with no dependencies can run in parallel)
  const phases: Task[][] = [];
  const processed = new Set<string>();

  while (processed.size < tasks.length) {
    const currentPhase: Task[] = [];

    // Find tasks with no unprocessed dependencies
    for (const task of tasks) {
      if (processed.has(task.id)) continue;

      const deps = graph.get(task.id) || new Set();
      const hasPendingDeps = Array.from(deps).some(dep => !processed.has(dep));

      if (!hasPendingDeps) {
        currentPhase.push(task);
      }
    }

    if (currentPhase.length === 0) {
      // Circular dependency detected
      break;
    }

    // Sort by priority within phase
    currentPhase.sort((a, b) => b.priority - a.priority);
    phases.push(currentPhase);

    // Mark as processed
    currentPhase.forEach(task => processed.add(task.id));
  }

  return phases;
}

/**
 * Assign tasks to agents based on capabilities and load
 */
function assignTasks(
  phases: Task[][],
  agents: Agent[],
  strategy: string
): Map<string, string[]> {
  const assignments = new Map<string, string[]>();
  const agentLoad = new Map<string, number>();

  // Initialize
  for (const agent of agents) {
    assignments.set(agent.id, []);
    agentLoad.set(agent.id, 0);
  }

  if (strategy === 'sequential') {
    // Assign all tasks to first capable agent
    for (const phase of phases) {
      for (const task of phase) {
        const capableAgents = findCapableAgents(task, agents);
        if (capableAgents.length > 0) {
          const agent = capableAgents[0];
          assignments.get(agent.id)!.push(task.id);
          agentLoad.set(agent.id, agentLoad.get(agent.id)! + 1);
        }
      }
    }
  } else {
    // Parallel/hybrid: distribute tasks across capable agents
    for (const phase of phases) {
      for (const task of phase) {
        const capableAgents = findCapableAgents(task, agents);

        if (capableAgents.length === 0) continue;

        // Find agent with lowest load that can handle this task
        const selectedAgent = capableAgents.reduce((best, current) => {
          const currentLoad = agentLoad.get(current.id) || 0;
          const bestLoad = agentLoad.get(best.id) || 0;
          return currentLoad < bestLoad ? current : best;
        });

        assignments.get(selectedAgent.id)!.push(task.id);
        agentLoad.set(selectedAgent.id, agentLoad.get(selectedAgent.id)! + 1);
      }
    }
  }

  return assignments;
}

/**
 * Calculate estimated completion time
 */
function estimateCompletionTime(
  phases: Task[][],
  assignments: Map<string, string[]>,
  agents: Agent[]
): number {
  const agentMap = new Map(agents.map(a => [a.id, a]));
  let totalTime = 0;

  for (const phase of phases) {
    // For each phase, time = max time among parallel tasks
    let phaseTime = 0;

    const tasksByAgent = new Map<string, Task[]>();
    for (const task of phase) {
      // Find which agent was assigned this task
      for (const [agentId, tasks] of assignments) {
        if (tasks.includes(task.id)) {
          if (!tasksByAgent.has(agentId)) {
            tasksByAgent.set(agentId, []);
          }
          tasksByAgent.get(agentId)!.push(task);
        }
      }
    }

    // Calculate time for each agent in this phase
    for (const [agentId, tasks] of tasksByAgent) {
      const agent = agentMap.get(agentId)!;
      const agentTime = tasks.reduce((sum, t) => sum + (t.estimated_duration || 60), 0);
      const parallelTime = agentTime / agent.max_concurrent;
      phaseTime = Math.max(phaseTime, parallelTime);
    }

    totalTime += phaseTime;
  }

  return totalTime;
}

/**
 * Main orchestration function
 */
export async function run(input: OrchestrateAgentsInput): Promise<OrchestrateAgentsOutput> {
  // Validate input
  const validated = OrchestrateAgentsInputSchema.parse(input);

  const { agents, workflow, execution_strategy } = validated;
  const { tasks } = workflow;

  const warnings: string[] = [];

  // Check if we have any agents
  if (agents.length === 0) {
    throw new Error('No agents provided for orchestration');
  }

  // Check if we have any tasks
  if (tasks.length === 0) {
    throw new Error('No tasks provided in workflow');
  }

  // Build execution phases using topological sort
  const phases = topologicalSort(tasks);

  // Check for circular dependencies
  const processedTasks = new Set(phases.flatMap(p => p.map(t => t.id)));
  if (processedTasks.size < tasks.length) {
    warnings.push('Circular dependencies detected - some tasks cannot be executed');
  }

  // Assign tasks to agents
  const assignments = assignTasks(phases, agents, execution_strategy);

  // Check for unassignable tasks
  for (const task of tasks) {
    const assigned = Array.from(assignments.values()).some(taskList => taskList.includes(task.id));
    if (!assigned) {
      warnings.push(`Task '${task.id}' cannot be assigned - no capable agent found`);
    }
  }

  // Calculate estimated completion time
  const estimatedTime = estimateCompletionTime(phases, assignments, agents);

  // Build agent assignment details
  const agentAssignments = agents.map(agent => {
    const assignedTasks = assignments.get(agent.id) || [];
    const taskCount = assignedTasks.length;
    const utilization = taskCount > 0 ? Math.min(1.0, taskCount / (agent.max_concurrent * phases.length)) : 0;

    return {
      agent_id: agent.id,
      assigned_tasks: assignedTasks,
      task_count: taskCount,
      utilization: Math.round(utilization * 100) / 100,
    };
  });

  // Build execution phases output
  const executionPhases = phases.map((phase, index) => {
    const phaseTaskIds = phase.map(t => t.id);
    const assignedAgents = new Set<string>();

    for (const [agentId, taskList] of assignments) {
      if (phaseTaskIds.some(tid => taskList.includes(tid))) {
        assignedAgents.add(agentId);
      }
    }

    return {
      phase_number: index + 1,
      parallel_tasks: phaseTaskIds,
      assigned_agents: Array.from(assignedAgents),
    };
  });

  return {
    execution_plan: {
      total_tasks: tasks.length,
      total_agents: agents.length,
      strategy: execution_strategy,
      estimated_completion_time: Math.round(estimatedTime),
    },
    agent_assignments: agentAssignments,
    estimated_time: Math.round(estimatedTime),
    execution_phases: executionPhases,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
