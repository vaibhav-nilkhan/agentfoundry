import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';

export default function Home() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Hero Section - Clean & Professional */}
        <section className="pt-32 pb-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 gradient-subtle" />

          <div className="container mx-auto relative z-10 max-w-6xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/40 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Infrastructure Skills for AI Agents</span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 max-w-4xl">
              Make your agents <br className="hidden sm:block" />
              reliable in production
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              Infrastructure skills that make all other skills work better.
              Automatic error recovery, health monitoring, and failure prediction
              for production AI agent systems.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Button size="lg" className="shine-hover" asChild>
                <Link href="/guides">
                  Get Started
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#demo">See Demo</Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Production-ready</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>&lt;100ms latency</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Open source</span>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-24 px-6 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="mb-4">See it in action</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Add intelligent error recovery to your agents in minutes.
                No configuration required.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Code Example */}
              <div>
                <CodeBlock
                  title="agent.ts"
                  code={`import { ErrorRecovery } from '@agentfoundry/skills';

async function myAgentWorkflow() {
  try {
    const result = await fetchUserData();
    return result;
  } catch (error) {
    // Automatically detect and recover
    const recovery = await ErrorRecovery.recover({
      error_message: error.message,
      strategy: 'auto',
      max_attempts: 3
    });

    if (recovery.success) {
      return recovery.result;
    }
    throw recovery.error;
  }
}`}
                />
              </div>

              {/* Benefits */}
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Instant classification</h3>
                    <p className="text-muted-foreground">
                      Detects error type in &lt;100ms. Transient vs permanent, network vs auth.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Smart recovery</h3>
                    <p className="text-muted-foreground">
                      Exponential backoff with jitter. Retry, rollback, fallback, or skip.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Predictive monitoring</h3>
                    <p className="text-muted-foreground">
                      Predicts failures 5+ minutes before they happen. Proactive intervention.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">36% → 80%+</div>
                <p className="text-muted-foreground">
                  Success rate improvement with error recovery enabled
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">&lt;100ms</div>
                <p className="text-muted-foreground">
                  Error detection and classification latency
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">99.9%</div>
                <p className="text-muted-foreground">
                  Uptime with health monitoring and predictions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Production Skills Showcase */}
        <section className="py-24 px-6 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="mb-4">Production-ready AI agent skills</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From infrastructure to developer tools to content intelligence.
                Battle-tested skills that solve real problems.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Error Recovery Orchestrator */}
              <Link href="/skills/error-recovery-orchestrator">
                <Card className="hover-lift h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      Error Recovery Orchestrator
                    </CardTitle>
                    <CardDescription>
                      Intelligent error detection and automatic recovery for production AI agents.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {/* API Contract Guardian */}
              <Link href="/skills/api-contract-guardian">
                <Card className="hover-lift h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      API Contract Guardian
                    </CardTitle>
                    <CardDescription>
                      Detect breaking API changes and generate tests before shipping.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {/* Code Security Audit */}
              <Link href="/skills/code-security-audit">
                <Card className="hover-lift h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      Code Security Audit
                    </CardTitle>
                    <CardDescription>
                      AI-powered security scanning with automated fixes and exploit generation.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {/* GitHub PR Analyzer */}
              <Link href="/skills/github-pr-analyzer">
                <Card className="hover-lift h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      GitHub PR Analyzer
                    </CardTitle>
                    <CardDescription>
                      Intelligent pull request analysis with security scanning and reviewer suggestions.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {/* Technical Debt Quantifier */}
              <Link href="/skills/technical-debt-quantifier">
                <Card className="hover-lift h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Technical Debt Quantifier
                    </CardTitle>
                    <CardDescription>
                      Quantify tech debt in dollar values with ROI-based refactoring prioritization.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {/* Content Gap Analyzer */}
              <Link href="/skills/content-gap-analyzer">
                <Card className="hover-lift h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      Content Gap Analyzer
                    </CardTitle>
                    <CardDescription>
                      Find content gaps vs competitors and generate SEO-optimized briefs.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {/* Viral Content Predictor */}
              <Link href="/skills/viral-content-predictor">
                <Card className="hover-lift h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      Viral Content Predictor
                    </CardTitle>
                    <CardDescription>
                      Predict content virality before publishing with AI-powered scoring and optimization.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="mb-6">Ready to build reliable agents?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Start with the free Developer plan. 1,000 skill executions/month included.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="shine-hover" asChild>
                <Link href="/guides">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
