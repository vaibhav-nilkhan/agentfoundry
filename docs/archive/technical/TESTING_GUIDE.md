# 🧪 AgentFoundry Protection System - Testing Guide

**Date**: 2025-01-14
**Purpose**: Step-by-step guide to test the hybrid protection system

---

## 📋 Prerequisites

### 1. Database Setup

```bash
# Create PostgreSQL database (local or cloud)
createdb agentfoundry

# Or use cloud provider:
# - Supabase (free tier)
# - Railway (free tier)
# - Neon (free tier)

# Update .env files with DATABASE_URL
echo "DATABASE_URL=postgresql://user:password@localhost:5432/agentfoundry" >> packages/db/.env
echo "DATABASE_URL=postgresql://user:password@localhost:5432/agentfoundry" >> packages/api/.env
```

### 2. Generate Migration

```bash
cd packages/db

# Generate Prisma migration for protection system
pnpm prisma migrate dev --name add_protection_system

# This creates:
# - ApiKey table
# - Subscription table
# - Updates SkillUsage table
# - Adds new enums

# Expected output:
✔ Migration created: 20250114_add_protection_system
✔ Database schema updated
✔ Prisma Client generated
```

### 3. Seed Initial Data (Optional)

```bash
# Create seed file
cd packages/db

cat > prisma/seed-protection.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.create({
    data: {
      firebaseUid: 'test-user-123',
      email: 'test@agentfoundry.dev',
      displayName: 'Test User',
    },
  });

  // Create free subscription
  await prisma.subscription.create({
    data: {
      userId: user.id,
      tier: 'FREE',
      status: 'ACTIVE',
      monthlyLimit: 100,
      usageCount: 0,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create test API key
  await prisma.apiKey.create({
    data: {
      userId: user.id,
      key: 'ak_test_demo123456789',
      name: 'Test API Key',
      tier: 'FREE',
      scopes: ['skills:execute', 'skills:read'],
    },
  });

  console.log('✅ Seed data created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
EOF

# Run seed
pnpm tsx prisma/seed-protection.ts
```

---

## 🧪 Testing Flow

### Test 1: API Key Generation

**Endpoint:** `POST /api-keys`

```bash
# 1. First, authenticate with Supabase to get JWT
# (In production, users sign up through your website)

# 2. Generate API key
curl -X POST http://localhost:4100/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  -d '{
    "name": "My Production Key",
    "scopes": ["skills:execute", "skills:read"]
  }'

# Expected Response:
{
  "id": "clr123abc",
  "key": "ak_live_Xy9Z...a1B2",  # ← Save this!
  "name": "My Production Key",
  "tier": "FREE",
  "scopes": ["skills:execute", "skills:read"],
  "active": true,
  "createdAt": "2025-01-14T10:00:00Z"
}
```

**What happens:**
1. ✅ User authenticated via Supabase JWT
2. ✅ Secure 32-byte random key generated
3. ✅ Key stored in database with user association
4. ✅ User's subscription tier attached to key

---

### Test 2: List API Keys

**Endpoint:** `GET /api-keys`

```bash
curl -X GET http://localhost:4100/api-keys \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT"

# Expected Response:
[
  {
    "id": "clr123abc",
    "name": "My Production Key",
    "key": "ak_live_***a1B2",  # ← Masked for security
    "tier": "FREE",
    "active": true,
    "lastUsedAt": null,
    "usageCount": 0,
    "createdAt": "2025-01-14T10:00:00Z"
  }
]
```

---

### Test 3: Execute Free Skill (Should Work)

**Endpoint:** `POST /skills/execute/:skillId/:toolName`

```bash
# Execute a FREE skill (no subscription needed)
curl -X POST http://localhost:4100/skills/execute/free-skill-id/basic_tool \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ak_live_Xy9Z...a1B2" \
  -d '{
    "input": "test data"
  }'

# Expected Response:
{
  "result": "...",
  "success": true
}
```

