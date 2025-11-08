# Skill Validation Document #04: Content Gap Analyzer

**Status:** 🟡 Awaiting Approval
**Vertical:** Content Creation
**Priority:** High
**Estimated Complexity:** Medium
**Estimated Build Time:** 4-5 days

---

## 1. Unique Value Proposition

### What Makes This Skill Unique?

**Not just keyword research** - This skill provides:
- **Competitor content mapping** - What are they covering that you're not?
- **Search intent gap analysis** - Questions your audience asks that you haven't answered
- **Content performance prediction** - Which gaps have highest potential traffic
- **Automated content brief generation** - Turn gaps into actionable content plans

**Key Differentiator:** **Competitive intelligence + AI** to find your exact content blind spots with traffic estimates.

### Why This Doesn't Exist Elsewhere

- **Ahrefs/Semrush:** Show competitor keywords, but don't map gaps to your existing content
- **AnswerThePublic:** Shows questions, but no competitive comparison
- **BuzzSumo:** Shows popular content, but doesn't identify YOUR gaps
- **Existing tools:** Require manual cross-referencing between tools

### Competitive Moat

1. **Automated gap mapping** - Compares your content vs competitors automatically
2. **Intent clustering** - Groups similar gaps into content opportunities
3. **ROI prioritization** - Ranks gaps by traffic potential × difficulty
4. **Content brief generation** - Turns gap into outline with target keywords

---

## 2. Target User & Use Cases

### Primary Users

1. **Content Marketers** - Planning content calendars
2. **SEO Specialists** - Finding keyword opportunities
3. **Newsletter Writers** - Topic ideation
4. **YouTubers/Podcasters** - Episode planning
5. **SaaS Marketers** - Educational content strategy

### Use Cases

**Use Case 1: Quarterly Content Planning**
```
Input:
- Your site: agentfoundry.dev
- Competitors: langchain.com, n8n.io, zapier.com

Output:
📊 Found 47 Content Gaps

Top Opportunities (High Traffic, Low Competition):
1. "AI agent testing frameworks"
   - Search volume: 2,400/month
   - Difficulty: Medium
   - Your coverage: None
   - Competitors covering: langchain (ranking #3)
   - Potential traffic: 600-800 visits/month
   - Recommended: Tutorial + comparison article

2. "Agent orchestration patterns"
   - Search volume: 1,800/month
   - Difficulty: Low
   - Your coverage: Mentioned briefly in docs
   - Competitors covering: n8n (#1), zapier (#5)
   - Potential traffic: 500-700 visits/month
   - Recommended: Deep-dive guide + video

3. "Self-hosted AI agents"
   - Search volume: 3,200/month
   - Difficulty: Medium
   - Your coverage: None
   - Competitors covering: All 3 competitors
   - Potential traffic: 800-1000 visits/month
   - Recommended: Comparison + setup guide
```

**Use Case 2: Competitor Deep Dive**
```
Input: Analyze blog.stripe.com

Output:
Stripe's Content Pillars:
─────────────────────────
1. Developer Guides (127 articles)
   - Avg. traffic: 5.2k/article
   - Your gaps: 43 topics uncovered

2. Business Resources (89 articles)
   - Avg. traffic: 3.1k/article
   - Your gaps: 31 topics uncovered

3. Company Updates (56 articles)
   - Avg. traffic: 1.8k/article
   - Your gaps: 12 topics uncovered

Biggest Opportunities:
• "Payment method localization" (12k searches/mo, you have 0 content)
• "Subscription billing best practices" (8k searches/mo, you have 1 shallow post)
• "SCA compliance guide" (5k searches/mo, completely missing)

Content Brief Generated: "The Complete Guide to Payment Localization"
```

**Use Case 3: Ongoing Content Monitoring**
```
Input: Weekly automated scan

Output:
🆕 New Gaps Detected This Week:

1. Competitor published: "AI Agent Memory Patterns"
   - Published by: langchain.com
   - Already ranking: #4
   - Search volume spike: 340 → 1,200/month
   - Action: Publish within 2 weeks to compete

2. Trending search: "agent observability tools"
   - Search volume: +180% this month
   - No competitors covering well yet
   - Opportunity window: ~30 days
   - Action: Fast-track this content

3. Reddit discussion: r/MachineLearning
   - Topic: "How to prevent agent loops"
   - 430 upvotes, 87 comments
   - No good resources linked
   - Action: Write definitive guide
```

