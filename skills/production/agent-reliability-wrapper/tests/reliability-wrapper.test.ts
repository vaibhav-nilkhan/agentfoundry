import { run as wrapAgent } from '../src/tools/wrap-agent';
import { run as executeWithRetry } from '../src/tools/execute-with-retry';
import { run as getReliabilityScore } from '../src/tools/get-reliability-score';
import { run as decomposeTask } from '../src/tools/decompose-task';

describe('Agent Reliability Wrapper', () => {
  describe('wrap_agent', () => {
    it('should wrap an agent with default config', async () => {
      const result = await wrapAgent({
        agent_type: 'langchain',
        agent_config: {
          model: 'gpt-4',
          temperature: 0.7,
        },
      });

      expect(result.success).toBe(true);
      expect(result.wrapped_agent_id).toBeDefined();
      expect(result.agent_type).toBe('langchain');
      expect(result.retry_config.max_retries).toBe(3);
      expect(result.checkpoint_enabled).toBe(true);
    });

    it('should wrap an agent with custom retry config', async () => {
      const result = await wrapAgent({
        agent_type: 'llamaindex',
        agent_config: {},
        retry_config: {
          max_retries: 5,
          exponential_backoff: false,
          backoff_base: 3,
        },
      });

      expect(result.success).toBe(true);
      expect(result.retry_config.max_retries).toBe(5);
      expect(result.retry_config.exponential_backoff).toBe(false);
    });

    it('should reject invalid agent type', async () => {
      await expect(
        wrapAgent({
          agent_type: 'invalid' as any,
          agent_config: {},
        })
      ).rejects.toThrow();
    });
  });

  describe('execute_with_retry', () => {
    it('should execute task successfully', async () => {
      // First wrap an agent
      const wrapResult = await wrapAgent({
        agent_type: 'custom',
        agent_config: {},
      });

      // Then execute a task
      const result = await executeWithRetry({
        wrapped_agent_id: wrapResult.wrapped_agent_id,
        task: {
          input: 'Test task: analyze this data',
          context: { dataset: 'sample' },
        },
      });

      expect(result.success).toBe(true);
      expect(result.execution_stats).toBeDefined();
      expect(result.execution_stats.duration_ms).toBeGreaterThan(0);
    });

    it('should handle failures and retry', async () => {
      const wrapResult = await wrapAgent({
        agent_type: 'custom',
        agent_config: {},
        retry_config: {
          max_retries: 2,
          exponential_backoff: true,
          backoff_base: 2,
        },
      });

      const result = await executeWithRetry({
        wrapped_agent_id: wrapResult.wrapped_agent_id,
        task: {
          input: 'Test task that might fail',
        },
      });

      // Should succeed or fail after retries
      expect(result).toHaveProperty('success');
      expect(result.execution_stats).toBeDefined();
      expect(result.execution_stats.retries).toBeLessThanOrEqual(2);
    });

    it('should reject invalid agent ID', async () => {
      const result = await executeWithRetry({
        wrapped_agent_id: '00000000-0000-0000-0000-000000000000',
        task: {
          input: 'Test',
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('get_reliability_score', () => {
    it('should return reliability score for agent', async () => {
      // Wrap agent
      const wrapResult = await wrapAgent({
        agent_type: 'custom',
        agent_config: {},
      });

      // Execute some tasks to build history
      await executeWithRetry({
        wrapped_agent_id: wrapResult.wrapped_agent_id,
        task: { input: 'Task 1' },
      });

      await executeWithRetry({
        wrapped_agent_id: wrapResult.wrapped_agent_id,
        task: { input: 'Task 2' },
      });

      // Get score
      const result = await getReliabilityScore({
        wrapped_agent_id: wrapResult.wrapped_agent_id,
        time_window: 'all_time',
      });

      expect(result.success).toBe(true);
      expect(result.reliability_score).toBeGreaterThanOrEqual(0);
      expect(result.reliability_score).toBeLessThanOrEqual(100);
      expect(result.metrics.total_executions).toBeGreaterThan(0);
      expect(result.interpretation).toBeDefined();
    });

    it('should handle different time windows', async () => {
      const wrapResult = await wrapAgent({
        agent_type: 'custom',
        agent_config: {},
      });

      const result = await getReliabilityScore({
        wrapped_agent_id: wrapResult.wrapped_agent_id,
        time_window: 'last_hour',
      });

      expect(result.success).toBe(true);
      expect(result.time_window).toBe('last_hour');
    });
  });

  describe('decompose_task', () => {
    it('should decompose simple numbered task', async () => {
      const task = `
1. First do this
2. Then do that
3. Finally do this other thing
4. And complete with this
      `;

      const result = await decomposeTask({
        task_description: task,
        max_chunk_steps: 2,
      });

      expect(result.success).toBe(true);
      expect(result.task_chunks).toHaveLength(2);
      expect(result.analysis.original_steps).toBe(4);
      expect(result.analysis.chunks_created).toBe(2);
    });

    it('should decompose complex multi-step task', async () => {
      const task = `
Given a complex data analysis task, please:
1. Load the dataset from CSV
2. Clean and normalize the data
3. Perform exploratory data analysis
4. Build a statistical model
5. Validate the model
6. Generate visualizations
7. Create a summary report
8. Export results to PDF
      `;

      const result = await decomposeTask({
        task_description: task,
        max_chunk_steps: 4,
      });

      expect(result.success).toBe(true);
      expect(result.task_chunks).toHaveLength(2); // 8 steps / 4 per chunk
      expect(result.analysis.reliability_improvement).toBeDefined();

      // Check that chunks have dependencies
      if (result.task_chunks.length > 1) {
        expect(result.task_chunks[1].dependencies).toContain('chunk_0');
      }
    });

    it('should calculate reliability improvement', async () => {
      const task = 'Step 1\nStep 2\nStep 3\nStep 4\nStep 5\nStep 6\nStep 7\nStep 8';

      const result = await decomposeTask({
        task_description: task,
        max_chunk_steps: 4,
      });

      expect(result.success).toBe(true);
      expect(result.analysis.reliability_improvement.before).toBeDefined();
      expect(result.analysis.reliability_improvement.after_chunking).toBeDefined();
      expect(result.analysis.reliability_improvement.with_retry).toBeDefined();

      // Parse percentages and verify improvement
      const before = parseFloat(result.analysis.reliability_improvement.before);
      const after = parseFloat(result.analysis.reliability_improvement.with_retry);
      expect(after).toBeGreaterThan(before);
    });
  });
});
