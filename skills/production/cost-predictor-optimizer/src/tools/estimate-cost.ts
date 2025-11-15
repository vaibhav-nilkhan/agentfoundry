import { z } from 'zod';

/**
 * Estimate Cost - Predict token costs before execution to prevent billing surprises
 *
 * Analyzes prompt length, model pricing, and expected output to provide accurate
 * cost estimates before execution. Includes tool calling overhead calculations.
 */

export const EstimateCostInputSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().min(1),
  expected_output_length: z.number().int().min(1).default(500),
  tools_count: z.number().int().min(0).default(0),
  include_overhead: z.boolean().default(true),
});

export const EstimateCostOutputSchema = z.object({
  estimated_cost: z.number().min(0),
  breakdown: z.object({
    input_tokens: z.number().int(),
    output_tokens: z.number().int(),
    tool_overhead_tokens: z.number().int(),
    input_cost: z.number(),
    output_cost: z.number(),
  }),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string()).optional(),
});

export type EstimateCostInput = z.infer<typeof EstimateCostInputSchema>;
export type EstimateCostOutput = z.infer<typeof EstimateCostOutputSchema>;

/**
 * Model pricing data (per 1M tokens)
 * Source: OpenAI, Anthropic, Google pricing as of 2024
 */
const MODEL_PRICING: Record<string, { input: number; output: number; overhead_multiplier: number }> = {
  // OpenAI GPT-4
  'gpt-4': { input: 30.00, output: 60.00, overhead_multiplier: 1.15 },
  'gpt-4-turbo': { input: 10.00, output: 30.00, overhead_multiplier: 1.12 },
  'gpt-4o': { input: 5.00, output: 15.00, overhead_multiplier: 1.10 },
  'gpt-4o-mini': { input: 0.15, output: 0.60, overhead_multiplier: 1.08 },

  // OpenAI GPT-3.5
  'gpt-3.5-turbo': { input: 0.50, output: 1.50, overhead_multiplier: 1.10 },
  'gpt-3.5-turbo-16k': { input: 3.00, output: 4.00, overhead_multiplier: 1.10 },

  // Anthropic Claude
  'claude-3-opus': { input: 15.00, output: 75.00, overhead_multiplier: 1.12 },
  'claude-3-sonnet': { input: 3.00, output: 15.00, overhead_multiplier: 1.10 },
  'claude-3-haiku': { input: 0.25, output: 1.25, overhead_multiplier: 1.08 },
  'claude-3-5-sonnet': { input: 3.00, output: 15.00, overhead_multiplier: 1.10 },

  // Google Gemini
  'gemini-1.5-pro': { input: 3.50, output: 10.50, overhead_multiplier: 1.10 },
  'gemini-1.5-flash': { input: 0.35, output: 1.05, overhead_multiplier: 1.08 },

  // Meta Llama (via providers)
  'llama-3-70b': { input: 0.90, output: 0.90, overhead_multiplier: 1.05 },
  'llama-3-8b': { input: 0.20, output: 0.20, overhead_multiplier: 1.05 },

  // Mistral
  'mistral-large': { input: 4.00, output: 12.00, overhead_multiplier: 1.10 },
  'mistral-medium': { input: 2.70, output: 8.10, overhead_multiplier: 1.08 },
  'mistral-small': { input: 1.00, output: 3.00, overhead_multiplier: 1.08 },
};

/**
 * Estimate token count from text
 * Uses rough approximation: 1 token ≈ 4 characters for English text
 * More accurate for production would be using tiktoken or similar
 */
function estimateTokenCount(text: string): number {
  // Basic heuristic: ~4 chars per token
  const charCount = text.length;
  const tokenCount = Math.ceil(charCount / 4);

  // Add overhead for formatting, special tokens
  const overhead = Math.ceil(tokenCount * 0.05);

  return tokenCount + overhead;
}

/**
 * Calculate tool calling overhead
 * Tools add significant context to prompts
 */
function calculateToolOverhead(toolsCount: number, model: string): number {
  if (toolsCount === 0) return 0;

  // Average tokens per tool definition: ~150-300 tokens
  const avgTokensPerTool = 200;

  // Base overhead
  let overhead = toolsCount * avgTokensPerTool;

  // Additional overhead for tool selection reasoning
  overhead += Math.min(toolsCount * 50, 500); // Cap at 500 tokens

  return overhead;
}

/**
 * Determine confidence level based on model knowledge and input characteristics
 */
function calculateConfidence(
  model: string,
  promptLength: number,
  hasToolOverhead: boolean
): number {
  let confidence = 0.95; // Base confidence

  // Reduce confidence for unknown models
  if (!MODEL_PRICING[model]) {
    confidence -= 0.30;
  }

  // Reduce confidence for very short or very long prompts (estimation less accurate)
  if (promptLength < 100) {
    confidence -= 0.10;
  } else if (promptLength > 10000) {
    confidence -= 0.15;
  }

  // Reduce confidence when tools are involved (variable overhead)
  if (hasToolOverhead) {
    confidence -= 0.05;
  }

  return Math.max(0.5, Math.min(1.0, confidence));
}

/**
 * Main estimation function
 */
export async function run(input: EstimateCostInput): Promise<EstimateCostOutput> {
  // Validate input
  const validated = EstimateCostInputSchema.parse(input);

  const {
    prompt,
    model,
    expected_output_length,
    tools_count,
    include_overhead,
  } = validated;

  const warnings: string[] = [];

  // Get model pricing
  const pricing = MODEL_PRICING[model];

  if (!pricing) {
    warnings.push(`Unknown model '${model}'. Using default pricing estimates.`);
  }

  // Use default pricing if model not found
  const inputPricePerM = pricing?.input || 5.00;
  const outputPricePerM = pricing?.output || 15.00;
  const overheadMultiplier = pricing?.overhead_multiplier || 1.10;

  // Estimate input tokens
  let inputTokens = estimateTokenCount(prompt);

  // Add tool overhead if applicable
  let toolOverheadTokens = 0;
  if (include_overhead && tools_count > 0) {
    toolOverheadTokens = calculateToolOverhead(tools_count, model);
    inputTokens += toolOverheadTokens;
  }

  // Apply overhead multiplier for system prompts, formatting, etc.
  if (include_overhead) {
    inputTokens = Math.ceil(inputTokens * overheadMultiplier);
  }

  // Output tokens (user-provided estimate)
  const outputTokens = expected_output_length;

  // Calculate costs
  const inputCost = (inputTokens / 1_000_000) * inputPricePerM;
  const outputCost = (outputTokens / 1_000_000) * outputPricePerM;
  const totalCost = inputCost + outputCost;

  // Calculate confidence
  const confidence = calculateConfidence(
    model,
    prompt.length,
    include_overhead && tools_count > 0
  );

  // Add warnings for high costs
  if (totalCost > 0.50) {
    warnings.push(`High estimated cost ($${totalCost.toFixed(4)}). Consider using a cheaper model.`);
  }

  if (tools_count > 20) {
    warnings.push(`Large number of tools (${tools_count}) may increase overhead significantly.`);
  }

  return {
    estimated_cost: Math.round(totalCost * 100000) / 100000, // Round to 5 decimal places
    breakdown: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      tool_overhead_tokens: toolOverheadTokens,
      input_cost: Math.round(inputCost * 100000) / 100000,
      output_cost: Math.round(outputCost * 100000) / 100000,
    },
    confidence: Math.round(confidence * 100) / 100,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
