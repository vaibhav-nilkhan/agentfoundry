import { z } from 'zod';

/**
 * Score Confidence - Rate decision certainty and identify uncertainty factors
 *
 * Analyzes decisions to provide confidence scores and identify sources of uncertainty
 * that may require additional validation or human oversight.
 */

export const ScoreConfidenceInputSchema = z.object({
  decision: z.object({
    action: z.string(),
    reasoning: z.string().optional(),
    data_sources: z.array(z.string()).optional(),
    alternatives_count: z.number().int().min(0).optional(),
    context_completeness: z.number().min(0).max(1).optional(),
  }),
});

export const ScoreConfidenceOutputSchema = z.object({
  confidence_score: z.number().min(0).max(1),
  confidence_level: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']),
  uncertainty_factors: z.array(z.object({
    factor: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    description: z.string(),
    mitigation: z.string(),
  })),
  recommendation: z.string(),
  requires_human_review: z.boolean(),
  confidence_breakdown: z.object({
    data_quality: z.number().min(0).max(1),
    reasoning_clarity: z.number().min(0).max(1),
    alternatives_evaluated: z.number().min(0).max(1),
    context_coverage: z.number().min(0).max(1),
  }),
});

export type ScoreConfidenceInput = z.infer<typeof ScoreConfidenceInputSchema>;
export type ScoreConfidenceOutput = z.infer<typeof ScoreConfidenceOutputSchema>;

/**
 * Assess data quality and availability
 */
