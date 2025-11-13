# Stub Prisma Client Setup

## Purpose

This document explains how to set up a stub Prisma Client when engine downloads are blocked (e.g., in restricted network environments).

## Problem

Prisma requires downloading binary engines during `prisma generate`:
```
Error: Failed to fetch the engine file at https://binaries.prisma.sh/...
```

This blocks development when:
- Network access is restricted
- Firewalls block binaries.prisma.sh
- Working in sandboxed environments

## Solution: Stub Client

A minimal stub Prisma Client allows the API to build and type-check without requiring actual engine binaries.

## Setup Instructions

### 1. Create Stub Client Files

Create these three files in `packages/db/node_modules/.prisma/client/`:

#### `index.js`
```javascript
// Stub Prisma Client for development
class PrismaClientStub {
  constructor() {
    this.connected = false;
  }

  async $connect() {
    this.connected = true;
    console.log('✅ [STUB] Prisma Client connected (mock mode)');
    return Promise.resolve();
  }

  async $disconnect() {
    this.connected = false;
    console.log('🔌 [STUB] Prisma Client disconnected (mock mode)');
    return Promise.resolve();
  }

  // Add model delegates that return mock data
  get user() {
    return {
      findUnique: async () => null,
      findMany: async () => [],
      create: async (data) => ({ id: 'stub-id', ...data.data }),
      update: async (params) => ({ id: params.where.id, ...params.data }),
      delete: async () => ({ id: 'stub-id' }),
      count: async () => 0,
    };
  }

  get skill() {
    return {
      findUnique: async () => null,
      findMany: async () => [],
      create: async (data) => ({ id: 'stub-id', ...data.data }),
      update: async (params) => ({ id: params.where.id, ...params.data }),
      delete: async () => ({ id: 'stub-id' }),
      count: async () => 0,
    };
  }

  // Add other models as needed...
}

// Export enums from your Prisma schema
const SkillStatus = {
  PENDING: 'PENDING',
  VALIDATING: 'VALIDATING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DEPRECATED: 'DEPRECATED',
};

module.exports = {
  PrismaClient: PrismaClientStub,
  SkillStatus,
  // Add other enums...
};
```

#### `index.d.ts`
```typescript
// Stub Prisma Client TypeScript definitions
export enum SkillStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEPRECATED = 'DEPRECATED',
}

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  // Add other fields from schema...
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  // Add other fields from schema...
}

interface ModelDelegate<T> {
  findUnique(args: any): Promise<T | null>;
  findMany(args?: any): Promise<T[]>;
  create(args: any): Promise<T>;
  update(args: any): Promise<T>;
  delete(args: any): Promise<T>;
  count(args?: any): Promise<number>;
}

export class PrismaClient {
  constructor();
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;

  readonly user: ModelDelegate<User>;
  readonly skill: ModelDelegate<Skill>;
  // Add other models...
}
```

#### `package.json`
```json
{
  "name": ".prisma/client",
  "main": "index.js",
  "types": "index.d.ts",
  "version": "5.7.1"
}
```

### 2. Build the API

```bash
cd packages/api
rm -rf tsconfig.tsbuildinfo  # Clean build cache
npm run build
```

## Automated Setup Script

Save this as `packages/db/create-stub-client.sh`:

```bash
#!/bin/bash
set -e

STUB_DIR="node_modules/.prisma/client"
mkdir -p "$STUB_DIR"

# Copy the stub files from wherever you keep them
# Or generate them programmatically

echo "✅ Stub Prisma Client created at $STUB_DIR"
echo "⚠️  This is a development stub - database operations return mock data"
```

## When to Use

Use the stub client when:
- ✅ Building/compiling the API
- ✅ Type-checking TypeScript
- ✅ Running without database connectivity
- ✅ CI/CD environments with network restrictions

**Do NOT use in production!**

## Migrating to Real Client

When ready to use real database:

1. **Remove stub:**
   ```bash
   rm -rf packages/db/node_modules/.prisma/
   ```

2. **Generate real client:**
   ```bash
   cd packages/db
   prisma generate
   ```

3. **Set up database:**
   ```bash
   # Run migrations
   prisma migrate deploy

   # Or push schema
   prisma db push
   ```

4. **Update environment:**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

5. **Rebuild API:**
   ```bash
   cd packages/api
   npm run build
   ```

## Troubleshooting

### "Cannot find module '.prisma/client'"
**Solution:** Create the stub client directory and files

### "Type errors in API code"
**Solution:** Ensure `index.d.ts` includes all types used in your API

### "Stub client not returning expected data"
**Solution:** Update stub implementations in `index.js` to match your needs

## Notes

- The stub client is **not committed to git** (in .gitignore)
- Each developer must set it up locally
- Consider creating a setup script in `package.json`:
  ```json
  {
    "scripts": {
      "postinstall": "./create-stub-client.sh"
    }
  }
  ```

## Real Prisma Client

For production deployment:
- Use proper Prisma Client with real database
- Set up migrations
- Configure connection pooling
- Enable query logging for debugging
