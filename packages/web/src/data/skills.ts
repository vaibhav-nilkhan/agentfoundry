export interface Skill {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: 'infrastructure' | 'developer-tools' | 'content-intelligence' | 'security' | 'design';
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
  },
  {
    id: 'agentfoundry-design-system',
    name: 'AgentFoundry Design System',
    slug: 'agentfoundry-design-system',
    tagline: 'Avoid generic AI aesthetics with professional design',
    description: 'Professional design system for AI agent UIs. Avoids Inter fonts, purple gradients, and glow effects. Clean color palettes, typography, animations, and component patterns inspired by Claude.ai, Linear, and Vercel.',
    category: 'design',
    icon: 'palette',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 0,
    rating: 5.0,
    pricing: {
      model: 'free',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['Complete design system access', 'All color palettes & typography', 'Animation patterns', 'Component examples']
        }
      ]
    },
    tools: [],
    tags: ['design-system', 'frontend', 'ui', 'professional', 'clean-design', 'anti-slop'],
    platforms: ['web', 'desktop'],
    repository: 'https://github.com/agentfoundry/skills/agentfoundry-design-system',
    documentation: 'https://docs.agentfoundry.dev/skills/agentfoundry-design-system'
  },
  {
    id: 'tool-calling-wrapper',
    name: 'Tool Calling Wrapper',
    slug: 'tool-calling-wrapper',
    tagline: 'Universal cross-framework tool execution with retry logic',
    description: 'Solve tool calling reliability with cross-framework compatibility. Reduce 75% tool calling failures with automatic retry, schema validation, and framework conversion for LangChain, LlamaIndex, MCP, OpenAI, and Claude.',
    category: 'infrastructure',
    icon: 'wrench',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 0,
    rating: 5.0,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['100 tool calls/month', 'Basic retry logic', 'Community support']
        },
        {
          name: 'Pro',
          price: 29,
          features: ['Unlimited tool calls', 'Advanced retry strategies', 'Cross-framework conversion', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 149,
          features: ['Custom integrations', 'On-premise deployment', 'SLA guarantees', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'validate_tool_schema', description: 'Pre-execution validation' },
      { name: 'execute_with_retry', description: 'Retry with exponential backoff' },
      { name: 'verify_output', description: 'Post-execution verification' },
      { name: 'convert_tool_format', description: 'Cross-framework conversion' }
    ],
    tags: ['tools', 'reliability', 'infrastructure', 'cross-framework'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/tool-calling-wrapper',
    documentation: 'https://docs.agentfoundry.dev/skills/tool-calling-wrapper'
  },
  {
    id: 'json-validator',
    name: 'JSON Validator',
    slug: 'json-validator',
    tagline: 'Automatic JSON validation with auto-fix and retry',
    description: 'Solve 30% invalid JSON rate from LLM outputs. Auto-fix malformed JSON, retry failed calls with enhanced prompts, and generate schemas from examples.',
    category: 'infrastructure',
    icon: 'code',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 0,
    rating: 5.0,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['100 validations/month', 'Basic auto-fix', 'Community support']
        },
        {
          name: 'Pro',
          price: 19,
          features: ['Unlimited validations', 'Retry with LLM', 'Schema generation', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 149,
          features: ['Custom schemas', 'On-premise deployment', 'SLA guarantees', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'validate_json', description: 'Validate JSON against schema' },
      { name: 'auto_fix_json', description: 'Auto-fix common JSON errors' },
      { name: 'retry_with_schema', description: 'Retry LLM with enhanced schema' },
      { name: 'generate_schema', description: 'Generate schema from examples' }
    ],
    tags: ['json', 'validation', 'infrastructure', 'llm-output'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/json-validator',
    documentation: 'https://docs.agentfoundry.dev/skills/json-validator'
  },
  {
    id: 'context-compression-engine',
    name: 'Context Compression Engine',
    slug: 'context-compression-engine',
    tagline: 'Reduce context by 60-80% while preserving meaning',
    description: 'Solve context window bloat and token cost explosion. Intelligent compression, relevance ranking, semantic deduplication, and progressive summarization.',
    category: 'infrastructure',
    icon: 'archive',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 0,
    rating: 5.0,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['50 compressions/month', 'Basic strategies', 'Community support']
        },
        {
          name: 'Pro',
          price: 29,
          features: ['Unlimited compressions', 'Advanced relevance scoring', 'All strategies', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 199,
          features: ['Custom compression strategies', 'API access', 'SLA guarantees', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'compress_context', description: 'Compress context by 60-80%' },
      { name: 'analyze_relevance', description: 'Score and rank by relevance' },
      { name: 'deduplicate_semantic', description: 'Remove redundant content' },
      { name: 'summarize_progressive', description: 'Multi-level summaries' }
    ],
    tags: ['compression', 'context', 'infrastructure', 'token-optimization'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/context-compression-engine',
    documentation: 'https://docs.agentfoundry.dev/skills/context-compression-engine'
  },
  {
    id: 'agent-reliability-wrapper',
    name: 'Agent Reliability Wrapper',
    slug: 'agent-reliability-wrapper',
    tagline: 'Wrap unreliable agents with automatic retry and fallback',
    description: 'Make unreliable agents production-ready with automatic retry logic, fallback strategies, circuit breakers, and exponential backoff. Reduce agent failures by 85%.',
    category: 'infrastructure',
    icon: 'shield',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 1523,
    rating: 4.9,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['100 wrapped calls/month', 'Basic retry logic', 'Community support']
        },
        {
          name: 'Pro',
          price: 39,
          features: ['Unlimited calls', 'Advanced strategies', 'Circuit breakers', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 199,
          features: ['Custom strategies', 'Multi-region', 'SLA guarantees', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'wrap_agent', description: 'Wrap agent with reliability patterns' },
      { name: 'configure_retry', description: 'Configure retry strategies' },
      { name: 'set_fallback', description: 'Set fallback behavior' },
      { name: 'monitor_health', description: 'Monitor agent health' }
    ],
    tags: ['reliability', 'infrastructure', 'retry', 'circuit-breaker'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/agent-reliability-wrapper',
    documentation: 'https://docs.agentfoundry.dev/skills/agent-reliability-wrapper'
  },
  {
    id: 'prompt-version-control',
    name: 'Prompt Version Control',
    slug: 'prompt-version-control',
    tagline: 'Git-like version control for prompts with A/B testing',
    description: 'Track prompt changes, A/B test variants, rollback breaking changes, and compare performance metrics. Built for production prompt engineering.',
    category: 'developer-tools',
    icon: 'code',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 892,
    rating: 4.7,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['10 prompts', 'Basic versioning', 'Community support']
        },
        {
          name: 'Pro',
          price: 29,
          features: ['Unlimited prompts', 'A/B testing', 'Analytics', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 149,
          features: ['Team collaboration', 'Advanced analytics', 'API access', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'save_prompt_version', description: 'Save new prompt version' },
      { name: 'compare_versions', description: 'Compare prompt versions' },
      { name: 'rollback_version', description: 'Rollback to previous version' },
      { name: 'ab_test_prompts', description: 'A/B test prompt variants' }
    ],
    tags: ['prompts', 'version-control', 'testing', 'developer-tools'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/prompt-version-control',
    documentation: 'https://docs.agentfoundry.dev/skills/prompt-version-control'
  },
  {
    id: 'smart-tool-selector',
    name: 'Smart Tool Selector',
    slug: 'smart-tool-selector',
    tagline: 'Intelligently filter 100+ tools down to optimal 20-30',
    description: 'Prevent agent tool overload. Filter from 100s of tools to optimal 20-30 based on task requirements, capability matching, and cost optimization. Improve selection accuracy from 40% to 85%.',
    category: 'infrastructure',
    icon: 'wrench',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 465,
    rating: 4.6,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['50 selections/month', 'Basic filtering', 'Community support']
        },
        {
          name: 'Pro',
          price: 39,
          features: ['Unlimited selections', 'Advanced matching', 'Learning from history', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 199,
          features: ['Custom strategies', 'Team optimization', 'API access', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'filter_tools', description: 'Filter tools by task requirements' },
      { name: 'match_capabilities', description: 'Match tools to capabilities' },
      { name: 'rank_by_cost', description: 'Rank by cost-effectiveness' },
      { name: 'learn_from_history', description: 'Improve from execution history' }
    ],
    tags: ['tool-selection', 'performance', 'capability-matching', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/smart-tool-selector',
    documentation: 'https://docs.agentfoundry.dev/skills/smart-tool-selector'
  },
  {
    id: 'cost-predictor-optimizer',
    name: 'Cost Predictor & Optimizer',
    slug: 'cost-predictor-optimizer',
    tagline: 'Estimate costs before execution and enforce budgets',
    description: 'Prevent $500/day billing surprises. Estimate token costs before execution, suggest cheaper alternatives, enforce spending caps, and track costs in real-time.',
    category: 'infrastructure',
    icon: 'currency',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 723,
    rating: 4.8,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['50 estimates/month', 'Basic cost tracking', 'Community support']
        },
        {
          name: 'Pro',
          price: 49,
          features: ['Unlimited estimates', 'Budget enforcement', 'Model alternatives', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 299,
          features: ['Team budgets', 'Advanced analytics', 'Custom alerts', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'estimate_cost', description: 'Predict token costs before execution' },
      { name: 'suggest_cheaper', description: 'Recommend cheaper alternatives' },
      { name: 'set_budget_limit', description: 'Enforce spending caps' },
      { name: 'track_costs', description: 'Real-time cost monitoring' }
    ],
    tags: ['cost-optimization', 'budget-control', 'token-tracking', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/cost-predictor-optimizer',
    documentation: 'https://docs.agentfoundry.dev/skills/cost-predictor-optimizer'
  },
  {
    id: 'multi-agent-orchestrator',
    name: 'Multi-Agent Orchestrator',
    slug: 'multi-agent-orchestrator',
    tagline: 'Coordinate 5-50 sub-agents with conflict resolution',
    description: 'Solve multi-agent chaos. Hierarchical coordination, conflict detection, deadlock prevention, and parallel execution optimization for 5-50 sub-agents.',
    category: 'infrastructure',
    icon: 'users',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 298,
    rating: 4.7,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['5 agents max', 'Basic coordination', 'Community support']
        },
        {
          name: 'Pro',
          price: 69,
          features: ['50 agents', 'Advanced conflict resolution', 'Parallel optimization', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 399,
          features: ['Unlimited agents', 'Custom strategies', 'Multi-region', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'orchestrate_agents', description: 'Coordinate multiple agents' },
      { name: 'detect_conflicts', description: 'Detect resource conflicts' },
      { name: 'resolve_deadlocks', description: 'Prevent and resolve deadlocks' },
      { name: 'optimize_parallel', description: 'Optimize parallel execution' }
    ],
    tags: ['multi-agent', 'coordination', 'conflict-resolution', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/multi-agent-orchestrator',
    documentation: 'https://docs.agentfoundry.dev/skills/multi-agent-orchestrator'
  },
  {
    id: 'decision-explainer',
    name: 'Decision Explainer',
    slug: 'decision-explainer',
    tagline: 'SOC 2/HIPAA compliant decision transparency',
    description: 'Explain agent decisions with full audit trails. Break down reasoning, track decision history, and generate compliance-ready reports for SOC 2 and HIPAA.',
    category: 'infrastructure',
    icon: 'document',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 412,
    rating: 4.8,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['50 explanations/month', 'Basic breakdown', 'Community support']
        },
        {
          name: 'Pro',
          price: 79,
          features: ['Unlimited explanations', 'Full audit trails', 'Compliance reports', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 499,
          features: ['Custom compliance', 'Advanced auditing', 'On-premise', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'explain_decision', description: 'Break down decision reasoning' },
      { name: 'track_decision_history', description: 'Track decision audit trail' },
      { name: 'generate_compliance_report', description: 'Generate compliance reports' },
      { name: 'compare_alternatives', description: 'Show alternative paths' }
    ],
    tags: ['explainability', 'compliance', 'audit-trails', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/decision-explainer',
    documentation: 'https://docs.agentfoundry.dev/skills/decision-explainer'
  },
  {
    id: 'memory-synthesis-engine',
    name: 'Memory Synthesis Engine',
    slug: 'memory-synthesis-engine',
    tagline: 'Long-term memory for multi-day projects',
    description: 'Resume multi-day projects exactly where you left off. Hierarchical memory, semantic retrieval, context synthesis, and session continuity across days/weeks/months.',
    category: 'infrastructure',
    icon: 'archive',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 587,
    rating: 4.9,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['10 sessions', '7 day retention', 'Community support']
        },
        {
          name: 'Pro',
          price: 49,
          features: ['Unlimited sessions', '90 day retention', 'Semantic search', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 249,
          features: ['Unlimited retention', 'Team sharing', 'Custom synthesis', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'store_memory', description: 'Store long-term memories' },
      { name: 'retrieve_relevant', description: 'Semantic memory retrieval' },
      { name: 'synthesize_context', description: 'Synthesize context from memories' },
      { name: 'resume_session', description: 'Resume previous sessions' }
    ],
    tags: ['memory', 'context', 'session-continuity', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/memory-synthesis-engine',
    documentation: 'https://docs.agentfoundry.dev/skills/memory-synthesis-engine'
  },
  {
    id: 'multi-step-validator',
    name: 'Multi-Step Validator',
    slug: 'multi-step-validator',
    tagline: 'Pre-execution validation prevents mid-workflow failures',
    description: 'Validate multi-step workflows before execution. Check dependencies, verify permissions, assess risks, and prevent failures before they happen.',
    category: 'infrastructure',
    icon: 'check',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 234,
    rating: 4.6,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['50 validations/month', 'Basic checks', 'Community support']
        },
        {
          name: 'Pro',
          price: 39,
          features: ['Unlimited validations', 'Advanced risk assessment', 'Custom rules', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 199,
          features: ['Team policies', 'Compliance validation', 'API access', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'validate_workflow', description: 'Validate entire workflow' },
      { name: 'check_dependencies', description: 'Check step dependencies' },
      { name: 'verify_permissions', description: 'Verify required permissions' },
      { name: 'assess_risk', description: 'Assess execution risks' }
    ],
    tags: ['validation', 'workflow', 'pre-execution', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/multi-step-validator',
    documentation: 'https://docs.agentfoundry.dev/skills/multi-step-validator'
  },
  {
    id: 'rollback-manager',
    name: 'Rollback Manager',
    slug: 'rollback-manager',
    tagline: 'Transaction-like rollback for agent actions',
    description: 'Undo agent actions when things go wrong. Checkpoint creation, automatic rollback on failure, selective restoration, and audit trails.',
    category: 'infrastructure',
    icon: 'undo',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 189,
    rating: 4.5,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['20 checkpoints/month', 'Basic rollback', 'Community support']
        },
        {
          name: 'Pro',
          price: 49,
          features: ['Unlimited checkpoints', 'Automatic rollback', 'Selective restore', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 299,
          features: ['Advanced audit trails', 'Multi-region backup', 'Custom policies', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'create_checkpoint', description: 'Create state checkpoint' },
      { name: 'rollback_to_checkpoint', description: 'Rollback to previous state' },
      { name: 'list_checkpoints', description: 'List available checkpoints' },
      { name: 'verify_rollback', description: 'Verify rollback success' }
    ],
    tags: ['rollback', 'transactions', 'state-management', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/rollback-manager',
    documentation: 'https://docs.agentfoundry.dev/skills/rollback-manager'
  },
  {
    id: 'data-freshness-validator',
    name: 'Data Freshness Validator',
    slug: 'data-freshness-validator',
    tagline: 'Prevent using stale data in agent workflows',
    description: 'Validate data freshness before using in workflows. Check staleness, invalidate caches, fetch fresh data, and track data age.',
    category: 'infrastructure',
    icon: 'clock',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 156,
    rating: 4.4,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['100 checks/month', 'Basic freshness', 'Community support']
        },
        {
          name: 'Pro',
          price: 29,
          features: ['Unlimited checks', 'Auto-refresh', 'Custom TTLs', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 149,
          features: ['Multi-source validation', 'Advanced policies', 'API access', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'check_freshness', description: 'Check data freshness' },
      { name: 'invalidate_stale', description: 'Invalidate stale data' },
      { name: 'fetch_fresh', description: 'Fetch fresh data' },
      { name: 'track_data_age', description: 'Track data age metrics' }
    ],
    tags: ['data-validation', 'freshness', 'caching', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/data-freshness-validator',
    documentation: 'https://docs.agentfoundry.dev/skills/data-freshness-validator'
  },
  {
    id: 'workflow-state-manager',
    name: 'Workflow State Manager',
    slug: 'workflow-state-manager',
    tagline: 'Pause and resume long-running workflows',
    description: 'Manage workflow state for long-running processes. Persist state, pause/resume execution, recover from failures, and track progress.',
    category: 'infrastructure',
    icon: 'play',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 201,
    rating: 4.5,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['5 workflows', '24h state retention', 'Community support']
        },
        {
          name: 'Pro',
          price: 39,
          features: ['Unlimited workflows', '30 day retention', 'Advanced recovery', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 249,
          features: ['Unlimited retention', 'Multi-region', 'Custom policies', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'persist_state', description: 'Persist workflow state' },
      { name: 'resume_workflow', description: 'Resume from saved state' },
      { name: 'pause_workflow', description: 'Pause execution' },
      { name: 'track_progress', description: 'Track workflow progress' }
    ],
    tags: ['workflow', 'state-management', 'pause-resume', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/workflow-state-manager',
    documentation: 'https://docs.agentfoundry.dev/skills/workflow-state-manager'
  },
  {
    id: 'conflict-resolver',
    name: 'Conflict Resolver',
    slug: 'conflict-resolver',
    tagline: 'Resolve resource conflicts between concurrent agents',
    description: 'Detect and resolve resource conflicts when multiple agents access shared resources. Lock management, conflict detection, resolution strategies, and deadlock prevention.',
    category: 'infrastructure',
    icon: 'alert',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 167,
    rating: 4.6,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['10 resolutions/month', 'Basic detection', 'Community support']
        },
        {
          name: 'Pro',
          price: 49,
          features: ['Unlimited resolutions', 'Advanced strategies', 'Lock management', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 299,
          features: ['Distributed locks', 'Custom policies', 'Multi-region', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'detect_conflicts', description: 'Detect resource conflicts' },
      { name: 'resolve_conflict', description: 'Resolve conflicts automatically' },
      { name: 'acquire_lock', description: 'Acquire resource locks' },
      { name: 'release_lock', description: 'Release resource locks' }
    ],
    tags: ['conflict-resolution', 'concurrency', 'locking', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/conflict-resolver',
    documentation: 'https://docs.agentfoundry.dev/skills/conflict-resolver'
  },
  {
    id: 'performance-monitor',
    name: 'Performance Monitor',
    slug: 'performance-monitor',
    tagline: 'Real-time agent performance tracking and alerts',
    description: 'Monitor agent performance in real-time. Track latency, throughput, errors, costs. Generate dashboards, set up alerts, and identify bottlenecks.',
    category: 'infrastructure',
    icon: 'chart',
    version: '1.0.0',
    author: 'AgentFoundry',
    downloads: 345,
    rating: 4.7,
    pricing: {
      model: 'freemium',
      tiers: [
        {
          name: 'Free',
          price: 0,
          features: ['Basic metrics', '7 day retention', 'Community support']
        },
        {
          name: 'Pro',
          price: 59,
          features: ['Advanced metrics', '90 day retention', 'Custom dashboards', 'Alerts', 'Priority support']
        },
        {
          name: 'Enterprise',
          price: 299,
          features: ['Unlimited retention', 'Custom integrations', 'SLA monitoring', 'Dedicated support']
        }
      ]
    },
    tools: [
      { name: 'track_metrics', description: 'Track performance metrics' },
      { name: 'generate_dashboard', description: 'Generate performance dashboard' },
      { name: 'set_alert', description: 'Set up performance alerts' },
      { name: 'identify_bottlenecks', description: 'Identify performance bottlenecks' }
    ],
    tags: ['monitoring', 'performance', 'metrics', 'infrastructure'],
    platforms: ['web', 'desktop', 'api'],
    repository: 'https://github.com/agentfoundry/skills/performance-monitor',
    documentation: 'https://docs.agentfoundry.dev/skills/performance-monitor'
  }
];

export const categories = [
  { id: 'all', name: 'All Skills', count: skills.length },
  { id: 'infrastructure', name: 'Infrastructure', count: skills.filter(s => s.category === 'infrastructure').length },
  { id: 'developer-tools', name: 'Developer Tools', count: skills.filter(s => s.category === 'developer-tools').length },
  { id: 'security', name: 'Security', count: skills.filter(s => s.category === 'security').length },
  { id: 'content-intelligence', name: 'Content Intelligence', count: skills.filter(s => s.category === 'content-intelligence').length },
  { id: 'design', name: 'Design', count: skills.filter(s => s.category === 'design').length }
];
