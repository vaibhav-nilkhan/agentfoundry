import { describe, it, expect } from '@jest/globals';
import { run as estimateCost } from '../src/tools/estimate-cost';
import { run as suggestCheaper } from '../src/tools/suggest-cheaper';
import { run as setBudgetLimit, trackSpending } from '../src/tools/set-budget-limit';
import { run as trackCosts, addCostEntry } from '../src/tools/track-costs';

describe('Cost Predictor & Optimizer - Estimate Cost', () => {
  it('should estimate cost for GPT-4 with basic prompt', async () => {
    const result = await estimateCost({
      prompt: 'Analyze this customer feedback and provide sentiment analysis.',
      model: 'gpt-4',
      expected_output_length: 500,
      tools_count: 0,
      include_overhead: true,
    });

    expect(result.estimated_cost).toBeGreaterThan(0);
    expect(result.breakdown.input_tokens).toBeGreaterThan(0);
    expect(result.breakdown.output_tokens).toBe(500);
    expect(result.breakdown.tool_overhead_tokens).toBe(0);
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('should estimate cost for Claude-3-5-Sonnet with tools', async () => {
    const result = await estimateCost({
      prompt: 'Research and summarize recent AI developments.',
      model: 'claude-3-5-sonnet',
      expected_output_length: 1000,
      tools_count: 15,
      include_overhead: true,
    });

    expect(result.estimated_cost).toBeGreaterThan(0);
    expect(result.breakdown.tool_overhead_tokens).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('should estimate cost for GPT-4o-mini (cheap model)', async () => {
    const result = await estimateCost({
      prompt: 'Simple classification task',
      model: 'gpt-4o-mini',
      expected_output_length: 100,
      tools_count: 0,
      include_overhead: false,
    });

    expect(result.estimated_cost).toBeLessThan(0.001); // Very cheap
    expect(result.breakdown.tool_overhead_tokens).toBe(0);
  });

  it('should warn for high cost estimates', async () => {
    const result = await estimateCost({
      prompt: 'Extremely long prompt with lots of context... '.repeat(1000),
      model: 'gpt-4',
      expected_output_length: 5000,
      tools_count: 50,
      include_overhead: true,
    });

    expect(result.warnings).toBeDefined();
    expect(result.warnings!.length).toBeGreaterThan(0);
    expect(result.warnings!.some(w => w.includes('High estimated cost'))).toBe(true);
  });

  it('should handle unknown models with default pricing', async () => {
    const result = await estimateCost({
      prompt: 'Test prompt',
      model: 'unknown-model-xyz',
      expected_output_length: 500,
    });

    expect(result.estimated_cost).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThan(0.7); // Lower confidence for unknown model
    expect(result.warnings).toBeDefined();
    expect(result.warnings!.some(w => w.includes('Unknown model'))).toBe(true);
  });

  it('should include tool overhead when specified', async () => {
    const withoutTools = await estimateCost({
      prompt: 'Test prompt',
      model: 'gpt-4-turbo',
      expected_output_length: 500,
      tools_count: 0,
      include_overhead: true,
    });

    const withTools = await estimateCost({
      prompt: 'Test prompt',
      model: 'gpt-4-turbo',
      expected_output_length: 500,
      tools_count: 20,
      include_overhead: true,
    });

    expect(withTools.breakdown.tool_overhead_tokens).toBeGreaterThan(0);
    expect(withTools.breakdown.input_tokens).toBeGreaterThan(withoutTools.breakdown.input_tokens);
    expect(withTools.estimated_cost).toBeGreaterThan(withoutTools.estimated_cost);
  });

  it('should calculate accurate cost breakdown', async () => {
    const result = await estimateCost({
      prompt: 'Calculate this',
      model: 'claude-3-haiku',
      expected_output_length: 250,
      tools_count: 5,
      include_overhead: true,
    });

    const totalCost = result.breakdown.input_cost + result.breakdown.output_cost;
    expect(Math.abs(result.estimated_cost - totalCost)).toBeLessThan(0.00001);
  });
});

describe('Cost Predictor & Optimizer - Suggest Cheaper', () => {
  it('should suggest cheaper alternatives for GPT-4', async () => {
    const result = await suggestCheaper({
      current_model: 'gpt-4',
      task_requirements: {
        complexity: 'simple',
        quality_threshold: 0.75,
      },
      current_cost: 0.045,
    });

    expect(result.alternatives.length).toBeGreaterThan(0);
    expect(result.alternatives[0].savings_percent).toBeGreaterThan(0);
    expect(result.current_model_analysis.overprovisioned).toBe(true);
  });

  it('should respect quality threshold', async () => {
    const result = await suggestCheaper({
      current_model: 'gpt-4',
      task_requirements: {
        complexity: 'complex',
        quality_threshold: 0.95,
      },
    });

    // Should only suggest high-quality alternatives
    result.alternatives.forEach(alt => {
      expect(alt.quality_score).toBeGreaterThanOrEqual(0.95);
    });
  });

  it('should recommend GPT-4o-mini for simple tasks', async () => {
    const result = await suggestCheaper({
      current_model: 'gpt-4',
      task_requirements: {
        complexity: 'simple',
        quality_threshold: 0.80,
      },
    });

    expect(result.alternatives.some(alt => alt.model === 'gpt-4o-mini')).toBe(true);
    expect(result.recommendation).toContain('savings');
  });

  it('should indicate when current model is optimal', async () => {
    const result = await suggestCheaper({
      current_model: 'gpt-4o-mini',
      task_requirements: {
        complexity: 'simple',
        quality_threshold: 0.80,
      },
    });

    expect(result.current_model_analysis.is_optimal).toBe(true);
    expect(result.alternatives.length).toBe(0);
  });

  it('should provide trade-off analysis', async () => {
    const result = await suggestCheaper({
      current_model: 'gpt-4',
      task_requirements: {
        complexity: 'moderate',
        quality_threshold: 0.85,
      },
    });

    expect(result.alternatives.length).toBeGreaterThan(0);
    result.alternatives.forEach(alt => {
      expect(alt.trade_offs).toBeDefined();
      expect(alt.trade_offs.length).toBeGreaterThan(0);
    });
  });

  it('should suggest Claude alternatives for Claude models', async () => {
    const result = await suggestCheaper({
      current_model: 'claude-3-opus',
      task_requirements: {
        complexity: 'moderate',
        quality_threshold: 0.85,
      },
    });

    expect(result.alternatives.some(alt => alt.model.includes('claude'))).toBe(true);
  });

  it('should calculate accurate savings percentages', async () => {
    const result = await suggestCheaper({
      current_model: 'gpt-4',
      task_requirements: {
        complexity: 'simple',
        quality_threshold: 0.75,
      },
      current_cost: 0.045,
    });

    const topAlt = result.alternatives[0];
    expect(topAlt.savings_percent).toBeGreaterThan(70); // GPT-4 to cheaper models
    expect(topAlt.savings_percent).toBeLessThanOrEqual(100);
  });

  it('should filter by complexity support', async () => {
    const result = await suggestCheaper({
      current_model: 'gpt-4',
      task_requirements: {
        complexity: 'complex',
        quality_threshold: 0.90,
      },
    });

    // Should not suggest simple-only models for complex tasks
    expect(result.alternatives.every(alt => alt.model !== 'llama-3-8b')).toBe(true);
  });
});

describe('Cost Predictor & Optimizer - Set Budget Limit', () => {
  it('should create per-execution budget', async () => {
    const result = await setBudgetLimit({
      budget_limit: 1.0,
      period: 'execution',
      action_on_exceed: 'block',
      alert_threshold: 0.8,
    });

    expect(result.budget_id).toBeDefined();
    expect(result.status).toBe('healthy');
    expect(result.current_spending).toBe(0);
    expect(result.remaining_budget).toBe(1.0);
    expect(result.period_end).toBeUndefined(); // Execution budgets have no end
  });

  it('should create daily budget with period end', async () => {
    const result = await setBudgetLimit({
      budget_limit: 50.0,
      period: 'day',
      action_on_exceed: 'warn',
      alert_threshold: 0.75,
    });

    expect(result.budget_id).toBeDefined();
    expect(result.period_end).toBeDefined();
    expect(result.alert_settings.threshold_amount).toBe(50.0 * 0.75);
  });

  it('should create monthly budget', async () => {
    const result = await setBudgetLimit({
      budget_limit: 1000.0,
      period: 'month',
      action_on_exceed: 'switch_cheaper',
      alert_threshold: 0.9,
    });

    expect(result.budget_id).toBeDefined();
    expect(result.remaining_budget).toBe(1000.0);
    expect(result.alert_settings.action).toBe('switch_cheaper');
  });

  it('should block spending when budget exceeded (block action)', async () => {
    const budgetResult = await setBudgetLimit({
      budget_limit: 0.10,
      period: 'execution',
      action_on_exceed: 'block',
    });

    const spending = trackSpending(budgetResult.budget_id, 0.15);

    expect(spending.allowed).toBe(false);
    expect(spending.action).toBe('blocked');
    expect(spending.message).toContain('blocked');
  });

  it('should warn when budget exceeded (warn action)', async () => {
    const budgetResult = await setBudgetLimit({
      budget_limit: 0.10,
      period: 'execution',
      action_on_exceed: 'warn',
    });

    const spending = trackSpending(budgetResult.budget_id, 0.15);

    expect(spending.allowed).toBe(true);
    expect(spending.action).toBe('warn');
    expect(spending.message).toContain('Warning');
  });

  it('should trigger alert at threshold', async () => {
    const budgetResult = await setBudgetLimit({
      budget_limit: 1.0,
      period: 'execution',
      action_on_exceed: 'warn',
      alert_threshold: 0.8,
    });

    const spending = trackSpending(budgetResult.budget_id, 0.85);

    expect(spending.action).toBe('alert');
    expect(spending.message).toContain('Alert');
    expect(spending.currentSpending).toBe(0.85);
  });

  it('should allow spending within budget', async () => {
    const budgetResult = await setBudgetLimit({
      budget_limit: 1.0,
      period: 'execution',
      action_on_exceed: 'block',
    });

    const spending = trackSpending(budgetResult.budget_id, 0.50);

    expect(spending.allowed).toBe(true);
    expect(spending.action).toBe('none');
    expect(spending.remainingBudget).toBe(0.50);
  });

  it('should suggest model switch when budget exceeded (switch_cheaper action)', async () => {
    const budgetResult = await setBudgetLimit({
      budget_limit: 0.05,
      period: 'execution',
      action_on_exceed: 'switch_cheaper',
    });

    const spending = trackSpending(budgetResult.budget_id, 0.10);

    expect(spending.allowed).toBe(true);
    expect(spending.action).toBe('switch_model');
    expect(spending.message).toContain('cheaper model');
  });
});

describe('Cost Predictor & Optimizer - Track Costs', () => {
  // Clear cost history before these tests
  beforeEach(() => {
    // Add some sample cost entries
    addCostEntry({
      model: 'gpt-4',
      cost: 0.05,
      tokens: 1000,
      sessionId: 'test-session-1',
      taskType: 'analysis',
    });

    addCostEntry({
      model: 'gpt-4-turbo',
      cost: 0.02,
      tokens: 800,
      sessionId: 'test-session-1',
      taskType: 'generation',
    });

    addCostEntry({
      model: 'claude-3-haiku',
      cost: 0.001,
      tokens: 500,
      sessionId: 'test-session-2',
      taskType: 'classification',
    });
  });

  it('should track costs for the day', async () => {
    const result = await trackCosts({
      period: 'day',
      group_by: 'model',
    });

    expect(result.total_cost).toBeGreaterThan(0);
    expect(result.cost_breakdown).toBeDefined();
    expect(result.execution_count).toBeGreaterThanOrEqual(3);
  });

  it('should group costs by model', async () => {
    const result = await trackCosts({
      period: 'day',
      group_by: 'model',
    });

    expect(result.cost_breakdown['gpt-4']).toBeDefined();
    expect(result.cost_breakdown['gpt-4']).toBeGreaterThan(0);
    expect(result.cost_breakdown['gpt-4-turbo']).toBeDefined();
    expect(result.cost_breakdown['claude-3-haiku']).toBeDefined();
  });

  it('should group costs by task type', async () => {
    const result = await trackCosts({
      period: 'day',
      group_by: 'task_type',
    });

    expect(result.cost_breakdown['analysis']).toBeDefined();
    expect(result.cost_breakdown['generation']).toBeDefined();
    expect(result.cost_breakdown['classification']).toBeDefined();
  });

  it('should filter by session ID', async () => {
    const result = await trackCosts({
      session_id: 'test-session-1',
      period: 'day',
      group_by: 'model',
    });

    // Should only include entries from session-1
    expect(result.total_cost).toBeGreaterThan(0.06); // 0.05 + 0.02
    expect(result.execution_count).toBe(2);
  });

  it('should calculate daily average', async () => {
    const result = await trackCosts({
      period: 'day',
      group_by: 'model',
    });

    expect(result.trends.daily_average).toBeGreaterThan(0);
    expect(result.trends.daily_average).toBeLessThanOrEqual(result.total_cost);
  });

  it('should identify cost trends', async () => {
    const result = await trackCosts({
      period: 'day',
      group_by: 'model',
    });

    expect(result.trends.cost_trend).toMatch(/increasing|stable|decreasing/);
    expect(result.trends.trend_percentage).toBeGreaterThanOrEqual(0);
  });

  it('should generate high cost alerts', async () => {
    // Add expensive entries
    for (let i = 0; i < 10; i++) {
      addCostEntry({
        model: 'gpt-4',
        cost: 15.0,
        tokens: 100000,
      });
    }

    const result = await trackCosts({
      period: 'day',
      group_by: 'model',
    });

    expect(result.alerts.length).toBeGreaterThan(0);
    expect(result.alerts.some(a => a.severity === 'high')).toBe(true);
  });

  it('should find peak cost and timestamp', async () => {
    const result = await trackCosts({
      period: 'day',
      group_by: 'model',
    });

    expect(result.trends.peak_cost).toBeGreaterThan(0);
    expect(result.trends.peak_timestamp).toBeDefined();
  });

  it('should provide period boundaries', async () => {
    const result = await trackCosts({
      period: 'week',
      group_by: 'model',
    });

    expect(result.period_start).toBeDefined();
    expect(result.period_end).toBeDefined();

    const start = new Date(result.period_start);
    const end = new Date(result.period_end);
    const diff = end.getTime() - start.getTime();
    const weekInMs = 7 * 24 * 60 * 60 * 1000;

    expect(Math.abs(diff - weekInMs)).toBeLessThan(60000); // Within 1 minute
  });
});

describe('Cost Predictor & Optimizer - Integration Tests', () => {
  it('should estimate, check budget, and track in workflow', async () => {
    // 1. Estimate cost for a task
    const estimate = await estimateCost({
      prompt: 'Analyze customer sentiment',
      model: 'gpt-4-turbo',
      expected_output_length: 500,
      tools_count: 10,
    });

    expect(estimate.estimated_cost).toBeGreaterThan(0);

    // 2. Set budget limit
    const budget = await setBudgetLimit({
      budget_limit: 1.0,
      period: 'execution',
      action_on_exceed: 'warn',
    });

    expect(budget.budget_id).toBeDefined();

    // 3. Check if estimated cost fits budget
    const spending = trackSpending(budget.budget_id, estimate.estimated_cost);

    expect(spending.allowed).toBe(true);
    expect(spending.remainingBudget).toBeGreaterThan(0);

    // 4. Add to cost tracking
    addCostEntry({
      model: 'gpt-4-turbo',
      cost: estimate.estimated_cost,
      tokens: estimate.breakdown.input_tokens + estimate.breakdown.output_tokens,
      taskType: 'sentiment-analysis',
    });

    // 5. Track costs
    const tracking = await trackCosts({
      period: 'day',
      group_by: 'task_type',
    });

    expect(tracking.total_cost).toBeGreaterThan(0);
  });

  it('should suggest cheaper model when budget is tight', async () => {
    // Low budget scenario
    const budget = await setBudgetLimit({
      budget_limit: 0.01,
      period: 'execution',
      action_on_exceed: 'block',
    });

    // Expensive model estimate
    const estimate = await estimateCost({
      prompt: 'Simple task',
      model: 'gpt-4',
      expected_output_length: 200,
    });

    // Would exceed budget
    if (estimate.estimated_cost > budget.remaining_budget) {
      // Get cheaper suggestion
      const suggestion = await suggestCheaper({
        current_model: 'gpt-4',
        task_requirements: {
          complexity: 'simple',
          quality_threshold: 0.80,
        },
        current_cost: estimate.estimated_cost,
      });

      expect(suggestion.alternatives.length).toBeGreaterThan(0);
      expect(suggestion.alternatives[0].estimated_cost).toBeLessThan(estimate.estimated_cost);
    }
  });
});
