import { describe, it, expect } from '@jest/globals';
import { run as explainDecision } from '../src/tools/explain-decision';
import { run as scoreConfidence } from '../src/tools/score-confidence';
import { run as generateAuditTrail } from '../src/tools/generate-audit-trail';
import { run as visualizeReasoning } from '../src/tools/visualize-reasoning';

describe('Decision Explainer - Explain Decision', () => {
  const sampleContext = {
    user_priority: 'high',
    budget: 10000,
    deadline: '2025-01-31',
    constraints: ['time', 'resources'],
    requirements: ['scalability', 'security'],
  };

  it('should generate summary explanation', async () => {
    const result = await explainDecision({
      decision: 'Use cloud-based infrastructure for deployment',
      context: sampleContext,
      detail_level: 'summary',
    });

    expect(result.explanation).toBeDefined();
    expect(result.explanation.length).toBeGreaterThan(50);
    expect(result.reasoning_steps.length).toBeGreaterThan(0);
  });

  it('should generate detailed explanation', async () => {
    const result = await explainDecision({
      decision: 'Implement caching layer for performance',
      context: sampleContext,
      detail_level: 'detailed',
    });

    expect(result.explanation).toContain('reasoning steps');
    expect(result.reasoning_steps.length).toBeGreaterThanOrEqual(3);
    expect(result.alternatives_considered.length).toBeGreaterThan(0);
  });

  it('should generate comprehensive explanation', async () => {
    const result = await explainDecision({
      decision: 'Adopt microservices architecture',
      context: sampleContext,
      detail_level: 'comprehensive',
    });

    expect(result.explanation).toContain('Comprehensive Analysis');
    expect(result.reasoning_steps.length).toBeGreaterThanOrEqual(4);
    expect(result.key_factors.length).toBeGreaterThan(0);
  });

  it('should extract and prioritize key factors', async () => {
    const result = await explainDecision({
      decision: 'Test decision',
      context: {
        critical_error: true,
        budget: 5000,
        optional_feature: 'nice-to-have',
      },
      detail_level: 'detailed',
    });

    const highImpactFactors = result.key_factors.filter(f => f.impact === 'high');
    expect(highImpactFactors.length).toBeGreaterThan(0);
    expect(highImpactFactors[0].factor).toBe('critical_error');
  });

  it('should provide alternatives analysis', async () => {
    const result = await explainDecision({
      decision: 'Use automated testing',
      context: sampleContext,
      detail_level: 'detailed',
    });

    expect(result.alternatives_considered.length).toBeGreaterThanOrEqual(2);
    result.alternatives_considered.forEach(alt => {
      expect(alt.alternative).toBeDefined();
      expect(alt.pros).toBeDefined();
      expect(alt.cons).toBeDefined();
      expect(alt.rejected_reason).toBeDefined();
    });
  });

  it('should include confidence scores in reasoning steps', async () => {
    const result = await explainDecision({
      decision: 'Prioritize security over speed',
      context: sampleContext,
      detail_level: 'comprehensive',
    });

    result.reasoning_steps.forEach(step => {
      expect(step.confidence).toBeGreaterThanOrEqual(0);
      expect(step.confidence).toBeLessThanOrEqual(1);
    });
  });
});