---

## 3. Technical Architecture

### Data Sources

1. **Your Content**
   - Sitemap.xml parsing
   - Blog RSS feeds
   - Documentation pages
   - YouTube transcripts
   - Newsletter archives

2. **Competitor Content**
   - Competitor sitemaps
   - Blog posts (via scraping)
   - Meta descriptions
   - H1/H2 headings

3. **Search Data**
   - Google Search Console API (your data)
   - Google Keyword Planner (search volumes)
   - Answer The Public API
   - Reddit API
   - Twitter/X trending topics

4. **SEO Metrics**
   - Ahrefs API (keyword difficulty, traffic)
   - SEMrush API (competitive data)
   - Moz API (domain authority)

### Core Algorithms

#### Algorithm 1: Content Gap Detection
```typescript
async function detectContentGaps(
  yourContent: ContentLibrary,
  competitorContent: ContentLibrary[],
  searchData: SearchKeywords[]
): Promise<ContentGap[]> {
  const gaps: ContentGap[] = [];

  // 1. Extract topics from competitor content
  const competitorTopics = extractTopics(competitorContent);

  // 2. Extract topics from your content
  const yourTopics = extractTopics([yourContent]);

  // 3. Find topics they cover that you don't
  for (const topic of competitorTopics) {
    const yourCoverage = calculateCoverage(topic, yourTopics);

    if (yourCoverage < 0.3) { // Less than 30% coverage
      const searchVolume = getSearchVolume(topic, searchData);
      const difficulty = estimateDifficulty(topic, competitorContent);

      gaps.push({
        topic: topic.name,
        keywords: topic.keywords,
        yourCoverage,
        competitorCoverage: topic.competitorCount,
        searchVolume,
        difficulty,
        potentialTraffic: estimateTraffic(searchVolume, difficulty),
        priority: calculatePriority(searchVolume, difficulty, yourCoverage),
      });
    }
  }

  // 4. Sort by priority
  return gaps.sort((a, b) => b.priority - a.priority);
}
```

#### Algorithm 2: Topic Extraction with AI
```typescript
async function extractTopics(
  content: ContentItem[]
): Promise<Topic[]> {
  const topics: Topic[] = [];

  for (const item of content) {
    // Use LLM to extract main topics
    const prompt = `
Extract the main topics covered in this content:

Title: ${item.title}
Headings: ${item.headings.join(', ')}
Meta description: ${item.description}
First paragraph: ${item.firstParagraph}

List 3-5 main topics as JSON:
[{ "name": "topic name", "keywords": ["kw1", "kw2"], "depth": "shallow|medium|deep" }]
`;

    const extracted = await callLLM(prompt);
    topics.push(...parseTopics(extracted, item));
  }

  // Cluster similar topics
  return clusterTopics(topics);
}
```

#### Algorithm 3: Content Brief Generation
```typescript
async function generateContentBrief(
  gap: ContentGap,
  competitorAnalysis: CompetitorAnalysis
): Promise<ContentBrief> {
  // 1. Analyze top-ranking competitor content
  const topContent = competitorAnalysis.topRankingContent;

  // 2. Extract common elements
  const commonHeadings = extractCommonHeadings(topContent);
  const averageWordCount = calculateAverageWordCount(topContent);
  const commonKeywords = extractCommonKeywords(topContent);

  // 3. Generate outline using AI
  const prompt = `
Create a comprehensive content outline for: "${gap.topic}"

Target keywords: ${gap.keywords.join(', ')}
Search volume: ${gap.searchVolume}/month
Competing articles cover: ${commonHeadings.join(', ')}

Generate:
1. Compelling title (include target keyword)
2. Meta description (150-160 chars)
3. Detailed outline with H2/H3 structure
4. Key points to cover (that competitors miss)
5. Recommended word count
6. Internal linking opportunities

Make it better than competitors while targeting the search intent.
`;

  const outline = await callLLM(prompt);

  return {
    title: outline.title,
    metaDescription: outline.metaDescription,
    outline: outline.structure,
    targetKeywords: gap.keywords,
    recommendedWordCount: averageWordCount * 1.2, // 20% longer
    competitorUrls: topContent.map(c => c.url),
    estimatedTraffic: gap.potentialTraffic,
    priority: gap.priority,
  };
}
```