**What happens:**
1. ✅ API key validated
2. ✅ Skill loaded from `/skills/production/skill-name/`
3. ✅ Skill executed on YOUR server
4. ✅ Usage tracked in database
5. ✅ Result returned (code never exposed)

---

### Test 4: Execute Premium Skill WITHOUT Subscription (Should Fail)

```bash
curl -X POST http://localhost:4100/skills/execute/viral-content-predictor/predict_virality \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ak_live_Xy9Z...a1B2" \
  -d '{
    "content": "My viral tweet",
    "platform": "twitter"
  }'

# Expected Response: 403 Forbidden
{
  "statusCode": 403,
  "message": "Premium skill requires subscription. Upgrade at https://agentfoundry.ai/pricing"
}
```

**What happens:**
1. ✅ API key validated
2. ✅ Skill found (viral-content-predictor)
3. ✅ Skill is premium (pricingType = FREEMIUM)
4. ✅ User has FREE tier
5. ❌ Access denied - subscription required
6. ✅ User prompted to upgrade

---

### Test 5: Upgrade to Premium & Execute (Should Work)

```bash
# 1. Upgrade user to CREATOR tier (manual for testing)
# In production, this happens via Stripe webhook

# Update in database:
UPDATE "Subscription"
SET tier = 'CREATOR', "monthlyLimit" = NULL
WHERE "userId" = 'user-id';

# 2. Try again
curl -X POST http://localhost:4100/skills/execute/viral-content-predictor/predict_virality \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ak_live_Xy9Z...a1B2" \
  -d '{
    "content": "Breaking: AI just solved world hunger",
    "platform": "twitter"
  }'

# Expected Response: 200 OK
{
  "overall_score": 87,
  "rating": "excellent",
  "breakdown": {
    "hook_strength": 95,
    "structure": 82,
    "emotional_resonance": 90,
    "trend_alignment": 88,
    "visual_appeal": 70,
    "call_to_action": 85
  },
  "predicted_metrics": {
    "impressions": 45000,
    "likes": 3200,
    "shares": 890,
    "comments": 230
  },
  "improvements": []
}
```

**What happens:**
1. ✅ API key validated
2. ✅ User has CREATOR subscription
3. ✅ Skill code loaded from YOUR server
4. ✅ Proprietary algorithm executes
5. ✅ Results returned
6. ✅ Usage tracked (+1 to counter)
7. ✅ User NEVER sees your code

---

### Test 6: Check Usage Stats

**Endpoint:** `GET /usage`

```bash
curl -X GET http://localhost:4100/usage \
  -H "Authorization: Bearer ak_live_Xy9Z...a1B2"

# Expected Response:
{
  "period": {
    "start": "2025-01-01T00:00:00Z",
    "end": "2025-01-31T23:59:59Z"
  },
  "usage": {
    "total": 15,
    "success": 14,
    "failures": 1
  },
  "limit": null,  # null = unlimited (CREATOR tier)
  "remaining": null,
  "resetDate": "2025-02-01T00:00:00Z",
  "breakdown": [
    {
      "skillName": "Viral Content Predictor",
      "totalExecutions": 10,
      "avgExecutionTime": 234
    },
    {
      "skillName": "Technical Debt Quantifier",
      "totalExecutions": 5,
      "avgExecutionTime": 1250
    }
  ]
}
```

---

### Test 7: Hit Usage Limit (Free Tier)

```bash
# Downgrade to FREE tier with 100/month limit
UPDATE "Subscription"
SET tier = 'FREE', "monthlyLimit" = 100, "usageCount" = 100
WHERE "userId" = 'user-id';

# Try to execute
curl -X POST http://localhost:4100/skills/execute/skill-id/tool \
  -H "Authorization: Bearer ak_live_xxx"

# Expected Response: 403 Forbidden
{
  "statusCode": 403,
  "message": "Monthly usage limit exceeded. Upgrade your plan at https://agentfoundry.ai/pricing"
}
```

