/**
 * Multi-Agent Orchestrator - Live Demo
 *
 * This example demonstrates all 4 tools in the Multi-Agent Orchestrator skill:
 * 1. orchestrate-agents: Coordinate multiple agents on complex tasks
 * 2. resolve-conflicts: Handle disagreements between agents
 * 3. aggregate-results: Combine outputs from parallel agents
 * 4. monitor-progress: Track multi-agent workflow status
 */

import {
  orchestrateAgents,
  resolveConflicts,
  aggregateResults,
  monitorProgress,
  type OrchestrateAgentsInput,
  type ResolveConflictsInput,
  type AggregateResultsInput,
  type MonitorProgressInput,
} from '@agentfoundry/skills/multi-agent-orchestrator';

// ============================================================================
// Example 1: Orchestrate Multiple Agents on a Complex Task
// ============================================================================

async function example1_OrchestrateAgents() {
  console.log('🎭 Example 1: Orchestrate Complex Multi-Agent Workflow\n');

  const input: OrchestrateAgentsInput = {
    task: 'Analyze competitor landscape and create market entry strategy',
    agents: [
      {
        agent_id: 'research-agent',
        role: 'market_researcher',
        capabilities: ['web_search', 'data_analysis', 'report_generation'],
        priority: 1,
      },
      {
        agent_id: 'strategy-agent',
        role: 'business_strategist',
        capabilities: ['swot_analysis', 'competitive_positioning', 'recommendations'],
        priority: 2,
      },
      {
        agent_id: 'finance-agent',
        role: 'financial_analyst',
        capabilities: ['cost_analysis', 'revenue_projection', 'roi_calculation'],
        priority: 2,
      },
      {
        agent_id: 'synthesis-agent',
        role: 'report_writer',
        capabilities: ['content_synthesis', 'executive_summary', 'presentation'],
        priority: 3,
      },
    ],
    orchestration_strategy: 'sequential_with_dependencies',
    timeout_seconds: 300,
  };

  const result = await orchestrateAgents(input);

  console.log(`📋 Task: ${result.task_id}`);
  console.log(`Strategy: ${result.orchestration_strategy}\n`);

  console.log('Execution Plan:');
  result.execution_plan.steps.forEach((step, i) => {
    console.log(`\nStep ${i + 1}: ${step.agent_id} (${step.role})`);
    console.log(`  Dependencies: ${step.dependencies.length > 0 ? step.dependencies.join(', ') : 'None'}`);
    console.log(`  Est. Duration: ${step.estimated_duration_seconds}s`);
    console.log(`  Tools: ${step.tools_to_use.join(', ')}`);
  });

  console.log(`\n⏱️  Total Estimated Duration: ${result.execution_plan.total_estimated_duration_seconds}s`);
  console.log(`🔀 Parallelizable Steps: ${result.execution_plan.parallelizable_groups.length}`);

  console.log('\n' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 2: Resolve Conflicts Between Agents
// ============================================================================

async function example2_ResolveConflicts() {
  console.log('⚖️  Example 2: Resolve Agent Disagreements\n');

  const input: ResolveConflictsInput = {
    task_id: 'task-12345',
    conflicts: [
      {
        agent_1: 'research-agent',
        agent_2: 'strategy-agent',
        conflict_type: 'data_interpretation',
        agent_1_position: 'Market is saturated, recommend niche focus',
        agent_2_position: 'Market is growing, recommend broad entry',
        confidence_1: 0.75,
        confidence_2: 0.82,
      },
      {
        agent_1: 'finance-agent',
        agent_2: 'strategy-agent',
        conflict_type: 'recommendation',
        agent_1_position: 'Budget too high, scale back launch',
        agent_2_position: 'Aggressive investment needed for market share',
        confidence_1: 0.88,
        confidence_2: 0.79,
      },
    ],
    resolution_strategy: 'evidence_based',
    allow_human_override: true,
  };

  const result = await resolveConflicts(input);

  console.log(`Task: ${result.task_id}`);
  console.log(`Strategy: ${result.resolution_strategy}\n`);

  result.resolutions.forEach((resolution, i) => {
    console.log(`Conflict ${i + 1}: ${resolution.conflict_type.toUpperCase()}`);
    console.log(`  ${resolution.agent_1} vs ${resolution.agent_2}`);
    console.log(`\n  Resolution: ${resolution.resolution}`);
    console.log(`  Rationale: ${resolution.rationale}`);
    console.log(`  Confidence: ${(resolution.confidence * 100).toFixed(0)}%`);

    if (resolution.requires_human_review) {
      console.log(`  ⚠️  REQUIRES HUMAN REVIEW`);
    }
    console.log();
  });

  console.log(`✅ ${result.conflicts_resolved} of ${result.total_conflicts} conflicts resolved`);
  console.log(`⏸️  ${result.conflicts_requiring_human_review} require human review\n`);

  console.log('=' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 3: Aggregate Results from Parallel Agents
// ============================================================================

async function example3_AggregateResults() {
  console.log('🔄 Example 3: Aggregate Parallel Agent Outputs\n');

  const input: AggregateResultsInput = {
    task_id: 'task-12345',
    agent_results: [
      {
        agent_id: 'research-agent',
        role: 'market_researcher',
        output: {
          market_size: '$50B',
          growth_rate: '12% CAGR',
          key_competitors: ['CompanyA', 'CompanyB', 'CompanyC'],
          market_gaps: ['AI-powered analytics', 'Real-time insights'],
        },
        confidence: 0.87,
        execution_time_seconds: 45,
      },
      {
        agent_id: 'strategy-agent',
        role: 'business_strategist',
        output: {
          recommended_strategy: 'Differentiated niche entry',
          target_segment: 'Mid-market enterprises',
          positioning: 'AI-first analytics platform',
          competitive_advantages: ['Speed', 'Accuracy', 'Cost'],
        },
        confidence: 0.82,
        execution_time_seconds: 38,
      },
      {
        agent_id: 'finance-agent',
        role: 'financial_analyst',
        output: {
          initial_investment: '$2.5M',
          break_even_months: 18,
          year_1_revenue: '$800K',
          year_3_revenue: '$8.5M',
          roi_3_year: '240%',
        },
        confidence: 0.79,
        execution_time_seconds: 52,
      },
    ],
    aggregation_strategy: 'weighted_synthesis',
    quality_threshold: 0.75,
  };

  const result = await aggregateResults(input);

  console.log(`Task: ${result.task_id}`);
  console.log(`Strategy: ${result.aggregation_strategy}\n`);

  console.log('Aggregated Output:');
  console.log(JSON.stringify(result.aggregated_output, null, 2));

  console.log(`\n📊 Confidence Score: ${(result.confidence_score * 100).toFixed(0)}%`);
  console.log(`✅ Quality Check: ${result.quality_check.passed ? 'PASSED' : 'FAILED'}`);

  if (result.quality_check.issues.length > 0) {
    console.log('\n⚠️  Quality Issues:');
    result.quality_check.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  console.log(`\n⏱️  Total Execution Time: ${result.metadata.total_execution_time_seconds}s`);
  console.log(`🤖 Agents Involved: ${result.metadata.agents_involved}`);

  console.log('\n' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 4: Monitor Multi-Agent Progress
// ============================================================================

async function example4_MonitorProgress() {
  console.log('📡 Example 4: Real-Time Multi-Agent Progress Tracking\n');

  const input: MonitorProgressInput = {
    task_id: 'task-12345',
    include_agent_details: true,
    include_resource_usage: true,
  };

  const result = await monitorProgress(input);

  console.log(`Task: ${result.task_id}`);
  console.log(`Status: ${result.overall_status.toUpperCase()}`);
  console.log(`Progress: ${(result.progress_percent * 100).toFixed(1)}%\n`);

  console.log('Agent Status:');
  result.agent_statuses.forEach(agent => {
    const statusIcon = agent.status === 'completed' ? '✅' :
                      agent.status === 'running' ? '🔄' :
                      agent.status === 'pending' ? '⏸️' : '❌';
    console.log(`  ${statusIcon} ${agent.agent_id}: ${agent.current_step || 'Idle'}`);
    console.log(`     Progress: ${(agent.progress_percent * 100).toFixed(0)}%`);
  });

  console.log(`\n⏱️  Elapsed: ${result.elapsed_time_seconds}s`);
  console.log(`⏳ Remaining: ~${result.estimated_time_remaining_seconds}s`);

  if (result.resource_usage) {
    console.log('\n💻 Resource Usage:');
    console.log(`  CPU: ${result.resource_usage.cpu_percent.toFixed(1)}%`);
    console.log(`  Memory: ${result.resource_usage.memory_mb.toFixed(0)} MB`);
    console.log(`  API Calls: ${result.resource_usage.api_calls_made}`);
    console.log(`  Cost: $${result.resource_usage.cost_so_far.toFixed(4)}`);
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

// ============================================================================
// Run All Examples
// ============================================================================

async function runAllExamples() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║   Multi-Agent Orchestrator - Complete Demo Suite                 ║');
  console.log('║   Coordinate complex workflows with multiple AI agents            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  await example1_OrchestrateAgents();
  await example2_ResolveConflicts();
  await example3_AggregateResults();
  await example4_MonitorProgress();

  console.log('✅ All examples completed successfully!\n');
  console.log('💡 Key Takeaways:');
  console.log('   • Orchestrate complex multi-agent workflows with dependencies');
  console.log('   • Resolve conflicts intelligently with evidence-based strategies');
  console.log('   • Aggregate results from parallel agents for faster execution');
  console.log('   • Monitor progress in real-time with resource usage tracking\n');
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export { runAllExamples };
