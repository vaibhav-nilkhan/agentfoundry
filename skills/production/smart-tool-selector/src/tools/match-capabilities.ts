import { z } from 'zod';

/**
 * Match Capabilities - Match tools to task requirements based on capability analysis
 *
 * Analyzes tool capabilities and matches them to specific task requirements with
 * advanced semantic matching and capability scoring.
 */

export const MatchCapabilitiesInputSchema = z.object({
  tools: z.array(z.object({
    name: z.string(),
    description: z.string(),
    capabilities: z.array(z.string()),
    tags: z.array(z.string()).optional(),
  })),
  required_capabilities: z.array(z.string()).min(1),
  match_threshold: z.number().min(0).max(1).default(0.7),
  include_partial_matches: z.boolean().default(true),
});

export const MatchCapabilitiesOutputSchema = z.object({
  matched_tools: z.array(z.object({
    name: z.string(),
    description: z.string(),
    match_score: z.number().min(0).max(1),
    matched_capabilities: z.array(z.string()),
    missing_capabilities: z.array(z.string()),
    match_type: z.enum(['exact', 'partial', 'semantic']),
  })),
  total_tools_analyzed: z.number(),
  matched_count: z.number(),
  average_match_score: z.number(),
  execution_time_ms: z.number(),
});

export type MatchCapabilitiesInput = z.infer<typeof MatchCapabilitiesInputSchema>;
export type MatchCapabilitiesOutput = z.infer<typeof MatchCapabilitiesOutputSchema>;

/**
 * Calculate semantic similarity between two capability strings
 */
function calculateSemanticSimilarity(cap1: string, cap2: string): number {
  const words1 = new Set(cap1.toLowerCase().split(/[_\s-]+/));
  const words2 = new Set(cap2.toLowerCase().split(/[_\s-]+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  // Jaccard similarity
  return intersection.size / union.size;
}

/**
 * Match tool capabilities against requirements
 */
function matchToolCapabilities(
  tool: MatchCapabilitiesInput['tools'][0],
  requiredCaps: string[],
  threshold: number,
  includePartial: boolean
): { score: number; matched: string[]; missing: string[]; type: 'exact' | 'partial' | 'semantic' } | null {
  const toolCaps = [...tool.capabilities, ...(tool.tags || [])];
  const matched: string[] = [];
  const missing: string[] = [];
  let matchType: 'exact' | 'partial' | 'semantic' = 'semantic';

  for (const requiredCap of requiredCaps) {
    let bestMatch = 0;
    let bestMatchCap = '';

    for (const toolCap of toolCaps) {
      // Exact match
      if (toolCap.toLowerCase() === requiredCap.toLowerCase()) {
        bestMatch = 1.0;
        bestMatchCap = toolCap;
        if (matchType !== 'exact') matchType = 'exact';
        break;
      }

      // Partial match (substring)
      if (toolCap.toLowerCase().includes(requiredCap.toLowerCase()) ||
          requiredCap.toLowerCase().includes(toolCap.toLowerCase())) {
        const score = 0.8;
        if (score > bestMatch) {
          bestMatch = score;
          bestMatchCap = toolCap;
          if (matchType === 'semantic') matchType = 'partial';
        }
      }

      // Semantic similarity
      if (includePartial) {
        const similarity = calculateSemanticSimilarity(toolCap, requiredCap);
        if (similarity > bestMatch && similarity >= threshold) {
          bestMatch = similarity;
          bestMatchCap = toolCap;
        }
      }
    }

    if (bestMatch >= threshold) {
      matched.push(requiredCap);
    } else {
      missing.push(requiredCap);
    }
  }

  const matchScore = matched.length / requiredCaps.length;

  // Only return tools that meet the threshold
  if (matchScore >= threshold) {
    return {
      score: matchScore,
      matched,
      missing,
      type: matchType,
    };
  }

  return null;
}

/**
 * Main match function
 */
export async function run(input: MatchCapabilitiesInput): Promise<MatchCapabilitiesOutput> {
  const startTime = Date.now();

  // Validate input
  const validated = MatchCapabilitiesInputSchema.parse(input);

  const {
    tools,
    required_capabilities,
    match_threshold,
    include_partial_matches,
  } = validated;

  // Match each tool
  const matchedTools: MatchCapabilitiesOutput['matched_tools'] = [];

  for (const tool of tools) {
    const match = matchToolCapabilities(
      tool,
      required_capabilities,
      match_threshold,
      include_partial_matches
    );

    if (match) {
      matchedTools.push({
        name: tool.name,
        description: tool.description,
        match_score: match.score,
        matched_capabilities: match.matched,
        missing_capabilities: match.missing,
        match_type: match.type,
      });
    }
  }

  // Sort by match score (descending)
  matchedTools.sort((a, b) => b.match_score - a.match_score);

  const executionTime = Date.now() - startTime;
  const averageScore = matchedTools.length > 0
    ? matchedTools.reduce((sum, t) => sum + t.match_score, 0) / matchedTools.length
    : 0;

  return {
    matched_tools: matchedTools,
    total_tools_analyzed: tools.length,
    matched_count: matchedTools.length,
    average_match_score: Math.round(averageScore * 100) / 100,
    execution_time_ms: executionTime,
  };
}
