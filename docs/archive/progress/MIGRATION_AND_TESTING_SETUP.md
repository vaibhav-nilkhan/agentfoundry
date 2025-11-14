# 🔧 Migration and Testing Setup Guide

**Date**: 2025-01-14
**Status**: ✅ Migration files created - Ready to apply when database is configured
**Migration**: `20250114000000_add_protection_system`

---

## ✅ What's Been Done

### 1. Prisma Migration Created

The protection system database migration has been **manually created** and is ready to apply:

```
packages/db/prisma/migrations/
├── migration_lock.toml                              ✅ Created
└── 20250114000000_add_protection_system/
    └── migration.sql                                ✅ Created (9,751 bytes)
```

**Why manually created?**
Prisma CLI couldn't download engine binaries due to network/firewall restrictions (403 Forbidden errors). The migration SQL was manually generated from the Prisma schema.

**What's in the migration?**
- 7 new PostgreSQL enums (SkillStatus, PricingType, Platform, ValidationType, ValidationStatus, SubscriptionTier, SubscriptionStatus)
- 8 database tables (User, Skill, SkillVersion, ValidationResult, Review, SkillUsage, ApiKey, Subscription)
- 25+ indexes for query performance
- Foreign key relationships and constraints
- Default values and auto-increment fields

### 2. Environment Configuration Created

```bash
packages/db/.env
```

Contains placeholder DATABASE_URL - **must be updated with real PostgreSQL credentials before testing**.

---

## 🚀 Next Steps: Applying the Migration

### Prerequisites

You need:
1. **PostgreSQL 15+** running (locally or remote)
2. **Database created** (e.g., `agentfoundry`)
3. **Connection string** with proper credentials

### Step 1: Configure Database URL

Edit `packages/db/.env`:

```bash
# Replace with your actual PostgreSQL credentials
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Examples:
# Local: postgresql://postgres:password@localhost:5432/agentfoundry?schema=public
# Docker: postgresql://postgres:password@localhost:5432/agentfoundry?schema=public
# Supabase: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
# Railway: postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

### Step 2: Apply the Migration

Once DATABASE_URL is configured:

```bash
cd packages/db

# Option 1: Apply migration directly (recommended)
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm exec prisma migrate deploy

# Option 2: Run in dev mode (creates _prisma_migrations table)
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm run migrate -- --skip-generate

# Option 3: If above fails, apply SQL manually
psql $DATABASE_URL -f prisma/migrations/20250114000000_add_protection_system/migration.sql
```

**Note**: The `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` flag is needed due to the network restrictions that prevented engine binary downloads.

### Step 3: Generate Prisma Client

After migration is applied:

```bash
cd packages/db
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm run generate
```

This generates TypeScript types for database access.

### Step 4: Verify Migration

Check that all tables were created:

```bash
# Open Prisma Studio
cd packages/db
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm run studio

# Or connect with psql
psql $DATABASE_URL -c "\dt"
```

Expected tables:
- User
- Skill
- SkillVersion
- ValidationResult
- Review
- SkillUsage
- ApiKey ✨ (NEW)
- Subscription ✨ (NEW)
- _prisma_migrations

---

## 🧪 Testing the Protection System

### Test 1: Start the API Server

```bash
cd packages/api
pnpm dev
```

API should start on `http://localhost:4100`

**Swagger Docs**: http://localhost:4100/api/docs

### Test 2: Health Check

```bash
curl http://localhost:4100/health
```

Expected: `{"status": "ok"}`

### Test 3: API Key Generation

**Note**: Requires authentication with Supabase JWT token.

```bash
# Get Supabase JWT token first (login via web app or use Supabase API)
# Then generate API key:

curl -X POST http://localhost:4100/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN" \
  -d '{
    "name": "Test API Key",
    "scopes": ["skills:execute", "skills:read"]
  }'
```

