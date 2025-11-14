/**
 * Agent Reliability Wrapper
 *
 * Production-grade reliability wrapper for AI agents.
 * Solves the #1 pain point: 75% of agents fail in production.
 *
 * Based on research of 40+ GitHub issues (LangChain, LlamaIndex, CrewAI).
 *
 * Key problems solved:
 * - LlamaIndex Issue #16774: "Inconsistent agent responses - 50% empty responses"
 * - Industry stat: "Best agents achieve <55% success rate"
 * - Research: "75% of agentic AI tasks fail"
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Checkpoint-based recovery
 * - Reliability scoring (0-100)
 * - Task decomposition (breaks complex tasks into chunks)
 */

export * as wrapAgent from './tools/wrap-agent';
export * as executeWithRetry from './tools/execute-with-retry';
export * as getReliabilityScore from './tools/get-reliability-score';
export * as decomposeTask from './tools/decompose-task';

export { ReliabilityManager } from './lib/reliability-manager';
