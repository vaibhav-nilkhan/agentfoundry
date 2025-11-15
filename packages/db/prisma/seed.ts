import { PrismaClient, SkillStatus, PricingType, Platform, UserRole, UserStatus, SubscriptionTier, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create AgentFoundry team user
  const teamUser = await prisma.user.upsert({
    where: { email: 'team@agentfoundry.dev' },
    update: {},
    create: {
      firebaseUid: 'team-firebase-uid',
      email: 'team@agentfoundry.dev',
      displayName: 'AgentFoundry Team',
      bio: 'Official AgentFoundry team account',
      verified: true,
      reputation: 1000,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ Created team user:', teamUser.email);

  // Create demo users
  const demoUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'demo@agentfoundry.ai' },
      update: {},
      create: {
        firebaseUid: 'demo-firebase-uid',
        email: 'demo@agentfoundry.ai',
        displayName: 'Demo User',
        bio: 'Demo user for AgentFoundry',
        verified: true,
        reputation: 100,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin@agentfoundry.dev' },
      update: {},
      create: {
        firebaseUid: 'admin-firebase-uid',
        email: 'admin@agentfoundry.dev',
        displayName: 'Admin User',
        bio: 'Platform administrator',
        verified: true,
        reputation: 500,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    }),
  ]);

  console.log('✅ Created demo users');

  // Create subscriptions for demo users
  await Promise.all([
    prisma.subscription.upsert({
      where: { userId: demoUsers[0].id },
      update: {},
      create: {
        userId: demoUsers[0].id,
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        monthlyLimit: 100,
        usageCount: 25,
      },
    }),
    prisma.subscription.upsert({
      where: { userId: teamUser.id },
      update: {},
      create: {
        userId: teamUser.id,
        tier: SubscriptionTier.ENTERPRISE,
        status: SubscriptionStatus.ACTIVE,
      },
    }),
  ]);

  console.log('✅ Created subscriptions');

  // Create all 12 production skills
  const skills = [
    // 1. Agent Reliability Wrapper
    {
      name: 'Agent Reliability Wrapper',
      slug: 'agent-reliability-wrapper',
      description: 'Automatic retry, error recovery, and state management for AI agents',
      longDescription: 'Wraps agent execution with intelligent retry logic, error classification, rollback capabilities, and fallback strategies. Reduces 75% tool calling failure rate to <10%.',
      category: 'Agent Infrastructure',
      tags: ['reliability', 'retry', 'error-handling', 'infrastructure'],
      version: '1.0.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.MCP, Platform.LANGCHAIN],
      pricingType: PricingType.FREEMIUM,
      permissions: ['agent.execute', 'state.manage'],
      safetyScore: 0.98,
      rating: 4.9,
      reviewCount: 45,
      downloads: 892,
    },
    // 2. Tool Calling Wrapper
    {
      name: 'Tool Calling Wrapper',
      slug: 'tool-calling-wrapper',
      description: 'Universal tool execution wrapper with schema validation and automatic retry',
      longDescription: 'Validates tool inputs/outputs against schemas, handles timeouts, provides automatic retry with exponential backoff. Works across Claude, GPT, and open-source models.',
      category: 'Agent Infrastructure',
      tags: ['tools', 'validation', 'retry', 'cross-platform'],
      version: '1.0.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.GPT_ACTIONS, Platform.MCP],
      pricingType: PricingType.FREEMIUM,
      permissions: ['tool.execute', 'network.http'],
      safetyScore: 0.96,
      rating: 4.8,
      reviewCount: 38,
      downloads: 756,
    },
    // 3. JSON Validator
    {
      name: 'JSON Validator',
      slug: 'json-validator',
      description: 'Validate and auto-fix JSON from LLM outputs',
      longDescription: 'Validates JSON against schemas, auto-fixes common LLM formatting errors, generates schemas from examples. Reduces invalid JSON rate from 30% to <5%.',
      category: 'Data Validation',
      tags: ['json', 'validation', 'schema', 'auto-fix'],
      version: '1.0.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.GPT_ACTIONS, Platform.MCP],
      pricingType: PricingType.FREEMIUM,
      permissions: [],
      safetyScore: 0.99,
      rating: 4.7,
      reviewCount: 42,
      downloads: 823,
    },
    // 4. Context Compression Engine
    {
      name: 'Context Compression Engine',
      slug: 'context-compression-engine',
      description: 'Reduce token usage by 70% while maintaining quality',
      longDescription: 'Semantic compression, smart truncation, and adaptive windowing for long-running agents. Reduces API costs by $7K/month for high-volume users.',
      category: 'Cost Optimization',
      tags: ['compression', 'tokens', 'cost-optimization', 'context'],
      version: '1.0.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.GPT_ACTIONS, Platform.MCP],
      pricingType: PricingType.FREEMIUM,
      permissions: [],
      safetyScore: 0.97,
      rating: 4.8,
      reviewCount: 51,
      downloads: 934,
    },
    // 5. Error Recovery Orchestrator
    {
      name: 'Error Recovery Orchestrator',
      slug: 'error-recovery-orchestrator',
      description: 'Intelligent error detection and recovery for multi-step workflows',
      longDescription: 'Detects failures, classifies error types, and orchestrates recovery strategies. Handles transient vs permanent failures intelligently.',
      category: 'Agent Infrastructure',
      tags: ['error-recovery', 'orchestration', 'workflow', 'reliability'],
      version: '1.0.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.MCP, Platform.LANGCHAIN],
      pricingType: PricingType.FREEMIUM,
      permissions: ['workflow.manage'],
      safetyScore: 0.95,
      rating: 4.6,
      reviewCount: 29,
      downloads: 567,
    },
    // 6. Viral Content Predictor
    {
      name: 'Viral Content Predictor',
      slug: 'viral-content-predictor',
      description: 'Predict content virality before publishing',
      longDescription: 'Analyzes content characteristics, engagement patterns, and platform dynamics to predict viral potential. Helps content creators optimize before publishing.',
      category: 'Content Analysis',
      tags: ['content', 'prediction', 'virality', 'analytics'],
      version: '1.1.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.GPT_ACTIONS],
      pricingType: PricingType.FREEMIUM,
      permissions: ['analytics.read'],
      safetyScore: 0.92,
      rating: 4.5,
      reviewCount: 67,
      downloads: 1245,
    },
    // 7. Code Security Audit
    {
      name: 'Code Security Audit',
      slug: 'code-security-audit',
      description: 'Automated security vulnerability detection',
      longDescription: 'Scans code for security vulnerabilities, SQL injection, XSS, hardcoded secrets, and OWASP Top 10 issues. Provides fix recommendations.',
      category: 'Security',
      tags: ['security', 'audit', 'vulnerabilities', 'code-analysis'],
      version: '1.0.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.MCP],
      pricingType: PricingType.FREE,
      permissions: ['code.read'],
      safetyScore: 0.98,
      rating: 4.7,
      reviewCount: 53,
      downloads: 987,
    },
    // 8. API Contract Guardian
    {
      name: 'API Contract Guardian',
      slug: 'api-contract-guardian',
      description: 'Monitor and validate API contracts',
      longDescription: 'Tracks API schema changes, validates request/response contracts, detects breaking changes, and ensures API compatibility.',
      category: 'API Tools',
      tags: ['api', 'contracts', 'validation', 'monitoring'],
      version: '1.0.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.MCP],
      pricingType: PricingType.PAID,
      permissions: ['network.http', 'api.monitor'],
      safetyScore: 0.94,
      rating: 4.6,
      reviewCount: 45,
      downloads: 678,
    },
    // 9. GitHub PR Analyzer
    {
      name: 'GitHub PR Analyzer',
      slug: 'github-pr-analyzer',
      description: 'Intelligent pull request analysis and review',
      longDescription: 'Analyzes PRs for code quality, security issues, test coverage, and provides actionable feedback. Integrates with GitHub webhooks.',
      category: 'Developer Tools',
      tags: ['github', 'pull-request', 'code-review', 'analysis'],
      version: '1.0.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.MCP],
      pricingType: PricingType.FREEMIUM,
      permissions: ['github.read', 'network.http'],
      safetyScore: 0.96,
      rating: 4.8,
      reviewCount: 72,
      downloads: 1432,
    },
    // 10. Technical Debt Quantifier
    {
      name: 'Technical Debt Quantifier',
      slug: 'technical-debt-quantifier',
      description: 'Measure and track technical debt in codebases',
      longDescription: 'Analyzes code complexity, duplication, test coverage, and documentation quality to quantify technical debt. Provides prioritized remediation roadmap.',
      category: 'Code Analysis',
      tags: ['technical-debt', 'code-quality', 'metrics', 'refactoring'],
      version: '1.0.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.MCP],
      pricingType: PricingType.FREEMIUM,
      permissions: ['code.read', 'git.read'],
      safetyScore: 0.97,
      rating: 4.5,
      reviewCount: 34,
      downloads: 543,
    },
    // 11. Content Gap Analyzer
    {
      name: 'Content Gap Analyzer',
      slug: 'content-gap-analyzer',
      description: 'Find content opportunities and gaps',
      longDescription: 'Analyzes competitor content, identifies gaps, suggests topics with high potential, and provides SEO recommendations.',
      category: 'Content Strategy',
      tags: ['content', 'seo', 'gaps', 'strategy'],
      version: '1.0.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.GPT_ACTIONS],
      pricingType: PricingType.FREEMIUM,
      permissions: ['web.search', 'analytics.read'],
      safetyScore: 0.93,
      rating: 4.4,
      reviewCount: 41,
      downloads: 712,
    },
    // 12. AgentFoundry Design System
    {
      name: 'AgentFoundry Design System',
      slug: 'agentfoundry-design-system',
      description: 'Official AgentFoundry UI component library',
      longDescription: 'Complete design system with reusable components, Tailwind CSS integration, and responsive layouts. Free for all AgentFoundry developers.',
      category: 'Design',
      tags: ['design-system', 'ui', 'components', 'tailwind'],
      version: '1.0.0',
      status: SkillStatus.APPROVED,
      platforms: [Platform.CLAUDE_SKILLS, Platform.MCP],
      pricingType: PricingType.FREE,
      permissions: [],
      safetyScore: 1.0,
      rating: 4.9,
      reviewCount: 89,
      downloads: 2134,
    },
  ];

  // Create skills
  for (const skillData of skills) {
    const skill = await prisma.skill.upsert({
      where: { slug: skillData.slug },
      update: {},
      create: {
        ...skillData,
        authorId: teamUser.id,
        manifestUrl: `https://agentfoundry.ai/skills/${skillData.slug}/manifest.json`,
        publishedAt: new Date(),
      },
    });
    console.log('✅ Created skill:', skill.name);
  }

  // Create some reviews for popular skills
  const reviews = [
    {
      skillSlug: 'agent-reliability-wrapper',
      rating: 5,
      comment: 'This skill saved our production agents! Retry logic is perfect.',
      userId: demoUsers[0].id,
    },
    {
      skillSlug: 'tool-calling-wrapper',
      rating: 5,
      comment: 'Schema validation catches so many errors. Essential for any agent.',
      userId: demoUsers[0].id,
    },
    {
      skillSlug: 'context-compression-engine',
      rating: 5,
      comment: 'Reduced our API costs by 65%. Worth every penny!',
      userId: demoUsers[0].id,
    },
  ];

  for (const reviewData of reviews) {
    const skill = await prisma.skill.findUnique({
      where: { slug: reviewData.skillSlug },
    });
    if (skill) {
      await prisma.review.create({
        data: {
          skillId: skill.id,
          userId: reviewData.userId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
      });
    }
  }

  console.log('✅ Created reviews');

  console.log('🎉 Seeding completed! Created:');
  console.log('  - 3 users (team, demo, admin)');
  console.log('  - 2 subscriptions');
  console.log('  - 12 production skills');
  console.log('  - 3 reviews');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
