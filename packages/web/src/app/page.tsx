import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CodeBlock, InlineCode } from '@/components/ui/CodeBlock';

export default function Home() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 grid-bg relative overflow-hidden">
          {/* Gradient orbs for visual interest */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="accent" className="mb-6">
                Infrastructure Skills for AI Agents
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                The <span className="text-primary">AWS</span> of{' '}
                <span className="text-accent">AI Agents</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Infrastructure skills that make all other skills work better.
                Error recovery, health monitoring, and agent reliability at scale.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button size="lg" variant="accent" asChild>
                  <Link href="/guides">View Integration Guide</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#skills">Explore Infrastructure Skills</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">36% → 80%+</div>
                  <div className="text-sm text-muted-foreground">Agent success rate improvement</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">&lt;100ms</div>
                  <div className="text-sm text-muted-foreground">Error detection latency</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime with monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-20 px-6 bg-card">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <Badge variant="destructive" className="mb-4">The Reliability Crisis</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Why Agents Fail in Production
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Current agent success rates are stuck at 36%. Every skill you add compounds the problem.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="text-destructive">⚠️</span> Error Compounding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Each skill has a 10% failure rate. Chain 5 skills together and your workflow
                    success rate drops to 59%. At 10 skills: 35% success rate.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="text-destructive">💥</span> No Recovery Mechanism
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Agents crash on transient network errors, rate limits, or temporary outages.
                    No retry logic, no fallbacks, no error classification.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="text-destructive">🔍</span> Zero Observability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You can't see health metrics, predict failures before they happen, or understand
                    why workflows fail. No monitoring = flying blind.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="text-destructive">📉</span> Silent Degradation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Performance degrades slowly over time. Memory leaks, increasing latency, and
                    cascading failures go unnoticed until complete breakdown.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Solution - Infrastructure Skills */}
        <section id="skills" className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <Badge variant="accent" className="mb-4">The Solution</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Infrastructure Skills: The Foundation Layer
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Just like AWS provides compute, storage, and networking for apps,
                AgentFoundry provides error recovery, health monitoring, and reliability for agents.
              </p>
            </div>

            {/* Error Recovery Orchestrator Showcase */}
            <div className="mb-16">
              <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/5">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center glow-blue">
                        <span className="text-2xl">🛡️</span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Error Recovery Orchestrator</CardTitle>
                        <Badge variant="accent" className="mt-1">Production Ready</Badge>
                      </div>
                    </div>
                    <Button variant="accent" asChild>
                      <Link href="/skills/error-recovery-orchestrator">View Details</Link>
                    </Button>
                  </div>
                  <CardDescription className="text-base">
                    Intelligent error detection, recovery, and health monitoring for agent workflows.
                    Automatically classify errors, execute recovery strategies, and prevent cascading failures.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-accent font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Detect Failures</h4>
                        <p className="text-sm text-muted-foreground">
                          &lt;100ms error classification. Transient vs permanent, network vs auth.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-accent font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Execute Recovery</h4>
                        <p className="text-sm text-muted-foreground">
                          Retry with exponential backoff, rollback, fallback, or skip strategies.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-accent font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Monitor Health</h4>
                        <p className="text-sm text-muted-foreground">
                          Predict failures 5+ minutes before they happen. Proactive intervention.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Code Example */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground">Quick Start Example</h4>
                    <CodeBlock
                      language="typescript"
                      title="Integrate in 3 lines"
                      code={`import { ErrorRecoveryOrchestrator } from '@agentfoundry/skills';

// Your agent workflow
async function myAgentWorkflow() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    // Automatically detect and recover
    const recovery = await ErrorRecoveryOrchestrator.recover({
      error_message: error.message,
      strategy: 'auto', // or 'retry', 'rollback', 'fallback'
      max_attempts: 3
    });

    if (recovery.success) {
      return recovery.result;
    }
    throw recovery.error;
  }
}`}
                    />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-accent">✓</span> Zero configuration required
                      <span className="text-muted-foreground">•</span>
                      <span className="text-accent">✓</span> Works with any AI agent framework
                      <span className="text-muted-foreground">•</span>
                      <span className="text-accent">✓</span> Production-tested
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coming Soon Skills */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-8 text-center">
                More Infrastructure Skills Coming Soon
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🔄</span>
                      </div>
                      <CardTitle className="text-xl">State Persistence Manager</CardTitle>
                    </div>
                    <Badge variant="outline" className="w-fit">Coming Q2 2025</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Automatic checkpointing and state recovery. Resume workflows from any point after crashes.
                    </p>
                  </CardContent>
                </Card>

                <Card className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl">⚡</span>
                      </div>
                      <CardTitle className="text-xl">Resource Optimizer</CardTitle>
                    </div>
                    <Badge variant="outline" className="w-fit">Coming Q2 2025</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Intelligent rate limiting, request batching, and cost optimization across all API calls.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-card">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <Badge variant="default" className="mb-4">Simple Integration</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Add to Any Agent in Minutes
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Works with Claude Desktop, custom applications, or self-hosted deployments.
                No vendor lock-in.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📦</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Install Skill</h3>
                <p className="text-muted-foreground">
                  <InlineCode>npm install @agentfoundry/error-recovery</InlineCode> or use our Claude Desktop MCP
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Configure</h3>
                <p className="text-muted-foreground">
                  Optional: Set retry limits, backoff strategy, health thresholds. Or use smart defaults.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Deploy</h3>
                <p className="text-muted-foreground">
                  Your agent now has enterprise-grade error recovery. Monitor in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Make Your Agents <span className="text-accent">Reliable</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join developers building production-grade AI agents with infrastructure skills.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="accent" asChild>
                <Link href="/guides">View Integration Guide</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/skills/error-recovery-orchestrator">Explore Error Recovery</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
