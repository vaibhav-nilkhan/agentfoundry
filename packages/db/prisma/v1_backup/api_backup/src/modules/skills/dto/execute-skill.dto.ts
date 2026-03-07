import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ExecuteSkillDto {
  @ApiProperty({
    description: 'Input data for the skill tool (validated against tool schema)',
    example: {
      error_message: 'ECONNREFUSED: Connection refused',
      step_number: 5,
      workflow_context: {
        total_steps: 10,
        completed_steps: 4,
        previous_step: 'fetch_data',
        next_step: 'process_data',
      },
    },
  })
  @IsObject()
  input: Record<string, any>;

  @ApiProperty({
    description: 'Execution timeout in milliseconds (default: 30000, max: 120000)',
    required: false,
    minimum: 1000,
    maximum: 120000,
    default: 30000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(120000)
  timeout?: number;
}

export class BatchExecuteSkillDto {
  @ApiProperty({
    description: 'Array of tool executions to run sequentially',
    example: [
      {
        skillSlug: 'error-recovery-orchestrator',
        toolName: 'detect_failure',
        input: {
          error_message: 'Connection timeout',
          step_number: 3,
        },
      },
      {
        skillSlug: 'error-recovery-orchestrator',
        toolName: 'execute_recovery',
        input: {
          strategy: 'retry',
          workflow_state: {},
        },
      },
    ],
  })
  @IsObject({ each: true })
  executions: Array<{
    skillSlug: string;
    toolName: string;
    input: Record<string, any>;
  }>;

  @ApiProperty({
    description: 'Execution timeout per tool in milliseconds',
    required: false,
    default: 30000,
  })
  @IsOptional()
  @IsNumber()
  timeout?: number;
}
