import { z } from 'zod';
import { HealthMonitor } from '../core/health-monitor';

const inputSchema = z.object({
  workflow_id: z.string().describe('Unique workflow identifier'),
  metrics: z.object({
    step_durations_ms: z.array(z.number().int()),
    error_count: z.number().int().min(0),
    warning_count: z.number().int().min(0),
    memory_usage_mb: z.number().optional(),
    cpu_usage_percent: z.number().optional(),
    api_call_count: z.number().int().optional()
  }),
  thresholds: z.object({
    max_step_duration_ms: z.number().int().default(30000),
    max_error_rate: z.number().default(0.2),
    max_memory_mb: z.number().default(1024)
  }).optional(),
  prediction_window_minutes: z.number().int().optional().default(5).describe('How far ahead to predict')
});

type MonitorHealthInput = z.infer<typeof inputSchema>;

interface Anomaly {
  metric: string;
  current_value: number;
  expected_value: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface MonitorHealthOutput {
  health_status: {
    overall: 'healthy' | 'degraded' | 'critical';
    score: number;
    confidence: number;
  };
  anomalies_detected: Anomaly[];
  failure_prediction: {
    likely_to_fail: boolean;
    probability: number;
    predicted_failure_time_minutes?: number;
    predicted_failure_type?: string;
  };
  recommendations: {
    immediate_actions: string[];
    preventive_measures: string[];
  };
  metadata: {
    monitoring_started_at: string;
    data_points_analyzed: number;
  };
}

export async function run(input: MonitorHealthInput): Promise<MonitorHealthOutput> {
  const startedAt = new Date().toISOString();

  // Validate input
  const validated = inputSchema.parse(input);

  // Initialize health monitor
  const monitor = new HealthMonitor();

  // Set default thresholds if not provided
  const thresholds = validated.thresholds || {
    max_step_duration_ms: 30000,
    max_error_rate: 0.2,
    max_memory_mb: 1024
  };

  // Analyze health status
  const healthStatus = monitor.analyzeHealth(validated.metrics, thresholds);

  // Detect anomalies
  const anomalies = monitor.detectAnomalies(validated.metrics, thresholds);

  // Predict potential failures
  const prediction = monitor.predictFailure(
    validated.metrics,
    healthStatus,
    anomalies,
    validated.prediction_window_minutes
  );

  // Generate recommendations
  const recommendations = monitor.generateRecommendations(
    healthStatus,
    anomalies,
    prediction
  );

  // Count data points analyzed
  const dataPointsAnalyzed =
    validated.metrics.step_durations_ms.length +
    (validated.metrics.memory_usage_mb ? 1 : 0) +
    (validated.metrics.cpu_usage_percent ? 1 : 0) +
    (validated.metrics.api_call_count ? 1 : 0) +
    2; // error_count and warning_count

  return {
    health_status: {
      overall: healthStatus.overall,
      score: healthStatus.score,
      confidence: healthStatus.confidence
    },
    anomalies_detected: anomalies,
    failure_prediction: {
      likely_to_fail: prediction.likely_to_fail,
      probability: prediction.probability,
      predicted_failure_time_minutes: prediction.predicted_failure_time_minutes,
      predicted_failure_type: prediction.predicted_failure_type
    },
    recommendations: {
      immediate_actions: recommendations.immediate_actions,
      preventive_measures: recommendations.preventive_measures
    },
    metadata: {
      monitoring_started_at: startedAt,
      data_points_analyzed: dataPointsAnalyzed
    }
  };
}

export { inputSchema };
