/**
 * Memory Synthesis Engine - Live Demo
 *
 * This example demonstrates all 4 tools in the Memory Synthesis Engine skill:
 * 1. store-memory: Hierarchical memory storage (working/short-term/long-term)
 * 2. retrieve-relevant: Semantic retrieval with relevance scoring
 * 3. build-knowledge-graph: Entity extraction and relationship discovery
 * 4. resume-session: Session context restoration
 */

import {
  storeMemory,
  retrieveRelevant,
  buildKnowledgeGraph,
  resumeSession,
  type StoreMemoryInput,
  type RetrieveRelevantInput,
  type BuildKnowledgeGraphInput,
  type ResumeSessionInput,
} from '@agentfoundry/skills/memory-synthesis-engine';

// ============================================================================
// Example 1: Store Memories with Hierarchical Organization
// ============================================================================

async function example1_StoreMemory() {
  console.log('💾 Example 1: Store Memories in Hierarchical Structure\n');

  // Store multiple memories with different tiers and importance
  const memories = [
    {
      content: 'User prefers TypeScript over JavaScript for all new projects',
      memory_tier: 'long_term' as const,
      importance: 0.9,
      tags: ['preferences', 'programming', 'typescript'],
      session_id: 'session-001',
    },
    {
      content: 'Currently working on AgentFoundry marketplace feature with Next.js 15',
      memory_tier: 'short_term' as const,
      importance: 0.75,
      tags: ['current_task', 'agentfoundry', 'nextjs'],
      session_id: 'session-001',
    },
    {
      content: 'Need to implement cost prediction before launching to production',
      memory_tier: 'working' as const,
      importance: 0.85,
      tags: ['todo', 'production', 'cost-predictor'],
      session_id: 'session-001',
    },
    {
      content: 'API uses NestJS on port 4100, Web uses Next.js on port 3100',
      memory_tier: 'long_term' as const,
      importance: 0.8,
      tags: ['architecture', 'configuration', 'ports'],
      session_id: 'session-001',
    },
  ];

  console.log('Storing 4 memories across different tiers...\n');

  for (const memoryInput of memories) {
    const result = await storeMemory(memoryInput);
    const tierEmoji = memoryInput.memory_tier === 'long_term' ? '🔒' :
                     memoryInput.memory_tier === 'short_term' ? '📅' : '⚡';
    console.log(`${tierEmoji} Stored [${result.memory_tier.toUpperCase()}]: ${result.memory_id}`);
    console.log(`   Content: ${result.content.substring(0, 60)}...`);
    console.log(`   Importance: ${(result.importance * 100).toFixed(0)}%`);
    console.log(`   Tags: ${result.tags.join(', ')}`);
    console.log(`   Expires: ${result.expires_at ? new Date(result.expires_at).toLocaleDateString() : 'Never'}\n`);
  }

  console.log('✅ All memories stored successfully!\n');
  console.log('=' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 2: Retrieve Relevant Memories with Semantic Search
// ============================================================================

async function example2_RetrieveRelevant() {
  console.log('🔍 Example 2: Semantic Memory Retrieval\n');

  const input: RetrieveRelevantInput = {
    query: 'What technology stack is being used for the web application?',
    max_results: 5,
    min_relevance_score: 0.3,
    memory_tiers: ['long_term', 'short_term'],
    session_id: 'session-001',
  };

  const result = await retrieveRelevant(input);

  console.log(`Query: "${result.query}"\n`);

  console.log(`Found ${result.memories.length} relevant memories:\n`);

  result.memories.forEach((memory, i) => {
    const relevanceBar = '█'.repeat(Math.floor(memory.relevance_score * 10));
    console.log(`${i + 1}. [${memory.memory_tier.toUpperCase()}] Score: ${(memory.relevance_score * 100).toFixed(0)}% ${relevanceBar}`);
    console.log(`   ${memory.content}`);
    console.log(`   Tags: ${memory.tags.join(', ')}`);
    console.log(`   Stored: ${new Date(memory.stored_at).toLocaleDateString()}\n`);
  });

  console.log('🧠 Context Summary:');
  console.log(`   ${result.context_summary}\n`);

  console.log('🔑 Extracted Keywords:');
  console.log(`   ${result.keywords.join(', ')}\n`);

  console.log(`⏱️  Retrieved in ${result.retrieval_time_ms}ms`);

  if (result.suggestions.length > 0) {
    console.log('\n💡 Related Queries:');
    result.suggestions.forEach(s => console.log(`   • ${s}`));
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 3: Build Knowledge Graph from Memories
// ============================================================================

async function example3_BuildKnowledgeGraph() {
  console.log('🕸️  Example 3: Build Knowledge Graph\n');

  const input: BuildKnowledgeGraphInput = {
    memories: [
      {
        memory_id: 'mem-001',
        content: 'AgentFoundry uses NestJS for the backend API on port 4100',
        tags: ['architecture', 'backend', 'nestjs'],
      },
      {
        memory_id: 'mem-002',
        content: 'Next.js 15 powers the frontend web application on port 3100',
        tags: ['architecture', 'frontend', 'nextjs'],
      },
      {
        memory_id: 'mem-003',
        content: 'PostgreSQL database stores users, skills, and subscriptions via Prisma ORM',
        tags: ['database', 'postgresql', 'prisma'],
      },
      {
        memory_id: 'mem-004',
        content: 'Python FastAPI validator service runs on port 5100 for skill validation',
        tags: ['validator', 'python', 'fastapi'],
      },
      {
        memory_id: 'mem-005',
        content: 'Turborepo manages the monorepo with pnpm workspaces',
        tags: ['tooling', 'monorepo', 'turborepo'],
      },
    ],
    max_connections: 50,
    min_similarity: 0.3,
  };

  const result = await buildKnowledgeGraph(input);

  console.log(`📊 Knowledge Graph Statistics:`);
  console.log(`   Nodes: ${result.statistics.total_nodes}`);
  console.log(`   Edges: ${result.statistics.total_edges}`);
  console.log(`   Avg Connections: ${result.statistics.avg_connections.toFixed(1)}`);
  console.log(`   Most Connected: ${result.statistics.most_connected || 'N/A'}\n`);

  console.log('🏷️  Discovered Entities:');
  const topEntities = result.entities
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10);

  topEntities.forEach((entity, i) => {
    console.log(`   ${i + 1}. ${entity.entity} (${entity.type}) - ${entity.mentions} mentions`);
  });

  console.log('\n🔗 Key Relationships:');
  const topRelationships = result.relationships
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);

  topRelationships.forEach((rel, i) => {
    console.log(`   ${i + 1}. ${rel.source_entity} --[${rel.relationship_type}]--> ${rel.target_entity}`);
    console.log(`      Confidence: ${(rel.confidence * 100).toFixed(0)}%`);
  });

  console.log('\n📈 Graph Structure:');
  console.log(`   Entity Nodes: ${result.graph.nodes.filter(n => n.type === 'entity').length}`);
  console.log(`   Memory Nodes: ${result.graph.nodes.filter(n => n.type === 'memory').length}`);
  console.log(`   Total Edges: ${result.graph.edges.length}\n`);

  console.log('=' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 4: Resume Session with Full Context
// ============================================================================

async function example4_ResumeSession() {
  console.log('🔄 Example 4: Resume Session with Context Restoration\n');

  const input: ResumeSessionInput = {
    session_id: 'session-001',
    include_context: true,
    context_window_days: 30,
  };

  const result = await resumeSession(input);

  console.log(`📋 Session: ${result.restored_context.session_id}`);
  console.log(`📅 Last Activity: ${new Date(result.last_activity).toLocaleDateString()}\n`);

  console.log('📊 Session Metadata:');
  console.log(`   Total Memories: ${result.session_metadata.total_memories}`);
  console.log(`   Active Duration: ${result.session_metadata.active_duration_days} days`);
  console.log(`   Avg Importance: ${(result.session_metadata.importance_avg * 100).toFixed(0)}%\n`);

  console.log('💭 Context Summary:');
  console.log(`   ${result.context_summary}\n`);

  if (result.restored_context.memories.length > 0) {
    console.log('🧠 Restored Memories (Top 5):');
    const topMemories = result.restored_context.memories
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5);

    topMemories.forEach((mem, i) => {
      console.log(`\n   ${i + 1}. [Importance: ${(mem.importance * 100).toFixed(0)}%]`);
      console.log(`      ${mem.content.substring(0, 80)}${mem.content.length > 80 ? '...' : ''}`);
      console.log(`      Stored: ${new Date(mem.stored_at).toLocaleDateString()}`);
    });
  }

  if (result.restored_context.entities.length > 0) {
    console.log('\n\n🏷️  Key Entities:');
    console.log(`   ${result.restored_context.entities.slice(0, 10).join(', ')}`);
  }

  if (result.restored_context.tags.length > 0) {
    console.log('\n🔖 Tags:');
    console.log(`   ${result.restored_context.tags.slice(0, 10).join(', ')}`);
  }

  console.log('\n\n💡 Continuation Suggestions:');
  result.continuation_suggestions.forEach((suggestion, i) => {
    console.log(`   ${i + 1}. ${suggestion}`);
  });

  console.log('\n' + '='.repeat(70) + '\n');
}

// ============================================================================
// Comprehensive Workflow: Full Memory Lifecycle
// ============================================================================

async function example5_FullWorkflow() {
  console.log('🔄 Example 5: Complete Memory Lifecycle Workflow\n');

  console.log('Step 1: Store initial memories...');
  await storeMemory({
    content: 'Building a multi-agent system for customer support automation',
    memory_tier: 'long_term',
    importance: 0.9,
    tags: ['project', 'multi-agent', 'customer-support'],
    session_id: 'workflow-session',
  });

  await storeMemory({
    content: 'Need to integrate with Zendesk API for ticket management',
    memory_tier: 'short_term',
    importance: 0.75,
    tags: ['integration', 'zendesk', 'api'],
    session_id: 'workflow-session',
  });

  console.log('✅ Memories stored\n');

  console.log('Step 2: Retrieve relevant context...');
  const retrieveResult = await retrieveRelevant({
    query: 'What are we building?',
    max_results: 3,
    min_relevance_score: 0.3,
    session_id: 'workflow-session',
  });
  console.log(`✅ Found ${retrieveResult.memories.length} relevant memories\n`);

  console.log('Step 3: Build knowledge graph...');
  const graphResult = await buildKnowledgeGraph({
    memories: retrieveResult.memories.map(m => ({
      memory_id: m.memory_id,
      content: m.content,
      tags: m.tags,
    })),
    max_connections: 20,
    min_similarity: 0.3,
  });
  console.log(`✅ Graph built: ${graphResult.statistics.total_nodes} nodes, ${graphResult.statistics.total_edges} edges\n`);

  console.log('Step 4: Resume session in new context...');
  const sessionResult = await resumeSession({
    session_id: 'workflow-session',
    include_context: true,
    context_window_days: 7,
  });
  console.log(`✅ Session resumed with ${sessionResult.session_metadata.total_memories} memories\n`);

  console.log('🎉 Complete workflow executed successfully!\n');
  console.log('=' + '='.repeat(70) + '\n');
}

// ============================================================================
// Run All Examples
// ============================================================================

async function runAllExamples() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║   Memory Synthesis Engine - Complete Demo Suite                  ║');
  console.log('║   Long-term context preservation and semantic retrieval           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  await example1_StoreMemory();
  await example2_RetrieveRelevant();
  await example3_BuildKnowledgeGraph();
  await example4_ResumeSession();
  await example5_FullWorkflow();

  console.log('✅ All examples completed successfully!\n');
  console.log('💡 Key Takeaways:');
  console.log('   • Store memories hierarchically (working/short-term/long-term)');
  console.log('   • Retrieve semantically relevant context with scoring');
  console.log('   • Build knowledge graphs to discover entity relationships');
  console.log('   • Resume sessions with full context restoration\n');
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export { runAllExamples };
