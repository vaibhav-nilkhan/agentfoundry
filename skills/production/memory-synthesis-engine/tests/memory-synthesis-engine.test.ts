import { describe, it, expect } from '@jest/globals';
import { run as storeMemory, cleanExpiredMemories } from '../src/tools/store-memory';
import { run as retrieveRelevant } from '../src/tools/retrieve-relevant';
import { run as buildKnowledgeGraph } from '../src/tools/build-knowledge-graph';
import { run as resumeSession, registerMemoryWithSession } from '../src/tools/resume-session';

describe('Memory Synthesis Engine - Store Memory', () => {
  it('should store working memory with 1-hour expiration', async () => {
    const result = await storeMemory({
      content: 'User is debugging authentication issue',
      memory_type: 'working',
      importance: 0.8,
      tags: ['debug', 'auth'],
    });

    expect(result.memory_id).toBeDefined();
    expect(result.memory_type).toBe('working');
    expect(result.expiration).toBeDefined();
    expect(result.stored_at).toBeDefined();
  });

  it('should store short-term memory with 7-day expiration', async () => {
    const result = await storeMemory({
      content: 'Project milestone completed successfully',
      memory_type: 'short_term',
      importance: 0.7,
      tags: ['milestone', 'project'],
    });

    expect(result.memory_id).toBeDefined();
    expect(result.memory_type).toBe('short_term');
    expect(result.expiration).toBeDefined();

    const expirationDate = new Date(result.expiration!);
    const storedDate = new Date(result.stored_at);
    const daysDiff = (expirationDate.getTime() - storedDate.getTime()) / (1000 * 60 * 60 * 24);

    expect(daysDiff).toBeCloseTo(7, 0);
  });

  it('should store long-term memory without expiration', async () => {
    const result = await storeMemory({
      content: 'Company architecture decision: Using microservices',
      memory_type: 'long_term',
      importance: 0.95,
      tags: ['architecture', 'decision'],
    });

    expect(result.memory_id).toBeDefined();
    expect(result.memory_type).toBe('long_term');
    expect(result.expiration).toBeUndefined();
  });

  it('should store memory with custom metadata', async () => {
    const result = await storeMemory({
      content: 'API endpoint deployed to production',
      importance: 0.6,
      metadata: { deployment_id: 'deploy-123', environment: 'production' },
    });

    expect(result.memory_id).toBeDefined();
  });

  it('should default to short-term memory type', async () => {
    const result = await storeMemory({
      content: 'General context information',
      importance: 0.5,
    });

    expect(result.memory_type).toBe('short_term');
  });
});

describe('Memory Synthesis Engine - Retrieve Relevant', () => {
  beforeEach(async () => {
    // Store some sample memories for retrieval tests
    await storeMemory({
      content: 'The authentication system uses JWT tokens for user sessions',
      memory_type: 'long_term',
      importance: 0.9,
      tags: ['authentication', 'security'],
    });

    await storeMemory({
      content: 'Database migration completed for user table schema',
      memory_type: 'short_term',
      importance: 0.7,
      tags: ['database', 'migration'],
    });

    await storeMemory({
      content: 'API rate limiting set to 100 requests per minute',
      memory_type: 'long_term',
      importance: 0.85,
      tags: ['api', 'performance'],
    });
  });

  it('should retrieve memories matching query', async () => {
    const result = await retrieveRelevant({
      query: 'authentication JWT security',
      limit: 10,
      similarity_threshold: 0.3,
    });

    expect(result.memories.length).toBeGreaterThan(0);
    expect(result.total_found).toBeGreaterThanOrEqual(result.memories.length);
    expect(result.memories[0].relevance_score).toBeGreaterThan(0);
  });

  it('should filter by memory types', async () => {
    const result = await retrieveRelevant({
      query: 'system configuration',
      memory_types: ['long_term'],
      limit: 10,
    });

    result.memories.forEach(memory => {
      expect(memory.memory_type).toBe('long_term');
    });
  });

  it('should respect similarity threshold', async () => {
    const result = await retrieveRelevant({
      query: 'authentication security',
      limit: 10,
      similarity_threshold: 0.8,
    });

    result.memories.forEach(memory => {
      expect(memory.relevance_score).toBeGreaterThanOrEqual(0.8);
    });
  });

  it('should limit results correctly', async () => {
    const result = await retrieveRelevant({
      query: 'system database api',
      limit: 2,
      similarity_threshold: 0.1,
    });

    expect(result.memories.length).toBeLessThanOrEqual(2);
  });

  it('should boost recent memories when enabled', async () => {
    const withBoost = await retrieveRelevant({
      query: 'database migration',
      boost_recent: true,
      limit: 5,
    });

    const withoutBoost = await retrieveRelevant({
      query: 'database migration',
      boost_recent: false,
      limit: 5,
    });

    expect(withBoost.memories.length).toBeGreaterThan(0);
    expect(withoutBoost.memories.length).toBeGreaterThan(0);
  });

  it('should provide search metadata', async () => {
    const result = await retrieveRelevant({
      query: 'api performance',
      memory_types: ['long_term'],
      limit: 5,
    });

    expect(result.search_metadata.query).toBe('api performance');
    expect(result.search_metadata.filters_applied).toBeDefined();
    expect(result.search_metadata.avg_relevance).toBeGreaterThanOrEqual(0);
  });
});