Expected response:
```json
{
  "id": "clr...",
  "key": "ak_live_xxxxxxxxxxxxxxxxxxxxx",
  "name": "Test API Key",
  "tier": "FREE",
  "scopes": ["skills:execute", "skills:read"],
  "active": true,
  "usageCount": 0,
  "createdAt": "2025-01-14T..."
}
```

**⚠️ IMPORTANT**: Save the `key` value - it won't be shown again!

### Test 4: List API Keys

```bash
curl http://localhost:4100/api-keys \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

Expected: Array of your API keys (keys will be masked: `ak_live_***...***xxx`)

### Test 5: Test Skill Execution

**Prerequisites**:
- You have an API key from Test 3
- A skill exists in `skills/production/` directory

```bash
curl -X POST http://localhost:4100/skills/execute/viral-content-predictor/predict_virality \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ak_live_xxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "content": "Check out this amazing AI tool!",
    "platform": "twitter"
  }'
```

Expected: Skill execution result (depends on skill implementation)

### Test 6: Check Usage Dashboard

```bash
# Get current month usage
curl http://localhost:4100/usage \
  -H "Authorization: Bearer ak_live_xxxxxxxxxxxxxxxxxxxxx"

# Expected response:
{
  "period": {
    "start": "2025-01-01T00:00:00Z",
    "end": "2025-01-31T23:59:59Z"
  },
  "usage": {
    "total": 3,
    "success": 3,
    "failures": 0
  },
  "limit": 100,
  "remaining": 97,
  "percentageUsed": 3,
  "resetDate": "2025-02-01T00:00:00Z",
  "breakdown": [
    {
      "skillName": "Viral Content Predictor",
      "skillSlug": "viral-content-predictor",
      "totalExecutions": 3,
      "avgExecutionTime": 245
    }
  ]
}
```

### Test 7: Check Usage Limit Status

```bash
curl http://localhost:4100/usage/limit-status \
  -H "Authorization: Bearer ak_live_xxxxxxxxxxxxxxxxxxxxx"

# Expected response:
{
  "withinLimit": true,
  "percentageUsed": 3,
  "remaining": 97,
  "warning": null
}
```

### Test 8: Verify Data in Database

```bash
# Open Prisma Studio
cd packages/db
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm run studio
```

Navigate to:
1. **ApiKey** table - Should see your generated API key
2. **SkillUsage** table - Should see execution records
3. **Subscription** table - Should see user subscriptions (if created)

---

## 📊 Database Schema Overview

### Core Tables

**User** - Firebase-linked users
- firebaseUid (unique)
- email (unique)
- reputation, verified status
- stripeCustomerId

**Skill** - Core skill entity
- name, slug, description
- author (FK to User)
- status (PENDING/VALIDATING/APPROVED/REJECTED/DEPRECATED)
- pricingType (FREE/PAID/FREEMIUM)
- platforms (array: CLAUDE_SKILLS, GPT_ACTIONS, MCP, etc.)

**ApiKey** ✨ - API authentication (NEW)
- key (unique, format: ak_live_xxx or ak_test_xxx)
- userId (FK to User)
- tier (FREE/CREATOR/PRO/ENTERPRISE)
- scopes (array of permissions)
- active, expiresAt, revokedAt
- lastUsedAt, lastUsedIp, usageCount

**Subscription** ✨ - User subscriptions (NEW)
- userId (unique, FK to User)
- tier (FREE/CREATOR/PRO/ENTERPRISE)
- status (ACTIVE/PAST_DUE/CANCELED/TRIALING/etc.)
- monthlyLimit (null = unlimited)
- usageCount (resets monthly)
- Stripe integration fields

**SkillUsage** - Execution tracking (ENHANCED)
- skillId (FK to Skill)
- userId (FK to User)
- platform, toolName
- success, executionTime, errorMessage
- apiKeyId ✨ (FK to ApiKey) - NEW

---

## 🔒 Security Notes

### API Key Security

1. **Never log full API keys** - Always mask them in logs
2. **Store hashed** - Consider hashing keys in production
3. **Rotate regularly** - Implement key rotation policies
4. **Revoke immediately** - If compromised, revoke via API

### Database Security

1. **Use strong passwords** - For PostgreSQL
2. **Enable SSL** - For production databases
3. **Restrict access** - Firewall rules, VPC
4. **Regular backups** - Automate database backups

---

## 🐛 Troubleshooting

### Issue: "Command 'prisma' not found"

**Solution**: Run from packages/db directory, or use `pnpm exec prisma`

```bash
cd packages/db
pnpm exec prisma migrate deploy
```

### Issue: "Failed to fetch engine file - 403 Forbidden"

**Solution**: Use the `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` environment variable

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm exec prisma migrate deploy
```

