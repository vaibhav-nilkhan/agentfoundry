# AgentFoundry: 2-Week Sprint to MVP Alpha

> **Goal**: Ship a working alpha with MCP integration, 20+ Skills, and marketplace MVP
> **Timeline**: 14 days
> **Budget**: ~$6,000 ($3,000/week)
> **Success Metric**: 5 alpha users installing and using Skills via MCP

---

## 🎯 Sprint Overview

### Week 1: Define the Product
**Focus**: Stop building infrastructure, start building product

**Deliverables**:
- ✅ Skill format specification (canonical definition)
- ✅ MCP integration working (Claude Desktop integration)
- ✅ 20 production-ready Skills published
- ✅ Validation framework MVP

### Week 2: Build & Launch Alpha
**Focus**: Make it usable and get it in users' hands

**Deliverables**:
- ✅ Marketplace browse/search UI
- ✅ CLI install command working
- ✅ 5 alpha testers using the platform
- ✅ Basic analytics and monitoring

---

## 📅 Day-by-Day Breakdown

### **Week 1: Foundation**

#### **Day 1-2: Define Skill Format & MCP Integration** 🔴 CRITICAL

**Morning (Day 1)**:
- [ ] Finalize Skill format specification
  - Directory structure (`skill.yaml`, `README.md`, `src/`, `tests/`)
  - JSON schema with validation rules
  - Platform compatibility matrix (MCP, Claude Skills, GPT Actions)
  - Permission model definition

**Afternoon (Day 1)**:
- [ ] Document MCP integration architecture
  - Adapter layer design (AgentFoundry → MCP)
  - Tool conversion logic
  - Authentication flow
  - Error handling strategy

**Morning (Day 2)**:
- [ ] Implement MCP adapter MVP
  - Create `packages/mcp-adapter/` package
  - Tool schema converter
  - Basic server generator

**Afternoon (Day 2)**:
- [ ] Test MCP integration end-to-end
  - Generate MCP server from sample Skill
  - Test with Claude Desktop
  - Document installation flow

**Deliverables**:
- `docs/architecture/skill-format-spec.md` (complete)
- `docs/guides/mcp-integration.md` (complete)
- `packages/mcp-adapter/` (working MVP)

---

#### **Day 3-7: Create 20 Production Skills** 🔴 CRITICAL

**Strategy**: Focus on **high-utility, low-complexity** Skills that showcase platform value

**Skill Categories** (20 Skills total):

**Web & APIs (6 Skills)**:
1. Web Search (Brave/Google)
2. Weather Data (OpenWeatherMap)
3. News Fetcher (NewsAPI)
4. Currency Converter
5. HTTP Client (Generic REST API)
6. URL Shortener

**Data & Files (5 Skills)**:
7. CSV Parser
8. JSON Validator
9. File Operations (read/write/list)
10. Image Metadata Reader
11. PDF Text Extractor

**Productivity (4 Skills)**:
12. Email Sender (SMTP)
13. Calendar Events (iCal)
14. Task Manager (Local JSON)
15. Note Taker (Markdown)

**Development (3 Skills)**:
16. Code Formatter (Prettier/Black)
17. Git Operations
18. Package Info (npm/PyPI lookup)

**Utilities (2 Skills)**:
19. Unit Converter
20. QR Code Generator

**Daily Breakdown**:

**Day 3**: Skills 1-4 (Web Search, Weather, News, Currency)
- Morning: Implement Skills 1-2
- Afternoon: Implement Skills 3-4, write tests

**Day 4**: Skills 5-8 (HTTP Client, URL Shortener, CSV, JSON)
- Morning: Implement Skills 5-6
- Afternoon: Implement Skills 7-8, write tests

**Day 5**: Skills 9-12 (Files, Image, PDF, Email)
- Morning: Implement Skills 9-10
- Afternoon: Implement Skills 11-12, write tests

**Day 6**: Skills 13-16 (Calendar, Tasks, Notes, Formatter)
- Morning: Implement Skills 13-14
- Afternoon: Implement Skills 15-16, write tests

