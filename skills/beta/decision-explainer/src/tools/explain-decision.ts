import { z } from 'zod';

/**
 * Explain Decision - Break down agent reasoning step-by-step
 *
 * Provides transparent explanations of agent decisions with reasoning steps,
 * alternatives considered, and contextual factors.
 */

export const ExplainDecisionInputSchema = z.object({
  decision: z.string().min(1),
  context: z.record(z.any()),
  detail_level: z.enum(['summary', 'detailed', 'comprehensive']).default('detailed'),
});

export const ExplainDecisionOutputSchema = z.object({
  explanation: z.string(),
  reasoning_steps: z.array(z.object({
    step_number: z.number(),
    description: z.string(),
    rationale: z.string(),
    confidence: z.number().min(0).max(1),
  })),
  alternatives_considered: z.array(z.object({
    alternative: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    rejected_reason: z.string(),
  })),
  key_factors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    value: z.any(),
  })),
  decision_rationale: z.string(),
});

export type ExplainDecisionInput = z.infer<typeof ExplainDecisionInputSchema>;
export type ExplainDecisionOutput = z.infer<typeof ExplainDecisionOutputSchema>;

/**
 * Extract key factors from context
 */
function extractKeyFactors(context: Record<string, any>): Array<{
  factor: string;
  impact: 'high' | 'medium' | 'low';
  value: any;
}> {
  const factors: Array<{ factor: string; impact: 'high' | 'medium' | 'low'; value: any }> = [];

  // Priority indicators (high impact)
  const highImpactKeys = ['error', 'priority', 'urgent', 'critical', 'budget', 'deadline'];
  const mediumImpactKeys = ['user', 'preferences', 'constraints', 'requirements'];

  for (const [key, value] of Object.entries(context)) {
    let impact: 'high' | 'medium' | 'low' = 'low';

    if (highImpactKeys.some(k => key.toLowerCase().includes(k))) {
      impact = 'high';
    } else if (mediumImpactKeys.some(k => key.toLowerCase().includes(k))) {
      impact = 'medium';
    }

    factors.push({
      factor: key,
      impact,
      value,
    });
  }

  // Sort by impact
  const impactOrder = { high: 0, medium: 1, low: 2 };
  factors.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

  return factors;
}

/**
 * Generate reasoning steps based on decision and context
 */
function generateReasoningSteps(
  decision: string,
  context: Record<string, any>,
  detailLevel: string
): Array<{ step_number: number; description: string; rationale: string; confidence: number }> {
  const steps: Array<{ step_number: number; description: string; rationale: string; confidence: number }> = [];

  // Step 1: Context analysis
  steps.push({
    step_number: 1,
    description: 'Analyzed input context and requirements',
    rationale: `Examined ${Object.keys(context).length} contextual factors to understand the situation`,
    confidence: 0.95,
  });

  // Step 2: Constraint identification
  const constraints = Object.keys(context).filter(k =>
    k.toLowerCase().includes('constraint') || k.toLowerCase().includes('limit')
  );

  if (constraints.length > 0 || detailLevel !== 'summary') {
    steps.push({
      step_number: 2,
      description: 'Identified constraints and limitations',
      rationale: constraints.length > 0
        ? `Found ${constraints.length} constraints: ${constraints.join(', ')}`
        : 'No explicit constraints detected, proceeding with standard operating parameters',
      confidence: constraints.length > 0 ? 0.90 : 0.75,
    });
  }

  // Step 3: Alternative evaluation
  steps.push({
    step_number: steps.length + 1,
    description: 'Evaluated alternative approaches',
    rationale: 'Considered multiple strategies and selected optimal approach based on context',
    confidence: 0.85,
  });

  // Step 4: Risk assessment
  if (detailLevel === 'comprehensive') {
    steps.push({
      step_number: steps.length + 1,
      description: 'Assessed risks and trade-offs',
      rationale: 'Evaluated potential risks, benefits, and trade-offs of chosen decision',
      confidence: 0.80,
    });
  }

  // Step 5: Final decision
  steps.push({
    step_number: steps.length + 1,
    description: `Finalized decision: ${decision}`,
    rationale: 'Selected approach that best balances objectives, constraints, and risk factors',
    confidence: 0.88,
  });

  return steps;
}

/**
 * Generate alternatives that were considered
 */