function assessDataQuality(decision: ScoreConfidenceInput['decision']): number {
  let score = 0.5; // Base score

  // Check if data sources are provided
  if (decision.data_sources && decision.data_sources.length > 0) {
    score += 0.2;

    // Bonus for multiple diverse sources
    if (decision.data_sources.length >= 3) {
      score += 0.1;
    }
  } else {
    score -= 0.2;
  }

  // Check action clarity
  if (decision.action && decision.action.length > 10) {
    score += 0.1;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Assess reasoning clarity
 */
function assessReasoningClarity(decision: ScoreConfidenceInput['decision']): number {
  let score = 0.5;

  if (decision.reasoning) {
    const wordCount = decision.reasoning.split(/\s+/).length;

    if (wordCount >= 20 && wordCount <= 200) {
      score += 0.3; // Good balance
    } else if (wordCount < 20) {
      score += 0.1; // Too brief
    } else {
      score += 0.2; // Detailed but perhaps verbose
    }

    // Check for structured reasoning (keywords)
    const structureKeywords = ['because', 'therefore', 'since', 'given', 'considering'];
    const hasStructure = structureKeywords.some(kw => decision.reasoning!.toLowerCase().includes(kw));
    if (hasStructure) {
      score += 0.2;
    }
  } else {
    score -= 0.3; // No reasoning provided
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Assess alternatives evaluation
 */
function assessAlternativesEvaluation(decision: ScoreConfidenceInput['decision']): number {
  const altCount = decision.alternatives_count || 0;

  if (altCount === 0) {
    return 0.3; // Low confidence - no alternatives considered
  } else if (altCount === 1) {
    return 0.5; // Moderate - at least one alternative
  } else if (altCount >= 2 && altCount <= 5) {
    return 0.9; // High - good range of alternatives
  } else {
    return 0.7; // Many alternatives considered, but may indicate indecision
  }
}

/**
 * Assess context coverage
 */
function assessContextCoverage(decision: ScoreConfidenceInput['decision']): number {
  return decision.context_completeness || 0.5;
}

/**
 * Identify uncertainty factors
 */
function identifyUncertaintyFactors(
  decision: ScoreConfidenceInput['decision'],
  breakdown: {
    data_quality: number;
    reasoning_clarity: number;
    alternatives_evaluated: number;
    context_coverage: number;
  }
): Array<{
  factor: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}> {
  const factors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    mitigation: string;
  }> = [];

  // Data quality issues
  if (breakdown.data_quality < 0.5) {
    factors.push({
      factor: 'Limited data sources',
      severity: breakdown.data_quality < 0.3 ? 'high' : 'medium',
      description: 'Decision based on insufficient or low-quality data',
      mitigation: 'Gather additional data sources or validate with domain experts',
    });
  }

  // Reasoning clarity issues
  if (breakdown.reasoning_clarity < 0.5) {
    factors.push({
      factor: 'Unclear reasoning',
      severity: breakdown.reasoning_clarity < 0.3 ? 'high' : 'medium',
      description: 'Decision rationale is not well-articulated',
      mitigation: 'Request detailed explanation of decision logic and assumptions',
    });
  }

  // Alternatives evaluation issues
  if (breakdown.alternatives_evaluated < 0.5) {
    factors.push({
      factor: 'Limited alternatives explored',
      severity: breakdown.alternatives_evaluated < 0.3 ? 'high' : 'medium',
      description: 'Few or no alternative approaches were considered',
      mitigation: 'Evaluate at least 2-3 alternative approaches before finalizing',
    });
  }

  // Context coverage issues
  if (breakdown.context_coverage < 0.6) {
    factors.push({
      factor: 'Incomplete context',
      severity: breakdown.context_coverage < 0.4 ? 'high' : 'medium',
      description: 'Decision made with incomplete contextual information',
      mitigation: 'Gather missing context or document assumptions explicitly',
    });
  }

  return factors;
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(breakdown: {
  data_quality: number;
  reasoning_clarity: number;
  alternatives_evaluated: number;
  context_coverage: number;
}): number {
  // Weighted average
  const weights = {
    data_quality: 0.3,
    reasoning_clarity: 0.25,
    alternatives_evaluated: 0.25,
    context_coverage: 0.2,
  };

  const score =
    breakdown.data_quality * weights.data_quality +
    breakdown.reasoning_clarity * weights.reasoning_clarity +
    breakdown.alternatives_evaluated * weights.alternatives_evaluated +
    breakdown.context_coverage * weights.context_coverage;

  return Math.round(score * 100) / 100;
}

/**
 * Determine confidence level label
 */
function getConfidenceLevel(score: number): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
  if (score < 0.3) return 'very_low';
  if (score < 0.5) return 'low';
  if (score < 0.7) return 'medium';
  if (score < 0.85) return 'high';
  return 'very_high';
}

/**
 * Generate recommendation
 */
function generateRecommendation(
  confidenceScore: number,
  uncertaintyFactors: Array<{ severity: string }>
): string {
  const highSeverityCount = uncertaintyFactors.filter(f => f.severity === 'high').length;

  if (confidenceScore >= 0.85 && highSeverityCount === 0) {
    return 'Decision has high confidence. Proceed with implementation.';
  } else if (confidenceScore >= 0.7 && highSeverityCount === 0) {
    return 'Decision has moderate-to-high confidence. Monitor implementation for validation.';
  } else if (confidenceScore >= 0.5) {
    return 'Decision has moderate confidence. Consider addressing uncertainty factors before full implementation.';
  } else if (highSeverityCount > 0) {
    return 'Decision has significant uncertainty. Require human review and address high-severity factors.';
  } else {
    return 'Decision has low confidence. Recommend gathering more data and reevaluating alternatives.';
  }
}

/**
 * Main confidence scoring function
 */
export async function run(input: ScoreConfidenceInput): Promise<ScoreConfidenceOutput> {
  // Validate input
  const validated = ScoreConfidenceInputSchema.parse(input);

  const { decision } = validated;

  // Calculate confidence breakdown
  const breakdown = {
    data_quality: assessDataQuality(decision),
    reasoning_clarity: assessReasoningClarity(decision),
    alternatives_evaluated: assessAlternativesEvaluation(decision),
    context_coverage: assessContextCoverage(decision),
  };

  // Calculate overall confidence
  const confidenceScore = calculateOverallConfidence(breakdown);
  const confidenceLevel = getConfidenceLevel(confidenceScore);

  // Identify uncertainty factors
  const uncertaintyFactors = identifyUncertaintyFactors(decision, breakdown);

  // Generate recommendation
  const recommendation = generateRecommendation(confidenceScore, uncertaintyFactors);

  // Determine if human review is required
  const requiresHumanReview =
    confidenceScore < 0.5 ||
    uncertaintyFactors.some(f => f.severity === 'high');

  return {
    confidence_score: confidenceScore,
    confidence_level: confidenceLevel,
    uncertainty_factors: uncertaintyFactors,
    recommendation,
    requires_human_review: requiresHumanReview,
    confidence_breakdown: breakdown,
  };
}
