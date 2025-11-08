# AgentFoundry Architecture

## System Overview

AgentFoundry is a multi-tier platform designed for building, validating, and distributing AI agent Skills across multiple LLM platforms.

```
┌─────────────────────────────────────────────────────────────┐
│                      Developer Tools                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     CLI      │  │     SDK      │  │   Web IDE    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
          └─────────────────┼──────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                      API Gateway                              │
│                   (NestJS + Supabase Auth)                    │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Marketplace │   │  Validator   │   │   Adapters   │
│   Service    │   │  Microservice│   │   (Claude,   │
│ (PostgreSQL) │   │  (Python)    │   │   GPT, MCP)  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │
        └───────────────────┼───────────────────┘
                            │
                ┌───────────▼───────────┐
                │   Data Layer          │
                │  ┌─────────────────┐  │
                │  │   PostgreSQL    │  │
                │  │   (Skills, Users)│ │
                │  └─────────────────┘  │
                │  ┌─────────────────┐  │
                │  │     Redis       │  │
                │  │  (Cache, Queue) │  │
                │  └─────────────────┘  │
                └───────────────────────┘
```

## Core Components

### 1. Frontend Layer (`@agentfoundry/web`)

**Technology**: Next.js 15, React 18, Tailwind CSS

**Responsibilities**:
- Marketplace UI for browsing and discovering Skills
- User authentication and profile management
- Skill submission and management interface
- Analytics dashboard for developers

**Key Routes**:
- `/` - Homepage and featured Skills
- `/marketplace` - Browse all Skills
- `/skill/[slug]` - Skill detail page
- `/submit` - Submit new Skill
- `/dashboard` - Developer dashboard

### 2. API Layer (`@agentfoundry/api`)

**Technology**: NestJS, TypeScript, Supabase Auth

**Responsibilities**:
- RESTful API with OpenAPI/Swagger documentation
- Supabase JWT authentication and authorization
- Modular service architecture with dependency injection
- Business logic orchestration and validation

**Key Endpoints**:
```
GET    /api/v1/skills          - List all Skills
GET    /api/v1/skills/:id      - Get Skill details
POST   /api/v1/skills          - Submit new Skill (auth required)
PUT    /api/v1/skills/:id      - Update Skill (auth required)
DELETE /api/v1/skills/:id      - Delete Skill (auth required)
GET    /api/v1/auth/me         - Get current user
POST   /api/v1/validate/skill  - Trigger validation
```

### 3. Validation Service (`@agentfoundry/validator`)

**Technology**: Python, FastAPI, AST parsing

**Responsibilities**:
- Static code analysis using Python AST
- Permission manifest validation
- Security vulnerability scanning
- Safety score calculation

**Validation Pipeline**:
```python
1. Parse code → AST
2. Detect dangerous patterns (eval, exec, subprocess)
3. Scan for security issues (SQL injection, XSS)
4. Validate permissions match actual usage
5. Generate safety score (0-100)
6. Return validation report
```

**Key Validators**:
- `StaticAnalyzer`: AST-based code structure analysis
- `PermissionScanner`: Permission usage detection
- `SecurityScanner`: Vulnerability pattern matching

### 4. SDK Layer (`@agentfoundry/sdk`)

**Technology**: TypeScript

**Responsibilities**:
- Fluent API for building Skills
- Cross-platform adapters (Claude, GPT, MCP)
- Manifest validation
- Type-safe Skill definitions

**Example Usage**:
```typescript
const skill = new SkillBuilder()
  .name('My Skill')
  .version('1.0.0')
  .platforms(Platform.MCP)
  .addFunction({...})
  .build();

// Convert to MCP format
const mcpServer = new MCPAdapter().convert(skill);
```

### 5. CLI Tool (`@agentfoundry/cli`)

**Technology**: Node.js, Commander.js, Inquirer

**Commands**:
- `agentfoundry init` - Scaffold new Skill project
- `agentfoundry validate` - Validate Skill locally
- `agentfoundry publish` - Publish to marketplace
- `agentfoundry login` - Authenticate with platform

### 6. Database Layer (`@agentfoundry/db`)

**Technology**: PostgreSQL 15, Prisma ORM

**Key Models**:

