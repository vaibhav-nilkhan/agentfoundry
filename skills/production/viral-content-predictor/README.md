# Viral Content Predictor

Predict content virality BEFORE publishing with AI-powered scoring, platform-specific optimization, and A/B testing.

## Features

- **Pre-Publish Prediction** - Score content before you post (0-100)
- **Platform-Specific** - Optimized for Twitter, LinkedIn, YouTube, TikTok, Instagram
- **Actionable Improvements** - Specific recommendations to boost scores
- **A/B Testing** - Compare variations to pick the best
- **Viral Pattern Discovery** - Learn what works for YOUR audience

## Installation

```bash
agentfoundry install viral-content-predictor
```

## Usage

### 1. Predict Virality

Score your content before publishing:

```typescript
const prediction = await predictVirality({
  content: "Here's what nobody tells you about AI agents...",
  platform: "twitter",
  media: ["https://example.com/image.jpg"]
});

console.log(`Score: ${prediction.overall_score}/100`);
console.log(`Rating: ${prediction.rating}`);
console.log(`\nPredicted Performance:`);
console.log(`- Impressions: ${prediction.predicted_metrics.impressions}`);
console.log(`- Likes: ${prediction.predicted_metrics.likes}`);
console.log(`- Shares: ${prediction.predicted_metrics.shares}`);

console.log(`\nTop Improvements:`);
prediction.improvements.slice(0, 3).forEach(imp => {
  console.log(`[${imp.impact}] ${imp.issue}`);
  console.log(`Fix: ${imp.recommendation}`);
  console.log(`Expected boost: +${imp.expected_score_increase} points\n`);
});
```

### 2. Optimize Content

Get AI-powered content improvements:

```typescript
const optimized = await optimizeContent({
  content: "My original post...",
  platform: "linkedin",
  current_score: 65,
  target_score: 85
});

console.log(`Original score: 65`);
console.log(`New score: ${optimized.new_score}`);
console.log(`Target achieved: ${optimized.achieved_target ? 'Yes' : 'No'}`);

console.log(`\nOptimized content:\n${optimized.optimized_content}`);

console.log(`\nChanges made:`);
optimized.changes_made.forEach(change => {
  console.log(`- ${change.type}: ${change.reason}`);
});
```

### 3. Test Variations

A/B test multiple versions:

```typescript
const test = await testVariations({
  variations: [
    {
      content: "Version A: Simple hook",
      media: ["image1.jpg"]
    },
    {
      content: "Version B: Curiosity-driven hook with numbers",
      media: ["image2.jpg"]
    },
    {
      content: "Version C: Personal story opening",
      media: ["image3.jpg"]
    }
  ],
  platform: "twitter"
});

console.log(`Winner: Variation ${test.winner + 1}`);

test.comparison.forEach((v, i) => {
  console.log(`\nVariation ${i + 1}:`);
  console.log(`  Score: ${v.score}/100`);
  console.log(`  Predicted impressions: ${v.predicted_impressions}`);
  console.log(`  Strengths: ${v.strengths.join(', ')}`);
  console.log(`  Weaknesses: ${v.weaknesses.join(', ')}`);
});
```

### 4. Discover Your Viral Formula

Learn what works for your audience:

```typescript
const patterns = await discoverViralPatterns({
  user_id: "your-user-id",
  platform: "twitter",
  time_range: "90d"
});

console.log('Your Viral Formula:\n');

console.log('What Works:');
patterns.viral_patterns.forEach(p => console.log(`✅ ${p}`));

console.log('\nWhat to Avoid:');
patterns.anti_patterns.forEach(p => console.log(`❌ ${p}`));

console.log('\nBest Posting Times:');
patterns.best_posting_times.forEach(t => console.log(`⏰ ${t}`));

console.log(`\nNext Post Suggestion:\n${patterns.next_post_suggestion}`);
```

## Scoring Breakdown

Each prediction includes detailed breakdown:

- **Hook Strength** (0-100): How compelling is your opening?
- **Structure** (0-100): Is formatting optimal for the platform?
- **Emotional Resonance** (0-100): Does it trigger emotions?
- **Trend Alignment** (0-100): Does it match current trends?
- **Visual Appeal** (0-100): Are visuals engaging?
- **Call-to-Action** (0-100): Does it encourage interaction?

### Score Ratings

- **90-100**: Viral 🔥 - Exceptional viral potential
- **75-89**: Excellent ⭐ - Strong performance expected
- **60-74**: Good ✅ - Above-average engagement
- **40-59**: Fair ⚠️ - Average performance
- **0-39**: Poor ❌ - Needs significant improvement

## Platform-Specific Tips

### Twitter
- Keep threads 8-12 tweets
- Start with curiosity hook
- Use 2-3 emojis max
- Post Tuesday/Thursday 10-11 AM

### LinkedIn
- 150-300 words ideal
- Professional + personal mix
- Break into short paragraphs
- Add line breaks for readability

### YouTube
- Thumbnail is 40% of the score
- First 8 seconds critical
- Clear value proposition
- Strong emotional hook

### TikTok
- Hook in first 3 seconds
- High energy + trending sounds
- Shorter is better (15-30s)
- End with question/challenge

### Instagram
- Visual quality matters most
- Carousel posts perform best
- Caption: storytelling format
- Use 3-5 relevant hashtags max

## Configuration

### Environment Variables

```bash
# Required for AI-powered features
ANTHROPIC_API_KEY=sk-ant-xxx

# Optional: For historical analytics
TWITTER_API_KEY=xxx
YOUTUBE_API_KEY=xxx
```

## How It Works

1. **Multi-Factor Analysis**: Analyzes hook, structure, emotion, trends, visuals, CTA
2. **Platform Weights**: Different factors matter on different platforms
3. **Engagement Prediction**: Uses logarithmic multiplier based on score
4. **Pattern Recognition**: Learns from 1000s of viral posts in each niche

## Development

```bash
npm install
npm run build
npm test
npm run dev  # Watch mode
```

## Pricing

- **Free**: 5 predictions/month, 1 platform
- **Creator ($39/mo)**: Unlimited predictions, all platforms, A/B testing
- **Pro ($99/mo)**: Everything + API access, white-label, priority support

## Examples

See `/examples` for:
- Content calendar planning
- Pre-launch optimization workflows
- A/B testing strategies

## License

MIT

## Support

- Docs: https://docs.agentfoundry.dev/skills/viral-content-predictor
- Issues: https://github.com/agentfoundry/skills/issues
- Discord: https://discord.gg/agentfoundry
