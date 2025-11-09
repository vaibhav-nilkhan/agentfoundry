import { z } from 'zod';
import { PostmortemGenerator } from '../core/postmortem-generator';

const inputSchema = z.object({
  workflow_id: z.string(),
  failure_data: z.object({
    failed_step: z.string(),
    error_message: z.string(),
    stack_trace: z.string().optional(),
    execution_history: z.array(z.object({
      step: z.string(),
      status: z.string(),
      duration_ms: z.number(),
      timestamp: z.string()
    }))
  }),
  recovery_attempts: z.array(z.object({
    strategy: z.string(),
    result: z.string(),
    details: z.any()
  })),
  context: z.object({
    user_id: z.string().optional(),
    environment: z.enum(['dev', 'staging', 'production']),
    agent_version: z.string()
  }).optional(),
  include_recommendations: z.boolean().optional().default(true)
});

type GeneratePostmortemInput = z.infer<typeof inputSchema>;

interface TimelineEvent {
  timestamp: string;
  event: string;
  details: string;
}

interface ActionItem {
  priority: 'low' | 'medium' | 'high';
  action: string;
  owner?: string;
  deadline?: string;
}

interface GeneratePostmortemOutput {
  postmortem: {
    incident_id: string;
    summary: string;
    timeline: TimelineEvent[];
    root_cause_analysis: {
      primary_cause: string;
      contributing_factors: string[];
      why_it_happened: string;
    };
    impact_assessment: {
      severity: 'low' | 'medium' | 'high' | 'critical';
      affected_users?: number;
      downtime_minutes?: number;
      cost_impact_usd?: number;
    };
    recovery_summary: {
      strategies_attempted: string[];
      successful_strategy?: string;
      total_recovery_time_ms: number;
    };
    lessons_learned: string[];
    action_items: ActionItem[];
  };
  visualizations?: {
    execution_timeline_url: string;
    error_distribution_url: string;
  };
  metadata: {
    generated_at: string;
    report_version: string;
  };
}

export async function run(input: GeneratePostmortemInput): Promise<GeneratePostmortemOutput> {
  // Validate input
  const validated = inputSchema.parse(input);

  // Initialize postmortem generator
  const generator = new PostmortemGenerator();

  // Generate incident ID
  const incidentId = generator.generateIncidentId(validated.workflow_id);

  // Generate summary
  const summary = generator.generateSummary(
    validated.failure_data,
    validated.recovery_attempts
  );

  // Generate timeline
  const timeline = generator.generateTimeline(
    validated.failure_data,
    validated.recovery_attempts
  );

  // Analyze root cause
  const rootCauseAnalysis = generator.analyzeRootCause(
    validated.failure_data,
    validated.context
  );

  // Assess impact
  const impactAssessment = generator.assessImpact(
    validated.failure_data,
    validated.context
  );

  // Summarize recovery attempts
  const recoverySummary = generator.summarizeRecovery(validated.recovery_attempts);

  // Generate lessons learned
  const lessonsLearned = generator.generateLessonsLearned(
    validated.failure_data,
    rootCauseAnalysis,
    validated.recovery_attempts
  );

  // Generate action items (if requested)
  let actionItems: ActionItem[] = [];
  if (validated.include_recommendations) {
    actionItems = generator.generateActionItems(
      rootCauseAnalysis,
      impactAssessment,
      lessonsLearned
    );
  }

  // Generate visualizations (mock URLs for demo)
  const visualizations = {
    execution_timeline_url: `https://agentfoundry.ai/incidents/${incidentId}/timeline`,
    error_distribution_url: `https://agentfoundry.ai/incidents/${incidentId}/errors`
  };

  return {
    postmortem: {
      incident_id: incidentId,
      summary,
      timeline,
      root_cause_analysis: rootCauseAnalysis,
      impact_assessment: impactAssessment,
      recovery_summary: recoverySummary,
      lessons_learned: lessonsLearned,
      action_items: actionItems
    },
    visualizations,
    metadata: {
      generated_at: new Date().toISOString(),
      report_version: '1.0.0'
    }
  };
}

export { inputSchema };
