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
- [ ] **Remaining**: Split `logParser.ts` (472 lines) into base + per-agent files (exceeds 300-line limit)

## Week 3 — Quality Checks (NOT STARTED)
- [ ] Run test suite after agent sessions
- [ ] Linter check after agent sessions
- [ ] Build check after agent sessions
- [ ] Store results in `QualityMetrics` table
- [ ] Auto-classify task type from changed files

## Week 4 — CLI Reports (NOT STARTED)
- [ ] `agentfoundry stats` command
- [ ] `agentfoundry costs` command
- [ ] `agentfoundry history` command
- [ ] Formatted terminal output with tables

## Week 5 — Web Dashboard (NOT STARTED)
- [ ] Overview page (costs, tasks, agent breakdown)
- [ ] Costs page (trends, comparisons)
- [ ] Performance page (test pass rates, build success)
- [ ] History page (session table with filters)
