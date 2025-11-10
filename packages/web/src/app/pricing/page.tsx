import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PricingPage() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen pt-24">
        {/* Header */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-5xl text-center">
            <Badge variant="default" className="mb-6">
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Infrastructure Skills That Scale With You
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Pay for what you use. No hidden fees. All tiers include access to Error Recovery Orchestrator.
            </p>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="pb-20 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Developer Tier */}
              <Card className="hover:border-primary/50 transition-all">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-4">For Solo Developers</Badge>
                  <CardTitle className="text-3xl mb-2">Developer</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>
                    Perfect for testing and small projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">1,000 skill executions/month</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Error Recovery Orchestrator</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Basic health monitoring</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">7-day log retention</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Community support</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">All future infrastructure skills</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/signup?plan=developer">Get Started Free</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Team Tier - Popular */}
              <Card className="border-primary glow-blue relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="default">Most Popular</Badge>
                </div>
                <CardHeader>
                  <Badge variant="default" className="w-fit mb-4">For Startups & Teams</Badge>
                  <CardTitle className="text-3xl mb-2">Team</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">$49</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>
                    Production-grade infrastructure for growing teams
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm font-semibold">100,000 skill executions/month</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Everything in Developer, plus:</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Advanced failure prediction</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">30-day log retention</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Custom recovery strategies</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Email support (24h response)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Automated postmortem reports</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Team collaboration features</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="default" asChild>
                    <Link href="/signup?plan=team">Start 14-Day Trial</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Enterprise Tier */}
              <Card className="hover:border-primary/50 transition-all">
                <CardHeader>
                  <Badge variant="default" className="w-fit mb-4">For Enterprises</Badge>
                  <CardTitle className="text-3xl mb-2">Enterprise</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">Custom</span>
                  </div>
                  <CardDescription>
                    Self-hosted infrastructure with enterprise SLAs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm font-semibold">Unlimited skill executions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Everything in Team, plus:</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Self-hosted deployment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Custom SLAs & support</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Dedicated infrastructure engineer</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Priority feature requests</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">Custom skill development</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-sm">SSO & advanced security</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/contact?plan=enterprise">Contact Sales</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Usage-Based Pricing Details */}
        <section className="py-20 px-6 bg-card">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Usage-Based Pricing</h2>
              <p className="text-lg text-muted-foreground">
                Need more than your plan includes? Pay only for what you use.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skill Executions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">$0.001</div>
                  <p className="text-sm text-muted-foreground">per additional execution</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Includes error detection, recovery attempt, and health check
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Log Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">$0.10</div>
                  <p className="text-sm text-muted-foreground">per GB per month</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Extended retention for compliance and forensics
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Premium Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">$499</div>
                  <p className="text-sm text-muted-foreground">per month add-on</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    1-hour response time, dedicated Slack channel
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What counts as a skill execution?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    One skill execution = one call to any AgentFoundry infrastructure skill (detect_failure,
                    execute_recovery, monitor_health, or generate_postmortem). Health checks and monitoring
                    pings count toward your limit.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! No lock-in contracts. Cancel anytime and you'll retain access until the end of your
                    billing period. All your data remains accessible for 30 days after cancellation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do you offer discounts for non-profits or education?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! We offer 50% off Team plans for verified non-profits, educational institutions,
                    and open-source projects. Contact us at education@agentfoundry.ai for details.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What happens if I exceed my execution limit?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your skills continue to work! We'll automatically charge $0.001 per additional execution.
                    You can set spending limits in your dashboard to avoid surprises.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is there a free trial for paid plans?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! Team plan includes a 14-day free trial with full access to all features.
                    No credit card required to start.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Build Reliable Agents?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with the free Developer plan. Upgrade when you're ready to scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="default" asChild>
                <Link href="/signup">Start Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
