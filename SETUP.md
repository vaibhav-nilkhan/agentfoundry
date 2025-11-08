# AgentFoundry Setup Guide

Complete guide for setting up AgentFoundry development environment.

## Prerequisites

Ensure you have the following installed:

- **Node.js**: v20.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm**: v8.0.0 or higher
  ```bash
  npm install -g pnpm@8.14.0
  ```
- **Python**: v3.11 or higher ([Download](https://www.python.org/))
- **Poetry**: Python package manager
  ```bash
  curl -sSL https://install.python-poetry.org | python3 -
  ```
- **PostgreSQL**: v15 or higher ([Download](https://www.postgresql.org/download/))
- **Redis**: Latest stable ([Download](https://redis.io/download))

## Step-by-Step Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/agentfoundry.git
cd agentfoundry
```

### 2. Install Node.js Dependencies

```bash
# Install all packages in the monorepo
pnpm install
```

This will install dependencies for:
- `@agentfoundry/web`
- `@agentfoundry/api`
- `@agentfoundry/sdk`
- `@agentfoundry/cli`
- `@agentfoundry/db`
- `@agentfoundry/shared`

### 3. Install Python Dependencies

```bash
cd packages/validator
poetry install
cd ../..
```

### 4. Set Up PostgreSQL Database

```bash
# Create database
createdb agentfoundry

# Or using psql
psql -U postgres
CREATE DATABASE agentfoundry;
\q
```

### 5. Set Up Redis

```bash
# macOS (with Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 6. Configure Environment Variables

#### Frontend (`packages/web/.env.local`)

```bash
cp packages/web/.env.example packages/web/.env.local
```

Edit `packages/web/.env.local`:

```env
# Firebase Configuration (Get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Backend API (`packages/api/.env`)

```bash
cp packages/api/.env.example packages/api/.env
```

Edit `packages/api/.env`:

```env
# Server
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Firebase Admin SDK (Get service account from Firebase Console)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/agentfoundry?schema=public"

# Redis
REDIS_URL=redis://localhost:6379
```

#### Validator (`packages/validator/.env`)

```bash
cp packages/validator/.env.example packages/validator/.env
```

Edit `packages/validator/.env`:

```env
# Server
HOST=0.0.0.0
PORT=5000

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:4000"]

# Redis
REDIS_URL=redis://localhost:6379

# Validation Settings
MAX_FILE_SIZE_MB=10
VALIDATION_TIMEOUT_SECONDS=60
SANDBOX_ENABLED=true
```

### 7. Set Up Firebase (Free Spark Plan)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google
4. Get Web SDK config:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy config values to `packages/web/.env.local`
5. Generate Service Account:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Copy values to `packages/api/.env`

### 8. Initialize Database

```bash
# Generate Prisma client
cd packages/db
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed database with sample data
pnpm prisma db seed

# (Optional) Open Prisma Studio to view data
pnpm prisma studio
```

### 9. Build All Packages

```bash
# From root directory
pnpm build
```

This will build all packages in dependency order using Turborepo.

### 10. Start Development Servers

Open **4 terminal windows**:

#### Terminal 1: Frontend
```bash
pnpm --filter @agentfoundry/web dev
# Runs on http://localhost:3000
```

#### Terminal 2: API
```bash
pnpm --filter @agentfoundry/api dev
# Runs on http://localhost:4000
```

#### Terminal 3: Validator
```bash
cd packages/validator
poetry run uvicorn app.main:app --reload --port 5000
# Runs on http://localhost:5000
```

#### Terminal 4: Database Studio (Optional)
```bash
pnpm --filter @agentfoundry/db studio
# Runs on http://localhost:5555
```

## Verify Installation

### 1. Check Health Endpoints

```bash
# API
curl http://localhost:4000/health
# Should return: {"status":"ok","timestamp":"..."}

# Validator
curl http://localhost:5000/health
# Should return: {"status":"healthy","service":"validator","timestamp":"..."}
```

### 2. Test Frontend

Open browser to `http://localhost:3000`

You should see the AgentFoundry homepage.

### 3. Test CLI

```bash
# Build CLI
pnpm --filter @agentfoundry/cli build

# Test CLI (from root)
cd /tmp
node /path/to/agentfoundry/packages/cli/dist/cli.js init
```

## Common Issues

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### PostgreSQL Connection Error

```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql

# Start PostgreSQL (Ubuntu)
sudo systemctl start postgresql
```

### Redis Connection Error

```bash
# Check if Redis is running
redis-cli ping

# Start Redis (macOS)
brew services start redis

# Start Redis (Ubuntu)
sudo systemctl start redis
```

### Prisma Migration Error

```bash
# Reset database (WARNING: deletes all data)
cd packages/db
pnpm prisma migrate reset

# Or manually drop and recreate
dropdb agentfoundry
createdb agentfoundry
pnpm prisma migrate dev
```

### Python Poetry Not Found

```bash
# Add Poetry to PATH (macOS/Linux)
export PATH="$HOME/.local/bin:$PATH"

# Or reinstall
curl -sSL https://install.python-poetry.org | python3 -
```

## Development Tools

### Recommended VSCode Extensions

- ESLint
- Prettier
- Prisma
- Python
- Tailwind CSS IntelliSense

### Useful Commands

```bash
# Clean all build artifacts
pnpm clean

# Format all code
pnpm format

# Lint all packages
pnpm lint

# Run all tests
pnpm test

# Update dependencies
pnpm update --recursive
```

## Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
2. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
3. Explore the codebase starting with [README.md](./README.md)
4. Try creating a sample Skill using the CLI

## Getting Help

- Check [GitHub Issues](https://github.com/yourusername/agentfoundry/issues)
- Read the documentation (coming soon)
- Join Discord community (coming soon)

---

**Happy Coding!** 🚀
