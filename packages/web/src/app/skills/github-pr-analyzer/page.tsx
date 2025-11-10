import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';

export default function GitHubPRAnalyzerPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <section className="pt-32 pb-24 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/40 backdrop-blur-sm mb-8">
              <span className="text-sm font-medium">Developer Tool</span>
            </div>
            <h1 className="mb-6">GitHub PR Analyzer</h1>
            <p className="text-xl text-muted-foreground mb-10">
              Intelligent pull request analysis with security scanning, code quality scoring, and AI-powered reviewer suggestions.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/guides">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="https://github.com/agentfoundry/skills" target="_blank">GitHub</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
