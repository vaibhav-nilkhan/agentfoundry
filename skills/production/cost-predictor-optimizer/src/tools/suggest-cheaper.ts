import { z } from 'zod';

/**
 * Suggest Cheaper - Recommend cost-effective model alternatives without sacrificing quality
 *
 * Analyzes current model usage and task requirements to suggest cheaper alternatives
 * that maintain acceptable quality levels. Provides detailed trade-off analysis.
 */

export const SuggestCheaperInputSchema = z.object({
  current_model: z.string().min(1),
  task_requirements: z.object({
    complexity: z.enum(['simple', 'moderate', 'complex']),
    quality_threshold: z.number().min(0).max(1),
    response_time_max: z.number().optional(),
  }),
  current_cost: z.number().min(0).optional(),
});

export const SuggestCheaperOutputSchema = z.object({
  alternatives: z.array(z.object({
    model: z.string(),
    estimated_cost: z.number(),
    savings_percent: z.number(),
    quality_score: z.number().min(0).max(1),
    trade_offs: z.array(z.string()),
  })),
  recommendation: z.string(),
  current_model_analysis: z.object({
    is_optimal: z.boolean(),
    overprovisioned: z.boolean(),
    reason: z.string(),
  }),
});

export type SuggestCheaperInput = z.infer<typeof SuggestCheaperInputSchema>;
export type SuggestCheaperOutput = z.infer<typeof SuggestCheaperOutputSchema>;

/**
 * Model capabilities and characteristics
 */
interface ModelProfile {
  name: string;
  cost_per_1k_tokens: number; // Average of input/output
  quality_score: number; // 0-1 scale
  speed_score: number; // 0-1 scale (1 = fastest)
  complexity_support: ('simple' | 'moderate' | 'complex')[];
  strengths: string[];
  weaknesses: string[];
}

