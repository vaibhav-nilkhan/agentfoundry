import { z } from 'zod';

const inputSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  target_keywords: z.array(z.string()).min(1, 'At least one keyword required'),
  competitor_urls: z.array(z.string().url()).optional(),
  content_format: z.enum(['article', 'guide', 'tutorial', 'comparison', 'listicle']).default('article'),
});

interface OutlineItem {
  heading: string;
  level: number;
  key_points: string[];
}

interface BriefOutput {
  title: string;
  meta_description: string;
  outline: OutlineItem[];
  target_keywords: string[];
  recommended_word_count: number;
  internal_links: string[];
  external_sources: string[];
  estimated_time_to_write: string;
  metadata: {
    topic: string;
    format: string;
    generated_at: string;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<BriefOutput> {
  const validated = inputSchema.parse(input);

  console.log(`Generating content brief for: ${validated.topic}`);

  const outline = generateOutline(validated.topic, validated.content_format);
  const wordCount = calculateWordCount(validated.content_format);

  return {
    title: generateTitle(validated.topic, validated.target_keywords[0]),
    meta_description: generateMetaDescription(validated.topic),
    outline,
    target_keywords: validated.target_keywords,
    recommended_word_count: wordCount,
    internal_links: generateInternalLinks(validated.topic),
    external_sources: generateExternalSources(validated.topic),
    estimated_time_to_write: estimateWritingTime(wordCount),
    metadata: {
      topic: validated.topic,
      format: validated.content_format,
      generated_at: new Date().toISOString(),
    },
  };
}

function generateTitle(topic: string, primaryKeyword: string): string {
  const templates = [
    `The Complete Guide to ${topic}`,
    `${topic}: Everything You Need to Know`,
    `How to Master ${topic} in 2025`,
    `${primaryKeyword}: A Comprehensive Guide`,
  ];
  return templates[0];
}

function generateMetaDescription(topic: string): string {
  return `Learn everything about ${topic}. This comprehensive guide covers best practices, common pitfalls, and expert tips to help you succeed.`;
}

function generateOutline(topic: string, format: string): OutlineItem[] {
  return [
    {
      heading: 'Introduction',
      level: 2,
      key_points: [`What is ${topic}`, 'Why it matters', 'What you\'ll learn'],
    },
    {
      heading: 'Getting Started',
      level: 2,
      key_points: ['Prerequisites', 'Setup instructions', 'First steps'],
    },
    {
      heading: 'Core Concepts',
      level: 2,
      key_points: ['Key terminology', 'Important principles', 'Best practices'],
    },
    {
      heading: 'Advanced Techniques',
      level: 2,
      key_points: ['Optimization strategies', 'Common pitfalls', 'Pro tips'],
    },
    {
      heading: 'Conclusion',
      level: 2,
      key_points: ['Summary', 'Next steps', 'Additional resources'],
    },
  ];
}

function calculateWordCount(format: string): number {
  const counts: Record<string, number> = {
    article: 1500,
    guide: 2500,
    tutorial: 2000,
    comparison: 1800,
    listicle: 1200,
  };
  return counts[format] || 1500;
}

function generateInternalLinks(topic: string): string[] {
  return [
    '/blog/related-topic-1',
    '/docs/getting-started',
    '/resources/best-practices',
  ];
}

function generateExternalSources(topic: string): string[] {
  return [
    'https://example.com/research-paper',
    'https://example.com/industry-report',
  ];
}

function estimateWritingTime(wordCount: number): string {
  const hoursPerWord = 0.004; // ~4 hours per 1000 words
  const hours = Math.ceil(wordCount * hoursPerWord);
  return `${hours}-${hours + 1} hours`;
}