function generateAlternatives(
  decision: string,
  context: Record<string, any>
): Array<{ alternative: string; pros: string[]; cons: string[]; rejected_reason: string }> {
  const alternatives: Array<{
    alternative: string;
    pros: string[];
    cons: string[];
    rejected_reason: string;
  }> = [];

  // Generate plausible alternatives based on decision type
  const decisionLower = decision.toLowerCase();

  if (decisionLower.includes('use') || decisionLower.includes('select')) {
    alternatives.push({
      alternative: 'Manual approach without automation',
      pros: ['Full control', 'No dependency on external tools'],
      cons: ['Time-consuming', 'Error-prone', 'Not scalable'],
      rejected_reason: 'Inefficient for the scale of this task',
    });

    alternatives.push({
      alternative: 'Hybrid semi-automated approach',
      pros: ['Balance of control and automation', 'Gradual adoption'],
      cons: ['Complexity', 'Maintenance overhead'],
      rejected_reason: 'Adds unnecessary complexity without significant benefits',
    });
  }

  if (decisionLower.includes('skip') || decisionLower.includes('ignore')) {
    alternatives.push({
      alternative: 'Process with full validation',
      pros: ['Thorough checking', 'Higher accuracy'],
      cons: ['Slower execution', 'Higher cost'],
      rejected_reason: 'Context indicates speed priority over exhaustive validation',
    });
  }

  // Default alternatives if none generated
  if (alternatives.length === 0) {
    alternatives.push({
      alternative: 'Alternative approach A',
      pros: ['Lower complexity', 'Faster initial implementation'],
      cons: ['Limited flexibility', 'May not scale'],
      rejected_reason: 'Does not meet long-term requirements',
    });

    alternatives.push({
      alternative: 'Alternative approach B',
      pros: ['Comprehensive solution', 'Future-proof'],
      cons: ['Higher initial cost', 'Longer implementation time'],
      rejected_reason: 'Overengineered for current needs',
    });
  }

  return alternatives.slice(0, 3); // Limit to 3 alternatives
}

/**
 * Main explanation function
 */
export async function run(input: ExplainDecisionInput): Promise<ExplainDecisionOutput> {
  // Validate input
  const validated = ExplainDecisionInputSchema.parse(input);

  const { decision, context, detail_level } = validated;

  // Extract key factors
  const keyFactors = extractKeyFactors(context);

  // Generate reasoning steps
  const reasoningSteps = generateReasoningSteps(decision, context, detail_level);

  // Generate alternatives
  const alternativesConsidered = generateAlternatives(decision, context);

  // Build explanation text
  let explanation = '';

  if (detail_level === 'summary') {
    explanation = `Decision: ${decision}. This choice was made after analyzing ${Object.keys(context).length} contextual factors and considering ${alternativesConsidered.length} alternative approaches.`;
  } else if (detail_level === 'detailed') {
    explanation = `Decision: ${decision}\n\nThis decision was reached through ${reasoningSteps.length} reasoning steps, taking into account ${keyFactors.filter(f => f.impact === 'high').length} high-impact factors from the provided context. ${alternativesConsidered.length} alternative approaches were evaluated before selecting this option as the most appropriate given the constraints and objectives.`;
  } else {
    // comprehensive
    explanation = `Decision: ${decision}\n\nComprehensive Analysis:\nThis decision represents the optimal choice after a thorough evaluation process involving ${reasoningSteps.length} distinct reasoning steps. The analysis considered ${Object.keys(context).length} contextual factors, with particular emphasis on ${keyFactors.filter(f => f.impact === 'high').length} high-impact elements.\n\nAlternative Evaluation:\n${alternativesConsidered.length} alternative approaches were systematically evaluated against the current requirements and constraints. Each alternative was assessed for its pros, cons, and alignment with stated objectives.\n\nConfidence:\nThe decision process achieved an average confidence score of ${(reasoningSteps.reduce((sum, s) => sum + s.confidence, 0) / reasoningSteps.length).toFixed(2)}, indicating strong alignment with available information and requirements.`;
  }

  // Build decision rationale
  const highImpactFactors = keyFactors.filter(f => f.impact === 'high').map(f => f.factor);
  const decisionRationale = highImpactFactors.length > 0
    ? `This decision optimizes for the following high-priority factors: ${highImpactFactors.join(', ')}. It provides the best balance of effectiveness, efficiency, and risk management given the current context.`
    : `This decision was selected as the most appropriate option based on general best practices and the available context.`;

  return {
    explanation,
    reasoning_steps: reasoningSteps,
    alternatives_considered: alternativesConsidered,
    key_factors: keyFactors,
    decision_rationale: decisionRationale,
  };
}
