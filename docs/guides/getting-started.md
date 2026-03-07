# Getting Started with AgentFoundry

> **The Fitbit for AI Coding Agents**

Welcome to AgentFoundry! This guide will help you set up your development environment and start contributing to the platform.

---

## 📚 Documentation Overview

AgentFoundry documentation is organized into three main sections:

### 🏗️ Architecture
- [Skill Format Specification](../architecture/skill-format-spec.md) - Define the canonical AgentFoundry Skill format

### 📖 Guides
- [MCP Integration Guide](./mcp-integration.md) - MCP integration architecture and implementation
- [Getting Started](./getting-started.md) - This guide

### 📋 Planning
- [Execution Roadmap](../planning/execution-roadmap.md) - Track progress against roadmap
- [2-Week Sprint Plan](../planning/2-week-sprint.md) - Detailed action plan for MVP

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and **pnpm** 8+
- **Python** 3.11+
- **PostgreSQL** 15+
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/[your-username]/agentfoundry.git
cd agentfoundry
```

### 2. Install Dependencies

```bash
# Install all packages
pnpm install

# Install Python dependencies for validator
cd packages/validator
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

### 3. Set Up Environment Variables

Create `.env` files for each package:

#### Frontend (`packages/web/.env`)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Port Configuration
PORT=3100
NEXT_PUBLIC_APP_URL=http://localhost:3100
NEXT_PUBLIC_API_URL=http://localhost:4100
NEXT_PUBLIC_VALIDATOR_URL=http://localhost:5100
```

#### Backend (`packages/api/.env`)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agentfoundry

# Port Configuration
PORT=4100
CORS_ORIGIN=http://localhost:3100
```

#### Validator (`packages/validator/.env`)
```env
PORT=5100
DATABASE_URL=postgresql://user:password@localhost:5432/agentfoundry
```

See [PORT_CONFIGURATION.md](../../PORT_CONFIGURATION.md) for detailed port management.

### 4. Set Up Database

```bash
cd packages/db
pnpm prisma migrate dev
pnpm prisma generate
cd ../..
```

### 5. Start Development Servers

```bash
# Start all services (frontend, backend, validator)
pnpm dev
```

Or start individually:

```bash
# Terminal 1 - Frontend (port 3100)
cd packages/web
pnpm dev

# Terminal 2 - Backend (port 4100)
cd packages/api
pnpm dev

# Terminal 3 - Validator (port 5100)
cd packages/validator
python -m uvicorn app.main:app --reload --port 5100
```

### 6. Access the Application

- **Frontend**: http://localhost:3100
- **Backend API**: http://localhost:4100/api/v1
- **API Docs**: http://localhost:4100/api/docs
- **Validator**: http://localhost:5100

---

## 📦 Monorepo Structure

```
agentfoundry/
├── packages/
│   ├── web/              # Next.js frontend
│   ├── api/              # NestJS backend
│   ├── validator/        # Python FastAPI validator
│   ├── sdk/              # TypeScript SDK
│   ├── cli/              # CLI tool
│   ├── db/               # Prisma database
│   └── shared/           # Shared types/utils
├── skills/
│   └── examples/         # Example Skills
├── docs/
│   ├── architecture/     # Architecture docs
│   ├── guides/           # User guides
│   └── planning/         # Planning docs
└── [config files]
```

---

## 🛠️ Development Workflow

### Creating a New Skill

1. **Create Skill directory**:
   ```bash
   mkdir -p skills/examples/my-skill/{src,tests,docs,examples}
   ```

2. **Create `skill.yaml` manifest**:
   ```json
   {
     "name": "my-skill",
     "version": "1.0.0",
     "description": "My awesome Skill",
     "platforms": ["MCP", "CLAUDE_SKILLS"],
     "permissions": ["network.http"],
     "tools": [...]
   }
   ```

3. **Create `SKILL.md` documentation**

4. **Implement in `src/main.py` or `src/main.ts`**

5. **Write tests in `tests/`**

See [Skill Format Specification](../architecture/skill-format-spec.md) for details.

### Running Tests

```bash
# Run all tests
pnpm test

# Test specific package
cd packages/web
pnpm test
```

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific package
cd packages/api
pnpm build
```

---

## 🔧 Troubleshooting

### Port Conflicts

If you're running multiple projects and experiencing port conflicts:

1. Edit `.env` files to change ports (e.g., 3200, 4200, 5200)
2. See [PORT_CONFIGURATION.md](../../PORT_CONFIGURATION.md) for detailed guide

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify `DATABASE_URL` in `.env` files
3. Run migrations: `pnpm prisma migrate dev`

### Supabase Auth Issues

1. Verify Supabase project URL and keys
2. Check CORS settings in Supabase dashboard
3. Ensure JWT secret is configured correctly

---

## 📚 Additional Resources

- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture overview
- [SETUP.md](../../SETUP.md) - Detailed setup instructions
- [MIGRATION.md](../../MIGRATION.md) - Migration guide (Express → NestJS)
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contribution guidelines

---

## 🆘 Getting Help

- **Documentation**: Check the `docs/` directory
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions for questions

---

**Ready to build the future of AI agents? Let's go! 🚀**
