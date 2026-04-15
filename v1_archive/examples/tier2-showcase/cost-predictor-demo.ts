/**
 * Cost Predictor & Optimizer - Live Demo
 *
 * This example demonstrates all 4 tools in the Cost Predictor skill:
 * 1. predict-cost: Pre-execution cost estimation
 * 2. track-spending: Real-time budget monitoring
 * 3. optimize-workflow: Suggest cheaper alternatives
 * 4. set-budget-alerts: Configure spending notifications
 */

import {
  predictCost,
  trackSpending,
  optimizeWorkflow,
  setBudgetAlerts,
  type PredictCostInput,
  type TrackSpendingInput,
  type OptimizeWorkflowInput,
  type SetBudgetAlertsInput,
} from '@agentfoundry/skills/cost-predictor-optimizer';

// ============================================================================
// Example 1: Predict Cost Before Running Expensive Operations
// ============================================================================

async function example1_PredictCost() {
  console.log('📊 Example 1: Predict Cost Before Execution\n');

  const input: PredictCostInput = {
    workflow: {
      steps: [
        {
          tool: 'web_search',
          estimated_calls: 5,
          model: 'gpt-4',
        },
        {
          tool: 'analyze_sentiment',
          estimated_calls: 100,
          model: 'claude-3-sonnet-20240229',
        },
        {
          tool: 'generate_report',
          estimated_calls: 1,
          model: 'gpt-4',
        },
      ],
    },
    pricing_config: {
      gpt_4_input: 0.03,
      gpt_4_output: 0.06,
      claude_sonnet_input: 0.003,
      claude_sonnet_output: 0.015,
      avg_input_tokens: 1000,
      avg_output_tokens: 500,
    },
  };

  const result = await predictCost(input);

  console.log('Cost Breakdown:');
  result.cost_breakdown.forEach((step) => {
    console.log(`  ${step.tool}: $${step.estimated_cost.toFixed(4)} (${step.calls} calls)`);
  });
  console.log(`\n💰 Total Estimated Cost: $${result.total_estimated_cost.toFixed(2)}`);
  console.log(`⚠️  Confidence: ${(result.confidence * 100).toFixed(0)}%`);

  if (result.warnings.length > 0) {
    console.log('\n⚡ Warnings:');
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }
  console.log('\n' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 2: Track Spending in Real-Time
// ============================================================================

async function example2_TrackSpending() {
  console.log('📈 Example 2: Real-Time Spending Tracker\n');

  // Simulate multiple API calls
  const calls = [
    { tool: 'web_search', model: 'gpt-4', input_tokens: 800, output_tokens: 400, cost: 0.048 },
    { tool: 'web_search', model: 'gpt-4', input_tokens: 850, output_tokens: 420, cost: 0.051 },
    { tool: 'analyze_sentiment', model: 'claude-3-sonnet-20240229', input_tokens: 1200, output_tokens: 300, cost: 0.0081 },
    { tool: 'analyze_sentiment', model: 'claude-3-sonnet-20240229', input_tokens: 1100, output_tokens: 320, cost: 0.0078 },
    { tool: 'generate_report', model: 'gpt-4', input_tokens: 2000, output_tokens: 1500, cost: 0.150 },
  ];

  const input: TrackSpendingInput = {
    session_id: 'demo-session-001',
    budget_limit: 1.0,
    actual_calls: calls,
  };

  const result = await trackSpending(input);

  console.log(`Session: ${result.session_id}`);
  console.log(`Budget: $${result.budget_limit.toFixed(2)}`);
  console.log(`Spent: $${result.total_spent.toFixed(4)} (${(result.budget_used_percent * 100).toFixed(1)}%)`);
  console.log(`Remaining: $${result.remaining_budget.toFixed(4)}\n`);

  console.log('Top Spenders:');
  result.cost_by_tool.forEach(tool => {
    console.log(`  ${tool.tool}: $${tool.total_cost.toFixed(4)} (${tool.call_count} calls)`);
  });

  if (result.alert) {
    console.log(`\n🚨 ALERT: ${result.alert.message}`);
    console.log(`   Severity: ${result.alert.severity.toUpperCase()}`);
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 3: Optimize Workflow for Cost Savings
// ============================================================================

async function example3_OptimizeWorkflow() {
  console.log('💡 Example 3: Workflow Optimization Suggestions\n');

  const input: OptimizeWorkflowInput = {
    current_workflow: {
      steps: [
        { tool: 'sentiment_analysis', model: 'gpt-4', estimated_calls: 1000 },
        { tool: 'classification', model: 'gpt-4', estimated_calls: 500 },
        { tool: 'summarization', model: 'claude-3-opus-20240229', estimated_calls: 200 },
      ],
    },
    optimization_goal: 'cost',
    quality_threshold: 0.85,
  };

  const result = await optimizeWorkflow(input);

  console.log(`Current Cost: $${result.current_cost.toFixed(2)}`);
  console.log(`Optimized Cost: $${result.optimized_cost.toFixed(2)}`);
  console.log(`💰 Savings: $${result.savings.toFixed(2)} (${(result.savings_percent * 100).toFixed(1)}%)\n`);

  console.log('Recommended Changes:');
  result.recommendations.forEach((rec, i) => {
    console.log(`\n${i + 1}. ${rec.suggestion}`);
    console.log(`   Impact: ${rec.impact}`);
    console.log(`   Estimated Savings: $${rec.estimated_savings.toFixed(2)}`);
  });

  console.log('\n' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 4: Set Budget Alerts
// ============================================================================

async function example4_SetBudgetAlerts() {
  console.log('🔔 Example 4: Configure Budget Alerts\n');

  const input: SetBudgetAlertsInput = {
    session_id: 'demo-session-001',
    budget_limit: 100.0,
    alert_thresholds: [
      { percent: 50, severity: 'info' },
      { percent: 75, severity: 'warning' },
      { percent: 90, severity: 'critical' },
    ],
    notification_channels: ['email', 'slack'],
  };

  const result = await setBudgetAlerts(input);

  console.log(`✅ Budget alerts configured for session: ${result.session_id}`);
  console.log(`Budget Limit: $${result.budget_limit.toFixed(2)}\n`);

  console.log('Alert Thresholds:');
  result.configured_alerts.forEach(alert => {
    const threshold = alert.threshold_amount.toFixed(2);
    console.log(`  ${alert.threshold_percent}% ($${threshold}) → ${alert.severity.toUpperCase()}`);
  });

  console.log(`\nNotifications: ${result.notification_channels.join(', ')}`);

  console.log('\n' + '='.repeat(70) + '\n');
}

// ============================================================================
// Run All Examples
// ============================================================================

async function runAllExamples() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║   Cost Predictor & Optimizer - Complete Demo Suite               ║');
  console.log('║   Prevent $1K-$5K/month billing surprises                         ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  await example1_PredictCost();
  await example2_TrackSpending();
  await example3_OptimizeWorkflow();
  await example4_SetBudgetAlerts();

  console.log('✅ All examples completed successfully!\n');
  console.log('💡 Key Takeaways:');
  console.log('   • Predict costs before execution to avoid surprises');
  console.log('   • Track spending in real-time with budget alerts');
  console.log('   • Get intelligent suggestions to reduce costs by 40-60%');
  console.log('   • Never exceed your budget with automatic notifications\n');
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export { runAllExamples };
