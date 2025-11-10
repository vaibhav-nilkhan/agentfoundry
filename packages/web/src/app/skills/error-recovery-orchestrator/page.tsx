import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CodeBlock } from '@/components/ui/CodeBlock';

export default function ErrorRecoveryOrchestratorPage() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen pt-24">
        {/* Hero Section */}
        <section className="py-20 px-6 grid-bg relative overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center glow-blue">
                <span className="text-4xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold">
                  Error Recovery Orchestrator
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="default">Production Ready</Badge>
                  <Badge variant="default">v1.0.0</Badge>
                  <Badge variant="outline">Infrastructure Skill</Badge>
                </div>
              </div>
            </div>

            <p className="text-xl text-muted-foreground mb-8 max-w-4xl">
              Intelligent error detection, recovery, and health monitoring for agent workflows.
              Automatically classify errors, execute recovery strategies, and prevent cascading failures.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <Button size="lg" variant="default" asChild>
                <Link href="/guides">View Integration Guide</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#tools">Explore Tools</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="https://github.com/agentfoundry/skills/error-recovery">GitHub</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">&lt;100ms</div>
                <div className="text-sm text-muted-foreground">Error Detection</div>
              </div>
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-accent mb-1">&lt;500ms</div>
                <div className="text-sm text-muted-foreground">Recovery Execution</div>
              </div>
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">95%+</div>
                <div className="text-sm text-muted-foreground">Classification Accuracy</div>
              </div>
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-accent mb-1">4</div>
                <div className="text-sm text-muted-foreground">Recovery Strategies</div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <CardTitle>Intelligent Detection</CardTitle>
                  <CardDescription>
                    Pattern-based classification distinguishes transient, permanent, and critical errors
                    with 95%+ accuracy in &lt;100ms.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <CardTitle>Automatic Recovery</CardTitle>
                  <CardDescription>
                    Executes retry, rollback, fallback, or skip strategies with exponential backoff
                    and jitter to prevent thundering herd.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <CardTitle>Proactive Monitoring</CardTitle>
                  <CardDescription>
                    Predicts failures 5+ minutes before they happen using statistical anomaly
                    detection and health scoring.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Problem & Solution */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <span className="text-destructive">⚠️</span> The Problem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>• Agents crash on transient network errors (rate limits, timeouts)</p>
                  <p>• No error classification (is it worth retrying?)</p>
                  <p>• No recovery strategies (retry? rollback? fallback?)</p>
                  <p>• Zero observability into health degradation</p>
                  <p>• Cascading failures compound across workflows</p>
                </CardContent>
              </Card>

              <Card className="border-accent/30 bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <span className="text-accent">✓</span> The Solution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>• Pattern-based error classification (&lt;100ms)</p>
                  <p>• 4 recovery strategies (retry, rollback, fallback, skip)</p>
                  <p>• Exponential backoff with jitter (prevents stampedes)</p>
                  <p>• Health monitoring with failure prediction</p>
                  <p>• Automated postmortem with action items</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section id="tools" className="py-20 px-6 bg-card">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <Badge variant="default" className="mb-4">4 Production Tools</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Complete Error Recovery Pipeline
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From detection to recovery to monitoring to postmortem. Everything you need for reliable agents.
              </p>
            </div>

            <div className="space-y-12">
              {/* Tool 1: detect_failure */}
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl">1</span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-mono">detect_failure</CardTitle>
                        <CardDescription>Classify errors and recommend recovery strategies</CardDescription>
                      </div>
                    </div>
                    <Badge variant="default">~50ms latency</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">What it does</h4>
                    <p className="text-muted-foreground mb-4">
                      Analyzes error messages and context to classify failures as transient, permanent, or critical.
                      Identifies root cause category (network, auth, resource, etc.) and recommends optimal recovery strategy.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Input</h4>
                      <CodeBlock
                        language="json"
                        code={`{
  "error_message": "ECONNREFUSED",
  "error_code": "ECONNREFUSED",
  "step_number": 3,
  "workflow_context": {
    "total_steps": 10,
    "completed_steps": 2,
    "previous_step": "fetch_data",
    "next_step": "process_data"
  }
}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-sm">Output</h4>
                      <CodeBlock
                        language="json"
                        code={`{
  "failure_classification": {
    "type": "transient",
    "is_recoverable": true,
    "confidence": 90
  },
  "root_cause": {
    "category": "network"
  },
  "recovery_recommendation": {
    "strategy": "retry",
    "max_attempts": 3,
    "success_rate": 85
  }
}`}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Supported Error Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Network</Badge>
                      <Badge variant="outline">Authentication</Badge>
                      <Badge variant="outline">Authorization</Badge>
                      <Badge variant="outline">Resource (rate limits)</Badge>
                      <Badge variant="outline">Data Validation</Badge>
                      <Badge variant="outline">Business Logic</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tool 2: execute_recovery */}
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl">2</span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-mono">execute_recovery</CardTitle>
                        <CardDescription>Execute recovery strategies with intelligent backoff</CardDescription>
                      </div>
                    </div>
                    <Badge variant="default">~200-500ms</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">What it does</h4>
                    <p className="text-muted-foreground mb-4">
                      Executes the recommended recovery strategy (retry, rollback, fallback, or skip) with
                      exponential backoff and jitter. Tracks execution log with timing for each attempt.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Recovery Strategies</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-card border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-base">Retry</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                          Exponential backoff (100ms → 200ms → 400ms) with ±20% jitter.
                          Best for transient network errors and rate limits.
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-base">Rollback</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                          Roll back to previous checkpoint with cleanup actions.
                          Best for multi-step workflows with state changes.
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-base">Fallback</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                          Switch to alternative endpoint or cached data.
                          Best for API failures with backup options.
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-base">Skip</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                          Continue workflow by skipping non-critical step.
                          Best for optional operations that can be deferred.
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Example: Retry with Exponential Backoff</h4>
                    <CodeBlock
                      language="json"
                      code={`{
  "strategy": "retry",
  "workflow_state": {
    "current_step": 3,
    "failed_step_id": "fetch_api"
  },
  "retry_config": {
    "max_attempts": 3,
    "backoff_strategy": "exponential",
    "initial_delay_ms": 100,
    "max_delay_ms": 5000
  }
}

// Output:
{
  "recovery_result": {
    "status": "success",
    "attempts_made": 2
  },
  "execution_log": [
    { "attempt": 1, "duration_ms": 105, "status": "failure" },
    { "attempt": 2, "duration_ms": 198, "status": "success" }
  ]
}`}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tool 3: monitor_health */}
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl">3</span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-mono">monitor_health</CardTitle>
                        <CardDescription>Predict failures before they happen</CardDescription>
                      </div>
                    </div>
                    <Badge variant="default">&lt;50ms latency</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">What it does</h4>
                    <p className="text-muted-foreground mb-4">
                      Analyzes workflow metrics (step durations, error rates, resource usage) to compute health
                      scores and predict failures. Detects anomalies and provides actionable recommendations.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-card border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="text-accent">✓</span> Healthy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Score: 80-100<br />
                        Low error rate<br />
                        Normal latency<br />
                        Stable performance
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="text-yellow-500">⚠️</span> Degraded
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Score: 40-79<br />
                        Elevated errors<br />
                        Increasing latency<br />
                        Anomalies detected
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="text-destructive">💥</span> Critical
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Score: 0-39<br />
                        High error rate<br />
                        Severe degradation<br />
                        Immediate action needed
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Example: Health Monitoring</h4>
                    <CodeBlock
                      language="json"
                      code={`{
  "workflow_id": "wf_123",
  "metrics": {
    "step_durations_ms": [100, 150, 18000], // Anomaly!
    "error_count": 2,
    "memory_usage_mb": 900
  },
  "thresholds": {
    "max_step_duration_ms": 5000,
    "max_error_rate": 0.1
  }
}

// Output:
{
  "health_status": {
    "overall": "degraded",
    "score": 65
  },
  "anomalies_detected": [
    {
      "metric": "step_duration",
      "severity": "high",
      "description": "Step took 18s (360% over threshold)"
    }
  ],
  "failure_prediction": {
    "likely_to_fail": true,
    "probability": 72,
    "predicted_failure_time_minutes": 3
  },
  "recommendations": {
    "immediate_actions": [
      "Investigate slow step immediately",
      "Consider fallback strategy"
    ]
  }
}`}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tool 4: generate_postmortem */}
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl">4</span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-mono">generate_postmortem</CardTitle>
                        <CardDescription>Automated incident reports with action items</CardDescription>
                      </div>
                    </div>
                    <Badge variant="default">~2s generation</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">What it does</h4>
                    <p className="text-muted-foreground mb-4">
                      Generates comprehensive postmortem reports with root cause analysis, impact assessment,
                      recovery summary, lessons learned, and prioritized action items. Includes timeline visualization.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Postmortem Components</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline">1</Badge>
                        <div>
                          <p className="font-medium">Incident Summary</p>
                          <p className="text-sm text-muted-foreground">
                            High-level overview of what failed, when, and recovery status
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline">2</Badge>
                        <div>
                          <p className="font-medium">Timeline</p>
                          <p className="text-sm text-muted-foreground">
                            Chronological sequence of events with timestamps
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline">3</Badge>
                        <div>
                          <p className="font-medium">Root Cause Analysis</p>
                          <p className="text-sm text-muted-foreground">
                            Primary cause, contributing factors, and why it happened
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline">4</Badge>
                        <div>
                          <p className="font-medium">Impact Assessment</p>
                          <p className="text-sm text-muted-foreground">
                            Severity, affected users, downtime, estimated cost impact
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline">5</Badge>
                        <div>
                          <p className="font-medium">Lessons Learned</p>
                          <p className="text-sm text-muted-foreground">
                            Insights for preventing similar failures in the future
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline">6</Badge>
                        <div>
                          <p className="font-medium">Action Items</p>
                          <p className="text-sm text-muted-foreground">
                            Prioritized tasks (high/medium/low) with owners and deadlines
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Example Output</h4>
                    <CodeBlock
                      language="json"
                      code={`{
  "postmortem": {
    "incident_id": "INC-wf_123-1736940000000",
    "summary": "Workflow failure at step \\"api_call\\" due to network issue. 2 recovery attempts made, status: recovered.",
    "root_cause_analysis": {
      "primary_cause": "Network connectivity failure",
      "contributing_factors": [
        "Service unreachable",
        "Network instability"
      ],
      "why_it_happened": "The target service could not be reached within the timeout period..."
    },
    "impact_assessment": {
      "severity": "medium",
      "downtime_minutes": 2
    },
    "lessons_learned": [
      "Add circuit breakers for unreliable external services",
      "Implement timeout and retry strategies"
    ],
    "action_items": [
      {
        "priority": "high",
        "action": "Add monitoring alerts to detect similar failures early",
        "deadline": "48 hours"
      }
    ]
  },
  "visualizations": {
    "execution_timeline_url": "https://agentfoundry.ai/incidents/INC-123/timeline",
    "error_distribution_url": "https://agentfoundry.ai/incidents/INC-123/errors"
  }
}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <Badge variant="default" className="mb-4">Real-World Applications</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Who Uses Error Recovery Orchestrator?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Solo Developers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Use case:</strong> Building AI agent prototypes that call external APIs</p>
                  <p><strong>Challenge:</strong> Agents crash on rate limits and network errors</p>
                  <p><strong>Solution:</strong> Auto-retry with exponential backoff, 80% fewer failures</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Startups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Use case:</strong> Production agent workflows with 10+ steps</p>
                  <p><strong>Challenge:</strong> No observability into why workflows fail</p>
                  <p><strong>Solution:</strong> Health monitoring + automated postmortems with RCA</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Enterprises</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Use case:</strong> Mission-critical agents handling financial transactions</p>
                  <p><strong>Challenge:</strong> Need 99.9% uptime and compliance reporting</p>
                  <p><strong>Solution:</strong> Failure prediction + self-hosted with full audit logs</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-card">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Add Error Recovery?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with the free Developer plan. 1,000 skill executions/month included.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="default" asChild>
                <Link href="/guides">View Integration Guide</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">See Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
