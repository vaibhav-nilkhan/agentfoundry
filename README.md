# AgentFoundry

> **The GitHub + App Store for AI Agents**

Build, validate, and publish reusable AI Skills that work seamlessly across Anthropic Claude, OpenAI GPT, and open-source models.

---

## 🎯 Vision

AgentFoundry is the first platform that unifies agent Skill creation, validation, and monetization across all ecosystems. It acts as:

- **Developer Infrastructure** (like GitHub + AWS Lambda): Build and test portable Skills with a common SDK
- **Validation Engine** (like npm audit + App Store Review): Automated verification for logic, safety, and permissions
- **Marketplace** (like App Store + Hugging Face): Publish, discover, and monetize Skills under verified trust guarantees
- **Cross-Platform Bridge** (like Zapier for Agents): Integrate once, deploy anywhere — Claude, GPT, MCP, Mistral

## 🚀 Core Innovation

**"Write once, validate once, run anywhere"** — the world's first portability and trust framework for AI agent Skills.

---

## 📦 Project Structure

This is a monorepo containing all AgentFoundry packages:

```
agentfoundry/
├── packages/
│   ├── web/              # Next.js 15 frontend (marketplace UI)
│   ├── api/              # Express.js backend API
│   ├── validator/        # Python/FastAPI validation microservice
│   ├── sdk/              # TypeScript SDK for Skill developers
│   ├── cli/              # CLI tool for Skill development
│   ├── db/               # Prisma database schema
│   └── shared/           # Shared types and utilities
├── package.json          # Root workspace configuration
├── turbo.json            # Turborepo configuration
└── README.md             # This file
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, Tailwind CSS, shadcn/ui |
| **Backend API** | NestJS, TypeScript, OpenAPI/Swagger |
| **Database** | PostgreSQL 15 (self-hosted), Prisma ORM |
| **Validator** | Python, FastAPI, AST parsing |
| **Auth** | Supabase Auth (open-source) |
| **Cache** | Redis |
| **Hosting** | Vercel (frontend), Railway (backend/validator) |

## 🏁 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Python 3.11+
- PostgreSQL 15+
- Redis

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/agentfoundry.git
cd agentfoundry

# Install dependencies
pnpm install

# Set up environment variables
cp packages/web/.env.example packages/web/.env.local
cp packages/api/.env.example packages/api/.env
cp packages/validator/.env.example packages/validator/.env

# ⚠️ IMPORTANT: Configure ports to avoid conflicts
# Edit .env files and change PORT values if you're running other projects
# See PORT_CONFIGURATION.md for detailed guide

# Set up database
cd packages/db
pnpm prisma migrate dev
pnpm prisma db seed

# Install Python dependencies
cd ../validator
poetry install
```

### Development

Run all services in development mode:

```bash
# From root directory
pnpm dev
```

Or run services individually:

```bash
# Frontend (http://localhost:3100 by default, configurable via PORT env var)
pnpm --filter @agentfoundry/web dev

# API (http://localhost:4100 by default, configurable via PORT env var)
pnpm --filter @agentfoundry/api dev

# Swagger API Docs (http://localhost:4100/api/docs)
# Available once API is running

# Validator (http://localhost:5100 by default, configurable via PORT env var)
cd packages/validator && poetry run uvicorn app.main:app --reload

# Prisma Studio (http://localhost:5555, use --port flag to change)
pnpm --filter @agentfoundry/db studio
```

> **💡 Port Conflicts?** See [PORT_CONFIGURATION.md](./PORT_CONFIGURATION.md) for how to customize all ports.

## 📚 Documentation

### 🚀 Getting Started
- **[Getting Started Guide](./docs/guides/getting-started.md)** - Complete developer onboarding and setup
- **[Skill Format Specification](./docs/architecture/skill-format-spec.md)** - Canonical Skill format (skill.yaml, testing, security)
- **[MCP Integration Guide](./docs/guides/mcp-integration.md)** - Model Context Protocol implementation

### 📋 Planning & Roadmap
- **[Execution Roadmap](./docs/planning/execution-roadmap.md)** - 90-day strategic roadmap with critical decisions
- **[2-Week Sprint Plan](./docs/planning/2-week-sprint.md)** - Day-by-day action plan to MVP alpha
- **[Documentation Hub](./docs/README.md)** - Central documentation index

### 🏗️ Architecture
- **[Architecture Overview](./ARCHITECTURE.md)** - System architecture and design decisions
- **[Port Configuration](./PORT_CONFIGURATION.md)** - Multi-project port management guide
- **[Migration Guide](./MIGRATION.md)** - Express.js → NestJS migration notes

---

