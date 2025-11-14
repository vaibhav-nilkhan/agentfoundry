import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ContextCompressionEnginePage() {
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
                <span className="text-4xl">📦</span>
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold">
                  Context Compression Engine
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="default">Production Ready</Badge>
                  <Badge variant="default">v1.0.0</Badge>
                  <Badge variant="outline">Infrastructure Skill</Badge>
                </div>
              </div>
            </div>

            <p className="text-xl text-muted-foreground mb-8 max-w-4xl">
              Reduce context by 60-80% while preserving meaning. Intelligent compression, relevance ranking, semantic deduplication, and progressive summarization.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <Button size="lg" variant="default" asChild>
                <Link href="/guides">View Integration Guide</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#tools">Explore Tools</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="https://github.com/agentfoundry/skills/context-compression-engine">GitHub</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">60-80%</div>
                <div className="text-sm text-muted-foreground">Token Reduction</div>
              </div>
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-accent mb-1">85-95%</div>
                <div className="text-sm text-muted-foreground">Meaning Preserved</div>
              </div>
              <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
                <div className="text-3xl font-bold text-primary mb-1">&lt;100ms</div>
                <div className="text-sm text-muted-foreground">Compression Speed</div>
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
                  <p>• Context windows fill up quickly in long conversations</p>
                  <p>• No intelligent prioritization of what to keep</p>
                  <p>• Manual pruning is error-prone</p>
                  <p>• Token costs escalate with conversation length</p>
                </CardContent>
              </Card>

              <Card className="border-accent/30 bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <span className="text-accent">✓</span> The Solution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>• Smart compression reduces by 60-80% automatically</p>
                  <p>• Relevance ranking keeps what matters</p>
                  <p>• Semantic deduplication removes redundancy</p>
                  <p>• Progressive summarization creates hierarchies</p>
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
                Complete Context Management Pipeline
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">compress_context</CardTitle>
                  <CardDescription>Compress context by 60-80%</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Intelligent compression with 3 strategies (conservative, balanced, aggressive). Preserves critical information while reducing token count.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">analyze_relevance</CardTitle>
                  <CardDescription>Score and rank by relevance</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Multi-factor relevance scoring based on recency, semantic similarity, importance, and data density. Returns ranked items with recommendations.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">deduplicate_semantic</CardTitle>
                  <CardDescription>Remove redundant content</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Semantic deduplication using similarity algorithms. Detects and removes duplicate information while preserving the most detailed version.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-mono">summarize_progressive</CardTitle>
                  <CardDescription>Multi-level summaries</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Progressive summarization creates hierarchical summaries at multiple levels. Extract critical, important, and contextual information.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Optimize Context?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with the free plan. 50 compressions/month included.
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