```prisma
model User {
  id            String   @id
  firebaseUid   String   @unique
  email         String   @unique
  reputation    Int
  verified      Boolean
  skills        Skill[]
}

model Skill {
  id              String   @id
  name            String
  slug            String   @unique
  status          SkillStatus
  platforms       Platform[]
  permissions     String[]
  validatedAt     DateTime?
  author          User     @relation(...)
  reviews         Review[]
  validationResults ValidationResult[]
}

model ValidationResult {
  id              String   @id
  skillId         String
  validationType  ValidationType
  status          ValidationStatus
  passed          Boolean
  score           Float?
  issues          Json
}
```

## Data Flow

### Skill Submission Flow

```
1. Developer creates Skill using CLI or SDK
   └─> agentfoundry init → generates .claudeskill.md

2. Developer validates locally
   └─> agentfoundry validate
       └─> Sends to Validator service
           └─> Static analysis + security scan
               └─> Returns validation report

3. Developer publishes
   └─> agentfoundry publish
       └─> POST /api/v1/skills (with auth token)
           └─> API stores in PostgreSQL
               └─> Triggers async validation
                   └─> Updates validation results
                       └─> Changes status: PENDING → VALIDATING → APPROVED

4. Skill appears in marketplace
   └─> GET /api/v1/skills
       └─> Returns approved Skills with metadata
```

### Authentication Flow

```
1. User signs in with Email or Google
   └─> Firebase Authentication
       └─> Returns ID token

2. Client sends token in Authorization header
   └─> Bearer <firebase-id-token>

3. API verifies token with Firebase Admin SDK
   └─> Extracts uid and email
       └─> Looks up or creates User in PostgreSQL
           └─> Attaches user context to request
```

## Security Architecture

### Permission Model

Skills declare required permissions in manifest:
```json
{
  "permissions": [
    "network.http",
    "file.read"
  ]
}
```

Validator scans code to ensure:
- All used permissions are declared
- No undeclared permissions are used
- Permissions follow least-privilege principle

### Sandboxing

MVP uses static analysis only. Future: containerized execution.

### Code Signing

Future: Skills are cryptographically signed by author for integrity verification.

## Scalability Considerations

### Current (MVP)

- Single PostgreSQL instance
- Stateless API servers (horizontal scaling)
- Redis for session/cache
- Validator runs synchronously

### Future (Scale Phase)

- Multi-region PostgreSQL (read replicas)
- Validation queue (RabbitMQ/SQS)
- CDN for Skill assets
- Elasticsearch for search
- Microservices for billing, analytics

## Technology Choices

| Decision | Technology | Rationale |
|----------|-----------|-----------|
| **Monorepo** | Turborepo + pnpm | Fast builds, shared dependencies, code reuse |
| **Frontend** | Next.js 15 | SSR, API routes, React ecosystem, Vercel deployment |
| **API** | NestJS | Modular architecture, OpenAPI generation, dependency injection |
| **Database** | PostgreSQL (self-hosted) | Relational data, ACID, full-text search, full control |
| **ORM** | Prisma | Type-safe queries, migrations, developer experience |
| **Validator** | Python + FastAPI | Best tooling for AST analysis, fast async API |
| **Auth** | Supabase Auth | Free tier, open-source, integrates with PostgreSQL |
| **Cache** | Redis | Fast, distributed, pub/sub support |

## Deployment Architecture

### MVP Deployment (Vercel + Railway)

```
┌──────────────────┐
│   Vercel CDN     │  (Frontend - Next.js)
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Railway API     │  (NestJS backend)
│  + PostgreSQL    │
│  + Redis         │
└────────┬─────────┘
         │
┌────────▼─────────┐
│ Railway Validator│  (Python FastAPI)
└──────────────────┘
```

### Production Deployment (AWS)

```
┌──────────────────┐
│  CloudFront CDN  │
└────────┬─────────┘
         │
┌────────▼─────────┐
│   ECS (Fargate)  │  API + Validator containers
│  + Load Balancer │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
┌───▼────┐ ┌─▼─────┐
│  RDS   │ │ElastiCache│
│(Postgres)│(Redis)│
└────────┘ └───────┘
```

## Performance Targets

- **API Response Time**: < 200ms (p95)
- **Validation Time**: < 10s for typical Skill
- **Marketplace Load**: < 1s initial page load
- **Database Queries**: < 50ms (p95)

## Monitoring & Observability

Future implementation:

- **Metrics**: Prometheus + Grafana
- **Logging**: Winston + ELK stack
- **Tracing**: OpenTelemetry
- **Alerts**: PagerDuty integration

---

**Last Updated**: 2025-11-08
