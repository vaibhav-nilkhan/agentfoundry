# Skills Cleanup & Reorganization Plan

> **Date**: November 17, 2025
> **Purpose**: Reorganize skills/ directory based on validation findings
> **Source**: SKILLS_VALIDATION_REPORT.md (Complete 23-skill validation)

---

## Executive Summary

**Validation Results**: 9 validated, 10 partial, 4 weak out of 23 skills (39% full validation rate)

**Recommendation**: Three-tier structure
- **Tier 1 (Production)**: 10 skills (9 validated + cross-platform-tool-adapter)
- **Tier 2 (Beta)**: 13 skills (partially validated - real needs but competitive markets)
- **Archive**: 4 skills (weak validation or questionable value)

---

## Current Structure

```
skills/
├── production/          # 23 existing skills
│   ├── cost-predictor-optimizer/
│   ├── multi-agent-orchestrator/
│   ├── decision-explainer/
│   └── ... (20 more)
├── templates/
└── examples/
```

---

## Proposed New Structure

```
skills/
├── production/          # Tier 1: 10 validated skills
│   ├── cross-platform-tool-adapter/      # ✅ NEW (Pain Point #1)
│   ├── cost-predictor-optimizer/         # ✅ Batch 1
│   ├── multi-agent-orchestrator/         # ✅ Batch 1
│   ├── memory-synthesis-engine/          # ✅ Batch 1
│   ├── error-recovery-orchestrator/      # ✅ Batch 1
│   ├── context-compression-engine/       # ✅ Batch 1
│   ├── json-validator/                   # ✅ Batch 2
│   ├── tool-calling-wrapper/             # ✅ Batch 2
│   ├── agent-reliability-wrapper/        # ✅ Batch 2
│   └── smart-tool-selector/              # ✅ Batch 4
│
├── beta/                # Tier 2: 13 partially validated skills
│   ├── decision-explainer/               # 🟡 Niche (fintech/compliance)
│   ├── github-pr-analyzer/               # 🟡 Saturated market
│   ├── code-security-audit/              # 🟡 OpenAI/Google competition
│   ├── api-contract-guardian/            # 🟡 Established tooling
│   ├── technical-debt-quantifier/        # 🟡 Mature market
│   ├── conflict-resolver/                # 🟡 IDEs ship this
│   ├── data-freshness-validator/         # 🟡 Data observability platforms
│   ├── performance-monitor/              # 🟡 10+ existing tools
│   ├── workflow-state-manager/           # 🟡 Frameworks ship this
│   ├── content-gap-analyzer/             # 🟡 SEO market
│   ├── [3 more from validation report]/  # 🟡 TBD
│   └── README.md                         # Beta tier explanation
│
├── archive/             # 4 weak validation skills
│   ├── agentfoundry-design-system/       # ❌ No complaints
│   ├── multi-step-validator/             # ❌ Frameworks ship
│   ├── rollback-manager/                 # ❌ Not agent-specific
│   ├── viral-content-predictor/          # ❌ Questionable value
│   └── README.md                         # Archive explanation
│
├── templates/
└── examples/
```

---

## Tier 1: Production Skills (10)

### ✅ High Confidence - Fully Validated

| Skill | Validation | GitHub Issues | Competition | Priority |
|-------|-----------|---------------|-------------|----------|
| cross-platform-tool-adapter | ⭐⭐⭐⭐⭐ | 8 issues (2025) | None | HIGHEST |
| cost-predictor-optimizer | ⭐⭐⭐⭐⭐ | 5 issues (2025) | None | HIGH |
| memory-synthesis-engine | ⭐⭐⭐⭐⭐ | 5 issues (2025) | Partial | HIGH |
| error-recovery-orchestrator | ⭐⭐⭐⭐⭐ | 6 issues (2025) | None | HIGH |
| context-compression-engine | ⭐⭐⭐⭐⭐ | 6 discussions (2025) | None | HIGH |
| json-validator | ⭐⭐⭐⭐⭐ | 5 issues (2025) | None | HIGH |
| agent-reliability-wrapper | ⭐⭐⭐⭐⭐ | 3 issues (2025) | None | HIGH |
| multi-agent-orchestrator | ⭐⭐⭐⭐ | Multiple frameworks | Partial | HIGH |
| tool-calling-wrapper | ⭐⭐⭐⭐ | 4 issues (2025) | Partial | HIGH |
| smart-tool-selector | ⭐⭐⭐⭐ | 2 issues (2025) | Emerging | HIGH |

