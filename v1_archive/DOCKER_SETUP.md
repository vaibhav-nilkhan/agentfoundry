# Docker Setup & Deployment Guide

> **Version**: 1.0.0
> **Last Updated**: 2025-11-15
> **Purpose**: Complete guide for deploying AgentFoundry with Docker

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Architecture Overview](#architecture-overview)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Services](#services)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)
9. [Maintenance](#maintenance)

---

## Quick Start

**One-click installation** (requires Docker and Docker Compose):

```bash
git clone https://github.com/yourusername/agentfoundry.git
cd agentfoundry
./install.sh
```

That's it! The script will:
- ✅ Check prerequisites
- ✅ Configure environment
- ✅ Pull base images
- ✅ Build application images
- ✅ Start all services
- ✅ Run database migrations
- ✅ Seed the database

**Access your platform:**
- 🌐 **Web**: http://localhost:3100
- 🔧 **API**: http://localhost:4100
- 📚 **API Docs**: http://localhost:4100/api/docs
- 🔬 **Validator**: http://localhost:5100

---

## Prerequisites

### Required Software

| Software | Minimum Version | Installation |
|----------|----------------|--------------|
| **Docker** | 20.10+ | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| **Docker Compose** | 2.0+ | [docs.docker.com/compose/install](https://docs.docker.com/compose/install/) |
| **Git** | 2.0+ | [git-scm.com](https://git-scm.com/) |

### System Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4 GB
- Disk: 10 GB free space
- OS: Linux, macOS, or Windows with WSL2

**Recommended:**
- CPU: 4+ cores
- RAM: 8+ GB
- Disk: 20+ GB SSD
- OS: Linux or macOS

### Verify Installation

```bash
# Check Docker
docker --version
# Should output: Docker version 20.10.0 or higher

# Check Docker Compose
docker-compose --version
# Should output: Docker Compose version 2.0.0 or higher

# Check Docker daemon is running
docker info
# Should show system information (not "Cannot connect to Docker daemon")
```

---

## Architecture Overview

### Container Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Network: agentfoundry-network  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │   Web    │───▶│   API    │───▶│    DB    │         │
│  │ (Next.js)│    │ (NestJS) │    │(Postgres)│         │
│  │  :3100   │    │  :4100   │    │  :5432   │         │
│  └──────────┘    └──────────┘    └──────────┘         │
│                         │                               │
│                         ├──────▶┌──────────┐           │
│                         │       │  Redis   │           │
│                         │       │  :6379   │           │
│                         │       └──────────┘           │
│                         │                               │
│                         └──────▶┌──────────┐           │
│                                 │Validator │           │
│                                 │(FastAPI) │           │
│                                 │  :5100   │           │
│                                 └──────────┘           │
│                                                         │
│              ┌──────────────┐                          │
│              │  DB Migrate  │                          │
│              │(Init only)   │                          │
│              └──────────────┘                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Service Dependencies

```
web → api → (db, redis, validator, db-migrate)
api → (db, redis, validator, db-migrate)
validator → (no dependencies)
redis → (no dependencies)
db → (no dependencies)
db-migrate → db
```

**Startup Order:**
1. `db` (PostgreSQL) - Starts first
2. `redis` - Starts in parallel with db
3. `db-migrate` - Waits for db to be healthy, runs migrations/seeding
4. `validator` - Starts in parallel
5. `api` - Waits for db, redis, validator, and db-migrate
6. `web` - Waits for api

---

## Installation

### Method 1: Automated Installation (Recommended)

```bash
# Clone repository
git clone https://github.com/yourusername/agentfoundry.git
cd agentfoundry

# Run installation script
./install.sh
```

The script will guide you through:
1. Prerequisites check
2. Environment configuration
3. Image building
4. Service startup
5. Health checks

### Method 2: Manual Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/agentfoundry.git
cd agentfoundry

# 2. Create environment file
cp .env.example .env

# 3. Edit .env and configure Supabase credentials
nano .env
# Update SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 4. Pull base images
docker-compose pull postgres redis

# 5. Build application images
docker-compose build --parallel

# 6. Start all services
docker-compose up -d

# 7. Check service status
docker-compose ps

# 8. View logs
docker-compose logs -f
```

---

## Configuration

### Environment Variables

**Required Configuration:**

```bash
# Supabase (get from https://supabase.com/dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Optional Configuration:**

```bash
# Customize ports if you have conflicts
WEB_PORT=3100        # Change to 3000, 3200, etc.
API_PORT=4100        # Change to 4000, 4200, etc.
VALIDATOR_PORT=5100  # Change to 5000, 5200, etc.
POSTGRES_PORT=5432   # Change to 5433, 5434, etc.
REDIS_PORT=6379      # Change to 6380, 6381, etc.

# Security (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key
API_KEY=your-api-key-for-admin-endpoints

# Database credentials (CHANGE IN PRODUCTION!)
POSTGRES_USER=agentfoundry
POSTGRES_PASSWORD=agentfoundry_dev_password
POSTGRES_DB=agentfoundry
```

### Supabase Setup

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to **Project Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
5. Update `.env` file with these values

### Port Customization

If default ports conflict with other services:

```bash
# Edit .env
WEB_PORT=3200
API_PORT=4200
VALIDATOR_PORT=5200

# Restart services
docker-compose down
docker-compose up -d
```

---

## Services

### Service Details

#### 1. Web (Next.js Frontend)
- **Image**: Built from `packages/web/Dockerfile`
- **Port**: 3100 (configurable)
- **Technology**: Next.js 15, React 18, Tailwind CSS
- **Health Check**: HTTP GET on `/api/health`
- **Purpose**: User interface for marketplace, dashboard, admin panel

#### 2. API (NestJS Backend)
- **Image**: Built from `packages/api/Dockerfile`
- **Port**: 4100 (configurable)
- **Technology**: NestJS 10, TypeScript, Prisma
- **Health Check**: HTTP GET on `/health`
- **Purpose**: REST API, business logic, authentication
- **Documentation**: http://localhost:4100/api/docs (Swagger)

#### 3. Validator (FastAPI)
- **Image**: Built from `packages/validator/Dockerfile`
- **Port**: 5100 (configurable)
- **Technology**: Python 3.11, FastAPI, Poetry
- **Purpose**: Static analysis, security scanning, validation

#### 4. Database (PostgreSQL)
- **Image**: `postgres:15-alpine`
- **Port**: 5432 (configurable)
- **Purpose**: Primary data store
- **Persistence**: `postgres_data` volume

#### 5. Redis (Cache)
- **Image**: `redis:7-alpine`
- **Port**: 6379 (configurable)
- **Purpose**: Caching, session storage
- **Persistence**: `redis_data` volume

#### 6. DB Migrate (Init Container)
- **Image**: Built from `packages/db/Dockerfile.migrate`
- **Purpose**: Runs Prisma migrations and database seeding
- **Lifecycle**: Runs once on startup, exits after completion

### Managing Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose stop

# Restart specific service
docker-compose restart api

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api

# Check service status
docker-compose ps

# Execute command in running container
docker-compose exec api sh
docker-compose exec db psql -U agentfoundry

# Rebuild and restart service
docker-compose up -d --build api
```

### Data Persistence

Volumes are used for data persistence:

```bash
# List volumes
docker volume ls | grep agentfoundry

# Inspect volume
docker volume inspect agentfoundry_postgres_data

# Backup database
docker-compose exec db pg_dump -U agentfoundry agentfoundry > backup.sql

# Restore database
docker-compose exec -T db psql -U agentfoundry agentfoundry < backup.sql
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Port Already in Use

**Error:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:3100: bind: address already in use
```

**Solution:**
```bash
# Option 1: Stop conflicting service
lsof -i :3100  # Find process using port 3100
kill -9 <PID>  # Kill the process

# Option 2: Change port in .env
WEB_PORT=3200
docker-compose up -d
```

#### Issue 2: Docker Daemon Not Running

**Error:**
```
Cannot connect to the Docker daemon. Is the docker daemon running?
```

**Solution:**
```bash
# Linux
sudo systemctl start docker

# macOS
open -a Docker

# Windows (WSL2)
wsl --shutdown
wsl
```

#### Issue 3: Build Fails with "No Space Left"

**Error:**
```
failed to register layer: write /var/lib/docker/...: no space left on device
```

**Solution:**
```bash
# Clean up Docker system
docker system prune -a --volumes

# Check disk usage
docker system df

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

#### Issue 4: Database Connection Failed

**Error:**
```
Error: Can't reach database server at `db:5432`
```

**Solution:**
```bash
# Check database is running and healthy
docker-compose ps db

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Verify DATABASE_URL in .env matches docker-compose.yml
grep DATABASE_URL .env
```

#### Issue 5: Supabase Authentication Fails

**Error:**
```
Error: Invalid API key
```

**Solution:**
```bash
# Verify Supabase credentials in .env
grep SUPABASE .env

# Check credentials are correct at https://supabase.com/dashboard
# Restart services after updating .env
docker-compose restart api web
```

#### Issue 6: Services Won't Start (Health Check Failing)

**Error:**
```
api is unhealthy
```

**Solution:**
```bash
# View detailed logs
docker-compose logs api

# Check if dependencies are healthy
docker-compose ps

# Restart in order
docker-compose restart db redis validator
sleep 10
docker-compose restart api
sleep 5
docker-compose restart web
```

#### Issue 7: Slow Build Times

**Solution:**
```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker-compose build --parallel

# Clean build cache if corrupted
docker builder prune -a
```

### Debugging Commands

```bash
# View all container logs in real-time
docker-compose logs -f

# Execute shell in running container
docker-compose exec api sh
docker-compose exec web sh
docker-compose exec db sh

# Inspect container
docker inspect agentfoundry-api-1

# Check resource usage
docker stats

# View network details
docker network inspect agentfoundry-network

# Test database connection
docker-compose exec db psql -U agentfoundry -d agentfoundry -c "SELECT 1;"

# Test Redis connection
docker-compose exec redis redis-cli PING
```

### Performance Tuning

```bash
# Increase Docker memory (macOS/Windows)
# Docker Desktop → Settings → Resources → Memory → 8 GB

# Use Docker BuildKit cache
export DOCKER_BUILDKIT=1

# Optimize layer caching in Dockerfiles (already done)
# Multi-stage builds (already implemented)

# Reduce image size
docker images | grep agentfoundry
```

---

## Production Deployment

### Security Hardening

**Before deploying to production:**

1. **Change all default passwords and secrets:**

```bash
# Generate strong secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For API_KEY

# Update .env
JWT_SECRET=<generated-secret>
API_KEY=<generated-secret>
POSTGRES_PASSWORD=<strong-password>
```

2. **Use environment-specific .env files:**

```bash
# .env.production
NODE_ENV=production
```

3. **Enable HTTPS:**

Add nginx reverse proxy with SSL:

```yaml
# docker-compose.prod.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api
```

4. **Restrict database access:**

```yaml
# docker-compose.prod.yml
services:
  db:
    ports: []  # Don't expose externally
```

5. **Add monitoring:**

```yaml
services:
  prometheus:
    image: prom/prometheus
  grafana:
    image: grafana/grafana
```

### Deployment Checklist

- [ ] Update all secrets in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Configure domain name and SSL
- [ ] Set up backup strategy
- [ ] Configure monitoring and alerting
- [ ] Set up log aggregation
- [ ] Test disaster recovery
- [ ] Configure firewall rules
- [ ] Set up CI/CD pipeline
- [ ] Document runbook

### Deployment Options

#### Option 1: VPS (DigitalOcean, Linode, etc.)

```bash
# SSH to server
ssh user@your-server.com

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone and deploy
git clone https://github.com/yourusername/agentfoundry.git
cd agentfoundry
cp .env.example .env
# Edit .env with production values
./install.sh
```

#### Option 2: AWS EC2

```bash
# Launch EC2 instance with Docker pre-installed
# Or use Amazon Linux 2 and install Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo usermod -aG docker ec2-user

# Deploy AgentFoundry
git clone https://github.com/yourusername/agentfoundry.git
cd agentfoundry
./install.sh
```

#### Option 3: Google Cloud Run

```bash
# Build and push images to Google Container Registry
docker build -t gcr.io/your-project/agentfoundry-web packages/web
docker push gcr.io/your-project/agentfoundry-web

# Deploy via Cloud Run Console or gcloud CLI
gcloud run deploy agentfoundry-web \
  --image gcr.io/your-project/agentfoundry-web \
  --platform managed \
  --region us-central1
```

---

## Maintenance

### Regular Tasks

#### Daily
```bash
# Check service health
docker-compose ps

# View error logs
docker-compose logs --tail=100 api web
```

#### Weekly
```bash
# Backup database
docker-compose exec db pg_dump -U agentfoundry agentfoundry > backup-$(date +%Y%m%d).sql

# Check disk usage
docker system df
```

#### Monthly
```bash
# Update Docker images
docker-compose pull
docker-compose up -d --build

# Clean up old images
docker image prune -a

# Review logs for errors
docker-compose logs --since 30d | grep ERROR
```

### Updates

```bash
# Update to latest version
git pull origin main
docker-compose down
docker-compose build --parallel
docker-compose up -d

# Or use the helper command
./update.sh  # (create this script)
```

### Backup & Restore

**Backup:**
```bash
# Database
docker-compose exec db pg_dump -U agentfoundry agentfoundry > backup.sql

# Volumes
docker run --rm -v agentfoundry_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz /data

# Configuration
cp .env .env.backup
```

**Restore:**
```bash
# Database
docker-compose exec -T db psql -U agentfoundry agentfoundry < backup.sql

# Volumes
docker run --rm -v agentfoundry_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

### Monitoring

**Key Metrics to Monitor:**
- Container health status
- CPU/Memory usage
- Disk space
- API response times
- Database connections
- Error rates

**Monitoring Tools:**
```bash
# Real-time stats
docker stats

# Service health
docker-compose ps

# Resource usage
docker system df

# Network traffic
docker network inspect agentfoundry-network
```

---

## Additional Resources

- **Main Documentation**: [README.md](./README.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Production Readiness**: [PRODUCTION_READINESS_STATUS.md](./PRODUCTION_READINESS_STATUS.md)

---

## Support

**Issues:**
- GitHub Issues: https://github.com/yourusername/agentfoundry/issues
- Discussions: https://github.com/yourusername/agentfoundry/discussions

**Docker Help:**
- Docker Docs: https://docs.docker.com
- Docker Compose Docs: https://docs.docker.com/compose

---

**End of DOCKER_SETUP.md**