const MODEL_PROFILES: Record<string, ModelProfile> = {
  'gpt-4': {
    name: 'gpt-4',
    cost_per_1k_tokens: 0.045,
    quality_score: 0.98,
    speed_score: 0.65,
    complexity_support: ['simple', 'moderate', 'complex'],
    strengths: ['Exceptional reasoning', 'Complex problem solving', 'High accuracy'],
    weaknesses: ['Expensive', 'Slower response times'],
  },
  'gpt-4-turbo': {
    name: 'gpt-4-turbo',
    cost_per_1k_tokens: 0.020,
    quality_score: 0.96,
    speed_score: 0.80,
    complexity_support: ['simple', 'moderate', 'complex'],
    strengths: ['Excellent quality', 'Faster than GPT-4', 'Good value'],
    weaknesses: ['Still relatively expensive'],
  },
  'gpt-4o': {
    name: 'gpt-4o',
    cost_per_1k_tokens: 0.010,
    quality_score: 0.95,
    speed_score: 0.90,
    complexity_support: ['simple', 'moderate', 'complex'],
    strengths: ['Fast', 'Cost-effective', 'Multimodal'],
    weaknesses: ['Slightly lower quality than GPT-4'],
  },
  'gpt-4o-mini': {
    name: 'gpt-4o-mini',
    cost_per_1k_tokens: 0.000375,
    quality_score: 0.85,
    speed_score: 0.95,
    complexity_support: ['simple', 'moderate'],
    strengths: ['Very cheap', 'Very fast', 'Good for simple tasks'],
    weaknesses: ['Limited complex reasoning', 'Lower accuracy on hard tasks'],
  },
  'gpt-3.5-turbo': {
    name: 'gpt-3.5-turbo',
    cost_per_1k_tokens: 0.001,
    quality_score: 0.80,
    speed_score: 0.92,
    complexity_support: ['simple', 'moderate'],
    strengths: ['Cheap', 'Fast', 'Good for simple tasks'],
    weaknesses: ['Poor complex reasoning', 'Lower accuracy'],
  },
  'claude-3-opus': {
    name: 'claude-3-opus',
    cost_per_1k_tokens: 0.045,
    quality_score: 0.98,
    speed_score: 0.70,
    complexity_support: ['simple', 'moderate', 'complex'],
    strengths: ['Excellent reasoning', 'Long context', 'Creative writing'],
    weaknesses: ['Expensive', 'Moderate speed'],
  },
  'claude-3-5-sonnet': {
    name: 'claude-3-5-sonnet',
    cost_per_1k_tokens: 0.009,
    quality_score: 0.96,
    speed_score: 0.85,
    complexity_support: ['simple', 'moderate', 'complex'],
    strengths: ['Great balance', 'Fast', 'Cost-effective'],
    weaknesses: ['Slightly lower quality than Opus'],
  },
  'claude-3-sonnet': {
    name: 'claude-3-sonnet',
    cost_per_1k_tokens: 0.009,
    quality_score: 0.92,
    speed_score: 0.85,
    complexity_support: ['simple', 'moderate', 'complex'],
    strengths: ['Balanced', 'Good value', 'Versatile'],
    weaknesses: ['Not the best at any single metric'],
  },
  'claude-3-haiku': {
    name: 'claude-3-haiku',
    cost_per_1k_tokens: 0.00075,
    quality_score: 0.85,
    speed_score: 0.95,
    complexity_support: ['simple', 'moderate'],
    strengths: ['Very cheap', 'Very fast', 'Good for simple tasks'],
    weaknesses: ['Limited complex reasoning'],
  },
  'gemini-1.5-pro': {
    name: 'gemini-1.5-pro',
    cost_per_1k_tokens: 0.007,
    quality_score: 0.93,
    speed_score: 0.82,
    complexity_support: ['simple', 'moderate', 'complex'],
    strengths: ['Large context window', 'Good quality', 'Affordable'],
    weaknesses: ['Slightly inconsistent on edge cases'],
  },
  'gemini-1.5-flash': {
    name: 'gemini-1.5-flash',
    cost_per_1k_tokens: 0.0007,
    quality_score: 0.83,
    speed_score: 0.93,
    complexity_support: ['simple', 'moderate'],
    strengths: ['Very cheap', 'Fast', 'Large context'],
    weaknesses: ['Lower accuracy on complex tasks'],
  },
  'mistral-large': {
    name: 'mistral-large',
    cost_per_1k_tokens: 0.008,
    quality_score: 0.91,
    speed_score: 0.84,
    complexity_support: ['simple', 'moderate', 'complex'],
    strengths: ['Open weights', 'Good quality', 'Affordable'],
    weaknesses: ['Smaller ecosystem'],
  },
  'llama-3-70b': {
    name: 'llama-3-70b',
    cost_per_1k_tokens: 0.0009,
    quality_score: 0.88,
    speed_score: 0.80,
    complexity_support: ['simple', 'moderate', 'complex'],
    strengths: ['Open source', 'Very cheap', 'Customizable'],
    weaknesses: ['Requires self-hosting or provider'],
  },
  'llama-3-8b': {
    name: 'llama-3-8b',
    cost_per_1k_tokens: 0.0002,
    quality_score: 0.75,
    speed_score: 0.95,
    complexity_support: ['simple'],
    strengths: ['Extremely cheap', 'Very fast', 'Open source'],
    weaknesses: ['Limited capabilities', 'Poor complex reasoning'],
  },
};

/**
 * Find suitable alternative models based on requirements
 */
function findAlternatives(
  currentModel: string,
  complexity: 'simple' | 'moderate' | 'complex',
  qualityThreshold: number
): ModelProfile[] {
  const current = MODEL_PROFILES[currentModel];
  const alternatives: ModelProfile[] = [];

  for (const [modelName, profile] of Object.entries(MODEL_PROFILES)) {
    // Skip current model
    if (modelName === currentModel) continue;

    // Must support required complexity
    if (!profile.complexity_support.includes(complexity)) continue;

    // Must meet quality threshold
    if (profile.quality_score < qualityThreshold) continue;

    // Must be cheaper than current
    if (current && profile.cost_per_1k_tokens >= current.cost_per_1k_tokens) continue;

    alternatives.push(profile);
  }

  // Sort by cost (cheapest first)
  alternatives.sort((a, b) => a.cost_per_1k_tokens - b.cost_per_1k_tokens);

  return alternatives;
}

/**
 * Analyze current model usage
 */
