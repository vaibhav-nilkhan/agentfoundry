# Skill Validation Document #05: Viral Content Predictor

**Status:** 🟡 Awaiting Approval
**Vertical:** Content Creation
**Priority:** Very High
**Estimated Complexity:** High
**Estimated Build Time:** 5-6 days

---

## 1. Unique Value Proposition

### What Makes This Skill Unique?

**Not just engagement analytics** - This skill provides:
- **Pre-publish virality prediction** - Score content BEFORE you post it
- **Platform-specific optimization** - Different advice for Twitter, LinkedIn, YouTube
- **Hook/thumbnail testing** - A/B test variations virtually before publishing
- **Viral pattern recognition** - Learns from 1000s of viral posts in your niche

**Key Differentiator:** **Predict virality BEFORE publishing** with specific fix recommendations to improve scores.

### Why This Doesn't Exist Elsewhere

- **BuzzSumo:** Shows what went viral (backward-looking), no predictions
- **Hootsuite Analytics:** Post-publish metrics, no pre-publish scoring
- **CoSchedule Headline Analyzer:** Only analyzes headlines, not full content
- **Existing tools:** Analyze after-the-fact, don't predict or optimize

### Competitive Moat

1. **Machine learning on viral patterns** - Trained on millions of high-performing posts
2. **Multi-platform intelligence** - Different models for each platform
3. **Actionable recommendations** - "Change this word" vs "engagement is low"
4. **Real-time trend integration** - Incorporates what's trending RIGHT NOW

---

## 2. Target User & Use Cases

### Primary Users

1. **Content Creators** - YouTubers, TikTokers, Newsletter writers
2. **Social Media Managers** - Managing brand accounts
3. **Growth Marketers** - Maximizing organic reach
4. **Influencers** - Maximizing engagement per post
5. **Agencies** - Managing client content calendars

### Use Cases

**Use Case 1: Pre-Publish Content Optimization**
```
Input: Draft Twitter thread about "AI agents"

Output:
📊 Virality Score: 67/100 (Good, but can improve)

Breakdown:
✅ Hook strength: 85/100 (Strong opening)
⚠️  Thread structure: 62/100 (Too long, 18 tweets)
❌ Call-to-action: 45/100 (Weak ending)
✅ Trending topic alignment: 78/100
⚠️  Emotional resonance: 58/100 (Too technical)

Recommendations to reach 85+ score:
1. Reduce to 12 tweets (sweet spot for shares)
2. Add personal story in tweet 3-4 (increases relatability)
3. Replace "utilize" with "use" (simpler = more viral)
4. End with polarizing question (drives replies)
5. Post at 11 AM EST Tuesday (highest engagement window)

Predicted Performance After Fixes:
- Current: ~2,300 impressions, ~180 engagements
- Optimized: ~8,700 impressions, ~620 engagements
- Increase: +280% impressions, +244% engagement
```

**Use Case 2: Thumbnail A/B Testing (YouTube)**
```
Input: 3 thumbnail variants for "AI Agents Tutorial"

Output:
🎨 Thumbnail Analysis

Variant A: Face + Text
- Predicted CTR: 4.2%
- Virality factors: High contrast ✓, Face visible ✓
- Issues: Text too small, cluttered
- Score: 68/100

Variant B: Product Screenshot + Arrow
- Predicted CTR: 6.8%
- Virality factors: Clear value prop ✓, Visual clarity ✓
- Issues: No human element
- Score: 81/100

Variant C: Split screen (Before/After)
- Predicted CTR: 8.3% 🏆 WINNER
- Virality factors: Transformation shown ✓, Curiosity gap ✓
- All best practices hit ✓
- Score: 94/100

Recommendation: Use Variant C
Expected views: 47,000 (vs 22,000 with Variant A)
```

**Use Case 3: Viral Pattern Discovery**
```
Input: "Analyze my successful posts"

Output:
🔍 Your Viral Formula Discovered:

Your top 10% posts share these traits:
1. Personal stories (present in 8/10 viral posts)
2. Controversial takes (7/10)
3. Posted Tuesday 10-11 AM (9/10)
4. Use of specific emojis: 🚀 💡 ⚡ (8/10)
5. Ask questions in first sentence (10/10)

Content patterns that work for YOU:
- "Here's what nobody tells you about [X]" → 340% avg engagement
- List format with odd numbers (7 tips, 9 mistakes) → 280% avg
- Contrarian opinions with data → 420% avg

Anti-patterns (avoid these):
- Generic motivational quotes → 12% avg engagement
- Asking for likes/shares → 18% avg engagement
- Posts longer than 250 words → 35% avg engagement

Next Post Suggestion:
"Here's what nobody tells you about building AI agents (7 hard truths)"
- Predicted engagement: 8,200+
- Best time: Next Tuesday, 10:30 AM
- Use 🚀 and 💡 emojis
```

