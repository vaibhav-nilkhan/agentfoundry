import { z } from 'zod';

/**
 * Learn from History - Improve tool selection over time based on execution history
 *
 * Analyzes historical tool usage patterns, success rates, and outcomes to
 * continuously improve tool selection accuracy and performance.
 */

export const LearnFromHistoryInputSchema = z.object({
  execution_history: z.array(z.object({
    tool_name: z.string(),
    task_description: z.string(),
    success: z.boolean(),
    execution_time_ms: z.number().min(0),
    cost: z.number().min(0).optional(),
    error_type: z.string().optional(),
    user_rating: z.number().min(1).max(5).optional(),
    timestamp: z.string().datetime().optional(),
  })).min(1),
  learning_mode: z.enum(['success_rate', 'performance', 'cost_efficiency', 'user_satisfaction']).default('success_rate'),
  min_sample_size: z.number().int().min(1).default(5),
  time_window_days: z.number().int().min(1).optional(),
});

export const LearnFromHistoryOutputSchema = z.object({
  learned_patterns: z.array(z.object({
    pattern_type: z.string(),
    description: z.string(),
    confidence: z.number().min(0).max(1),
    sample_size: z.number(),
  })),
  tool_performance: z.record(z.object({
    total_executions: z.number(),
    success_rate: z.number().min(0).max(1),
    avg_execution_time_ms: z.number(),
    avg_cost: z.number().optional(),
    avg_user_rating: z.number().optional(),
    trend: z.enum(['improving', 'stable', 'declining']),
    recommendation: z.string(),
  })),
  task_tool_associations: z.record(z.array(z.object({
    tool_name: z.string(),
    relevance_score: z.number().min(0).max(1),
    success_rate: z.number().min(0).max(1),
  }))),
  optimization_suggestions: z.array(z.object({
    suggestion: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    confidence: z.number().min(0).max(1),
  })),
  total_executions_analyzed: z.number(),
  time_period: z.string(),
  execution_time_ms: z.number(),
});

export type LearnFromHistoryInput = z.infer<typeof LearnFromHistoryInputSchema>;
export type LearnFromHistoryOutput = z.infer<typeof LearnFromHistoryOutputSchema>;

/**
 * Filter execution history by time window
 */
function filterByTimeWindow(
  history: LearnFromHistoryInput['execution_history'],
  windowDays?: number
): LearnFromHistoryInput['execution_history'] {
  if (!windowDays) return history;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - windowDays);

  return history.filter(exec => {
    if (!exec.timestamp) return true;
    return new Date(exec.timestamp) >= cutoffDate;
  });
}

/**
 * Analyze tool performance metrics
 */
function analyzeToolPerformance(
  history: LearnFromHistoryInput['execution_history'],
  learningMode: string
): LearnFromHistoryOutput['tool_performance'] {
  const toolStats: Record<string, any> = {};

  for (const exec of history) {
    if (!toolStats[exec.tool_name]) {
      toolStats[exec.tool_name] = {
        total: 0,
        successes: 0,
        execution_times: [],
        costs: [],
        ratings: [],
        recent_successes: [],
      };
    }

    const stats = toolStats[exec.tool_name];
    stats.total++;
    if (exec.success) stats.successes++;
    stats.execution_times.push(exec.execution_time_ms);
    if (exec.cost !== undefined) stats.costs.push(exec.cost);
    if (exec.user_rating !== undefined) stats.ratings.push(exec.user_rating);

    // Track recent trend (last 10 executions)
    stats.recent_successes.push(exec.success ? 1 : 0);
    if (stats.recent_successes.length > 10) stats.recent_successes.shift();
  }

  // Calculate metrics and trends
  const performance: LearnFromHistoryOutput['tool_performance'] = {};

  for (const [toolName, stats] of Object.entries(toolStats)) {
    const successRate = stats.successes / stats.total;
    const avgTime = stats.execution_times.reduce((a: number, b: number) => a + b, 0) / stats.total;
    const avgCost = stats.costs.length > 0
      ? stats.costs.reduce((a: number, b: number) => a + b, 0) / stats.costs.length
      : undefined;
    const avgRating = stats.ratings.length > 0
      ? stats.ratings.reduce((a: number, b: number) => a + b, 0) / stats.ratings.length
      : undefined;

    // Calculate trend
    const recentRate = stats.recent_successes.length > 0
      ? stats.recent_successes.reduce((a: number, b: number) => a + b, 0) / stats.recent_successes.length
      : successRate;

    let trend: 'improving' | 'stable' | 'declining';
    if (recentRate > successRate + 0.1) trend = 'improving';
    else if (recentRate < successRate - 0.1) trend = 'declining';
    else trend = 'stable';

    // Generate recommendation
    let recommendation = '';
    if (successRate > 0.9) recommendation = 'Highly reliable - prioritize for similar tasks';
    else if (successRate > 0.7) recommendation = 'Good performance - suitable for most tasks';
    else if (successRate > 0.5) recommendation = 'Moderate reliability - use with caution';
    else recommendation = 'Low success rate - consider alternatives';

    if (trend === 'improving') recommendation += ' (trending positively)';
    else if (trend === 'declining') recommendation += ' (performance declining)';

    performance[toolName] = {
      total_executions: stats.total,
      success_rate: Math.round(successRate * 100) / 100,
      avg_execution_time_ms: Math.round(avgTime),
      avg_cost: avgCost !== undefined ? Math.round(avgCost * 1000) / 1000 : undefined,
      avg_user_rating: avgRating !== undefined ? Math.round(avgRating * 10) / 10 : undefined,
      trend,
      recommendation,
    };
  }

  return performance;
}

