import { z } from 'zod';
import { ViralityScorer } from '../lib/virality-scorer';
import { EngagementPredictor } from '../lib/engagement-predictor';

const inputSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  platform: z.enum(['twitter', 'linkedin', 'youtube', 'tiktok', 'instagram']),
  media: z.array(z.string().url()).optional(),
  scheduled_time: z.string().datetime().optional(),
  user_id: z.string().optional(),
});

interface Improvement {
  issue: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  expected_score_increase: number;
}

interface PredictionOutput {
  overall_score: number;
  rating: 'poor' | 'fair' | 'good' | 'excellent' | 'viral';
  breakdown: Record<string, number>;
  predicted_metrics: {
    impressions: number;
    likes: number;
    shares: number;
    comments: number;
  };
  improvements: Improvement[];
}

export async function run(input: z.infer<typeof inputSchema>): Promise<PredictionOutput> {
  try {
    const validated = inputSchema.parse(input);

    const scorer = new ViralityScorer();
    const predictor = new EngagementPredictor();

    // Calculate virality score
    const viralityScore = scorer.calculateScore(
      validated.content,
      validated.platform,
      validated.media
    );

    const rating = scorer.getRating(viralityScore.overall);

    // Predict engagement
    const predictedMetrics = predictor.predict(
      viralityScore.overall,
      validated.platform
    );

    // Generate improvements
    const improvements = generateImprovements(
      validated.content,
      viralityScore,
      validated.platform
    );

    return {
      overall_score: viralityScore.overall,
      rating,
      breakdown: viralityScore.breakdown,
      predicted_metrics: predictedMetrics,
      improvements,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

function generateImprovements(
  content: string,
  score: { overall: number; breakdown: Record<string, number> },
  platform: string
): Improvement[] {
  const improvements: Improvement[] = [];

  // Hook strength
  if (score.breakdown.hook_strength < 70) {
    improvements.push({
      issue: 'Weak opening hook',
      impact: 'high',
      recommendation: 'Start with a curiosity-inducing statement or specific number. Example: "Here\'s what nobody tells you about..." or "7 mistakes that..."',
      expected_score_increase: 10,
    });
  }

  // Emotional resonance
  if (score.breakdown.emotional_resonance < 60) {
    improvements.push({
      issue: 'Low emotional impact',
      impact: 'high',
      recommendation: 'Add personal stories or emotional triggers. Share a specific example or use words like "shocked", "amazed", or "frustrated".',
      expected_score_increase: 8,
    });
  }

  // Structure
  if (score.breakdown.structure < 65) {
    if (platform === 'twitter') {
      improvements.push({
        issue: 'Suboptimal thread structure',
        impact: 'medium',
        recommendation: 'Keep threads between 8-12 tweets. Use line breaks for readability.',
        expected_score_increase: 6,
      });
    } else if (platform === 'linkedin') {
      improvements.push({
        issue: 'Poor formatting',
        impact: 'medium',
        recommendation: 'Break into short paragraphs (2-3 lines each). Add spacing between ideas.',
        expected_score_increase: 5,
      });
    }
  }

  // Visual appeal
  if (score.breakdown.visual_appeal < 50) {
    improvements.push({
      issue: 'Missing or weak visuals',
      impact: 'medium',
      recommendation: 'Add 1-2 high-quality images or a short video. Visual content increases engagement by 40%.',
      expected_score_increase: 12,
    });
  }

  // Call to action
  if (score.breakdown.call_to_action < 60) {
    improvements.push({
      issue: 'Weak call-to-action',
      impact: 'low',
      recommendation: 'End with a question to drive comments. Example: "What\'s your experience with this?" or "Agree or disagree?"',
      expected_score_increase: 4,
    });
  }

  // Sort by impact
  const impactOrder = { high: 0, medium: 1, low: 2 };
  improvements.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

  return improvements.slice(0, 5); // Top 5 improvements
}
