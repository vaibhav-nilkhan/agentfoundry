import { z } from 'zod';
import { RecoveryStrategy } from '../core/recovery-strategy';

const inputSchema = z.object({
  strategy: z.enum(['retry', 'rollback', 'fallback', 'skip']).describe('Recovery strategy to execute'),
  workflow_state: z.object({
    current_step: z.number().int(),
    total_steps: z.number().int(),
    state_snapshot: z.any().describe('State before failure'),
    failed_step_id: z.string()
  }),
  retry_config: z.object({
    max_attempts: z.number().int().default(3),
    backoff_strategy: z.enum(['linear', 'exponential', 'fixed']).default('exponential'),
    initial_delay_ms: z.number().int().default(1000),
    max_delay_ms: z.number().int().default(30000)
  }).optional(),
  fallback_config: z.object({
    alternative_step: z.string(),
    alternative_parameters: z.any()
  }).optional(),
  rollback_config: z.object({
    target_step: z.number().int(),
    cleanup_actions: z.array(z.string())
  }).optional()
});

type ExecuteRecoveryInput = z.infer<typeof inputSchema>;

interface ExecutionLogEntry {
  attempt: number;
  strategy: string;
  status: string;
  duration_ms: number;
  error?: string;
}

interface ExecuteRecoveryOutput {
  recovery_result: {
    status: 'success' | 'partial_success' | 'failure';
    strategy_used: string;
    attempts_made: number;
    recovered_at_step: number;
  };
  execution_log: ExecutionLogEntry[];
  new_workflow_state: {
    current_step: number;
    state_snapshot: any;
    can_continue: boolean;
  };
  recommendations: {
    should_continue: boolean;
    next_steps: string[];
    warnings: string[];
  };
  metadata: {
    recovery_started_at: string;
    recovery_completed_at: string;
    total_recovery_time_ms: number;
  };
}

export async function run(input: ExecuteRecoveryInput): Promise<ExecuteRecoveryOutput> {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();

  // Validate input
  const validated = inputSchema.parse(input);

  // Initialize recovery strategy
  const recovery = new RecoveryStrategy();

  let executionLog: ExecutionLogEntry[] = [];
  let status: 'success' | 'partial_success' | 'failure' = 'failure';
  let newState = validated.workflow_state;
  let attemptsMade = 0;

  // Execute the appropriate recovery strategy
  switch (validated.strategy) {
    case 'retry': {
      const retryConfig = validated.retry_config || {
        max_attempts: 3,
        backoff_strategy: 'exponential' as const,
        initial_delay_ms: 1000,
        max_delay_ms: 30000
      };

      // Simulate a failed operation for demo purposes
      const mockFailedOperation = async () => {
        // In real implementation, this would re-execute the failed step
        await new Promise(resolve => setTimeout(resolve, 100));

        // Simulate success on 2nd or 3rd attempt (for demo)
        if (attemptsMade >= 1) {
          return { success: true };
        }
        attemptsMade++;
        throw new Error('Simulated transient failure');
      };

      const retryResult = await recovery.executeRetry(retryConfig, mockFailedOperation);
      executionLog = retryResult.executionLog;
      status = retryResult.success ? 'success' : 'failure';
      attemptsMade = retryResult.attempts;

      if (retryResult.success) {
        newState = {
          ...validated.workflow_state,
          current_step: validated.workflow_state.current_step,
          state_snapshot: { ...validated.workflow_state.state_snapshot, retried: true }
        };
      }
      break;
    }

    case 'rollback': {
      const rollbackConfig = validated.rollback_config || {
        target_step: Math.max(1, validated.workflow_state.current_step - 1),
        cleanup_actions: ['cleanup_temp_files', 'reset_state']
      };

      const rollbackResult = await recovery.executeRollback(
        validated.workflow_state,
        rollbackConfig.target_step,
        rollbackConfig.cleanup_actions
      );

      executionLog = rollbackResult.executionLog;
      status = rollbackResult.success ? 'success' : 'failure';
      attemptsMade = 1;
      newState = rollbackResult.newState;
      break;
    }

    case 'fallback': {
      const fallbackConfig = validated.fallback_config || {
        alternative_step: 'default_handler',
        alternative_parameters: {}
      };

      const fallbackResult = await recovery.executeFallback(
        fallbackConfig.alternative_step,
        fallbackConfig.alternative_parameters
      );

      executionLog = fallbackResult.executionLog;
      status = fallbackResult.success ? 'partial_success' : 'failure';
      attemptsMade = 1;

      if (fallbackResult.success) {
        newState = {
          ...validated.workflow_state,
          current_step: validated.workflow_state.current_step + 1,
          state_snapshot: { ...validated.workflow_state.state_snapshot, fallback: fallbackResult.result }
        };
      }
      break;
    }

    case 'skip': {
      const skipResult = await recovery.executeSkip(validated.workflow_state);
      executionLog = skipResult.executionLog;
      status = skipResult.success ? 'partial_success' : 'failure';
      attemptsMade = 1;
      newState = skipResult.newState;
      break;
    }
  }

  const completedAt = new Date().toISOString();
  const totalRecoveryTime = Date.now() - startTime;

  // Generate recommendations
  const shouldContinue = status === 'success' || status === 'partial_success';
  const nextSteps: string[] = [];
  const warnings: string[] = [];

  if (status === 'success') {
    nextSteps.push('Continue workflow from current step');
    nextSteps.push('Monitor for similar failures');
  } else if (status === 'partial_success') {
    nextSteps.push('Continue workflow with caution');
    nextSteps.push('Review fallback/skip results');
    warnings.push('Workflow may produce incomplete results');
  } else {
    nextSteps.push('Consider manual intervention');
    nextSteps.push('Review error logs for root cause');
    warnings.push('Automatic recovery failed');
    warnings.push('Additional troubleshooting required');
  }

  return {
    recovery_result: {
      status,
      strategy_used: validated.strategy,
      attempts_made: attemptsMade,
      recovered_at_step: newState.current_step
    },
    execution_log: executionLog,
    new_workflow_state: {
      current_step: newState.current_step,
      state_snapshot: newState.state_snapshot,
      can_continue: shouldContinue
    },
    recommendations: {
      should_continue: shouldContinue,
      next_steps: nextSteps,
      warnings: warnings
    },
    metadata: {
      recovery_started_at: startedAt,
      recovery_completed_at: completedAt,
      total_recovery_time_ms: totalRecoveryTime
    }
  };
}

export { inputSchema };
