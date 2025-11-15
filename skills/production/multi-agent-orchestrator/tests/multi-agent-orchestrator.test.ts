import { describe, it, expect } from '@jest/globals';
import { run as orchestrateAgents } from '../src/tools/orchestrate-agents';
import { run as detectConflicts } from '../src/tools/detect-conflicts';
import { run as resolveDeadlocks } from '../src/tools/resolve-deadlocks';
import { run as optimizeParallel } from '../src/tools/optimize-parallel';

describe('Multi-Agent Orchestrator - Orchestrate Agents', () => {
  const sampleAgents = [
    {
      id: 'agent-1',
      capabilities: ['data-analysis', 'sql'],
      max_concurrent: 2,
      priority: 8,
    },
    {
      id: 'agent-2',
      capabilities: ['web-scraping', 'http'],
      max_concurrent: 3,
      priority: 6,
    },
    {
      id: 'agent-3',
      capabilities: ['data-analysis', 'visualization'],
      max_concurrent: 1,
      priority: 7,
    },
  ];

  const sampleTasks = [
    {
      id: 'task-1',
      required_capabilities: ['web-scraping'],
      priority: 9,
      estimated_duration: 120,
      dependencies: [],
    },
    {
      id: 'task-2',
      required_capabilities: ['data-analysis'],
      priority: 8,
      estimated_duration: 180,
      dependencies: ['task-1'],
    },
    {
      id: 'task-3',
      required_capabilities: ['visualization'],
      priority: 7,
      estimated_duration: 90,
      dependencies: ['task-2'],
    },
  ];

  it('should create execution plan for sequential tasks', async () => {
    const result = await orchestrateAgents({
      agents: sampleAgents,
      workflow: {
        tasks: sampleTasks,
      },
      execution_strategy: 'sequential',
    });

    expect(result.execution_plan.total_tasks).toBe(3);
    expect(result.execution_plan.total_agents).toBe(3);
    expect(result.execution_plan.strategy).toBe('sequential');
    expect(result.agent_assignments.length).toBe(3);
  });

  it('should assign tasks based on agent capabilities', async () => {
    const result = await orchestrateAgents({
      agents: sampleAgents,
      workflow: {
        tasks: sampleTasks,
      },
      execution_strategy: 'hybrid',
    });

    // task-1 requires web-scraping -> should go to agent-2
    const agent2Assignment = result.agent_assignments.find(a => a.agent_id === 'agent-2');
    expect(agent2Assignment?.assigned_tasks).toContain('task-1');

    // task-2 requires data-analysis -> should go to agent-1 or agent-3
    const dataAnalysisAgents = result.agent_assignments.filter(a =>
      ['agent-1', 'agent-3'].includes(a.agent_id) && a.assigned_tasks.includes('task-2')
    );
    expect(dataAnalysisAgents.length).toBeGreaterThan(0);
  });

  it('should respect task dependencies in execution phases', async () => {
    const result = await orchestrateAgents({
      agents: sampleAgents,
      workflow: {
        tasks: sampleTasks,
      },
      execution_strategy: 'hybrid',
    });

    expect(result.execution_phases.length).toBeGreaterThanOrEqual(3);

    // task-1 should be in earlier phase than task-2
    const task1Phase = result.execution_phases.findIndex(p => p.parallel_tasks.includes('task-1'));
    const task2Phase = result.execution_phases.findIndex(p => p.parallel_tasks.includes('task-2'));
    expect(task1Phase).toBeLessThan(task2Phase);
  });

  it('should parallelize independent tasks', async () => {
    const parallelTasks = [
      { id: 'task-a', required_capabilities: ['web-scraping'], dependencies: [] },
      { id: 'task-b', required_capabilities: ['data-analysis'], dependencies: [] },
      { id: 'task-c', required_capabilities: ['sql'], dependencies: [] },
    ];

    const result = await orchestrateAgents({
      agents: sampleAgents,
      workflow: {
        tasks: parallelTasks,
      },
      execution_strategy: 'parallel',
    });

    // All tasks have no dependencies - should be in same phase
    expect(result.execution_phases[0].parallel_tasks.length).toBeGreaterThan(1);
  });

  it('should calculate agent utilization', async () => {
    const result = await orchestrateAgents({
      agents: sampleAgents,
      workflow: {
        tasks: sampleTasks,
      },
    });

    result.agent_assignments.forEach(assignment => {
      expect(assignment.utilization).toBeGreaterThanOrEqual(0);
      expect(assignment.utilization).toBeLessThanOrEqual(1);
    });
  });

  it('should warn about unassignable tasks', async () => {
    const impossibleTask = {
      id: 'impossible',
      required_capabilities: ['quantum-computing'],
      dependencies: [],
    };

    const result = await orchestrateAgents({
      agents: sampleAgents,
      workflow: {
        tasks: [impossibleTask],
      },
    });

    expect(result.warnings).toBeDefined();
    expect(result.warnings!.some(w => w.includes('impossible'))).toBe(true);
  });

  it('should detect circular dependencies', async () => {
    const circularTasks = [
      { id: 'a', required_capabilities: ['sql'], dependencies: ['b'] },
      { id: 'b', required_capabilities: ['sql'], dependencies: ['c'] },
      { id: 'c', required_capabilities: ['sql'], dependencies: ['a'] },
    ];

    const result = await orchestrateAgents({
      agents: sampleAgents,
      workflow: {
        tasks: circularTasks,
      },
    });

    expect(result.warnings).toBeDefined();
    expect(result.warnings!.some(w => w.toLowerCase().includes('circular'))).toBe(true);
  });
});

