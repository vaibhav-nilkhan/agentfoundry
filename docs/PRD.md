# AgentFoundry v2 — Product Requirements Document

## 1. Vision

**AgentFoundry** is an open-source developer tool that tracks, analyzes, and optimizes how you use AI coding agents.

> "Fitbit for your coding agents — see what's working, what's costing, and what's best for your codebase."

**One-liner:** Track every AI coding agent you use. See costs, quality, and performance — all in one dashboard.

---

## 2. Problem Statement

Developers in 2026 use 2-4 AI coding agents daily (Claude Code, Codex, Cursor, Amp, Gemini CLI). They have:

- **No visibility** into total costs across agents
- **No data** on which agent performs best for which tasks
- **No history** of what agents did, when, and how well
- **No way to optimize** — they pick agents by gut feeling, not data

**Result:** Wasted tokens, rework from picking the wrong agent, and zero cost control — especially painful for teams.

---

## 2.1 Competitive Landscape

| Existing Tool | What It Does | How AgentFoundry Differs |
|---|---|---|
| **CodexBar** (steipete) | macOS menu bar — shows usage stats for one agent at a time | AgentFoundry: full dashboard + history + quality tracking + cross-agent analysis. CodexBar is a widget; AgentFoundry is a system. |
| **Grove / Kilt** | Terminal UI — runs multiple agents in parallel with Git worktrees | AgentFoundry: doesn't run agents. Monitors them passively. Adds cost tracking, quality checks, and historical insights that Grove doesn't have. |
| **Augment Intent** | Multi-agent orchestrator (enterprise, proprietary) | AgentFoundry: open-source, individual-first. Doesn't orchestrate — tracks and analyzes. Complementary to Augment, not competing. |
| **SkillsMP.com** | Skills marketplace (350K+ skills) | Not competing — AgentFoundry tracks agent performance, not skills. |
| **Anthropic Skills Repo** (84K ⭐) | Official Claude skill sharing | Not competing — AgentFoundry works across ALL agents, not Claude-specific. |
| **Claude Code Plugins** | Official Claude plugin marketplace | Not competing — AgentFoundry is not a plugin. It's a monitoring layer above agents. |
| **VS Code (Jan 2026)** | Runs Claude/Codex/Copilot side-by-side | VS Code launches agents but doesn't track costs, quality, or provide insights. |

**Conclusion:** No existing tool provides cross-agent cost tracking + quality measurement + historical performance insights in one open-source package.

---

## 2.2 Key Technology: Code Mode MCP

Anthropic + Cloudflare developed "Code Mode MCP" — a technique where AI agents write code against a typed SDK instead of stuffing tool definitions into the context window.

- **Result:** 98.7% token reduction (150K tokens → 2K tokens)
- **Relevance to AgentFoundry:** We should use Code Mode MCP in our own architecture when calling any AI APIs (e.g., for smart task classification or generating insights). This keeps our own operational costs near zero.
- **Also relevant:** As agents adopt Code Mode, their cost profiles change. AgentFoundry naturally captures these changes through real usage measurement.

---

## 3. Target Users

### Primary: Individual Developer (Solo)
- Uses 2-3 coding agents regularly
- Pays from own pocket or has a budget
- Wants to know: "Am I spending too much? Is Claude worth the premium over Codex?"

### Secondary: Development Team Lead
- Team of 5-20 developers, each using different agents
- Needs visibility: "What are we spending across the team? Are agents actually improving productivity?"
- Needs governance: "Which agents are approved? What's our monthly spend?"

---

## 4. Core Features (MVP — Phase 1)

### 4.1 Background Agent Monitoring
```
agentfoundry watch
```
- Runs as a background daemon
- Detects when Claude Code, Codex, or Gemini CLI is launched
- Records: start time, end time, agent used
- Monitors Git changes before/after agent runs
- **Zero friction** — developer doesn't change their workflow

### 4.2 Cost Tracking
- Reads token usage from agent log files:
  - Claude Code: `~/.claude/` session logs
  - Codex: terminal output parsing
  - Gemini CLI: session logs
- Calculates cost using pricing config (community-maintained YAML)
- Aggregates: per-task, per-day, per-week, per-agent

### 4.3 Quality Tracking
- After each agent session, automatically runs:
  - `git diff` — what files changed, lines added/removed
  - Test suite (if configured) — pass/fail count
  - Linter (if configured) — new violations
  - Build check (if configured) — success/failure
