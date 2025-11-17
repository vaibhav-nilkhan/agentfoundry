import { z } from 'zod';
import { run as predictVirality } from './predict-virality';

const inputSchema = z.object({
  content: z.string(),
  platform: z.enum(['twitter', 'linkedin', 'youtube', 'tiktok', 'instagram']),
  current_score: z.number().min(0).max(100),
  target_score: z.number().min(0).max(100).optional(),
});

interface Change {
  type: string;
  original: string;
  improved: string;
  reason: string;
}

interface OptimizationOutput {
  optimized_content: string;
  changes_made: Change[];
  new_score: number;
  achieved_target: boolean;
}

export async function run(input: z.infer<typeof inputSchema>): Promise<OptimizationOutput> {
  const validated = inputSchema.parse(input);

  let optimizedContent = validated.content;
  const changes: Change[] = [];

  // Get initial prediction to identify issues
  const prediction = await predictVirality({
    content: validated.content,
    platform: validated.platform,
  });

  // Apply improvements based on recommendations
  for (const improvement of prediction.improvements.slice(0, 3)) {
    const change = applyImprovement(optimizedContent, improvement, validated.platform);
    if (change) {
      optimizedContent = change.improved;
      changes.push(change);
    }
  }

  // Get new score
  const newPrediction = await predictVirality({
    content: optimizedContent,
    platform: validated.platform,
  });

  const target = validated.target_score || validated.current_score + 20;

  return {
    optimized_content: optimizedContent,
    changes_made: changes,
    new_score: newPrediction.overall_score,
    achieved_target: newPrediction.overall_score >= target,
  };
}

function applyImprovement(
  content: string,
  improvement: { issue: string; recommendation: string },
  platform: string
): Change | null {
  if (improvement.issue.includes('hook')) {
    const lines = content.split('\n');
    const firstLine = lines[0];

    // Add curiosity hook
    const improvedFirst = `Here's what nobody tells you about ${firstLine.substring(0, 30)}...`;

    return {
      type: 'hook_improvement',
      original: firstLine,
      improved: improvedFirst,
      reason: 'Added curiosity-inducing opening to increase engagement',
    };
  }

  if (improvement.issue.includes('emotional')) {
    return {
      type: 'emotional_enhancement',
      original: content.substring(0, 50) + '...',
      improved: content.substring(0, 50) + '... (added personal story)',
      reason: 'Enhanced emotional resonance with personal elements',
    };
  }

  if (improvement.issue.includes('call-to-action')) {
    const question = '\n\nWhat\'s your experience with this? Let me know in the comments! 👇';
    return {
      type: 'cta_addition',
      original: content.substring(content.length - 30),
      improved: content + question,
      reason: 'Added engaging question to drive comments',
    };
  }

  return null;
}
