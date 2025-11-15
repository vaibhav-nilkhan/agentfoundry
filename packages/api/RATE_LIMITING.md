# Rate Limiting Documentation

> **Implementation Date**: November 15, 2025
> **Storage**: Redis-based distributed rate limiting
> **Library**: @nestjs/throttler with custom Redis storage

---

## Overview

AgentFoundry implements **Redis-based rate limiting** to protect the API from abuse and ensure fair usage across all users. Rate limits are applied globally to all endpoints with customizable limits based on user type and endpoint sensitivity.

---

## Rate Limit Tiers

### 1. Public Endpoints (Unauthenticated)
**Limit**: 30 requests per minute
**Use Case**: Public marketplace browsing, skill discovery
**Decorator**: `@PublicThrottle()`

```typescript
@Get('public/skills')
@PublicThrottle()
async getPublicSkills() {
  // 30 requests/minute for unauthenticated users
}
```

### 2. Authenticated User Endpoints
**Limit**: 100 requests per minute
**Use Case**: Standard user operations, skill installations
**Decorator**: `@AuthThrottle()`

```typescript
@Get('my-skills')
@AuthThrottle()
async getMySkills() {
  // 100 requests/minute for authenticated users
}
```

### 3. Pro User Endpoints
**Limit**: 300 requests per minute
**Use Case**: Pro subscription users with higher limits
**Decorator**: `@ProThrottle()`

```typescript
@Post('execute-skill')
@ProThrottle()
async executeSkill() {
  // 300 requests/minute for Pro users
}
```

### 4. Admin Endpoints
**Limit**: 1000 requests per minute
**Use Case**: Admin panel operations
**Decorator**: `@AdminThrottle()`

```typescript
@Get('admin/dashboard')
@AdminThrottle()
async getDashboard() {
  // 1000 requests/minute for admins
}
```

### 5. Skill Execution Endpoints
**Limit**: 60 requests per minute
**Use Case**: Individual skill execution
**Decorator**: `@SkillExecutionThrottle()`

```typescript
@Post('skills/:id/execute')
@SkillExecutionThrottle()
async executeSkill() {
  // 60 requests/minute for skill execution
}
```

### 6. Validation Endpoints (Compute-Intensive)
**Limit**: 10 requests per minute
**Use Case**: Skill validation (CPU/memory intensive)
**Decorator**: `@ValidationThrottle()`

```typescript
@Post('validate')
@ValidationThrottle()
async validateSkill() {
  // 10 requests/minute for validation
}
```

### 7. No Throttle (Health Checks)
**Limit**: Unlimited
**Use Case**: Health checks, monitoring endpoints
**Decorator**: `@SkipThrottle()`

```typescript
@Get('health')
@SkipThrottle()
async getHealth() {
  // No rate limiting
}
```

---

## Default Configuration

**Global Default**: 60 requests per minute (for all endpoints without specific decorators)

```typescript
// packages/api/src/app.module.ts
ThrottlerModule.forRoot({
  throttlers: [
    {
      name: 'default',
      ttl: 60000,  // 60 seconds
      limit: 60,   // 60 requests per minute
    },
  ],
  storage: new RedisThrottlerStorage(
    process.env.REDIS_URL || 'redis://localhost:6379'
  ),
})
```

---

## Architecture

### Redis Storage

Rate limits are stored in Redis with the following key structure:

```
throttle:{ip}:{endpoint}:{userId?}
```

**Example**:
```
throttle:192.168.1.1:/api/v1/skills:user123
```

### Key Features

1. **Distributed**: Works across multiple API instances
2. **Persistent**: Survives application restarts
3. **Fast**: Redis in-memory storage for sub-millisecond lookups
4. **Scalable**: Can handle millions of requests per second
5. **Automatic Expiry**: Keys expire automatically after TTL

### Storage Implementation

```typescript
// packages/api/src/common/throttler/redis-throttler.storage.ts
export class RedisThrottlerStorage implements ThrottlerStorage {
  async increment(key: string, ttl: number): Promise<{
    totalHits: number;
    timeToExpire: number;
    isBlocked: boolean;
  }> {
    const prefixedKey = `throttle:${key}`;
    const totalHits = await this.client.incr(prefixedKey);

    if (totalHits === 1) {
      await this.client.expire(prefixedKey, ttl);
    }

    const timeToExpire = await this.client.ttl(prefixedKey);

    return { totalHits, timeToExpire, isBlocked: false };
  }
}
```

---

## Response Headers

When rate limiting is active, the following headers are included in all responses:

```http
X-RateLimit-Limit: 100          # Maximum requests allowed in window
X-RateLimit-Remaining: 95       # Requests remaining in current window
X-RateLimit-Reset: 1731674400   # Unix timestamp when limit resets
```

### Example Response (Within Limits)

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1731674400
Content-Type: application/json

{
  "data": "..."
}
```

### Example Response (Limit Exceeded)

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1731674400
Retry-After: 45
Content-Type: application/json

{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

---

## Configuration

### Environment Variables

Add to `.env` file:

```bash
# Redis URL for rate limiting storage
REDIS_URL=redis://localhost:6379

# Default rate limit configuration (optional)
RATE_LIMIT_TTL=60000    # Time window in milliseconds
RATE_LIMIT_MAX=60       # Max requests per window

# CORS configuration
CORS_ORIGIN=http://localhost:3100
```

### Custom Limits Per Endpoint

You can override defaults for specific endpoints:

```typescript
import { Throttle } from '@nestjs/throttler';