**Badge**: ✅ "Production-Ready"

**Marketplace Display**:
- Default sort order: These appear first
- "Validated against real developer pain"
- Show GitHub Issues count
- 95%+ test coverage required

---

## Tier 2: Beta Skills (13)

### 🟡 Medium Confidence - Partially Validated

**Criteria**: Real needs but face competition or niche markets

| Skill | Issue | Status |
|-------|-------|--------|
| decision-explainer | Fintech/compliance only | Beta |
| github-pr-analyzer | Greptile, CodeRabbit exist | Beta |
| code-security-audit | OpenAI Aardvark, Google CodeMender | Beta |
| api-contract-guardian | Swagger, Postman exist | Beta |
| technical-debt-quantifier | SonarQube, CodeScene exist | Beta |
| conflict-resolver | VS Code, GitKraken ship this | Beta |
| data-freshness-validator | Great Expectations, Elementary | Beta |
| performance-monitor | Langfuse, LangSmith, 10+ tools | Beta |
| workflow-state-manager | LangGraph, AWS Bedrock ship this | Beta |
| content-gap-analyzer | SurferSEO, Semrush, Ahrefs | Beta |

**Badge**: 🧪 "Beta - Community Validation Needed"

**Marketplace Display**:
- Appear after Production skills
- "Solves real needs but faces established competition"
- Feedback form on skill page
- Usage analytics tracked
- Can be promoted to Production based on usage

**Promotion Criteria**:
- 100+ installs
- 4.0+ average rating
- <5% uninstall rate
- Positive user feedback

---

## Archive (4)

### ❌ Weak Validation - Low Confidence

| Skill | Reason | Action |
|-------|--------|--------|
| agentfoundry-design-system | Emerging area, no complaints | Archive |
| multi-step-validator | Frameworks address (LangGraph, AWS) | Archive |
| rollback-manager | Infrastructure, not agent-specific | Archive |
| viral-content-predictor | Research shows limited value | Archive |

**Status**: Moved to `skills/archive/`

**Not displayed in marketplace** - Available in codebase for reference but not published

**README.md** in archive/ explains why these were archived

---

## Migration Steps

### Phase 1: Immediate (1-2 hours)

1. **Create new directories**
```bash
cd skills/
mkdir -p beta archive
```

