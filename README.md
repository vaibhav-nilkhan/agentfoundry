# AgentFoundry V2
> **The Fitbit for AI Coding Agents**

Track every AI coding agent you use. See costs, quality, and performance — all in one dashboard.

---

## 🎯 Vision

Developers in 2026 use 2-4 AI coding agents daily (Claude Code, Codex, Cursor, Gemini CLI) but have:
- **No visibility** into total costs across agents
- **No data** on which agent performs best for which tasks
- **No history** of what agents did, when, and how well
- **No way to optimize** — they pick agents by gut feeling, not data

**AgentFoundry** is an open-source developer tool that runs passively in the background to track, analyze, and optimize how you use AI coding agents.

## 🚀 Core Features (Phase 1 MVP)

### 1. Background Agent Monitoring
```bash
agentfoundry watch
```
Runs as a lightweight background daemon that detects when Claude Code, Codex, or Gemini CLI is launched. Records start time, end time, and takes Git snapshots before/after the agent runs. **Zero friction — don't change your workflow.**

### 2. Cost Tracking
Automatically reads token usage from local agent logs and calculates costs using community-maintained pricing configurations. See your aggregated spend per-task, per-day, and per-agent.

### 3. Quality Tracking (Coming Soon)
After each session, automatically runs:
- `git diff` to see lines added/removed/modified
- Test suite (if configured)
- Linter (if configured)
Stores quality data per session to see which agent introduces the most bugs.

### 4. CLI Reports
```bash
agentfoundry stats                    # Quick summary
agentfoundry stats --agent claude     # Claude-specific
agentfoundry costs                    # Cost breakdown
agentfoundry history                  # Task history
```

## 📦 Project Architecture

```
agentfoundry/
├── packages/
│   ├── web/              # Next.js Dashboard (Under Construction)
│   ├── cli/              # CLI tool for the background daemon
│   ├── api/              # NestJS Backend API
│   ├── db/               # Prisma Database Schema (SQLite for local, PG for team)
│   ├── shared/           # Shared types
│   ├── mcp-adapter/      # Model Context Protocol integrations for agent detection
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **CLI/Daemon**: Node.js, TypeScript
- **Frontend**: Next.js 15, Tailwind CSS
- **Backend API**: NestJS
- **Database**: SQLite (Local MVP), Prisma ORM

## 🏁 Getting Started (Development)

Requires Node 20+, pnpm 8+.

```bash
git clone https://github.com/vaibhav-nilkhan/agentfoundry.git
cd agentfoundry

pnpm install
```

### Running the Phase 1 MVP

1. **Initialize the local tracking database:**
   ```bash
   cd packages/db
   pnpm prisma db push
   ```

2. **Start the Tracker Daemon:**
   *(Coming soon in the next sprint!)*

---

**Status**: Pivoting to V2 | **License**: MIT | **Last Updated**: 2026-03-07
