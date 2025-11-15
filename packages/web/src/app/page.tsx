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
              <h2 className="mb-4">23 Production-Ready Skills</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Complete infrastructure toolkit validated against 40+ GitHub issues.
                From agent reliability to cost optimization to multi-agent orchestration.
              </p>
            </div>

            {/* Top Infrastructure Skills - Tier 2 High-Value */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">🔥 Tier 2 High-Value Skills</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Research-validated solutions to the most critical pain points ($13M ARR potential)
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/showcase">
                    View Interactive Showcase →
                  </Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Cost Predictor & Optimizer */}
                <Link href="/skills/cost-predictor-optimizer">
                  <Card className="hover-lift h-full border-2 border-yellow-500/30 bg-yellow-50/5">
                    <CardHeader>
                      <div className="mb-2 px-2 py-1 bg-yellow-500/10 rounded-full text-xs font-semibold text-yellow-600 inline-block">
                        Priority #1
                      </div>
                      <CardTitle className="flex items-center gap-3 text-base">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        Cost Predictor & Optimizer
                      </CardTitle>
                      <CardDescription>
                        Prevent $1K-$5K/month billing surprises. Pre-execution estimates, budget enforcement, cheaper model suggestions.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                {/* Multi-Agent Orchestrator */}
                <Link href="/skills/multi-agent-orchestrator">
                  <Card className="hover-lift h-full border-2 border-blue-500/30 bg-blue-50/5">
                    <CardHeader>
                      <div className="mb-2 px-2 py-1 bg-blue-500/10 rounded-full text-xs font-semibold text-blue-600 inline-block">
                        Priority #2
                      </div>
                      <CardTitle className="flex items-center gap-3 text-base">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        Multi-Agent Orchestrator
                      </CardTitle>
                      <CardDescription>
                        Solve cascading hallucinations and 10-hour simple tasks. Deadlock prevention, conflict resolution, parallel optimization.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                {/* Decision Explainer */}
                <Link href="/skills/decision-explainer">
                  <Card className="hover-lift h-full border-2 border-purple-500/30 bg-purple-50/5">
                    <CardHeader>
                      <div className="mb-2 px-2 py-1 bg-purple-500/10 rounded-full text-xs font-semibold text-purple-600 inline-block">
                        Priority #3
                      </div>
                      <CardTitle className="flex items-center gap-3 text-base">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        Decision Explainer
                      </CardTitle>
                      <CardDescription>
                        Beat 95% enterprise failure rate. SOC 2/HIPAA audit trails, confidence scoring, visual decision trees.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                {/* Memory Synthesis Engine */}
                <Link href="/skills/memory-synthesis-engine">
                  <Card className="hover-lift h-full border-2 border-green-500/30 bg-green-50/5">
                    <CardHeader>
                      <div className="mb-2 px-2 py-1 bg-green-500/10 rounded-full text-xs font-semibold text-green-600 inline-block">
                        Priority #4
                      </div>
                      <CardTitle className="flex items-center gap-3 text-base">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        Memory Synthesis Engine
                      </CardTitle>
                      <CardDescription>
                        Achieve +26% accuracy with long-term memory. Semantic retrieval, knowledge graphs, session continuity across weeks.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Featured Phase 1 Skills */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-6">⭐ Featured Phase 1 Skills</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Agent Reliability Wrapper */}
                <Link href="/skills/agent-reliability-wrapper">
                  <Card className="hover-lift h-full border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-base">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        Agent Reliability Wrapper
                      </CardTitle>
                      <CardDescription>
                        Reduce 75% tool calling failure rate to &lt;10% with automatic retry and fallback strategies.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                {/* Smart Tool Selector */}
                <Link href="/skills/smart-tool-selector">
                  <Card className="hover-lift h-full border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-base">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </div>
                        Smart Tool Selector
                      </CardTitle>
                      <CardDescription>
                        Filter 100+ tools down to optimal 20-30. Improve selection accuracy from 40% to 85%.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                {/* Context Compression Engine */}
                <Link href="/skills/context-compression-engine">
                  <Card className="hover-lift h-full border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-base">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                          </svg>
                        </div>
                        Context Compression Engine
                      </CardTitle>
                      <CardDescription>
                        Reduce token usage by 70% while maintaining quality. Save $7K/month for high-volume users.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>

            {/* All Skills Grid */}
            <div>
              <h3 className="text-xl font-semibold mb-6">All Production Skills</h3>
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

              {/* Multi-Agent Orchestrator */}
              <Link href="/skills/multi-agent-orchestrator">
                <Card className="hover-lift h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      Multi-Agent Orchestrator
                    </CardTitle>
                    <CardDescription>
                      Coordinate 5+ agents with conflict resolution and deadlock prevention.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {/* Memory Synthesis Engine */}
              <Link href="/skills/memory-synthesis-engine">
                <Card className="hover-lift h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      Memory Synthesis Engine
                    </CardTitle>
                    <CardDescription>
                      Long-term memory across days/weeks/months with knowledge graphs and session continuity.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              {/* Decision Explainer */}
              <Link href="/skills/decision-explainer">
                <Card className="hover-lift h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      Decision Explainer
                    </CardTitle>
                    <CardDescription>
                      Transparent decision breakdowns with SOC 2/HIPAA compliance audit trails.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              </div>

              {/* View All Link */}
              <div className="text-center mt-8">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/marketplace">
                    View All 23 Skills
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </Button>
              </div>
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
