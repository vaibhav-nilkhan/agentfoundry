import { v4 as uuidv4 } from 'uuid';

export interface RetryConfig {
  max_retries: number;
  exponential_backoff: boolean;
  backoff_base: number;
}

export interface AgentConfig {
  type: 'langchain' | 'llamaindex' | 'crewai' | 'custom';
  config: any;
}

export interface WrappedAgent {
  id: string;
  type: string;
  config: any;
  retry_config: RetryConfig;
  checkpoint_enabled: boolean;
  created_at: Date;
  execution_history: ExecutionRecord[];
}

export interface ExecutionRecord {
  id: string;
  timestamp: Date;
  success: boolean;
  retries: number;
  error?: string;
  duration_ms: number;
  checkpoint_saved: boolean;
}

export interface ReliabilityScore {
  score: number; // 0-100
  success_rate: number;
  average_retries: number;
  total_executions: number;
  failed_executions: number;
  average_duration_ms: number;
  time_window: string;
}

export interface TaskChunk {
  id: string;
  sequence: number;
  description: string;
  steps: string[];
  dependencies: string[];
}

export class ReliabilityManager {
  private agents: Map<string, WrappedAgent> = new Map();
  private checkpoints: Map<string, any> = new Map();

  /**
   * Wraps an agent with reliability features
   */
  wrapAgent(
    agent_type: string,
    agent_config: any,
    retry_config: RetryConfig = {
      max_retries: 3,
      exponential_backoff: true,
      backoff_base: 2,
    },
    checkpoint_enabled: boolean = true
  ): WrappedAgent {
    const agent: WrappedAgent = {
      id: uuidv4(),
      type: agent_type,
      config: agent_config,
      retry_config,
      checkpoint_enabled,
      created_at: new Date(),
      execution_history: [],
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  /**
   * Executes agent task with retry logic and exponential backoff
   */
  async executeWithRetry(
    agent_id: string,
    task: { input: string; context?: any },
    retry_on_error_types: string[] = ['all'],
    continue_from_checkpoint: boolean = true
  ): Promise<{
    success: boolean;
    result?: any;
    error?: string;
    retries: number;
    duration_ms: number;
  }> {
    const agent = this.agents.get(agent_id);
    if (!agent) {
      throw new Error(`Agent with ID ${agent_id} not found`);
    }

    const execution_id = uuidv4();
    const start_time = Date.now();
    let retries = 0;
    let last_error: string | undefined;

    // Check for checkpoint if continuing
    let checkpoint_data = null;
    if (continue_from_checkpoint && agent.checkpoint_enabled) {
      checkpoint_data = this.checkpoints.get(`${agent_id}:last`);
    }

    // Retry loop
    while (retries <= agent.retry_config.max_retries) {
      try {
        // Simulate agent execution (in real impl, call actual agent)
        const result = await this.simulateAgentExecution(
          agent,
          task,
          checkpoint_data
        );

        // Save checkpoint on success
        if (agent.checkpoint_enabled) {
          this.saveCheckpoint(agent_id, {
            execution_id,
            task,
            result,
            timestamp: new Date(),
          });
        }

        // Record successful execution
        const duration_ms = Date.now() - start_time;
        this.recordExecution(agent_id, {
          id: execution_id,
          timestamp: new Date(),
          success: true,
          retries,
          duration_ms,
          checkpoint_saved: agent.checkpoint_enabled,
        });

        return {
          success: true,
          result,
          retries,
          duration_ms,
        };
      } catch (error: any) {
        last_error = error.message;
        retries++;

        // Check if we should retry this error type
        const should_retry = this.shouldRetryError(
          error,
          retry_on_error_types
        );

        if (!should_retry || retries > agent.retry_config.max_retries) {
          break;
        }

        // Wait with exponential backoff before retry
        if (agent.retry_config.exponential_backoff && retries <= agent.retry_config.max_retries) {
          const delay = Math.pow(agent.retry_config.backoff_base, retries) * 1000;
          await this.sleep(delay);
        }
      }
    }

    // Record failed execution
    const duration_ms = Date.now() - start_time;
    this.recordExecution(agent_id, {
      id: execution_id,
      timestamp: new Date(),
      success: false,
      retries,
      error: last_error,
      duration_ms,
      checkpoint_saved: false,
    });

    return {
      success: false,
      error: last_error,
      retries,
      duration_ms,
    };
  }

  /**
   * Gets reliability score for agent
   */
  getReliabilityScore(
    agent_id: string,
    time_window: string = 'last_day'
  ): ReliabilityScore {
    const agent = this.agents.get(agent_id);
    if (!agent) {
      throw new Error(`Agent with ID ${agent_id} not found`);
    }

    // Filter executions by time window
    const filtered_history = this.filterExecutionsByTimeWindow(
      agent.execution_history,
      time_window
    );

    if (filtered_history.length === 0) {
      return {
        score: 0,
        success_rate: 0,
        average_retries: 0,
        total_executions: 0,
        failed_executions: 0,
        average_duration_ms: 0,
        time_window,
      };
    }

    const total_executions = filtered_history.length;
    const successful_executions = filtered_history.filter((e) => e.success).length;
    const failed_executions = total_executions - successful_executions;
    const success_rate = successful_executions / total_executions;

    const total_retries = filtered_history.reduce((sum, e) => sum + e.retries, 0);
    const average_retries = total_retries / total_executions;

    const total_duration = filtered_history.reduce(
      (sum, e) => sum + e.duration_ms,
      0
    );
    const average_duration_ms = total_duration / total_executions;

    // Calculate score (0-100)
    // Factors: success rate (70%), low retries (20%), fast execution (10%)
    const success_score = success_rate * 70;
    const retry_score = Math.max(0, (1 - average_retries / 3) * 20); // Penalize if avg > 3 retries
    const speed_score = Math.max(0, (1 - Math.min(average_duration_ms / 10000, 1)) * 10); // Penalize if > 10s

    const score = Math.round(success_score + retry_score + speed_score);

    return {
      score,
      success_rate,
      average_retries,
      total_executions,
      failed_executions,
      average_duration_ms,
      time_window,
    };
  }

  /**
   * Decomposes complex task into smaller chunks
   */
  decomposeTask(
    task_description: string,
    max_chunk_steps: number = 4,
    dependency_aware: boolean = true
  ): TaskChunk[] {
    // Simple heuristic-based decomposition
    // In real impl, could use LLM to intelligently break down tasks

    // Split by common task delimiters
    const steps = this.extractSteps(task_description);

    const chunks: TaskChunk[] = [];
    let chunk_id = 0;

    for (let i = 0; i < steps.length; i += max_chunk_steps) {
      const chunk_steps = steps.slice(i, i + max_chunk_steps);
      const dependencies = chunk_id > 0 ? [chunks[chunk_id - 1].id] : [];

      chunks.push({
        id: `chunk_${chunk_id}`,
        sequence: chunk_id,
        description: `Steps ${i + 1}-${Math.min(i + max_chunk_steps, steps.length)}`,
        steps: chunk_steps,
        dependencies,
      });

      chunk_id++;
    }

    return chunks;
  }

  // Private helper methods

  private async simulateAgentExecution(
    agent: WrappedAgent,
    task: any,
    checkpoint_data: any
  ): Promise<any> {
    // Simulate agent work (in real impl, call actual agent API)
    // Random failure to demonstrate retry logic
    if (Math.random() < 0.2) {
      throw new Error('Simulated agent failure');
    }

    return {
      status: 'completed',
      result: `Task completed: ${task.input}`,
      resumed_from_checkpoint: !!checkpoint_data,
    };
  }

  private shouldRetryError(error: any, retry_on_error_types: string[]): boolean {
    if (retry_on_error_types.includes('all')) {
      return true;
    }

    const error_type = this.classifyError(error);
    return retry_on_error_types.includes(error_type);
  }

  private classifyError(error: any): string {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('timeout')) return 'timeout';
    if (message.includes('rate limit')) return 'rate_limit';
    if (message.includes('api')) return 'api_error';
    if (message.includes('validation')) return 'validation_error';

    return 'unknown';
  }

  private saveCheckpoint(agent_id: string, checkpoint: any): void {
    this.checkpoints.set(`${agent_id}:last`, checkpoint);
    this.checkpoints.set(`${agent_id}:${checkpoint.execution_id}`, checkpoint);
  }

  private recordExecution(agent_id: string, record: ExecutionRecord): void {
    const agent = this.agents.get(agent_id);
    if (agent) {
      agent.execution_history.push(record);

      // Keep only last 1000 executions per agent
      if (agent.execution_history.length > 1000) {
        agent.execution_history.shift();
      }
    }
  }

  private filterExecutionsByTimeWindow(
    history: ExecutionRecord[],
    time_window: string
  ): ExecutionRecord[] {
    const now = Date.now();
    let cutoff_ms = 0;

    switch (time_window) {
      case 'last_hour':
        cutoff_ms = 60 * 60 * 1000;
        break;
      case 'last_day':
        cutoff_ms = 24 * 60 * 60 * 1000;
        break;
      case 'last_week':
        cutoff_ms = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'last_month':
        cutoff_ms = 30 * 24 * 60 * 60 * 1000;
        break;
      case 'all_time':
        return history;
      default:
        cutoff_ms = 24 * 60 * 60 * 1000; // Default to last day
    }

    const cutoff_time = new Date(now - cutoff_ms);
    return history.filter((record) => record.timestamp >= cutoff_time);
  }

  private extractSteps(task_description: string): string[] {
    // Simple step extraction using common patterns
    const lines = task_description.split('\n');
    const steps: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0) continue;

      // Match numbered lists, bullets, or action verbs
      if (
        /^\d+[.)]/.test(trimmed) ||
        /^[-*•]/.test(trimmed) ||
        /^(then|next|after|finally)/i.test(trimmed)
      ) {
        steps.push(trimmed.replace(/^\d+[.)]\s*|^[-*•]\s*/,''));
      } else if (steps.length === 0 || trimmed.length > 20) {
        // Treat as step if it's the first line or reasonably long
        steps.push(trimmed);
      }
    }

    // If no structured steps found, split by sentences
    if (steps.length === 0) {
      const sentences = task_description.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      return sentences.map((s) => s.trim());
    }

    return steps;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
