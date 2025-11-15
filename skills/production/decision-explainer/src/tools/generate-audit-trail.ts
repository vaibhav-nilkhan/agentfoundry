import { z } from 'zod';

/**
 * Generate Audit Trail - Create compliance-ready decision logs
 *
 * Produces structured audit logs that meet SOC 2, HIPAA, GDPR, and general
 * compliance requirements for AI agent decision tracking.
 */

const ExecutionEventSchema = z.object({
  timestamp: z.string().datetime().or(z.number()),
  event_type: z.string(),
  agent_id: z.string().optional(),
  action: z.string(),
  input_data: z.record(z.any()).optional(),
  output_data: z.record(z.any()).optional(),
  user_id: z.string().optional(),
  success: z.boolean().optional(),
  error: z.string().optional(),
});

export const GenerateAuditTrailInputSchema = z.object({
  execution_history: z.array(ExecutionEventSchema),
  compliance_standard: z.enum(['soc2', 'hipaa', 'gdpr', 'general']).default('general'),
  include_pii: z.boolean().default(false),
});

export const GenerateAuditTrailOutputSchema = z.object({
  audit_log: z.array(z.object({
    log_id: z.string(),
    timestamp: z.string().datetime(),
    event_type: z.string(),
    actor: z.string(),
    action: z.string(),
    resource: z.string().optional(),
    outcome: z.string(),
    details: z.record(z.any()).optional(),
    compliance_tags: z.array(z.string()),
  })),
  compliance_status: z.enum(['compliant', 'needs_review', 'non_compliant']),
  recommendations: z.array(z.object({
    type: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    description: z.string(),
  })),
  summary: z.object({
    total_events: z.number(),
    time_range: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }),
    unique_actors: z.number(),
    success_rate: z.number().min(0).max(1),
  }),
});

export type GenerateAuditTrailInput = z.infer<typeof GenerateAuditTrailInputSchema>;
export type GenerateAuditTrailOutput = z.infer<typeof GenerateAuditTrailOutputSchema>;

type ExecutionEvent = z.infer<typeof ExecutionEventSchema>;

/**
 * Generate unique log ID
 */
function generateLogId(index: number, timestamp: string | number): string {
  const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  return `audit_${ts}_${index.toString().padStart(6, '0')}`;
}

/**
 * Normalize timestamp to ISO string
 */
function normalizeTimestamp(timestamp: string | number): string {
  if (typeof timestamp === 'number') {
    return new Date(timestamp).toISOString();
  }
  return new Date(timestamp).toISOString();
}

/**
 * Redact PII if needed
 */
function redactPII(data: any, includePii: boolean): any {
  if (includePii || !data) return data;

  const redacted = { ...data };
  const piiKeys = ['email', 'phone', 'ssn', 'credit_card', 'password', 'api_key', 'token'];

  for (const key of Object.keys(redacted)) {
    if (piiKeys.some(piiKey => key.toLowerCase().includes(piiKey))) {
      redacted[key] = '[REDACTED]';
    }
  }

  return redacted;
}

/**
 * Get compliance tags based on standard
 */
function getComplianceTags(
  event: ExecutionEvent,
  standard: string
): string[] {
  const tags: string[] = [];

  // Common tags
  tags.push('audit_trail');

  // Standard-specific tags
  if (standard === 'soc2') {
    tags.push('soc2_cc6.1'); // Logical access controls
    if (event.user_id) {
      tags.push('soc2_cc6.2'); // User authentication
    }
    if (event.success === false) {
      tags.push('soc2_cc7.2'); // System monitoring
    }
  } else if (standard === 'hipaa') {
    tags.push('hipaa_164.308'); // Administrative safeguards
    tags.push('hipaa_164.312'); // Technical safeguards
    if (event.input_data || event.output_data) {
      tags.push('hipaa_164.530'); // PHI access tracking
    }
  } else if (standard === 'gdpr') {
    tags.push('gdpr_article_30'); // Records of processing
    if (event.user_id) {
      tags.push('gdpr_article_15'); // Right of access
    }
    tags.push('gdpr_accountability');
  }

  return tags;
}

/**
 * Determine compliance status
 */