### Issue: "P1001: Can't reach database server"

**Solution**: Check DATABASE_URL is correct

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

### Issue: "Migration already applied"

**Solution**: This is fine - migration is idempotent. Check `_prisma_migrations` table:

```sql
SELECT * FROM _prisma_migrations;
```

### Issue: "API returns 401 Unauthorized"

**Solutions**:
1. Verify API key is correct (copied from generation response)
2. Check API key is active: `SELECT * FROM "ApiKey" WHERE key = 'ak_live_xxx'`
3. Ensure using `Authorization: Bearer <key>` header (not `x-api-key`)

### Issue: "API returns 403 Forbidden - Premium skill requires subscription"

**Solution**: This is expected for premium skills on FREE tier. Options:
1. Use a free skill instead
2. Create a Creator/Pro subscription in database
3. Change skill's pricingType to FREE

---

## 📈 Next Steps

After successful testing:

1. **Create Subscription Service** (Day 3-4)
   - SubscriptionService
   - SubscriptionController
   - Endpoints: create, upgrade, cancel

2. **Stripe Integration** (Day 4)
   - Stripe SDK setup
   - Payment flow
   - Webhook handling

3. **Convert Skills to Hybrid** (Day 5-7)
   - Viral Content Predictor → Free basic + Premium advanced
   - Update skill manifests
   - Test server-side execution

4. **Update Client SDK** (Week 2)
   - Add API key support
   - Add skill execution methods
   - Update CLI

5. **Deploy to Production** (Week 3)
   - Configure production database
   - Run migrations
   - Deploy API to hosting

---

## 📝 Files Modified/Created

### Created:
1. `packages/db/.env` - Database configuration
2. `packages/db/prisma/migrations/migration_lock.toml` - Migration tracking
3. `packages/db/prisma/migrations/20250114000000_add_protection_system/migration.sql` - Database schema
4. `MIGRATION_AND_TESTING_SETUP.md` - This guide

### Previously Created (Days 1-2):
- PROTECTION_IMPLEMENTATION_SUMMARY.md
- TESTING_GUIDE.md
- SETUP_PROTECTION.md
- PROGRESS_REPORT.md
- packages/api/src/modules/api-keys/* (6 files)
- packages/api/src/modules/usage-tracking/* (3 files)
- packages/api/src/modules/skill-execution/* (3 files)
- packages/api/src/common/guards/api-key.guard.ts
- packages/db/prisma/schema.prisma (updated)
- packages/api/src/app.module.ts (updated)

---

## ✅ Success Criteria

You'll know the migration was successful when:

- [x] Migration SQL files created
- [ ] `pnpm exec prisma migrate deploy` succeeds
- [ ] All 8 tables exist in database
- [ ] Prisma Client generated without errors
- [ ] API server starts successfully
- [ ] Can generate API keys via API
- [ ] Can execute skills with API key
- [ ] Usage tracking records executions
- [ ] Usage dashboard returns data

---

**Status**: ✅ Migration files ready - Awaiting database configuration

**Next Action**: Configure DATABASE_URL and apply migration

**Time Estimate**: 5-10 minutes (with database already set up)

---

**Last Updated**: 2025-01-14
