export interface FailureData {
  failed_step: string;
  error_message: string;
  stack_trace?: string;
  execution_history: Array<{
    step: string;
    status: string;
    duration_ms: number;
    timestamp: string;
  }>;
}

export interface RecoveryAttempt {
  strategy: string;
  result: string;
  details?: any;
}

export interface PostmortemContext {
  user_id?: string;
  environment: 'dev' | 'staging' | 'production';
  agent_version: string;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  details: string;
}

export interface RootCauseAnalysis {
  primary_cause: string;
  contributing_factors: string[];
  why_it_happened: string;
}

export interface ImpactAssessment {
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_users?: number;
  downtime_minutes?: number;
  cost_impact_usd?: number;
}

export interface ActionItem {
  priority: 'low' | 'medium' | 'high';
  action: string;
  owner?: string;
  deadline?: string;
}

export interface Postmortem {
  incident_id: string;
  summary: string;
  timeline: TimelineEvent[];
  root_cause_analysis: RootCauseAnalysis;
  impact_assessment: ImpactAssessment;
  recovery_summary: {
    strategies_attempted: string[];
    successful_strategy?: string;
    total_recovery_time_ms: number;
  };
  lessons_learned: string[];
  action_items: ActionItem[];
}

export class PostmortemGenerator {
  generateIncidentId(workflowId: string): string {
    const timestamp = Date.now();
    return `INC-${workflowId}-${timestamp}`;
  }

  generateSummary(failureData: FailureData, recoveryAttempts: RecoveryAttempt[]): string {
    const stepName = failureData.failed_step;
    const errorType = this.categorizeError(failureData.error_message);
    const recoveryStatus = recoveryAttempts.some(a => a.result === 'success') ? 'recovered' : 'unrecovered';

    return `Workflow failure at step "${stepName}" due to ${errorType}. ` +
           `${recoveryAttempts.length} recovery attempt(s) made, status: ${recoveryStatus}. ` +
           `Incident duration: ${this.calculateIncidentDuration(failureData)}ms.`;
  }

  private categorizeError(errorMessage: string): string {
    const lower = errorMessage.toLowerCase();
    if (lower.includes('network') || lower.includes('timeout')) return 'network issue';
    if (lower.includes('auth') || lower.includes('permission')) return 'authentication failure';
    if (lower.includes('not found') || lower.includes('404')) return 'resource not found';
    if (lower.includes('rate limit')) return 'rate limit exceeded';
    if (lower.includes('memory')) return 'memory exhaustion';
    return 'unknown error';
  }

  private calculateIncidentDuration(failureData: FailureData): number {
    if (failureData.execution_history.length < 2) return 0;
    const first = new Date(failureData.execution_history[0].timestamp).getTime();
    const last = new Date(failureData.execution_history[failureData.execution_history.length - 1].timestamp).getTime();
    return last - first;
  }

  generateTimeline(
    failureData: FailureData,
    recoveryAttempts: RecoveryAttempt[]
  ): TimelineEvent[] {
    const timeline: TimelineEvent[] = [];

    // Add execution history
    for (const hist of failureData.execution_history) {
      timeline.push({
        timestamp: hist.timestamp,
        event: `Step: ${hist.step}`,
        details: `Status: ${hist.status}, Duration: ${hist.duration_ms}ms`
      });
    }

    // Add failure event
    timeline.push({
      timestamp: new Date().toISOString(),
      event: 'Failure Detected',
      details: `Step "${failureData.failed_step}" failed: ${failureData.error_message}`
    });

    // Add recovery attempts
    recoveryAttempts.forEach((attempt, index) => {
      timeline.push({
        timestamp: new Date(Date.now() + (index * 1000)).toISOString(),
        event: `Recovery Attempt ${index + 1}`,
        details: `Strategy: ${attempt.strategy}, Result: ${attempt.result}`
      });
    });

    return timeline;
  }

  analyzeRootCause(failureData: FailureData, context?: PostmortemContext): RootCauseAnalysis {
    const errorMessage = failureData.error_message.toLowerCase();
    let primaryCause = 'Unknown error';
    const contributingFactors: string[] = [];
    let whyItHappened = '';

    // Analyze error message
    if (errorMessage.includes('timeout') || errorMessage.includes('econnrefused')) {
      primaryCause = 'Network connectivity failure';
      contributingFactors.push('Service unreachable', 'Network instability');
      whyItHappened = 'The target service could not be reached within the timeout period, likely due to network issues or service downtime.';
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      primaryCause = 'API rate limit exceeded';
      contributingFactors.push('Too many requests', 'Missing rate limiting logic');
      whyItHappened = 'The workflow made too many API requests in a short time period, exceeding the provider\'s rate limits.';
    } else if (errorMessage.includes('auth') || errorMessage.includes('401') || errorMessage.includes('403')) {
      primaryCause = 'Authentication/authorization failure';
      contributingFactors.push('Invalid credentials', 'Expired token', 'Insufficient permissions');
      whyItHappened = 'The request was rejected due to missing or invalid authentication credentials.';
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      primaryCause = 'Resource not found';
      contributingFactors.push('Invalid identifier', 'Resource deleted', 'Incorrect endpoint');
      whyItHappened = 'The requested resource does not exist or has been removed.';
    } else if (errorMessage.includes('memory') || errorMessage.includes('heap')) {
      primaryCause = 'Memory exhaustion';
      contributingFactors.push('Memory leak', 'Insufficient resources', 'Large dataset');
      whyItHappened = 'The workflow consumed all available memory, likely due to processing large amounts of data or a memory leak.';
    }

    // Add execution history insights
    const failureCount = failureData.execution_history.filter(h => h.status === 'failure').length;
    if (failureCount > 1) {
      contributingFactors.push('Multiple previous failures in workflow');
    }

    // Add context-based factors
    if (context?.environment === 'production') {
      contributingFactors.push('Occurred in production environment');
    }

    return {
      primary_cause: primaryCause,
      contributing_factors: contributingFactors,
      why_it_happened: whyItHappened
    };
  }

