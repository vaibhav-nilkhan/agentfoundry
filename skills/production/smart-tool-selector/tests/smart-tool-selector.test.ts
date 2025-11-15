import { describe, it, expect } from '@jest/globals';
import { run as filterTools } from '../src/tools/filter-tools';
import { run as matchCapabilities } from '../src/tools/match-capabilities';
import { run as rankByCost } from '../src/tools/rank-by-cost';
import { run as learnFromHistory } from '../src/tools/learn-from-history';

describe('Smart Tool Selector - Filter Tools', () => {
  const sampleTools = [
    {
      name: 'web-scraper',
      description: 'Scrape data from websites using HTTP requests',
      capabilities: ['http', 'parsing', 'data-extraction'],
      category: 'data-collection',
      cost_score: 0.8,
      performance_score: 0.7,
    },
    {
      name: 'api-client',
      description: 'Make REST API calls with authentication',
      capabilities: ['http', 'rest', 'authentication'],
      category: 'data-collection',
      cost_score: 0.9,
      performance_score: 0.9,
    },
    {
      name: 'database-query',
      description: 'Query SQL databases for data retrieval',
      capabilities: ['sql', 'database', 'data-retrieval'],
      category: 'data-storage',
      cost_score: 0.6,
      performance_score: 0.8,
    },
    {
      name: 'file-parser',
      description: 'Parse CSV, JSON, and XML files',
      capabilities: ['parsing', 'files', 'data-transformation'],
      category: 'data-processing',
      cost_score: 0.95,
      performance_score: 0.85,
    },
  ];

  it('should filter tools based on task description', async () => {
    const result = await filterTools({
      available_tools: sampleTools,
      task_description: 'Fetch data from REST API endpoints',
      max_tools: 2,
      filter_strategy: 'hybrid',
    });

    expect(result.filtered_count).toBeLessThanOrEqual(2);
    expect(result.filtered_tools.length).toBeLessThanOrEqual(2);
    expect(result.reduction_percentage).toBeGreaterThan(0);
    expect(result.filtered_tools[0].name).toBe('api-client'); // Most relevant
  });

  it('should filter by required capabilities', async () => {
    const result = await filterTools({
      available_tools: sampleTools,
      task_description: 'Process and transform data',
      max_tools: 3,
      filter_strategy: 'capability',
      required_capabilities: ['parsing', 'data-transformation'],
    });

    expect(result.filtered_tools.some(t => t.name === 'file-parser')).toBe(true);
    expect(result.filter_criteria.matched_capabilities).toContain('parsing');
  });

  it('should exclude specified categories', async () => {
    const result = await filterTools({
      available_tools: sampleTools,
      task_description: 'Get data from sources',
      max_tools: 10,
      exclude_categories: ['data-storage'],
    });

    expect(result.filtered_tools.every(t => t.name !== 'database-query')).toBe(true);
  });

  it('should optimize for cost', async () => {
    const result = await filterTools({
      available_tools: sampleTools,
      task_description: 'Extract data cheaply',
      max_tools: 2,
      filter_strategy: 'cost',
    });

    // Should prioritize high cost_score tools (file-parser, api-client)
    const topTool = result.filtered_tools[0];
    const toolData = sampleTools.find(t => t.name === topTool.name);
    expect(toolData?.cost_score).toBeGreaterThan(0.7);
  });
});