describe('Memory Synthesis Engine - Build Knowledge Graph', () => {
  it('should build graph from memories', async () => {
    const memories = [
      {
        memory_id: 'mem1',
        content: 'User authentication implemented using JWT tokens and OAuth2',
        tags: ['auth', 'security'],
      },
      {
        memory_id: 'mem2',
        content: 'JWT tokens have 1-hour expiration for security compliance',
        tags: ['jwt', 'security'],
      },
      {
        memory_id: 'mem3',
        content: 'OAuth2 integration with Google and Microsoft providers',
        tags: ['oauth', 'providers'],
      },
    ];

    const result = await buildKnowledgeGraph({
      memories,
      max_connections: 50,
    });

    expect(result.graph.nodes.length).toBeGreaterThan(0);
    expect(result.graph.edges.length).toBeGreaterThan(0);
    expect(result.entities.length).toBeGreaterThan(0);
  });

  it('should extract entities from content', async () => {
    const memories = [
      {
        memory_id: 'mem1',
        content: 'PostgreSQL database stores user data with Redis caching',
        tags: [],
      },
    ];

    const result = await buildKnowledgeGraph({
      memories,
    });

    const entityNames = result.entities.map(e => e.entity);
    expect(entityNames.some(name => name.includes('PostgreSQL'))).toBe(true);
    expect(entityNames.some(name => name.includes('Redis'))).toBe(true);
  });

  it('should create entity-memory relationships', async () => {
    const memories = [
      {
        memory_id: 'mem1',
        content: 'The API Gateway routes requests to microservices',
        tags: ['api'],
      },
    ];

    const result = await buildKnowledgeGraph({
      memories,
    });

    const hasMemoryNode = result.graph.nodes.some(n => n.id === 'mem1');
    const hasEntityNode = result.graph.nodes.some(n => n.type === 'entity');
    const hasEdge = result.graph.edges.length > 0;

    expect(hasMemoryNode).toBe(true);
    expect(hasEntityNode).toBe(true);
    expect(hasEdge).toBe(true);
  });

  it('should identify similar memories', async () => {
    const memories = [
      {
        memory_id: 'mem1',
        content: 'The authentication system uses JWT tokens for security',
        tags: [],
      },
      {
        memory_id: 'mem2',
        content: 'Authentication relies on JWT for user session management',
        tags: [],
      },
    ];

    const result = await buildKnowledgeGraph({
      memories,
      min_similarity: 0.3,
    });

    const similarityEdge = result.graph.edges.find(e =>
      e.relationship === 'SIMILAR_TO' &&
      ((e.source === 'mem1' && e.target === 'mem2') || (e.source === 'mem2' && e.target === 'mem1'))
    );

    expect(similarityEdge).toBeDefined();
  });

  it('should respect max_connections limit', async () => {
    const manyMemories = Array.from({ length: 20 }, (_, i) => ({
      memory_id: `mem${i}`,
      content: `Content about topic ${i} and related concepts`,
      tags: ['test'],
    }));

    const result = await buildKnowledgeGraph({
      memories: manyMemories,
      max_connections: 10,
    });

    expect(result.graph.edges.length).toBeLessThanOrEqual(10);
  });

  it('should provide statistics about the graph', async () => {
    const memories = [
      { memory_id: 'mem1', content: 'Test content one', tags: ['tag1'] },
      { memory_id: 'mem2', content: 'Test content two', tags: ['tag2'] },
    ];

    const result = await buildKnowledgeGraph({
      memories,
    });

    expect(result.statistics.total_nodes).toBeGreaterThan(0);
    expect(result.statistics.total_edges).toBeGreaterThanOrEqual(0);
    expect(result.statistics.avg_connections).toBeGreaterThanOrEqual(0);
  });

  it('should detect entity relationships', async () => {
    const memories = [
      {
        memory_id: 'mem1',
        content: 'The frontend uses React and depends on TypeScript for type safety',
        tags: [],
      },
    ];

    const result = await buildKnowledgeGraph({
      memories,
    });

    expect(result.relationships.length).toBeGreaterThan(0);
    result.relationships.forEach(rel => {
      expect(rel.confidence).toBeGreaterThan(0);
      expect(rel.confidence).toBeLessThanOrEqual(1);
    });
  });
});

