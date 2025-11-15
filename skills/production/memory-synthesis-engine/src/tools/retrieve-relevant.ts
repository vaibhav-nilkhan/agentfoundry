import { z } from 'zod';
import { getAllMemories, getMemoryById } from './store-memory';

/**
 * Retrieve Relevant - Semantic memory search and retrieval
 *
 * Searches stored memories using semantic similarity and returns the most
 * relevant results based on query, recency, and importance.
 */

export const RetrieveRelevantInputSchema = z.object({
  query: z.string().min(1),
  memory_types: z.array(z.enum(['working', 'short_term', 'long_term'])).optional(),
  limit: z.number().int().min(1).max(100).default(10),
  similarity_threshold: z.number().min(0).max(1).default(0.7),
  boost_recent: z.boolean().default(true),
  boost_important: z.boolean().default(true),
});

export const RetrieveRelevantOutputSchema = z.object({
  memories: z.array(z.object({
    memory_id: z.string(),
    content: z.string(),
    memory_type: z.string(),
    importance: z.number(),
    tags: z.array(z.string()),
    relevance_score: z.number(),
    stored_at: z.string(),
  })),
  relevance_scores: z.record(z.number()),
  total_found: z.number(),
  search_metadata: z.object({
    query: z.string(),
    filters_applied: z.array(z.string()),
    avg_relevance: z.number(),
  }),
});

export type RetrieveRelevantInput = z.infer<typeof RetrieveRelevantInputSchema>;
export type RetrieveRelevantOutput = z.infer<typeof RetrieveRelevantOutputSchema>;

/**
 * Calculate semantic similarity using keyword matching
 * (In production, use vector embeddings from OpenAI/Cohere)
 */
function calculateSemanticSimilarity(query: string, content: string): number {
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const contentWords = content.toLowerCase().split(/\W+/).filter(w => w.length > 2);

  if (queryWords.length === 0 || contentWords.length === 0) return 0;

  // Calculate Jaccard similarity
  const querySet = new Set(queryWords);
  const contentSet = new Set(contentWords);

  const intersection = new Set([...querySet].filter(w => contentSet.has(w)));
  const union = new Set([...querySet, ...contentSet]);

  const jaccardScore = intersection.size / union.size;

  // Boost for exact phrase matches
  const lowerContent = content.toLowerCase();
  const hasExactPhrase = queryWords.some(word => lowerContent.includes(word));
  const exactBoost = hasExactPhrase ? 0.2 : 0;

  return Math.min(1.0, jaccardScore + exactBoost);
}

/**
 * Calculate tag similarity
 */
function calculateTagSimilarity(query: string, tags: string[]): number {
  if (tags.length === 0) return 0;

  const queryLower = query.toLowerCase();
  const matchingTags = tags.filter(tag =>
    queryLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes(queryLower)
  );

  return matchingTags.length / tags.length;
}

/**
 * Calculate recency score (recent memories score higher)
 */
function calculateRecencyScore(storedAt: Date): number {
  const now = Date.now();
  const ageMs = now - storedAt.getTime();

  // Exponential decay: recent = 1.0, 30 days old = ~0.5, 90 days = ~0.25
  const halfLifeDays = 30;
  const halfLifeMs = halfLifeDays * 24 * 60 * 60 * 1000;

  const recencyScore = Math.exp(-(ageMs / halfLifeMs));

  return Math.max(0, Math.min(1, recencyScore));
}

/**
 * Calculate overall relevance score
 */
function calculateRelevanceScore(
  query: string,
  memory: any,
  options: {
    boost_recent: boolean;
    boost_important: boolean;
  }
): number {
  // Semantic similarity (60% weight)
  const semanticScore = calculateSemanticSimilarity(query, memory.content);

  // Tag similarity (20% weight)
  const tagScore = calculateTagSimilarity(query, memory.tags);

  // Base relevance
  let relevance = semanticScore * 0.6 + tagScore * 0.2;

  // Recency boost (10% weight if enabled)
  if (options.boost_recent) {
    const recencyScore = calculateRecencyScore(memory.stored_at);
    relevance += recencyScore * 0.1;
  }

  // Importance boost (10% weight if enabled)
  if (options.boost_important) {
    relevance += memory.importance * 0.1;
  }

  return Math.min(1.0, relevance);
}

/**
 * Main retrieval function
 */
export async function run(input: RetrieveRelevantInput): Promise<RetrieveRelevantOutput> {
  // Validate input
  const validated = RetrieveRelevantInputSchema.parse(input);

  const {
    query,
    memory_types,
    limit,
    similarity_threshold,
    boost_recent,
    boost_important,
  } = validated;

  // Get all memories
  let memories = getAllMemories();

  const filtersApplied: string[] = [];

  // Filter by memory types
  if (memory_types && memory_types.length > 0) {
    memories = memories.filter(m => memory_types.includes(m.type));
    filtersApplied.push(`memory_types: ${memory_types.join(', ')}`);
  }

  // Filter out expired memories
  const now = new Date();
  memories = memories.filter(m => !m.expiration || m.expiration > now);
  filtersApplied.push('exclude_expired');

  // Calculate relevance scores
  const scoredMemories = memories.map(memory => ({
    memory,
    score: calculateRelevanceScore(query, memory, { boost_recent, boost_important }),
  }));

  // Filter by similarity threshold
  const relevantMemories = scoredMemories.filter(sm => sm.score >= similarity_threshold);

  // Sort by relevance score (descending)
  relevantMemories.sort((a, b) => b.score - a.score);

  // Limit results
  const topMemories = relevantMemories.slice(0, limit);

  // Build output
  const memoriesOutput = topMemories.map(sm => ({
    memory_id: sm.memory.id,
    content: sm.memory.content,
    memory_type: sm.memory.type,
    importance: sm.memory.importance,
    tags: sm.memory.tags,
    relevance_score: Math.round(sm.score * 100) / 100,
    stored_at: sm.memory.stored_at.toISOString(),
  }));

  // Build relevance scores map
  const relevanceScores: Record<string, number> = {};
  topMemories.forEach(sm => {
    relevanceScores[sm.memory.id] = Math.round(sm.score * 100) / 100;
  });

  // Calculate average relevance
  const avgRelevance = topMemories.length > 0
    ? topMemories.reduce((sum, sm) => sum + sm.score, 0) / topMemories.length
    : 0;

  return {
    memories: memoriesOutput,
    relevance_scores: relevanceScores,
    total_found: relevantMemories.length,
    search_metadata: {
      query,
      filters_applied: filtersApplied,
      avg_relevance: Math.round(avgRelevance * 100) / 100,
    },
  };
}
