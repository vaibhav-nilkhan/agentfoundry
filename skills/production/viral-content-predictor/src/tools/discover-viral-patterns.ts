import { z } from 'zod';

const inputSchema = z.object({
  user_id: z.string(),
  platform: z.enum(['twitter', 'linkedin', 'youtube', 'tiktok', 'instagram']),
  time_range: z.enum(['30d', '90d', '1y', 'all']).default('90d'),
});

interface PatternOutput {
  viral_patterns: string[];
  anti_patterns: string[];
  best_posting_times: string[];
  content_templates: string[];
  next_post_suggestion: string;
}

export async function run(input: z.infer<typeof inputSchema>): Promise<PatternOutput> {
  const validated = inputSchema.parse(input);

  // In production, would analyze user's historical posts
  // For MVP, returning example patterns

  const viralPatterns = [
    'Personal stories about your journey (340% avg engagement)',
    'Contrarian opinions with data to back them up (420% avg)',
    'List formats with odd numbers (7 tips, 9 mistakes) - 280% avg',
    'Posts that start with "Here\'s what nobody tells you" (290% avg)',
    'Questions in first sentence drive 3x more replies',
  ];

  const antiPatterns = [
    'Generic motivational quotes (12% avg engagement)',
    'Asking for likes/shares directly (18% avg)',
    `Posts longer than ${validated.platform === 'twitter' ? '250' : '500'} words (35% avg)`,
    'Multiple hashtags (reduces reach by 40%)',
  ];

  const bestTimes = [
    'Tuesday 10-11 AM',
    'Thursday 2-3 PM',
    'Saturday 9-10 AM',
  ];

  const contentTemplates = [
    '"Here\'s what nobody tells you about [topic]"',
    '"[Number] mistakes I made so you don\'t have to"',
    '"Stop [common practice]. Do this instead:"',
    '"The [adjective] truth about [topic] that [audience] needs to hear"',
  ];

  const nextSuggestion = `"Here's what nobody tells you about ${
    validated.platform === 'linkedin' ? 'career growth' :
    validated.platform === 'twitter' ? 'building in public' :
    'content creation'
  } (7 hard truths)" - Post Tuesday at 10:30 AM with 🚀 💡 emojis`;

  return {
    viral_patterns: viralPatterns,
    anti_patterns: antiPatterns,
    best_posting_times: bestTimes,
    content_templates: contentTemplates,
    next_post_suggestion: nextSuggestion,
  };
}
