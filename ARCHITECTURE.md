# AgentFoundry Architecture (V2)

## System Overview

AgentFoundry is an open-source "Fitbit for coding agents" designed to track costs, quality, and performance of AI agents locally.

```
┌─────────────────────────────────────────────────────────────┐
│                      Developer Workspace                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Claude Code  │  │    Codex     │  │  Gemini CLI  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌──────────────────────────────────────────────────────────────┐
│                  AgentFoundry Watch (Daemon)                 │
│      • Process Monitor  • Git Watcher  • Log Parser          │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                   Data & Presentation Layer                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │   SQLite DB     │  │   Next.js 15    │  │     CLI      │  │
│  │ (Local First)   │  │ (Dash & API)    │  │ (Reports)    │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Presentation Layer (`@agentfoundry/web`)

**Technology**: Next.js 15 (App Router), React 18, Tailwind CSS, Framer Motion (Bento UI)

**Responsibilities**:
- Local Dashboard for visualizing agent performance
- Cost analysis and trend visualization
- Efficiency metrics (Token Yield, Zero-Shot success)
- Agent Recommendation Engine (Data-driven selection)

### 2. Monitoring Layer (`@agentfoundry/cli`)

**Technology**: Node.js, Commander.js

**Responsibilities**:
- `watch` daemon: Passively monitors agent processes and Git diffs
- Log Parsers: Modular system for reading Claude, Codex, and Gemini logs
- `stats`/`costs`/`history`: CLI reporting tools
- `recommend`: Suggests the best agent for a task based on historical performance

### 3. Data Layer (`@agentfoundry/db`)

**Technology**: SQLite, Prisma ORM

**Key Models**:
- `AgentSession`: Core record of an agent run
- `CostRecord`: Token usage and USD cost data
- `QualityMetrics`: Test results, lint issues, and build status
- `GitSnapshot`: File changes and line diffs

### 4. Logic & Services

- **RecommendationService**: Weighted scoring engine (PassRate + TokenYield + Cost)
- **QualityChecker**: Automated validation runner (tests/lint/build)
- **TaskClassifier**: Heuristic-based classification (e.g., frontend vs backend)

## Data Flow

```
1. Developer runs agent ($ claude "fix bug")
2. AF Watch detects process and snapshots Git state
3. Agent finishes → AF Watch snapshots final Git state
4. Log Parsers extract token usage and costs
5. QualityChecker runs tests and updates metrics
6. All data persisted to local SQLite db
7. Developer views insights in CLI or Web Dashboard
```

## Technology Choices

| Decision | Technology | Rationale |
|----------|-----------|-----------|
| **Database** | SQLite | Zero-setup, local-first, perfect for solo developers |
| **Framework** | Next.js 15 | Unified frontend and API logic, modern React features |
| **Monorepo** | pnpm + Turbo | Fast builds, shared types across CLI and Web |
| **Styling** | Tailwind CSS | Rapid UI development for the Bento-style dashboard |

---
**Last Updated**: 2026-03-20 (V2 Pivot Complete)