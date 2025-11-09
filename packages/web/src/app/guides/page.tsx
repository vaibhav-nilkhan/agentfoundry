import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CodeBlock, InlineCode } from '@/components/ui/CodeBlock';

export default function GuidesPage() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen pt-24">
        {/* Header */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-5xl text-center">
            <Badge variant="accent" className="mb-6">
              Integration Guides
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              4 Ways to Use AgentFoundry Skills
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the integration method that fits your workflow. From Claude Desktop to self-hosted deployments.
            </p>
          </div>
        </section>

        {/* Integration Methods */}
        <section className="pb-20 px-6">
          <div className="container mx-auto max-w-6xl space-y-16">
            {/* Method 1: Claude Desktop (MCP) */}
            <div id="method-1">
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-2xl">1</span>
                      </div>
                      <div>
                        <CardTitle className="text-3xl">Claude Desktop (MCP)</CardTitle>
                        <Badge variant="accent" className="mt-2">Easiest Setup</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    For end-users and teams using Claude Desktop. Install skills via Model Context Protocol (MCP).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Who is this for?</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Solo developers using Claude Desktop for agent workflows</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Teams who want zero-code integration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Quick prototyping and testing</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Installation Steps</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong>Step 1:</strong> Install the AgentFoundry MCP server
                        </p>
                        <CodeBlock
                          language="bash"
                          code={`npm install -g @agentfoundry/mcp-server`}
                        />
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong>Step 2:</strong> Configure Claude Desktop to use AgentFoundry skills
                        </p>
                        <CodeBlock
                          language="json"
                          title="~/Library/Application Support/Claude/claude_desktop_config.json"
                          code={`{
  "mcpServers": {
    "agentfoundry": {
      "command": "agentfoundry-mcp",
      "args": ["--api-key", "your_api_key_here"],
      "env": {
        "AF_REGION": "us-west-2"
      }
    }
  }
}`}
                        />
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong>Step 3:</strong> Restart Claude Desktop and verify installation
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ask Claude: <InlineCode>What AgentFoundry skills do I have access to?</InlineCode>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Example Usage</h4>
                    <Card className="bg-slate-900 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="space-y-4 font-mono text-sm">
                          <div>
                            <span className="text-slate-400">You:</span>
                            <p className="text-slate-200 mt-1">
                              "Please fetch data from https://api.example.com/users with error recovery"
                            </p>
                          </div>
                          <div>
                            <span className="text-accent">Claude:</span>
                            <p className="text-slate-200 mt-1">
                              "I'll use the Error Recovery Orchestrator to fetch that data with automatic retry logic..."
                            </p>
                            <p className="text-slate-400 mt-2 text-xs">
                              [Internally: Claude calls detect_failure and execute_recovery skills]
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Method 2: Custom Applications */}
            <div id="method-2">
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-2xl">2</span>
                      </div>
                      <div>
                        <CardTitle className="text-3xl">Custom Applications (SDK)</CardTitle>
                        <Badge variant="default" className="mt-2">Most Flexible</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    For developers building custom agent applications with TypeScript/JavaScript or Python.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Who is this for?</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Developers building custom AI agent applications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Teams integrating with existing codebases</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Production deployments requiring fine-grained control</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">TypeScript/JavaScript Example</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Install the SDK:</p>
                        <CodeBlock
                          language="bash"
                          code={`npm install @agentfoundry/sdk`}
                        />
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Use in your application:</p>
                        <CodeBlock
                          language="typescript"
                          title="src/agent.ts"
                          code={`import { AgentFoundry } from '@agentfoundry/sdk';

const af = new AgentFoundry({
  apiKey: process.env.AGENTFOUNDRY_API_KEY
});

async function myAgentWorkflow() {
  try {
    // Your risky operation
    const result = await fetchExternalAPI();
    return result;
  } catch (error) {
    // Use Error Recovery Orchestrator
    const recovery = await af.errorRecovery.detectAndRecover({
      error_message: error.message,
      error_code: error.code,
      workflow_context: {
        total_steps: 5,
        completed_steps: 2,
        previous_step: 'fetch_data',
        next_step: 'process_data'
      },
      recovery_strategy: 'auto', // or 'retry', 'fallback', etc.
      max_attempts: 3
    });

    if (recovery.success) {
      console.log('Recovered successfully:', recovery.result);
      return recovery.result;
    }

    // Generate postmortem for failed recovery
    const postmortem = await af.errorRecovery.generatePostmortem({
      workflow_id: 'wf_123',
      failure_data: recovery.failure_data,
      recovery_attempts: recovery.attempts
    });

    throw new Error(\`Unrecoverable error. Incident ID: \${postmortem.incident_id}\`);
  }
}

// Monitor health in real-time
await af.errorRecovery.monitorHealth({
  workflow_id: 'wf_123',
  metrics: {
    step_durations_ms: [100, 150, 200],
    error_count: 0,
    warning_count: 1,
    memory_usage_mb: 256
  },
  thresholds: {
    max_step_duration_ms: 5000,
    max_error_rate: 0.1
  }
});`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Python Example</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Install the SDK:</p>
                        <CodeBlock
                          language="bash"
                          code={`pip install agentfoundry`}
                        />
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Use in your application:</p>
                        <CodeBlock
                          language="python"
                          title="agent.py"
                          code={`from agentfoundry import AgentFoundry

af = AgentFoundry(api_key="your_api_key")

async def my_agent_workflow():
    try:
        result = await fetch_external_api()
        return result
    except Exception as error:
        # Use Error Recovery Orchestrator
        recovery = await af.error_recovery.detect_and_recover(
            error_message=str(error),
            workflow_context={
                "total_steps": 5,
                "completed_steps": 2,
                "previous_step": "fetch_data",
                "next_step": "process_data"
            },
            recovery_strategy="auto",
            max_attempts=3
        )

        if recovery.success:
            print(f"Recovered successfully: {recovery.result}")
            return recovery.result

        raise Exception(f"Unrecoverable error. Incident: {recovery.incident_id}")`}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Method 3: Direct API Calls */}
            <div id="method-3">
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-2xl">3</span>
                      </div>
                      <div>
                        <CardTitle className="text-3xl">Direct API Calls</CardTitle>
                        <Badge variant="default" className="mt-2">Language Agnostic</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    Use AgentFoundry from any programming language via REST API.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Who is this for?</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Teams using languages other than JS/TS or Python</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Microservices architectures</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Legacy systems requiring REST integration</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">API Endpoint</h4>
                    <CodeBlock
                      language="bash"
                      code={`https://api.agentfoundry.ai/v1`}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Example: Detect Failure</h4>
                    <CodeBlock
                      language="bash"
                      title="curl"
                      code={`curl -X POST https://api.agentfoundry.ai/v1/skills/error-recovery/detect-failure \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "error_message": "ECONNREFUSED: Connection refused",
    "error_code": "ECONNREFUSED",
    "step_number": 3,
    "workflow_context": {
      "total_steps": 10,
      "completed_steps": 2,
      "previous_step": "fetch_data",
      "next_step": "process_data"
    }
  }'`}
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Example Response</h4>
                    <CodeBlock
                      language="json"
                      code={`{
  "failure_classification": {
    "type": "transient",
    "severity": "medium",
    "is_recoverable": true,
    "confidence": 90
  },
  "root_cause": {
    "category": "network",
    "description": "Connection refused error",
    "possible_reasons": [
      "Service is down",
      "Network connectivity issue",
      "Incorrect host/port"
    ]
  },
  "recovery_recommendation": {
    "strategy": "retry",
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
            </div>

            {/* Method 4: Self-Hosted */}
            <div id="method-4">
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-2xl">4</span>
                      </div>
                      <div>
                        <CardTitle className="text-3xl">Self-Hosted Deployment</CardTitle>
                        <Badge variant="default" className="mt-2">Enterprise</Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    Deploy AgentFoundry infrastructure in your own environment. Full control and data sovereignty.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Who is this for?</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Enterprise customers with strict data governance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Regulated industries (finance, healthcare, government)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">✓</span>
                        <span>Air-gapped or on-premises deployments</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Deployment Options</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-card border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span>🐳</span> Docker Compose
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            Quick setup for development and small teams
                          </p>
                          <CodeBlock
                            language="bash"
                            code={`git clone https://github.com/agentfoundry/self-hosted
cd self-hosted
docker-compose up -d`}
                          />
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span>☸️</span> Kubernetes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            Production-grade with Helm charts
                          </p>
                          <CodeBlock
                            language="bash"
                            code={`helm repo add agentfoundry https://charts.agentfoundry.ai
helm install af agentfoundry/agentfoundry`}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Configuration Example</h4>
                    <CodeBlock
                      language="yaml"
                      title="docker-compose.yml"
                      code={`version: '3.8'

services:
  agentfoundry-api:
    image: agentfoundry/api:latest
    ports:
      - "4100:4100"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/agentfoundry
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your_secret_here
    depends_on:
      - postgres
      - redis

  agentfoundry-validator:
    image: agentfoundry/validator:latest
    ports:
      - "5100:5100"
    environment:
      - API_URL=http://agentfoundry-api:4100

  postgres:
    image: postgres:16
    environment:
      - POSTGRES_DB=agentfoundry
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass

  redis:
    image: redis:7-alpine`}
                    />
                  </div>

                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>Enterprise Support Required:</strong> Self-hosted deployments require an
                      Enterprise plan. Contact sales for licensing and dedicated support.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 px-6 bg-card">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Which Integration Method is Right for You?
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4">Feature</th>
                    <th className="text-center py-4 px-4">Claude Desktop</th>
                    <th className="text-center py-4 px-4">SDK</th>
                    <th className="text-center py-4 px-4">API</th>
                    <th className="text-center py-4 px-4">Self-Hosted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-4 px-4 font-medium">Setup Time</td>
                    <td className="text-center py-4 px-4 text-accent">5 min</td>
                    <td className="text-center py-4 px-4 text-accent">15 min</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">30 min</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">2-4 hours</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Coding Required</td>
                    <td className="text-center py-4 px-4 text-accent">No</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Yes</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Yes</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Data Privacy</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Cloud</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Cloud</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Cloud</td>
                    <td className="text-center py-4 px-4 text-accent">On-Premises</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Customization</td>
                    <td className="text-center py-4 px-4 text-muted-foreground">Low</td>
                    <td className="text-center py-4 px-4 text-accent">High</td>
                    <td className="text-center py-4 px-4 text-accent">High</td>
                    <td className="text-center py-4 px-4 text-accent">Full</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Best For</td>
                    <td className="text-center py-4 px-4 text-sm">End Users</td>
                    <td className="text-center py-4 px-4 text-sm">Developers</td>
                    <td className="text-center py-4 px-4 text-sm">Any Language</td>
                    <td className="text-center py-4 px-4 text-sm">Enterprise</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Integrate?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose your integration method and start building reliable agents today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="accent" asChild>
                <Link href="/signup">Get API Key</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">View Full Documentation</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
