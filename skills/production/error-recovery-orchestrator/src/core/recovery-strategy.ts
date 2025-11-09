export interface RetryConfig {
  max_attempts: number;
  backoff_strategy: 'linear' | 'exponential' | 'fixed';
  initial_delay_ms: number;
  max_delay_ms: number;
}

export interface WorkflowState {
  current_step: number;
  total_steps: number;
  state_snapshot?: any;
  failed_step_id: string;
}

export interface RecoveryResult {
  status: 'success' | 'partial_success' | 'failure';
  strategy_used: string;
  attempts_made: number;
  recovered_at_step: number;
}

export interface ExecutionAttempt {
  attempt: number;
  strategy: string;
  status: string;
  duration_ms: number;
  error?: string;
}

export class RecoveryStrategy {

  async executeRetry(
    config: RetryConfig,
    failedOperation: () => Promise<any>
  ): Promise<{ success: boolean; attempts: number; executionLog: ExecutionAttempt[] }> {
    const executionLog: ExecutionAttempt[] = [];
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.max_attempts; attempt++) {
      const startTime = Date.now();

      try {
        // Execute the failed operation
        const result = await failedOperation();

        const duration = Date.now() - startTime;
        executionLog.push({
          attempt,
          strategy: 'retry',
          status: 'success',
          duration_ms: duration
        });

        return { success: true, attempts: attempt, executionLog };
      } catch (error) {
        lastError = error as Error;
        const duration = Date.now() - startTime;

        executionLog.push({
          attempt,
          strategy: 'retry',
          status: 'failure',
          duration_ms: duration,
          error: lastError.message
        });

        // Don't wait after last attempt
        if (attempt < config.max_attempts) {
          const delay = this.calculateBackoffDelay(
            attempt,
            config.backoff_strategy,
            config.initial_delay_ms,
            config.max_delay_ms
          );
          await this.sleep(delay);
        }
      }
    }

    return { success: false, attempts: config.max_attempts, executionLog };
  }

  private calculateBackoffDelay(
    attempt: number,
    strategy: 'linear' | 'exponential' | 'fixed',
    initialDelay: number,
    maxDelay: number
  ): number {
    let delay: number;

    switch (strategy) {
      case 'fixed':
        delay = initialDelay;
        break;
      case 'linear':
        delay = initialDelay * attempt;
        break;
      case 'exponential':
        delay = initialDelay * Math.pow(2, attempt - 1);
        break;
      default:
        delay = initialDelay;
    }

    // Add jitter (±20%) to prevent thundering herd
    const jitter = delay * (0.8 + Math.random() * 0.4);

    return Math.min(jitter, maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async executeRollback(
    workflowState: WorkflowState,
    targetStep: number,
    cleanupActions: string[]
  ): Promise<{ success: boolean; newState: WorkflowState; executionLog: ExecutionAttempt[] }> {
    const executionLog: ExecutionAttempt[] = [];
    const startTime = Date.now();

    try {
      // Simulate cleanup actions
      for (const action of cleanupActions) {
        console.log(`Executing cleanup action: ${action}`);
        // In real implementation, execute actual cleanup
      }

      const newState: WorkflowState = {
        current_step: targetStep,
        total_steps: workflowState.total_steps,
        state_snapshot: { ...workflowState.state_snapshot, rolledBack: true },
        failed_step_id: workflowState.failed_step_id
      };

      const duration = Date.now() - startTime;
      executionLog.push({
        attempt: 1,
        strategy: 'rollback',
        status: 'success',
        duration_ms: duration
      });

      return { success: true, newState, executionLog };
    } catch (error) {
      const duration = Date.now() - startTime;
      executionLog.push({
        attempt: 1,
        strategy: 'rollback',
        status: 'failure',
        duration_ms: duration,
        error: (error as Error).message
      });

      return { success: false, newState: workflowState, executionLog };
    }
  }

  async executeFallback(
    alternativeStep: string,
    alternativeParameters: any
  ): Promise<{ success: boolean; result: any; executionLog: ExecutionAttempt[] }> {
    const executionLog: ExecutionAttempt[] = [];
    const startTime = Date.now();

    try {
      // Simulate fallback execution
      console.log(`Executing fallback: ${alternativeStep}`);
      const result = {
        fallback_executed: true,
        step: alternativeStep,
        parameters: alternativeParameters,
        timestamp: new Date().toISOString()
      };

      const duration = Date.now() - startTime;
      executionLog.push({
        attempt: 1,
        strategy: 'fallback',
        status: 'success',
        duration_ms: duration
      });

      return { success: true, result, executionLog };
    } catch (error) {
      const duration = Date.now() - startTime;
      executionLog.push({
        attempt: 1,
        strategy: 'fallback',
        status: 'failure',
        duration_ms: duration,
        error: (error as Error).message
      });

      return { success: false, result: null, executionLog };
    }
  }

  async executeSkip(
    workflowState: WorkflowState
  ): Promise<{ success: boolean; newState: WorkflowState; executionLog: ExecutionAttempt[] }> {
    const executionLog: ExecutionAttempt[] = [];
    const startTime = Date.now();

    try {
      const newState: WorkflowState = {
        current_step: workflowState.current_step + 1,
        total_steps: workflowState.total_steps,
        state_snapshot: { ...workflowState.state_snapshot, skipped: true },
        failed_step_id: workflowState.failed_step_id
      };

      const duration = Date.now() - startTime;
      executionLog.push({
        attempt: 1,
        strategy: 'skip',
        status: 'success',
        duration_ms: duration
      });

      return { success: true, newState, executionLog };
    } catch (error) {
      const duration = Date.now() - startTime;
      executionLog.push({
        attempt: 1,
        strategy: 'skip',
        status: 'failure',
        duration_ms: duration,
        error: (error as Error).message
      });

      return { success: false, newState: workflowState, executionLog };
    }
  }
}
