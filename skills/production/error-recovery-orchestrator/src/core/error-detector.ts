export interface ErrorClassification {
  type: 'transient' | 'permanent' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_recoverable: boolean;
  confidence: number;
}

export interface RootCause {
  category: 'network' | 'auth' | 'data' | 'logic' | 'resource' | 'unknown';
  description: string;
  likely_causes: string[];
}

export interface RecoveryRecommendation {
  strategy: 'retry' | 'rollback' | 'fallback' | 'skip' | 'manual';
  estimated_success_rate: number;
  reasoning: string;
}

export class ErrorDetector {
  private knownErrorPatterns = new Map<RegExp, ErrorClassification>([
    // Network errors (transient)
    [/ECONNREFUSED|ETIMEDOUT|ENOTFOUND/, {
      type: 'transient',
      severity: 'medium',
      is_recoverable: true,
      confidence: 90
    }],
    [/429|rate.*limit|too.*many.*requests/i, {
      type: 'transient',
      severity: 'medium',
      is_recoverable: true,
      confidence: 95
    }],
    [/503|service.*unavailable|temporarily.*unavailable/i, {
      type: 'transient',
      severity: 'high',
      is_recoverable: true,
      confidence: 90
    }],

    // Auth errors (permanent)
    [/401|unauthorized|invalid.*token|expired.*token/i, {
      type: 'permanent',
      severity: 'high',
      is_recoverable: false,
      confidence: 95
    }],
    [/403|forbidden|permission.*denied|access.*denied/i, {
      type: 'permanent',
      severity: 'high',
      is_recoverable: false,
      confidence: 95
    }],

    // Data errors (permanent)
    [/404|not.*found|does.*not.*exist/i, {
      type: 'permanent',
      severity: 'medium',
      is_recoverable: false,
      confidence: 90
    }],
    [/400|bad.*request|invalid.*input|validation.*failed/i, {
      type: 'permanent',
      severity: 'medium',
      is_recoverable: false,
      confidence: 85
    }],

    // Resource errors (transient/critical)
    [/out.*of.*memory|memory.*exceeded|heap.*out/i, {
      type: 'critical',
      severity: 'critical',
      is_recoverable: false,
      confidence: 95
    }],
    [/disk.*full|no.*space.*left|quota.*exceeded/i, {
      type: 'critical',
      severity: 'critical',
      is_recoverable: false,
      confidence: 90
    }],

    // Logic errors (permanent)
    [/syntax.*error|parse.*error|cannot.*read.*property|undefined/i, {
      type: 'permanent',
      severity: 'high',
      is_recoverable: false,
      confidence: 80
    }],
  ]);

  classifyError(errorMessage: string, errorCode?: string): ErrorClassification {
    const combined = `${errorMessage} ${errorCode || ''}`;

    // Check known patterns
    for (const [pattern, classification] of this.knownErrorPatterns.entries()) {
      if (pattern.test(combined)) {
        return classification;
      }
    }

    // Default classification for unknown errors
    return {
      type: 'permanent',
      severity: 'medium',
      is_recoverable: false,
      confidence: 50
    };
  }

  identifyRootCause(errorMessage: string, errorCode?: string): RootCause {
    const combined = `${errorMessage} ${errorCode || ''}`.toLowerCase();

    if (/network|connection|timeout|econnrefused|enotfound/.test(combined)) {
      return {
        category: 'network',
        description: 'Network connectivity issue',
        likely_causes: [
          'Service is down or unreachable',
          'DNS resolution failure',
          'Firewall blocking connection',
          'Network timeout'
        ]
      };
    }

    if (/auth|token|unauthorized|forbidden|permission/.test(combined)) {
      return {
        category: 'auth',
        description: 'Authentication or authorization failure',
        likely_causes: [
          'Invalid or expired credentials',
          'Insufficient permissions',
          'Token not provided',
          'Token revoked'
        ]
      };
    }

    if (/rate.*limit|429|too.*many/.test(combined)) {
      return {
        category: 'resource',
        description: 'Rate limit or quota exceeded',
        likely_causes: [
          'Too many requests in short time',
          'API quota exhausted',
          'No rate limiting logic implemented'
        ]
      };
    }

    if (/not.*found|404|does.*not.*exist/.test(combined)) {
      return {
        category: 'data',
        description: 'Resource not found',
        likely_causes: [
          'Invalid resource identifier',
          'Resource was deleted',
          'Incorrect API endpoint',
          'Typo in resource path'
        ]
      };
    }

    if (/validation|invalid.*input|bad.*request|400/.test(combined)) {
      return {
        category: 'data',
        description: 'Invalid data or input validation failure',
        likely_causes: [
          'Missing required fields',
          'Invalid data format',
          'Data type mismatch',
          'Business logic validation failed'
        ]
      };
    }

    if (/memory|heap|oom|out.*of.*memory/.test(combined)) {
      return {
        category: 'resource',
        description: 'Memory exhaustion',
        likely_causes: [
          'Memory leak in application',
          'Processing too much data',
          'Insufficient allocated memory',
          'Infinite loop or recursion'
        ]
      };
    }

    if (/syntax|parse|undefined|cannot.*read/.test(combined)) {
      return {
        category: 'logic',
        description: 'Code logic or syntax error',
        likely_causes: [
          'Programming bug',
          'Unexpected data format',
          'Missing error handling',
          'Null/undefined access'
        ]
      };
    }

    return {
      category: 'unknown',
      description: 'Unknown error type',
      likely_causes: ['Error pattern not recognized']
    };
  }

  recommendRecoveryStrategy(
    classification: ErrorClassification,
    rootCause: RootCause,
    executionHistory?: Array<{ step: string; status: string; timestamp: string }>
  ): RecoveryRecommendation {
    // Critical errors should not be retried
    if (classification.severity === 'critical') {
      return {
        strategy: 'manual',
        estimated_success_rate: 0,
        reasoning: 'Critical error requires manual intervention'
      };
    }

    // Transient errors are good candidates for retry
    if (classification.type === 'transient') {
      // Check if this step has failed before
      const failureCount = executionHistory?.filter(h => h.status === 'failure').length || 0;

      if (failureCount >= 3) {
        return {
          strategy: 'fallback',
          estimated_success_rate: 60,
          reasoning: 'Multiple retry failures suggest need for alternative approach'
        };
      }

      return {
        strategy: 'retry',
        estimated_success_rate: classification.type === 'transient' ? 85 : 40,
        reasoning: rootCause.category === 'network'
          ? 'Network errors are often transient; retry with exponential backoff'
          : rootCause.category === 'resource'
          ? 'Rate limit is transient; retry with backoff'
          : 'Transient error likely to resolve with retry'
      };
    }

    // Permanent errors need different approaches
    if (classification.type === 'permanent') {
      if (rootCause.category === 'auth') {
        return {
          strategy: 'manual',
          estimated_success_rate: 0,
          reasoning: 'Authentication errors require credential update'
        };
      }

      if (rootCause.category === 'data') {
        return {
          strategy: 'fallback',
          estimated_success_rate: 50,
          reasoning: 'Data errors may need alternative data source or default values'
        };
      }

      if (rootCause.category === 'logic') {
        return {
          strategy: 'rollback',
          estimated_success_rate: 70,
          reasoning: 'Logic errors suggest invalid state; rollback and use different parameters'
        };
      }
    }

    // Default: try rollback
    return {
      strategy: 'rollback',
      estimated_success_rate: 60,
      reasoning: 'Error type uncertain; rollback to last known good state'
    };
  }
}