## 📚 Package Documentation

### [@agentfoundry/web](./packages/web)
Next.js frontend with marketplace UI, Supabase authentication, and Skill discovery.

### [@agentfoundry/api](./packages/api)
NestJS REST API with OpenAPI/Swagger docs, handling Skills, users, and authentication.

### [@agentfoundry/validator](./packages/validator)
Python microservice for static analysis, permission scanning, and security validation.

### [@agentfoundry/sdk](./packages/sdk)
TypeScript SDK for building cross-platform AI Skills.

```typescript
import { SkillBuilder, Platform } from '@agentfoundry/sdk';

const skill = new SkillBuilder()
  .name('Weather Forecast')
  .version('1.0.0')
  .description('Get weather forecasts')
  .platforms(Platform.MCP, Platform.CLAUDE_SKILLS)
  .build();
```

### [@agentfoundry/cli](./packages/cli)
Command-line tool for Skill development workflow.

```bash
# Initialize a new Skill
agentfoundry init

# Validate a Skill
agentfoundry validate

# Publish to marketplace
agentfoundry publish
```

### [@agentfoundry/db](./packages/db)
Prisma schema and database client with models for Skills, Users, Reviews, and Validation.

### [@agentfoundry/shared](./packages/shared)
Shared TypeScript types, constants, and utilities used across packages.

## 🗄️ Database Schema

Key models:

- **User**: Firebase-linked users with reputation scores
- **Skill**: Core entity with versioning, validation status, and platform compatibility
- **SkillVersion**: Version history tracking
- **ValidationResult**: Automated validation results
- **Review**: User reviews and ratings
- **SkillUsage**: Telemetry and analytics

## 🔐 Authentication

Firebase Authentication with Email + Google login (Spark plan - free tier).

Configuration in `packages/web/src/lib/firebase.ts` and `packages/api/src/utils/firebase-admin.ts`.

## 🧪 Validation Pipeline

Skills undergo multi-stage validation:

1. **Static Analysis**: AST parsing for syntax and dangerous patterns
2. **Permission Scanning**: Validates declared vs actual permissions
3. **Security Scanning**: Detects SQL injection, command injection, hardcoded secrets
4. **Safety Scoring**: 0-100 score based on issues found

## 📊 Development Workflow

```bash
# 1. Make changes to any package
# 2. Build all packages
pnpm build

# 3. Run tests
pnpm test

# 4. Lint and format
pnpm lint
pnpm format

# 5. Clean build artifacts
pnpm clean
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd packages/web
vercel --prod
```

### Backend (Railway)
```bash
# API and Validator deployed as separate Railway services
# Connect to GitHub and deploy from packages/api and packages/validator
```

### Database (Railway PostgreSQL)
```bash
# Provision PostgreSQL addon in Railway
# Run migrations
pnpm --filter @agentfoundry/db migrate:deploy
```

## 🎯 Quick Start with AgentFoundry CLI

```bash
# Create a new Skill
agentforge create my-skill --template=basic

# Validate a Skill
agentforge validate

# Run Skill as MCP server (works with Claude Desktop)
agentforge mcp ./my-skill

# Publish to marketplace
agentforge publish
```

See the [Getting Started Guide](./docs/guides/getting-started.md) for detailed instructions.

---

## 🗺️ Roadmap

See [Execution Roadmap](./docs/planning/execution-roadmap.md) for detailed 90-day plan.

### Week 1-2: Foundation ✅
- ✅ Monorepo setup (Turborepo + 7 packages)
- ✅ NestJS backend with OpenAPI/Swagger
- ✅ Supabase Auth integration
- ✅ Skill format specification
- ✅ MCP integration guide
- 🚧 Build 20 production Skills

### Week 3-6: Core MVP
- 🚧 Marketplace UI (browse, search, filter)
- 🚧 Skill validation pipeline
- 🚧 MCP adapter implementation
- 🚧 CLI install command

### Week 7-10: Private Alpha
- 20-30 design partners
- Alpha feedback loop
- Rapid iteration

### Months 3-6: Public Beta
- Product Hunt launch
- Cross-platform support (Claude Skills, OpenAI Agents)
- Enterprise features
- $500K-$1M ARR target

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🔗 Links

- **Website**: https://agentfoundry.ai (coming soon)
- **Documentation**: https://docs.agentfoundry.ai (coming soon)
- **Discord**: https://discord.gg/agentfoundry (coming soon)

## 🙏 Acknowledgments

Built with support from the MCP community and inspired by npm, GitHub, and the App Store.

---

**Status**: MVP in Development | **Version**: 0.1.0 | **Last Updated**: 2025-11-08
