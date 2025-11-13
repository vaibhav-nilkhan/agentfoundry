import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CodeBlock } from '@/components/ui/CodeBlock';

export default function GettingStartedPage() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen pt-24">
        {/* Header */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <Badge variant="default" className="mb-4">Documentation</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Getting Started with AgentFoundry
            </h1>
            <p className="text-xl text-muted-foreground">
              Build reliable AI agents with production-ready skills in under 10 minutes.
            </p>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">Quick Start (5 minutes)</h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <CardTitle className="text-2xl">Get Your API Key</CardTitle>
                  </div>
                  <CardDescription>
                    Sign up for a free AgentFoundry account and get your API key.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Button asChild>
                      <Link href="/signup">Sign Up Free</Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      1,000 free skill executions/month included
                    </span>
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <p className="text-sm font-semibold mb-2">After signing up:</p>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                      <li>Go to Dashboard → Settings → API Keys</li>
                      <li>Click "Generate New Key"</li>
                      <li>Copy your API key (starts with `af_`)</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold">2</span>
                    </div>
                    <CardTitle className="text-2xl">Choose Your Integration Method</CardTitle>
                  </div>
                  <CardDescription>
                    Pick the method that fits your workflow.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Claude Desktop</CardTitle>
                        <Badge variant="default" className="w-fit">Easiest</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Zero-code integration. Perfect for end-users.
                        </p>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href="/guides#method-1">View Guide</Link>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">SDK (TypeScript/Python)</CardTitle>
                        <Badge variant="default" className="w-fit">Most Flexible</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Full programmatic control. For developers.
                        </p>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href="/guides#method-2">View Guide</Link>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">REST API</CardTitle>
                        <Badge variant="default" className="w-fit">Language Agnostic</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Use from any language via HTTP.
                        </p>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href="/docs/api-reference">API Docs</Link>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Self-Hosted</CardTitle>
                        <Badge variant="default" className="w-fit">Enterprise</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Full control and data sovereignty.
                        </p>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link href="/guides#method-4">Deploy Guide</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold">3</span>
                    </div>
                    <CardTitle className="text-2xl">Install Your First Skill</CardTitle>
                  </div>
                  <CardDescription>
                    Let's install the Error Recovery Orchestrator skill as an example.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Using SDK (TypeScript)</h4>
                    <CodeBlock
                      language="bash"
                      code="npm install @agentfoundry/sdk"
                    />
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Basic Usage</h4>
                    <CodeBlock
                      language="typescript"
                      title="agent.ts"
                      code={`import { AgentFoundry } from '@agentfoundry/sdk';

const af = new AgentFoundry({
  apiKey: process.env.AGENTFOUNDRY_API_KEY
});

async function runAgentWorkflow() {
  try {
    // Your agent code that might fail
    const data = await fetchExternalAPI();
    return data;
  } catch (error: any) {
    // Use Error Recovery skill to handle failures
    const result = await af.errorRecovery.detectAndRecover({
      error_message: error.message,
      error_code: error.code,
      workflow_context: {
        total_steps: 5,
        completed_steps: 2
      },
      recovery_strategy: 'auto',
      max_attempts: 3
    });

    if (result.success) {
      console.log('✓ Recovered successfully');
      return result.data;
    }

    throw new Error(\`Unrecoverable: \${result.incident_id}\`);
  }
}

runAgentWorkflow();`}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold">✓</span>
                    </div>
                    <CardTitle className="text-2xl">You're Ready!</CardTitle>
                  </div>
                  <CardDescription>
                    Your agent now has intelligent error recovery. Explore more skills to add additional capabilities.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild>
                      <Link href="/marketplace">Browse All Skills</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/playground/error-recovery-orchestrator">Try Interactive Demo</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Concepts */}
        <section className="py-12 px-6 bg-card">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">Core Concepts</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What is a Skill?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    A <strong>skill</strong> is a modular capability that extends your AI agent's abilities.
                    Each skill provides one or more <strong>tools</strong> that perform specific tasks.
                  </p>
                  <p>
                    <strong>Example:</strong> The Error Recovery Orchestrator skill provides 4 tools:
                    detect_failure, execute_recovery, monitor_health, and generate_postmortem.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How Skills Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <ol className="list-decimal ml-5 space-y-2">
                    <li>Your agent encounters a situation (e.g., an error)</li>
                    <li>Agent calls the appropriate skill tool with input data</li>
                    <li>AgentFoundry executes the tool and returns results</li>
                    <li>Your agent uses the results to continue its workflow</li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">Infrastructure</Badge>
                      <p className="text-sm text-muted-foreground">
                        Error recovery, monitoring, health checks
                      </p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Developer Tools</Badge>
                      <p className="text-sm text-muted-foreground">
                        API testing, code analysis, tech debt
                      </p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Security</Badge>
                      <p className="text-sm text-muted-foreground">
                        Vulnerability scanning, compliance, auditing
                      </p>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Content Intelligence</Badge>
                      <p className="text-sm text-muted-foreground">
                        Content analysis, SEO, virality prediction
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing Model</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    Skills use a <strong>freemium</strong> model. Each skill has:
                  </p>
                  <ul className="list-disc ml-5 space-y-2">
                    <li><strong>Free Tier:</strong> Limited executions per month (typically 100-1,000)</li>
                    <li><strong>Pro Tier:</strong> Higher limits and advanced features ($29-99/month)</li>
                    <li><strong>Enterprise Tier:</strong> Unlimited usage, custom integration, SLAs</li>
                  </ul>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/pricing">View Pricing Details</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Next Steps</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <CardTitle>Explore Skills</CardTitle>
                  <CardDescription>
                    Browse our marketplace of 8+ production skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/marketplace">Browse Marketplace</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <CardTitle>Try Demos</CardTitle>
                  <CardDescription>
                    Interactive playgrounds for each skill
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/playground/error-recovery-orchestrator">Try Playground</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📖</span>
                  </div>
                  <CardTitle>Read Docs</CardTitle>
                  <CardDescription>
                    Full API reference and integration guides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/docs/api-reference">API Reference</Link>
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
              Our team is here to help you succeed with AgentFoundry.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/docs/faq">View FAQ</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://discord.gg/agentfoundry">Join Discord</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="mailto:support@agentfoundry.dev">Email Support</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
