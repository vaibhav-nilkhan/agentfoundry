import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Playground } from '@/components/Playground';

const tools = [
  {
    name: 'detect_failure',
    description: 'Classify errors and recommend recovery strategies',
    inputSchema: {
      error_message: 'string',
      error_code: 'string (optional)',
      step_number: 'number',
      workflow_context: 'object'
    },
    outputSchema: {
      failure_classification: 'object',
      root_cause: 'object',
      recovery_recommendation: 'object'
    },
    exampleInput: {
      error_message: 'ECONNREFUSED: Connection refused',
      error_code: 'ECONNREFUSED',
      step_number: 3,
      workflow_context: {
        total_steps: 10,
        completed_steps: 2,
        previous_step: 'fetch_data',
        next_step: 'process_data'
      }
    },
    exampleOutput: {
      failure_classification: {
        type: 'transient',
        severity: 'medium',
        is_recoverable: true,
        confidence: 90
      },
      root_cause: {
        category: 'network',
        description: 'Connection refused error',
        possible_reasons: [
          'Service is down',
          'Network connectivity issue',
          'Incorrect host/port'
        ]
      },
      recovery_recommendation: {
        strategy: 'retry',
        max_attempts: 3,
        backoff_strategy: 'exponential',
        estimated_success_rate: 85
      },
      metadata: {
        analyzed_at: '2025-01-15T10:30:00Z',
        analysis_time_ms: 45
      }
    }
  },
  {
    name: 'execute_recovery',
    description: 'Execute recovery strategies with intelligent backoff',
    inputSchema: {
      strategy: 'string',
      workflow_state: 'object',
      retry_config: 'object (optional)'
    },
    outputSchema: {
      recovery_result: 'object',
      execution_log: 'array'
    },
    exampleInput: {
      strategy: 'retry',
      workflow_state: {
        current_step: 3,
        failed_step_id: 'fetch_api',
        workflow_id: 'wf_123'
      },
      retry_config: {
        max_attempts: 3,
        backoff_strategy: 'exponential',
        initial_delay_ms: 100,
        max_delay_ms: 5000
      }
    },
    exampleOutput: {
      recovery_result: {
        status: 'success',
        attempts_made: 2,
        total_time_ms: 303,
        recovered_at: '2025-01-15T10:30:02Z'
      },
      execution_log: [
        {
          attempt: 1,
          started_at: '2025-01-15T10:30:00Z',
          duration_ms: 105,
          status: 'failure',
          error: 'Connection timeout'
        },
        {
          attempt: 2,
          started_at: '2025-01-15T10:30:01Z',
          duration_ms: 198,
          status: 'success',
          result: 'Data fetched successfully'
        }
      ],
      metadata: {
        strategy_used: 'retry',
        backoff_delays_ms: [100, 200]
      }
    }
  },
  {
    name: 'monitor_health',
    description: 'Predict failures before they happen',
    inputSchema: {
      workflow_id: 'string',
      metrics: 'object',
      thresholds: 'object'
    },
    outputSchema: {
      health_status: 'object',
      anomalies_detected: 'array',
      failure_prediction: 'object',
      recommendations: 'object'
    },
    exampleInput: {
      workflow_id: 'wf_123',
      metrics: {
        step_durations_ms: [100, 150, 18000],
        error_count: 2,
        warning_count: 1,
        memory_usage_mb: 900
      },
      thresholds: {
        max_step_duration_ms: 5000,
        max_error_rate: 0.1,
        max_memory_mb: 1024
      }
    },
    exampleOutput: {
      health_status: {
        overall: 'degraded',
        score: 65,
        trend: 'declining'
      },
      anomalies_detected: [
        {
          metric: 'step_duration',
          severity: 'high',
          description: 'Step took 18s (360% over threshold)',
          detected_at: '2025-01-15T10:30:00Z'
        }
      ],
      failure_prediction: {
        likely_to_fail: true,
        probability: 72,
        predicted_failure_time_minutes: 3,
        confidence: 85
      },
      recommendations: {
        immediate_actions: [
          'Investigate slow step immediately',
          'Consider fallback strategy',
          'Check external service health'
        ],
        preventive_actions: [
          'Add timeout to slow step',
          'Implement circuit breaker',
          'Scale resources if needed'
        ]
      },
      metadata: {
        analyzed_at: '2025-01-15T10:30:00Z',
        analysis_time_ms: 32
      }
    }
  },
  {
    name: 'generate_postmortem',
    description: 'Automated incident reports with action items',
    inputSchema: {
      workflow_id: 'string',
      failure_data: 'object',
      recovery_attempts: 'array'
    },
    outputSchema: {
      postmortem: 'object',
      visualizations: 'object'
    },
    exampleInput: {
      workflow_id: 'wf_123',
      failure_data: {
        error_message: 'Database connection timeout',
        failed_at: '2025-01-15T10:00:00Z',
        step_name: 'save_results',
        step_number: 8
      },
      recovery_attempts: [
        {
          strategy: 'retry',
          attempts: 3,
          success: false
        },
        {
          strategy: 'fallback',
          attempts: 1,
          success: true
        }
      ]
    },
    exampleOutput: {
      postmortem: {
        incident_id: 'INC-wf_123-1736940000000',
        summary: 'Database connection timeout at step "save_results". Recovered using fallback strategy after 3 retry attempts failed.',
        timeline: [
          {
            timestamp: '2025-01-15T10:00:00Z',
            event: 'Failure detected at step save_results'
          },
          {
            timestamp: '2025-01-15T10:00:01Z',
            event: 'Retry attempt 1 failed'
          },
          {
            timestamp: '2025-01-15T10:00:03Z',
            event: 'Retry attempt 2 failed'
          },
          {
            timestamp: '2025-01-15T10:00:07Z',
            event: 'Retry attempt 3 failed'
          },
          {
            timestamp: '2025-01-15T10:00:08Z',
            event: 'Switched to fallback strategy'
          },
          {
            timestamp: '2025-01-15T10:00:09Z',
            event: 'Recovery successful via fallback'
          }
        ],
        root_cause_analysis: {
          primary_cause: 'Database connection pool exhausted',
          contributing_factors: [
            'Unexpected traffic spike',
            'Connection leak in previous operations',
            'Insufficient connection pool size'
          ],
          why_it_happened: 'The database connection pool reached its maximum capacity during a traffic spike, preventing new connections from being established.'
        },
        impact_assessment: {
          severity: 'medium',
          affected_workflows: 1,
          downtime_minutes: 2,
          estimated_cost_impact: '$12 (API usage during recovery)'
        },
        recovery_summary: {
          strategy_used: 'fallback',
          total_attempts: 4,
          recovery_time_seconds: 9,
          success: true
        },
        lessons_learned: [
          'Connection pool sizing was insufficient for peak traffic',
          'Fallback to alternative database proved effective',
          'Need faster failure detection for connection issues'
        ],
        action_items: [
          {
            priority: 'high',
            action: 'Increase database connection pool size from 20 to 50',
            owner: 'DevOps team',
            deadline: '24 hours',
            status: 'pending'
          },
          {
            priority: 'high',
            action: 'Add connection pool monitoring alerts',
            owner: 'SRE team',
            deadline: '48 hours',
            status: 'pending'
          },
          {
            priority: 'medium',
            action: 'Implement circuit breaker for database connections',
            owner: 'Backend team',
            deadline: '1 week',
            status: 'pending'
          },
          {
            priority: 'low',
            action: 'Document fallback database configuration',
            owner: 'Documentation team',
            deadline: '2 weeks',
            status: 'pending'
          }
        ]
      },
      visualizations: {
        execution_timeline_url: 'https://agentfoundry.ai/incidents/INC-wf_123-1736940000000/timeline',
        error_distribution_url: 'https://agentfoundry.ai/incidents/INC-wf_123-1736940000000/errors',
        recovery_attempts_chart_url: 'https://agentfoundry.ai/incidents/INC-wf_123-1736940000000/recovery'
      },
      metadata: {
        generated_at: '2025-01-15T10:05:00Z',
        generation_time_ms: 1850
      }
    }
  }
];

export default function ErrorRecoveryPlaygroundPage() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen pt-24">
        {/* Header */}
        <section className="py-12 px-6 bg-card border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold">
                    Error Recovery Orchestrator
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Try out all 4 tools interactively. Modify inputs, run tools, and see real-time outputs.
                </p>
              </div>
              <Badge variant="default" className="hidden md:block">Interactive Playground</Badge>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/skills/error-recovery-orchestrator">
                  ← Back to Skill Page
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/guides">
                  View Integration Guide
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Playground */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            <Playground
              skillName="Error Recovery Orchestrator"
              tools={tools}
            />
          </div>
        </section>

        {/* Next Steps */}
        <section className="py-12 px-6 bg-card border-t border-border">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Integrate?
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              This playground uses mock data. For production use, install the skill via Claude Desktop, SDK, API, or self-hosted.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="default" asChild>
                <Link href="/guides">
                  Integration Guide
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/marketplace">
                  Browse More Skills
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
