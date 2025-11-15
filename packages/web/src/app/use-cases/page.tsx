import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { Button } from '@/components/ui/Button';

export default function UseCases() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="mb-6">Real-World Use Cases</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              See how AgentFoundry's production skills solve real problems validated against
              40+ GitHub issues from LangChain, LlamaIndex, and CrewAI.
            </p>
          </div>
        </section>

        {/* Use Case: Tool Overload */}
        <section className="py-12 px-6 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Tool Management
                </div>
                <h2 className="text-3xl font-bold mb-4">Agent Overwhelmed with 100+ Tools</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  <strong>Problem:</strong> Agents with 100+ tools have 40% wrong tool selection rate
                  and 3.2s response time. Performance degrades significantly.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  <strong>Solution:</strong> Smart Tool Selector filters down to optimal 20-30 tools
                  using capability matching and historical learning.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Selection accuracy: 40% → 85%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Response time: 3.2s → 1.1s (65% faster)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Context usage: 8K → 2K tokens</span>
                  </div>
                </div>
              </div>
              <div>
                <CodeBlock
                  title="Smart Tool Selection"
                  code={`import { filterTools, matchCapabilities } from '@agentfoundry/smart-tool-selector';

// 150 tools causing performance issues
const allTools = loadTools(); // 150 tools

// Filter to optimal set
const filtered = await filterTools({
  available_tools: allTools,
  task_description: "Analyze customer feedback",
  max_tools: 25,
  filter_strategy: "hybrid" // capability + cost + performance
});

console.log(\`Filtered from \${allTools.length} to \${filtered.filtered_tools.length}\`);
// Filtered from 150 to 23

// Match to required capabilities
const matched = await matchCapabilities({
  tools: filtered.filtered_tools,
  required_capabilities: ["nlp", "sentiment_analysis"],
  match_threshold: 0.8
});

// Use optimized toolset - 85% selection accuracy`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Use Case: Cost Explosions */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="order-2 lg:order-1">
                <CodeBlock
                  title="Cost Management"
                  code={`import { estimateCost, setBudgetLimit, suggestCheaper } from '@agentfoundry/cost-predictor-optimizer';

// Estimate before execution
const estimate = await estimateCost({
  prompt: conversationHistory,
  model: "gpt-4",
  expected_output_length: 1000,
  tools_count: 25
});

if (estimate.estimated_cost > 5.0) {
  // Suggest cheaper alternative
  const alt = await suggestCheaper({
    current_model: "gpt-4",
    task_requirements: { complexity: "moderate", quality_threshold: 0.8 },
    current_cost: estimate.estimated_cost
  });

  console.log(\`Save \${alt.alternatives[0].savings_percent}% with \${alt.alternatives[0].model}\`);
  // Save 60% with gpt-4o-mini
}

// Enforce budget limits
await setBudgetLimit({
  budget_limit: 100,
  period: "day",
  action_on_exceed: "switch_cheaper",
  alert_threshold: 0.8 // Alert at $80
});`}
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Cost Optimization
                </div>
                <h2 className="text-3xl font-bold mb-4">$500/Day Billing Surprises</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  <strong>Problem:</strong> Agent costs explode to $500/day without warning.
                  No pre-execution cost estimation or budget controls.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  <strong>Solution:</strong> Cost Predictor estimates costs before execution,
                  suggests cheaper alternatives, and enforces spending caps.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Pre-execution cost estimates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>60%+ cost savings with model switching</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Budget enforcement with alerts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Case: Multi-Agent Chaos */}
        <section className="py-12 px-6 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Multi-Agent Coordination
                </div>
                <h2 className="text-3xl font-bold mb-4">Manager Agents Can't Coordinate 5+ Sub-Agents</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  <strong>Problem:</strong> Deadlocks, race conditions, and resource conflicts
                  when coordinating 5+ agents. No conflict resolution.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  <strong>Solution:</strong> Multi-Agent Orchestrator handles hierarchical coordination,
                  conflict detection, deadlock prevention, and parallel optimization.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Coordinate 5-50 sub-agents</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Automatic conflict resolution</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Deadlock prevention</span>
                  </div>
                </div>
              </div>
              <div>
                <CodeBlock
                  title="Multi-Agent Orchestration"
                  code={`import { orchestrateAgents, detectConflicts } from '@agentfoundry/multi-agent-orchestrator';

const agents = [
  { id: 'data-collector', capabilities: ['api', 'scraping'] },
  { id: 'data-processor', capabilities: ['transform', 'validate'] },
  { id: 'data-analyzer', capabilities: ['analyze', 'ml'] },
  { id: 'report-generator', capabilities: ['reporting', 'viz'] },
  { id: 'notifier', capabilities: ['email', 'slack'] }
];

const workflow = {
  tasks: [
    { id: 'collect', agent: 'data-collector' },
    { id: 'process', agent: 'data-processor', depends: ['collect'] },
    { id: 'analyze', agent: 'data-analyzer', depends: ['process'] },
    { id: 'report', agent: 'report-generator', depends: ['analyze'] },
    { id: 'notify', agent: 'notifier', depends: ['report'] }
  ]
};

// Orchestrate with automatic conflict resolution
const plan = await orchestrateAgents({
  agents,
  workflow,
  execution_strategy: "hybrid" // parallel where possible
});

// Handles deadlocks, conflicts, and parallelization automatically`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Use Case: Memory Loss */}
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="order-2 lg:order-1">
                <CodeBlock
                  title="Long-Term Memory"
                  code={`import { storeMemory, retrieveRelevant, resumeSession } from '@agentfoundry/memory-synthesis-engine';

// Store important context
await storeMemory({
  content: "User prefers TypeScript and Jest for testing",
  memory_type: "long_term",
  importance: 0.9,
  tags: ["preferences", "testing"]
});

// Days later... Resume multi-day project
const session = await resumeSession({
  session_id: "project-xyz",
  include_context: true
});

console.log(session.context_summary);
// "Working on microservices migration.
// Completed: API Gateway, Auth Service.
// Next: Payment Service integration."

// Retrieve relevant memories
const memories = await retrieveRelevant({
  query: "testing preferences",
  memory_types: ["long_term"],
  similarity_threshold: 0.7
});

// Agent remembers user's testing preferences from days ago`}
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Context Management
                </div>
                <h2 className="text-3xl font-bold mb-4">Agents Forget Multi-Day Projects</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  <strong>Problem:</strong> Can't resume multi-day coding projects. Context lost
                  across sessions. Have to re-explain everything.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  <strong>Solution:</strong> Memory Synthesis Engine provides long-term memory
                  with semantic retrieval and session continuity.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Memory across days/weeks/months</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Semantic retrieval of relevant context</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Resume exactly where you left off</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-secondary/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="mb-6">Ready to solve your agent problems?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              All 23 production skills validated against real GitHub issues.
              Start with the free plan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="shine-hover" asChild>
                <Link href="/marketplace">Browse All Skills</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/guides">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
