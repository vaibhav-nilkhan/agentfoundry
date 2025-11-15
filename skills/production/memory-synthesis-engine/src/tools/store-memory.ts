import { z } from 'zod';

/**
 * Store Memory - Persist important context with metadata
 *
 * Stores contextual information in working, short-term, or long-term memory
 * with importance scoring and tagging for later retrieval.
 */

export const StoreMemoryInputSchema = z.object({
  content: z.string().min(1),
  memory_type: z.enum(['working', 'short_term', 'long_term']).default('short_term'),
  importance: z.number().min(0).max(1).default(0.5),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional(),
});

export const StoreMemoryOutputSchema = z.object({
  memory_id: z.string(),
  stored_at: z.string().datetime(),
  memory_type: z.enum(['working', 'short_term', 'long_term']),
  expiration: z.string().datetime().optional(),
});

export type StoreMemoryInput = z.infer<typeof StoreMemoryInputSchema>;
export type StoreMemoryOutput = z.infer<typeof StoreMemoryOutputSchema>;

interface MemoryEntry {
  id: string;
  content: string;
  type: 'working' | 'short_term' | 'long_term';
  importance: number;
  tags: string[];
  metadata?: Record<string, any>;
  stored_at: Date;
  accessed_count: number;
  last_accessed: Date;
  expiration?: Date;
}

// In-memory storage (in production, use database/Redis)
const memoryStore = new Map<string, MemoryEntry>();

/**
 * Generate unique memory ID
 */
function generateMemoryId(type: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `mem_${type}_${timestamp}_${random}`;
}

/**
 * Calculate expiration date based on memory type
 */
function calculateExpiration(memoryType: string, storedAt: Date): Date | undefined {
  const expiration = new Date(storedAt);

  switch (memoryType) {
    case 'working':
      expiration.setHours(expiration.getHours() + 1); // 1 hour
      return expiration;
    case 'short_term':
      expiration.setDate(expiration.getDate() + 7); // 7 days
      return expiration;
    case 'long_term':
      return undefined; // No expiration
    default:
      return undefined;
  }
}

/**
 * Clean expired memories
 */
export function cleanExpiredMemories(): number {
  const now = new Date();
  let cleaned = 0;

  for (const [id, memory] of memoryStore.entries()) {
    if (memory.expiration && memory.expiration < now) {
      memoryStore.delete(id);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Main storage function
 */
export async function run(input: StoreMemoryInput): Promise<StoreMemoryOutput> {
  // Validate input
  const validated = StoreMemoryInputSchema.parse(input);

  const { content, memory_type, importance, tags, metadata } = validated;

  // Generate ID and timestamps
  const memoryId = generateMemoryId(memory_type);
  const storedAt = new Date();
  const expiration = calculateExpiration(memory_type, storedAt);

  // Create memory entry
  const entry: MemoryEntry = {
    id: memoryId,
    content,
    type: memory_type,
    importance,
    tags,
    metadata,
    stored_at: storedAt,
    accessed_count: 0,
    last_accessed: storedAt,
    expiration,
  };

  // Store memory
  memoryStore.set(memoryId, entry);

  // Clean up expired memories periodically
  if (memoryStore.size % 100 === 0) {
    cleanExpiredMemories();
  }

  return {
    memory_id: memoryId,
    stored_at: storedAt.toISOString(),
    memory_type,
    expiration: expiration?.toISOString(),
  };
}

/**
 * Get memory by ID (helper function)
 */
export function getMemoryById(memoryId: string): MemoryEntry | undefined {
  const memory = memoryStore.get(memoryId);

  if (memory) {
    // Update access tracking
    memory.accessed_count++;
    memory.last_accessed = new Date();
  }

  return memory;
}

/**
 * Get all memories (helper function)
 */
export function getAllMemories(): MemoryEntry[] {
  return Array.from(memoryStore.values());
}
