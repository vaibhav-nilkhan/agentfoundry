import { z } from 'zod';

/**
 * Optimize Parallel - Maximize parallelization and resource utilization
 *
 * Analyzes task dependencies and resource constraints to create an optimal
 * execution schedule that maximizes parallel execution while respecting dependencies.
 */

const TaskSchema = z.object({
  id: z.string(),
  duration: z.number().min(0),
  dependencies: z.array(z.string()).default([]),
  resources_required: z.array(z.string()).default([]),
  priority: z.number().min(0).max(10).default(5),
});

export const OptimizeParallelInputSchema = z.object({
  tasks: z.array(TaskSchema),
  max_parallel: z.number().int().min(1).default(10),
  available_resources: z.record(z.number().int().min(1)).optional(),
});

export const OptimizeParallelOutputSchema = z.object({
  optimized_schedule: z.array(z.object({
    time_slot: z.number(),
    tasks: z.array(z.object({
      task_id: z.string(),
      start_time: z.number(),
      end_time: z.number(),
      assigned_resources: z.array(z.string()),
    })),
    parallelism: z.number().int(),
  })),
  parallelization_factor: z.number().min(0),
  bottlenecks: z.array(z.object({
    type: z.enum(['dependency', 'resource', 'concurrency']),
    description: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
  })),
  total_time: z.number(),
  average_parallelism: z.number(),
  efficiency_score: z.number().min(0).max(1),
});

export type OptimizeParallelInput = z.infer<typeof OptimizeParallelInputSchema>;
export type OptimizeParallelOutput = z.infer<typeof OptimizeParallelOutputSchema>;

type Task = z.infer<typeof TaskSchema>;

interface ScheduledTask {
  task_id: string;
  start_time: number;
  end_time: number;
  assigned_resources: string[];
}

interface TimeSlot {
  time_slot: number;
  tasks: ScheduledTask[];
  parallelism: number;
}

/**
 * Build dependency graph and find roots (tasks with no dependencies)
 */
function findRootTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.dependencies.length === 0);
}

/**
 * Find tasks that are ready to execute (all dependencies completed)
 */
function findReadyTasks(
  tasks: Task[],
  completed: Set<string>
): Task[] {
  return tasks.filter(task => {
    if (completed.has(task.id)) return false;
    return task.dependencies.every(dep => completed.has(dep));
  });
}

/**
 * Check if resources are available
 */
function hasAvailableResources(
  task: Task,
  usedResources: Map<string, number>,
  availableResources?: Record<string, number>
): boolean {
  if (!availableResources || task.resources_required.length === 0) {
    return true;
  }

  for (const resource of task.resources_required) {
    const available = availableResources[resource] || 0;
    const used = usedResources.get(resource) || 0;

    if (used >= available) {
      return false;
    }
  }

  return true;
}

/**
 * Allocate resources for a task
 */
function allocateResources(
  task: Task,
  usedResources: Map<string, number>
): void {
  for (const resource of task.resources_required) {
    usedResources.set(resource, (usedResources.get(resource) || 0) + 1);
  }
}

/**
 * Release resources after task completion
 */
function releaseResources(
  task: Task,
  usedResources: Map<string, number>
): void {
  for (const resource of task.resources_required) {
    const current = usedResources.get(resource) || 0;
    usedResources.set(resource, Math.max(0, current - 1));
  }
}

/**
 * Create optimized parallel execution schedule
 */
function createSchedule(
  tasks: Task[],
  maxParallel: number,
  availableResources?: Record<string, number>
): TimeSlot[] {
  const schedule: TimeSlot[] = [];
  const completed = new Set<string>();
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  let currentTime = 0;

  const usedResources = new Map<string, number>();
  const running: Array<{ task: Task; endTime: number }> = [];

  while (completed.size < tasks.length) {
    // Check for completed tasks
    const nowCompleted = running.filter(r => r.endTime <= currentTime);
    for (const { task } of nowCompleted) {
      completed.add(task.id);
      releaseResources(task, usedResources);
    }

    // Remove completed from running
    running.splice(0, running.length, ...running.filter(r => r.endTime > currentTime));

    // Find ready tasks
    const readyTasks = findReadyTasks(tasks, completed);

    // Sort by priority (higher first)
    readyTasks.sort((a, b) => b.priority - a.priority);

    // Schedule as many tasks as possible in parallel
    const currentSlot: ScheduledTask[] = [];

    for (const task of readyTasks) {
      // Check concurrency limit
      if (running.length >= maxParallel) break;

      // Check resource availability
      if (!hasAvailableResources(task, usedResources, availableResources)) {
        continue;
      }

      // Schedule this task
      allocateResources(task, usedResources);

      const scheduled: ScheduledTask = {
        task_id: task.id,
        start_time: currentTime,
        end_time: currentTime + task.duration,
        assigned_resources: [...task.resources_required],
      };

      currentSlot.push(scheduled);
      running.push({ task, endTime: scheduled.end_time });
    }

    // Add time slot to schedule if tasks were scheduled
    if (currentSlot.length > 0) {
      schedule.push({
        time_slot: currentTime,
        tasks: currentSlot,
        parallelism: running.length,
      });
    }

    // Advance time to next completion
    if (running.length > 0) {
      const nextCompletion = Math.min(...running.map(r => r.endTime));
      currentTime = nextCompletion;
    } else if (completed.size < tasks.length) {
      // Deadlock or unschedulable tasks - advance time slightly
      currentTime += 1;
    }
  }

  return schedule;
}