describe('Decision Explainer - Score Confidence', () => {
  it('should score high confidence decision', async () => {
    const result = await scoreConfidence({
      decision: {
        action: 'Deploy to production',
        reasoning: 'All tests passed, security scan clear, and stakeholder approval received. The deployment has been thoroughly validated across staging environments.',
        data_sources: ['test_results', 'security_scan', 'stakeholder_approval'],
        alternatives_count: 3,
        context_completeness: 0.95,
      },
    });

    expect(result.confidence_score).toBeGreaterThan(0.7);
    expect(result.confidence_level).toMatch(/high|very_high/);
    expect(result.requires_human_review).toBe(false);
  });

  it('should score low confidence decision', async () => {
    const result = await scoreConfidence({
      decision: {
        action: 'Make architectural change',
        alternatives_count: 0,
        context_completeness: 0.3,
      },
    });

    expect(result.confidence_score).toBeLessThan(0.5);
    expect(result.confidence_level).toMatch(/low|very_low/);
    expect(result.requires_human_review).toBe(true);
  });

  it('should identify uncertainty factors', async () => {
    const result = await scoreConfidence({
      decision: {
        action: 'Refactor codebase',
        reasoning: 'Needs improvement',
        alternatives_count: 1,
        context_completeness: 0.4,
      },
    });

    expect(result.uncertainty_factors.length).toBeGreaterThan(0);
    expect(result.uncertainty_factors.some(f => f.severity === 'high' || f.severity === 'medium')).toBe(true);
  });

  it('should provide detailed confidence breakdown', async () => {
    const result = await scoreConfidence({
      decision: {
        action: 'Implement feature X',
        reasoning: 'Based on user feedback and market analysis, implementing feature X will provide significant value. The development team has estimated 3 weeks for completion.',
        data_sources: ['user_feedback', 'market_research'],
        alternatives_count: 2,
        context_completeness: 0.85,
      },
    });

    expect(result.confidence_breakdown.data_quality).toBeGreaterThan(0);
    expect(result.confidence_breakdown.reasoning_clarity).toBeGreaterThan(0);
    expect(result.confidence_breakdown.alternatives_evaluated).toBeGreaterThan(0);
    expect(result.confidence_breakdown.context_coverage).toBeGreaterThan(0);
  });

  it('should provide actionable recommendations', async () => {
    const result = await scoreConfidence({
      decision: {
        action: 'Scale infrastructure',
        reasoning: 'Traffic increasing',
        data_sources: [],
        alternatives_count: 0,
      },
    });

    expect(result.recommendation).toBeDefined();
    expect(result.recommendation.length).toBeGreaterThan(20);
  });

  it('should flag for human review when appropriate', async () => {
    const result = await scoreConfidence({
      decision: {
        action: 'Delete production database',
        reasoning: 'cleanup',
        alternatives_count: 0,
        context_completeness: 0.2,
      },
    });

    expect(result.requires_human_review).toBe(true);
    expect(result.confidence_score).toBeLessThan(0.5);
  });
});

describe('Decision Explainer - Generate Audit Trail', () => {
  const sampleHistory = [
    {
      timestamp: '2025-01-15T10:00:00Z',
      event_type: 'decision',
      agent_id: 'agent-1',
      action: 'process_data',
      input_data: { records: 100 },
      output_data: { processed: 95 },
      user_id: 'user-123',
      success: true,
    },
    {
      timestamp: '2025-01-15T10:05:00Z',
      event_type: 'action',
      agent_id: 'agent-2',
      action: 'validate_results',
      input_data: { validation_rules: 5 },
      success: true,
    },
    {
      timestamp: '2025-01-15T10:10:00Z',
      event_type: 'error',
      agent_id: 'agent-1',
      action: 'retry_failed',
      error: 'Connection timeout',
      success: false,
    },
  ];

  it('should generate general audit trail', async () => {
    const result = await generateAuditTrail({
      execution_history: sampleHistory,
      compliance_standard: 'general',
    });

    expect(result.audit_log.length).toBe(3);
    expect(result.summary.total_events).toBe(3);
    expect(result.summary.unique_actors).toBeGreaterThan(0);
  });

  it('should generate SOC 2 compliant audit trail', async () => {
    const result = await generateAuditTrail({
      execution_history: sampleHistory,
      compliance_standard: 'soc2',
    });

    expect(result.audit_log[0].compliance_tags).toContain('soc2_cc6.1');
    expect(result.compliance_status).toBeDefined();
  });

  it('should generate HIPAA compliant audit trail', async () => {
    const result = await generateAuditTrail({
      execution_history: sampleHistory,
      compliance_standard: 'hipaa',
    });

    expect(result.audit_log.some(log => log.compliance_tags.some(tag => tag.includes('hipaa')))).toBe(true);
  });

  it('should generate GDPR compliant audit trail', async () => {
    const result = await generateAuditTrail({
      execution_history: sampleHistory,
      compliance_standard: 'gdpr',
    });

    expect(result.audit_log.some(log => log.compliance_tags.includes('gdpr_article_30'))).toBe(true);
  });

  it('should redact PII by default', async () => {
    const historyWithPII = [
      {
        timestamp: Date.now(),
        event_type: 'user_action',
        action: 'update_profile',
        input_data: { email: 'user@example.com', phone: '555-1234' },
        success: true,
      },
    ];

    const result = await generateAuditTrail({
      execution_history: historyWithPII,
      compliance_standard: 'general',
      include_pii: false,
    });

    const logDetails = result.audit_log[0].details;
    expect(logDetails?.input.email).toBe('[REDACTED]');
    expect(logDetails?.input.phone).toBe('[REDACTED]');
  });

  it('should calculate success rate correctly', async () => {
    const result = await generateAuditTrail({
      execution_history: sampleHistory,
      compliance_standard: 'general',
    });

    expect(result.summary.success_rate).toBeCloseTo(0.67, 1); // 2 out of 3 succeeded
  });

  it('should provide compliance recommendations', async () => {
    const result = await generateAuditTrail({
      execution_history: sampleHistory,
      compliance_standard: 'hipaa',
    });

    expect(result.recommendations.length).toBeGreaterThan(0);
    result.recommendations.forEach(rec => {
      expect(rec.type).toBeDefined();
      expect(rec.priority).toMatch(/low|medium|high/);
      expect(rec.description).toBeDefined();
    });
  });

  it('should track time range correctly', async () => {
    const result = await generateAuditTrail({
      execution_history: sampleHistory,
      compliance_standard: 'general',
    });

    expect(result.summary.time_range.start).toBeDefined();
    expect(result.summary.time_range.end).toBeDefined();
    expect(new Date(result.summary.time_range.end).getTime()).toBeGreaterThanOrEqual(
      new Date(result.summary.time_range.start).getTime()
    );
  });
});

