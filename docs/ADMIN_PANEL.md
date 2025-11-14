# Admin Panel Documentation

> **Version**: 1.0.0
> **Last Updated**: 2025-11-14
> **Purpose**: Comprehensive guide to the AgentFoundry Admin Panel

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Frontend Pages](#frontend-pages)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Usage Guide](#usage-guide)
8. [Development](#development)

---

## Overview

The AgentFoundry Admin Panel provides comprehensive platform management capabilities for administrators and moderators. It includes:

- **Dashboard**: Real-time platform statistics and insights
- **User Management**: User accounts, roles, and status management
- **Skill Moderation**: Approve, reject, or deprecate skill submissions
- **Subscription Management**: Monitor and manage user subscriptions
- **Analytics**: Revenue trends, user growth, and platform metrics
- **Settings**: Platform configuration and admin preferences

### Key Features

- ✅ **Role-Based Access Control** (RBAC): Admin, Moderator, and User roles
- ✅ **Real-Time Data**: Live stats from PostgreSQL database via Prisma
- ✅ **Interactive Charts**: Revenue and growth trend visualization
- ✅ **Bulk Actions**: Manage multiple users or skills simultaneously
- ✅ **Search & Filters**: Advanced filtering and search capabilities
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile

---

## Architecture

### Tech Stack

**Frontend** (`packages/web/src/app/admin/`):
- **Framework**: Next.js 15 (App Router) with React Server Components
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **State Management**: React hooks (useState, useEffect)
- **Charting**: Custom CSS-based charts (upgradeable to Recharts)

**Backend** (`packages/api/src/modules/admin/`):
- **Framework**: NestJS with TypeScript
- **ORM**: Prisma Client
- **Database**: PostgreSQL 15
- **API Docs**: OpenAPI/Swagger (available at `/api/docs`)
- **Authentication**: API Key Guard + Admin Guard

### Directory Structure

```
packages/
├── web/src/app/admin/          # Frontend pages
│   ├── page.tsx               # Dashboard
│   ├── users/page.tsx         # User management
│   ├── skills/page.tsx        # Skill moderation
│   ├── subscriptions/page.tsx # Subscription management
│   ├── analytics/page.tsx     # Analytics & charts
│   └── settings/page.tsx      # Admin settings
│
├── api/src/modules/admin/      # Backend API
│   ├── admin.controller.ts    # REST endpoints
│   ├── admin.service.ts       # Business logic
│   └── admin.module.ts        # NestJS module
│
└── api/src/common/guards/      # Security
    ├── api-key.guard.ts       # API key authentication
    └── admin.guard.ts         # Role-based authorization
```

---

## Frontend Pages

### 1. Dashboard (`/admin`)

**Purpose**: Platform overview and key metrics

**Features**:
- Total users, revenue, subscriptions, and skills
- User growth rate and new users in last 7/30 days
- Recent user registrations
- Pending skill moderation queue
- Revenue trend chart (placeholder for full implementation)

**API Calls**:
```typescript
GET ${API_BASE_URL}/api/admin/dashboard
```

**Response**:
```json
{
  "overview": {
    "totalUsers": 1247,
    "newUsersLast30Days": 342,
    "newUsersLast7Days": 89,
    "userGrowthRate": "12.4%",
    "activeSubscriptions": 156,
    "totalSkills": 8,
    "pendingSkills": 0,
    "totalApiKeys": 289
  },
  "revenue": {
    "mrr": 8964,
    "arr": 107568,
    "averageRevenuePerUser": "7.19"
  },
  "usage": {
    "totalExecutions": 45892,
    "executionsPerUser": 37
  }
}
```

---

### 2. User Management (`/admin/users`)

**Purpose**: Manage user accounts, roles, and status

**Features**:
- Paginated user list with search
- Filter by role (Admin, Moderator, User)
- Filter by status (Active, Suspended, Banned)
- View user details (skills, API keys, subscriptions)
- Update user status (suspend, ban, activate)
- Change user role

**API Calls**:
```typescript
// List users
GET ${API_BASE_URL}/api/admin/users?page=1&limit=20&search=john&role=USER&status=ACTIVE

// Get user details
GET ${API_BASE_URL}/api/admin/users/:id

// Update user status
PUT ${API_BASE_URL}/api/admin/users/:id/status
Body: { "status": "SUSPENDED", "reason": "Policy violation" }

// Update user role
PUT ${API_BASE_URL}/api/admin/users/:id/role
Body: { "role": "MODERATOR" }
```

**Response** (List):
```json
{
  "users": [
    {
      "id": "user_123",
      "email": "john@example.com",
      "displayName": "John Doe",
      "role": "USER",
      "status": "ACTIVE",
      "verified": true,
      "reputation": 125,
      "createdAt": "2025-01-10T00:00:00.000Z",
      "subscription": {
        "tier": "CREATOR",
        "status": "ACTIVE"
      },
      "_count": {
        "skills": 3,
        "apiKeys": 2
      }
    }
  ],
  "pagination": {
    "total": 1247,
    "page": 1,
    "limit": 20,
    "totalPages": 63
  }
}
```

---

### 3. Skill Moderation (`/admin/skills`)

**Purpose**: Review and moderate skill submissions

**Features**:
- Paginated skill list with search
- Filter by status (Pending, Approved, Rejected, Deprecated)
- View skill details (author, downloads, rating, reviews)
- Approve or reject pending skills
- Deprecate approved skills

**API Calls**:
```typescript
// List skills
GET ${API_BASE_URL}/api/admin/skills?page=1&limit=20&status=PENDING&search=security

// Update skill status
PUT ${API_BASE_URL}/api/admin/skills/:id/status
Body: { "status": "APPROVED" }
```

**Response** (List):
```json
{
  "skills": [
    {
      "id": "skill_123",
      "name": "Viral Content Predictor",
      "slug": "viral-content-predictor",
      "description": "Predict content virality before publishing",
      "status": "APPROVED",
      "pricingType": "FREEMIUM",
      "downloads": 1245,
      "rating": 4.8,
      "author": {
        "id": "user_1",
        "email": "team@agentfoundry.dev",
        "displayName": "AgentFoundry Team"
      },
      "createdAt": "2025-01-10T00:00:00.000Z",
      "publishedAt": "2025-01-10T00:00:00.000Z",
      "_count": {
        "reviews": 89,
        "usage": 5432
      }
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

### 4. Subscription Management (`/admin/subscriptions`)

**Purpose**: Monitor and manage user subscriptions

**Features**:
- Paginated subscription list
- Filter by tier (Free, Creator, Pro, Enterprise)
- Filter by status (Active, Past Due, Canceled, Trialing)
- View subscription details (user, tier, status, usage)
- Cancel subscriptions (admin action)

**API Calls**:
```typescript
// List subscriptions
GET ${API_BASE_URL}/api/admin/subscriptions?page=1&limit=20&tier=PRO&status=ACTIVE

// Cancel subscription
POST ${API_BASE_URL}/api/admin/subscriptions/:id/cancel
Body: { "reason": "Policy violation" }
```

**Response** (List):
```json
{
  "subscriptions": [
    {
      "id": "sub_123",
      "tier": "PRO",
      "status": "ACTIVE",
      "usageCount": 1245,
      "monthlyLimit": null,
      "resetDate": "2025-02-14T00:00:00.000Z",
      "currentPeriodEnd": "2025-02-14T00:00:00.000Z",
      "user": {
        "id": "user_123",
        "email": "jane@example.com",
        "displayName": "Jane Smith"
      },
      "createdAt": "2024-12-14T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### 5. Analytics (`/admin/analytics`)

**Purpose**: Platform performance insights and trends

**Features**:
- Revenue growth and user growth metrics
- Interactive revenue trend chart (bar chart)
- Interactive user growth chart (bar chart)
- Top skills by usage (horizontal bars)
- Subscription distribution by tier
- Revenue by tier table (MRR, growth, churn)
- Time range selector (7, 30, 90 days)

**API Calls**:
```typescript
// Revenue analytics
GET ${API_BASE_URL}/api/admin/analytics/revenue?days=30

// User growth analytics
GET ${API_BASE_URL}/api/admin/analytics/growth?days=30
```

**Response** (Revenue):
```json
[
  {
    "date": "2025-01-14",
    "revenue": 3822,
    "subscriptions": 42
  },
  {
    "date": "2025-01-15",
    "revenue": 4155,
    "subscriptions": 45
  }
]
```

**Response** (Growth):
```json
[
  {
    "date": "2025-01-14",
    "newUsers": 12,
    "total": 1235
  },
  {
    "date": "2025-01-15",
    "newUsers": 15,
    "total": 1250
  }
]
```

---

### 6. Settings (`/admin/settings`)

**Purpose**: Admin panel configuration

**Status**: UI implemented, functionality pending

**Planned Features**:
- Platform settings (maintenance mode, feature flags)
- Email notification preferences
- API rate limits
- Security settings

---

## Backend API Endpoints

### Base URL

```
http://localhost:4100/api/admin
```

### Authentication

All admin endpoints require:
1. **API Key Authentication** (via `ApiKeyGuard`)
2. **Admin Role Authorization** (via `AdminGuard`)

**Headers**:
```http
Content-Type: application/json
X-API-Key: your_api_key_here
```

Or:
```http
Authorization: Bearer your_jwt_token_here
```

---

### Endpoints

#### 1. Dashboard

```http
GET /api/admin/dashboard
```

**Description**: Get comprehensive dashboard statistics

**Response**: See [Dashboard](#1-dashboard-admin) section

---

#### 2. Analytics

```http
GET /api/admin/analytics/revenue?days=30
```

**Query Parameters**:
- `days` (optional, number): Number of days to analyze (default: 30)

**Response**: Array of daily revenue data

```http
GET /api/admin/analytics/growth?days=30
```

**Query Parameters**:
- `days` (optional, number): Number of days to analyze (default: 30)

**Response**: Array of daily user growth data

---

#### 3. User Management

```http
GET /api/admin/users?page=1&limit=20&search=john&role=USER&status=ACTIVE
```

**Query Parameters**:
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20)
- `search` (optional, string): Search by email or name
- `role` (optional, enum): USER, ADMIN, MODERATOR
- `status` (optional, enum): ACTIVE, SUSPENDED, BANNED

---

```http
GET /api/admin/users/:id
```

**Path Parameters**:
- `id` (required, string): User ID

**Response**: Detailed user information with skills, API keys, and usage

---

```http
PUT /api/admin/users/:id/status
```

**Path Parameters**:
- `id` (required, string): User ID

**Body**:
```json
{
  "status": "SUSPENDED",
  "reason": "Policy violation"
}
```

**Valid Status Values**:
- `ACTIVE`: User can access platform
- `SUSPENDED`: Temporary suspension
- `BANNED`: Permanent ban

---

```http
PUT /api/admin/users/:id/role
```

**Path Parameters**:
- `id` (required, string): User ID

**Body**:
```json
{
  "role": "MODERATOR"
}
```

**Valid Role Values**:
- `USER`: Regular user
- `MODERATOR`: Can moderate skills
- `ADMIN`: Full access

---

#### 4. Skill Management

```http
GET /api/admin/skills?page=1&limit=20&status=PENDING&search=security
```

**Query Parameters**:
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20)
- `status` (optional, enum): PENDING, APPROVED, REJECTED, DEPRECATED
- `search` (optional, string): Search by name or description

---

```http
PUT /api/admin/skills/:id/status
```

**Path Parameters**:
- `id` (required, string): Skill ID

**Body**:
```json
{
  "status": "APPROVED"
}
```

**Valid Status Values**:
- `PENDING`: Awaiting review
- `APPROVED`: Skill is live
- `REJECTED`: Skill rejected
- `DEPRECATED`: Skill no longer maintained

---

#### 5. Subscription Management

```http
GET /api/admin/subscriptions?page=1&limit=20&tier=PRO&status=ACTIVE
```

**Query Parameters**:
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 20)
- `tier` (optional, enum): FREE, CREATOR, PRO, ENTERPRISE
- `status` (optional, enum): ACTIVE, PAST_DUE, CANCELED, TRIALING

---

```http
POST /api/admin/subscriptions/:id/cancel
```

**Path Parameters**:
- `id` (required, string): Subscription ID

**Body**:
```json
{
  "reason": "Admin cancellation: Policy violation"
}
```

**Effect**:
- Sets status to `CANCELED`
- Sets tier to `FREE`
- Sets `monthlyLimit` to 100 operations
- Records `canceledAt` timestamp

---

## Database Schema

### User Model (Extended)

```prisma
model User {
  id                String     @id @default(cuid())
  email             String     @unique
  displayName       String?
  avatarUrl         String?
  role              UserRole   @default(USER)
  status            UserStatus @default(ACTIVE)
  verified          Boolean    @default(false)
  reputation        Int        @default(0)
  suspendedAt       DateTime?
  suspendedReason   String?
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  // Relations
  skills            Skill[]
  apiKeys           ApiKey[]
  subscription      Subscription?
  skillUsage        SkillUsage[]
}

enum UserRole {
  USER
  ADMIN
  MODERATOR
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
}
```

### Subscription Model

```prisma
model Subscription {
  id                    String              @id @default(cuid())
  userId                String              @unique
  user                  User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  tier                  SubscriptionTier    @default(FREE)
  status                SubscriptionStatus  @default(ACTIVE)
  monthlyLimit          Int?
  usageCount            Int                 @default(0)
  resetDate             DateTime?
  currentPeriodStart    DateTime?
  currentPeriodEnd      DateTime?
  canceledAt            DateTime?
  stripeCustomerId      String?
  stripeSubscriptionId  String?             @unique
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
}

enum SubscriptionTier {
  FREE
  CREATOR
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  TRIALING
  INCOMPLETE
}
```

---

## Authentication & Authorization

### Guards

#### 1. API Key Guard (`api-key.guard.ts`)

**Purpose**: Verify API key or JWT token

**Implementation**:
```typescript
@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const token = request.headers.authorization?.split(' ')[1];

    // Verify API key or JWT token
    // Attach user to request
    return true;
  }
}
```

#### 2. Admin Guard (`admin.guard.ts`)

**Purpose**: Verify user has admin or moderator role

**Implementation**:
```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return user && (user.role === 'ADMIN' || user.role === 'MODERATOR');
  }
}
```

### Usage in Controllers

```typescript
@Controller('admin')
@UseGuards(ApiKeyGuard, AdminGuard)
@ApiBearerAuth('ApiKey')
export class AdminController {
  // All routes protected by API key and admin role
}
```

---

## Usage Guide

### For Developers

#### 1. Start the Services

```bash
# Start all services
pnpm dev

# Or start individually
pnpm --filter @agentfoundry/web dev    # Frontend (port 3100)
pnpm --filter @agentfoundry/api dev    # Backend API (port 4100)
```

#### 2. Access Admin Panel

Navigate to: `http://localhost:3100/admin`

#### 3. View API Documentation

Navigate to: `http://localhost:4100/api/docs`

---

### For Admins

#### Managing Users

1. Navigate to `/admin/users`
2. Use search and filters to find users
3. Click "View" to see user details
4. Click "Edit" to update role or status

**To Suspend a User**:
1. Find the user in the list
2. Click "Edit"
3. Select "Suspended" status
4. Enter suspension reason
5. Save changes

**To Promote to Moderator**:
1. Find the user in the list
2. Click "Edit"
3. Change role to "Moderator"
4. Save changes

---

#### Moderating Skills

1. Navigate to `/admin/skills`
2. Filter by "Pending" status to see skills awaiting review
3. Click skill name to view full details
4. Review code, documentation, and tests
5. Click "Approve" or "Reject"

**Approval Checklist**:
- ✅ Code is well-documented
- ✅ Tests are passing (>80% coverage)
- ✅ No security vulnerabilities
- ✅ Follows skill specification
- ✅ Clear README and examples

---

#### Monitoring Subscriptions

1. Navigate to `/admin/subscriptions`
2. View active subscriptions and revenue
3. Filter by tier or status
4. Click subscription to view details

**To Cancel a Subscription**:
1. Find the subscription
2. Click "Cancel"
3. Enter cancellation reason
4. Confirm action

---

#### Viewing Analytics

1. Navigate to `/admin/analytics`
2. Select time range (7, 30, 90 days)
3. View revenue trends, user growth, and skill usage
4. Export reports for external analysis

---

## Development

### Adding New Admin Features

#### 1. Create Frontend Page

```bash
# Create new page
touch packages/web/src/app/admin/feature/page.tsx
```

#### 2. Create Backend Endpoint

```typescript
// In packages/api/src/modules/admin/admin.controller.ts

@Get('feature')
@ApiOperation({ summary: 'Get feature data' })
async getFeatureData() {
  return this.adminService.getFeatureData();
}
```

#### 3. Add Service Method

```typescript
// In packages/api/src/modules/admin/admin.service.ts

async getFeatureData() {
  const data = await this.prisma.feature.findMany();
  return { data };
}
```

#### 4. Update Frontend to Call API

```typescript
// In packages/web/src/app/admin/feature/page.tsx

const response = await fetch(`${API_BASE_URL}/api/admin/feature`, {
  headers: {
    'Content-Type': 'application/json',
    // TODO: Add auth header
  },
  cache: 'no-store',
});
```

---

### Testing

#### Backend Tests

```bash
cd packages/api
pnpm test src/modules/admin/admin.service.spec.ts
```

#### Frontend Tests

```bash
cd packages/web
pnpm test src/app/admin
```

---

## Next Steps

### Planned Enhancements

1. **Authentication Integration**
   - Integrate Supabase Auth
   - Add JWT token management
   - Implement session handling

2. **Advanced Analytics**
   - Integrate Recharts for better visualizations
   - Add export to CSV/PDF functionality
   - Real-time updates with WebSockets

3. **Bulk Actions**
   - Multi-select for users and skills
   - Bulk approve/reject skills
   - Bulk email notifications

4. **Audit Logs**
   - Track all admin actions
   - View audit trail
   - Export logs for compliance

5. **Settings Implementation**
   - Platform-wide feature flags
   - Email notification configuration
   - Rate limit adjustments

---

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/yourusername/agentfoundry/issues
- **Documentation**: See `/docs` directory
- **API Docs**: http://localhost:4100/api/docs

---

**Last Updated**: 2025-11-14