/**
 * Calculate parallelization factor
 */
function calculateParallelizationFactor(
  schedule: TimeSlot[],
  totalTasks: number
): number {
  if (schedule.length === 0) return 0;

  const avgParallelism = schedule.reduce((sum, slot) => sum + slot.parallelism, 0) / schedule.length;
  return Math.round((avgParallelism / totalTasks) * 100) / 100;
}

/**
 * Identify bottlenecks
 */
function identifyBottlenecks(
  tasks: Task[],
  schedule: TimeSlot[],
  maxParallel: number,
  availableResources?: Record<string, number>
): Array<{ type: 'dependency' | 'resource' | 'concurrency'; description: string; impact: 'low' | 'medium' | 'high' }> {
  const bottlenecks: Array<{ type: 'dependency' | 'resource' | 'concurrency'; description: string; impact: 'low' | 'medium' | 'high' }> = [];

  // Check for long dependency chains
  const maxChainLength = findLongestDependencyChain(tasks);
  if (maxChainLength > 5) {
    bottlenecks.push({
      type: 'dependency',
      description: `Long dependency chain (${maxChainLength} tasks) limits parallelization`,
      impact: maxChainLength > 10 ? 'high' : 'medium',
    });
  }

  // Check for resource constraints
  if (availableResources) {
    for (const [resource, limit] of Object.entries(availableResources)) {
      const tasksRequiring = tasks.filter(t => t.resources_required.includes(resource)).length;
      if (tasksRequiring > limit * 2) {
        bottlenecks.push({
          type: 'resource',
          description: `Resource '${resource}' is heavily contended (${tasksRequiring} tasks, ${limit} available)`,
          impact: 'high',
        });
      }
    }
  }

  // Check for concurrency limitations
  const maxParallelismReached = schedule.some(slot => slot.parallelism >= maxParallel);
  if (maxParallelismReached) {
    bottlenecks.push({
      type: 'concurrency',
      description: `Max parallelism limit (${maxParallel}) frequently reached`,
      impact: 'medium',
    });
  }

  return bottlenecks;
}

/**
 * Find longest dependency chain length
 */
function findLongestDependencyChain(tasks: Task[]): number {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const memo = new Map<string, number>();

  function getChainLength(taskId: string): number {
    if (memo.has(taskId)) return memo.get(taskId)!;

    const task = taskMap.get(taskId);
    if (!task || task.dependencies.length === 0) {
      memo.set(taskId, 1);
      return 1;
    }

    const maxDepChain = Math.max(...task.dependencies.map(getChainLength));
    const chainLength = maxDepChain + 1;
    memo.set(taskId, chainLength);
    return chainLength;
  }

  return Math.max(...tasks.map(t => getChainLength(t.id)));
}

/**
 * Calculate efficiency score
 */
function calculateEfficiencyScore(
  schedule: TimeSlot[],
  tasks: Task[]
): number {
  if (schedule.length === 0) return 0;

  const totalTime = Math.max(...schedule.flatMap(s => s.tasks.map(t => t.end_time)));
  const totalTaskTime = tasks.reduce((sum, t) => sum + t.duration, 0);
  const idealTime = totalTaskTime; // If all tasks could run in parallel

  // Efficiency = actual parallelism / ideal parallelism
  const efficiency = totalTaskTime / (totalTime * tasks.length);

  return Math.min(1.0, Math.round(efficiency * 100) / 100);
}

/**
 * Main optimization function
 */
export async function run(input: OptimizeParallelInput): Promise<OptimizeParallelOutput> {
  // Validate input
  const validated = OptimizeParallelInputSchema.parse(input);

  const { tasks, max_parallel, available_resources } = validated;

  // Create optimized schedule
  const schedule = createSchedule(tasks, max_parallel, available_resources);

  // Calculate metrics
  const parallelizationFactor = calculateParallelizationFactor(schedule, tasks.length);
  const bottlenecks = identifyBottlenecks(tasks, schedule, max_parallel, available_resources);

  const totalTime = schedule.length > 0
    ? Math.max(...schedule.flatMap(s => s.tasks.map(t => t.end_time)))
    : 0;

  const avgParallelism = schedule.length > 0
    ? schedule.reduce((sum, slot) => sum + slot.parallelism, 0) / schedule.length
    : 0;

  const efficiencyScore = calculateEfficiencyScore(schedule, tasks);

  return {
    optimized_schedule: schedule,
    parallelization_factor: parallelizationFactor,
    bottlenecks,
    total_time: Math.round(totalTime),
    average_parallelism: Math.round(avgParallelism * 10) / 10,
    efficiency_score: efficiencyScore,
  };
}