---

## 4. Tool Definitions

### Tool 1: `analyze_content_gaps`

**Description:** Find content gaps compared to competitors

**Input Schema:**
```yaml
type: object
properties:
  your_domain:
    type: string
    description: Your website domain
  competitor_domains:
    type: array
    items:
      type: string
    description: Up to 5 competitor domains
    maxItems: 5
  content_type:
    type: string
    enum: [all, blog, documentation, video]
    default: all
  language:
    type: string
    default: en
required:
  - your_domain
  - competitor_domains
```

**Output Schema:**
```yaml
type: object
properties:
  gaps:
    type: array
    items:
      type: object
      properties:
        topic:
          type: string
        keywords:
          type: array
        search_volume:
          type: integer
        difficulty:
          type: string
          enum: [low, medium, high]
        your_coverage:
          type: number
          description: 0-1 scale
        competitor_count:
          type: integer
        potential_traffic:
          type: integer
        priority_score:
          type: number
  summary:
    type: object
    properties:
      total_gaps:
        type: integer
      high_priority:
        type: integer
      estimated_total_traffic:
        type: integer
```

### Tool 2: `generate_content_brief`

**Description:** Create detailed content brief from a gap

**Input Schema:**
```yaml
type: object
properties:
  topic:
    type: string
  target_keywords:
    type: array
    items:
      type: string
  competitor_urls:
    type: array
    description: Competing articles to analyze
    items:
      type: string
  content_format:
    type: string
    enum: [article, guide, tutorial, comparison, listicle]
    default: article
required:
  - topic
  - target_keywords
```

**Output Schema:**
```yaml
type: object
properties:
  title:
    type: string
  meta_description:
    type: string
  outline:
    type: array
    items:
      type: object
      properties:
        heading:
          type: string
        level:
          type: integer
        key_points:
          type: array
  target_keywords:
    type: array
  recommended_word_count:
    type: integer
  internal_links:
    type: array
  external_sources:
    type: array
  estimated_time_to_write:
    type: string
```

### Tool 3: `monitor_competitor_content`

**Description:** Track new content published by competitors

**Input Schema:**
```yaml
type: object
properties:
  competitor_domains:
    type: array
    items:
      type: string
  check_frequency:
    type: string
    enum: [daily, weekly, monthly]
    default: weekly
  alert_threshold:
    type: string
    enum: [all, high_priority_only]
    default: high_priority_only
required:
  - competitor_domains
```

**Output Schema:**
```yaml
type: object
properties:
  new_content:
    type: array
    items:
      type: object
      properties:
        competitor:
          type: string
        title:
          type: string
        url:
          type: string
        published_date:
          type: string
        estimated_search_volume:
          type: integer
        already_ranking:
          type: boolean
        action_recommended:
          type: string
  trending_topics:
    type: array
```

### Tool 4: `find_question_gaps`

**Description:** Find questions your audience asks that you haven't answered

**Input Schema:**
```yaml
type: object
properties:
  your_domain:
    type: string
  topic_area:
    type: string
  sources:
    type: array
    items:
      type: string
      enum: [google, reddit, quora, stackoverflow, twitter]
    default: [google, reddit]
required:
  - your_domain
  - topic_area
```

**Output Schema:**
```yaml
type: object
properties:
  questions:
    type: array
    items:
      type: object
      properties:
        question:
          type: string
        asked_count:
          type: integer
        source:
          type: string
        search_volume:
          type: integer
        answered_by_you:
          type: boolean
        recommended_format:
          type: string
          enum: [faq, blog_post, video, documentation]
```

---

## 5. Dependencies & APIs

