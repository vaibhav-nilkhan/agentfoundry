# AgentFoundry V2
> **The "Fitbit" for AI Coding Agents**

Track every AI coding agent you use. See costs, quality, and performance — all in one premium dashboard. Built for solo developers who want to stop guessing and start measuring.

---

## 🎯 Vision

Developers in 2026 use multiple AI coding agents (Claude Code, Codex, Cursor, Gemini CLI) daily but have zero visibility into their actual performance. **AgentFoundry** is an open-source tool that runs passively in the background to monitor, analyze, and optimize your agent usage.

## 🚀 Core Features

### 1. Zero-Friction Monitoring
Runs as a lightweight background daemon (`agentfoundry watch`) that automatically detects when you launch Claude, Codex, or Gemini. It captures Git snapshots before and after every run without you changing a single line of your workflow.

### 2. Deep Cost Analysis
Automatically parses local agent logs to calculate exact USD spend. See your aggregated costs per-task, per-day, and per-agent in high-resolution detail.

### 3. "Karpathy" Efficiency Metrics
Go beyond pass/fail. AgentFoundry tracks:
- **Token-to-Code Yield**: Measures "thrashing" (how many tokens were burned vs. net lines changed).
- **Zero-Shot Success Rate**: Identifies which agents solve problems perfectly on the first try.
- **Blast Radius**: Tracks how surgical (or sprawling) an agent's changes are.

### 4. Agent Recommendation Engine
Using your historical SQLite data, AgentFoundry recommends the best agent for your current task:
`$ agentfoundry recommend --task frontend`
> *"Verdict: Use Claude Code. It has a 95% pass rate for frontend tasks in this repo."*

### 5. Premium Bento UI Dashboard
A high-performance Next.js 15 dashboard featuring a "God Tier" Bento Grid aesthetic, glowing status indicators, and real-time telemetry updates.

## 📦 Architecture

- **CLI/Daemon**: Node.js & TypeScript
- **Web Dashboard**: Next.js 15 (App Router) & Framer Motion
- **Database**: SQLite (Zero-setup local-first)
- **ORM**: Prisma

## 🏁 Getting Started

### 1. Installation
```bash
git clone https://github.com/vaibhav-nilkhan/agentfoundry.git
cd agentfoundry
pnpm install
```

### 2. Setup Database
```bash
npx pnpm --filter @agentfoundry/db build
npx pnpm --filter @agentfoundry/db prisma db push
```

### 3. Start Tracking
```bash
# Start the background daemon
npx pnpm --filter @agentfoundry/cli start watch

# Open the visual dashboard
npx pnpm --filter @agentfoundry/web dev
```

## 🔌 Community Plugins
AgentFoundry is extensible! You can build your own adapters for new agents (e.g. Cursor, Windsurf) by adding a simple JavaScript file to `~/.agentfoundry/plugins`.

See the [Contributor Guide for Adapters](./docs/CONTRIBUTING_ADAPTERS.md).

---

**License**: MIT | **Status**: Phase 1 & 2 Complete | Phase 3: Week 9-11 Done | Current: Week 12 (Closed-Loop Prompt Optimization)
