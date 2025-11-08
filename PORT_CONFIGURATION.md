# 🔌 Port Configuration Guide

AgentFoundry consists of multiple services that need to run simultaneously. To avoid port conflicts with your existing projects, all ports are **fully configurable** via environment variables.

---

## 📊 Default Port Assignments

| Service | Default Port | Configurable Via | Config File |
|---------|--------------|------------------|-------------|
| **Frontend** (Next.js) | `3100` | `PORT` | `packages/web/.env.local` |
| **Backend** (NestJS) | `4100` | `PORT` | `packages/api/.env` |
| **Validator** (FastAPI) | `5100` | `PORT` | `packages/validator/.env` |
| **Prisma Studio** | `5600` | `--port` flag | Command line |
| **PostgreSQL** | `5432` | `DATABASE_URL` | `packages/api/.env` |
| **Redis** | `6379` | `REDIS_URL` | `packages/api/.env` |

> **Note**: Changed from original ports (3000, 4000, 5000) to avoid conflicts with common development ports.

---

## ⚙️ Configuration Methods

### Method 1: Environment Files (Recommended)

Create `.env` files from examples:

```bash
# Frontend
cp packages/web/.env.example packages/web/.env.local

# Backend
cp packages/api/.env.example packages/api/.env

# Validator
cp packages/validator/.env.example packages/validator/.env
```

Then edit each file with your desired ports:

**`packages/web/.env.local`**:
```env
PORT=3100                                      # Change to any available port
NEXT_PUBLIC_APP_URL=http://localhost:3100
NEXT_PUBLIC_API_URL=http://localhost:4100     # Must match backend PORT
NEXT_PUBLIC_VALIDATOR_URL=http://localhost:5100
```

**`packages/api/.env`**:
```env
PORT=4100                                      # Change to any available port
CORS_ORIGIN=http://localhost:3100             # Must match frontend PORT
VALIDATOR_URL=http://localhost:5100            # Must match validator PORT
```

**`packages/validator/.env`**:
```env
PORT=5100                                      # Change to any available port
CORS_ORIGINS=["http://localhost:3100", "http://localhost:4100"]
```

---

### Method 2: Command Line Override

You can override ports when starting services:

```bash
# Frontend
PORT=3200 pnpm --filter @agentfoundry/web dev

# Backend
PORT=4200 pnpm --filter @agentfoundry/api dev

# Validator
cd packages/validator
PORT=5200 poetry run uvicorn app.main:app --reload --port 5200
```

---

### Method 3: Global Environment Variables

Set environment variables in your shell:

```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.profile
export AGENTFOUNDRY_FRONTEND_PORT=3100
export AGENTFOUNDRY_BACKEND_PORT=4100
export AGENTFOUNDRY_VALIDATOR_PORT=5100

# Then use in scripts
PORT=$AGENTFOUNDRY_FRONTEND_PORT pnpm --filter @agentfoundry/web dev
```

---

## 🎯 Recommended Port Ranges

If you're running multiple projects, use these ranges to stay organized:

| Project | Frontend | Backend | Validator | Database | Notes |
|---------|----------|---------|-----------|----------|-------|
| **Project 1** | 3000 | 4000 | 5000 | 5432 | Original defaults |
| **Project 2** | 3050 | 4050 | 5050 | 5433 | +50 offset |
| **Project 3** | 3100 | 4100 | 5100 | 5434 | +100 offset |
| **AgentFoundry** | 3150 | 4150 | 5150 | 5435 | +150 offset |

Or use thousands:

| Project | Frontend | Backend | Validator |
|---------|----------|---------|-----------|
| **Project 1** | 3000 | 4000 | 5000 |
| **Project 2** | 3100 | 4100 | 5100 |
| **Project 3** | 3200 | 4200 | 5200 |
| **AgentFoundry** | 3300 | 4300 | 5300 |

---

## 🔍 Check Available Ports

Before starting AgentFoundry, verify ports are available:

### macOS/Linux
```bash
# Check if port 3100 is in use
lsof -i :3100

# Check multiple ports at once
lsof -i :3100 -i :4100 -i :5100

# Find what's using a port
lsof -i :3100 | grep LISTEN
```

### Windows (PowerShell)
```powershell
# Check if port 3100 is in use
Test-NetConnection -ComputerName localhost -Port 3100

# List all listening ports
netstat -ano | findstr LISTENING
```

### Cross-platform (Node.js)
```bash
# Install port checker
npm install -g port-checker

# Check port availability
port-checker 3100
port-checker 4100 5100  # Multiple ports
```

