export interface Skill {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: 'infrastructure' | 'developer-tools' | 'content-intelligence' | 'security';
  icon: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  pricing: {
    model: 'free' | 'freemium' | 'paid';
    tiers: {
      name: string;
      price: number;
      features: string[];
    }[];
  };
  tools: {
    name: string;
    description: string;
  }[];
  tags: string[];
  platforms: string[];
  repository: string;
  documentation: string;
}

export const skills: Skill[] = [
  {
    id: 'error-recovery-orchestrator',
    name: 'Error Recovery Orchestrator',
    slug: 'error-recovery-orchestrator',
    tagline: 'Intelligent error detection and automatic recovery',
    description: 'Infrastructure skill that makes all other skills work better. Automatic error recovery, health monitoring, and failure prediction for production AI agent systems.',
    category: 'infrastructure',
    icon: 'shield',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 1247,
    rating: 4.9,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['100 recoveries/month', 'Basic error detection', 'Community support']
        },
        {
          name: 'Pro',
          price: 49,
          features: ['Unlimited recoveries', 'Advanced analytics', 'Priority support', 'Custom strategies']
        }
      ]
    },
    tools: [
      { name: 'detect_error', description: 'Classify error type and severity' },
      { name: 'recover_from_error', description: 'Execute recovery strategy' },
      { name: 'check_health', description: 'Monitor system health score' },
      { name: 'predict_failure', description: 'Predict failures 5+ minutes ahead' }
    ],
    tags: ['error-handling', 'monitoring', 'reliability', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/error-recovery-orchestrator',
    documentation: 'https://docs.agentfoundry.dev/skills/error-recovery-orchestrator'
  },
  {
    id: 'api-contract-guardian',
    name: 'API Contract Guardian',
    slug: 'api-contract-guardian',
    tagline: 'Detect breaking API changes before shipping',
    description: 'Detect breaking API changes, generate tests, and analyze consumer impact. Prevent production incidents with automated API contract validation.',
    category: 'developer-tools',
    icon: 'document',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 892,
    rating: 4.8,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['100 requests/month', '500KB spec size', 'Basic detection']
        },
        {
          name: 'Pro',
          price: 29,
          features: ['1,000 requests/month', '5MB spec size', 'Consumer impact analysis', 'Migration guides']
        },
        {
          name: 'Enterprise',
          price: 199,
          features: ['Unlimited requests', 'Unlimited spec size', 'Custom CI/CD integration', 'SLA guarantees']
        }
      ]
    },
    tools: [
      { name: 'detect_breaking_changes', description: 'Compare OpenAPI specs and detect breaking changes' },
      { name: 'generate_api_tests', description: 'Auto-generate test suite from spec' },
      { name: 'analyze_consumer_impact', description: 'Analyze which consumers affected' },
      { name: 'generate_migration_guide', description: 'Create migration documentation' }
    ],
    tags: ['api', 'openapi', 'testing', 'versioning', 'ci-cd'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/api-contract-guardian',
    documentation: 'https://docs.agentfoundry.dev/skills/api-contract-guardian'
  },
  {
    id: 'code-security-audit',
    name: 'Code Security Audit',
    slug: 'code-security-audit',
    tagline: 'AI-powered security scanning with automated fixes',
    description: 'Find and fix vulnerabilities before they reach production. OWASP Top 10 coverage, AI-powered fixes, and compliance reporting.',
    category: 'security',
    icon: 'lock',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 2341,
    rating: 4.9,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['10 scans/month', 'Basic vulnerability detection', 'Community support']
        },
        {
          name: 'Pro',
          price: 99,
          features: ['100 scans/month', 'Automated fixes', 'Compliance reports', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 499,
          features: ['Unlimited scans', 'Custom integrations', 'On-premise deployment', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'scan_codebase', description: 'Scan for security vulnerabilities' },
      { name: 'generate_fix', description: 'Generate automated security fixes' },
      { name: 'verify_fix', description: 'Verify fixes resolve vulnerabilities' },
      { name: 'monitor_dependencies', description: 'Monitor dependency vulnerabilities' }
    ],
    tags: ['security', 'owasp', 'vulnerabilities', 'compliance'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/code-security-audit',
    documentation: 'https://docs.agentfoundry.dev/skills/code-security-audit'
  },
  {
    id: 'github-pr-analyzer',
    name: 'GitHub PR Analyzer',
    slug: 'github-pr-analyzer',
    tagline: 'Intelligent PR analysis with security scanning',
    description: 'Comprehensive pull request analysis with quality scoring, security scanning, and AI-powered reviewer suggestions.',
    category: 'developer-tools',
    icon: 'code',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 1523,
    rating: 4.7,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['50 PRs/month', 'Basic analysis', 'Public repos only']
        },
        {
          name: 'Pro',
          price: 39,
          features: ['500 PRs/month', 'Advanced analysis', 'Private repos', 'Custom rules']
        }
      ]
    },
    tools: [
      { name: 'analyze_pr', description: 'Comprehensive PR analysis' },
      { name: 'suggest_reviewers', description: 'AI-powered reviewer suggestions' },
      { name: 'check_merge_safety', description: 'Verify safe to merge' }
    ],
    tags: ['github', 'code-review', 'pull-requests', 'security'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/github-pr-analyzer',
    documentation: 'https://docs.agentfoundry.dev/skills/github-pr-analyzer'
  },
  {
    id: 'technical-debt-quantifier',
    name: 'Technical Debt Quantifier',
    slug: 'technical-debt-quantifier',
    tagline: 'Quantify tech debt in dollar values',
    description: 'Turn technical debt into business metrics. ROI-based refactoring prioritization with dollar cost calculations.',
    category: 'developer-tools',
    icon: 'currency',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 687,
    rating: 4.8,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['10 analyses/month', '1 repository', 'Basic metrics']
        },
        {
          name: 'Pro',
          price: 49,
          features: ['Unlimited analyses', '10 repositories', 'ROI tracking', 'Trend analysis']
        },
        {
          name: 'Enterprise',
          price: 299,
          features: ['Unlimited everything', 'Custom reporting', 'Multi-team support', 'Executive dashboards']
        }
      ]
    },
    tools: [
      { name: 'analyze_codebase', description: 'Analyze and quantify technical debt' },
      { name: 'prioritize_refactoring', description: 'ROI-based task prioritization' },
      { name: 'estimate_refactoring_cost', description: 'Estimate time and cost' },
      { name: 'track_debt_trends', description: 'Monitor debt over time' }
    ],
    tags: ['technical-debt', 'refactoring', 'metrics', 'roi'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/technical-debt-quantifier',
    documentation: 'https://docs.agentfoundry.dev/skills/technical-debt-quantifier'
  },
  {
    id: 'content-gap-analyzer',
    name: 'Content Gap Analyzer',
    slug: 'content-gap-analyzer',
    tagline: 'Find content gaps vs competitors',
    description: 'Discover untapped content opportunities. Compare against competitors, generate SEO-optimized briefs, and track new content.',
    category: 'content-intelligence',
    icon: 'chart',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 1134,
    rating: 4.6,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['50 requests/month', '3 competitors', 'Basic analysis']
        },
        {
          name: 'Pro',
          price: 49,
          features: ['500 requests/month', '10 competitors', 'Content briefs', 'Monitoring']
        },
        {
          name: 'Enterprise',
          price: 299,
          features: ['Unlimited requests', 'Unlimited competitors', 'Team collaboration', 'API access']
        }
      ]
    },
    tools: [
      { name: 'analyze_content_gaps', description: 'Find gaps vs competitors' },
      { name: 'generate_content_brief', description: 'Create SEO-optimized outlines' },
      { name: 'monitor_competitor_content', description: 'Track new content' },
      { name: 'find_question_gaps', description: 'Discover unanswered questions' }
    ],
    tags: ['content', 'seo', 'competitive-analysis', 'marketing'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/content-gap-analyzer',
    documentation: 'https://docs.agentfoundry.dev/skills/content-gap-analyzer'
  },
  {
    id: 'viral-content-predictor',
    name: 'Viral Content Predictor',
    slug: 'viral-content-predictor',
    tagline: 'Predict virality before publishing',
    description: 'Score content potential before you post. Platform-specific optimization for Twitter, LinkedIn, YouTube, TikTok, and Instagram.',
    category: 'content-intelligence',
    icon: 'trending',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 2089,
    rating: 4.7,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['5 predictions/month', '1 platform', 'Basic scoring']
        },
        {
          name: 'Creator',
          price: 39,
          features: ['Unlimited predictions', 'All platforms', 'A/B testing', 'Optimization']
        },
        {
          name: 'Pro',
          price: 99,
          features: ['Everything in Creator', 'API access', 'White-label', 'Priority support']
        }
      ]
    },
    tools: [
      { name: 'predict_virality', description: 'Score content before publishing' },
      { name: 'optimize_content', description: 'AI-powered improvements' },
      { name: 'test_variations', description: 'A/B test multiple versions' },
      { name: 'discover_viral_patterns', description: 'Learn what works for you' }
    ],
    tags: ['content', 'social-media', 'virality', 'marketing'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/viral-content-predictor',
    documentation: 'https://docs.agentfoundry.dev/skills/viral-content-predictor'
  }
];

export const categories = [
  { id: 'all', name: 'All Skills', count: skills.length },
  { id: 'infrastructure', name: 'Infrastructure', count: skills.filter(s => s.category === 'infrastructure').length },
  { id: 'developer-tools', name: 'Developer Tools', count: skills.filter(s => s.category === 'developer-tools').length },
  { id: 'security', name: 'Security', count: skills.filter(s => s.category === 'security').length },
  { id: 'content-intelligence', name: 'Content Intelligence', count: skills.filter(s => s.category === 'content-intelligence').length }
];
