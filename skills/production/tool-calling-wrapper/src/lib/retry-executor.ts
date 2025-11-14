export interface RetryConfig {
  max_attempts: number;
  backoff_strategy: 'exponential' | 'linear' | 'fixed';
  initial_delay_ms: number;
  max_delay_ms: number;
  retry_on_errors: string[];
}

export interface ExecutionAttempt {
  attempt: number;
  status: 'success' | 'failure' | 'timeout';
  error?: string;
  duration_ms: number;
  retry_delay_ms?: number;
}

export interface RetryResult {
  success: boolean;
  result: any;
  attempts_made: number;
  execution_log: ExecutionAttempt[];
  total_duration_ms: number;
  error_details?: {
    error_type: string;
    error_message: string;
    is_retryable: boolean;
    recovery_suggestion: string;
  };
}

export class RetryExecutor {
  /**
   * Execute function with retry logic
   */
  async executeWithRetry(
    fn: () => Promise<any>,
    config: RetryConfig,
    timeout_ms: number = 60000
  ): Promise<RetryResult> {
    const startTime = Date.now();
    const execution_log: ExecutionAttempt[] = [];
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.max_attempts; attempt++) {
      const attemptStart = Date.now();

      try {
        // Execute with timeout
        const result = await this.withTimeout(fn(), timeout_ms);

        const attemptEnd = Date.now();
        execution_log.push({
          attempt,
          status: 'success',
          duration_ms: attemptEnd - attemptStart,
        });

        return {
          success: true,
          result,
          attempts_made: attempt,
          execution_log,
          total_duration_ms: attemptEnd - startTime,
        };
      } catch (error: any) {
        lastError = error;
        const attemptEnd = Date.now();

        const errorType = this.classifyError(error);
        const isRetryable = this.isRetryableError(errorType, config.retry_on_errors);

        execution_log.push({
          attempt,
          status: error.message?.includes('timeout') ? 'timeout' : 'failure',
          error: error.message,
          duration_ms: attemptEnd - attemptStart,
        });

        // Don't retry if not retryable or last attempt
        if (!isRetryable || attempt === config.max_attempts) {
          break;
        }

        // Calculate delay before next retry
        const delay = this.calculateDelay(attempt, config);
        execution_log[execution_log.length - 1].retry_delay_ms = delay;

        // Wait before retry
        await this.sleep(delay);
      }
    }

    // All attempts failed
    const totalDuration = Date.now() - startTime;
    const errorType = this.classifyError(lastError!);

    return {
      success: false,
      result: null,
      attempts_made: config.max_attempts,
      execution_log,
      total_duration_ms: totalDuration,
      error_details: {
        error_type: errorType,
        error_message: lastError?.message || 'Unknown error',
        is_retryable: this.isRetryableError(errorType, config.retry_on_errors),
        recovery_suggestion: this.getRecoverySuggestion(errorType),
      },
    };
  }

  /**
   * Execute function with timeout
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeoutMs)
      ),
    ]);
  }

  /**
   * Classify error type
   */
  private classifyError(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('econnrefused') || message.includes('enotfound')) {
      return 'network';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }
    if (message.includes('rate limit') || message.includes('429')) {
      return 'rate_limit';
    }
    if (message.includes('auth') || message.includes('401') || message.includes('403')) {
      return 'auth';
    }
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return 'transient';
    }

    return 'unknown';
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(errorType: string, retryableErrors: string[]): boolean {
    return retryableErrors.includes(errorType);
  }

  /**
   * Calculate delay before next retry
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay: number;

    switch (config.backoff_strategy) {
      case 'exponential':
        delay = config.initial_delay_ms * Math.pow(2, attempt - 1);
        break;
      case 'linear':
        delay = config.initial_delay_ms * attempt;
        break;
      case 'fixed':
      default:
        delay = config.initial_delay_ms;
        break;
    }

    // Cap at max delay
    return Math.min(delay, config.max_delay_ms);
  }

  /**
   * Get recovery suggestion for error type
   */
  private getRecoverySuggestion(errorType: string): string {
    const suggestions: Record<string, string> = {
      network: 'Check network connectivity and retry',
      timeout: 'Increase timeout or optimize operation',
      rate_limit: 'Wait longer before retrying or use exponential backoff',
      auth: 'Check authentication credentials',
      transient: 'Retry with exponential backoff',
      unknown: 'Review error details and logs',
    };

    return suggestions[errorType] || suggestions.unknown;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
