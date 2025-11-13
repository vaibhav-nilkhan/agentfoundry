# AgentFoundry API Backend Setup

## Build Status: ✅ Working

The NestJS API backend has been successfully configured and builds correctly.

## ⚠️ Known Limitations

### Prisma Client - Stub Mode
Due to network restrictions preventing Prisma engine downloads, a **stub Prisma Client** has been created for development purposes:

**Location:** `../db/node_modules/.prisma/client/`

**What this means:**
- ✅ API compiles and builds successfully
- ✅ TypeScript types are correct
- ✅ All endpoints are defined and functional
- ⚠️ Database operations return mock data
- ⚠️ No actual database connectivity in this mode

**To use real database:**
1. Remove stub: `rm -rf packages/db/node_modules/.prisma/`
2. Generate client: `cd packages/db && prisma generate`
3. Rebuild: `cd packages/api && npm run build`

## 🚀 Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cd /home/user/agentfoundry/packages/api
cp .env.example .env
```

**Required Environment Variables:**
```env
# Server
PORT=4100
NODE_ENV=development
CORS_ORIGIN=http://localhost:3100

# Supabase (for auth)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/agentfoundry"

# Redis
REDIS_URL=redis://localhost:6379

# Validator Service
VALIDATOR_URL=http://localhost:5100
```

### 2. Build the API

**First Time / After Clean:**
```bash
# Clean any stale build cache
rm -rf tsconfig.tsbuildinfo

# Build
npm run build
```

**Subsequent Builds:**
```bash
npm run build
```

### 3. Run the API

**Development Mode (watch mode):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The API will be available at `http://localhost:4100`

## 📊 API Documentation

Once running, Swagger documentation is available at:
```
http://localhost:4100/api/docs
```

## 🛣️ Available Endpoints

### Skills (`/api/v1/skills`)
- `GET /api/v1/skills` - List all approved skills (public)
- `GET /api/v1/skills/:id` - Get skill details (public)
- `POST /api/v1/skills` - Create skill (requires auth)
- `PUT /api/v1/skills/:id` - Update skill (requires auth)
- `DELETE /api/v1/skills/:id` - Delete skill (requires auth)

### Auth (`/api/v1/auth`)
- Authentication endpoints (Supabase JWT)

### Users (`/api/v1/users`)
- User profile management

### Validation (`/api/v1/validation`)
- Skill validation operations

## 🔒 Authentication

The API uses **Supabase JWT tokens** for authentication:

1. Public endpoints are marked with `@Public()` decorator
2. Protected endpoints require Bearer token:
   ```
   Authorization: Bearer <supabase_jwt_token>
   ```

### How Auth Works:
- **Guard:** `SupabaseAuthGuard` validates tokens
- **Decorator:** `@CurrentUser()` injects user data into controllers
- **Token Verification:** Done via Supabase Auth API

## 🏗️ Project Structure

```
packages/api/
├── src/
│   ├── app.module.ts              # Root module
│   ├── main.ts                    # Bootstrap
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   └── guards/
│   │       └── supabase-auth.guard.ts
│   ├── config/
│   │   ├── prisma.module.ts       # Prisma configuration
│   │   ├── prisma.service.ts
│   │   ├── supabase.module.ts     # Supabase configuration
│   │   └── supabase.service.ts
│   └── modules/
│       ├── skills/                 # Skills marketplace
│       ├── auth/                   # Authentication
│       ├── users/                  # User profiles
│       └── validation/             # Skill validation
├── dist/                           # Compiled output
├── package.json
└── tsconfig.json
```

## 🔧 Development

### Adding New Endpoints

1. Generate resource:
   ```bash
   npx nest g resource modules/your-resource
   ```

2. Update module in `app.module.ts`

3. Add authentication if needed:
   ```typescript
   @Controller('your-resource')
   @UseGuards(SupabaseAuthGuard)  // Protect all routes
   export class YourResourceController {

     @Get()
     @Public()  // Make specific route public
     findAll() { ... }
   }
   ```

### Clearing Build Cache

If builds aren't working:
```bash
rm -rf tsconfig.tsbuildinfo dist
npm run build
```

## 🐛 Troubleshooting

### Issue: "Prisma Client not found"
**Solution:** The stub client should be at `../db/node_modules/.prisma/client/`. If missing, recreate it or generate real Prisma client.

### Issue: "Build completes but no dist folder"
**Solution:** Clean the incremental cache:
```bash
rm -rf tsconfig.tsbuildinfo
npm run build
```

### Issue: "Port 4100 already in use"
**Solution:** Change PORT in `.env` file or kill existing process:
```bash
lsof -ti:4100 | xargs kill -9
```

## 🎯 Next Steps

1. **Set up real database:** Configure PostgreSQL and run migrations
2. **Generate Prisma client:** Once network allows or in production
3. **Configure Supabase:** Set up project and get credentials
4. **Set up Redis:** For caching and rate limiting
5. **Deploy validator service:** Python FastAPI service for skill validation

## 📝 Notes

- **TypeScript version:** 5.3.3
- **NestJS version:** 10.3.0
- **Node version:** >=20.0.0
- **Package manager:** npm (workspace uses pnpm at root)

## ✅ Health Check

To verify the API is working:
```bash
curl http://localhost:4100/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T..."
}
```
