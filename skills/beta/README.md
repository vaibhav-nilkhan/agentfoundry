# Beta Skills 🧪

> **Tier**: Beta - Community Validation Needed
> **Badge**: 🧪 Partially Validated - Medium Confidence
> **Total**: 10 skills

---

## What Makes These "Beta"?

These skills solve **REAL developer needs** but face challenges:

🟡 **Established Competition** - Tools like Greptile, SonarQube, Langfuse already exist
🟡 **Framework-Native Solutions** - LangGraph, AWS Bedrock ship similar features
🟡 **Niche Markets** - Fintech-only, SEO-specific, compliance-heavy
🟡 **Saturated Markets** - 10+ existing players in the space

**BUT**: Some developers may still prefer these skills! Help us validate.

---

## Beta Skills (10)

### 1. decision-explainer ⭐⭐⭐
**Problem**: Provide audit-friendly explanation chains for agent decisions
**Competition**: Niche (fintech/compliance only)
**Evidence**: mongodb-partners MAAP, YC government AI projects
**Use Case**: Regulatory compliance, fintech, healthcare, government

### 2. github-pr-analyzer ⭐⭐⭐
**Problem**: AI-powered pull request analysis and code review
**Competition**: **SATURATED** - Greptile, CodeRabbit, PR-Agent (Qodo AI)
**Evidence**: elizaOS/eliza #4893, openai/codex #3694 (Sep 2025)
**Note**: Only install if you need AgentFoundry-specific features

### 3. code-security-audit ⭐⭐⭐
**Problem**: Automated security vulnerability scanning
**Competition**: **OpenAI Aardvark** (Oct 2025), **Google CodeMender** (Oct 2025)
**Evidence**: 45% of AI-generated code has vulnerabilities (Veracode)
**Note**: Two tech giants dominate this space

### 4. api-contract-guardian ⭐⭐⭐
**Problem**: Monitor API contracts with schema drift detection
**Competition**: Swagger, Postman, oasdiff, API management platforms
**Evidence**: 75% of APIs don't match specs, $25B API economy
**Note**: Established market with mature tooling

### 5. technical-debt-quantifier ⭐⭐⭐
**Problem**: Measure and track technical debt with metrics
**Competition**: SonarQube, CodeScene, Zenhub, **GitHub Code Quality** (Oct 2025)
**Evidence**: GitHub launched native solution Oct 28, 2025
**Note**: Very competitive space

### 6. conflict-resolver ⭐⭐⭐
**Problem**: AI-powered merge conflict resolution
**Competition**: **VS Code 1.105**, GitKraken, JetBrains AI Assistant, Resolve.AI
**Evidence**: cursor #999, aider #800 (old requests from 2023-2024)
**Note**: Major IDEs already ship this feature

### 7. data-freshness-validator ⭐⭐⭐
**Problem**: Monitor and validate data freshness to detect stale data
**Competition**: Great Expectations (GX), Elementary, Monte Carlo Data, **Databricks** (Oct 2025)
**Evidence**: Databricks launched data freshness monitoring Oct 7, 2025
**Note**: Data observability platforms handle this

### 8. performance-monitor ⭐⭐⭐
**Problem**: Monitor agent performance, latency, cost, error rates
**Competition**: **10+ tools** - Langfuse, LangSmith, OpenTelemetry, Helicone, AgentOps, Arize, Coralogix
**Evidence**: Active LLM observability market
**Note**: Extremely saturated space

### 9. workflow-state-manager ⭐⭐⭐
**Problem**: Manage workflow state with persistence and checkpointing
**Competition**: **LangGraph** (built-in), **AWS Bedrock Session APIs** (2025), **Microsoft Agent Framework**
**Evidence**: Major frameworks ship this natively
**Note**: Hard to differentiate from framework features

### 10. content-gap-analyzer ⭐⭐⭐
**Problem**: Identify missing topics and content gaps for SEO
**Competition**: SurferSEO, Semrush, Ahrefs, SearchAtlas Scholar, LowFruits
**Evidence**: Recent guides from Sep 2025
**Note**: Competitive SEO market

---

## Why Offer Beta Skills?

**Transparency**: We want to be honest about market positioning
**User Choice**: Advanced users may have specific needs
**Usage Data**: Help us identify which Beta skills are actually valuable
**Promotion Path**: High-usage Beta skills → Production tier

---

## Help Us Validate! 🙏

**If you install a Beta skill**:

1. ⭐ **Rate it** after using (1-5 stars)
2. 💬 **Leave feedback** on what worked/didn't work
3. 📊 **Share usage data** (opt-in analytics)
4. 🆚 **Compare** with established tools you've used

**Promotion Criteria** (Beta → Production):
- 100+ installs
- 4.0+ average rating
- <5% uninstall rate
- Positive qualitative feedback

---

## Installation

All Beta skills are **fully functional** and available:

```bash
# CLI
agentfoundry install github-pr-analyzer

# Or in your IDE/local machine
# See marketplace for UI installation
```

**Warning**: Beta badge means competitive market - evaluate against alternatives!

---

## See Also

- [Production Skills](../production/README.md) - Validated (high confidence)
- [Experimental Skills](../experimental/README.md) - Weak validation (use at own risk)
- [Validation Report](../../docs/SKILLS_VALIDATION_REPORT.md) - Complete 23-skill analysis

---

**Honest about competition. Validated through usage.**