**Day 7**: Skills 17-20 + Validation
- Morning: Implement Skills 17-20
- Afternoon: Run validation on all 20 Skills, fix issues

**Deliverables**:
- 20 Skills in `skills/examples/` with:
  - `skill.yaml` manifest
  - `SKILL.md` documentation
  - `src/` implementation (Python or TypeScript)
  - `tests/` unit tests
  - `examples/` usage examples
- All Skills passing validation
- All Skills tested with MCP integration

---

### **Week 2: MVP Launch**

#### **Day 8-9: Validation Framework** 🟡 HIGH

**Morning (Day 8)**:
- [ ] Complete `SkillValidator` service
  - Static analysis (AST parsing)
  - Test execution in sandbox
  - Dependency checking
  - Security scanning (basic)

**Afternoon (Day 8)**:
- [ ] Build validation reporting
  - JSON report generation
  - Error/warning categorization
  - Success criteria definition

**Morning (Day 9)**:
- [ ] API endpoints for validation
  - POST `/api/v1/skills/validate`
  - GET `/api/v1/skills/:id/validation-results`

**Afternoon (Day 9)**:
- [ ] Test validation pipeline
  - Run against all 20 Skills
  - Fix any validation issues
  - Document validation process

**Deliverables**:
- `packages/validator/app/services/skill_validator.py` (complete)
- Validation API endpoints working
- All 20 Skills validated and passing

---

#### **Day 10-11: Marketplace UI** 🟡 HIGH

**Morning (Day 10)**:
- [ ] Marketplace browse page
  - Skills grid with cards (name, description, downloads, rating)
  - Search bar (by name, description)
  - Filter controls (platform, category, free/paid)
  - Pagination (20 per page)

**Afternoon (Day 10)**:
- [ ] Skill detail page
  - Header (name, version, author, install button)
  - README display (rendered Markdown)
  - Installation instructions
  - Metadata (platforms, permissions, dependencies)

**Morning (Day 11)**:
- [ ] Polish UI/UX
  - Responsive design
  - Loading states
  - Error handling
  - Empty states

**Afternoon (Day 11)**:
- [ ] Connect to backend
  - Fetch Skills from API
  - Handle pagination
  - Implement search/filter

**Deliverables**:
- `packages/web/src/app/marketplace/page.tsx` (complete)
- `packages/web/src/app/marketplace/[slug]/page.tsx` (complete)
- Marketplace fully functional with 20 Skills

---

#### **Day 12: CLI Install Command** 🟡 HIGH

**Morning**:
- [ ] Implement `agentfoundry install <skill-name>`
  - Fetch Skill from marketplace API
  - Download to local directory (`~/.agentfoundry/skills/`)
  - Check dependencies (Python packages, Node modules)
  - Run local validation

**Afternoon**:
- [ ] MCP server generation
  - Generate MCP server config for installed Skill
  - Update Claude Desktop config automatically
  - Provide manual instructions if auto-update fails

**Deliverables**:
- `packages/cli/src/commands/install.ts` (complete)
- End-to-end install flow working
- CLI documentation updated

---

#### **Day 13: Alpha Prep & Testing** 🟢 MEDIUM

**Morning**:
- [ ] End-to-end testing
  - Browse marketplace → Select Skill → Install via CLI → Use in Claude Desktop
  - Test 5 different Skills
  - Document any bugs

**Afternoon**:
- [ ] Create onboarding guide
  - Installation instructions (CLI, Claude Desktop setup)
  - First Skill walkthrough
  - Troubleshooting FAQ
  - Video walkthrough (Loom)

**Deliverables**:
- All critical flows tested and working
- Onboarding documentation complete
- Known issues documented

---

#### **Day 14: Alpha Launch** 🚀

**Morning**:
- [ ] Deploy to production
  - Frontend: Vercel
  - Backend: Railway
  - Validator: Railway
  - Database: PostgreSQL (Railway or Supabase)

**Afternoon**:
- [ ] Recruit 5 alpha users
  - Post in AI communities (Discord, Twitter, Reddit)
  - Direct outreach to developer friends
  - Provide alpha access instructions

