# Getting Started with AgentFoundry V2

> **The Fitbit for AI Coding Agents**

Welcome to AgentFoundry! This guide will help you set up your development environment and start tracking your AI agents immediately. AgentFoundry V2 is designed to be **Zero-Setup and Local-First**.

---

## 🚀 Quick Start (Solo Mode)

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ 
- **pnpm** 8+
- **Git**

*Note: No database server (like PostgreSQL) is required. AgentFoundry uses a local SQLite database by default.*

### 1. Clone the Repository

```bash
git clone https://github.com/vaibhav-nilkhan/agentfoundry.git
cd agentfoundry
```

### 2. Install Dependencies

```bash
# Install all packages in the Turborepo
pnpm install
```

### 3. Set Up Local Database

AgentFoundry uses Prisma with SQLite for zero-setup tracking.

```bash
npx pnpm --filter @agentfoundry/db build
npx pnpm --filter @agentfoundry/db prisma db push
```
This creates a `dev.db` SQLite file inside `packages/db/prisma/`.

### 4. Start Tracking

You need two things running to use AgentFoundry: the background tracker and the dashboard.

Open two separate terminals:

**Terminal 1: Start the Background Daemon**
```bash
npx pnpm --filter @agentfoundry/cli start watch
```
*(This passively watches for Claude Code, Codex, or Gemini CLI sessions and records them + git diffs)*

**Terminal 2: Start the Web Dashboard**
```bash
npx pnpm --filter @agentfoundry/web dev
```
*(This opens the Next.js Bento dashboard at http://localhost:3000)*

---

## 📦 Architecture

```
agentfoundry/
├── packages/
│   ├── web/              # Next.js 15 App Router (Dashboard)
│   ├── cli/              # Node.js Background Daemon & CLI Tools
│   ├── db/               # Prisma schema & SQLite database
│   ├── mcp-adapter/      # Log parsing and agent detection
│   ├── sdk/              # Agent adapter SDK
│   └── shared/           # Shared types and utility functions
└── docs/                 # Documentation
```

## 🔌 Building an Agent Plugin

Want to track an agent that isn't supported yet (like Cursor or Windsurf)?
You can drop a JavaScript adapter into `~/.agentfoundry/plugins/`.

See the [Contributor Guide for Adapters](../CONTRIBUTING_ADAPTERS.md) for full instructions.

---

## 🔧 Troubleshooting

### Prisma Database Errors
If you see errors about the database not being found or out of sync:
```bash
npx pnpm --filter @agentfoundry/db prisma generate
npx pnpm --filter @agentfoundry/db prisma db push
```

### Next.js Cache Issues
If the dashboard looks broken, clear the `.next` cache:
```bash
rm -rf packages/web/.next
npx pnpm --filter @agentfoundry/web dev
```
