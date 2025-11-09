import * as detectFailure from '../src/tools/detect-failure';
import * as executeRecovery from '../src/tools/execute-recovery';
import * as monitorHealth from '../src/tools/monitor-health';
import * as generatePostmortem from '../src/tools/generate-postmortem';

describe('Error Recovery Orchestrator', () => {
  describe('detect_failure tool', () => {
    it('should detect transient network errors', async () => {
      const input = {
        error_message: 'ECONNREFUSED: Connection refused',
        step_number: 3,
        workflow_context: {
          total_steps: 10,
          completed_steps: 2,
          previous_step: 'fetch_data',
          next_step: 'process_data'
        }
      };

      const result = await detectFailure.run(input);

      expect(result.failure_classification.type).toBe('transient');
      expect(result.failure_classification.is_recoverable).toBe(true);
      expect(result.root_cause.category).toBe('network');
      expect(result.recovery_recommendation.strategy).toBe('retry');
    });

    it('should detect permanent auth errors', async () => {
      const input = {
        error_message: 'HTTP 401: Unauthorized - invalid token',
        error_code: '401',
        step_number: 2,
        workflow_context: {
          total_steps: 5,
          completed_steps: 1,
          previous_step: 'init',
          next_step: 'api_call'
        }
      };

      const result = await detectFailure.run(input);

      expect(result.failure_classification.type).toBe('permanent');
      expect(result.failure_classification.is_recoverable).toBe(false);
      expect(result.root_cause.category).toBe('auth');
      expect(result.recovery_recommendation.strategy).toBe('manual');
    });

    it('should detect rate limit errors and recommend retry', async () => {
      const input = {
        error_message: 'Rate limit exceeded: 429 Too Many Requests',
        step_number: 5,
        workflow_context: {
          total_steps: 8,
          completed_steps: 4,
          previous_step: 'api_call_batch',
          next_step: 'process_results'
        }
      };

      const result = await detectFailure.run(input);

      expect(result.failure_classification.type).toBe('transient');
      expect(result.failure_classification.is_recoverable).toBe(true);
      expect(result.root_cause.category).toBe('resource');
      expect(result.recovery_recommendation.strategy).toBe('retry');
      expect(result.recovery_recommendation.estimated_success_rate).toBeGreaterThan(80);
    });

    it('should include metadata with timing information', async () => {
      const input = {
        error_message: 'Test error',
        step_number: 1,
        workflow_context: {
          total_steps: 3,
          completed_steps: 0,
          previous_step: 'start',
          next_step: 'step1'
        }
      };

      const result = await detectFailure.run(input);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.analyzed_at).toBeDefined();
      expect(result.metadata.analysis_time_ms).toBeGreaterThanOrEqual(0);
    });
  });

  describe('execute_recovery tool', () => {
    it('should execute retry recovery successfully', async () => {
      const input = {
        strategy: 'retry' as const,
        workflow_state: {
          current_step: 3,
          total_steps: 10,
          state_snapshot: { data: 'test' },
          failed_step_id: 'step_3'
        },
        retry_config: {
          max_attempts: 3,
          backoff_strategy: 'exponential' as const,
          initial_delay_ms: 100,
          max_delay_ms: 1000
        }
      };

      const result = await executeRecovery.run(input);

      expect(result.recovery_result.strategy_used).toBe('retry');
      expect(result.execution_log.length).toBeGreaterThan(0);
      expect(result.new_workflow_state.can_continue).toBeDefined();
      expect(result.recommendations.should_continue).toBeDefined();
    });

    it('should execute rollback recovery', async () => {
      const input = {
        strategy: 'rollback' as const,
        workflow_state: {
          current_step: 5,
          total_steps: 10,
          state_snapshot: { data: 'test', step: 5 },
          failed_step_id: 'step_5'
        },
        rollback_config: {
          target_step: 3,
          cleanup_actions: ['cleanup_temp_files', 'reset_cache']
        }
      };

      const result = await executeRecovery.run(input);

      expect(result.recovery_result.strategy_used).toBe('rollback');
      expect(result.new_workflow_state.current_step).toBeLessThanOrEqual(input.workflow_state.current_step);
      expect(result.recovery_result.status).toBe('success');
    });

    it('should execute fallback recovery', async () => {
      const input = {
        strategy: 'fallback' as const,
        workflow_state: {
          current_step: 4,
          total_steps: 8,
          state_snapshot: { primary: 'failed' },
          failed_step_id: 'step_4'
        },
        fallback_config: {
          alternative_step: 'backup_handler',
          alternative_parameters: { mode: 'safe' }
        }
      };

      const result = await executeRecovery.run(input);

      expect(result.recovery_result.strategy_used).toBe('fallback');
      expect(['success', 'partial_success']).toContain(result.recovery_result.status);
    });

    it('should execute skip recovery', async () => {
      const input = {
        strategy: 'skip' as const,
        workflow_state: {
          current_step: 6,
          total_steps: 10,
          state_snapshot: { skippable: true },
          failed_step_id: 'step_6'
        }
      };

      const result = await executeRecovery.run(input);

      expect(result.recovery_result.strategy_used).toBe('skip');
      expect(result.new_workflow_state.current_step).toBeGreaterThan(input.workflow_state.current_step);
    });

    it('should include execution log with timing', async () => {
      const input = {
        strategy: 'retry' as const,
        workflow_state: {
          current_step: 2,
          total_steps: 5,
          state_snapshot: {},
          failed_step_id: 'step_2'
        }
      };

      const result = await executeRecovery.run(input);

      expect(result.execution_log).toBeDefined();
      expect(Array.isArray(result.execution_log)).toBe(true);
      result.execution_log.forEach(log => {
        expect(log.attempt).toBeGreaterThan(0);
        expect(log.duration_ms).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('monitor_health tool', () => {
    it('should return healthy status for good metrics', async () => {
      const input = {
        workflow_id: 'wf_123',
        metrics: {
          step_durations_ms: [100, 150, 120, 90, 110],
          error_count: 0,
          warning_count: 1,
          memory_usage_mb: 256,
          cpu_usage_percent: 45
        },
        thresholds: {
          max_step_duration_ms: 1000,
          max_error_rate: 0.2,
          max_memory_mb: 1024
        }
      };

      const result = await monitorHealth.run(input);

      expect(result.health_status.overall).toBe('healthy');
      expect(result.health_status.score).toBeGreaterThan(70);
      expect(result.failure_prediction.likely_to_fail).toBe(false);
    });

    it('should return degraded status for concerning metrics', async () => {
      const input = {
        workflow_id: 'wf_456',
        metrics: {
          step_durations_ms: [15000, 20000, 18000],
          error_count: 2,
          warning_count: 5,
          memory_usage_mb: 900
        },
        thresholds: {
          max_step_duration_ms: 10000,
          max_error_rate: 0.2,
          max_memory_mb: 1024
        }
      };

      const result = await monitorHealth.run(input);

      expect(['degraded', 'critical']).toContain(result.health_status.overall);
      expect(result.health_status.score).toBeLessThan(80);
      expect(result.anomalies_detected.length).toBeGreaterThan(0);
    });

    it('should predict failures for critical metrics', async () => {
      const input = {
        workflow_id: 'wf_789',
        metrics: {
          step_durations_ms: [50000, 60000, 55000],
          error_count: 10,
          warning_count: 15,
          memory_usage_mb: 1200
        },
        thresholds: {
          max_step_duration_ms: 30000,
          max_error_rate: 0.1,
          max_memory_mb: 1024
        },
        prediction_window_minutes: 5
      };

      const result = await monitorHealth.run(input);

      expect(result.health_status.overall).toBe('critical');
      expect(result.failure_prediction.likely_to_fail).toBe(true);
      expect(result.failure_prediction.probability).toBeGreaterThan(50);
    });

    it('should detect anomalies in metrics', async () => {
      const input = {
        workflow_id: 'wf_anomaly',
        metrics: {
          step_durations_ms: [100, 150, 35000], // One very slow step
          error_count: 5,
          warning_count: 10
        },
        thresholds: {
          max_step_duration_ms: 5000,
          max_error_rate: 0.1,
          max_memory_mb: 1024
        }
      };

      const result = await monitorHealth.run(input);

      expect(result.anomalies_detected.length).toBeGreaterThan(0);
      const stepDurationAnomaly = result.anomalies_detected.find(a => a.metric === 'step_duration');
      expect(stepDurationAnomaly).toBeDefined();
    });

    it('should provide actionable recommendations', async () => {
      const input = {
        workflow_id: 'wf_recommendations',
        metrics: {
          step_durations_ms: [20000, 25000],
          error_count: 3,
          warning_count: 7
        }
      };

      const result = await monitorHealth.run(input);

      expect(result.recommendations.immediate_actions).toBeDefined();
      expect(result.recommendations.preventive_measures).toBeDefined();
      expect(result.recommendations.immediate_actions.length).toBeGreaterThan(0);
    });
  });

  describe('generate_postmortem tool', () => {
    it('should generate complete postmortem report', async () => {
      const input = {
        workflow_id: 'wf_001',
        failure_data: {
          failed_step: 'api_call',
          error_message: 'ETIMEDOUT: Connection timed out',
          execution_history: [
            { step: 'init', status: 'success', duration_ms: 100, timestamp: '2025-01-01T10:00:00Z' },
            { step: 'validate', status: 'success', duration_ms: 50, timestamp: '2025-01-01T10:00:01Z' },
            { step: 'api_call', status: 'failure', duration_ms: 30000, timestamp: '2025-01-01T10:00:31Z' }
          ]
        },
        recovery_attempts: [
          { strategy: 'retry', result: 'failure', details: { attempts: 3 } },
          { strategy: 'fallback', result: 'success', details: { alternative: 'cache' } }
        ],
        context: {
          environment: 'production' as const,
          agent_version: '1.0.0'
        }
      };

      const result = await generatePostmortem.run(input);

      expect(result.postmortem.incident_id).toBeDefined();
      expect(result.postmortem.summary).toBeDefined();
      expect(result.postmortem.timeline.length).toBeGreaterThan(0);
      expect(result.postmortem.root_cause_analysis).toBeDefined();
      expect(result.postmortem.impact_assessment).toBeDefined();
      expect(result.postmortem.recovery_summary).toBeDefined();
      expect(result.postmortem.lessons_learned.length).toBeGreaterThan(0);
      expect(result.postmortem.action_items.length).toBeGreaterThan(0);
    });

    it('should identify root cause correctly', async () => {
      const input = {
        workflow_id: 'wf_002',
        failure_data: {
          failed_step: 'auth_check',
          error_message: '401 Unauthorized: Invalid token',
          execution_history: [
            { step: 'auth_check', status: 'failure', duration_ms: 10, timestamp: '2025-01-01T10:00:00Z' }
          ]
        },
        recovery_attempts: [
          { strategy: 'retry', result: 'failure', details: {} }
        ],
        context: {
          environment: 'staging' as const,
          agent_version: '1.0.0'
        }
      };

      const result = await generatePostmortem.run(input);

      expect(result.postmortem.root_cause_analysis.primary_cause).toContain('Authentication');
      expect(result.postmortem.root_cause_analysis.category).toBeDefined();
    });

    it('should assess impact based on environment', async () => {
      const productionInput = {
        workflow_id: 'wf_prod',
        failure_data: {
          failed_step: 'critical_operation',
          error_message: 'Fatal error',
          execution_history: [
            { step: 'critical_operation', status: 'failure', duration_ms: 1000, timestamp: '2025-01-01T10:00:00Z' }
          ]
        },
        recovery_attempts: [],
        context: {
          environment: 'production' as const,
          agent_version: '1.0.0'
        }
      };

      const result = await generatePostmortem.run(productionInput);

      expect(result.postmortem.impact_assessment.severity).toBeDefined();
      expect(['high', 'critical']).toContain(result.postmortem.impact_assessment.severity);
    });

    it('should generate lessons learned', async () => {
      const input = {
        workflow_id: 'wf_lessons',
        failure_data: {
          failed_step: 'rate_limited_api',
          error_message: 'Rate limit exceeded: 429',
          execution_history: [
            { step: 'rate_limited_api', status: 'failure', duration_ms: 100, timestamp: '2025-01-01T10:00:00Z' }
          ]
        },
        recovery_attempts: [
          { strategy: 'retry', result: 'failure', details: {} }
        ]
      };

      const result = await generatePostmortem.run(input);

      expect(result.postmortem.lessons_learned.length).toBeGreaterThan(0);
      const rateLimit = result.postmortem.lessons_learned.some(lesson =>
        lesson.toLowerCase().includes('rate limit')
      );
      expect(rateLimit).toBe(true);
    });

    it('should generate prioritized action items', async () => {
      const input = {
        workflow_id: 'wf_actions',
        failure_data: {
          failed_step: 'data_processing',
          error_message: 'Out of memory error',
          execution_history: [
            { step: 'data_processing', status: 'failure', duration_ms: 5000, timestamp: '2025-01-01T10:00:00Z' }
          ]
        },
        recovery_attempts: [],
        context: {
          environment: 'production' as const,
          agent_version: '1.0.0'
        },
        include_recommendations: true
      };

      const result = await generatePostmortem.run(input);

      expect(result.postmortem.action_items.length).toBeGreaterThan(0);
      const highPriorityItems = result.postmortem.action_items.filter(item => item.priority === 'high');
      expect(highPriorityItems.length).toBeGreaterThan(0);
    });

    it('should include visualization URLs', async () => {
      const input = {
        workflow_id: 'wf_viz',
        failure_data: {
          failed_step: 'test',
          error_message: 'test error',
          execution_history: [
            { step: 'test', status: 'failure', duration_ms: 100, timestamp: '2025-01-01T10:00:00Z' }
          ]
        },
        recovery_attempts: []
      };

      const result = await generatePostmortem.run(input);

      expect(result.visualizations).toBeDefined();
      expect(result.visualizations?.execution_timeline_url).toBeDefined();
      expect(result.visualizations?.error_distribution_url).toBeDefined();
    });
  });
});