---

### Test 8: Revoke API Key

```bash
curl -X DELETE http://localhost:4100/api-keys/clr123abc \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT"

# Try to use revoked key
curl -X POST http://localhost:4100/skills/execute/skill-id/tool \
  -H "Authorization: Bearer ak_live_Xy9Z...a1B2"

# Expected Response: 401 Unauthorized
{
  "statusCode": 401,
  "message": "API key has been revoked"
}
```

---

## 🔍 Database Verification

```sql
-- Check API keys
SELECT id, "userId", name, tier, active, "usageCount", "lastUsedAt"
FROM "ApiKey"
WHERE active = true;

-- Check subscriptions
SELECT u.email, s.tier, s.status, s."usageCount", s."monthlyLimit"
FROM "Subscription" s
JOIN "User" u ON s."userId" = u.id;

-- Check skill usage
SELECT
  u.email,
  sk.name as skill_name,
  su."toolName",
  su.success,
  su."executionTime",
  su."createdAt"
FROM "SkillUsage" su
JOIN "User" u ON su."userId" = u.id
JOIN "Skill" sk ON su."skillId" = sk.id
ORDER BY su."createdAt" DESC
LIMIT 10;
```

---

## 🚨 Security Tests

### Test 1: Invalid API Key
```bash
curl -X POST http://localhost:4100/skills/execute/skill-id/tool \
  -H "Authorization: Bearer ak_live_invalid123"

# Expected: 401 Unauthorized
```

### Test 2: No API Key
```bash
curl -X POST http://localhost:4100/skills/execute/skill-id/tool

# Expected: 401 Unauthorized
```

### Test 3: Expired API Key
```bash
# Set expiration in past
UPDATE "ApiKey" SET "expiresAt" = '2024-01-01' WHERE key = 'ak_live_xxx';

# Try to use
# Expected: 401 Unauthorized - "API key has expired"
```

### Test 4: Wrong User's Skill
```bash
# User A tries to delete User B's API key
curl -X DELETE http://localhost:4100/api-keys/user-b-key-id \
  -H "Authorization: Bearer USER_A_JWT"

# Expected: 401 Unauthorized
```

---

## 📊 Load Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test 100 concurrent requests
ab -n 1000 -c 100 \
  -H "Authorization: Bearer ak_live_xxx" \
  -H "Content-Type: application/json" \
  -p payload.json \
  http://localhost:4100/skills/execute/skill-id/tool

# Monitor:
# - Response times
# - Error rate
# - Database connection pool
# - Memory usage
```

---

## ✅ Success Criteria

All tests should:
- ✅ API keys generate successfully
- ✅ Free users can access free skills
- ✅ Free users BLOCKED from premium skills
- ✅ Premium users can access all skills
- ✅ Usage tracked accurately
- ✅ Limits enforced properly
- ✅ Revoked keys rejected
- ✅ Invalid keys rejected
- ✅ No skill code exposed to users

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Regenerate Prisma client
cd packages/db
pnpm prisma generate
```

### Issue: "Module not found: skill"
```bash
# Check skill exists
ls -la skills/production/skill-slug/

# Check TypeScript compilation
cd skills/production/skill-slug
npm run build
```

### Issue: "API key validation fails"
```bash
# Check ApiKeyGuard is registered
# Check PrismaModule is imported
# Check database has ApiKey table
```

---

## 📈 Monitoring in Production

```typescript
// Add to skill-execution.service.ts
console.log(`[EXECUTION] User: ${userId}, Skill: ${skillId}, Time: ${executionTime}ms`);

// Monitor:
// - Average execution time per skill
// - Error rate by skill
// - Most popular skills
// - Peak usage times
// - Failed executions (for debugging)
```

---

**Next Steps:**
1. Run all tests locally
2. Fix any bugs found
3. Deploy to staging
4. Run tests on staging
5. Deploy to production

---

**Last Updated**: 2025-01-14