describe('Smart Tool Selector - Match Capabilities', () => {
  const capabilityTools = [
    {
      name: 'nlp-analyzer',
      description: 'Natural language processing and sentiment analysis',
      capabilities: ['nlp', 'sentiment-analysis', 'text-processing', 'machine-learning'],
      tags: ['ai', 'ml'],
    },
    {
      name: 'text-classifier',
      description: 'Classify text into categories',
      capabilities: ['classification', 'text-processing', 'machine-learning'],
      tags: ['ml', 'categorization'],
    },
    {
      name: 'speech-recognizer',
      description: 'Convert speech to text',
      capabilities: ['speech-recognition', 'audio-processing', 'transcription'],
      tags: ['ai', 'audio'],
    },
  ];

  it('should match tools with exact capabilities', async () => {
    const result = await matchCapabilities({
      tools: capabilityTools,
      required_capabilities: ['nlp', 'sentiment-analysis'],
      match_threshold: 0.7,
    });

    expect(result.matched_tools.length).toBeGreaterThan(0);
    expect(result.matched_tools[0].name).toBe('nlp-analyzer');
    expect(result.matched_tools[0].match_type).toBe('exact');
    expect(result.matched_tools[0].matched_capabilities).toContain('nlp');
  });

  it('should match with partial/semantic similarity', async () => {
    const result = await matchCapabilities({
      tools: capabilityTools,
      required_capabilities: ['natural-language', 'text'],
      match_threshold: 0.5,
      include_partial_matches: true,
    });

    expect(result.matched_count).toBeGreaterThan(0);
    // Should match nlp-analyzer (has nlp ~= natural-language)
    expect(result.matched_tools.some(t => t.name === 'nlp-analyzer')).toBe(true);
  });

  it('should respect match threshold', async () => {
    const strictResult = await matchCapabilities({
      tools: capabilityTools,
      required_capabilities: ['video-processing', 'rendering'],
      match_threshold: 0.9,
    });

    expect(strictResult.matched_count).toBe(0); // No close matches

    const lenientResult = await matchCapabilities({
      tools: capabilityTools,
      required_capabilities: ['processing'],
      match_threshold: 0.3,
      include_partial_matches: true,
    });

    expect(lenientResult.matched_count).toBeGreaterThan(0);
  });

  it('should calculate average match score', async () => {
    const result = await matchCapabilities({
      tools: capabilityTools,
      required_capabilities: ['machine-learning', 'text-processing'],
      match_threshold: 0.5,
    });

    expect(result.average_match_score).toBeGreaterThan(0);
    expect(result.average_match_score).toBeLessThanOrEqual(1);
  });
});

describe('Smart Tool Selector - Rank by Cost', () => {
  const costTools = [
    {
      name: 'free-ocr',
      description: 'Free OCR service',
      cost_per_call: 0,
      quality_score: 0.7,
      latency_ms: 800,
    },
    {
      name: 'basic-ocr',
      description: 'Basic OCR with good accuracy',
      cost_per_call: 0.001,
      quality_score: 0.85,
      latency_ms: 500,
    },
    {
      name: 'premium-ocr',
      description: 'Premium OCR with highest accuracy',
      cost_per_call: 0.01,
      quality_score: 0.95,
      latency_ms: 300,
    },
    {
      name: 'enterprise-ocr',
      description: 'Enterprise OCR solution',
      api_pricing_tier: 'enterprise' as const,
      quality_score: 0.98,
      latency_ms: 200,
    },
  ];

  it('should rank tools by cost-effectiveness', async () => {
    const result = await rankByCost({
      tools: costTools,
      optimize_for: 'cost',
      max_results: 10,
    });

    expect(result.ranked_tools.length).toBeGreaterThan(0);
    // Free option should rank highly for cost optimization
    expect(result.ranked_tools[0].name).toBe('free-ocr');
  });

  it('should optimize for quality over cost', async () => {
    const result = await rankByCost({
      tools: costTools,
      optimize_for: 'quality',
      max_results: 10,
    });

    // Premium/enterprise should rank higher
    const topTool = result.ranked_tools[0];
    const toolData = costTools.find(t => t.name === topTool.name);
    expect(toolData?.quality_score).toBeGreaterThan(0.9);
  });

  it('should balance cost and quality', async () => {
    const result = await rankByCost({
      tools: costTools,
      optimize_for: 'balanced',
      max_results: 10,
    });

    // basic-ocr should provide good balance
    expect(result.ranked_tools.some(t => t.name === 'basic-ocr')).toBe(true);
    expect(result.best_value_option).toBeDefined();
  });

  it('should filter by budget constraint', async () => {
    const result = await rankByCost({
      tools: costTools,
      budget_constraint: 0.005,
      max_results: 10,
    });

    // Should exclude premium and enterprise
    expect(result.ranked_tools.every(t => (t.cost_per_call ?? 0) <= 0.005)).toBe(true);
    expect(result.budget_compliant_count).toBeLessThan(costTools.length);
  });

  it('should calculate monthly cost estimates', async () => {
    const result = await rankByCost({
      tools: costTools,
      optimize_for: 'balanced',
      max_results: 10,
    });

    result.ranked_tools.forEach(tool => {
      expect(tool.estimated_monthly_cost).toBeDefined();
      if (tool.cost_per_call !== undefined) {
        expect(tool.estimated_monthly_cost).toBe(tool.cost_per_call * 1000);
      }
    });
  });

  it('should identify cheapest option', async () => {
    const result = await rankByCost({
      tools: costTools,
      max_results: 10,
    });

    expect(result.cheapest_option).toBeDefined();
    expect(result.cheapest_option?.name).toBe('free-ocr');
    expect(result.cheapest_option?.cost_per_call).toBe(0);
  });
});