describe('Decision Explainer - Visualize Reasoning', () => {
  const samplePath = [
    {
      id: 'root',
      description: 'Start analysis',
      decision_type: 'branch' as const,
      children: ['step1', 'step2'],
    },
    {
      id: 'step1',
      description: 'Check budget constraints',
      decision_type: 'condition' as const,
      parent: 'root',
      children: ['action1'],
      metadata: { threshold: 10000 },
    },
    {
      id: 'step2',
      description: 'Check timeline requirements',
      decision_type: 'condition' as const,
      parent: 'root',
      children: ['action2'],
    },
    {
      id: 'action1',
      description: 'Approve request',
      decision_type: 'action' as const,
      parent: 'step1',
    },
    {
      id: 'action2',
      description: 'Defer to later',
      decision_type: 'action' as const,
      parent: 'step2',
    },
  ];

  it('should generate text visualization', async () => {
    const result = await visualizeReasoning({
      decision_path: samplePath,
      format: 'text',
    });

    expect(result.visualization).toContain('Decision Tree Visualization');
    expect(result.visualization).toContain('Start analysis');
    expect(result.format).toBe('text');
    expect(result.node_count).toBe(5);
    expect(result.depth).toBeGreaterThan(0);
  });

  it('should generate Mermaid diagram', async () => {
    const result = await visualizeReasoning({
      decision_path: samplePath,
      format: 'mermaid',
    });

    expect(result.visualization).toContain('graph TD');
    expect(result.visualization).toContain('root');
    expect(result.visualization).toContain('-->');
    expect(result.format).toBe('mermaid');
  });

  it('should generate JSON visualization', async () => {
    const result = await visualizeReasoning({
      decision_path: samplePath,
      format: 'json',
    });

    const parsed = JSON.parse(result.visualization);
    expect(parsed.trees).toBeDefined();
    expect(parsed.metadata.total_nodes).toBe(5);
    expect(result.format).toBe('json');
  });

  it('should calculate tree depth correctly', async () => {
    const deepPath = [
      { id: 'n1', description: 'Level 1', children: ['n2'] },
      { id: 'n2', description: 'Level 2', parent: 'n1', children: ['n3'] },
      { id: 'n3', description: 'Level 3', parent: 'n2', children: ['n4'] },
      { id: 'n4', description: 'Level 4', parent: 'n3' },
    ];

    const result = await visualizeReasoning({
      decision_path: deepPath,
      format: 'text',
    });

    expect(result.depth).toBe(4);
  });

  it('should handle single node path', async () => {
    const singleNode = [
      { id: 'only', description: 'Single decision' },
    ];

    const result = await visualizeReasoning({
      decision_path: singleNode,
      format: 'text',
    });

    expect(result.node_count).toBe(1);
    expect(result.depth).toBe(1);
  });

  it('should include metadata in visualizations', async () => {
    const result = await visualizeReasoning({
      decision_path: samplePath,
      format: 'text',
    });

    expect(result.visualization).toContain('threshold: 10000');
  });
});
