import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function FAQPage() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen pt-24">
        {/* Header */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge variant="default" className="mb-4">Help Center</Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about AgentFoundry.
            </p>
          </div>
        </section>

        {/* General */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">General</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">What is AgentFoundry?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    AgentFoundry is a marketplace and infrastructure platform for AI agent capabilities (called "skills").
                    It provides production-ready tools for common agent tasks like error recovery, API validation,
                    security scanning, and content intelligence.
                  </p>
                  <p className="mt-3">
                    Think of it as the npm or PyPI for AI agents—reusable, validated components that make your agents more reliable.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">What is a skill?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    A skill is a modular capability that provides one or more tools to your AI agent.
                    For example, the Error Recovery Orchestrator skill provides 4 tools: detect_failure,
                    execute_recovery, monitor_health, and generate_postmortem.
                  </p>
                  <p className="mt-3">
                    Skills are: validated (tested in production), documented (with integration guides),
                    and maintained (updated with bug fixes and new features).
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">How is AgentFoundry different from building tools myself?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <ul className="space-y-2 list-disc ml-5">
                    <li><strong>Time:</strong> Use production-ready skills in minutes vs. weeks of development</li>
                    <li><strong>Quality:</strong> Validated and tested with real agent workflows</li>
                    <li><strong>Maintenance:</strong> We handle updates, bug fixes, and improvements</li>
                    <li><strong>Integration:</strong> Works with Claude Desktop, custom apps, or REST API</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-12 px-6 bg-card">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">Pricing & Plans</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Is there a free tier?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Yes! Every skill has a free tier with limited usage. Typically:
                  </p>
                  <ul className="mt-3 space-y-2 list-disc ml-5">
                    <li>100-1,000 skill executions per month (varies by skill)</li>
                    <li>Access to core features</li>
                    <li>Community support</li>
                  </ul>
                  <p className="mt-3">
                    Perfect for prototyping, testing, or small-scale projects.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">How does billing work?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Each skill has its own pricing tier. You pay per skill you use:
                  </p>
                  <ul className="mt-3 space-y-2 list-disc ml-5">
                    <li><strong>Free:</strong> Limited executions per month</li>
                    <li><strong>Pro:</strong> $29-99/month per skill (unlimited or high limits)</li>
                    <li><strong>Enterprise:</strong> Custom pricing for unlimited usage, SLAs, and dedicated support</li>
                  </ul>
                  <p className="mt-3">
                    <Link href="/pricing" className="text-primary hover:underline">View detailed pricing →</Link>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Can I use multiple skills on the free tier?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Yes! You can use as many skills as you want on their free tiers.
                    Each skill's free tier limits are independent.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">What happens if I exceed my free tier limits?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Requests beyond your free tier limit will return a 429 (Rate Limit) error.
                    You'll need to upgrade to Pro tier or wait for the next billing cycle.
                  </p>
                  <p className="mt-3">
                    We'll send you email notifications at 80% and 100% of your limit.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technical */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">Technical</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">What languages/frameworks are supported?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <ul className="space-y-2 list-disc ml-5">
                    <li><strong>TypeScript/JavaScript:</strong> Official SDK (<code>@agentfoundry/sdk</code>)</li>
                    <li><strong>Python:</strong> Official SDK (<code>agentfoundry</code>)</li>
                    <li><strong>Any language:</strong> REST API (language-agnostic)</li>
                    <li><strong>Claude Desktop:</strong> Model Context Protocol (MCP) integration</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Do skills work with any LLM (GPT-4, Claude, Llama)?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Yes! AgentFoundry skills are LLM-agnostic. They work with:
                  </p>
                  <ul className="mt-3 space-y-2 list-disc ml-5">
                    <li>OpenAI (GPT-4, GPT-3.5)</li>
                    <li>Anthropic (Claude 3)</li>
                    <li>Open-source models (Llama, Mistral)</li>
                    <li>Custom LLMs</li>
                  </ul>
                  <p className="mt-3">
                    Skills are tools that your agent calls—they don't depend on which LLM you use.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">What is the API latency?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Latency varies by skill and tool:
                  </p>
                  <ul className="mt-3 space-y-2 list-disc ml-5">
                    <li><strong>Fast tools</strong> (detect_failure, monitor_health): ~50-100ms</li>
                    <li><strong>Medium tools</strong> (execute_recovery): 200-500ms</li>
                    <li><strong>Complex tools</strong> (generate_postmortem): 1-3 seconds</li>
                  </ul>
                  <p className="mt-3">
                    All tools are optimized for real-time agent workflows.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Can I self-host AgentFoundry?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Yes! Enterprise customers can self-host AgentFoundry using:
                  </p>
                  <ul className="mt-3 space-y-2 list-disc ml-5">
                    <li>Docker Compose (for development/small teams)</li>
                    <li>Kubernetes with Helm charts (for production)</li>
                  </ul>
                  <p className="mt-3">
                    Self-hosting requires an Enterprise plan.{' '}
                    <Link href="mailto:sales@agentfoundry.dev" className="text-primary hover:underline">Contact sales →</Link>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">What are the rate limits?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <ul className="space-y-2 list-disc ml-5">
                    <li><strong>Free tier:</strong> 2 requests/second, 1,000/month</li>
                    <li><strong>Pro tier:</strong> 10 requests/second, unlimited monthly</li>
                    <li><strong>Enterprise:</strong> Custom rate limits</li>
                  </ul>
                  <p className="mt-3">
                    <Link href="/docs/api-reference#rate-limits" className="text-primary hover:underline">
                      View detailed rate limit documentation →
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="py-12 px-6 bg-card">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">Security & Privacy</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Is my data secure?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Yes. AgentFoundry follows industry best practices:
                  </p>
                  <ul className="mt-3 space-y-2 list-disc ml-5">
                    <li>All API requests use HTTPS (TLS 1.3)</li>
                    <li>API keys are encrypted at rest</li>
                    <li>We don't store skill execution results (only metadata for billing)</li>
                    <li>SOC 2 Type II compliance (in progress)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Do you train on my data?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    <strong>No.</strong> We never use your skill execution data to train models or improve our services.
                    Your data is only used for the specific skill execution you requested.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Can I use AgentFoundry for regulated industries (healthcare, finance)?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Yes. Enterprise plans include:
                  </p>
                  <ul className="mt-3 space-y-2 list-disc ml-5">
                    <li>HIPAA compliance (for healthcare)</li>
                    <li>SOC 2 Type II certification</li>
                    <li>On-premises deployment options</li>
                    <li>Data residency controls</li>
                    <li>BAA agreements</li>
                  </ul>
                  <p className="mt-3">
                    <Link href="mailto:compliance@agentfoundry.dev" className="text-primary hover:underline">
                      Contact our compliance team →
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">Support</h2>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">How do I get support?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <ul className="space-y-2 list-disc ml-5">
                    <li><strong>Free tier:</strong> Community support via Discord</li>
                    <li><strong>Pro tier:</strong> Email support (24-48 hour response time)</li>
                    <li><strong>Enterprise:</strong> Dedicated Slack channel + 4-hour SLA</li>
                  </ul>
                  <div className="mt-4 flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="https://discord.gg/agentfoundry">Join Discord</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="mailto:support@agentfoundry.dev">Email Support</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Where can I report bugs or request features?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <ul className="space-y-2 list-disc ml-5">
                    <li><strong>GitHub Issues:</strong>{' '}
                      <Link href="https://github.com/agentfoundry/skills/issues" className="text-primary hover:underline">
                        github.com/agentfoundry/skills/issues
                      </Link>
                    </li>
                    <li><strong>Discord:</strong> #feature-requests channel</li>
                    <li><strong>Email:</strong> feedback@agentfoundry.dev</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">What is your uptime SLA?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <ul className="space-y-2 list-disc ml-5">
                    <li><strong>Free/Pro:</strong> 99.5% uptime (best effort)</li>
                    <li><strong>Enterprise:</strong> 99.9% uptime with SLA credits</li>
                  </ul>
                  <p className="mt-3">
                    Check current status:{' '}
                    <Link href="https://status.agentfoundry.dev" className="text-primary hover:underline">
                      status.agentfoundry.dev
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Still have questions */}
        <section className="py-16 px-6 bg-card">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're here to help. Reach out via Discord, email, or schedule a call with our team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="default" asChild>
                <Link href="https://discord.gg/agentfoundry">Join Discord</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="mailto:support@agentfoundry.dev">Email Support</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/docs/getting-started">Getting Started Guide</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
