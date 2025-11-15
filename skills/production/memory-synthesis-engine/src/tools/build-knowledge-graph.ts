import { z } from 'zod';

/**
 * Build Knowledge Graph - Connect related concepts and build knowledge structures
 *
 * Analyzes memories to identify entities, extract relationships, and build
 * a knowledge graph for better contextual understanding.
 */

const MemoryInputSchema = z.object({
  memory_id: z.string(),
  content: z.string(),
  tags: z.array(z.string()).default([]),
});

export const BuildKnowledgeGraphInputSchema = z.object({
  memories: z.array(MemoryInputSchema),
  max_connections: z.number().int().min(1).default(100),
  min_similarity: z.number().min(0).max(1).default(0.3),
});

export const BuildKnowledgeGraphOutputSchema = z.object({
  graph: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      type: z.enum(['entity', 'concept', 'memory']),
      label: z.string(),
      properties: z.record(z.any()).optional(),
    })),
    edges: z.array(z.object({
      source: z.string(),
      target: z.string(),
      relationship: z.string(),
      weight: z.number(),
    })),
  }),
  entities: z.array(z.object({
    entity: z.string(),
    type: z.string(),
    mentions: z.number(),
  })),
  relationships: z.array(z.object({
    source_entity: z.string(),
    target_entity: z.string(),
    relationship_type: z.string(),
    confidence: z.number(),
  })),
  statistics: z.object({
    total_nodes: z.number(),
    total_edges: z.number(),
    avg_connections: z.number(),
    most_connected: z.string().optional(),
  }),
});

export type BuildKnowledgeGraphInput = z.infer<typeof BuildKnowledgeGraphInputSchema>;
export type BuildKnowledgeGraphOutput = z.infer<typeof BuildKnowledgeGraphOutputSchema>;

type MemoryInput = z.infer<typeof MemoryInputSchema>;

/**
 * Extract entities from text (simple NER)
 */
function extractEntities(content: string): Array<{ entity: string; type: string }> {
  const entities: Array<{ entity: string; type: string }> = [];

  // Capitalize words (likely proper nouns)
  const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const capitalizedMatches = content.match(capitalizedPattern) || [];

  capitalizedMatches.forEach(match => {
    if (match.length > 2) {
      entities.push({ entity: match, type: 'PERSON_OR_ORG' });
    }
  });

  // Technical terms (contains numbers/symbols)
  const technicalPattern = /\b[A-Za-z]+[0-9]+[A-Za-z0-9]*\b|\b[A-Z]{2,}\b/g;
  const technicalMatches = content.match(technicalPattern) || [];

  technicalMatches.forEach(match => {
    entities.push({ entity: match, type: 'TECHNICAL_TERM' });
  });

  // File paths or URLs
  const pathPattern = /\b[\w\/\.\-]+\.(com|org|net|io|ts|js|py|java|go)\b/g;
  const pathMatches = content.match(pathPattern) || [];

  pathMatches.forEach(match => {
    entities.push({ entity: match, type: 'RESOURCE' });
  });

  return entities;
}

/**
 * Calculate similarity between two texts
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 2));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Detect relationship type based on co-occurrence patterns
 */
function detectRelationship(entity1: string, entity2: string, context: string): string {
  const lowerContext = context.toLowerCase();

  if (lowerContext.includes('uses') || lowerContext.includes('implements')) {
    return 'USES';
  } else if (lowerContext.includes('depends on') || lowerContext.includes('requires')) {
    return 'DEPENDS_ON';
  } else if (lowerContext.includes('related to') || lowerContext.includes('associated with')) {
    return 'RELATED_TO';
  } else if (lowerContext.includes('part of') || lowerContext.includes('belongs to')) {
    return 'PART_OF';
  } else {
    return 'CO_OCCURS';
  }
}

/**
 * Main knowledge graph building function
 */
