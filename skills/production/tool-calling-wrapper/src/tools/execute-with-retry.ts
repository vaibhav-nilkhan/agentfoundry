import { RetryExecutor, RetryConfig } from '../lib/retry-executor';
import { SchemaValidator } from '../lib/schema-validator';

interface ExecuteWithRetryInput {
  tool_name: string;
  tool_input: any;
  executor: {
    framework: string;
    tool_function: string;
  };
  retry_config?: Partial<RetryConfig>;
  validation?: {
    validate_input?: boolean;
    validate_output?: boolean;
    input_schema?: any;
    output_schema?: any;
  };
  timeout_ms?: number;
}

export async function run(input: ExecuteWithRetryInput): Promise<any> {
  const retryExecutor = new RetryExecutor();
  const validator = new SchemaValidator();

  // Default retry config
  const retryConfig: RetryConfig = {
    max_attempts: input.retry_config?.max_attempts || 3,
    backoff_strategy: input.retry_config?.backoff_strategy || 'exponential',
    initial_delay_ms: input.retry_config?.initial_delay_ms || 1000,
    max_delay_ms: input.retry_config?.max_delay_ms || 30000,
    retry_on_errors: input.retry_config?.retry_on_errors || ['network', 'timeout', 'rate_limit', 'transient'],
  };

  // Validate input if requested
  if (input.validation?.validate_input && input.validation?.input_schema) {
    const inputValidation = validator.validateJsonSchema(input.tool_input, input.validation.input_schema);
    if (!inputValidation.is_valid) {
      return {
        success: false,
        result: null,
        attempts_made: 0,
        execution_log: [],
        total_duration_ms: 0,
        error_details: {
          error_type: 'validation',
          error_message: 'Input validation failed',
          is_retryable: false,
          recovery_suggestion: 'Fix input validation errors',
        },
      };
    }
  }

  // Mock tool execution function (in production, this would call the actual tool)
  const toolExecutionFn = async () => {
    // This would be replaced with actual tool execution logic
    // based on the framework and tool_function specified
    return {
      success: true,
      data: `Executed ${input.tool_name} successfully`,
    };
  };

  // Execute with retry
  const result = await retryExecutor.executeWithRetry(
    toolExecutionFn,
    retryConfig,
    input.timeout_ms || 60000
  );

  // Validate output if requested and execution succeeded
  if (result.success && input.validation?.validate_output && input.validation?.output_schema) {
    const outputValidation = validator.validateJsonSchema(result.result, input.validation.output_schema);
    if (!outputValidation.is_valid) {
      return {
        ...result,
        success: false,
        error_details: {
          error_type: 'validation',
          error_message: 'Output validation failed',
          is_retryable: false,
          recovery_suggestion: 'Review tool output schema',
        },
      };
    }
  }

  return result;
}
