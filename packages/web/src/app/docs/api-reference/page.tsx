import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CodeBlock } from '@/components/ui/CodeBlock';

export default function APIReferencePage() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen pt-24">
        {/* Header */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-5xl">
            <Badge variant="default" className="mb-4">API Documentation</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              API Reference
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Complete REST API documentation for AgentFoundry skills.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/docs/getting-started">Getting Started</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="https://api.agentfoundry.dev/docs">Interactive API Docs</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Base URL & Authentication */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-5xl space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Base URL</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="bash"
                  code="https://api.agentfoundry.ai/v1"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Authentication</CardTitle>
                <CardDescription>
                  All API requests require an API key in the Authorization header.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  language="bash"
                  title="Example Request"
                  code={`curl https://api.agentfoundry.ai/v1/skills/error-recovery/detect-failure \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"error_message": "Connection timeout"}'`}
                />
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">Getting Your API Key:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                    <li>Sign in to your <Link href="/dashboard" className="text-primary hover:underline">Dashboard</Link></li>
                    <li>Navigate to Settings → API Keys</li>
                    <li>Click "Generate New Key"</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Error Recovery Orchestrator API */}
        <section className="py-12 px-6 bg-card">
          <div className="container mx-auto max-w-5xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-3">Error Recovery Orchestrator</h2>
              <p className="text-muted-foreground">
                Intelligent error detection, recovery, and monitoring endpoints.
              </p>
            </div>

            <div className="space-y-8">
              {/* detect_failure */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-mono">POST /skills/error-recovery/detect-failure</CardTitle>
                    <Badge variant="default">50ms avg</Badge>
                  </div>
                  <CardDescription>
                    Classify errors and recommend recovery strategies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Request Body</h4>
                    <CodeBlock
                      language="json"
                      code={`{
  "error_message": "ECONNREFUSED: Connection refused",
  "error_code": "ECONNREFUSED",  // optional
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
                    <h4 className="font-semibold text-sm mb-2">Response (200 OK)</h4>
                    <CodeBlock
                      language="json"
                      code={`{
  "failure_classification": {
    "type": "transient",  // transient | permanent | critical
    "severity": "medium",  // low | medium | high | critical
    "is_recoverable": true,
    "confidence": 90
  },
  "root_cause": {
    "category": "network",  // network | auth | resource | validation | business | unknown
    "description": "Connection refused error",
    "possible_reasons": ["Service is down", "Network issue", "Incorrect host/port"]
  },
  "recovery_recommendation": {
    "strategy": "retry",  // retry | rollback | fallback | skip
    "max_attempts": 3,
    "backoff_strategy": "exponential",
    "estimated_success_rate": 85
  },
  "metadata": {
    "analyzed_at": "2025-01-15T10:30:00Z",
    "analysis_time_ms": 45
  }
}`}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* execute_recovery */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-mono">POST /skills/error-recovery/execute-recovery</CardTitle>
                    <Badge variant="default">200-500ms</Badge>
                  </div>
                  <CardDescription>
                    Execute recovery strategies with intelligent backoff
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Request Body</h4>
                    <CodeBlock
                      language="json"
                      code={`{
  "strategy": "retry",  // retry | rollback | fallback | skip
  "workflow_state": {
    "current_step": 3,
    "failed_step_id": "fetch_api",
    "workflow_id": "wf_123"
  },
  "retry_config": {  // optional, for retry strategy
    "max_attempts": 3,
    "backoff_strategy": "exponential",  // exponential | linear | constant
    "initial_delay_ms": 100,
    "max_delay_ms": 5000
  }
}`}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Response (200 OK)</h4>
                    <CodeBlock
                      language="json"
                      code={`{
  "recovery_result": {
    "status": "success",  // success | failure | partial
    "attempts_made": 2,
    "total_time_ms": 303,
    "recovered_at": "2025-01-15T10:30:02Z"
  },
  "execution_log": [
    {"attempt": 1, "duration_ms": 105, "status": "failure", "error": "..."},
    {"attempt": 2, "duration_ms": 198, "status": "success", "result": "..."}
  ],
  "metadata": {
    "strategy_used": "retry",
    "backoff_delays_ms": [100, 200]
  }
}`}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* monitor_health */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl font-mono">POST /skills/error-recovery/monitor-health</CardTitle>
                    <Badge variant="default">~50ms</Badge>
                  </div>
                  <CardDescription>
                    Analyze workflow health and predict failures
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Request Body</h4>
                    <CodeBlock
                      language="json"
                      code={`{
  "workflow_id": "wf_123",
  "metrics": {
    "step_durations_ms": [100, 150, 18000],
    "error_count": 2,
    "warning_count": 1,
    "memory_usage_mb": 900
  },
  "thresholds": {
    "max_step_duration_ms": 5000,
    "max_error_rate": 0.1,
    "max_memory_mb": 1024
  }
}`}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Response (200 OK)</h4>
                    <CodeBlock
                      language="json"
                      code={`{
  "health_status": {
    "overall": "degraded",  // healthy | degraded | critical
    "score": 65,  // 0-100
    "trend": "declining"  // improving | stable | declining
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
    "probability": 72,  // 0-100
    "predicted_failure_time_minutes": 3,
    "confidence": 85
  },
  "recommendations": {
    "immediate_actions": ["Investigate slow step immediately", "..."],
    "preventive_actions": ["Add timeout to slow step", "..."]
  }
}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-8">Rate Limits</h2>

            <Card>
              <CardHeader>
                <CardDescription>
                  Rate limits are based on your subscription tier.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">Tier</th>
                        <th className="text-left py-3 px-4">Requests/Second</th>
                        <th className="text-left py-3 px-4">Requests/Month</th>
                        <th className="text-left py-3 px-4">Burst Limit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="py-3 px-4 font-medium">Free</td>
                        <td className="py-3 px-4">2/sec</td>
                        <td className="py-3 px-4">1,000</td>
                        <td className="py-3 px-4">10</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Pro</td>
                        <td className="py-3 px-4">10/sec</td>
                        <td className="py-3 px-4">Unlimited</td>
                        <td className="py-3 px-4">50</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Enterprise</td>
                        <td className="py-3 px-4">Custom</td>
                        <td className="py-3 px-4">Unlimited</td>
                        <td className="py-3 px-4">Custom</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-sm font-semibold mb-2">Rate Limit Headers:</p>
                  <CodeBlock
                    language="bash"
                    code={`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1736941200`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Error Codes */}
        <section className="py-12 px-6 bg-card">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-8">Error Codes</h2>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Badge variant="outline" className="mt-0.5">400</Badge>
                    <div>
                      <p className="font-semibold">Bad Request</p>
                      <p className="text-sm text-muted-foreground">Invalid request body or parameters</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Badge variant="outline" className="mt-0.5">401</Badge>
                    <div>
                      <p className="font-semibold">Unauthorized</p>
                      <p className="text-sm text-muted-foreground">Missing or invalid API key</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Badge variant="outline" className="mt-0.5">403</Badge>
                    <div>
                      <p className="font-semibold">Forbidden</p>
                      <p className="text-sm text-muted-foreground">Insufficient permissions for this skill</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Badge variant="outline" className="mt-0.5">429</Badge>
                    <div>
                      <p className="font-semibold">Too Many Requests</p>
                      <p className="text-sm text-muted-foreground">Rate limit exceeded. Check X-RateLimit-Reset header</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Badge variant="outline" className="mt-0.5">500</Badge>
                    <div>
                      <p className="font-semibold">Internal Server Error</p>
                      <p className="text-sm text-muted-foreground">Server error. Check status page or contact support</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-sm mb-2">Example Error Response</h4>
                  <CodeBlock
                    language="json"
                    code={`{
  "error": {
    "code": "invalid_input",
    "message": "error_message is required",
    "details": {
      "field": "error_message",
      "validation": "required"
    },
    "request_id": "req_abc123"
  }
}`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SDK Libraries */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-8">SDK Libraries</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>TypeScript/JavaScript</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CodeBlock
                    language="bash"
                    code="npm install @agentfoundry/sdk"
                  />
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="https://github.com/agentfoundry/sdk-js">View on GitHub</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Python</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CodeBlock
                    language="bash"
                    code="pip install agentfoundry"
                  />
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="https://github.com/agentfoundry/sdk-python">View on GitHub</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="py-12 px-6 bg-card">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Check our guides or reach out to our support team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/docs/getting-started">Getting Started</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/docs/faq">FAQ</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="mailto:support@agentfoundry.dev">Contact Support</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
