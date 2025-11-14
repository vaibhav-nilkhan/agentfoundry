import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function JsonValidatorPage() {
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
                <span className="text-4xl">✓</span>
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold">
                  JSON Validator
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="default">Production Ready</Badge>
                  <Badge variant="default">v1.0.0</Badge>
                  <Badge variant="outline">Infrastructure Skill</Badge>
                </div>
              </div>
            </div>

            <p className="text-xl text-muted-foreground mb-8 max-w-4xl">
              Solve 30% invalid JSON rate from LLM outputs. Auto-fix malformed JSON, retry failed calls with enhanced prompts, and generate schemas from examples.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <Button size="lg" variant="default" asChild>
                <Link href="/guides">View Integration Guide</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#tools">Explore Tools</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="https://github.com/agentfoundry/skills/json-validator">GitHub</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">83%</div>
                <div className="text-sm text-muted-foreground">Error Reduction</div>
              </div>
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-accent mb-1">&lt;5%</div>
                <div className="text-sm text-muted-foreground">Invalid Rate (After)</div>
              </div>
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">&lt;10ms</div>
                <div className="text-sm text-muted-foreground">Validation Speed</div>
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
                  <p>• 30% invalid JSON rate from LLM outputs</p>
                  <p>• No automatic validation before processing</p>
                  <p>• Manual retry when JSON is malformed</p>
                  <p>• No schema generation from examples</p>
                </CardContent>
              </Card>

              <Card className="border-accent/30 bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <span className="text-accent">✓</span> The Solution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>• Schema validation with detailed error reporting</p>
                  <p>• Auto-fix common errors (missing commas, quotes)</p>
                  <p>• Intelligent retry with enhanced prompts</p>
                  <p>• Schema generation from JSON examples</p>
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
                Complete JSON Validation Pipeline
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">validate_json</CardTitle>
                  <CardDescription>Validate JSON against schema</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Validate JSON data against JSON Schema with detailed error reporting and fix suggestions. Supports strict mode and custom validation rules.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">auto_fix_json</CardTitle>
                  <CardDescription>Auto-fix common JSON errors</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Automatically fix malformed JSON: missing commas, trailing commas, single quotes, unquoted keys, missing brackets. 3 fix levels available.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">retry_with_schema</CardTitle>
                  <CardDescription>Retry LLM with enhanced schema</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Retry LLM calls with schema-enhanced prompts when JSON is invalid. Tracks attempt history and estimated costs.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">generate_schema</CardTitle>
                  <CardDescription>Generate schema from examples</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Generate JSON Schema from example JSON objects. Automatically infer types, detect conflicts, and suggest required fields.
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
                Who Uses JSON Validator?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">LLM Application Developers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Use case:</strong> Building chatbots that return structured data</p>
                  <p><strong>Challenge:</strong> 30% of LLM outputs are malformed JSON</p>
                  <p><strong>Solution:</strong> Auto-fix + retry reduces invalid rate to &lt;5%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">API Integration Teams</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Use case:</strong> Validating API responses before processing</p>
                  <p><strong>Challenge:</strong> No schema for legacy APIs, manual validation error-prone</p>
                  <p><strong>Solution:</strong> Generate schemas from examples, auto-validate all responses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Production AI Systems</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p><strong>Use case:</strong> Multi-agent systems with structured communication</p>
                  <p><strong>Challenge:</strong> Agent crashes when receiving invalid JSON from other agents</p>
                  <p><strong>Solution:</strong> Validation layer with auto-fix prevents 83% of crashes</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-card">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Fix JSON Errors?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with the free plan. 100 validations/month included.
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
