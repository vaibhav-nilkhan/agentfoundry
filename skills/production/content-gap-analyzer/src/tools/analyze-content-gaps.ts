import { z } from 'zod';

const inputSchema = z.object({
  your_domain: z.string().min(1, 'Your domain is required'),
  competitor_domains: z.array(z.string()).min(1).max(5, 'Maximum 5 competitors'),
  content_type: z.enum(['all', 'blog', 'documentation', 'video']).default('all'),
  language: z.string().default('en'),
});

interface ContentGap {
  topic: string;
  keywords: string[];
  search_volume: number;
  difficulty: 'low' | 'medium' | 'high';
  your_coverage: number;
  competitor_count: number;
  potential_traffic: number;
  priority_score: number;
}

interface GapAnalysisOutput {
  gaps: ContentGap[];
  summary: {
    total_gaps: number;
    high_priority: number;
    estimated_total_traffic: number;
  };
  metadata: {
    your_domain: string;
    competitors_analyzed: number;
    analyzed_at: string;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<GapAnalysisOutput> {
  const validated = inputSchema.parse(input);

  console.log(`Analyzing content gaps for ${validated.your_domain}`);
  console.log(`Comparing against ${validated.competitor_domains.length} competitor(s)`);

  // Simulate gap analysis (in production, this would fetch and compare actual content)
  const gaps: ContentGap[] = generateSimulatedGaps(
    validated.your_domain,
    validated.competitor_domains,
    validated.content_type
  );

  const highPriority = gaps.filter(g => g.priority_score >= 70).length;
  const totalTraffic = gaps.reduce((sum, g) => sum + g.potential_traffic, 0);

  return {
    gaps: gaps.slice(0, 50), // Limit to top 50
    summary: {
      total_gaps: gaps.length,
      high_priority: highPriority,
      estimated_total_traffic: totalTraffic,
    },
    metadata: {
      your_domain: validated.your_domain,
      competitors_analyzed: validated.competitor_domains.length,
      analyzed_at: new Date().toISOString(),
    },
  };
}

function generateSimulatedGaps(yourDomain: string, competitors: string[], contentType: string): ContentGap[] {
  const topics = [
    'Getting started guide',
    'Best practices',
    'Common pitfalls',
    'Advanced techniques',
    'Integration tutorials',
    'Performance optimization',
    'Security considerations',
    'Troubleshooting guide',
    'Migration guide',
    'API reference',
  ];

  return topics.map((topic, index) => ({
    topic,
    keywords: [`${topic.toLowerCase()}`, `how to ${topic.toLowerCase()}`],
    search_volume: Math.floor(Math.random() * 5000) + 500,
    difficulty: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
    your_coverage: Math.random(),
    competitor_count: Math.floor(Math.random() * competitors.length) + 1,
    potential_traffic: Math.floor(Math.random() * 1000) + 100,
    priority_score: Math.floor(Math.random() * 100),
  }));
}
