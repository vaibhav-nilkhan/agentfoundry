import { z } from 'zod';
import { getAllMemories } from './store-memory';

/**
 * Resume Session - Continue from previous state with full context
 *
 * Retrieves and reconstructs session context from stored memories,
 * enabling seamless continuation of long-running agent tasks.
 */

export const ResumeSessionInputSchema = z.object({
  session_id: z.string().min(1),
  include_context: z.boolean().default(true),
  context_window_days: z.number().int().min(1).default(30),
});

export const ResumeSessionOutputSchema = z.object({
  restored_context: z.object({
    session_id: z.string(),
    memories: z.array(z.object({
      memory_id: z.string(),
      content: z.string(),
      importance: z.number(),
      stored_at: z.string(),
    })),
    entities: z.array(z.string()),
    tags: z.array(z.string()),
  }),
  last_activity: z.string().datetime(),
  context_summary: z.string(),
  session_metadata: z.object({
    total_memories: z.number(),
    active_duration_days: z.number(),
    importance_avg: z.number(),
  }),
  continuation_suggestions: z.array(z.string()),
});

export type ResumeSessionInput = z.infer<typeof ResumeSessionInputSchema>;
export type ResumeSessionOutput = z.infer<typeof ResumeSessionOutputSchema>;

// Session storage (in production, use database)
const sessionStore = new Map<string, {
  session_id: string;
  created_at: Date;
  last_accessed: Date;
  memory_ids: Set<string>;
  metadata: Record<string, any>;
}>();

/**
 * Extract entities from text
 */
function extractEntitiesFromText(text: string): string[] {
  const entities: string[] = [];

  // Capitalized words
  const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const matches = text.match(capitalizedPattern) || [];

  entities.push(...matches.filter(m => m.length > 2));

  return [...new Set(entities)];
}

/**
 * Generate context summary from memories
 */
function generateContextSummary(memories: any[]): string {
  if (memories.length === 0) {
    return 'No context available for this session.';
  }

  // Sort by importance
  const sortedMemories = [...memories].sort((a, b) => b.importance - a.importance);

  const topMemories = sortedMemories.slice(0, 3);

  const summary = `Session contains ${memories.length} memories spanning ${calculateDuration(memories)} days. Key context:\n${topMemories.map((m, i) => `${i + 1}. ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`).join('\n')}`;

  return summary;
}

/**
 * Calculate duration covered by memories
 */
function calculateDuration(memories: any[]): number {
  if (memories.length === 0) return 0;

  const timestamps = memories.map(m => new Date(m.stored_at).getTime());
  const oldest = Math.min(...timestamps);
  const newest = Math.max(...timestamps);

  const durationMs = newest - oldest;
  const durationDays = durationMs / (1000 * 60 * 60 * 24);

  return Math.round(durationDays * 10) / 10;
}

/**
 * Generate continuation suggestions
 */
function generateContinuationSuggestions(memories: any[]): string[] {
  const suggestions: string[] = [];

  if (memories.length === 0) {
    suggestions.push('Start by storing important context and decisions');
    return suggestions;
  }

  // Analyze last few memories
  const recentMemories = memories.slice(-3);

  // Check for incomplete tasks
  const hasIncomplete = recentMemories.some(m =>
    m.content.toLowerCase().includes('todo') ||
    m.content.toLowerCase().includes('pending') ||
    m.content.toLowerCase().includes('in progress')
  );

  if (hasIncomplete) {
    suggestions.push('Review pending tasks and incomplete work');
  }

  // Check for decisions
  const hasDecisions = recentMemories.some(m =>
    m.content.toLowerCase().includes('decide') ||
    m.content.toLowerCase().includes('choose')
  );

  if (hasDecisions) {
    suggestions.push('Validate and implement recent decisions');
  }

  // Check for high-importance items
  const highImportance = memories.filter(m => m.importance > 0.7);

  if (highImportance.length > 0) {
    suggestions.push(`Address ${highImportance.length} high-priority items`);
  }

  // General suggestions
  suggestions.push('Review recent context and continue from last checkpoint');

  return suggestions.slice(0, 3);
}

/**
 * Register a memory with a session (helper function)
 */
export function registerMemoryWithSession(sessionId: string, memoryId: string): void {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, {
      session_id: sessionId,
      created_at: new Date(),
      last_accessed: new Date(),
      memory_ids: new Set(),
      metadata: {},
    });
  }

  const session = sessionStore.get(sessionId)!;
  session.memory_ids.add(memoryId);
  session.last_accessed = new Date();
}

/**
 * Main session resume function
 */
export async function run(input: ResumeSessionInput): Promise<ResumeSessionOutput> {
  // Validate input
  const validated = ResumeSessionInputSchema.parse(input);

  const { session_id, include_context, context_window_days } = validated;

  // Get session data
  let session = sessionStore.get(session_id);

  if (!session) {
    // Create new session if doesn't exist
    session = {
      session_id,
      created_at: new Date(),
      last_accessed: new Date(),
      memory_ids: new Set(),
      metadata: {},
    };
    sessionStore.set(session_id, session);
  }

  // Get all memories
  const allMemories = getAllMemories();

  // Filter memories for this session within time window
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - context_window_days);

  let sessionMemories = allMemories.filter(m => {
    const isInSession = session!.memory_ids.has(m.id);
    const isRecent = m.stored_at >= cutoffDate;
    return isInSession && isRecent;
  });

  // Sort by stored_at (chronological)
  sessionMemories.sort((a, b) => a.stored_at.getTime() - b.stored_at.getTime());

  // Extract entities and tags
  const allEntities = new Set<string>();
  const allTags = new Set<string>();

  for (const memory of sessionMemories) {
    const entities = extractEntitiesFromText(memory.content);
    entities.forEach(e => allEntities.add(e));
    memory.tags.forEach((t: string) => allTags.add(t));
  }

  // Build restored context
  const memoriesOutput = sessionMemories.map(m => ({
    memory_id: m.id,
    content: m.content,
    importance: m.importance,
    stored_at: m.stored_at.toISOString(),
  }));

  // Generate summary
  const contextSummary = generateContextSummary(sessionMemories);

  // Calculate metadata
  const importanceAvg = sessionMemories.length > 0
    ? sessionMemories.reduce((sum, m) => sum + m.importance, 0) / sessionMemories.length
    : 0;

  const activeDuration = calculateDuration(sessionMemories);

  // Generate continuation suggestions
  const continuationSuggestions = generateContinuationSuggestions(sessionMemories);

  // Update session last accessed
  session.last_accessed = new Date();

  const lastActivity = sessionMemories.length > 0
    ? sessionMemories[sessionMemories.length - 1].stored_at.toISOString()
    : session.last_accessed.toISOString();

  return {
    restored_context: {
      session_id,
      memories: memoriesOutput,
      entities: Array.from(allEntities),
      tags: Array.from(allTags),
    },
    last_activity: lastActivity,
    context_summary: contextSummary,
    session_metadata: {
      total_memories: sessionMemories.length,
      active_duration_days: activeDuration,
      importance_avg: Math.round(importanceAvg * 100) / 100,
    },
    continuation_suggestions: continuationSuggestions,
  };
}

/**
 * Get active sessions (helper function)
 */
export function getActiveSessions(): string[] {
  return Array.from(sessionStore.keys());
}