2. **Move cross-platform-tool-adapter to production/**
```bash
mv production/cross-platform-tool-adapter production/
# (Already there from Skill #1 build)
```

3. **Move 13 skills to beta/**
```bash
# List of skills to move
BETA_SKILLS=(
  "decision-explainer"
  "github-pr-analyzer"
  "code-security-audit"
  "api-contract-guardian"
  "technical-debt-quantifier"
  "conflict-resolver"
  "data-freshness-validator"
  "performance-monitor"
  "workflow-state-manager"
  "content-gap-analyzer"
)

for skill in "${BETA_SKILLS[@]}"; do
  mv production/$skill beta/
done
```

4. **Move 4 skills to archive/**
```bash
ARCHIVE_SKILLS=(
  "agentfoundry-design-system"
  "multi-step-validator"
  "rollback-manager"
  "viral-content-predictor"
)

for skill in "${ARCHIVE_SKILLS[@]}"; do
  mv production/$skill archive/
done
```

5. **Create README files**
```bash
# beta/README.md - Explain beta tier
# archive/README.md - Explain why archived
```

### Phase 2: Metadata Updates (2-3 hours)

1. **Update skill.yaml for each skill**

**Production skills**: Add tier designation
```yaml
tier: production
validation:
  status: validated
  confidence: high
  github_issues:
    - langchain-33855
    - langchain-28848
  validated_date: "2025-11-17"
```

**Beta skills**: Add tier + competition note
```yaml
tier: beta
validation:
  status: partial
  confidence: medium
  note: "Real need but faces established competition (Greptile, CodeRabbit)"
  competitors:
    - Greptile
    - CodeRabbit
  beta_feedback_url: "https://github.com/yourusername/agentfoundry/discussions"
```

**Archived skills**: Add archive reason
```yaml
tier: archived
validation:
  status: weak
  confidence: low
  archive_reason: "Emerging area with no active complaints"
  archived_date: "2025-11-17"
```

### Phase 3: Marketplace UI Updates (4-6 hours)

1. **Add tier badges**
```tsx
// packages/web/src/components/SkillCard.tsx
{skill.tier === 'production' && (
  <Badge variant="success">✅ Production-Ready</Badge>
)}
{skill.tier === 'beta' && (
  <Badge variant="warning">🧪 Beta</Badge>
)}
```

2. **Filter/sort by tier**
```tsx
// Default sort: Production first, then Beta
skills.sort((a, b) => {
  const tierOrder = { production: 0, beta: 1 };
  return tierOrder[a.tier] - tierOrder[b.tier];
});
```

3. **Beta skill page enhancements**
- Add feedback form
- Show competitors
- Display usage stats (if available)

### Phase 4: Documentation (2 hours)

1. **Update README.md**
```markdown
# AgentFoundry Skills

## Production Skills (10)
[List with badges]

## Beta Skills (13)
[List with warning]

## Archived Skills (4)
[Link to archive/ with explanation]
```

2. **Create skills/beta/README.md**
```markdown
# Beta Skills

These skills solve REAL developer needs but face:
- Established competition (e.g., Greptile for code review)
- Framework-native solutions (e.g., LangGraph for state management)
- Niche markets (e.g., fintech-only compliance tools)

**Help us validate**: Install, test, and provide feedback!
```

3. **Create skills/archive/README.md**
```markdown
# Archived Skills

These skills were archived due to:
- Weak validation (no active complaints)
- Frameworks already solving (LangGraph, AWS Bedrock)
- Questionable value (research shows limited efficacy)

Available for reference but not published to marketplace.
```

---

## Rollout Timeline

### Week 1 (Nov 17-23)
- ✅ Complete migration (Phases 1-2)
- ✅ Update marketplace UI (Phase 3)
- ✅ Documentation (Phase 4)

### Week 2-3 (Nov 24 - Dec 7)
- Contact 3 design partners
- Beta test Production skills
- Gather feedback

### Week 4 (Dec 8-14)
- Soft launch to 20 beta users
- Monitor Beta skill usage
- Promote high-usage Beta → Production
- Deprecate low-usage Beta

### Week 5 (Dec 15-21)
- 🚀 Public beta launch
- 10-15 Production skills
- Product Hunt, social media

---

## Success Metrics

### Production Skills (Tier 1)
- **Target**: 90%+ satisfaction
- **Metrics**: Installs, ratings, retention
- **Goal**: <3% uninstall rate

### Beta Skills (Tier 2)
- **Target**: Identify top 3-5 for promotion
- **Metrics**: Usage, feedback, vs competitors
- **Promotion Threshold**: 100+ installs, 4.0+ rating

### Archived Skills
- **Target**: Zero support burden
- **Metrics**: Not displayed in marketplace
- **Outcome**: Available for reference only

---

## The Bottom Line

**Move from 23 unvalidated → 10 Production + 13 Beta + 4 Archived**

This honest, tier-based approach:
1. ✅ Manages user expectations
2. ✅ Focuses resources on validated skills
3. ✅ Lets market validate Beta skills
4. ✅ Reduces support burden
5. ✅ Enables data-driven promotion

**Launch with integrity. Validate through usage.**