- Stores results per session

### 4.4 Task Classification
- Automatically tags tasks by type based on files changed:
  - `src/api/**` → "backend"
  - `src/components/**` → "frontend"
  - `tests/**` → "testing"
  - `*.config.*` → "configuration"
- Enables per-category performance analysis

### 4.5 CLI Reports
```bash
agentfoundry stats                    # Quick summary
agentfoundry stats --agent claude     # Claude-specific
agentfoundry stats --period week      # This week's data
agentfoundry costs                    # Cost breakdown
agentfoundry history                  # Task history
```

### 4.6 Web Dashboard
```bash
agentfoundry dashboard                # Opens localhost:3000
```
- **Overview page:** Total cost, tasks completed, agent breakdown (pie chart)
- **Cost page:** Daily/weekly cost trend line, per-agent cost comparison
- **Performance page:** Test-pass rates, build success rates, per-agent, per-task-type
- **History page:** Table of all tracked sessions with filters
- **Insights page:** "Claude has 94% test-pass on backend vs Codex 80%"

### 4.7 Advanced Efficiency Metrics (The "Karpathy" Insight)
Inspired by autonomous AI research loops (like Karpathy's `autoresearch`), AgentFoundry tracks not just *what* an agent did, but *how efficiently it navigated the solution space*:
- **Token-to-Code Yield:** (Tokens Output / Net Lines Changed). Identifies agents that "thrash" (write massive amounts of text/code but result in tiny net diffs).
- **Zero-Shot Success Rate:** Did the agent pass the quality gate on the *first* session, or did it require multiple developer interventions (session chaining) to fix regressions?
- **Blast Radius:** Ratio of files modified to the actual scope of the task. Penalizes agents that make sprawling, unnecessary changes instead of surgical fixes.

---

## 5. Features (Phase 2 — Post-MVP)

- **Agent recommendations**: "Based on your history, use Claude for this task type"
- **Team mode**: Aggregate data across multiple developers
- **Alerts**: "You've spent $50 this week, 40% over your budget"
- **Plugin system**: Community adapters for new agents
- **Export**: CSV/JSON export of all data
- **CI/CD integration**: Track agent usage in automated pipelines

---

## 5.1 Future Vision (Phase 3+, Not in Current Plan)

- **Community Feed / "Agent HN"**: Curated feed of developer agent setups, tips, and workflows aggregated from X/Reddit — so developers don't need to spend time scrolling social media to find the latest "hot takes" on agent configurations, prompting tricks, and best practices. Think "Hacker News for coding agent workflows." Could include:
  - Auto-aggregated posts from X/Reddit about agent tips (filtered by quality)
  - Community-submitted setups ("My Claude Code + Codex workflow for React projects")
  - Trending configurations and techniques
  - Upvoting/rating system for the most useful tips
  - This pairs well with the dashboard — see data AND community knowledge in one place

> [!NOTE]
> This is a longer-term vision feature. It would significantly differentiate AgentFoundry from pure monitoring tools by also being the **place developers go to learn how to use agents better** — not just track them.

---

## 6. Technical Architecture

```
┌────────────────────────────────────────────────────┐
│ Developer's Terminal                                │
│                                                     │
│  $ claude "fix bug"     $ codex "add tests"        │
│          │                      │                   │
│    ┌─────▼──────────────────────▼──────┐            │
│    │ agentfoundry watch (daemon)       │            │
│    │ • Process monitor                 │            │
│    │ • Git watcher                     │            │
│    │ • Log parser                      │            │
│    └─────────────┬────────────────────┘            │
└──────────────────┼─────────────────────────────────┘
                   │
          ┌────────▼────────┐
          │ SQLite Database  │  (local, no server needed for solo)
          │ • Sessions       │
          │ • Costs          │
          │ • Quality scores │
          │ • Git diffs      │
          └────────┬────────┘
                   │
     ┌─────────────┼──────────────┐
     │             │              │
┌────▼───┐   ┌────▼────────┐
│ CLI    │   │ Next.js Web │
│Reports │   │ (UI + API)  │
└────────┘   └─────────────┘
```

> [!IMPORTANT]
> **Phase 1 uses SQLite locally** — no PostgreSQL setup needed. Solo developer can run everything with zero infrastructure. Team/hosted version uses PostgreSQL (Phase 3). We use Next.js App Router for both the frontend and backend API logic to keep the local setup simple (no standalone NestJS server required).

### Data Flow

```
1. Developer runs: $ claude "fix the login bug"
2. agentfoundry watch detects: "claude process started"
3. Records git state: snapshot of changed files (pre)
4. Claude finishes → detects process exit
5. Records git state: snapshot of changed files (post)
6. Reads Claude logs: token usage, session duration
7. Runs quality checks: tests, lint, build
8. Stores everything in SQLite:
   {
     agent: "claude-code",
     task_hint: "fix the login bug",  // from process args if available
     started_at: "2026-03-05T10:30:00",
     duration_seconds: 45,
     tokens_in: 3200,
     tokens_out: 1800,
     cost_usd: 0.04,
     files_changed: ["src/auth.ts", "src/auth.test.ts"],
     task_type: "backend",  // auto-classified
     tests_passed: 12,
     tests_failed: 0,
     lint_issues: 0,
     build_success: true
   }
9. Developer checks: $ agentfoundry stats
```

---

## 7. Existing Codebase Reuse

| Current Package | Reuse | New Role |
|---|---|---|
| `packages/cli` | 🟡 Framework only | New commands: `watch`, `stats`, `costs`, `history`, `dashboard` |
| `packages/web` | 🟢 Heavy reuse | Dashboard UI + API Routes — keep layout, auth, component library. Replace pages. |
| `packages/api` | 🔴 Deprecated | Removing separate Express/NestJS backend to simplify local deployment. |
| `packages/db` | 🟡 Structure only | New Prisma models. Keep migration infrastructure. Switch to SQLite for Phase 1. |
| `packages/validator` | 🟡 Concept reuse | Quality gate — run tests/lint/build after agent sessions. Rewrite in TypeScript. |
| `packages/mcp-adapter` | 🟢 Direct reuse | Agent detection and log parsing uses MCP concepts |
| `packages/shared` | 🟢 Heavy reuse | New shared types for Session, Cost, Quality |
| `packages/sdk` | 🟡 Structure only | Becomes agent adapter SDK |
| Monorepo config | 🟢 100% reuse | Turborepo, ESLint, TypeScript, Docker — unchanged |
| Existing skills | 🟡 Repurposed | Example configs + quality check plugins |

**Estimated reuse: 60-70%** of infrastructure, **30-40% new code** for core features.

---

## 8. Phased Implementation Plan

### Phase 1: Solo MVP (Weeks 1-5)

| Week | Deliverable |
|---|---|
| **1** | **Agent detection**: CLI daemon that detects Claude Code / Codex / Gemini CLI processes. Git snapshot before/after. SQLite schema. |
| **2** | **Log parsing**: Read token usage from Claude logs (`~/.claude/`). Cost calculation from pricing YAML. Store session data. |
| **3** | **Quality checks**: Run test suite, linter, build check after agent sessions. Store results. Auto-classify task type from files. |
| **4** | **CLI reports**: `agentfoundry stats`, `costs`, `history` commands. Formatted terminal output with tables/charts. |
| **5** | **Web dashboard**: 4 pages (Overview, Costs, Performance, History) using existing Next.js setup. Wire to API. |

**Phase 1 output:** A working CLI tool that solo developers can install, run `agentfoundry watch`, use their agents normally, and see costs + quality data in terminal or browser.

### Phase 2: Polish + Community (Weeks 6-8)

| Week | Deliverable |
|---|---|
| **6** | Agent recommendation engine (based on historical data). Insights page on dashboard. |
| **7** | Plugin system for community agent adapters. Documentation. Contributor guide. |
| **8** | Open-source launch: GitHub README, blog post, HN/Reddit submission, OSS program applications. |

### Phase 3: Team Features & Autonomous Swarm Orchestration (Weeks 9-12+)

> **Theoretical North Star (The "Karpathy" Swarm Vision):**
> Andrej Karpathy's `autoresearch` project hypothesized that the next leap in AI tooling is when "humans stop writing the code, and start programming the program.md." 
> While true AGI "singularity" is sci-fi, the engineering goal for Phase 3 is to build the infrastructure that allows multiple agents to safely orchestrate themselves based on hard data.

| Week | Deliverable |
|---|---|
| **9-10** | **Team Mode & PostgreSQL**: Aggregate data across devs for centralized hosted tracking. |
| **11-12** | **Multi-Agent Swarm Tracking**: Support for monitoring parallel "agent swarms" (multiple agents testing different hypotheses simultaneously). |
| **13+** | **Closed-Loop Prompt Optimization**: AI agents use AgentFoundry's local SQLite metrics (`TokenYield` and `ZeroShot`) to automatically rewrite and optimize the workspace's `AGENT_INSTRUCTIONS.md`, creating a self-improving workflow. |

---

## 9. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Agent log formats change without notice | 🟡 Medium | Adapter plugin system — update one file, not the whole product |
| VS Code adds built-in tracking | 🟡 Medium | AgentFoundry is CLI-agent focused (Claude Code, Codex, Amp are all terminal). VS Code won't track terminal agents. |
| Developers don't care about costs | 🔴 Low | Every survey shows cost is top-3 concern. Enterprise teams have budgets. |
| Can't reliably detect agent processes | 🟡 Medium | Start with explicit integration (hooks) if process detection is unreliable |
| Privacy concerns about tracking | 🟡 Medium | 100% local-first. No data leaves machine. SQLite on disk. Open source = auditable. |

---

## 10. Success Metrics

### Launch (Week 8)
- [ ] Works with Claude Code + Codex + Gemini CLI
- [ ] Tracks cost, time, quality for each session
- [ ] CLI reports and web dashboard functional
- [ ] Published on npm and GitHub
- [ ] README with clear install/usage instructions

### Month 1 Post-Launch
- [ ] 100+ GitHub stars
- [ ] 50+ npm installs
- [ ] 3+ community-contributed agent adapters
- [ ] Featured in at least 1 developer newsletter/blog

### Month 3 Post-Launch
- [ ] 500+ GitHub stars
- [ ] Active contributors
- [ ] Team mode released
- [ ] Applied to Claude OSS program + GitHub Sponsors

---

## 11. Name and Branding

**Keep "AgentFoundry"** — it still makes sense:
- "Agent" = AI coding agents
- "Foundry" = where agents are forged, tested, and optimized

**Tagline options:**
- "Your coding agents, measured."
- "Track. Compare. Optimize."
- "The fitness tracker for AI coding agents."

**License:** MIT

---

## 12. Strategic Context: How We Got Here

> This section documents the journey so we remember WHY we chose this direction.

### What AgentFoundry v1 Was
A monorepo (9 packages) designed as an "App Store for AI Agent Skills" — with a skills marketplace, CLI for publishing, SDK for building, and a validator for quality checking skills.

### Why v1 Doesn't Work (March 2026)
1. **SkillsMP.com** already aggregated 350K+ skills from GitHub — the marketplace idea is taken
2. **Anthropic's official `skills` repo** has 84K GitHub stars — they're building the skills ecosystem themselves
3. **Claude Code plugin marketplace** exists with third-party support and security review
4. **Any coding agent can convert skill formats** — "Hey Claude, convert this .cursorrules to CLAUDE.md" — making universal format translation redundant
5. **The validator was stubs** — couldn't actually analyze TypeScript code

### What We Explored and Rejected
| Idea | Why Rejected |
|---|---|
| Fix the validator | Just fixing stubs doesn't make a product |
| AI Code Security Scanner | Claude Code Security + Google Big Sleep already doing this |
| Universal Skills Layer | SkillsMP.com + Anthropic's skills repo already exist |
| Open-source Context Engine | 12-month project, too ambitious for current stage |
| MCP Server Collection | Useful but not a product — just individual utilities |

### What Validated the Current Direction
1. **Augment Intent** (multi-agent orchestrator) proves demand for managing multiple agents
2. **Amp v2** killed its IDE extension, went CLI-only — confirms terminal-first future
3. **Grove/Kilt** exists as a terminal UI for parallel agents — validates the space but doesn't track/analyze
4. **CodexBar** shows developers care about usage metrics — but it's just a menu bar widget
5. **Gartner predicts** consolidation around platforms that MANAGE multi-agent systems
6. **Developer surveys** confirm cost, quality, and agent-switching are top pain points
7. **80% of code will be AI-driven by 2027** — managing agents becomes essential, not optional

### The Conclusion
AgentFoundry v2 = **open-source fitness tracker for AI coding agents**. Not a marketplace. Not a skills platform. A monitoring and analytics layer that helps developers understand and optimize how they use their coding agents.
