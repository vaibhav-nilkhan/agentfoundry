# AgentFoundry Setup Guide

Complete guide for setting up the AgentFoundry V2 development environment. Built for absolute simplicity using local SQLite.

## Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm**: v8.0.0 or higher
  ```bash
  npm install -g pnpm
  ```

*No Python, PostgreSQL, or Redis required for the Solo-First architecture!*

## Step-by-Step Setup

### 1. Clone Repository

```bash
git clone https://github.com/vaibhav-nilkhan/agentfoundry.git
cd agentfoundry
```

### 2. Install Dependencies

```bash
# Install all packages in the monorepo
pnpm install
```

This will install dependencies for:
- `@agentfoundry/web` (Next.js Dashboard)
- `@agentfoundry/cli` (Background Daemon)
- `@agentfoundry/db` (Prisma & SQLite)
- `@agentfoundry/mcp-adapter` (Agent parsers)
- `@agentfoundry/sdk`
- `@agentfoundry/shared`

### 3. Initialize the SQLite Database

```bash
# Generate the Prisma client and push the schema to create `dev.db`
npx pnpm --filter @agentfoundry/db build
npx pnpm --filter @agentfoundry/db prisma db push
```

### 4. Build All Packages (Optional but Recommended)

```bash
# From root directory
pnpm build
```

This will build all packages in dependency order using Turborepo.

### 5. Start Development Servers

Open **2 terminal windows**:

#### Terminal 1: Background Tracker (CLI)
```bash
# This daemon watches for agent processes and parses their logs
pnpm --filter @agentfoundry/cli start watch
```

#### Terminal 2: Web Dashboard
```bash
# This starts the Next.js visual dashboard
pnpm --filter @agentfoundry/web dev
# Runs on http://localhost:3000
```

#### Terminal 3: Database Studio (Optional)
```bash
pnpm --filter @agentfoundry/db studio
# Runs on http://localhost:5555 to visually inspect your SQLite DB
```

## Verify Installation

### 1. Test CLI

```bash
# Quick stats output
pnpm --filter @agentfoundry/cli start stats
```

### 2. Test Frontend

Open browser to `http://localhost:3000`

You should see the AgentFoundry V2 Bento dashboard.

## Development Tools

### Recommended VSCode Extensions

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense

### Useful Commands

```bash
# Clean all build artifacts
pnpm clean

# Format all code
pnpm format

# Run all tests (Vitest)
pnpm test
```

## Team Mode (Advanced)

If you intend to run AgentFoundry in **Team Mode** across multiple developers in an organization, you can easily swap the database provider:
1. Open `packages/db/prisma/schema.prisma`
2. Change the provider from `"sqlite"` to `"postgresql"`
3. Update `packages/db/.env` with your Postgres URL.
4. Uncomment the `db` service in `docker-compose.yml`.

> Note: For 99% of users and open-source contributors, the default SQLite setup is recommended.

## Next Steps

1. Read [docs/PRD.md](./docs/PRD.md) to understand the V2 system goals.
2. Read [docs/CONTRIBUTING_ADAPTERS.md](./docs/CONTRIBUTING_ADAPTERS.md) to learn how to add support for new AI agents.
3. Try making a few changes with Claude Code in your terminal, then check your Dashboard!

---

**Happy Tracking!** 🚀
