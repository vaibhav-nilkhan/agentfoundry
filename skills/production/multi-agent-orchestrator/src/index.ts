/**
 * Multi-Agent Orchestrator - Coordinate 5+ sub-agents with conflict resolution
 *
 * This skill provides enterprise-grade multi-agent coordination capabilities:
 * - Hierarchical task orchestration with dependency management
 * - Resource conflict detection and resolution
 * - Deadlock detection and automatic resolution
 * - Parallel execution optimization
 *
 * @packageDocumentation
 */

export { run as orchestrateAgents, OrchestrateAgentsInput, OrchestrateAgentsOutput } from './tools/orchestrate-agents';
export { run as detectConflicts, DetectConflictsInput, DetectConflictsOutput } from './tools/detect-conflicts';
export { run as resolveDeadlocks, ResolveDeadlocksInput, ResolveDeadlocksOutput } from './tools/resolve-deadlocks';
export { run as optimizeParallel, OptimizeParallelInput, OptimizeParallelOutput } from './tools/optimize-parallel';

// Re-export tool schemas for runtime validation
export { OrchestrateAgentsInputSchema, OrchestrateAgentsOutputSchema } from './tools/orchestrate-agents';
export { DetectConflictsInputSchema, DetectConflictsOutputSchema } from './tools/detect-conflicts';
export { ResolveDeadlocksInputSchema, ResolveDeadlocksOutputSchema } from './tools/resolve-deadlocks';
export { OptimizeParallelInputSchema, OptimizeParallelOutputSchema } from './tools/optimize-parallel';
