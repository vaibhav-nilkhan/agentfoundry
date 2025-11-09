export interface HealthMetrics {
  step_durations_ms: number[];
  error_count: number;
  warning_count: number;
  memory_usage_mb?: number;
  cpu_usage_percent?: number;
  api_call_count?: number;
}

export interface HealthThresholds {
  max_step_duration_ms: number;
  max_error_rate: number;
  max_memory_mb: number;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  score: number;
  confidence: number;
}

export interface Anomaly {
  metric: string;
  current_value: number;
  expected_value: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface FailurePrediction {
  likely_to_fail: boolean;
  probability: number;
  predicted_failure_time_minutes?: number;
  predicted_failure_type?: string;
}

export class HealthMonitor {
  analyzeHealth(
    metrics: HealthMetrics,
    thresholds: HealthThresholds
  ): HealthStatus {
    let healthScore = 100;
    const penalties: number[] = [];

    // Analyze step durations
    if (metrics.step_durations_ms.length > 0) {
      const avgDuration = metrics.step_durations_ms.reduce((a, b) => a + b, 0) / metrics.step_durations_ms.length;
      if (avgDuration > thresholds.max_step_duration_ms) {
        const penalty = Math.min(30, (avgDuration / thresholds.max_step_duration_ms - 1) * 20);
        penalties.push(penalty);
      }
    }

    // Analyze error rate
    const totalSteps = metrics.step_durations_ms.length || 1;
    const errorRate = metrics.error_count / totalSteps;
    if (errorRate > thresholds.max_error_rate) {
      const penalty = Math.min(40, (errorRate - thresholds.max_error_rate) * 100);
      penalties.push(penalty);
    }

    // Analyze memory usage
    if (metrics.memory_usage_mb && metrics.memory_usage_mb > thresholds.max_memory_mb) {
      const penalty = Math.min(30, (metrics.memory_usage_mb / thresholds.max_memory_mb - 1) * 25);
      penalties.push(penalty);
    }

    // Calculate final score
    healthScore = Math.max(0, healthScore - penalties.reduce((a, b) => a + b, 0));

    // Determine overall status
    let overall: 'healthy' | 'degraded' | 'critical';
    if (healthScore >= 80) {
      overall = 'healthy';
    } else if (healthScore >= 50) {
      overall = 'degraded';
    } else {
      overall = 'critical';
    }

    // Confidence based on data availability
    const confidence = Math.min(100, 50 + (totalSteps * 5));

    return {
      overall,
      score: Math.round(healthScore),
      confidence: Math.round(confidence)
    };
  }

  detectAnomalies(
    metrics: HealthMetrics,
    thresholds: HealthThresholds
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Check step durations
    if (metrics.step_durations_ms.length > 0) {
      const avgDuration = metrics.step_durations_ms.reduce((a, b) => a + b, 0) / metrics.step_durations_ms.length;
      const expectedDuration = thresholds.max_step_duration_ms * 0.5; // Expected is 50% of max

      if (avgDuration > thresholds.max_step_duration_ms) {
        anomalies.push({
          metric: 'step_duration',
          current_value: Math.round(avgDuration),
          expected_value: Math.round(expectedDuration),
          severity: avgDuration > thresholds.max_step_duration_ms * 1.5 ? 'high' : 'medium',
          description: `Average step duration (${Math.round(avgDuration)}ms) exceeds threshold (${thresholds.max_step_duration_ms}ms)`
        });
      }
    }

    // Check error rate
    const totalSteps = metrics.step_durations_ms.length || 1;
    const errorRate = metrics.error_count / totalSteps;
    if (errorRate > thresholds.max_error_rate) {
      anomalies.push({
        metric: 'error_rate',
        current_value: Math.round(errorRate * 100),
        expected_value: Math.round(thresholds.max_error_rate * 100),
        severity: errorRate > thresholds.max_error_rate * 2 ? 'high' : 'medium',
        description: `Error rate (${Math.round(errorRate * 100)}%) exceeds threshold (${Math.round(thresholds.max_error_rate * 100)}%)`
      });
    }

    // Check memory
    if (metrics.memory_usage_mb && metrics.memory_usage_mb > thresholds.max_memory_mb) {
      anomalies.push({
        metric: 'memory_usage',
        current_value: Math.round(metrics.memory_usage_mb),
        expected_value: Math.round(thresholds.max_memory_mb * 0.7),
        severity: metrics.memory_usage_mb > thresholds.max_memory_mb * 1.2 ? 'high' : 'medium',
        description: `Memory usage (${Math.round(metrics.memory_usage_mb)}MB) exceeds threshold (${thresholds.max_memory_mb}MB)`
      });
    }

    // Check warning count
    if (metrics.warning_count > 5) {
      anomalies.push({
        metric: 'warning_count',
        current_value: metrics.warning_count,
        expected_value: 0,
        severity: metrics.warning_count > 10 ? 'medium' : 'low',
        description: `High number of warnings (${metrics.warning_count}) detected`
      });
    }

    return anomalies;
  }