describe('Smart Tool Selector - Learn from History', () => {
  const executionHistory = [
    {
      tool_name: 'web-scraper',
      task_description: 'Extract product data from website',
      success: true,
      execution_time_ms: 1500,
      cost: 0.002,
      user_rating: 4,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      tool_name: 'web-scraper',
      task_description: 'Scrape pricing information',
      success: true,
      execution_time_ms: 1200,
      cost: 0.002,
      user_rating: 5,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      tool_name: 'api-client',
      task_description: 'Fetch user data from API',
      success: true,
      execution_time_ms: 300,
      cost: 0.001,
      user_rating: 5,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      tool_name: 'api-client',
      task_description: 'Get product inventory',
      success: false,
      execution_time_ms: 500,
      error_type: 'timeout',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      tool_name: 'database-query',
      task_description: 'Query customer records',
      success: false,
      execution_time_ms: 5000,
      error_type: 'connection_failed',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  it('should analyze tool performance from history', async () => {
    const result = await learnFromHistory({
      execution_history: executionHistory,
      learning_mode: 'success_rate',
      min_sample_size: 1,
    });

    expect(result.tool_performance).toBeDefined();
    expect(result.tool_performance['web-scraper']).toBeDefined();
    expect(result.tool_performance['web-scraper'].success_rate).toBe(1.0); // 2/2 successes
    expect(result.tool_performance['web-scraper'].total_executions).toBe(2);
  });

  it('should identify performance trends', async () => {
    const result = await learnFromHistory({
      execution_history: executionHistory,
      learning_mode: 'success_rate',
      min_sample_size: 1,
    });

    expect(result.tool_performance['api-client'].trend).toBeDefined();
    expect(['improving', 'stable', 'declining']).toContain(
      result.tool_performance['api-client'].trend
    );
  });

  it('should discover task-tool associations', async () => {
    const result = await learnFromHistory({
      execution_history: executionHistory,
      learning_mode: 'success_rate',
      min_sample_size: 1,
    });

    expect(result.task_tool_associations).toBeDefined();
    // Should identify that web-scraper is good for scraping tasks
    const associations = Object.values(result.task_tool_associations).flat();
    expect(associations.some(a => a.tool_name === 'web-scraper')).toBe(true);
  });

  it('should generate optimization suggestions', async () => {
    const result = await learnFromHistory({
      execution_history: executionHistory,
      learning_mode: 'success_rate',
      min_sample_size: 1,
    });

    expect(result.optimization_suggestions).toBeDefined();
    expect(result.optimization_suggestions.length).toBeGreaterThan(0);

    // Should suggest avoiding database-query (0% success rate)
    const dbSuggestion = result.optimization_suggestions.find(s =>
      s.suggestion.includes('database-query')
    );
    expect(dbSuggestion).toBeDefined();
    expect(dbSuggestion?.impact).toBe('high');
  });

  it('should calculate average metrics', async () => {
    const result = await learnFromHistory({
      execution_history: executionHistory,
      learning_mode: 'performance',
      min_sample_size: 1,
    });

    expect(result.tool_performance['web-scraper'].avg_execution_time_ms).toBeDefined();
    expect(result.tool_performance['web-scraper'].avg_cost).toBeDefined();
    expect(result.tool_performance['web-scraper'].avg_user_rating).toBeDefined();
  });

  it('should filter by time window', async () => {
    const result = await learnFromHistory({
      execution_history: executionHistory,
      learning_mode: 'success_rate',
      min_sample_size: 1,
      time_window_days: 2,
    });

    // Should only include executions from last 2 days
    expect(result.total_executions_analyzed).toBeLessThan(executionHistory.length);
  });

  it('should provide learned patterns with confidence scores', async () => {
    const result = await learnFromHistory({
      execution_history: executionHistory,
      learning_mode: 'success_rate',
      min_sample_size: 1,
    });

    expect(result.learned_patterns).toBeDefined();
    expect(result.learned_patterns.length).toBeGreaterThan(0);

    result.learned_patterns.forEach(pattern => {
      expect(pattern.confidence).toBeGreaterThanOrEqual(0);
      expect(pattern.confidence).toBeLessThanOrEqual(1);
      expect(pattern.sample_size).toBeGreaterThan(0);
    });
  });
});