describe('Multi-Agent Orchestrator - Detect Conflicts', () => {
  it('should detect write-write conflicts', async () => {
    const result = await detectConflicts({
      agent_actions: [
        {
          agent_id: 'agent-1',
          action_type: 'write',
          resource_id: 'database-1',
          priority: 5,
        },
        {
          agent_id: 'agent-2',
          action_type: 'write',
          resource_id: 'database-1',
          priority: 5,
        },
      ],
    });

    expect(result.conflicts.length).toBeGreaterThan(0);
    expect(result.conflicts[0].conflict_type).toBe('write_conflict');
    expect(result.conflicts[0].severity).toBe('high');
    expect(result.safe_to_proceed).toBe(false);
  });

  it('should detect read-write race conditions', async () => {
    const result = await detectConflicts({
      agent_actions: [
        {
          agent_id: 'agent-1',
          action_type: 'write',
          resource_id: 'cache-1',
          timestamp: 1000,
        },
        {
          agent_id: 'agent-2',
          action_type: 'read',
          resource_id: 'cache-1',
          timestamp: 1050,
        },
      ],
    });

    expect(result.conflicts.some(c => c.conflict_type === 'race_condition')).toBe(true);
  });

  it('should detect resource contention', async () => {
    const actions = Array.from({ length: 6 }, (_, i) => ({
      agent_id: `agent-${i}`,
      action_type: 'read' as const,
      resource_id: 'api-endpoint',
    }));

    const result = await detectConflicts({
      agent_actions: actions,
    });

    expect(result.conflicts.some(c => c.conflict_type === 'resource_contention')).toBe(true);
  });

  it('should detect deadlock risks', async () => {
    const result = await detectConflicts({
      agent_actions: [
        {
          agent_id: 'agent-1',
          action_type: 'write',
          resource_id: 'resource-a',
          lock_required: true,
        },
        {
          agent_id: 'agent-1',
          action_type: 'write',
          resource_id: 'resource-b',
          lock_required: true,
        },
        {
          agent_id: 'agent-2',
          action_type: 'write',
          resource_id: 'resource-b',
          lock_required: true,
        },
        {
          agent_id: 'agent-2',
          action_type: 'write',
          resource_id: 'resource-a',
          lock_required: true,
        },
      ],
    });

    expect(result.conflicts.some(c => c.conflict_type === 'deadlock_risk')).toBe(true);
  });

  it('should provide resolution suggestions', async () => {
    const result = await detectConflicts({
      agent_actions: [
        {
          agent_id: 'agent-1',
          action_type: 'write',
          resource_id: 'file-1',
        },
        {
          agent_id: 'agent-2',
          action_type: 'write',
          resource_id: 'file-1',
        },
      ],
    });

    expect(result.resolution_suggestions.length).toBeGreaterThan(0);
    expect(result.resolution_suggestions[0].suggestion).toBeDefined();
    expect(result.resolution_suggestions[0].implementation).toBeDefined();
  });

  it('should filter conflicts by specified resources', async () => {
    const result = await detectConflicts({
      agent_actions: [
        {
          agent_id: 'agent-1',
          action_type: 'write',
          resource_id: 'database-1',
        },
        {
          agent_id: 'agent-2',
          action_type: 'write',
          resource_id: 'database-1',
        },
        {
          agent_id: 'agent-3',
          action_type: 'write',
          resource_id: 'database-2',
        },
      ],
      check_resources: ['database-1'],
    });

    // Should only check database-1 conflicts
    result.conflicts.forEach(conflict => {
      expect(conflict.resource).toBe('database-1');
    });
  });

  it('should determine overall severity correctly', async () => {
    const result = await detectConflicts({
      agent_actions: [
        {
          agent_id: 'agent-1',
          action_type: 'write',
          resource_id: 'critical-resource',
        },
        {
          agent_id: 'agent-2',
          action_type: 'write',
          resource_id: 'critical-resource',
        },
      ],
    });

    expect(result.severity).toBe('high');
  });

  it('should mark safe when no conflicts detected', async () => {
    const result = await detectConflicts({
      agent_actions: [
        {
          agent_id: 'agent-1',
          action_type: 'read',
          resource_id: 'resource-1',
        },
        {
          agent_id: 'agent-2',
          action_type: 'read',
          resource_id: 'resource-2',
        },
      ],
    });

    expect(result.total_conflicts).toBe(0);
    expect(result.severity).toBe('none');
    expect(result.safe_to_proceed).toBe(true);
  });
});

