# 🎯 AgentFoundry 3-Tier Quality System

**Last Updated**: 2025-11-17
**Status**: ✅ Implemented

---

## Overview

AgentFoundry uses a 3-tier quality system to help users discover skills based on validation confidence and market demand. All skills remain installable regardless of tier.

---

## 🔷 The Three Tiers

### ✅ **Production** (11 skills)
**Criteria**: Validated against real GitHub Issues from 2025

**Validation Requirements**:
- ✅ 2+ verified GitHub Issues/Discussions from 2025
- ✅ Solves documented pain points in popular frameworks
- ✅ High confidence in demand (⭐⭐⭐⭐+ rating)
- ✅ Featured in marketplace by default

**Production Skills**:
1. `error-recovery-orchestrator` - 6 GitHub Issues
2. `cross-platform-tool-adapter` - 8 GitHub Issues
3. `tool-calling-wrapper` - 4 GitHub Issues
4. `json-validator` - 5 GitHub Issues
5. `context-compression-engine` - 6 Discussions
6. `agent-reliability-wrapper` - 3 GitHub Issues
7. `smart-tool-selector` - 2 GitHub Issues
8. `cost-predictor-optimizer` - 5 GitHub Issues
9. `multi-agent-orchestrator` - Frameworks + Research
10. `memory-synthesis-engine` - 5 GitHub Issues

**Badge**: `✅ Validated`
**Color**: Green (`bg-green-100 text-green-700`)

---

### 🧪 **Beta** (10 skills)
**Criteria**: Partial validation or competitive market

**Characteristics**:
- 🧪 Niche use cases (fintech, compliance, government)
- 🧪 Saturated markets with established competitors
- 🧪 Frameworks already solve the problem
- 🧪 Community validation needed

**Beta Skills**:
1. `api-contract-guardian` - Swagger/Postman competitors
2. `code-security-audit` - OpenAI Aardvark/Google CodeMender launched Oct 2025
3. `github-pr-analyzer` - Greptile, CodeRabbit, PR-Agent competitors
4. `technical-debt-quantifier` - SonarQube, GitHub Code Quality
5. `content-gap-analyzer` - SurferSEO, Semrush, Ahrefs
6. `decision-explainer` - Niche fintech/compliance use case
7. `workflow-state-manager` - LangGraph, Bedrock, Microsoft provide out-of-box
8. `conflict-resolver` - Major IDEs ship AI-powered merge
9. `data-freshness-validator` - Great Expectations, Elementary, Databricks
10. `performance-monitor` - 10+ established LLM observability tools

**Promotion Path**: 100+ installs + 4.0+ rating → Production

**Badge**: `🧪 Beta`
**Color**: Blue (`bg-blue-100 text-blue-700`)

---

### ⚠️ **Experimental** (5 skills)
**Criteria**: Weak validation or questionable efficacy

**Characteristics**:
- ⚠️ No active developer complaints found
- ⚠️ Emerging areas without proven demand
- ⚠️ Questionable value proposition
- ⚠️ Not agent-specific (infrastructure only)

**Experimental Skills**:
1. `viral-content-predictor` - Research suggests limited efficacy (Nature 2024)
2. `agentfoundry-design-system` - No active complaints about AI aesthetics
3. `multi-step-validator` - Frameworks already solve with built-in validation
4. `rollback-manager` - Not agent-specific (infrastructure transactions)
5. `prompt-version-control` - Legacy data, not in tier directories

**Warning**: Use at own risk

**Badge**: `⚠️ Experimental`
**Color**: Yellow (`bg-yellow-100 text-yellow-700`)

---

## 📊 Marketplace Display

### Sorting
Default sort order: **Quality Tier** (Production → Beta → Experimental)

Other sort options:
- Most Popular (downloads)
- Highest Rated (rating)
- Recently Added (date)

### Filtering
Users can filter by:
- **All Tiers** 🎯
- **Production** ✅
- **Beta** 🧪
- **Experimental** ⚠️

Plus category filters:
- Infrastructure
- Developer Tools
- Security
- Content Intelligence
- Design

---

## 🔍 Validation Methodology

### Production Validation (6-Point Checklist)

For each skill, we verify:

1. **GitHub Issue Evidence** (2+ from 2025)
   - Active issues in major frameworks
   - Recent complaints (2025 preferred)
   - High engagement (comments, upvotes)

2. **Pain Point Severity**
   - Developers losing hours or money
   - Blocking production deployments
   - No easy workarounds

3. **Framework Support**
   - LangChain, LlamaIndex, LangGraph
   - OpenAI, Anthropic, Bedrock
   - Hugging Face, Ollama

