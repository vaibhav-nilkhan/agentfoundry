import { z } from 'zod';
import { run as predictVirality } from './predict-virality';

const inputSchema = z.object({
  variations: z.array(
    z.object({
      content: z.string(),
      media: z.array(z.string()).optional(),
    })
  ).min(2).max(5),
  platform: z.enum(['twitter', 'linkedin', 'youtube', 'tiktok', 'instagram']),
});

interface VariationResult {
  variation_index: number;
  score: number;
  predicted_impressions: number;
  strengths: string[];
  weaknesses: string[];
}

interface TestOutput {
  winner: number;
  comparison: VariationResult[];
}

export async function run(input: z.infer<typeof inputSchema>): Promise<TestOutput> {
  const validated = inputSchema.parse(input);

  const results: VariationResult[] = [];

  for (let i = 0; i < validated.variations.length; i++) {
    const variation = validated.variations[i];

    const prediction = await predictVirality({
      content: variation.content,
      platform: validated.platform,
      media: variation.media,
    });

    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const [key, value] of Object.entries(prediction.breakdown)) {
      if (value >= 75) {
        strengths.push(`Strong ${key.replace('_', ' ')}`);
      } else if (value < 50) {
        weaknesses.push(`Weak ${key.replace('_', ' ')}`);
      }
    }

    results.push({
      variation_index: i,
      score: prediction.overall_score,
      predicted_impressions: prediction.predicted_metrics.impressions,
      strengths,
      weaknesses,
    });
  }

  // Find winner
  const winner = results.reduce((max, r) =>
    r.score > max.score ? r : max
  ).variation_index;

  return {
    winner,
    comparison: results,
  };
}