**Evening**:
- [ ] Monitor and support
  - Watch analytics for usage
  - Be available for support
  - Collect feedback

**Deliverables**:
- Production environment live
- 5 alpha users onboarded
- Feedback collection system ready

---

## 💰 Budget Breakdown

### Week 1: $3,000
- Development tools: $200 (Supabase Pro, Claude Pro)
- Cloud services: $300 (Railway, Vercel)
- API keys for Skills: $500 (Brave Search, OpenWeatherMap, NewsAPI, etc.)
- Contingency: $2,000

### Week 2: $3,000
- Cloud services: $300 (Production hosting)
- Monitoring tools: $200 (Sentry, PostHog)
- Domain/SSL: $50
- Alpha incentives: $500 (credits for early users)
- Contingency: $1,950

**Total: $6,000**

---

## 📊 Success Metrics

### Week 1 (Product Definition)
- [ ] MCP adapter converts 100% of 20 Skills successfully
- [ ] All 20 Skills pass validation
- [ ] At least 15 Skills work in Claude Desktop without issues

### Week 2 (MVP Launch)
- [ ] Marketplace loads in <2s
- [ ] CLI install completes in <30s
- [ ] 5 alpha users install and use at least 1 Skill
- [ ] <5% error rate on Skill executions

---

## 🚨 Red Flags & Mitigation

### Red Flag #1: MCP Integration Doesn't Work
**Impact**: CRITICAL - Entire platform depends on this
**Mitigation**:
- Allocate extra time on Day 1-2
- Have backup plan to manually create MCP servers
- Test with simple Skills first before complex ones

### Red Flag #2: Can't Create 20 Skills in 5 Days
**Impact**: HIGH - Need critical mass for marketplace
**Mitigation**:
- Reduce to 10 high-quality Skills if needed
- Reuse existing open-source tools (wrap them as Skills)
- Focus on Skills with existing libraries (less custom code)

### Red Flag #3: Validation is Too Slow/Complex
**Impact**: MEDIUM - Can launch without perfect validation
**Mitigation**:
- Start with basic static analysis only
- Skip test execution if it's blocking
- Add sandbox testing post-alpha

### Red Flag #4: No Alpha Users Sign Up
**Impact**: HIGH - Can't validate product-market fit
**Mitigation**:
- Offer early access incentives (free credits)
- Direct outreach to AI developer communities
- Create compelling demo video

---

## 🎯 Critical Path (Must Not Slip)

1. **Day 1-2**: MCP Integration ← BLOCKER for everything
2. **Day 3-7**: 20 Skills ← Need inventory for marketplace
3. **Day 12**: CLI Install ← Core user flow

**Everything else is negotiable.**

---

## 📝 Daily Standup Format

**What did we ship yesterday?**
**What are we shipping today?**
**What's blocking us?**

Keep focus. Ship daily.

---

## 🏁 Definition of Done (Alpha Launch)

- [ ] User can browse 20+ Skills on marketplace
- [ ] User can install Skill via CLI in <1 minute
- [ ] User can use Skill in Claude Desktop
- [ ] All core flows documented
- [ ] 5 alpha users actively using the platform
- [ ] Feedback collected and prioritized for next sprint

---

**Let's build this! 🚀**

---

## 📌 Quick Reference

| Task | Priority | Days | Owner |
|------|----------|------|-------|
| Skill Format Spec | 🔴 CRITICAL | 1 | [Assign] |
| MCP Integration | 🔴 CRITICAL | 2 | [Assign] |
| 20 Production Skills | 🔴 CRITICAL | 5 | [Assign] |
| Validation Framework | 🟡 HIGH | 2 | [Assign] |
| Marketplace UI | 🟡 HIGH | 2 | [Assign] |
| CLI Install Command | 🟡 HIGH | 1 | [Assign] |
| Alpha Launch | 🟢 MEDIUM | 1 | [Assign] |

**Total: 14 days = 2 weeks**

---

*Last updated: 2025-11-08*