export async function run(input: BuildKnowledgeGraphInput): Promise<BuildKnowledgeGraphOutput> {
  // Validate input
  const validated = BuildKnowledgeGraphInputSchema.parse(input);

  const { memories, max_connections, min_similarity } = validated;

  // Extract all entities
  const entityMap = new Map<string, { type: string; mentions: number; memory_ids: Set<string> }>();

  for (const memory of memories) {
    const entities = extractEntities(memory.content);

    for (const { entity, type } of entities) {
      if (!entityMap.has(entity)) {
        entityMap.set(entity, { type, mentions: 0, memory_ids: new Set() });
      }

      const entityData = entityMap.get(entity)!;
      entityData.mentions++;
      entityData.memory_ids.add(memory.memory_id);
    }

    // Also treat tags as entities
    for (const tag of memory.tags) {
      if (!entityMap.has(tag)) {
        entityMap.set(tag, { type: 'TAG', mentions: 0, memory_ids: new Set() });
      }
      const entityData = entityMap.get(tag)!;
      entityData.mentions++;
      entityData.memory_ids.add(memory.memory_id);
    }
  }

  // Build graph nodes
  const nodes: Array<{
    id: string;
    type: 'entity' | 'concept' | 'memory';
    label: string;
    properties?: Record<string, any>;
  }> = [];

  // Add entity nodes
  for (const [entity, data] of entityMap.entries()) {
    nodes.push({
      id: `entity_${entity.replace(/\s+/g, '_')}`,
      type: 'entity',
      label: entity,
      properties: {
        entity_type: data.type,
        mentions: data.mentions,
      },
    });
  }

  // Add memory nodes
  for (const memory of memories) {
    nodes.push({
      id: memory.memory_id,
      type: 'memory',
      label: memory.content.substring(0, 50) + (memory.content.length > 50 ? '...' : ''),
    });
  }

  // Build graph edges
  const edges: Array<{
    source: string;
    target: string;
    relationship: string;
    weight: number;
  }> = [];

  // Connect memories to entities
  for (const memory of memories) {
    const entities = extractEntities(memory.content);

    for (const { entity } of entities) {
      edges.push({
        source: memory.memory_id,
        target: `entity_${entity.replace(/\s+/g, '_')}`,
        relationship: 'MENTIONS',
        weight: 1.0,
      });
    }

    // Connect memories to tags
    for (const tag of memory.tags) {
      edges.push({
        source: memory.memory_id,
        target: `entity_${tag.replace(/\s+/g, '_')}`,
        relationship: 'TAGGED_WITH',
        weight: 1.0,
      });
    }
  }

  // Connect similar memories
  for (let i = 0; i < memories.length; i++) {
    for (let j = i + 1; j < memories.length; j++) {
      const similarity = calculateTextSimilarity(memories[i].content, memories[j].content);

      if (similarity >= min_similarity) {
        edges.push({
          source: memories[i].memory_id,
          target: memories[j].memory_id,
          relationship: 'SIMILAR_TO',
          weight: Math.round(similarity * 100) / 100,
        });
      }
    }
  }

  // Limit connections
  const sortedEdges = edges.sort((a, b) => b.weight - a.weight);
  const limitedEdges = sortedEdges.slice(0, max_connections);

  // Build entities output
  const entitiesOutput = Array.from(entityMap.entries()).map(([entity, data]) => ({
    entity,
    type: data.type,
    mentions: data.mentions,
  }));

  // Build relationships output
  const relationships: Array<{
    source_entity: string;
    target_entity: string;
    relationship_type: string;
    confidence: number;
  }> = [];

  // Find entity co-occurrences
  const entityPairs = new Map<string, { count: number; contexts: string[] }>();

  for (const memory of memories) {
    const entities = extractEntities(memory.content);

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const pairKey = [entities[i].entity, entities[j].entity].sort().join('|');

        if (!entityPairs.has(pairKey)) {
          entityPairs.set(pairKey, { count: 0, contexts: [] });
        }

        const pairData = entityPairs.get(pairKey)!;
        pairData.count++;
        pairData.contexts.push(memory.content);
      }
    }
  }

  for (const [pairKey, data] of entityPairs.entries()) {
    const [entity1, entity2] = pairKey.split('|');
    const relType = detectRelationship(entity1, entity2, data.contexts[0]);
    const confidence = Math.min(1.0, data.count / memories.length);

    relationships.push({
      source_entity: entity1,
      target_entity: entity2,
      relationship_type: relType,
      confidence: Math.round(confidence * 100) / 100,
    });
  }

  // Calculate statistics
  const connectionCounts = new Map<string, number>();
  for (const edge of limitedEdges) {
    connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
    connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1);
  }

  const avgConnections = connectionCounts.size > 0
    ? Array.from(connectionCounts.values()).reduce((a, b) => a + b, 0) / connectionCounts.size
    : 0;

  const mostConnected = connectionCounts.size > 0
    ? Array.from(connectionCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
    : undefined;

  return {
    graph: {
      nodes,
      edges: limitedEdges,
    },
    entities: entitiesOutput,
    relationships,
    statistics: {
      total_nodes: nodes.length,
      total_edges: limitedEdges.length,
      avg_connections: Math.round(avgConnections * 100) / 100,
      most_connected: mostConnected,
    },
  };
}
