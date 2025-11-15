import { z } from 'zod';

/**
 * Rank by Cost - Rank and optimize tool selection by cost-effectiveness
 *
 * Analyzes tools based on execution cost, token usage, and API pricing to
 * recommend the most cost-effective options while maintaining quality.
 */

export const RankByCostInputSchema = z.object({
  tools: z.array(z.object({
    name: z.string(),
    description: z.string(),
    cost_per_call: z.number().min(0).optional(), // USD
    avg_tokens_used: z.number().int().min(0).optional(),
    api_pricing_tier: z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
    quality_score: z.number().min(0).max(1).optional(), // 0-1
    latency_ms: z.number().min(0).optional(),
  })),
  budget_constraint: z.number().min(0).optional(), // Max cost per call in USD
  optimize_for: z.enum(['cost', 'quality', 'balanced']).default('balanced'),
  max_results: z.number().int().min(1).max(100).default(20),
  include_free_tier: z.boolean().default(true),
});

export const RankByCostOutputSchema = z.object({
  ranked_tools: z.array(z.object({
    name: z.string(),
    description: z.string(),
    cost_score: z.number().min(0).max(1), // Higher is better (cheaper)
    cost_per_call: z.number().optional(),
    quality_score: z.number().optional(),
    value_score: z.number().min(0).max(1), // Cost-effectiveness ratio
    recommendation: z.string(),
    estimated_monthly_cost: z.number().optional(), // Based on 1000 calls/month
  })),
  total_tools_analyzed: z.number(),
  budget_compliant_count: z.number(),
  average_cost_per_call: z.number(),
  cheapest_option: z.object({
    name: z.string(),
    cost_per_call: z.number(),
  }).optional(),
  best_value_option: z.object({
    name: z.string(),
    value_score: z.number(),
  }).optional(),
  execution_time_ms: z.number(),
});

export type RankByCostInput = z.infer<typeof RankByCostInputSchema>;
export type RankByCostOutput = z.infer<typeof RankByCostOutputSchema>;

/**
 * Estimate cost per call based on available data
 */
function estimateCostPerCall(tool: RankByCostInput['tools'][0]): number {
  // If direct cost is available, use it
  if (tool.cost_per_call !== undefined) {
    return tool.cost_per_call;
  }

  // Estimate from token usage (rough estimate: $0.002 per 1000 tokens for GPT-3.5)
  if (tool.avg_tokens_used !== undefined) {
    return (tool.avg_tokens_used / 1000) * 0.002;
  }

  // Estimate from pricing tier
  if (tool.api_pricing_tier) {
    const tierCosts = {
      free: 0,
      basic: 0.001,
      pro: 0.01,
      enterprise: 0.05,
    };
    return tierCosts[tool.api_pricing_tier];
  }

  // Default estimate
  return 0.01;
}

/**
 * Calculate cost score (0-1, where 1 is cheapest)
 */
function calculateCostScore(cost: number, maxCost: number): number {
  if (cost === 0) return 1.0;
  if (maxCost === 0) return 0.5;
  return Math.max(0, 1 - (cost / maxCost));
}

/**
 * Calculate value score (quality per dollar)
 */
function calculateValueScore(
  cost: number,
  qualityScore: number | undefined,
  optimizeFor: string
): number {
  const quality = qualityScore ?? 0.7; // Default quality

  if (optimizeFor === 'cost') {
    // Prioritize low cost
    return cost === 0 ? 1.0 : Math.min(1.0, 0.1 / cost);
  } else if (optimizeFor === 'quality') {
    // Prioritize high quality
    return quality;
  } else {
    // Balanced: quality per unit cost
    if (cost === 0) return quality;
    return quality / (1 + cost * 10); // Normalize cost impact
  }
}

/**
 * Generate recommendation based on tool characteristics
 */
function generateRecommendation(
  tool: any,
  costScore: number,
  valueScore: number,
  optimizeFor: string
): string {
  const recommendations: string[] = [];

  if (tool.cost_per_call === 0 || tool.api_pricing_tier === 'free') {
    recommendations.push('Free tier available');
  } else if (costScore > 0.8) {
    recommendations.push('Very cost-effective');
  } else if (costScore < 0.3) {
    recommendations.push('Premium pricing');
  }

  if (tool.quality_score && tool.quality_score > 0.8) {
    recommendations.push('high quality');
  }

  if (valueScore > 0.7) {
    recommendations.push('excellent value for money');
  }

  if (tool.latency_ms && tool.latency_ms < 500) {
    recommendations.push('fast response time');
  }

  return recommendations.length > 0
    ? `Recommended: ${recommendations.join(', ')}`
    : 'Standard option';
}

/**
 * Main rank function
 */
export async function run(input: RankByCostInput): Promise<RankByCostOutput> {
  const startTime = Date.now();

  // Validate input
  const validated = RankByCostInputSchema.parse(input);

  const {
    tools,
    budget_constraint,
    optimize_for,
    max_results,
    include_free_tier,
  } = validated;

  // Calculate costs and scores
  const scoredTools = tools.map(tool => {
    const costPerCall = estimateCostPerCall(tool);

    return {
      ...tool,
      cost_per_call: costPerCall,
    };
  });

  // Find max cost for normalization
  const maxCost = Math.max(...scoredTools.map(t => t.cost_per_call));

  // Calculate scores and filter
  let rankedTools = scoredTools.map(tool => {
    const costScore = calculateCostScore(tool.cost_per_call, maxCost);
    const valueScore = calculateValueScore(tool.cost_per_call, tool.quality_score, optimize_for);

    return {
      name: tool.name,
      description: tool.description,
      cost_score: Math.round(costScore * 100) / 100,
      cost_per_call: tool.cost_per_call,
      quality_score: tool.quality_score,
      value_score: Math.round(valueScore * 100) / 100,
      recommendation: '',
      estimated_monthly_cost: Math.round(tool.cost_per_call * 1000 * 100) / 100,
    };
  }).map(tool => ({
    ...tool,
    recommendation: generateRecommendation(tool, tool.cost_score, tool.value_score, optimize_for),
  }));

  // Filter by budget if specified
  if (budget_constraint !== undefined) {
    rankedTools = rankedTools.filter(t => t.cost_per_call! <= budget_constraint);
  }

  // Filter free tier if requested
  if (!include_free_tier) {
    rankedTools = rankedTools.filter(t => t.cost_per_call! > 0);
  }

  // Sort by value score
  rankedTools.sort((a, b) => b.value_score - a.value_score);

  // Limit results
  const finalRanked = rankedTools.slice(0, max_results);

  const executionTime = Date.now() - startTime;
  const avgCost = finalRanked.length > 0
    ? finalRanked.reduce((sum, t) => sum + (t.cost_per_call ?? 0), 0) / finalRanked.length
    : 0;

  const cheapest = finalRanked.reduce((min, t) =>
    (t.cost_per_call ?? Infinity) < (min?.cost_per_call ?? Infinity) ? t : min,
    finalRanked[0]
  );

  const bestValue = finalRanked[0]; // Already sorted by value score

  return {
    ranked_tools: finalRanked,
    total_tools_analyzed: tools.length,
    budget_compliant_count: rankedTools.length,
    average_cost_per_call: Math.round(avgCost * 1000) / 1000,
    cheapest_option: cheapest ? {
      name: cheapest.name,
      cost_per_call: cheapest.cost_per_call!,
    } : undefined,
    best_value_option: bestValue ? {
      name: bestValue.name,
      value_score: bestValue.value_score,
    } : undefined,
    execution_time_ms: executionTime,
  };
}
