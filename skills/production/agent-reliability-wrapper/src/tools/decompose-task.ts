import { z } from 'zod';
import { manager } from './wrap-agent';

const inputSchema = z.object({
  task_description: z.string().min(10),
  max_chunk_steps: z.number().min(2).max(10).default(4),
  dependency_aware: z.boolean().default(true),
});

type Input = z.infer<typeof inputSchema>;

/**
 * Automatically breaks down complex multi-step tasks into smaller, more reliable chunks
 *
 * Solves: "Math problem: 20-step task with 95% per-step reliability = 35% overall success"
 *         (0.95^20 = 0.35)
 *
 * Solution: Break into 5 chunks of 4 steps each
 *          (0.95^4)^5 = 81.5% per chunk, much easier to retry
 *
 * Based on research: "Customers demand 20+ step processes that break down mathematically"
 */
export async function run(input: Input) {
  // Validate input
  const validated = inputSchema.parse(input);

  try {
    // Decompose task
    const chunks = manager.decomposeTask(
      validated.task_description,
      validated.max_chunk_steps,
      validated.dependency_aware
    );

    // Calculate reliability improvement
    const original_steps = chunks.reduce((sum, chunk) => sum + chunk.steps.length, 0);
    const avg_steps_per_chunk = original_steps / chunks.length;

    // Assuming 95% per-step reliability
    const per_step_reliability = 0.95;
    const original_success_rate = Math.pow(per_step_reliability, original_steps);
    const chunked_success_rate = Math.pow(
      Math.pow(per_step_reliability, avg_steps_per_chunk),
      chunks.length
    );

    // With retry, assume we can recover 90% of chunk failures
    const chunk_recovery_rate = 0.9;
    const improved_success_rate =
      1 - Math.pow(1 - Math.pow(per_step_reliability, avg_steps_per_chunk), chunks.length) *
        (1 - chunk_recovery_rate);

    return {
      success: true,
      task_chunks: chunks,
      analysis: {
        original_steps,
        chunks_created: chunks.length,
        steps_per_chunk: avg_steps_per_chunk.toFixed(1),
        reliability_improvement: {
          before: `${(original_success_rate * 100).toFixed(1)}%`,
          after_chunking: `${(chunked_success_rate * 100).toFixed(1)}%`,
          with_retry: `${(improved_success_rate * 100).toFixed(1)}%`,
          improvement_factor: `${(improved_success_rate / original_success_rate).toFixed(1)}x`,
        },
      },
      execution_plan: {
        strategy: 'Execute chunks sequentially with retry on each chunk',
        benefits: [
          'Each chunk can be retried independently',
          'Easier to debug failures (smaller scope)',
          'Can resume from failed chunk',
          'Mathematically higher success probability',
        ],
        example_usage: `
For each chunk:
  1. Execute chunk using execute_with_retry
  2. If fails, retry just that chunk
  3. Continue to next chunk

This gives you ${chunks.length} recovery points instead of 1.
        `.trim(),
      },
      message: `Decomposed ${original_steps}-step task into ${chunks.length} chunks. Expected reliability improvement: ${(improved_success_rate / original_success_rate).toFixed(1)}x`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to decompose task',
    };
  }
}