describe('Multi-Agent Orchestrator - Resolve Deadlocks', () => {
  it('should detect simple deadlock cycle', async () => {
    const result = await resolveDeadlocks({
      dependency_graph: {
        'agent-1': {
          agent_id: 'agent-1',
          waiting_for: ['agent-2'],
          holding_resources: ['resource-a'],
          priority: 5,
        },
        'agent-2': {
          agent_id: 'agent-2',
          waiting_for: ['agent-1'],
          holding_resources: ['resource-b'],
          priority: 5,
        },
      },
      resolution_strategy: 'manual',
    });

    expect(result.deadlock_detected).toBe(true);
    expect(result.cycles.length).toBeGreaterThan(0);
    expect(result.affected_agents).toContain('agent-1');
    expect(result.affected_agents).toContain('agent-2');
  });

  it('should resolve deadlock with kill_lowest_priority strategy', async () => {
    const result = await resolveDeadlocks({
      dependency_graph: {
        'agent-1': {
          agent_id: 'agent-1',
          waiting_for: ['agent-2'],
          holding_resources: ['resource-a'],
          priority: 8,
        },
        'agent-2': {
          agent_id: 'agent-2',
          waiting_for: ['agent-1'],
          holding_resources: ['resource-b'],
          priority: 3,
        },
      },
      resolution_strategy: 'kill_lowest_priority',
    });

    expect(result.deadlock_detected).toBe(true);
    expect(result.resolution.resolved).toBe(true);
    expect(result.resolution.actions_taken.length).toBeGreaterThan(0);
    expect(result.resolution.actions_taken[0].agent_id).toBe('agent-2'); // Lower priority
  });

  it('should resolve deadlock with timeout strategy', async () => {
    const now = Date.now();

    const result = await resolveDeadlocks({
      dependency_graph: {
        'agent-1': {
          agent_id: 'agent-1',
          waiting_for: ['agent-2'],
          holding_resources: ['resource-a'],
          priority: 5,
          start_time: now - 40000, // 40 seconds ago
        },
        'agent-2': {
          agent_id: 'agent-2',
          waiting_for: ['agent-1'],
          holding_resources: ['resource-b'],
          priority: 5,
          start_time: now - 20000, // 20 seconds ago
        },
      },
      resolution_strategy: 'timeout',
      timeout_ms: 30000, // 30 seconds
    });

    expect(result.deadlock_detected).toBe(true);
    expect(result.resolution.actions_taken.some(a => a.action === 'timeout_kill')).toBe(true);
  });

  it('should detect complex multi-agent deadlock', async () => {
    const result = await resolveDeadlocks({
      dependency_graph: {
        'agent-1': {
          agent_id: 'agent-1',
          waiting_for: ['agent-2'],
          holding_resources: ['r1'],
          priority: 5,
        },
        'agent-2': {
          agent_id: 'agent-2',
          waiting_for: ['agent-3'],
          holding_resources: ['r2'],
          priority: 5,
        },
        'agent-3': {
          agent_id: 'agent-3',
          waiting_for: ['agent-1'],
          holding_resources: ['r3'],
          priority: 5,
        },
      },
      resolution_strategy: 'kill_lowest_priority',
    });

    expect(result.deadlock_detected).toBe(true);
    expect(result.cycles.length).toBeGreaterThan(0);
    expect(result.affected_agents.length).toBe(3);
  });

  it('should report manual resolution needed', async () => {
    const result = await resolveDeadlocks({
      dependency_graph: {
        'agent-1': {
          agent_id: 'agent-1',
          waiting_for: ['agent-2'],
          holding_resources: ['resource-a'],
          priority: 5,
        },
        'agent-2': {
          agent_id: 'agent-2',
          waiting_for: ['agent-1'],
          holding_resources: ['resource-b'],
          priority: 5,
        },
      },
      resolution_strategy: 'manual',
    });

    expect(result.resolution.strategy_used).toBe('manual');
    expect(result.resolution.resolved).toBe(false);
    expect(result.resolution.actions_taken[0].action).toBe('report');
  });

  it('should not detect deadlock when no cycles exist', async () => {
    const result = await resolveDeadlocks({
      dependency_graph: {
        'agent-1': {
          agent_id: 'agent-1',
          waiting_for: ['agent-2'],
          holding_resources: ['resource-a'],
          priority: 5,
        },
        'agent-2': {
          agent_id: 'agent-2',
          waiting_for: [],
          holding_resources: ['resource-b'],
          priority: 5,
        },
      },
    });

    expect(result.deadlock_detected).toBe(false);
    expect(result.cycles.length).toBe(0);
    expect(result.affected_agents.length).toBe(0);
  });
});