---

## 3. Technical Architecture

### Data Sources

1. **Historical Viral Content Database**
   - Top-performing posts from your niche (scraped)
   - Engagement metrics (likes, shares, comments)
   - Platform-specific data (Twitter, LinkedIn, YouTube, TikTok)

2. **Your Historical Performance**
   - Past posts with engagement data
   - What worked vs what flopped
   - Audience demographic data

3. **Real-Time Trends**
   - Twitter/X trending topics
   - Google Trends
   - Reddit hot posts
   - TikTok trending sounds/hashtags

4. **Platform APIs**
   - Twitter API (your analytics)
   - YouTube Analytics API
   - LinkedIn Analytics
   - TikTok API

### Core Algorithms

#### Algorithm 1: Virality Score Calculation
```typescript
function calculateViralityScore(
  content: Content,
  platform: Platform,
  userHistory: PerformanceHistory
): ViralityScore {
  // Multi-factor scoring model
  const scores = {
    hook: analyzeHook(content.opening, platform),
    structure: analyzeStructure(content, platform),
    emotional: analyzeEmotionalResonance(content),
    trendAlignment: analyzeTrendAlignment(content),
    callToAction: analyzeCallToAction(content),
    timing: analyzePostingTime(content.scheduledTime, platform),
    visualAppeal: analyzeVisuals(content.media, platform),
  };

  // Weight factors by platform
  const weights = getPlatformWeights(platform);
  // Twitter: hook (30%), emotional (25%), timing (20%), etc.
  // YouTube: visual (40%), hook (30%), structure (20%), etc.

  let totalScore = 0;
  for (const [factor, score] of Object.entries(scores)) {
    totalScore += score * weights[factor];
  }

  // Adjust based on user's historical performance
  const personalityAdjustment = calculatePersonalityFit(
    content,
    userHistory
  );

  const finalScore = totalScore * personalityAdjustment;

  return {
    overall: Math.round(finalScore),
    breakdown: scores,
    predictedMetrics: predictEngagement(finalScore, userHistory),
    improvements: generateImprovements(scores, weights),
  };
}
```

#### Algorithm 2: Hook Strength Analysis
```typescript
async function analyzeHook(
  opening: string,
  platform: Platform
): Promise<number> {
  const factors = {
    curiosityGap: 0,
    emotionalTrigger: 0,
    specificity: 0,
    brevity: 0,
    patternMatch: 0,
  };

  // 1. Curiosity gap detection
  const curiosityWords = ['secret', 'nobody tells you', 'hidden', 'revealed'];
  factors.curiosityGap = curiosityWords.some(w =>
    opening.toLowerCase().includes(w)
  ) ? 20 : 0;

  // 2. Emotional trigger analysis (using LLM)
  const emotionPrompt = `
Rate the emotional impact of this opening line (0-20):
"${opening}"

Consider: surprise, anger, joy, fear, curiosity
Return only a number.
`;
  factors.emotionalTrigger = await callLLM(emotionPrompt);

  // 3. Specificity check
  const hasNumbers = /\d/.test(opening);
  const hasSpecifics = /\$|%|\d+/.test(opening);
  factors.specificity = (hasNumbers ? 10 : 0) + (hasSpecifics ? 10 : 0);

  // 4. Brevity (platform-specific)
  const idealLength = platform === 'twitter' ? 30 : 60;
  const lengthDiff = Math.abs(opening.length - idealLength);
  factors.brevity = Math.max(0, 20 - (lengthDiff / 5));

  // 5. Pattern match against viral hooks database
  factors.patternMatch = await matchViralPatterns(opening, platform);

  return Object.values(factors).reduce((sum, val) => sum + val, 0);
}
```

