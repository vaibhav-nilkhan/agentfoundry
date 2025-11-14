# 🚀 Quick Setup: Protection System

**5-minute setup guide to get the protection system running**

---

## Step 1: Database Setup (2 minutes)

```bash
# Option A: Local PostgreSQL
createdb agentfoundry

export DATABASE_URL="postgresql://user:password@localhost:5432/agentfoundry"

# Option B: Supabase (Free tier - Recommended for testing)
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Copy PostgreSQL connection string
# 4. Add to .env files

echo "DATABASE_URL=postgresql://..." >> packages/db/.env
echo "DATABASE_URL=postgresql://..." >> packages/api/.env
```

---

## Step 2: Run Migration (1 minute)

```bash
cd packages/db

# Generate and apply migration
pnpm prisma migrate dev --name add_protection_system

# You should see:
✔ Migration created successfully
✔ Database schema updated
✔ Prisma Client generated

# Verify tables created
pnpm prisma studio
# Check for: ApiKey, Subscription tables
```

---

## Step 3: Start API (1 minute)

```bash
cd packages/api

# Start development server
pnpm dev

# You should see:
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO Listening on port 4100
[Nest] INFO Swagger docs available at http://localhost:4100/api/docs
```

---

## Step 4: Test Protection System (1 minute)

### Option A: Use Swagger UI
```bash
# Open browser
open http://localhost:4100/api/docs

# Test endpoints:
1. POST /api-keys - Generate API key (requires JWT)
2. POST /skills/execute/:skillId/:toolName - Execute skill
3. GET /usage - Check usage stats
```

### Option B: Use cURL

```bash
# 1. Create test user manually in database
psql $DATABASE_URL << EOF
INSERT INTO "User" (id, "firebaseUid", email, "displayName")
VALUES ('test-user-1', 'firebase-test-1', 'test@example.com', 'Test User');

INSERT INTO "Subscription" ("userId", tier, status, "monthlyLimit", "usageCount", "resetDate", "currentPeriodStart", "currentPeriodEnd")
VALUES ('test-user-1', 'FREE', 'ACTIVE', 100, 0, NOW() + INTERVAL '30 days', NOW(), NOW() + INTERVAL '30 days');

INSERT INTO "ApiKey" ("userId", key, name, tier, scopes)
VALUES ('test-user-1', 'ak_test_demo123456', 'Test Key', 'FREE', ARRAY['skills:execute', 'skills:read']);
EOF

# 2. Test skill execution
curl -X POST http://localhost:4100/skills/execute/test-skill/test-tool \
  -H "Authorization: Bearer ak_test_demo123456" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# 3. Check usage
curl -X GET http://localhost:4100/usage \
  -H "Authorization: Bearer ak_test_demo123456"
```

---

## Step 5: Verify Protection Working

### Test 1: Free user blocked from premium skill
```bash
# Should return 403 Forbidden
curl -X POST http://localhost:4100/skills/execute/premium-skill-id/premium-tool \
  -H "Authorization: Bearer ak_test_demo123456"

# Expected: "Premium skill requires subscription"
```

### Test 2: Invalid API key rejected
```bash
# Should return 401 Unauthorized
curl -X POST http://localhost:4100/skills/execute/skill-id/tool \
  -H "Authorization: Bearer ak_invalid_key"

# Expected: "Invalid API key"
```

### Test 3: Usage tracked
```bash
# Execute a skill
curl -X POST http://localhost:4100/skills/execute/skill-id/tool \
  -H "Authorization: Bearer ak_test_demo123456"

# Check database
psql $DATABASE_URL -c "SELECT * FROM \"SkillUsage\" ORDER BY \"createdAt\" DESC LIMIT 1;"

# Should see: New row with userId, skillId, toolName, executionTime
```

---

## ✅ Success Checklist

After setup, you should have:

- [x] PostgreSQL database running
- [x] ApiKey and Subscription tables created
- [x] API server running on port 4100
- [x] Swagger docs accessible
- [x] Test API key working
- [x] Skill execution endpoint responding
- [x] Usage tracking working
- [x] Premium skill protection working

---

## 🐛 Common Issues

### Issue: "Prisma Client not generated"
```bash
cd packages/db
pnpm prisma generate
```

### Issue: "Cannot connect to database"
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: "Module not found: @agentfoundry/db"
```bash
# Rebuild all packages
cd ../..
pnpm build
```

### Issue: "ApiKeyModule not found"
```bash
# Check imports in app.module.ts
# Restart dev server
cd packages/api
pnpm dev
```

---

## 📊 Next Steps

Once basic setup works:

1. **Add Stripe** (Week 2)
   - Sign up at https://stripe.com
   - Get API keys
   - Add to .env
   - Test subscription flow

2. **Convert Skills** (Week 2)
   - Choose 2-3 premium skills
   - Move code to server-side only
   - Test execution endpoint

3. **Deploy** (Week 3)
   - Railway / Vercel
   - Configure production DATABASE_URL
   - Run migrations in production
   - Test live

---

**Total Setup Time:** ~5 minutes
**Status:** ✅ Ready to test!

See `TESTING_GUIDE.md` for comprehensive test scenarios.
