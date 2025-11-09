import { z } from 'zod';
import { ErrorDetector } from '../core/error-detector';

const inputSchema = z.object({
  error_message: z.string().describe('The error text or message'),
  error_code: z.string().optional().describe('Optional error code'),
  step_number: z.number().int().min(1).describe('Which step in the workflow failed'),
  workflow_context: z.object({
    total_steps: z.number().int().min(1),
    completed_steps: z.number().int().min(0),
    previous_step: z.string(),
    next_step: z.string()
  }),
  execution_history: z.array(z.object({
    step: z.string(),
    status: z.enum(['success', 'failure']),
    timestamp: z.string()
  })).optional().describe('Past execution attempts for learning')
});

type DetectFailureInput = z.infer<typeof inputSchema>;

interface DetectFailureOutput {
  failure_classification: {
    type: 'transient' | 'permanent' | 'critical';
    severity: 'low' | 'medium' | 'high' | 'critical';
    is_recoverable: boolean;
    confidence: number;
  };
  root_cause: {
    category: string;
    description: string;
    likely_causes: string[];
  };
  recovery_recommendation: {
    strategy: 'retry' | 'rollback' | 'fallback' | 'skip' | 'manual';
    estimated_success_rate: number;
    reasoning: string;
  };
  metadata: {
    analyzed_at: string;
    analysis_time_ms: number;
  };
}

export async function run(input: DetectFailureInput): Promise<DetectFailureOutput> {
  const startTime = Date.now();

  // Validate input
  const validated = inputSchema.parse(input);

  // Initialize error detector
  const detector = new ErrorDetector();

  // Classify the error
  const classification = detector.classifyError(
    validated.error_message,
    validated.error_code
  );

  // Identify root cause
  const rootCause = detector.identifyRootCause(
    validated.error_message,
    validated.error_code
  );

  // Recommend recovery strategy
  const recommendation = detector.recommendRecoveryStrategy(
    classification,
    rootCause,
    validated.execution_history
  );

  const analysisTimeMs = Date.now() - startTime;

  return {
    failure_classification: {
      type: classification.type,
      severity: classification.severity,
      is_recoverable: classification.is_recoverable,
      confidence: classification.confidence
    },
    root_cause: {
      category: rootCause.category,
      description: rootCause.description,
      likely_causes: rootCause.likely_causes
    },
    recovery_recommendation: {
      strategy: recommendation.strategy,
      estimated_success_rate: recommendation.estimated_success_rate,
      reasoning: recommendation.reasoning
    },
    metadata: {
      analyzed_at: new Date().toISOString(),
      analysis_time_ms: analysisTimeMs
    }
  };
}

export { inputSchema };
