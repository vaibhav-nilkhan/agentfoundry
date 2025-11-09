import { z } from 'zod';

const inputSchema = z.object({
  competitor_domains: z.array(z.string()).min(1, 'At least one competitor required'),
  check_frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  alert_threshold: z.enum(['all', 'high_priority_only']).default('high_priority_only'),
});

interface NewContent {
  competitor: string;
  title: string;
  url: string;
  published_date: string;
  estimated_search_volume: number;
  already_ranking: boolean;
  action_recommended: string;
}

interface MonitorOutput {
  new_content: NewContent[];
  trending_topics: string[];
  summary: {
    total_new_articles: number;
    high_priority_items: number;
    competitors_active: number;
  };
  metadata: {
    check_frequency: string;
    last_checked: string;
    next_check: string;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<MonitorOutput> {
  const validated = inputSchema.parse(input);

  console.log(`Monitoring ${validated.competitor_domains.length} competitor(s)`);

  const newContent: NewContent[] = generateSimulatedContent(
    validated.competitor_domains,
    validated.alert_threshold
  );

  const trendingTopics = extractTrendingTopics(newContent);
  const highPriority = newContent.filter(c => c.estimated_search_volume > 1000).length;

  return {
    new_content: newContent,
    trending_topics: trendingTopics,
    summary: {
      total_new_articles: newContent.length,
      high_priority_items: highPriority,
      competitors_active: validated.competitor_domains.length,
    },
    metadata: {
      check_frequency: validated.check_frequency,
      last_checked: new Date().toISOString(),
      next_check: calculateNextCheck(validated.check_frequency),
    },
  };
}

function generateSimulatedContent(competitors: string[], threshold: string): NewContent[] {
  const titles = [
    'New Features Released',
    'Getting Started Tutorial',
    'Best Practices Guide',
    'Performance Optimization Tips',
    'Migration Guide',
  ];

  return competitors.flatMap((competitor, i) =>
    titles.slice(0, 2).map((title, j) => ({
      competitor,
      title: `${title} - ${competitor}`,
      url: `https://${competitor}/blog/article-${i}-${j}`,
      published_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_search_volume: Math.floor(Math.random() * 3000) + 500,
      already_ranking: Math.random() > 0.5,
      action_recommended: 'Create similar content',
    }))
  );
}

function extractTrendingTopics(content: NewContent[]): string[] {
  return ['AI agents', 'Automation', 'Integration', 'Best practices'];
}

function calculateNextCheck(frequency: string): string {
  const now = new Date();
  const days = frequency === 'daily' ? 1 : frequency === 'weekly' ? 7 : 30;
  const nextDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return nextDate.toISOString();
}