#### Algorithm 3: Engagement Prediction
```typescript
function predictEngagement(
  viralityScore: number,
  userHistory: PerformanceHistory,
  platform: Platform
): PredictedMetrics {
  // Use user's baseline metrics
  const baseline = {
    impressions: userHistory.avgImpressions,
    likes: userHistory.avgLikes,
    shares: userHistory.avgShares,
    comments: userHistory.avgComments,
  };

  // Score multiplier (logarithmic, not linear)
  const multiplier = Math.pow(1.08, viralityScore - 50);
  // Score 50 = 1x baseline
  // Score 70 = 3.5x baseline
  // Score 90 = 10x baseline

  // Platform-specific adjustments
  const platformBoost = getPlatformEngagementRates(platform);

  return {
    impressions: Math.round(baseline.impressions * multiplier * platformBoost.reach),
    likes: Math.round(baseline.likes * multiplier * platformBoost.likes),
    shares: Math.round(baseline.shares * multiplier * platformBoost.shares),
    comments: Math.round(baseline.comments * multiplier * platformBoost.comments),
    estimatedReach: Math.round(baseline.impressions * multiplier * 2.3), // Viral coefficient
  };
}
```

---

## 4. Tool Definitions

### Tool 1: `predict_virality`

**Description:** Score content virality potential before publishing

**Input Schema:**
```yaml
type: object
properties:
  content:
    type: string
    description: Full content text
  platform:
    type: string
    enum: [twitter, linkedin, youtube, tiktok, instagram]
  media:
    type: array
    items:
      type: string
      format: uri
    description: URLs to images/videos
  scheduled_time:
    type: string
    format: date-time
    description: When you plan to post
  user_id:
    type: string
    description: For personalized predictions based on history
required:
  - content
  - platform
```

**Output Schema:**
```yaml
type: object
properties:
  overall_score:
    type: integer
    description: 0-100 virality score
  rating:
    type: string
    enum: [poor, fair, good, excellent, viral]
  breakdown:
    type: object
    properties:
      hook_strength:
        type: integer
      structure:
        type: integer
      emotional_resonance:
        type: integer
      trend_alignment:
        type: integer
      visual_appeal:
        type: integer
      call_to_action:
        type: integer
  predicted_metrics:
    type: object
    properties:
      impressions:
        type: integer
      likes:
        type: integer
      shares:
        type: integer
      comments:
        type: integer
  improvements:
    type: array
    items:
      type: object
      properties:
        issue:
          type: string
        impact:
          type: string
          enum: [high, medium, low]
        recommendation:
          type: string
        expected_score_increase:
          type: integer
```

### Tool 2: `optimize_content`

**Description:** Get specific recommendations to improve virality score

**Input Schema:**
```yaml
type: object
properties:
  content:
    type: string
  platform:
    type: string
  current_score:
    type: integer
  target_score:
    type: integer
    description: Desired score to reach
    minimum: 0
    maximum: 100
required:
  - content
  - platform
  - current_score
```

**Output Schema:**
```yaml
type: object
properties:
  optimized_content:
    type: string
    description: Rewritten version with improvements
  changes_made:
    type: array
    items:
      type: object
      properties:
        type:
          type: string
        original:
          type: string
        improved:
          type: string
        reason:
          type: string
  new_score:
    type: integer
  achieved_target:
    type: boolean
```

### Tool 3: `test_variations`

**Description:** Compare multiple content/thumbnail variations

**Input Schema:**
```yaml
type: object
properties:
  variations:
    type: array
    items:
      type: object
      properties:
        content:
          type: string
        media:
          type: array
    minItems: 2
    maxItems: 5
  platform:
    type: string
required:
  - variations
  - platform
```

**Output Schema:**
```yaml
type: object
properties:
  winner:
    type: integer
    description: Index of best-performing variation
  comparison:
    type: array
    items:
      type: object
      properties:
        variation_index:
          type: integer
        score:
          type: integer
        predicted_impressions:
          type: integer
        strengths:
          type: array
        weaknesses:
          type: array
```

### Tool 4: `discover_viral_patterns`

**Description:** Analyze user's history to find their viral formula

**Input Schema:**
```yaml
type: object
properties:
  user_id:
    type: string
  platform:
    type: string
  time_range:
    type: string
    enum: [30d, 90d, 1y, all]
    default: 90d
required:
  - user_id
  - platform
```

**Output Schema:**
```yaml
type: object
properties:
  viral_patterns:
    type: array
    description: What makes YOUR content go viral
  anti_patterns:
    type: array
    description: What to avoid
  best_posting_times:
    type: array
  content_templates:
    type: array
    description: Proven formulas for your audience
  next_post_suggestion:
    type: string
```

---

## 5. Dependencies & APIs