  predictFailure(
    metrics: HealthMetrics,
    healthStatus: HealthStatus,
    anomalies: Anomaly[],
    predictionWindowMinutes: number
  ): FailurePrediction {
    // Simple heuristic-based prediction
    let failureProbability = 0;

    // Factor 1: Health score
    if (healthStatus.score < 30) {
      failureProbability += 60;
    } else if (healthStatus.score < 50) {
      failureProbability += 40;
    } else if (healthStatus.score < 70) {
      failureProbability += 20;
    }

    // Factor 2: Number of anomalies
    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high').length;
    failureProbability += highSeverityAnomalies * 15;
    failureProbability += anomalies.length * 5;

    // Factor 3: Error trend
    const totalSteps = metrics.step_durations_ms.length || 1;
    const errorRate = metrics.error_count / totalSteps;
    if (errorRate > 0.3) {
      failureProbability += 25;
    }

    // Cap at 95%
    failureProbability = Math.min(95, failureProbability);

    const likelyToFail = failureProbability > 50;

    let predictedFailureType: string | undefined;
    if (likelyToFail) {
      // Determine most likely failure type from anomalies
      const criticalAnomaly = anomalies.find(a => a.severity === 'high');
      if (criticalAnomaly) {
        predictedFailureType = criticalAnomaly.metric;
      } else if (errorRate > 0.2) {
        predictedFailureType = 'error_cascade';
      } else {
        predictedFailureType = 'degraded_performance';
      }
    }

    // Estimate time to failure based on current trajectory
    let predictedFailureTimeMinutes: number | undefined;
    if (likelyToFail) {
      // Simple linear estimation based on probability
      predictedFailureTimeMinutes = Math.round(
        predictionWindowMinutes * (1 - failureProbability / 100)
      );
    }

    return {
      likely_to_fail: likelyToFail,
      probability: Math.round(failureProbability),
      predicted_failure_time_minutes: predictedFailureTimeMinutes,
      predicted_failure_type: predictedFailureType
    };
  }

  generateRecommendations(
    healthStatus: HealthStatus,
    anomalies: Anomaly[],
    prediction: FailurePrediction
  ): { immediate_actions: string[]; preventive_measures: string[] } {
    const immediateActions: string[] = [];
    const preventiveMeasures: string[] = [];

    // Immediate actions based on health status
    if (healthStatus.overall === 'critical') {
      immediateActions.push('Consider stopping workflow to prevent cascade failure');
      immediateActions.push('Review error logs for root cause');
    }

    if (prediction.likely_to_fail) {
      immediateActions.push(`Failure predicted in ${prediction.predicted_failure_time_minutes} minutes - prepare recovery strategy`);
    }

    // Actions based on specific anomalies
    for (const anomaly of anomalies) {
      if (anomaly.metric === 'step_duration' && anomaly.severity === 'high') {
        immediateActions.push('Investigate slow steps - consider timeout adjustments');
      }
      if (anomaly.metric === 'error_rate' && anomaly.severity === 'high') {
        immediateActions.push('High error rate detected - enable aggressive retry logic');
      }
      if (anomaly.metric === 'memory_usage' && anomaly.severity === 'high') {
        immediateActions.push('Memory approaching limit - consider scaling up or clearing cache');
      }
    }

    // Preventive measures
    if (healthStatus.score < 80) {
      preventiveMeasures.push('Implement monitoring alerts for key metrics');
      preventiveMeasures.push('Set up automated health checks');
    }

    if (anomalies.some(a => a.metric === 'error_rate')) {
      preventiveMeasures.push('Review error handling logic');
      preventiveMeasures.push('Add circuit breakers for failing services');
    }

    if (anomalies.some(a => a.metric === 'step_duration')) {
      preventiveMeasures.push('Optimize slow operations');
      preventiveMeasures.push('Consider parallel execution where possible');
    }

    // Default recommendations
    if (immediateActions.length === 0 && healthStatus.overall === 'healthy') {
      immediateActions.push('No immediate action required - system is healthy');
    }

    if (preventiveMeasures.length === 0) {
      preventiveMeasures.push('Continue monitoring key metrics');
      preventiveMeasures.push('Maintain current operational practices');
    }

    return {
      immediate_actions: immediateActions,
      preventive_measures: preventiveMeasures
    };
  }
}