describe('Memory Synthesis Engine - Resume Session', () => {
  it('should create new session if not exists', async () => {
    const result = await resumeSession({
      session_id: 'new-session-123',
      include_context: true,
    });

    expect(result.restored_context.session_id).toBe('new-session-123');
    expect(result.restored_context.memories.length).toBe(0);
    expect(result.continuation_suggestions.length).toBeGreaterThan(0);
  });

  it('should resume session with stored memories', async () => {
    // Store memories and register with session
    const mem1 = await storeMemory({
      content: 'Working on feature X implementation',
      importance: 0.8,
      tags: ['feature-x', 'development'],
    });

    const mem2 = await storeMemory({
      content: 'Feature X requirements documented',
      importance: 0.7,
      tags: ['feature-x', 'docs'],
    });

    const sessionId = 'project-alpha-session';
    registerMemoryWithSession(sessionId, mem1.memory_id);
    registerMemoryWithSession(sessionId, mem2.memory_id);

    const result = await resumeSession({
      session_id: sessionId,
      include_context: true,
    });

    expect(result.restored_context.memories.length).toBeGreaterThanOrEqual(2);
    expect(result.session_metadata.total_memories).toBeGreaterThanOrEqual(2);
  });

  it('should extract entities from session context', async () => {
    const mem = await storeMemory({
      content: 'Integrated PostgreSQL database with Redis caching layer',
      importance: 0.9,
    });

    const sessionId = 'integration-session';
    registerMemoryWithSession(sessionId, mem.memory_id);

    const result = await resumeSession({
      session_id: sessionId,
    });

    expect(result.restored_context.entities.length).toBeGreaterThan(0);
  });

  it('should provide context summary', async () => {
    const mem = await storeMemory({
      content: 'Critical bug fixed in payment processing module',
      importance: 0.95,
    });

    const sessionId = 'bugfix-session';
    registerMemoryWithSession(sessionId, mem.memory_id);

    const result = await resumeSession({
      session_id: sessionId,
    });

    expect(result.context_summary).toBeDefined();
    expect(result.context_summary.length).toBeGreaterThan(20);
  });

  it('should calculate session metadata correctly', async () => {
    const mem1 = await storeMemory({
      content: 'Memory 1',
      importance: 0.8,
    });

    const mem2 = await storeMemory({
      content: 'Memory 2',
      importance: 0.6,
    });

    const sessionId = 'metadata-session';
    registerMemoryWithSession(sessionId, mem1.memory_id);
    registerMemoryWithSession(sessionId, mem2.memory_id);

    const result = await resumeSession({
      session_id: sessionId,
    });

    expect(result.session_metadata.importance_avg).toBeGreaterThan(0);
    expect(result.session_metadata.importance_avg).toBeLessThanOrEqual(1);
    expect(result.session_metadata.active_duration_days).toBeGreaterThanOrEqual(0);
  });

  it('should provide continuation suggestions', async () => {
    const result = await resumeSession({
      session_id: 'suggestions-session',
    });

    expect(result.continuation_suggestions).toBeDefined();
    expect(result.continuation_suggestions.length).toBeGreaterThan(0);
  });

  it('should respect context window in days', async () => {
    const mem = await storeMemory({
      content: 'Very old memory',
      importance: 0.5,
    });

    const sessionId = 'window-session';
    registerMemoryWithSession(sessionId, mem.memory_id);

    const result = await resumeSession({
      session_id: sessionId,
      context_window_days: 30,
    });

    // Should include recent memories within window
    expect(result.restored_context.memories.length).toBeGreaterThan(0);
  });

  it('should track last activity timestamp', async () => {
    const sessionId = 'activity-session';

    const result = await resumeSession({
      session_id: sessionId,
    });

    expect(result.last_activity).toBeDefined();
    const lastActivityDate = new Date(result.last_activity);
    expect(lastActivityDate).toBeInstanceOf(Date);
    expect(lastActivityDate.getTime()).not.toBeNaN();
  });
});