4. **Competition Analysis**
   - No established monopolies
   - Room for better DX
   - Differentiation opportunities

5. **Market Timing**
   - Not too early (no demand yet)
   - Not too late (saturated)
   - "Just right" opportunity

6. **Confidence Score**
   - ⭐⭐⭐⭐⭐ = 5+ issues, high severity
   - ⭐⭐⭐⭐ = 2-4 issues, medium-high severity
   - ⭐⭐⭐ = 1-2 issues or discussions only

---

## 📁 Directory Structure

```
skills/
├── production/          # 11 validated skills
│   ├── error-recovery-orchestrator/
│   ├── cross-platform-tool-adapter/
│   └── ...
├── beta/               # 10 partially validated
│   ├── api-contract-guardian/
│   ├── code-security-audit/
│   └── ...
└── experimental/       # 5 weak validation
    ├── viral-content-predictor/
    ├── agentfoundry-design-system/
    └── ...
```

Each directory has a `README.md` explaining the tier and listing skills.

---

## 🎨 Frontend Implementation

### TypeScript Interface

```typescript
export type SkillTier = 'production' | 'beta' | 'experimental';

export interface Skill {
  // ... other fields
  tier: SkillTier;
  tierBadge: string; // e.g., '✅ Validated'
}
```

### Marketplace Components

**Skill Card Badge**:
```tsx
<span className={`px-2 py-0.5 rounded text-xs font-medium ${
  skill.tier === 'production'
    ? 'bg-green-100 text-green-700'
    : skill.tier === 'beta'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-yellow-100 text-yellow-700'
}`}>
  {skill.tierBadge}
</span>
```

**Tier Filter Sidebar**:
```tsx
{[
  { id: 'all', name: 'All Tiers', badge: '🎯' },
  { id: 'production', name: 'Production', badge: '✅' },
  { id: 'beta', name: 'Beta', badge: '🧪' },
  { id: 'experimental', name: 'Experimental', badge: '⚠️' }
].map(tier => (
  <button onClick={() => setSelectedTier(tier.id)}>
    <span>{tier.badge}</span> {tier.name}
  </button>
))}
```

---

## 🔧 Backend API Support

### Query Parameter

`GET /api/skills?tier=production`

Supported values: `production`, `beta`, `experimental`

### DTO Definition

```typescript
export enum SkillTier {
  PRODUCTION = 'production',
  BETA = 'beta',
  EXPERIMENTAL = 'experimental',
}

export class SkillQueryDto {
  @ApiProperty({
    required: false,
    enum: SkillTier,
    description: 'Filter by quality tier',
  })
  @IsOptional()
  @IsEnum(SkillTier)
  tier?: SkillTier;
}
```

---

## 📈 Analytics & Metrics

### Track by Tier

1. **Installation Rate**
   - Production: Expected 60-70%
   - Beta: Expected 25-35%
   - Experimental: Expected 5-10%

2. **Success Metrics**
   - Production: 4.5+ rating, 100+ installs/month
   - Beta: 4.0+ rating, 50+ installs/month
   - Experimental: 3.5+ rating, 10+ installs/month

3. **Promotion Triggers**
   - Beta → Production: 100+ installs + 4.0+ rating
   - Experimental → Beta: 50+ installs + 3.5+ rating

---

## 🚀 Launch Strategy

### Phase 1: Production First (Week 1)
- Feature only Production skills
- Build confidence with high-quality offerings
- Collect early feedback

### Phase 2: Beta Introduction (Week 2)
- Add Beta tier with clear badges
- Educate users on tier system
- Monitor adoption rates

### Phase 3: Experimental Access (Week 3)
- Make Experimental skills visible
- Add warnings and disclaimers
- Allow early adopters to experiment

---

## ✅ Implementation Status

- [x] Directory structure (production/, beta/, experimental/)
- [x] Tier metadata in all skill.yaml files
- [x] README files for each tier
- [x] Frontend Skill interface with tier field
- [x] Marketplace UI with tier badges
- [x] Tier filtering sidebar
- [x] Tier-based sorting
- [x] Backend API query parameter
- [x] Swagger documentation
- [ ] Database migration (tier enum in Skill model)
- [ ] Analytics dashboard for tier metrics
- [ ] Installation flow testing

---

## 📚 Related Documentation

- `skills/README.md` - Main skills overview
- `skills/production/README.md` - Production tier details
- `skills/beta/README.md` - Beta tier details
- `skills/experimental/README.md` - Experimental tier details
- `docs/archive/skills/` - Historical validation reports

---

**Next Steps**: Database migration + analytics dashboard + installation testing