describe('Multi-Agent Orchestrator - Optimize Parallel', () => {
  it('should create parallel execution schedule', async () => {
    const result = await optimizeParallel({
      tasks: [
        {
          id: 'task-1',
          duration: 100,
          dependencies: [],
        },
        {
          id: 'task-2',
          duration: 150,
          dependencies: [],
        },
        {
          id: 'task-3',
          duration: 120,
          dependencies: [],
        },
      ],
      max_parallel: 3,
    });

    expect(result.optimized_schedule.length).toBeGreaterThan(0);
    expect(result.optimized_schedule[0].tasks.length).toBe(3); // All tasks run in parallel
    expect(result.average_parallelism).toBeGreaterThan(1);
  });

  it('should respect task dependencies', async () => {
    const result = await optimizeParallel({
      tasks: [
        {
          id: 'task-1',
          duration: 100,
          dependencies: [],
        },
        {
          id: 'task-2',
          duration: 150,
          dependencies: ['task-1'],
        },
        {
          id: 'task-3',
          duration: 120,
          dependencies: ['task-1', 'task-2'],
        },
      ],
      max_parallel: 5,
    });

    // task-1 should complete before task-2 starts
    const task1Slot = result.optimized_schedule.find(s => s.tasks.some(t => t.task_id === 'task-1'));
    const task2Slot = result.optimized_schedule.find(s => s.tasks.some(t => t.task_id === 'task-2'));

    const task1EndTime = task1Slot!.tasks.find(t => t.task_id === 'task-1')!.end_time;
    const task2StartTime = task2Slot!.tasks.find(t => t.task_id === 'task-2')!.start_time;

    expect(task2StartTime).toBeGreaterThanOrEqual(task1EndTime);
  });

  it('should identify dependency bottlenecks', async () => {
    const longChain = Array.from({ length: 8 }, (_, i) => ({
      id: `task-${i}`,
      duration: 50,
      dependencies: i === 0 ? [] : [`task-${i - 1}`],
    }));

    const result = await optimizeParallel({
      tasks: longChain,
      max_parallel: 10,
    });

    expect(result.bottlenecks.some(b => b.type === 'dependency')).toBe(true);
  });

  it('should identify resource bottlenecks', async () => {
    const result = await optimizeParallel({
      tasks: [
        {
          id: 'task-1',
          duration: 100,
          dependencies: [],
          resources_required: ['gpu'],
        },
        {
          id: 'task-2',
          duration: 100,
          dependencies: [],
          resources_required: ['gpu'],
        },
        {
          id: 'task-3',
          duration: 100,
          dependencies: [],
          resources_required: ['gpu'],
        },
        {
          id: 'task-4',
          duration: 100,
          dependencies: [],
          resources_required: ['gpu'],
        },
      ],
      max_parallel: 10,
      available_resources: {
        gpu: 1,
      },
    });

    expect(result.bottlenecks.some(b => b.type === 'resource')).toBe(true);
  });

  it('should calculate parallelization factor', async () => {
    const result = await optimizeParallel({
      tasks: [
        { id: 't1', duration: 100, dependencies: [] },
        { id: 't2', duration: 100, dependencies: [] },
        { id: 't3', duration: 100, dependencies: [] },
        { id: 't4', duration: 100, dependencies: [] },
      ],
      max_parallel: 4,
    });

    expect(result.parallelization_factor).toBeGreaterThan(0);
    expect(result.parallelization_factor).toBeLessThanOrEqual(1);
  });

  it('should calculate efficiency score', async () => {
    const result = await optimizeParallel({
      tasks: [
        { id: 't1', duration: 100, dependencies: [] },
        { id: 't2', duration: 100, dependencies: [] },
      ],
      max_parallel: 2,
    });

    expect(result.efficiency_score).toBeGreaterThan(0);
    expect(result.efficiency_score).toBeLessThanOrEqual(1);
  });

  it('should respect max parallel limit', async () => {
    const manyTasks = Array.from({ length: 20 }, (_, i) => ({
      id: `task-${i}`,
      duration: 50,
      dependencies: [],
    }));

    const result = await optimizeParallel({
      tasks: manyTasks,
      max_parallel: 5,
    });

    result.optimized_schedule.forEach(slot => {
      expect(slot.parallelism).toBeLessThanOrEqual(5);
    });
  });

  it('should identify concurrency bottlenecks', async () => {
    const manyTasks = Array.from({ length: 50 }, (_, i) => ({
      id: `task-${i}`,
      duration: 50,
      dependencies: [],
    }));

    const result = await optimizeParallel({
      tasks: manyTasks,
      max_parallel: 5,
    });

    expect(result.bottlenecks.some(b => b.type === 'concurrency')).toBe(true);
  });
});
