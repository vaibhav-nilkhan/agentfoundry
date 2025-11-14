import { z } from 'zod';
import { manager } from './wrap-agent';

const inputSchema = z.object({
  wrapped_agent_id: z.string().uuid(),
  time_window: z
    .enum(['last_hour', 'last_day', 'last_week', 'last_month', 'all_time'])
    .default('last_day'),
});

type Input = z.infer<typeof inputSchema>;

/**
 * Gets reliability metrics and success rate for wrapped agent
 *
 * Solves: "Can't debug agents, no visibility into failures" (observability pain point)
 *
 * Returns:
 * - Overall reliability score (0-100)
 * - Success rate percentage
 * - Average retries needed
 * - Total/failed executions
 * - Average execution time
 *
 * Score calculation:
 * - Success rate: 70% weight
 * - Low retries: 20% weight
 * - Fast execution: 10% weight
 */
export async function run(input: Input) {
  // Validate input
  const validated = inputSchema.parse(input);

  try {
    // Get reliability score
    const score = manager.getReliabilityScore(
      validated.wrapped_agent_id,
      validated.time_window
    );

    // Interpret score
    let interpretation: string;
    let recommendation: string;

    if (score.score >= 90) {
      interpretation = 'Excellent - Production ready';
      recommendation = 'Agent is highly reliable. Continue monitoring.';
    } else if (score.score >= 75) {
      interpretation = 'Good - Generally reliable';
      recommendation = 'Agent is stable. Monitor for occasional failures.';
    } else if (score.score >= 50) {
      interpretation = 'Fair - Needs improvement';
      recommendation =
        'Consider using decompose_task to break complex tasks into smaller chunks.';
    } else if (score.score >= 25) {
      interpretation = 'Poor - Significant issues';
      recommendation =
        'Review agent configuration. High failure rate detected. Check logs for patterns.';
    } else {
      interpretation = 'Critical - Unreliable';
      recommendation =
        'Agent is failing frequently. Review implementation and consider simpler tasks.';
    }

    return {
      success: true,
      reliability_score: score.score,
      interpretation,
      recommendation,
      metrics: {
        success_rate: `${(score.success_rate * 100).toFixed(1)}%`,
        average_retries: score.average_retries.toFixed(2),
        total_executions: score.total_executions,
        successful_executions: score.total_executions - score.failed_executions,
        failed_executions: score.failed_executions,
        average_duration: `${score.average_duration_ms.toFixed(0)}ms`,
      },
      time_window: score.time_window,
      insights: [
        score.success_rate < 0.75 &&
          'Success rate below 75% - consider task decomposition',
        score.average_retries > 2 && 'High average retries - review error patterns',
        score.average_duration_ms > 5000 && 'Slow execution - optimize agent or tasks',
      ].filter(Boolean),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to get reliability score',
    };
  }
}
