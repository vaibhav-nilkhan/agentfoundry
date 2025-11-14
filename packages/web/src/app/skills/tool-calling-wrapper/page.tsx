import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ToolCallingWrapperPage() {
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
                <span className="text-4xl">🔧</span>
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold">
                  Tool Calling Wrapper
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="default">Production Ready</Badge>
                  <Badge variant="default">v1.0.0</Badge>
                  <Badge variant="outline">Infrastructure Skill</Badge>
                </div>
              </div>
            </div>

            <p className="text-xl text-muted-foreground mb-8 max-w-4xl">
              Universal cross-framework tool execution with retry logic. Reduce 75% tool calling failures with automatic retry, schema validation, and framework conversion.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <Button size="lg" variant="default" asChild>
                <Link href="/guides">View Integration Guide</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#tools">Explore Tools</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="https://github.com/agentfoundry/skills/tool-calling-wrapper">GitHub</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">75%</div>
                <div className="text-sm text-muted-foreground">Failure Reduction</div>
              </div>
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-accent mb-1">5+</div>
                <div className="text-sm text-muted-foreground">Frameworks Supported</div>
              </div>
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">&lt;50ms</div>
                <div className="text-sm text-muted-foreground">Validation Overhead</div>
              </div>
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-accent mb-1">4</div>
                <div className="text-sm text-muted-foreground">Core Tools</div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <span className="text-destructive">⚠️</span> The Problem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>• 75% tool calling failure rate in production</p>
                  <p>• No cross-framework compatibility</p>
                  <p>• Manual schema validation required</p>
                  <p>• Complex retry logic implementation</p>
                </CardContent>
              </Card>

              <Card className="border-accent/30 bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <span className="text-accent">✓</span> The Solution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>• Automatic retry with exponential backoff</p>
                  <p>• Pre/post-execution validation</p>
                  <p>• Framework conversion (LangChain, LlamaIndex, MCP, OpenAI, Claude)</p>
                  <p>• Standardized error handling</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section id="tools" className="py-20 px-6 bg-card">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <Badge variant="default" className="mb-4">4 Core Tools</Badge>
              <h2 className="text-4xl font-bold mb-4">
                Complete Tool Execution Pipeline
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">validate_tool_schema</CardTitle>
                  <CardDescription>Pre-execution validation</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Validate tool schemas before execution using Ajv and Zod. Catch errors early and provide detailed validation feedback.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">execute_with_retry</CardTitle>
                  <CardDescription>Retry with exponential backoff</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Execute tools with intelligent retry logic, exponential backoff, and jitter. Handles transient failures automatically.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">verify_output</CardTitle>
                  <CardDescription>Post-execution verification</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Validate tool outputs against expected schemas. Ensure data quality and catch malformed responses.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">convert_tool_format</CardTitle>
                  <CardDescription>Cross-framework conversion</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Convert tool definitions between LangChain, LlamaIndex, MCP, OpenAI, and Claude formats. Universal compatibility.
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
                Who Uses Tool Calling Wrapper?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Solo Developers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Use case:</strong> Building agents with LangChain that call external APIs</p>
                  <p><strong>Challenge:</strong> 75% of tool calls fail due to schema mismatches and timeouts</p>
                  <p><strong>Solution:</strong> Auto-retry with validation reduces failures to &lt;10%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Multi-Framework Teams</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Use case:</strong> Migrating from LangChain to LlamaIndex</p>
                  <p><strong>Challenge:</strong> Need to rewrite all tool definitions manually</p>
                  <p><strong>Solution:</strong> Framework converter migrates 50+ tools in minutes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Production Systems</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Use case:</strong> Enterprise agents calling mission-critical APIs</p>
                  <p><strong>Challenge:</strong> No standardized error handling across tools</p>
                  <p><strong>Solution:</strong> Unified retry + validation layer for all frameworks</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-card">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Improve Tool Reliability?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with the free plan. 100 tool calls/month included.
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
