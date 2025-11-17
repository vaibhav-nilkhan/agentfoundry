# Content Gap Analyzer

> Find content gaps vs competitors, generate briefs, and discover untapped opportunities

## What It Does

Content Gap Analyzer helps you dominate your niche by:
- **Finding content gaps** - What are competitors covering that you're not?
- **Generating content briefs** - Turn gaps into actionable content plans
- **Monitoring competitors** - Track new content as it's published
- **Discovering questions** - Find unanswered questions from your audience

## Features

### 1. Content Gap Analysis
Compare your content vs up to 5 competitors:
- Search volume estimates
- Traffic potential
- Difficulty scores
- Priority recommendations

### 2. Content Brief Generation
Auto-generate comprehensive content outlines:
- SEO-optimized titles
- Meta descriptions
- H2/H3 structure
- Target keywords
- Word count recommendations
- Internal linking opportunities

### 3. Competitor Monitoring
Track competitor content in real-time:
- New articles
- Trending topics
- Ranking changes
- Action recommendations

### 4. Question Gap Discovery
Find questions your audience is asking:
- Google autocomplete
- Reddit discussions
- Quora threads
- Stack Overflow questions
- Twitter conversations

## Installation

```bash
npm install @agentfoundry-skills/content-gap-analyzer
```

## Usage

### Analyze Content Gaps

```typescript
import { run as analyzeGaps } from './tools/analyze-content-gaps';

const gaps = await analyzeGaps({
  your_domain: 'agentfoundry.dev',
  competitor_domains: ['langchain.com', 'n8n.io'],
  content_type: 'all',
  language: 'en'
});

console.log(`Found ${gaps.summary.total_gaps} content gaps`);
```

### Generate Content Brief

```typescript
import { run as generateBrief } from './tools/generate-content-brief';

const brief = await generateBrief({
  topic: 'AI Agent Testing',
  target_keywords: ['ai agent testing', 'agent testing framework'],
  content_format: 'guide'
});

console.log(`Title: ${brief.title}`);
console.log(`Word count: ${brief.recommended_word_count}`);
```

## Tools

| Tool | Description |
|------|-------------|
| `analyze_content_gaps` | Find gaps compared to competitors |
| `generate_content_brief` | Create detailed content outlines |
| `monitor_competitor_content` | Track new competitor content |
| `find_question_gaps` | Discover unanswered questions |

## Pricing

| Tier | Price | Limits |
|------|-------|--------|
| **Free** | $0/mo | 50 requests/month, 3 competitors |
| **Pro** | $49/mo | 500 requests/month, 10 competitors |
| **Enterprise** | $299/mo | Unlimited |

## License

MIT © AgentFoundry
