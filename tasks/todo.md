# AgentFoundry V2 Implementation Plan

## Week 1 — Agent Detection ✅
- [x] Backup V1 Database Schema
- [x] Convert Prisma to SQLite (schema: `AgentSession`, `CostRecord`, `QualityMetrics`, `GitSnapshot`)
- [x] Create Process Monitor daemon (`processMonitor.ts` — detects Claude, Codex, Gemini, Amp)
- [x] Git integration service (`gitIntegration.ts` — pre/post diff capture)
- [x] `watch` command (background daemon)
- [x] Unit tests for processMonitor + gitIntegration

## Week 2 — Log Parsing & Cost Tracking ✅
- [x] Claude Code log parser (`~/.claude/projects/` JSONL parsing)
- [x] Codex CLI log parser (`~/.codex/sessions/` date-sharded JSONL)
- [x] Gemini CLI log parser (telemetry/OTel collector logs)
- [x] Pricing config with per-model rates (Claude, Codex, Gemini)
- [x] `calculateTokenCost()` function
- [x] `saveCostRecord()` — persists parsed costs to DB
- [x] 26+ unit tests for all parsers + pricing
- [x] **Technical Debt**: Split `logParser.ts` (472 lines) into base + per-agent files (modular plugin foundation)

## Week 3 — Quality Checks ✅
- [x] Add `taskType` to Prisma schema and run generator
- [x] Delete legacy Python validator code
- [x] Setup `validator` package as TypeScript workspace
- [x] Implement `TaskClassifier.ts` (filesChanged -> taskType)
- [x] Implement `QualityChecker.ts` (run linter/tests/build)
- [x] Write Vitest unit tests for both new services
- [x] Integrate into `agentfoundry watch` daemon

## Week 4 — CLI Reports ✅
- [x] `agentfoundry stats` command
- [x] `agentfoundry costs` command
- [x] `agentfoundry history` command
- [x] Formatted terminal output with tables

## Week 5 — Web Dashboard Base ✅
- [x] Overview page (costs, tasks, agent breakdown)
- [x] Costs page (trends, comparisons)
- [x] Performance page (test pass rates, build success)
- [x] History page (session table with filters)

## Week 6 — Advanced Efficiency Metrics (Karpathy Update) ✅
- [x] Implement `tokenYield` calculation (Tokens Out / Net Lines Changed) in `watch.ts` / logic class
- [x] Implement `isZeroShot` tracking (Passed without recent failed sessions) in `watch.ts` / logic class
- [x] Add unit tests for efficiency metrics calculations
- [x] Update `agentfoundry stats` command to display new metrics
- [x] Update Dashboard Performance page with Efficiency Leaderboard

## Week 6.5 — UI/UX Overhaul (Robust Developer Aesthetic) ✅
- [x] **Phase 1: Shared Components Foundation**
  - [x] Implement `BentoCard` and `BentoGrid` base components with Framer Motion hover effects.
  - [x] Implement `MetricDisplay` component (monospace fonts, LED status indicators).
- [x] **Phase 2: Page Refactoring**
  - [x] Refactor `/page.tsx` (Overview) to use Bento grid structure.
  - [x] Refactor `/performance/page.tsx` (Metrics) to use high-contrast data rows.
  - [x] Refactor `/costs/page.tsx` (Charts) to customize Recharts with 1px grids and mono fonts.
- [x] **Phase 3: Validation**
  - [x] Run full workspace Next.js build (`pnpm build`).
  - [x] Ensure all existing Next.js layout tests pass.

## Week 7 — Agent Recommendation Engine & Insights ✅
- [x] **Phase 1: Core Recommendation Logic**
  - [x] Implement `RecommendationService.ts` in `packages/cli/src/services`.
  - [x] Calculate "Best Fit" using weighted score: `passRate` (50%) + `tokenYield` (30%) + `costEfficiency` (20%).
- [x] **Phase 2: CLI Integration**
  - [x] Add `agentfoundry recommend` command.
- [x] **Phase 3: Web Dashboard Insights**
  - [x] Create `/insights` page in the Next.js dashboard.
- [x] **Phase 4: Validation**
  - [x] Add unit tests for `RecommendationService`.
  - [x] Ensure full monorepo test pass.

## Week 8 — Community Plugin System & Documentation ✅
- [x] **Phase 1: External Plugin Loader**
  - [x] Define the Plugin Directory structure (defaulting to `~/.agentfoundry/plugins/`).
  - [x] Implement a `PluginLoader` that can dynamically import `.js` or `.ts` files (using `tsx` or `eval` if necessary for local scripts).
  - [x] Update `logParsers/index.ts` to check the plugin directory if an agent is not found in the built-in list.
  - [x] Create a `PluginManifest` or ensure the export from the plugin matches the `BaseParser` interface.
  - [x] Verify by creating a mock "dummy-agent" plugin and running `agentfoundry recommend`.
- [x] **Phase 2: Contributor Documentation**
  - [x] Create `CONTRIBUTING_ADAPTERS.md`.
  - [x] Add a "Submit an Adapter" section to the root `README.md`.
- [x] **Phase 3: Launch Prep**
  - [x] Finalize root `README.md` with screenshots of the new Bento UI.
  - [x] Polish the `install.sh` script for zero-setup installation.

