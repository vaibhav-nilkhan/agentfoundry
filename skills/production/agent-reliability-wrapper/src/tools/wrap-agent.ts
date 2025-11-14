import { z } from 'zod';
import { ReliabilityManager } from '../lib/reliability-manager';

const inputSchema = z.object({
  agent_type: z.enum(['langchain', 'llamaindex', 'crewai', 'custom']),
  agent_config: z.any(),
  retry_config: z
    .object({
      max_retries: z.number().min(1).max(10).default(3),
      exponential_backoff: z.boolean().default(true),
      backoff_base: z.number().min(1).max(10).default(2),
    })
    .optional()
    .default({
      max_retries: 3,
      exponential_backoff: true,
      backoff_base: 2,
    }),
  checkpoint_enabled: z.boolean().default(true),
});

type Input = z.infer<typeof inputSchema>;

const manager = new ReliabilityManager();

/**
 * Wraps any agent with reliability features
 *
 * Solves: "75% of agents fail in production" (LlamaIndex Issue #16774, research data)
 *
 * Features:
 * - Automatic retry logic with exponential backoff
 * - Checkpoint-based recovery
 * - Success rate tracking
 * - Failure pattern detection
 */
export async function run(input: Input) {
  // Validate input
  const validated = inputSchema.parse(input);

  // Wrap the agent
  const wrapped_agent = manager.wrapAgent(
    validated.agent_type,
    validated.agent_config,
    validated.retry_config,
    validated.checkpoint_enabled
  );

  return {
    success: true,
    wrapped_agent_id: wrapped_agent.id,
    agent_type: wrapped_agent.type,
    retry_config: wrapped_agent.retry_config,
    checkpoint_enabled: wrapped_agent.checkpoint_enabled,
    created_at: wrapped_agent.created_at.toISOString(),
    message: `Agent wrapped successfully with ID: ${wrapped_agent.id}. Ready for reliable execution.`,
    usage_instructions: {
      next_step: 'Use execute_with_retry to run tasks with automatic retry logic',
      example: {
        wrapped_agent_id: wrapped_agent.id,
        task: {
          input: 'Your task description here',
          context: {},
        },
      },
    },
  };
}

// Export the manager instance for use by other tools
export { manager };
