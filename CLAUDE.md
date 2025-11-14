# CLAUDE.md - AI Assistant Guide for AgentFoundry

> **Last Updated**: 2025-11-14
> **Version**: 1.0.0
> **Purpose**: Comprehensive guide for AI assistants working with the AgentFoundry codebase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Tech Stack & Dependencies](#tech-stack--dependencies)
4. [Development Environment](#development-environment)
5. [Codebase Architecture](#codebase-architecture)
6. [Key Conventions](#key-conventions)
7. [Development Workflows](#development-workflows)
8. [Testing Guidelines](#testing-guidelines)
9. [Common Tasks](#common-tasks)
10. [Important Files & Directories](#important-files--directories)

---

## Project Overview

**AgentFoundry** is the GitHub + App Store for AI Agents - a unified platform for building, validating, and publishing reusable AI Skills that work seamlessly across Anthropic Claude, OpenAI GPT, and open-source models.

### Core Innovation
"Write once, validate once, run anywhere" — the world's first portability and trust framework for AI agent Skills.

### Project Type
- **Monorepo**: Uses Turborepo with pnpm workspaces
- **License**: MIT
- **Package Manager**: pnpm 8.14.0 (required)
- **Node Version**: >= 20.0.0 (required)
- **Python Version**: 3.11+ (for validator service)

### Key Features
1. **Developer Infrastructure**: Build and test portable Skills with a common SDK
2. **Validation Engine**: Automated verification for logic, safety, and permissions
3. **Marketplace**: Publish, discover, and monetize Skills
4. **Cross-Platform Bridge**: Integrate once, deploy anywhere (Claude, GPT, MCP, Mistral)

---

## Repository Structure

```
agentfoundry/
├── .git/                           # Git repository
├── .github/                        # GitHub workflows (if exists)
├── docs/                           # Documentation
│   ├── architecture/              # Architecture docs
│   ├── guides/                    # User guides
│   └── planning/                  # Planning docs
├── examples/                       # Example implementations
├── packages/                       # Monorepo packages
│   ├── web/                       # Next.js 15 frontend
│   ├── api/                       # NestJS backend API
│   ├── validator/                 # Python/FastAPI validation service
│   ├── sdk/                       # TypeScript SDK
│   ├── cli/                       # CLI tool
│   ├── db/                        # Prisma database schema
│   ├── shared/                    # Shared types/utilities
│   ├── mcp-adapter/              # MCP protocol adapter
│   └── api-express-backup/       # Backup of old Express API
├── skills/                         # Skills repository
│   ├── production/                # Production-ready skills
│   ├── templates/                 # Skill templates
│   ├── examples/                  # Example skills
│   └── SKILL_SPECIFICATION.md    # Skill format spec
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml            # pnpm workspace config
├── turbo.json                      # Turborepo config
├── tsconfig.json                   # Root TypeScript config
├── .eslintrc.json                 # ESLint config
├── .prettierrc                    # Prettier config
├── .gitignore                     # Git ignore rules
├── README.md                       # Main documentation
├── ARCHITECTURE.md                 # Architecture overview
├── CONTRIBUTING.md                 # Contribution guidelines
└── [other documentation files]
```

---

## Tech Stack & Dependencies

### Frontend (`packages/web/`)
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: react-hook-form + zod
- **Icons**: lucide-react
- **Auth**: Supabase (@supabase/supabase-js)
- **Port**: 3100 (default, configurable via PORT env var)

### Backend API (`packages/api/`)
- **Framework**: NestJS 10.3.0
- **Language**: TypeScript (strict mode)
- **API Docs**: OpenAPI/Swagger (available at `/api/docs`)
- **Auth**: Supabase Auth (JWT-based)
- **Database Client**: Prisma (via @agentfoundry/db)
- **Cache**: Redis 4.6.12
- **Testing**: Jest
- **Port**: 4100 (default, configurable via PORT env var)

### Validator Service (`packages/validator/`)
- **Framework**: Python FastAPI
- **Language**: Python 3.11+
- **Dependency Management**: Poetry
- **Purpose**: Static analysis, AST parsing, security scanning
- **Port**: 5100 (default, configurable via PORT env var)

### Database (`packages/db/`)
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Migration Tool**: Prisma Migrate
- **Models**: User, Skill, SkillVersion, ValidationResult, Review, SkillUsage

### SDK (`packages/sdk/`)
- **Language**: TypeScript
- **Purpose**: Fluent API for building Skills
- **Exports**: SkillBuilder, Platform adapters

### CLI (`packages/cli/`)
- **Language**: TypeScript/Node.js
- **Purpose**: Skill development workflow
- **Commands**: init, validate, publish, login

### Build & Dev Tools
- **Monorepo**: Turborepo 1.11.2
- **Package Manager**: pnpm 8.14.0
- **TypeScript**: 5.3.3
- **ESLint**: 8.56.0
- **Prettier**: 3.1.1

---

## Development Environment

### Prerequisites
```bash
# Required
- Node.js 20+
- pnpm 8+
- Python 3.11+
- PostgreSQL 15+
- Redis

# Recommended
- Docker (for containerized services)
- Git
```

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/agentfoundry.git
cd agentfoundry

# 2. Install Node dependencies
pnpm install

# 3. Set up environment variables
cp packages/web/.env.example packages/web/.env.local
cp packages/api/.env.example packages/api/.env
cp packages/validator/.env.example packages/validator/.env

# 4. Configure ports (if needed)
# Edit .env files to change PORT values
# See PORT_CONFIGURATION.md for details

# 5. Set up database
cd packages/db
pnpm prisma migrate dev
pnpm prisma db seed

# 6. Install Python dependencies
cd ../validator
poetry install
```

### Running Services

```bash
# Run all services in development mode
pnpm dev

# Or run individually:
pnpm --filter @agentfoundry/web dev        # Frontend
pnpm --filter @agentfoundry/api dev        # Backend API
pnpm --filter @agentfoundry/db studio      # Prisma Studio
cd packages/validator && poetry run uvicorn app.main:app --reload  # Validator

# Swagger API Docs available at:
# http://localhost:4100/api/docs
```

### Port Configuration

Default ports (configurable via environment variables):
- **Frontend**: 3100
- **API**: 4100
- **Validator**: 5100
- **Prisma Studio**: 5555 (use --port flag to change)

See `PORT_CONFIGURATION.md` for detailed port management.

---

## Codebase Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         Developer Tools Layer           │
│   CLI · SDK · Web IDE                   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         API Gateway (NestJS)            │
│   Auth · Routing · Business Logic       │
└──────────────┬──────────────────────────┘
               │
       ┌───────┼───────┐
       ▼       ▼       ▼
   ┌─────┐ ┌─────┐ ┌─────┐
   │ DB  │ │Valid│ │Adapt│
   │     │ │ator │ │ ers │
   └─────┘ └─────┘ └─────┘
```

### Database Schema (Prisma)

**Key Models**:
- `User`: Firebase-linked users with reputation scores
- `Skill`: Core entity with versioning, validation status, platform compatibility
- `SkillVersion`: Version history tracking
- `ValidationResult`: Automated validation results
- `Review`: User reviews and ratings (1-5 stars)
- `SkillUsage`: Telemetry and analytics

**Enums**:
- `SkillStatus`: PENDING, VALIDATING, APPROVED, REJECTED, DEPRECATED
- `Platform`: CLAUDE_SKILLS, GPT_ACTIONS, MCP, LANGCHAIN, MISTRAL
- `ValidationType`: STATIC_ANALYSIS, PERMISSION_SCAN, SECURITY_AUDIT, BEHAVIOR_TEST, LLM_VALIDATION
- `ValidationStatus`: PENDING, RUNNING, PASSED, FAILED, WARNING
- `PricingType`: FREE, PAID, FREEMIUM

### API Structure (`packages/api/src/`)

```
src/
├── main.ts                  # Application entry point
├── app.module.ts           # Root module
├── app.controller.ts       # Root controller
├── app.service.ts          # Root service
├── config/                 # Configuration files
├── common/                 # Shared utilities, guards, decorators
└── modules/                # Feature modules
    ├── auth/              # Authentication
    ├── skills/            # Skills management
    ├── users/             # User management
    └── validation/        # Validation orchestration
```

### Frontend Structure (`packages/web/src/`)

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── marketplace/       # Marketplace pages
│   ├── skill/[slug]/      # Skill detail pages
│   └── dashboard/         # Developer dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── [feature]/        # Feature-specific components
├── lib/                  # Utilities and configurations
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Helper functions
└── data/                 # Static data, constants
```

### Skill Format

Skills follow the MCP (Model Context Protocol) standard. See `skills/SKILL_SPECIFICATION.md` for complete details.

**Required Files**:
- `skill.yaml` - Manifest and metadata
- `README.md` - User documentation
- `src/index.ts` - Main entry point
- `src/tools/` - Tool implementations
- `tests/` - Test suites
- `package.json` - Dependencies

**Key Principles**:
- Deterministic: Same input → same output
- Self-contained: All dependencies declared
- Platform-agnostic: Works with MCP, Claude Skills, OpenAI Agents
- Well-tested: >80% code coverage required
- Documented: Clear examples and API docs

---

## Key Conventions

### Code Style

#### TypeScript
- **Strict Mode**: Always enabled
- **No `any`**: Use proper types or `unknown`
- **Naming**:
  - PascalCase for classes, interfaces, types, enums
  - camelCase for variables, functions, methods
  - UPPER_SNAKE_CASE for constants
  - kebab-case for file names
- **Imports**: Absolute imports preferred via workspace aliases
- **Error Handling**: Always use try-catch with meaningful error messages
- **Async/Await**: Preferred over promises

#### Python (Validator)
- **Style**: PEP 8
- **Type Hints**: Required for all functions
- **Docstrings**: Required for public functions
- **Async**: Use async/await for I/O operations

### File Naming

- **Components**: `ComponentName.tsx` (PascalCase)
- **Utilities**: `util-name.ts` (kebab-case)
- **Pages**: Next.js conventions (`page.tsx`, `layout.tsx`)
- **Tests**: `*.test.ts` or `*.spec.ts`
- **Config**: Lowercase with extensions (`.prettierrc`, `.eslintrc.json`)

### Git Conventions

#### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

#### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Test additions or updates
- `chore:` - Build process or tooling changes

**Examples**:
```
feat(sdk): add GPT adapter support
fix(validator): handle timeout edge cases
docs: update API setup guide
```

### Environment Variables

- **Never commit**: `.env` files are git-ignored
- **Use examples**: Provide `.env.example` templates
- **Document**: All env vars should be documented in README
- **Naming**: UPPER_SNAKE_CASE (e.g., `DATABASE_URL`, `GITHUB_TOKEN`)

---

## Development Workflows

### Common Development Commands

```bash
# Development
pnpm dev                              # Run all services
pnpm --filter @agentfoundry/web dev  # Run specific package
pnpm --filter @agentfoundry/api dev  # Run API only

# Building
pnpm build                           # Build all packages
pnpm --filter @agentfoundry/sdk build # Build specific package

# Testing
pnpm test                            # Run all tests
pnpm test -- --watch                 # Watch mode
pnpm --filter @agentfoundry/api test # Test specific package

# Code Quality
pnpm lint                            # Run linters
pnpm format                          # Format code with Prettier

# Database
pnpm db:migrate                      # Run migrations
pnpm db:studio                       # Open Prisma Studio

# Cleanup
pnpm clean                           # Remove build artifacts
```

### Adding a New Package

1. Create package directory under `packages/`
2. Add `package.json` with workspace dependencies
3. Update `pnpm-workspace.yaml` if needed
4. Add scripts to `turbo.json` pipeline
5. Install dependencies: `pnpm install`

### Adding Dependencies

```bash
# Add to root (shared devDependencies)
pnpm add -Dw <package>

# Add to specific package
pnpm --filter @agentfoundry/web add <package>

# Add workspace dependency
# In package.json:
"dependencies": {
  "@agentfoundry/shared": "workspace:*"
}
```

### Making Database Changes

```bash
# 1. Update schema in packages/db/prisma/schema.prisma
# 2. Create migration
cd packages/db
pnpm prisma migrate dev --name descriptive_migration_name

# 3. Generate Prisma Client
pnpm prisma generate

# 4. Update seed data if needed (packages/db/prisma/seed.ts)
```

### Validation Pipeline

Skills undergo multi-stage validation:

1. **Static Analysis**: AST parsing for syntax and dangerous patterns
2. **Permission Scanning**: Validates declared vs actual permissions
3. **Security Scanning**: SQL injection, command injection, hardcoded secrets
4. **Safety Scoring**: 0-100 score based on issues found

**Validator Service Location**: `packages/validator/`

---

## Testing Guidelines

### Test Structure

```bash
# Test files should be co-located with source
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── utils/
│   ├── helpers.ts
│   └── helpers.test.ts
```

### Testing Frameworks

- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest
- **E2E**: Playwright (if configured)

### Coverage Requirements

- **Minimum**: 80% line coverage
- **Recommended**: 90%+ line coverage
- **Required**: All public functions tested

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @agentfoundry/api test

# Watch mode
pnpm test -- --watch

# Coverage report
pnpm --filter @agentfoundry/api test:cov
```

### Writing Tests

**Example (TypeScript/Jest)**:
```typescript
import { run } from './example-tool';

describe('example-tool', () => {
  it('should return greeting message', async () => {
    const input = { name: 'World' };
    const result = await run(input);
    expect(result.message).toBe('Hello, World!');
  });

  it('should throw error for invalid input', async () => {
    const input = { name: 123 }; // Invalid type
    await expect(run(input as any)).rejects.toThrow();
  });
});
```

---

## Common Tasks

### 1. Creating a New Skill

```bash
# Use CLI (when available)
agentfoundry init my-new-skill --template=basic

# Or manually:
# 1. Copy template from skills/templates/
# 2. Update skill.yaml with metadata
# 3. Implement tools in src/tools/
# 4. Write tests in tests/
# 5. Validate
agentfoundry validate ./my-new-skill
```

### 2. Adding a New API Endpoint

```bash
# 1. Create/update module in packages/api/src/modules/
# 2. Add controller method with decorators
# 3. Add service method with business logic
# 4. Update DTOs and validation
# 5. Add OpenAPI/Swagger decorators
# 6. Write tests
# 7. Start API and check Swagger docs at /api/docs
```

**Example Controller**:
```typescript
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'List all skills' })
  async findAll(): Promise<Skill[]> {
    return this.skillsService.findAll();
  }
}
```

### 3. Adding a Frontend Page

```bash
# 1. Create page in packages/web/src/app/
# 2. Create layout.tsx if needed
# 3. Add components in src/components/
# 4. Add styling with Tailwind
# 5. Test locally with pnpm dev
```

### 4. Updating Database Schema

```bash
# 1. Edit packages/db/prisma/schema.prisma
# 2. Create migration
cd packages/db
pnpm prisma migrate dev --name add_new_field

# 3. Update TypeScript types (automatic with Prisma generate)
pnpm prisma generate

# 4. Update seed data if needed
# Edit packages/db/prisma/seed.ts
```

### 5. Running Prisma Studio

```bash
# View and edit database data visually
pnpm db:studio
# Opens at http://localhost:5555
```

### 6. Working with the Admin Panel

The admin panel is located at `/admin` and provides comprehensive platform management.

**Frontend Location**: `packages/web/src/app/admin/`
**Backend Location**: `packages/api/src/modules/admin/`

**Key Pages**:
- `/admin` - Dashboard with real-time metrics
- `/admin/users` - User management (roles, status)
- `/admin/skills` - Skill moderation (approve/reject)
- `/admin/subscriptions` - Subscription monitoring
- `/admin/analytics` - Revenue and growth charts

**Adding Admin Features**:
```bash
# 1. Create frontend page
touch packages/web/src/app/admin/feature/page.tsx

# 2. Add backend endpoint in packages/api/src/modules/admin/admin.controller.ts
@Get('feature')
@ApiOperation({ summary: 'Get feature data' })
async getFeatureData() {
  return this.adminService.getFeatureData();
}

# 3. Add service method in admin.service.ts
async getFeatureData() {
  return await this.prisma.feature.findMany();
}

# 4. Connect frontend to API
const response = await fetch(`${API_BASE_URL}/api/admin/feature`, {
  headers: { 'Content-Type': 'application/json' },
  cache: 'no-store',
});
```

**Security**:
- All admin endpoints use `@UseGuards(ApiKeyGuard, AdminGuard)`
- Only users with role `ADMIN` or `MODERATOR` can access
- See `packages/api/src/common/guards/admin.guard.ts`

**Documentation**: See [ADMIN_PANEL.md](./docs/ADMIN_PANEL.md) for complete API reference

---

## Important Files & Directories

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace config, scripts, devDependencies |
| `pnpm-workspace.yaml` | pnpm workspace configuration |
| `turbo.json` | Turborepo build pipeline configuration |
| `tsconfig.json` | Root TypeScript configuration |
| `.eslintrc.json` | ESLint configuration (extends prettier) |
| `.prettierrc` | Prettier formatting rules |
| `.gitignore` | Git ignore patterns |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation and getting started |
| `ARCHITECTURE.md` | System architecture and design decisions |
| `CONTRIBUTING.md` | Contribution guidelines and workflows |
| `SETUP.md` | Detailed setup instructions |
| `docs/ADMIN_PANEL.md` | Complete admin panel documentation and API reference |
| `PORT_CONFIGURATION.md` | Port management for multi-project development |
| `MIGRATION.md` | Express.js → NestJS migration notes |
| `skills/SKILL_SPECIFICATION.md` | Canonical Skill format specification |

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `packages/web/` | Next.js frontend application |
| `packages/api/` | NestJS backend API |
| `packages/validator/` | Python validation microservice |
| `packages/db/` | Prisma schema and database utilities |
| `packages/sdk/` | TypeScript SDK for Skill developers |
| `packages/cli/` | CLI tool for Skill development |
| `packages/shared/` | Shared types and utilities |
| `skills/production/` | Production-ready Skills |
| `skills/templates/` | Skill templates |
| `docs/` | Additional documentation |

### Important Package Files

**API (`packages/api/`)**:
- `src/main.ts` - Application bootstrap
- `src/app.module.ts` - Root module with all imports
- `src/modules/` - Feature modules (auth, skills, users, validation, admin)
- `src/modules/admin/` - Admin panel backend (dashboard, users, skills, subscriptions)
- `src/common/guards/` - Security guards (ApiKeyGuard, AdminGuard)

**Web (`packages/web/`)**:
- `src/app/page.tsx` - Homepage
- `src/app/admin/` - Admin panel frontend (dashboard, users, skills, analytics)
- `src/lib/supabase.ts` - Supabase client configuration
- `tailwind.config.js` - Tailwind CSS configuration

**Database (`packages/db/`)**:
- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Database seed data

---

## Special Notes for AI Assistants

### When Working with This Codebase

1. **Always check existing patterns**: Look at similar files before creating new ones
2. **Follow monorepo structure**: Use workspace dependencies (`workspace:*`)
3. **Respect TypeScript strict mode**: No `any` types unless absolutely necessary
4. **Update tests**: Always write/update tests when modifying code
5. **Check Swagger docs**: API changes should reflect in OpenAPI documentation
6. **Validate Skills**: Use the validator service to check Skill compliance
7. **Environment variables**: Never hardcode secrets, use env vars
8. **Port conflicts**: Be aware of port configuration (see PORT_CONFIGURATION.md)

### Common Pitfalls to Avoid

1. ❌ **Don't** install dependencies at root without `-Dw` flag
2. ❌ **Don't** use `npm` or `yarn` - always use `pnpm`
3. ❌ **Don't** modify `pnpm-lock.yaml` manually
4. ❌ **Don't** commit `.env` files
5. ❌ **Don't** use relative imports across packages
6. ❌ **Don't** skip TypeScript compilation checks
7. ❌ **Don't** ignore Prisma schema changes - always migrate

### Best Practices

1. ✅ **Do** use workspace dependencies for internal packages
2. ✅ **Do** run `pnpm format` before committing
3. ✅ **Do** write descriptive commit messages
4. ✅ **Do** add JSDoc comments for public APIs
5. ✅ **Do** validate inputs with Zod or class-validator
6. ✅ **Do** handle errors gracefully with try-catch
7. ✅ **Do** use semantic versioning for Skills
8. ✅ **Do** update documentation when changing APIs

### Quick Reference Commands

```bash
# Most commonly used commands for AI assistants:
pnpm install                          # Install all dependencies
pnpm dev                              # Start all services
pnpm build                            # Build all packages
pnpm test                             # Run all tests
pnpm lint                             # Check code quality
pnpm format                           # Format code
pnpm db:migrate                       # Run database migrations
pnpm db:studio                        # Open database GUI

# Package-specific:
pnpm --filter @agentfoundry/api dev   # Run API only
pnpm --filter @agentfoundry/web build # Build frontend only
```

---

## Additional Resources

- **Main README**: `README.md` - Getting started guide
- **Architecture**: `ARCHITECTURE.md` - System design and tech decisions
- **Contributing**: `CONTRIBUTING.md` - How to contribute
- **Skill Spec**: `skills/SKILL_SPECIFICATION.md` - Skill format details
- **API Docs**: http://localhost:4100/api/docs (when API is running)

---

## Questions or Issues?

- Open a GitHub Discussion for questions
- File a GitHub Issue for bugs
- See CONTRIBUTING.md for contribution process

---

**End of CLAUDE.md**