@Get('expensive-operation')
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests/minute
async expensiveOperation() {
  // Custom limit for this endpoint
}
```

---

## Usage Examples

### 1. Public Marketplace Endpoint

```typescript
import { Controller, Get } from '@nestjs/common';
import { PublicThrottle } from '../common/decorators/throttle.decorator';

@Controller('marketplace')
export class MarketplaceController {
  @Get('skills')
  @PublicThrottle() // 30 requests/minute
  async browseSkills() {
    return await this.skillsService.getPublicSkills();
  }
}
```

### 2. Authenticated User Dashboard

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { AuthThrottle } from '../common/decorators/throttle.decorator';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  @Get()
  @AuthThrottle() // 100 requests/minute
  async getDashboard() {
    return await this.dashboardService.getUserDashboard();
  }
}
```

### 3. Admin Operations

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { AdminThrottle } from '../common/decorators/throttle.decorator';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  @Get('stats')
  @AdminThrottle() // 1000 requests/minute
  async getStats() {
    return await this.adminService.getStats();
  }
}
```

### 4. Skip Rate Limiting (Health Checks)

```typescript
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
export class AppController {
  @Get('health')
  @SkipThrottle() // No rate limiting
  getHealth() {
    return { status: 'ok' };
  }
}
```

---

## Testing

### Manual Testing with cURL

```bash
# Test rate limit on public endpoint
for i in {1..35}; do
  curl -i http://localhost:4100/api/v1/skills
  echo "Request $i"
  sleep 1
done

# Expected: First 30 succeed, remaining return 429
```

### Testing with Artillery (Load Testing)

```yaml
# artillery-test.yml
config:
  target: 'http://localhost:4100'
  phases:
    - duration: 60
      arrivalRate: 2  # 2 requests per second
scenarios:
  - name: 'Test rate limiting'
    flow:
      - get:
          url: '/api/v1/skills'
```

Run test:
```bash
artillery run artillery-test.yml
```

---

## Monitoring

### Redis CLI

Check current rate limit keys:

```bash
# Connect to Redis
redis-cli

# View all throttle keys
KEYS throttle:*

# Check specific key value
GET throttle:192.168.1.1:/api/v1/skills

# Check TTL (time to live)
TTL throttle:192.168.1.1:/api/v1/skills
```

### Logs

Rate limit events are logged:

```bash
# When Redis connects
✅ Redis Throttler connected

# When rate limit is exceeded
WARN: Rate limit exceeded for IP 192.168.1.1 on /api/v1/skills
```

---

## Production Considerations

### 1. Redis Scaling

For high-traffic production:

```typescript
// Use Redis Cluster for distributed storage
storage: new RedisThrottlerStorage(
  'redis://redis-cluster-1:6379,redis://redis-cluster-2:6379'
)
```

### 2. Rate Limit by User ID

Instead of just IP address:

```typescript
// Custom rate limit key generator
import { ThrottlerGuard } from '@nestjs/throttler';

export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: any): Promise<string> {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  }
}
```

### 3. Different Limits Per Subscription Tier

```typescript
// Check user subscription tier
const limit = user.subscription === 'PRO' ? 300 : 100;

@Throttle({ default: { limit, ttl: 60000 } })
```

### 4. Whitelist IPs

```typescript
// Allow unlimited requests from trusted IPs
const trustedIPs = ['10.0.0.1', '10.0.0.2'];

if (trustedIPs.includes(req.ip)) {
  return true; // Skip throttling
}
```

---

## Troubleshooting

### Issue 1: Rate Limit Not Working

**Check**:
1. Redis is running: `redis-cli ping`
2. REDIS_URL is correct in `.env`
3. ThrottlerGuard is applied globally in `app.module.ts`

**Solution**:
```bash
# Start Redis if not running
docker run -d -p 6379:6379 redis:7-alpine

# Or via Docker Compose
docker-compose up redis
```

### Issue 2: Rate Limit Too Strict

**Check**:
Current default is 60 requests/minute. Increase if needed:

```typescript
// In app.module.ts
ThrottlerModule.forRoot({
  throttlers: [
    {
      name: 'default',
      ttl: 60000,
      limit: 120, // Increase to 120 requests/minute
    },
  ],
})
```

### Issue 3: Redis Connection Errors

**Symptoms**:
```
Redis Throttler Error: connect ECONNREFUSED
```

**Solution**:
```bash
# Check Redis is accessible
redis-cli -h localhost -p 6379 ping

# Update REDIS_URL in .env
REDIS_URL=redis://localhost:6379

# Restart API
pnpm --filter @agentfoundry/api dev
```

---

## Best Practices

1. **Use Appropriate Limits**: Don't over-restrict, but protect against abuse
2. **Monitor Usage**: Track rate limit hits in analytics
3. **Communicate Limits**: Document in API documentation
4. **Graduated Penalties**: Consider temporary bans for persistent abusers
5. **Whitelist Critical Services**: Skip throttling for monitoring, health checks
6. **Test Thoroughly**: Ensure limits don't break legitimate use cases

---

## Future Enhancements

1. **Dynamic Limits**: Adjust based on server load
2. **User-Specific Limits**: Store limits in database per user
3. **Burst Allowance**: Allow short bursts above limit
4. **Rate Limit Analytics**: Dashboard showing top consumers
5. **Graceful Degradation**: Return cached data instead of 429
6. **API Key-Based Limits**: Different limits per API key

---

## References

- [@nestjs/throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- [Redis Documentation](https://redis.io/documentation)
- [HTTP 429 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/DDoS_Prevention_Cheat_Sheet.html)

---

**Document Version**: 1.0
**Last Updated**: November 15, 2025
**Maintainer**: AgentFoundry Team