### Required NPM Packages

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "cheerio": "^1.0.0",
    "compromise": "^14.10.0",          // NLP
    "sentiment": "^5.0.2",             // Sentiment analysis
    "natural": "^6.10.0",              // Text processing
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  }
}
```

### External APIs

1. **Twitter/X API v2**
   - User analytics
   - Tweet performance data
   - Cost: Free tier available

2. **YouTube Data API**
   - Video analytics
   - Thumbnail testing data
   - Free with quota limits

3. **LinkedIn API**
   - Post analytics
   - Requires OAuth

4. **TikTok API**
   - Creator analytics (limited)

5. **LLM API (Claude/OpenAI)**
   - Content analysis
   - Emotional resonance scoring
   - Cost: ~$0.02 per analysis

6. **Google Trends API**
   - Trending topics
   - Free

### Environment Variables

```bash
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx
YOUTUBE_API_KEY=xxx
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx
TIKTOK_CLIENT_KEY=xxx
ANTHROPIC_API_KEY=xxx
OPENAI_API_KEY=xxx
```

---

## 6. Implementation Complexity

### Complexity Breakdown

| Component | Complexity | Estimated Time |
|-----------|-----------|----------------|
| Viral content database scraping | Medium | 1 day |
| ML model training | High | 1.5 days |
| Virality scoring algorithm | High | 1 day |
| Platform API integrations | Medium | 1 day |
| Content optimization engine | Medium | 0.5 days |
| Testing & validation | Medium | 1 day |

**Total Estimated Time:** 5-6 days

### Technical Challenges

1. **Challenge:** ML model accuracy (avoiding false predictions)
   - **Solution:** Train on 100k+ posts, validate against holdout set
   - **Risk:** High - Core feature, must be accurate

2. **Challenge:** Platform API rate limits
   - **Solution:** Caching, batching, user-provided tokens
   - **Risk:** Medium

3. **Challenge:** Trend data real-time integration
   - **Solution:** Scheduled updates every 4 hours
   - **Risk:** Low

---

## 7. Monetization Strategy

### Pricing Tiers

**Free Tier:**
- 5 predictions per month
- Basic scoring only
- No optimizations
- Limited to 1 platform

**Creator Tier ($39/month):**
- Unlimited predictions
- Full optimization suggestions
- All platforms
- A/B variation testing (up to 3)
- Best posting time recommendations

**Pro Tier ($99/month):**
- Everything in Creator
- Viral pattern discovery
- Automated content calendars
- 10 variation testing
- White-label reports
- API access

### Market Size

- **TAM:** 50M+ content creators globally
- **Target:** 5M serious creators (monetizing)
- **Conversion:** 2% free-to-paid = 100,000 paid
- **MRR:** 70% Creator + 30% Pro = $6.7M/month
- **ARR:** ~$80M/year (very aggressive but feasible)

---

## 8. Success Metrics

### Technical Metrics

- ✅ Prediction accuracy: 80%+ correlation with actual performance
- ✅ Score improvements: Average +25 points after optimization
- ✅ Processing time: < 5 seconds per prediction

### Business Metrics

- 🎯 5,000 free users in first month
- 🎯 200 paid conversions in first quarter
- 🎯 Viral on Twitter (posted by influencers)
- 🎯 4.8+ star rating

---

## 9. Go/No-Go Decision

### ✅ Reasons to Build

1. **Massive market** - Every content creator wants virality
2. **Strong viral potential** - Tool that helps you go viral will itself go viral
3. **Clear value** - Saves hours of A/B testing
4. **High willingness to pay** - Creators need growth
5. **Network effects** - More users = better predictions

### ❌ Reasons NOT to Build

1. **ML complexity** - Requires significant training data
2. **Accuracy pressure** - Wrong predictions hurt credibility
3. **Platform dependency** - APIs can change/get restricted
4. **Competitive** - Many analytics tools exist

### Final Recommendation

**🟢 APPROVED TO BUILD - HIGHEST PRIORITY**

This skill has exceptional potential:
- Solves THE #1 creator pain point (getting reach)
- Viral by nature (success stories spread)
- Premium pricing justified ($39-99/month)
- First-mover advantage in AI predictions

**Risk Level:** High (ML accuracy critical)
**Reward Level:** Extremely High (potential breakout product)

**Recommendation:** Build this as PRIORITY #1 for content vertical

---

**Validated By:** AgentFoundry Team
**Date:** 2025-01-08
**Status:** 🟢 Approved for Development - HIGH PRIORITY