  assessImpact(
    failureData: FailureData,
    context?: PostmortemContext
  ): ImpactAssessment {
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    // Determine severity
    const errorMessage = failureData.error_message.toLowerCase();
    if (errorMessage.includes('critical') || errorMessage.includes('fatal')) {
      severity = 'critical';
    } else if (errorMessage.includes('memory') || errorMessage.includes('crash')) {
      severity = 'high';
    } else if (context?.environment === 'production') {
      severity = 'high';
    } else if (errorMessage.includes('warning')) {
      severity = 'low';
    }

    // Estimate downtime
    const durationMs = this.calculateIncidentDuration(failureData);
    const downtimeMinutes = Math.ceil(durationMs / 60000);

    // Estimate cost (rough approximation)
    let costImpactUsd: number | undefined;
    if (context?.environment === 'production') {
      // Assume $100/hour downtime cost for production
      costImpactUsd = (downtimeMinutes / 60) * 100;
    }

    return {
      severity,
      downtime_minutes: downtimeMinutes,
      cost_impact_usd: costImpactUsd ? Math.round(costImpactUsd * 100) / 100 : undefined
    };
  }

  summarizeRecovery(recoveryAttempts: RecoveryAttempt[]): {
    strategies_attempted: string[];
    successful_strategy?: string;
    total_recovery_time_ms: number;
  } {
    const strategiesAttempted = recoveryAttempts.map(a => a.strategy);
    const successfulAttempt = recoveryAttempts.find(a => a.result === 'success');

    // Estimate recovery time (in real scenario, would track actual time)
    const totalRecoveryTimeMs = recoveryAttempts.length * 1000; // Rough estimate

    return {
      strategies_attempted: strategiesAttempted,
      successful_strategy: successfulAttempt?.strategy,
      total_recovery_time_ms: totalRecoveryTimeMs
    };
  }

  generateLessonsLearned(
    failureData: FailureData,
    rootCause: RootCauseAnalysis,
    recoveryAttempts: RecoveryAttempt[]
  ): string[] {
    const lessons: string[] = [];

    // Based on root cause
    if (rootCause.primary_cause.includes('rate limit')) {
      lessons.push('Implement rate limiting logic to prevent API quota exhaustion');
      lessons.push('Consider request queuing for high-volume operations');
    }

    if (rootCause.primary_cause.includes('Network')) {
      lessons.push('Add circuit breakers for unreliable external services');
      lessons.push('Implement timeout and retry strategies');
    }

    if (rootCause.primary_cause.includes('auth')) {
      lessons.push('Implement credential refresh logic before expiration');
      lessons.push('Add pre-flight checks for authentication status');
    }

    if (rootCause.primary_cause.includes('Memory')) {
      lessons.push('Implement streaming for large data processing');
      lessons.push('Add memory usage monitoring and alerts');
    }

    // Based on recovery success/failure
    if (recoveryAttempts.length > 0 && !recoveryAttempts.some(a => a.result === 'success')) {
      lessons.push('Current recovery strategies insufficient - need additional fallback options');
    }

    if (failureData.execution_history.filter(h => h.status === 'failure').length > 1) {
      lessons.push('Multiple failures indicate need for earlier intervention');
    }

    // Default lessons
    if (lessons.length === 0) {
      lessons.push('Improve error handling and logging for better diagnostics');
      lessons.push('Consider adding proactive health checks');
    }

    return lessons;
  }

  generateActionItems(
    rootCause: RootCauseAnalysis,
    impact: ImpactAssessment,
    lessonsLearned: string[]
  ): ActionItem[] {
    const actionItems: ActionItem[] = [];

    // High priority items for high/critical severity
    if (impact.severity === 'high' || impact.severity === 'critical') {
      actionItems.push({
        priority: 'high',
        action: 'Implement immediate fix for root cause: ' + rootCause.primary_cause,
        deadline: '24 hours'
      });

      actionItems.push({
        priority: 'high',
        action: 'Add monitoring alerts to detect similar failures early',
        deadline: '48 hours'
      });
    }

    // Convert lessons learned to action items
    lessonsLearned.slice(0, 3).forEach((lesson, index) => {
      actionItems.push({
        priority: index === 0 ? 'high' : 'medium',
        action: lesson
      });
    });

    // Add documentation action
    if (rootCause.primary_cause !== 'Unknown error') {
      actionItems.push({
        priority: 'low',
        action: 'Update runbook with failure scenario and resolution steps'
      });
    }

    return actionItems;
  }
}
