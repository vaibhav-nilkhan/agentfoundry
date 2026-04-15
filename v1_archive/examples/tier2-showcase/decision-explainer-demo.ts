/**
 * Decision Explainer - Live Demo
 *
 * This example demonstrates all 4 tools in the Decision Explainer skill:
 * 1. explain-decision: Step-by-step reasoning breakdown
 * 2. score-confidence: Confidence scoring with uncertainty factors
 * 3. generate-audit-trail: Compliance-ready decision logs
 * 4. visualize-reasoning: Decision tree visualization
 */

import {
  explainDecision,
  scoreConfidence,
  generateAuditTrail,
  visualizeReasoning,
  type ExplainDecisionInput,
  type ScoreConfidenceInput,
  type GenerateAuditTrailInput,
  type VisualizeReasoningInput,
} from '@agentfoundry/skills/decision-explainer';

// ============================================================================
// Example 1: Explain a Complex Decision
// ============================================================================

async function example1_ExplainDecision() {
  console.log('🧠 Example 1: Explain Complex AI Decision\n');

  const input: ExplainDecisionInput = {
    decision: 'Recommend rejecting loan application #LA-2024-8756',
    context: {
      applicant_credit_score: 640,
      debt_to_income_ratio: 0.48,
      employment_history_months: 18,
      requested_amount: 250000,
      down_payment_percent: 15,
      property_value: 320000,
    },
    model_used: 'risk-assessment-v2.1',
    include_alternatives: true,
  };

  const result = await explainDecision(input);

  console.log(`Decision: ${result.decision}\n`);

  console.log('Reasoning Steps:');
  result.reasoning_steps.forEach((step, i) => {
    console.log(`\n${i + 1}. ${step.step_description}`);
    console.log(`   Evidence: ${step.evidence}`);
    console.log(`   Confidence: ${(step.confidence * 100).toFixed(0)}%`);
  });

  console.log('\n📊 Key Factors:');
  result.key_factors.forEach(factor => {
    const impact = factor.impact > 0 ? '↑' : '↓';
    console.log(`  ${impact} ${factor.factor}: ${factor.description} (weight: ${factor.weight.toFixed(2)})`);
  });

  if (result.alternatives_considered.length > 0) {
    console.log('\n🔀 Alternatives Considered:');
    result.alternatives_considered.forEach(alt => {
      console.log(`  • ${alt.alternative}: ${alt.why_not_chosen}`);
      console.log(`    Score: ${(alt.score * 100).toFixed(0)}% vs chosen: ${(alt.comparison_to_chosen * 100).toFixed(0)}%`);
    });
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 2: Score Decision Confidence
// ============================================================================

async function example2_ScoreConfidence() {
  console.log('📈 Example 2: Score Decision Confidence\n');

  const input: ScoreConfidenceInput = {
    decision: 'Recommend treatment plan: Combination therapy with drugs A + B',
    evidence: [
      {
        source: 'clinical_trial_2023',
        strength: 0.92,
        relevance: 0.88,
        description: 'Phase III trial showed 78% efficacy for combination therapy',
      },
      {
        source: 'patient_history',
        strength: 0.85,
        relevance: 0.95,
        description: 'Patient responded well to drug A in past treatment',
      },
      {
        source: 'genetic_markers',
        strength: 0.78,
        relevance: 0.82,
        description: 'Genetic profile suggests good response to drug B',
      },
      {
        source: 'drug_interactions_db',
        strength: 0.95,
        relevance: 0.90,
        description: 'No significant interactions between drugs A and B',
      },
    ],
    uncertainty_factors: [
      'Limited long-term data for this combination (< 2 years)',
      'Patient has mild kidney dysfunction (eGFR 55)',
      'Small sample size in relevant genetic subgroup (n=43)',
    ],
  };

  const result = await scoreConfidence(input);

  console.log(`Decision: ${result.decision}\n`);

  console.log(`🎯 Confidence Score: ${(result.confidence_score * 100).toFixed(1)}%`);
  console.log(`   Level: ${result.confidence_level.toUpperCase()}\n`);

  console.log('Evidence Assessment:');
  result.evidence_quality.forEach((ev, i) => {
    console.log(`  ${i + 1}. ${ev.source}`);
    console.log(`     Strength: ${(ev.strength * 100).toFixed(0)}% | Relevance: ${(ev.relevance * 100).toFixed(0)}% | Weight: ${ev.weight.toFixed(3)}`);
  });

  console.log('\n⚠️  Uncertainty Factors:');
  result.uncertainty_analysis.forEach((unc, i) => {
    const impact = unc.impact === 'high' ? '🔴' : unc.impact === 'medium' ? '🟡' : '🟢';
    console.log(`  ${impact} ${unc.factor}`);
    console.log(`     Impact: ${unc.impact.toUpperCase()} (-${(unc.confidence_reduction * 100).toFixed(1)}%)`);
    if (unc.mitigation) {
      console.log(`     Mitigation: ${unc.mitigation}`);
    }
  });

  console.log(`\n📉 Total Confidence Reduction: -${(result.total_uncertainty_impact * 100).toFixed(1)}%`);

  console.log('\n💡 Recommendations:');
  result.recommendations.forEach(rec => console.log(`  • ${rec}`));

  console.log('\n' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 3: Generate Compliance Audit Trail
// ============================================================================

async function example3_GenerateAuditTrail() {
  console.log('📋 Example 3: Generate Compliance Audit Trail\n');

  const input: GenerateAuditTrailInput = {
    decision_id: 'DEC-2024-11-15-8756',
    decision: 'Approve wire transfer of $150,000 to vendor account',
    decision_maker: 'ai-agent-financial-v3',
    timestamp: new Date().toISOString(),
    reasoning_steps: [
      {
        step: 1,
        description: 'Verify vendor identity and account ownership',
        data_accessed: ['vendor_registry', 'bank_account_verification_api'],
        result: 'VERIFIED - Vendor registered since 2019, account ownership confirmed',
      },
      {
        step: 2,
        description: 'Check transaction history and patterns',
        data_accessed: ['transaction_history_db', 'payment_patterns_ml_model'],
        result: 'NORMAL - Similar transactions executed 12 times in past 6 months',
      },
      {
        step: 3,
        description: 'Screen for fraud indicators',
        data_accessed: ['fraud_detection_api', 'sanctions_screening_db'],
        result: 'CLEAR - No fraud flags, not on sanctions lists',
      },
      {
        step: 4,
        description: 'Validate approval authority and limits',
        data_accessed: ['user_permissions_db', 'delegation_matrix'],
        result: 'AUTHORIZED - Amount within approved limit ($200K)',
      },
    ],
    compliance_frameworks: ['SOC2', 'AML', 'KYC'],
    include_data_lineage: true,
  };

  const result = await generateAuditTrail(input);

  console.log(`Audit Trail: ${result.audit_trail_id}`);
  console.log(`Decision: ${result.decision_id}`);
  console.log(`Timestamp: ${new Date(result.timestamp).toLocaleString()}\n`);

  console.log('Decision Details:');
  console.log(`  Decision: ${result.decision}`);
  console.log(`  Maker: ${result.decision_maker}`);
  console.log(`  Duration: ${result.processing_time_ms}ms\n`);

  console.log('Audit Trail:');
  result.audit_steps.forEach((step, i) => {
    console.log(`\n  Step ${step.step_number}: ${step.description}`);
    console.log(`    Data Accessed: ${step.data_accessed.join(', ')}`);
    console.log(`    Result: ${step.result}`);
    console.log(`    Timestamp: ${new Date(step.timestamp).toLocaleTimeString()}`);
  });

  console.log('\n✅ Compliance Checks:');
  result.compliance_verification.forEach(comp => {
    const status = comp.compliant ? '✓' : '✗';
    console.log(`  ${status} ${comp.framework}: ${comp.verification_details}`);
  });

  if (result.data_lineage) {
    console.log('\n📊 Data Lineage:');
    result.data_lineage.forEach(lineage => {
      console.log(`  • ${lineage.data_source}`);
      console.log(`    Origin: ${lineage.origin}`);
      console.log(`    Last Updated: ${new Date(lineage.last_updated).toLocaleDateString()}`);
      console.log(`    Quality: ${(lineage.data_quality_score * 100).toFixed(0)}%`);
    });
  }

  console.log(`\n🔐 Tamper-Proof Hash: ${result.cryptographic_hash}`);
  console.log(`📅 Retention: ${result.retention_period_days} days\n`);

  console.log('=' + '='.repeat(70) + '\n');
}

// ============================================================================
// Example 4: Visualize Decision Reasoning
// ============================================================================

async function example4_VisualizeReasoning() {
  console.log('🎨 Example 4: Visualize Decision Tree\n');

  const input: VisualizeReasoningInput = {
    decision_id: 'DEC-2024-11-15-8756',
    decision_tree: {
      root: {
        question: 'Should we expand to European market?',
        branches: [
          {
            condition: 'Market size > $1B',
            result: true,
            next: {
              question: 'Do we have regulatory approval?',
              branches: [
                {
                  condition: 'GDPR compliance achieved',
                  result: true,
                  next: {
                    question: 'Is local team ready?',
                    branches: [
                      {
                        condition: 'Hiring complete + office setup',
                        result: true,
                        decision: 'APPROVE expansion with Q1 2025 launch',
                        confidence: 0.87,
                      },
                      {
                        condition: 'Hiring incomplete',
                        result: false,
                        decision: 'DELAY until Q2 2025',
                        confidence: 0.72,
                      },
                    ],
                  },
                },
                {
                  condition: 'GDPR compliance pending',
                  result: false,
                  decision: 'REJECT - address compliance first',
                  confidence: 0.95,
                },
              ],
            },
          },
          {
            condition: 'Market size < $1B',
            result: false,
            decision: 'REJECT - market too small',
            confidence: 0.88,
          },
        ],
      },
    },
    visualization_format: 'mermaid',
    highlight_chosen_path: true,
  };

  const result = await visualizeReasoning(input);

  console.log(`Decision: ${result.decision_id}`);
  console.log(`Format: ${result.visualization_format}\n`);

  console.log('Decision Tree Visualization:');
  console.log('─'.repeat(70));
  console.log(result.visualization_output);
  console.log('─'.repeat(70));

  console.log(`\n📊 Statistics:`);
  console.log(`  Total Nodes: ${result.statistics.total_nodes}`);
  console.log(`  Decision Points: ${result.statistics.decision_points}`);
  console.log(`  Leaf Nodes: ${result.statistics.leaf_nodes}`);
  console.log(`  Max Depth: ${result.statistics.max_depth}`);
  console.log(`  Chosen Path Length: ${result.statistics.chosen_path_length}\n`);

  console.log('🎯 Chosen Path:');
  result.chosen_path.forEach((node, i) => {
    console.log(`  ${i + 1}. ${node}`);
  });

  console.log(`\n💡 Rendering Instructions:`);
  console.log(`  ${result.rendering_instructions}\n`);

  console.log('=' + '='.repeat(70) + '\n');
}

// ============================================================================
// Run All Examples
// ============================================================================

async function runAllExamples() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║   Decision Explainer - Complete Demo Suite                       ║');
  console.log('║   Make AI decisions transparent and compliant                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  await example1_ExplainDecision();
  await example2_ScoreConfidence();
  await example3_GenerateAuditTrail();
  await example4_VisualizeReasoning();

  console.log('✅ All examples completed successfully!\n');
  console.log('💡 Key Takeaways:');
  console.log('   • Explain complex AI decisions with step-by-step reasoning');
  console.log('   • Score confidence with uncertainty factor analysis');
  console.log('   • Generate compliance-ready audit trails (SOC2, HIPAA, GDPR)');
  console.log('   • Visualize decision trees for stakeholder communication\n');
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export { runAllExamples };
