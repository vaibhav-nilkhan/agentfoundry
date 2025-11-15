import { Client } from 'pg';
import { createId } from '@paralleldrive/cuid2';

// Direct PostgreSQL seeding script (bypasses Prisma Client)
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/agentfoundry';

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('🌱 Seeding database...');
    console.log('✅ Connected to PostgreSQL');

    // Create AgentFoundry team user
    const teamUserResult = await client.query(`
      INSERT INTO "User" (
        "id", "firebaseUid", "email", "displayName", "bio", "verified",
        "reputation", "role", "status", "createdAt", "updatedAt"
      ) VALUES (
        $1,
        'team-firebase-uid',
        'team@agentfoundry.dev',
        'AgentFoundry Team',
        'Official AgentFoundry team account',
        true,
        1000,
        'ADMIN',
        'ACTIVE',
        NOW(),
        NOW()
      )
      ON CONFLICT ("email") DO UPDATE SET
        "displayName" = EXCLUDED."displayName",
        "bio" = EXCLUDED."bio",
        "updatedAt" = NOW()
      RETURNING "id"
    `, [createId()]);
    const teamUserId = teamUserResult.rows[0].id;
    console.log('✅ Created team user:', 'team@agentfoundry.dev');

    // Create demo user
    const demoUserResult = await client.query(`
      INSERT INTO "User" (
        "id", "firebaseUid", "email", "displayName", "bio", "verified",
        "reputation", "role", "status", "createdAt", "updatedAt"
      ) VALUES (
        $1,
        'demo-firebase-uid',
        'demo@agentfoundry.ai',
        'Demo User',
        'Demo user for AgentFoundry',
        true,
        100,
        'USER',
        'ACTIVE',
        NOW(),
        NOW()
      )
      ON CONFLICT ("email") DO UPDATE SET
        "displayName" = EXCLUDED."displayName",
        "updatedAt" = NOW()
      RETURNING "id"
    `, [createId()]);
    const demoUserId = demoUserResult.rows[0].id;

    // Create admin user
    const adminUserResult = await client.query(`
      INSERT INTO "User" (
        "id", "firebaseUid", "email", "displayName", "bio", "verified",
        "reputation", "role", "status", "createdAt", "updatedAt"
      ) VALUES (
        $1,
        'admin-firebase-uid',
        'admin@agentfoundry.dev',
        'Admin User',
        'Platform administrator',
        true,
        500,
        'ADMIN',
        'ACTIVE',
        NOW(),
        NOW()
      )
      ON CONFLICT ("email") DO UPDATE SET
        "displayName" = EXCLUDED."displayName",
        "updatedAt" = NOW()
      RETURNING "id"
    `, [createId()]);
    const adminUserId = adminUserResult.rows[0].id;

    console.log('✅ Created demo users');

    // Create subscriptions
    await client.query(`
      INSERT INTO "Subscription" (
        "id", "userId", "tier", "status", "monthlyLimit", "usageCount",
        "resetDate", "currentPeriodStart", "currentPeriodEnd", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, 'FREE', 'ACTIVE', 100, 25,
        NOW() + INTERVAL '30 days', NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()
      )
      ON CONFLICT ("userId") DO UPDATE SET
        "tier" = EXCLUDED."tier",
        "status" = EXCLUDED."status",
        "updatedAt" = NOW()
    `, [createId(), demoUserId]);

    await client.query(`
      INSERT INTO "Subscription" (
        "id", "userId", "tier", "status",
        "resetDate", "currentPeriodStart", "currentPeriodEnd", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, 'ENTERPRISE', 'ACTIVE',
        NOW() + INTERVAL '30 days', NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()
      )
      ON CONFLICT ("userId") DO UPDATE SET
        "tier" = EXCLUDED."tier",
        "status" = EXCLUDED."status",
        "updatedAt" = NOW()
    `, [createId(), teamUserId]);

    console.log('✅ Created subscriptions');

    // Skills data
    const skills = [
      {
        name: 'Agent Reliability Wrapper',
        slug: 'agent-reliability-wrapper',
        description: 'Automatic retry, error recovery, and state management for AI agents',
        longDescription: 'Wraps agent execution with intelligent retry logic, error classification, rollback capabilities, and fallback strategies. Reduces 75% tool calling failure rate to <10%.',
        category: 'Agent Infrastructure',
        tags: ['reliability', 'retry', 'error-handling', 'infrastructure'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP', 'LANGCHAIN'],
        pricingType: 'FREEMIUM',
        permissions: ['agent.execute', 'state.manage'],
        safetyScore: 0.98,
        rating: 4.9,
        reviewCount: 45,
        downloads: 892,
      },
      {
        name: 'Tool Calling Wrapper',
        slug: 'tool-calling-wrapper',
        description: 'Universal tool execution wrapper with schema validation and automatic retry',
        longDescription: 'Validates tool inputs/outputs against schemas, handles timeouts, provides automatic retry with exponential backoff. Works across Claude, GPT, and open-source models.',
        category: 'Agent Infrastructure',
        tags: ['tools', 'validation', 'retry', 'cross-platform'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'GPT_ACTIONS', 'MCP'],
        pricingType: 'FREEMIUM',
        permissions: ['tool.execute', 'network.http'],
        safetyScore: 0.96,
        rating: 4.8,
        reviewCount: 38,
        downloads: 756,
      },
      {
        name: 'JSON Validator',
        slug: 'json-validator',
        description: 'Validate and auto-fix JSON from LLM outputs',
        longDescription: 'Validates JSON against schemas, auto-fixes common LLM formatting errors, generates schemas from examples. Reduces invalid JSON rate from 30% to <5%.',
        category: 'Data Validation',
        tags: ['json', 'validation', 'schema', 'auto-fix'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'GPT_ACTIONS', 'MCP'],
        pricingType: 'FREEMIUM',
        permissions: [],
        safetyScore: 0.99,
        rating: 4.7,
        reviewCount: 42,
        downloads: 823,
      },
      {
        name: 'Context Compression Engine',
        slug: 'context-compression-engine',
        description: 'Reduce token usage by 70% while maintaining quality',
        longDescription: 'Semantic compression, smart truncation, and adaptive windowing for long-running agents. Reduces API costs by $7K/month for high-volume users.',
        category: 'Cost Optimization',
        tags: ['compression', 'tokens', 'cost-optimization', 'context'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'GPT_ACTIONS', 'MCP'],
        pricingType: 'FREEMIUM',
        permissions: [],
        safetyScore: 0.97,
        rating: 4.8,
        reviewCount: 51,
        downloads: 934,
      },
      {
        name: 'Error Recovery Orchestrator',
        slug: 'error-recovery-orchestrator',
        description: 'Intelligent error detection and recovery for multi-step workflows',
        longDescription: 'Detects failures, classifies error types, and orchestrates recovery strategies. Handles transient vs permanent failures intelligently.',
        category: 'Agent Infrastructure',
        tags: ['error-recovery', 'orchestration', 'workflow', 'reliability'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP', 'LANGCHAIN'],
        pricingType: 'FREEMIUM',
        permissions: ['workflow.manage'],
        safetyScore: 0.95,
        rating: 4.6,
        reviewCount: 29,
        downloads: 567,
      },
      {
        name: 'Viral Content Predictor',
        slug: 'viral-content-predictor',
        description: 'Predict content virality before publishing',
        longDescription: 'Analyzes content characteristics, engagement patterns, and platform dynamics to predict viral potential. Helps content creators optimize before publishing.',
        category: 'Content Analysis',
        tags: ['content', 'prediction', 'virality', 'analytics'],
        version: '1.1.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'GPT_ACTIONS'],
        pricingType: 'FREEMIUM',
        permissions: ['analytics.read'],
        safetyScore: 0.92,
        rating: 4.5,
        reviewCount: 67,
        downloads: 1245,
      },
      {
        name: 'Code Security Audit',
        slug: 'code-security-audit',
        description: 'Automated security vulnerability detection',
        longDescription: 'Scans code for security vulnerabilities, SQL injection, XSS, hardcoded secrets, and OWASP Top 10 issues. Provides fix recommendations.',
        category: 'Security',
        tags: ['security', 'audit', 'vulnerabilities', 'code-analysis'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP'],
        pricingType: 'FREE',
        permissions: ['code.read'],
        safetyScore: 0.98,
        rating: 4.7,
        reviewCount: 53,
        downloads: 987,
      },
      {
        name: 'API Contract Guardian',
        slug: 'api-contract-guardian',
        description: 'Monitor and validate API contracts',
        longDescription: 'Tracks API schema changes, validates request/response contracts, detects breaking changes, and ensures API compatibility.',
        category: 'API Tools',
        tags: ['api', 'contracts', 'validation', 'monitoring'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP'],
        pricingType: 'PAID',
        permissions: ['network.http', 'api.monitor'],
        safetyScore: 0.94,
        rating: 4.6,
        reviewCount: 45,
        downloads: 678,
      },
      {
        name: 'GitHub PR Analyzer',
        slug: 'github-pr-analyzer',
        description: 'Intelligent pull request analysis and review',
        longDescription: 'Analyzes PRs for code quality, security issues, test coverage, and provides actionable feedback. Integrates with GitHub webhooks.',
        category: 'Developer Tools',
        tags: ['github', 'pull-request', 'code-review', 'analysis'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP'],
        pricingType: 'FREEMIUM',
        permissions: ['github.read', 'network.http'],
        safetyScore: 0.96,
        rating: 4.8,
        reviewCount: 72,
        downloads: 1432,
      },
      {
        name: 'Technical Debt Quantifier',
        slug: 'technical-debt-quantifier',
        description: 'Measure and track technical debt in codebases',
        longDescription: 'Analyzes code complexity, duplication, test coverage, and documentation quality to quantify technical debt. Provides prioritized remediation roadmap.',
        category: 'Code Analysis',
        tags: ['technical-debt', 'code-quality', 'metrics', 'refactoring'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP'],
        pricingType: 'FREEMIUM',
        permissions: ['code.read', 'git.read'],
        safetyScore: 0.97,
        rating: 4.5,
        reviewCount: 34,
        downloads: 543,
      },
      {
        name: 'Content Gap Analyzer',
        slug: 'content-gap-analyzer',
        description: 'Find content opportunities and gaps',
        longDescription: 'Analyzes competitor content, identifies gaps, suggests topics with high potential, and provides SEO recommendations.',
        category: 'Content Strategy',
        tags: ['content', 'seo', 'gaps', 'strategy'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'GPT_ACTIONS'],
        pricingType: 'FREEMIUM',
        permissions: ['web.search', 'analytics.read'],
        safetyScore: 0.93,
        rating: 4.4,
        reviewCount: 41,
        downloads: 712,
      },
      {
        name: 'AgentFoundry Design System',
        slug: 'agentfoundry-design-system',
        description: 'Official AgentFoundry UI component library',
        longDescription: 'Complete design system with reusable components, Tailwind CSS integration, and responsive layouts. Free for all AgentFoundry developers.',
        category: 'Design',
        tags: ['design-system', 'ui', 'components', 'tailwind'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP'],
        pricingType: 'FREE',
        permissions: [],
        safetyScore: 1.0,
        rating: 4.9,
        reviewCount: 89,
        downloads: 2134,
      },
      // New skills from Phase 2
      {
        name: 'Smart Tool Selector',
        slug: 'smart-tool-selector',
        description: 'Intelligently filter and select optimal tools from large tool sets (100+)',
        longDescription: 'Reduces tool set from 100s to optimal 20-30 based on task requirements. Includes capability matching, cost-aware selection, and learning from execution history.',
        category: 'Tool Management',
        tags: ['tool-selection', 'performance', 'capability-matching', 'cost-optimization'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP', 'GPT_ACTIONS', 'LANGCHAIN'],
        pricingType: 'FREEMIUM',
        permissions: ['storage'],
        safetyScore: 0.96,
        rating: 4.6,
        reviewCount: 28,
        downloads: 465,
      },
      {
        name: 'Cost Predictor & Optimizer',
        slug: 'cost-predictor-optimizer',
        description: 'Estimate token costs before execution and enforce budget limits',
        longDescription: 'Predicts execution costs, suggests cheaper model alternatives, enforces spending caps, and provides real-time cost tracking. Prevents $500/day billing surprises.',
        category: 'Cost Management',
        tags: ['cost-estimation', 'budget-control', 'cost-optimization', 'token-tracking'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP', 'GPT_ACTIONS'],
        pricingType: 'FREEMIUM',
        permissions: ['storage'],
        safetyScore: 0.95,
        rating: 4.7,
        reviewCount: 31,
        downloads: 512,
      },
      {
        name: 'Multi-Agent Orchestrator',
        slug: 'multi-agent-orchestrator',
        description: 'Coordinate 5+ sub-agents with conflict resolution and deadlock prevention',
        longDescription: 'Hierarchical agent coordination with dependency management, conflict detection, deadlock resolution, and parallel execution optimization.',
        category: 'Multi-Agent Coordination',
        tags: ['orchestration', 'coordination', 'conflict-resolution', 'parallelization'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP', 'LANGCHAIN'],
        pricingType: 'FREEMIUM',
        permissions: ['agent.coordinate'],
        safetyScore: 0.94,
        rating: 4.5,
        reviewCount: 19,
        downloads: 387,
      },
      {
        name: 'Decision Explainer',
        slug: 'decision-explainer',
        description: 'Provide transparent decision breakdowns and audit trails',
        longDescription: 'Step-by-step decision explanations, confidence scoring, compliance-ready audit trails, and visual decision trees. Essential for SOC 2, HIPAA compliance.',
        category: 'Transparency & Compliance',
        tags: ['explainability', 'audit-trail', 'decision-transparency', 'compliance'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP', 'GPT_ACTIONS'],
        pricingType: 'FREEMIUM',
        permissions: [],
        safetyScore: 0.98,
        rating: 4.4,
        reviewCount: 23,
        downloads: 398,
      },
      {
        name: 'Memory Synthesis Engine',
        slug: 'memory-synthesis-engine',
        description: 'Maintain context across days/weeks/months with hierarchical memory',
        longDescription: 'Long-term memory with semantic retrieval, knowledge graph construction, and session continuity. Resume multi-day projects exactly where you left off.',
        category: 'Context Management',
        tags: ['long-term-memory', 'context-preservation', 'knowledge-graph', 'session-continuity'],
        version: '1.0.0',
        status: 'APPROVED',
        platforms: ['CLAUDE_SKILLS', 'MCP', 'GPT_ACTIONS', 'LANGCHAIN'],
        pricingType: 'FREEMIUM',
        permissions: ['storage', 'network'],
        safetyScore: 0.93,
        rating: 4.3,
        reviewCount: 17,
        downloads: 341,
      },
    ];

    // Insert all skills
    for (const skill of skills) {
      const result = await client.query(`
        INSERT INTO "Skill" (
          "id", "name", "slug", "description", "longDescription", "category",
          "tags", "version", "status", "platforms", "pricingType",
          "permissions", "safetyScore", "rating", "reviewCount", "downloads",
          "authorId", "manifestUrl", "publishedAt", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW(), NOW()
        )
        ON CONFLICT ("slug") DO UPDATE SET
          "name" = EXCLUDED."name",
          "description" = EXCLUDED."description",
          "updatedAt" = NOW()
        RETURNING "id"
      `, [
        createId(),
        skill.name,
        skill.slug,
        skill.description,
        skill.longDescription,
        skill.category,
        skill.tags,
        skill.version,
        skill.status,
        skill.platforms,
        skill.pricingType,
        skill.permissions,
        skill.safetyScore,
        skill.rating,
        skill.reviewCount,
        skill.downloads,
        teamUserId,
        `https://agentfoundry.ai/skills/${skill.slug}/manifest.json`,
      ]);
      console.log('✅ Created skill:', skill.name);
    }

    // Get skill IDs for reviews
    const skillResults = await client.query(`
      SELECT "id", "slug" FROM "Skill"
      WHERE "slug" IN ('agent-reliability-wrapper', 'tool-calling-wrapper', 'context-compression-engine')
    `);

    const skillMap = new Map(skillResults.rows.map(row => [row.slug, row.id]));

    // Create reviews
    const reviews = [
      {
        skillSlug: 'agent-reliability-wrapper',
        rating: 5,
        comment: 'This skill saved our production agents! Retry logic is perfect.',
      },
      {
        skillSlug: 'tool-calling-wrapper',
        rating: 5,
        comment: 'Schema validation catches so many errors. Essential for any agent.',
      },
      {
        skillSlug: 'context-compression-engine',
        rating: 5,
        comment: 'Reduced our API costs by 65%. Worth every penny!',
      },
    ];

    for (const review of reviews) {
      const skillId = skillMap.get(review.skillSlug);
      if (skillId) {
        await client.query(`
          INSERT INTO "Review" (
            "id", "skillId", "userId", "rating", "comment", "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, $4, $5, NOW(), NOW()
          )
          ON CONFLICT ("skillId", "userId") DO NOTHING
        `, [createId(), skillId, demoUserId, review.rating, review.comment]);
      }
    }

    console.log('✅ Created reviews');

    console.log('🎉 Seeding completed! Created:');
    console.log('  - 3 users (team, demo, admin)');
    console.log('  - 2 subscriptions');
    console.log('  - 17 production skills (12 Phase 1 + 5 Phase 2)');
    console.log('  - 3 reviews');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
