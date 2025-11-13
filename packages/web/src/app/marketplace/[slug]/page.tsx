import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { skills } from '@/data/skills';

export async function generateStaticParams() {
  return skills.map((skill) => ({
    slug: skill.slug,
  }));
}

interface SkillDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { slug } = await params;
  const skill = skills.find((s) => s.slug === slug);

  if (!skill) {
    notFound();
  }

  const getIconSVG = (iconName: string) => {
    const icons: Record<string, string> = {
      shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      currency: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    };
    return icons[iconName] || icons.shield;
  };

  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 gradient-subtle" />

          <div className="container mx-auto relative z-10 max-w-5xl">
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Marketplace
            </Link>

            <div className="flex items-start gap-6 mb-8">
              <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIconSVG(skill.icon)} />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="mb-4">{skill.name}</h1>
                <p className="text-xl text-muted-foreground mb-6">
                  {skill.description}
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-foreground font-medium">{skill.rating}</span>
                    <span className="text-muted-foreground">rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-foreground font-medium">{skill.downloads.toLocaleString()}</span>
                    <span className="text-muted-foreground">downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                    </svg>
                    <span className="text-foreground font-medium">{skill.tools.length}</span>
                    <span className="text-muted-foreground">tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">v{skill.version}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="shine-hover" asChild>
                <Link href={`/skills/${skill.slug}`}>View Full Documentation</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={skill.repository} target="_blank">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Installation Section */}
        <section className="py-16 px-6 bg-secondary/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="mb-8">Installation</h2>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">NPM Package</CardTitle>
                <CardDescription>Install via npm, yarn, or pnpm</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  title="Terminal"
                  code={`# NPM
npm install @agentfoundry-skills/${skill.slug}

# Yarn
yarn add @agentfoundry-skills/${skill.slug}

# PNPM
pnpm add @agentfoundry-skills/${skill.slug}`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Claude Code Skill</CardTitle>
                <CardDescription>Install directly for Claude Code</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  title="Terminal"
                  code={`# Install skill to Claude Code
agentfoundry skill install ${skill.slug}

# Or manually clone to skills directory
git clone ${skill.repository} ~/.claude/skills/${skill.slug}`}
                />
                <p className="text-sm text-muted-foreground mt-4">
                  Skills are automatically activated when Claude detects relevant tasks in your conversation.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tools Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-5xl">
            <h2 className="mb-8">Available Tools</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {skill.tools.map((tool, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      {tool.name}
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 px-6 bg-secondary/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="mb-8 text-center">Pricing</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {skill.pricing.tiers.map((tier, index) => (
                <Card key={index} className={index === 1 ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle>{tier.name}</CardTitle>
                      {index === 1 && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Popular</span>
                      )}
                    </div>
                    <div className="text-3xl font-bold">
                      ${tier.price}
                      <span className="text-lg text-muted-foreground font-normal">/mo</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-6" variant={index === 1 ? 'default' : 'outline'} asChild>
                      <Link href="/guides">
                        {tier.price === 0 ? 'Get Started' : 'Start Free Trial'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tags Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-5xl">
            <h3 className="font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {skill.tags.map(tag => (
                <Link key={tag} href={`/marketplace?q=${tag}`}>
                  <span className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm transition-colors cursor-pointer">
                    {tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