function analyzeCurrentModel(
  currentModel: string,
  complexity: 'simple' | 'moderate' | 'complex'
): { is_optimal: boolean; overprovisioned: boolean; reason: string } {
  const profile = MODEL_PROFILES[currentModel];

  if (!profile) {
    return {
      is_optimal: false,
      overprovisioned: false,
      reason: `Unknown model '${currentModel}'. Cannot analyze optimality.`,
    };
  }

  // Check if model is overprovisioned for task complexity
  const isOverprovisioned =
    (complexity === 'simple' && profile.quality_score > 0.90) ||
    (complexity === 'moderate' && profile.quality_score > 0.95);

  if (isOverprovisioned) {
    return {
      is_optimal: false,
      overprovisioned: true,
      reason: `${currentModel} is overprovisioned for ${complexity} tasks. Quality score ${profile.quality_score} exceeds typical needs.`,
    };
  }

  // Check if it's the cheapest option that meets requirements
  const cheaperExists = Object.values(MODEL_PROFILES).some(
    p =>
      p.cost_per_1k_tokens < profile.cost_per_1k_tokens &&
      p.complexity_support.includes(complexity) &&
      p.quality_score >= profile.quality_score * 0.95
  );

  if (cheaperExists) {
    return {
      is_optimal: false,
      overprovisioned: false,
      reason: `Cheaper alternatives exist with similar quality for ${complexity} tasks.`,
    };
  }

  return {
    is_optimal: true,
    overprovisioned: false,
    reason: `${currentModel} provides good value for ${complexity} tasks at this quality level.`,
  };
}

/**
 * Main suggestion function
 */
export async function run(input: SuggestCheaperInput): Promise<SuggestCheaperOutput> {
  // Validate input
  const validated = SuggestCheaperInputSchema.parse(input);

  const {
    current_model,
    task_requirements,
    current_cost,
  } = validated;

  const { complexity, quality_threshold } = task_requirements;

  // Get current model profile
  const currentProfile = MODEL_PROFILES[current_model];
  const currentCostPer1k = currentProfile?.cost_per_1k_tokens || 0.01;

  // Analyze current model
  const analysis = analyzeCurrentModel(current_model, complexity);

  // Find alternatives
  const alternativeProfiles = findAlternatives(
    current_model,
    complexity,
    quality_threshold
  );

  // Build alternative recommendations
  const alternatives = alternativeProfiles.slice(0, 5).map(profile => {
    const savingsPercent = ((currentCostPer1k - profile.cost_per_1k_tokens) / currentCostPer1k) * 100;

    const tradeOffs: string[] = [];

    // Quality trade-off
    if (currentProfile && profile.quality_score < currentProfile.quality_score) {
      const qualityDiff = ((currentProfile.quality_score - profile.quality_score) * 100).toFixed(0);
      tradeOffs.push(`${qualityDiff}% lower quality score`);
    }

    // Speed trade-off
    if (currentProfile && profile.speed_score < currentProfile.speed_score) {
      tradeOffs.push('Slightly slower response times');
    } else if (currentProfile && profile.speed_score > currentProfile.speed_score) {
      tradeOffs.push('Faster response times (benefit)');
    }

    // Add specific weaknesses
    if (profile.weaknesses.length > 0) {
      tradeOffs.push(...profile.weaknesses.slice(0, 2));
    }

    return {
      model: profile.name,
      estimated_cost: Math.round(profile.cost_per_1k_tokens * 100000) / 100000,
      savings_percent: Math.round(savingsPercent * 10) / 10,
      quality_score: profile.quality_score,
      trade_offs: tradeOffs.length > 0 ? tradeOffs : ['Minimal trade-offs'],
    };
  });

  // Generate recommendation
  let recommendation = '';

  if (alternatives.length === 0) {
    recommendation = `${current_model} is already the most cost-effective option for ${complexity} tasks with quality threshold ${quality_threshold}.`;
  } else if (analysis.overprovisioned) {
    const bestAlt = alternatives[0];
    recommendation = `Switch to ${bestAlt.model} for ${bestAlt.savings_percent.toFixed(0)}% cost savings. Current model is overprovisioned for ${complexity} tasks.`;
  } else {
    const bestAlt = alternatives[0];
    recommendation = `Recommended: ${bestAlt.model} (${bestAlt.savings_percent.toFixed(0)}% savings). Trade-offs: ${bestAlt.trade_offs.join(', ')}. Best for ${complexity} tasks prioritizing cost.`;
  }

  return {
    alternatives,
    recommendation,
    current_model_analysis: analysis,
  };
}