/**
 * Discover task-tool associations
 */
function discoverTaskToolAssociations(
  history: LearnFromHistoryInput['execution_history'],
  minSampleSize: number
): LearnFromHistoryOutput['task_tool_associations'] {
  const taskToolMap: Record<string, Record<string, { total: number; successes: number }>> = {};

  // Extract task keywords and track tool usage
  for (const exec of history) {
    const keywords = exec.task_description.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4)
      .slice(0, 3) // Top 3 keywords
      .join('-');

    if (!taskToolMap[keywords]) {
      taskToolMap[keywords] = {};
    }

    if (!taskToolMap[keywords][exec.tool_name]) {
      taskToolMap[keywords][exec.tool_name] = { total: 0, successes: 0 };
    }

    taskToolMap[keywords][exec.tool_name].total++;
    if (exec.success) taskToolMap[keywords][exec.tool_name].successes++;
  }

  // Build associations with sufficient data
  const associations: LearnFromHistoryOutput['task_tool_associations'] = {};

  for (const [task, tools] of Object.entries(taskToolMap)) {
    const totalExecs = Object.values(tools).reduce((sum, t) => sum + t.total, 0);

    if (totalExecs >= minSampleSize) {
      associations[task] = Object.entries(tools)
        .map(([toolName, stats]) => ({
          tool_name: toolName,
          relevance_score: Math.round((stats.total / totalExecs) * 100) / 100,
          success_rate: Math.round((stats.successes / stats.total) * 100) / 100,
        }))
        .filter(a => a.relevance_score > 0.1) // Minimum 10% usage
        .sort((a, b) => b.success_rate - a.success_rate);
    }
  }

  return associations;
}

/**
 * Generate optimization suggestions
 */
function generateOptimizationSuggestions(
  performance: LearnFromHistoryOutput['tool_performance'],
  associations: LearnFromHistoryOutput['task_tool_associations']
): LearnFromHistoryOutput['optimization_suggestions'] {
  const suggestions: LearnFromHistoryOutput['optimization_suggestions'] = [];

  // Identify underperforming tools
  for (const [toolName, stats] of Object.entries(performance)) {
    if (stats.success_rate < 0.5 && stats.total_executions > 10) {
      suggestions.push({
        suggestion: `Consider replacing '${toolName}' - success rate below 50%`,
        impact: 'high',
        confidence: 0.9,
      });
    }

    if (stats.trend === 'declining' && stats.total_executions > 20) {
      suggestions.push({
        suggestion: `Monitor '${toolName}' closely - performance declining`,
        impact: 'medium',
        confidence: 0.7,
      });
    }
  }

  // Identify successful patterns
  for (const [task, tools] of Object.entries(associations)) {
    const bestTool = tools[0];
    if (bestTool && bestTool.success_rate > 0.8) {
      suggestions.push({
        suggestion: `For tasks like '${task}', prioritize '${bestTool.tool_name}' (${Math.round(bestTool.success_rate * 100)}% success)`,
        impact: 'medium',
        confidence: bestTool.relevance_score,
      });
    }
  }

  return suggestions.sort((a, b) => {
    const impactWeight = { high: 3, medium: 2, low: 1 };
    return (impactWeight[b.impact] * b.confidence) - (impactWeight[a.impact] * a.confidence);
  });
}

/**
 * Main learn function
 */
export async function run(input: LearnFromHistoryInput): Promise<LearnFromHistoryOutput> {
  const startTime = Date.now();

  // Validate input
  const validated = LearnFromHistoryInputSchema.parse(input);

  const {
    execution_history,
    learning_mode,
    min_sample_size,
    time_window_days,
  } = validated;

  // Filter history by time window
  const filteredHistory = filterByTimeWindow(execution_history, time_window_days);

  if (filteredHistory.length === 0) {
    throw new Error('No execution history found in the specified time window');
  }

  // Analyze tool performance
  const toolPerformance = analyzeToolPerformance(filteredHistory, learning_mode);

  // Discover task-tool associations
  const taskToolAssociations = discoverTaskToolAssociations(filteredHistory, min_sample_size);

  // Generate optimization suggestions
  const optimizationSuggestions = generateOptimizationSuggestions(toolPerformance, taskToolAssociations);

  // Identify learned patterns
  const learnedPatterns: LearnFromHistoryOutput['learned_patterns'] = [
    {
      pattern_type: 'Success Rate Analysis',
      description: `Analyzed ${Object.keys(toolPerformance).length} tools across ${filteredHistory.length} executions`,
      confidence: Math.min(1, filteredHistory.length / 100),
      sample_size: filteredHistory.length,
    },
    {
      pattern_type: 'Task-Tool Associations',
      description: `Identified ${Object.keys(taskToolAssociations).length} task patterns with tool preferences`,
      confidence: Math.min(1, Object.keys(taskToolAssociations).length / 10),
      sample_size: Object.keys(taskToolAssociations).length,
    },
  ];

  const executionTime = Date.now() - startTime;

  // Determine time period
  const oldestDate = filteredHistory
    .filter(e => e.timestamp)
    .map(e => new Date(e.timestamp!))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const timePeriod = oldestDate
    ? `${Math.round((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24))} days`
    : time_window_days ? `${time_window_days} days` : 'all time';

  return {
    learned_patterns: learnedPatterns,
    tool_performance: toolPerformance,
    task_tool_associations: taskToolAssociations,
    optimization_suggestions: optimizationSuggestions.slice(0, 10), // Top 10 suggestions
    total_executions_analyzed: filteredHistory.length,
    time_period: timePeriod,
    execution_time_ms: executionTime,
  };
}