### Required NPM Packages

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "cheerio": "^1.0.0",              // HTML parsing
    "node-fetch": "^3.3.0",
    "xml2js": "^0.6.0",               // Sitemap parsing
    "natural": "^6.10.0",             // NLP/topic extraction
    "compromise": "^14.10.0",         // Text analysis
    "zod": "^3.22.0"
  }
}
```

### External APIs

1. **Google Search Console API**
   - Your own search data
   - Free with Google account
   - Rate limit: 1200 requests/minute

2. **Ahrefs API** (Optional but recommended)
   - Keyword difficulty
   - Search volume
   - Cost: $99/month for API access

3. **SEMrush API** (Alternative to Ahrefs)
   - Similar data
   - Cost: $119/month

4. **Reddit API**
   - Trending discussions
   - Free with rate limits

5. **LLM API (Claude/OpenAI)**
   - Topic extraction
   - Content brief generation
   - Cost: ~$0.05 per gap analyzed

### Environment Variables

```bash
GOOGLE_SEARCH_CONSOLE_CREDENTIALS=xxx  # Optional
AHREFS_API_KEY=xxx                     # Optional (enhanced data)
SEMRUSH_API_KEY=xxx                    # Alternative to Ahrefs
REDDIT_CLIENT_ID=xxx                   # Optional
REDDIT_CLIENT_SECRET=xxx               # Optional
ANTHROPIC_API_KEY=xxx                  # Required for AI features
```

---

## 6. Implementation Complexity

### Complexity Breakdown

| Component | Complexity | Estimated Time |
|-----------|-----------|----------------|
| Content scraping & parsing | Medium | 1 day |
| Topic extraction with NLP | Medium | 1 day |
| Gap detection algorithm | Medium | 1 day |
| Content brief generation | Low | 0.5 days |
| Search data integration | Low | 0.5 days |
| Monitoring & alerts | Low | 0.5 days |
| Testing & validation | Medium | 0.5 days |

**Total Estimated Time:** 4-5 days

### Technical Challenges

1. **Challenge:** Accurate topic extraction from varied content
   - **Solution:** Combine NLP + LLM for better accuracy
   - **Risk:** Medium - May need tuning

2. **Challenge:** Avoiding scraping blocks
   - **Solution:** Rate limiting, user-agent rotation, respect robots.txt
   - **Risk:** Low - Standard techniques work

3. **Challenge:** Search volume data accuracy
   - **Solution:** Use multiple sources, average estimates
   - **Risk:** Low - Estimates are acceptable

---

## 7. Monetization Strategy

### Pricing Tiers

**Free Tier:**
- 1 gap analysis per week
- Compare to 2 competitors
- Basic search volume data
- No content briefs

**Creator Tier ($29/month):**
- Unlimited gap analyses
- Compare to 5 competitors
- Full search data (Ahrefs integration)
- Automated content briefs
- Weekly monitoring

**Agency Tier ($149/month):**
- Everything in Creator
- Multi-client management
- White-label reports
- API access
- Priority support

### Market Size

- **Target:** Content creators, marketers, agencies
- **TAM:** 2M+ content creators monetizing
- **Conversion:** 4% free-to-paid = 80,000 paid
- **MRR:** Mix 70% Creator / 30% Agency = $3.9M/month
- **ARR:** ~$47M/year (aggressive but feasible)

---

## 8. Success Metrics

### Technical Metrics

- ✅ 85%+ accuracy in gap detection
- ✅ Analyzes 100 competitor articles in < 30 seconds
- ✅ Generated briefs rated 4+ stars by users

### Business Metrics

- 🎯 1,000 free users in first month
- 🎯 100 paid conversions in first quarter
- 🎯 Featured in 3+ content marketing newsletters
- 🎯 4.7+ star rating

---

## 9. Go/No-Go Decision

### ✅ Reasons to Build

1. **Clear pain point** - Content planning is time-consuming
2. **Strong viral potential** - Content marketers share tools
3. **Moderate complexity** - Achievable in 4-5 days
4. **High willingness to pay** - Content = revenue for creators
5. **Low ongoing costs** - Mostly one-time analysis

### ❌ Reasons NOT to Build

1. **Competitive market** - Many SEO tools exist
2. **API costs** - Ahrefs/SEMrush integrations expensive
3. **Data accuracy** - Search volumes are estimates

### Final Recommendation

**🟢 APPROVED TO BUILD**

This skill has:
- Clear differentiation (automated gap mapping + briefs)
- Strong content creator market fit
- Reasonable development time
- Good monetization potential

**Risk Level:** Low-Medium
**Reward Level:** High (large creator market)

---

**Validated By:** AgentFoundry Team
**Date:** 2025-01-08
**Status:** 🟢 Approved for Development