---

## 🚀 Quick Start with Custom Ports

### Option A: Use .env files (Persistent)

```bash
# 1. Create .env files
cp packages/web/.env.example packages/web/.env.local
cp packages/api/.env.example packages/api/.env
cp packages/validator/.env.example packages/validator/.env

# 2. Edit ports in each file (use your preferred editor)
nano packages/web/.env.local      # Set PORT=3100
nano packages/api/.env             # Set PORT=4100
nano packages/validator/.env       # Set PORT=5100

# 3. Start all services normally
pnpm dev
```

### Option B: Command line (One-time)

```bash
# Terminal 1 - Frontend
PORT=3100 pnpm --filter @agentfoundry/web dev

# Terminal 2 - Backend
PORT=4100 pnpm --filter @agentfoundry/api dev

# Terminal 3 - Validator
cd packages/validator
poetry run uvicorn app.main:app --reload --port 5100
```

---

## 📝 Update All References

When changing ports, update these locations:

### 1. Frontend → Backend URL
**`packages/web/.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:4100  # Match backend PORT
```

### 2. Backend → CORS Origin
**`packages/api/.env`**:
```env
CORS_ORIGIN=http://localhost:3100  # Match frontend PORT
```

### 3. Backend → Validator URL
**`packages/api/.env`**:
```env
VALIDATOR_URL=http://localhost:5100  # Match validator PORT
```

### 4. Validator → CORS Origins
**`packages/validator/.env`**:
```env
CORS_ORIGINS=["http://localhost:3100", "http://localhost:4100"]
```

---

## 🛠️ Troubleshooting

### Port Already in Use

```bash
# Kill process using port 3100
lsof -ti:3100 | xargs kill -9

# Or find and kill manually
lsof -i :3100
kill -9 <PID>
```

### Services Can't Communicate

**Symptom**: Frontend shows "Failed to fetch" or API errors

**Solution**: Verify all URLs match actual ports:
```bash
# Check what ports are actually running
lsof -i :3100  # Frontend
lsof -i :4100  # Backend
lsof -i :5100  # Validator

# Verify CORS is configured correctly
curl http://localhost:4100/api/v1/health
```

### Prisma Studio Port Conflict

```bash
# Default Prisma Studio uses port 5555
# Change it with --port flag:
pnpm --filter @agentfoundry/db studio -- --port 5600
```

---

## 🎮 Example: Running 4 Projects Simultaneously

**Project 1** (Original):
- Frontend: `3000`
- Backend: `4000`
- Validator: `5000`

**Project 2**:
- Frontend: `3050`
- Backend: `4050`
- Validator: `5050`

**Project 3**:
- Frontend: `3100`
- Backend: `4100`
- Validator: `5100`

**AgentFoundry** (this project):
```env
# packages/web/.env.local
PORT=3150
NEXT_PUBLIC_API_URL=http://localhost:4150

# packages/api/.env
PORT=4150
CORS_ORIGIN=http://localhost:3150
VALIDATOR_URL=http://localhost:5150

# packages/validator/.env
PORT=5150
CORS_ORIGINS=["http://localhost:3150", "http://localhost:4150"]
```

All 4 projects can now run simultaneously! 🎉

---

## 📋 Quick Reference Table

| Environment Variable | Default | Purpose |
|---------------------|---------|---------|
| `PORT` (web) | `3100` | Next.js dev server |
| `PORT` (api) | `4100` | NestJS backend |
| `PORT` (validator) | `5100` | FastAPI validator |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3100` | Frontend base URL |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4100` | Backend API URL |
| `CORS_ORIGIN` | `http://localhost:3100` | Allowed frontend origin |
| `VALIDATOR_URL` | `http://localhost:5100` | Validator service URL |
| `DATABASE_URL` | `postgresql://...5432/...` | PostgreSQL connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |

---

## 🔐 Security Note

**Never commit actual `.env` files to git!**

```bash
# These are gitignored by default:
.env
.env.local
.env.*.local

# Only commit:
.env.example  ✅
```

---

## 🎯 Best Practices

1. **Use `.env.local`** for local development (gitignored)
2. **Document custom ports** in team README if shared
3. **Use port ranges** (e.g., 3100-3199 for all frontends)
4. **Check availability** before starting services
5. **Update all references** when changing ports

---

**Now you can run AgentFoundry alongside your 3 existing projects without any conflicts!** 🚀
