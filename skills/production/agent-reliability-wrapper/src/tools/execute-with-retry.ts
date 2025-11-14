import { z } from 'zod';
import { manager } from './wrap-agent';

const inputSchema = z.object({
  wrapped_agent_id: z.string().uuid(),
  task: z.object({
    input: z.string().min(1),
    context: z.any().optional(),
  }),
  retry_on_error_types: z
    .array(z.enum(['timeout', 'rate_limit', 'api_error', 'validation_error', 'all']))
    .default(['all']),
  continue_from_checkpoint: z.boolean().default(true),
});

type Input = z.infer<typeof inputSchema>;

/**
 * Executes agent task with automatic retry logic and exponential backoff
 *
 * Solves: "Agent works perfectly one day, fails completely the next" (production reliability)
 *
 * Features:
 * - Automatic retry on failures (max 3-10 retries configurable)
 * - Exponential backoff (2s, 4s, 8s, 16s...)
 * - Checkpoint-based recovery (resume from last successful step)
 * - Error type filtering (only retry specific errors)
 */
export async function run(input: Input) {
  // Validate input
  const validated = inputSchema.parse(input);

  try {
    // Execute with retry logic
    const result = await manager.executeWithRetry(
      validated.wrapped_agent_id,
      validated.task,
      validated.retry_on_error_types,
      validated.continue_from_checkpoint
    );

    if (result.success) {
      return {
        success: true,
        result: result.result,
        execution_stats: {
          retries: result.retries,
          duration_ms: result.duration_ms,
          reliability_note:
            result.retries === 0
              ? 'Executed successfully on first attempt'
              : `Succeeded after ${result.retries} retries (automatic recovery)`,
        },
        message: `Task completed successfully${
          result.retries > 0 ? ` after ${result.retries} automatic retries` : ''
        }`,
      };
    } else {
      return {
        success: false,
        error: result.error,
        execution_stats: {
          retries: result.retries,
          duration_ms: result.duration_ms,
        },
        message: `Task failed after ${result.retries} retry attempts`,
        recommendations: [
          'Check if the task is too complex - consider using decompose_task',
          'Verify agent configuration is correct',
          'Check error type and adjust retry_on_error_types if needed',
          'Use get_reliability_score to analyze failure patterns',
        ],
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Execution failed',
    };
  }
}
