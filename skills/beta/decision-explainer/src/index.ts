/**
 * Decision Explainer - Provide step-by-step decision breakdowns and audit trails
 *
 * This skill provides enterprise-grade decision transparency and compliance:
 * - Step-by-step reasoning explanations with alternatives analysis
 * - Confidence scoring with uncertainty factor identification
 * - Compliance-ready audit trails (SOC 2, HIPAA, GDPR)
 * - Visual decision tree representations
 *
 * @packageDocumentation
 */

export { run as explainDecision, ExplainDecisionInput, ExplainDecisionOutput } from './tools/explain-decision';
export { run as scoreConfidence, ScoreConfidenceInput, ScoreConfidenceOutput } from './tools/score-confidence';
export { run as generateAuditTrail, GenerateAuditTrailInput, GenerateAuditTrailOutput } from './tools/generate-audit-trail';
export { run as visualizeReasoning, VisualizeReasoningInput, VisualizeReasoningOutput } from './tools/visualize-reasoning';

// Re-export tool schemas for runtime validation
export { ExplainDecisionInputSchema, ExplainDecisionOutputSchema } from './tools/explain-decision';
export { ScoreConfidenceInputSchema, ScoreConfidenceOutputSchema } from './tools/score-confidence';
export { GenerateAuditTrailInputSchema, GenerateAuditTrailOutputSchema } from './tools/generate-audit-trail';
export { VisualizeReasoningInputSchema, VisualizeReasoningOutputSchema } from './tools/visualize-reasoning';