function determineComplianceStatus(
  auditLog: any[],
  standard: string
): 'compliant' | 'needs_review' | 'non_compliant' {
  // Check for required fields
  const hasTimestamps = auditLog.every(log => log.timestamp);
  const hasActors = auditLog.every(log => log.actor);
  const hasOutcomes = auditLog.every(log => log.outcome);

  if (!hasTimestamps || !hasActors || !hasOutcomes) {
    return 'non_compliant';
  }

  // Standard-specific checks
  if (standard === 'soc2' || standard === 'hipaa') {
    // Check if user IDs are tracked
    const hasUserTracking = auditLog.some(log => log.actor.includes('user'));
    if (!hasUserTracking && auditLog.length > 5) {
      return 'needs_review';
    }
  }

  if (standard === 'gdpr') {
    // Check if data processing is documented
    const hasDataProcessing = auditLog.some(log =>
      log.details && Object.keys(log.details).length > 0
    );
    if (!hasDataProcessing) {
      return 'needs_review';
    }
  }

  return 'compliant';
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  auditLog: any[],
  complianceStatus: string,
  standard: string
): Array<{ type: string; priority: 'low' | 'medium' | 'high'; description: string }> {
  const recommendations: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
  }> = [];

  if (complianceStatus === 'non_compliant') {
    recommendations.push({
      type: 'critical',
      priority: 'high',
      description: 'Missing required audit fields. Ensure all events have timestamp, actor, and outcome.',
    });
  }

  // Check retention
  if (auditLog.length > 0) {
    const oldestLog = new Date(auditLog[0].timestamp);
    const newestLog = new Date(auditLog[auditLog.length - 1].timestamp);
    const daysDiff = (newestLog.getTime() - oldestLog.getTime()) / (1000 * 60 * 60 * 24);

    const retentionRequirements: Record<string, number> = {
      soc2: 365,
      hipaa: 2190, // 6 years
      gdpr: 365,
      general: 90,
    };

    const required = retentionRequirements[standard];
    if (daysDiff < required / 2) {
      recommendations.push({
        type: 'retention',
        priority: 'medium',
        description: `Ensure audit logs are retained for at least ${required} days per ${standard.toUpperCase()} requirements.`,
      });
    }
  }

  // Check for encryption
  if (standard === 'hipaa' || standard === 'gdpr') {
    recommendations.push({
      type: 'security',
      priority: 'high',
      description: 'Ensure audit logs are encrypted at rest and in transit.',
    });
  }

  // Check for regular reviews
  recommendations.push({
    type: 'process',
    priority: 'medium',
    description: 'Implement regular audit log reviews (monthly minimum) to detect anomalies.',
  });

  return recommendations;
}

/**
 * Main audit trail generation function
 */
export async function run(input: GenerateAuditTrailInput): Promise<GenerateAuditTrailOutput> {
  // Validate input
  const validated = GenerateAuditTrailInputSchema.parse(input);

  const { execution_history, compliance_standard, include_pii } = validated;

  if (execution_history.length === 0) {
    throw new Error('Execution history is empty. Cannot generate audit trail.');
  }

  // Build audit log entries
  const auditLog = execution_history.map((event, index) => {
    const timestamp = normalizeTimestamp(event.timestamp);
    const actor = event.agent_id || event.user_id || 'system';
    const outcome = event.success === false ? 'failure' : 'success';

    // Redact PII if needed
    const details: Record<string, any> = {};
    if (event.input_data) {
      details.input = redactPII(event.input_data, include_pii);
    }
    if (event.output_data) {
      details.output = redactPII(event.output_data, include_pii);
    }
    if (event.error) {
      details.error = event.error;
    }

    return {
      log_id: generateLogId(index, event.timestamp),
      timestamp,
      event_type: event.event_type,
      actor,
      action: event.action,
      resource: event.input_data ? Object.keys(event.input_data)[0] : undefined,
      outcome,
      details: Object.keys(details).length > 0 ? details : undefined,
      compliance_tags: getComplianceTags(event, compliance_standard),
    };
  });

  // Determine compliance status
  const complianceStatus = determineComplianceStatus(auditLog, compliance_standard);

  // Generate recommendations
  const recommendations = generateRecommendations(auditLog, complianceStatus, compliance_standard);

  // Calculate summary
  const timestamps = auditLog.map(log => new Date(log.timestamp).getTime());
  const uniqueActors = new Set(auditLog.map(log => log.actor)).size;
  const successCount = auditLog.filter(log => log.outcome === 'success').length;

  return {
    audit_log: auditLog,
    compliance_status: complianceStatus,
    recommendations,
    summary: {
      total_events: auditLog.length,
      time_range: {
        start: new Date(Math.min(...timestamps)).toISOString(),
        end: new Date(Math.max(...timestamps)).toISOString(),
      },
      unique_actors: uniqueActors,
      success_rate: Math.round((successCount / auditLog.length) * 100) / 100,
    },
  };
}
