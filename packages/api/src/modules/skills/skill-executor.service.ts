import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { SkillRegistryService } from './skill-registry.service';

/**
 * Execution result
 */
export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata: {
    skill_slug: string;
    tool_name: string;
    execution_time_ms: number;
    executed_at: string;
  };
}

/**
 * Execution options
 */
interface ExecutionOptions {
  timeout?: number; // milliseconds (default: 30000)
  userId?: string; // optional user ID for tracking
  trackUsage?: boolean; // whether to log to SkillUsage table
}

@Injectable()
export class SkillExecutorService {
  private readonly logger = new Logger(SkillExecutorService.name);
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  constructor(
    private readonly registry: SkillRegistryService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Execute a skill tool with the given input
   */
  async execute(
    skillSlug: string,
    toolName: string,
    input: any,
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const timeout = options.timeout || this.DEFAULT_TIMEOUT;
    const trackUsage = options.trackUsage !== false; // default true

    try {
      // Get tool from registry
      const tool = this.registry.getTool(skillSlug, toolName);

      this.logger.log(
        `Executing tool: ${skillSlug}/${toolName} (timeout: ${timeout}ms)`
      );

      // Dynamically import the tool module
      const toolModule = await import(tool.modulePath);

      // Validate tool exports
      if (!toolModule.run || typeof toolModule.run !== 'function') {
        throw new InternalServerErrorException(
          `Tool ${toolName} does not export a 'run' function`
        );
      }

      if (!toolModule.inputSchema) {
        this.logger.warn(`Tool ${toolName} does not export inputSchema`);
      }

      // Validate input against Zod schema if available
      if (toolModule.inputSchema) {
        try {
          toolModule.inputSchema.parse(input);
        } catch (error: any) {
          throw new BadRequestException({
            message: 'Input validation failed',
            errors: error.errors || error.message,
          });
        }
      }

      // Execute with timeout
      const result = await this.executeWithTimeout(
        toolModule.run,
        input,
        timeout
      );

      const executionTimeMs = Date.now() - startTime;

      // Track usage if enabled
      if (trackUsage) {
        await this.trackExecution(
          skillSlug,
          toolName,
          options.userId,
          true,
          executionTimeMs
        );
      }

      return {
        success: true,
        data: result,
        metadata: {
          skill_slug: skillSlug,
          tool_name: toolName,
          execution_time_ms: executionTimeMs,
          executed_at: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      const executionTimeMs = Date.now() - startTime;

      // Track failed execution
      if (trackUsage) {
        await this.trackExecution(
          skillSlug,
          toolName,
          options.userId,
          false,
          executionTimeMs,
          error?.message || 'Unknown error'
        );
      }

      // Handle different error types
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error?.name === 'TimeoutError') {
        throw new RequestTimeoutException(
          `Execution timed out after ${timeout}ms`
        );
      }

      this.logger.error(
        `Execution failed for ${skillSlug}/${toolName}:`,
        error
      );

      return {
        success: false,
        error: {
          message: error?.message || 'Execution failed',
          code: error?.code || 'EXECUTION_ERROR',
          details: error?.stack,
        },
        metadata: {
          skill_slug: skillSlug,
          tool_name: toolName,
          execution_time_ms: executionTimeMs,
          executed_at: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Execute a function with timeout protection
   */
  private async executeWithTimeout<T>(
    fn: (input: any) => Promise<T>,
    input: any,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Create timeout
      const timer = setTimeout(() => {
        const error = new Error('Execution timeout');
        error.name = 'TimeoutError';
        reject(error);
      }, timeoutMs);

      // Execute function
      fn(input)
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Track execution in database
   */
  private async trackExecution(
    skillSlug: string,
    _toolName: string,
    userId: string | undefined,
    success: boolean,
    executionTimeMs: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      // Find skill in database
      const skill = await this.prisma.skill.findUnique({
        where: { slug: skillSlug },
      });

      if (!skill) {
        this.logger.warn(
          `Skill ${skillSlug} not found in database, skipping usage tracking`
        );
        return;
      }

      // Create usage record
      await this.prisma.skillUsage.create({
        data: {
          skillId: skill.id,
          userId: userId || null,
          platform: 'MCP', // Default platform
          success,
          executionTime: executionTimeMs,
          errorMessage: errorMessage || null,
        },
      });

      // Increment download count (we track all executions as "usage")
      if (success) {
        await this.prisma.skill.update({
          where: { id: skill.id },
          data: {
            downloads: {
              increment: 1,
            },
          },
        });
      }
    } catch (error) {
      // Don't fail the request if tracking fails
      this.logger.error('Failed to track execution:', error);
    }
  }

  /**
   * Batch execute multiple tools (useful for workflows)
   */
  async executeBatch(
    executions: Array<{
      skillSlug: string;
      toolName: string;
      input: any;
    }>,
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    for (const execution of executions) {
      const result = await this.execute(
        execution.skillSlug,
        execution.toolName,
        execution.input,
        options
      );
      results.push(result);

      // If one fails, optionally stop (can be made configurable)
      if (!result.success && options.trackUsage !== false) {
        this.logger.warn(
          `Batch execution stopped at ${execution.skillSlug}/${execution.toolName} due to failure`
        );
        break;
      }
    }

    return results;
  }

  /**
   * Get execution statistics for a skill
   */
  async getSkillStats(skillSlug: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { slug: skillSlug },
      include: {
        usage: {
          take: 100,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!skill) {
      return null;
    }

    const totalExecutions = skill.usage.length;
    const successfulExecutions = skill.usage.filter((u) => u.success).length;
    const avgExecutionTime =
      skill.usage.reduce((sum, u) => sum + (u.executionTime || 0), 0) /
        totalExecutions || 0;

    return {
      total_executions: totalExecutions,
      successful_executions: successfulExecutions,
      failed_executions: totalExecutions - successfulExecutions,
      success_rate: totalExecutions > 0 ? successfulExecutions / totalExecutions : 0,
      avg_execution_time_ms: Math.round(avgExecutionTime),
      recent_executions: skill.usage.slice(0, 10).map((u) => ({
        success: u.success,
        execution_time_ms: u.executionTime,
        executed_at: u.createdAt,
        error: u.errorMessage,
      })),
    };
  }
}