## Week 9 — Team Mode & PostgreSQL Integration ✅
- [x] **Phase 1: Infrastructure Overhaul**
  - [x] Update `docker-compose.yml`: Remove deprecated NestJS/Python services, retain PostgreSQL.
- [x] **Phase 2: Database Migration**
  - [x] Switch `schema.prisma` datasource to `postgresql`.
  - [x] Add `User`, `Team`, and `Membership` models to support multi-user data isolation.
  - [x] Link `AgentSession` to `User` and `Team`.
- [x] **Phase 3: Authentication Foundation**
  - [x] Integrate **Supabase Auth** logic into `packages/web` (null-safe for solo mode).
- [x] **Phase 4: Multi-Tenant Data Logic**
  - [x] Update `StatsService` and `RecommendationService` to filter data by `teamId`.
  - [x] Update CLI commands (`stats`, `costs`, `history`, `recommend`) to support team/user filtering.
- [x] **Phase 5: Team UI & Final Validation**
  - [x] Implement `UserProfile` and `TeamSwitcher` components in the Sidebar.
  - [x] Update dashboard pages to use the active `teamId` from the context.
  - [x] Run full workspace Next.js build (`pnpm build`).
  - [x] Ensure all monorepo tests pass.
- [x] **Phase 6: Local-First Team Management UI (Zero-Setup Compatible)**
  - [x] Implement local SQLite-backed "Profile Switcher" (no Supabase/Cloud Auth required).
  - [x] Update `AuthContext.tsx` to fetch local users/teams from the local API instead of a cloud provider.
  - [x] Create `/teams` page to create local teams and users inside SQLite.
  - [x] Update `SidebarProfile.tsx` to handle switching between local profiles dynamically.
  - [x] Write Vitest specs for `AuthContext` to ensure the default local user is always loaded (Note: Fixed pnpm symlink double-React issue using Vitest resolve.dedupe).
  - [x] Run full workspace test suite `pnpm test` to verify Zero-Setup promise holds (Note: All core logic and AuthContext tests pass).
## Week 10 — Multi-Agent Swarm Orchestration 🐝
- [x] **Phase 1: Concurrent Session Logic (SwarmManager)**
  - [x] Create `SwarmManager.ts` to track overlapping agent PIDs.
  - [x] Implement "Global Base" snapshot logic for swarm starts.
  - [x] Add session "merging" and attribution logic for concurrent file edits.
  - [x] Write unit tests for `SwarmManager` (`swarmManager.test.ts`).
- [x] **Phase 2: Watch Daemon Refactoring**
  - [x] Refactor `watch.ts` to use `SwarmManager`.
  - [x] Implement non-blocking parallel quality check runs (via `QualityQueue`).
  - [x] Update terminal UI to support concurrent agent status displays.
- [x] **Phase 3: Dashboard Swarm Visualization**
  - [x] Add `swarmId` to Prisma schema and run migrations.
  - [x] Update Dashboard "History" page to group sessions by `swarmId`.
  - [x] Create a "Swarm View" showing live activity of all agents in the team.
- [x] **Phase 4: Benchmarking Engine 📊**
  - [x] Add `benchmarkId` to `AgentSession` in Prisma schema and run migration.
  - [x] Implement `restoreState` in `GitIntegration` to allow reverting changes between benchmark runs.
  - [x] Create `BenchmarkService.ts` to orchestrate multi-agent runs on a single task.
  - [x] Implement `agentfoundry benchmark` CLI command with comparison reporting.
  - [x] Write unit tests for `BenchmarkService`.

## Week 11 — Benchmarking Dashboard & Visualizations
- [x] **Phase 1: Leaderboard UI**
  - [x] Create a "Benchmark Leaderboard" in the web dashboard.
  - [x] Implement group-by-task visualization to compare agent effectiveness.
- [x] **Phase 2: Agent Recommendations Visualizations**
  - [x] Expose taskType in benchmark queries.
  - [x] Add Benchmark Evidence to the Insights page.
  - [x] Visualize head-to-head matchups for recommended agents.

## Week 12+ — Closed-Loop Prompt Optimization ✅
- [x] **Phase 1: Self-Improving Workflow**
  - [x] Implement logic to analyze TokenYield and ZeroShot metrics (with Trend Analysis for Degradation).
  - [x] Automatically rewrite and optimize the workspace's `tasks/lessons.md` based on performance, wiring all agent instruction files.

## Week 13 — Multi-Model & Reasoning Costing (2026 Frontier Update) ✅
- [x] **Phase 1: Granular Token Tracking**
  - [x] Update `types.ts` to support `UsageBreakdown` (model-specific usage in a single session).
  - [x] Implement `AmpParser.ts` to extract model-switching data from proprietary JSON logs.
- [x] **Phase 2: Reasoning-Based Pricing**
  - [x] Upgrade `pricingConfig.ts` to support 2026 frontier models (GPT 5.4, Codex 5.3, Sonnet 4.6, Opus 4.6).
  - [x] Implement "Reasoning Effort" classification (`low`, `medium`, `high`) and apply cost multipliers for deep-thinking sessions.
- [x] **Phase 3: Real DB Validation**
  - [x] Add `logParser_multiModel.test.ts` following the "Real DB" testing standard.
  - [x] Verify persistence of model-specific breakdowns and reasoning metrics in SQLite.
  - [x] Synchronize all core tests (`logParser.test.ts`, `pricingConfig.test.ts`) with 2026 model lineup.
