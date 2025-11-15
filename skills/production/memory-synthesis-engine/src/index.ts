/**
 * Memory Synthesis Engine - Long-term context preservation and semantic retrieval
 *
 * This skill provides enterprise-grade memory management for AI agents:
 * - Hierarchical memory storage (working, short-term, long-term)
 * - Semantic memory retrieval with relevance scoring
 * - Knowledge graph construction from memories
 * - Session resumption with full context restoration
 *
 * @packageDocumentation
 */

export { run as storeMemory, StoreMemoryInput, StoreMemoryOutput, getMemoryById, getAllMemories, cleanExpiredMemories } from './tools/store-memory';
export { run as retrieveRelevant, RetrieveRelevantInput, RetrieveRelevantOutput } from './tools/retrieve-relevant';
export { run as buildKnowledgeGraph, BuildKnowledgeGraphInput, BuildKnowledgeGraphOutput } from './tools/build-knowledge-graph';
export { run as resumeSession, ResumeSessionInput, ResumeSessionOutput, registerMemoryWithSession, getActiveSessions } from './tools/resume-session';

// Re-export tool schemas for runtime validation
export { StoreMemoryInputSchema, StoreMemoryOutputSchema } from './tools/store-memory';
export { RetrieveRelevantInputSchema, RetrieveRelevantOutputSchema } from './tools/retrieve-relevant';
export { BuildKnowledgeGraphInputSchema, BuildKnowledgeGraphOutputSchema } from './tools/build-knowledge-graph';
export { ResumeSessionInputSchema, ResumeSessionOutputSchema } from './tools/resume-session';
