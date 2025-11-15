import { ThrottlerStorage } from '@nestjs/throttler';
import { createClient, RedisClientType } from 'redis';

/**
 * Custom Redis storage for @nestjs/throttler
 * Stores rate limit data in Redis instead of memory
 * Allows for distributed rate limiting across multiple API instances
 */
export class RedisThrottlerStorage implements ThrottlerStorage {
  private client: RedisClientType;
  private connected = false;

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('Redis Throttler Error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      console.log('✅ Redis Throttler connected');
      this.connected = true;
    });

    // Connect to Redis
    this.client.connect().catch((err) => {
      console.error('Failed to connect to Redis for throttling:', err);
      this.connected = false;
    });
  }

  /**
   * Increment the request count for a given key
   * @param key - Unique identifier (IP + endpoint)
   * @param ttl - Time to live in seconds
   * @returns Current count and time to expiry
   */
  async increment(key: string, ttl: number): Promise<{
    totalHits: number;
    timeToExpire: number;
    isBlocked: boolean;
  }> {
    // If Redis is not connected, fallback to allowing the request
    if (!this.connected) {
      console.warn('Redis not connected, allowing request');
      return {
        totalHits: 0,
        timeToExpire: ttl,
        isBlocked: false,
      };
    }

    try {
      const prefixedKey = `throttle:${key}`;

      // Increment the counter
      const totalHits = await this.client.incr(prefixedKey);

      // Set expiry on first hit
      if (totalHits === 1) {
        await this.client.expire(prefixedKey, ttl);
      }

      // Get time to expiry
      const timeToExpire = await this.client.ttl(prefixedKey);

      return {
        totalHits,
        timeToExpire: timeToExpire > 0 ? timeToExpire : ttl,
        isBlocked: false, // ThrottlerGuard will handle blocking logic
      };
    } catch (error) {
      console.error('Redis throttle error:', error);
      // On error, allow the request
      return {
        totalHits: 0,
        timeToExpire: ttl,
        isBlocked: false,
      };
    }
  }

  /**
   * Reset the rate limit for a given key
   * @param key - Unique identifier
   */
  async reset(key: string): Promise<void> {
    if (!this.connected) return;

    try {
      const prefixedKey = `throttle:${key}`;
      await this.client.del(prefixedKey);
    } catch (error) {
      console.error('Redis reset error:', error);
    }
  }

  /**
   * Cleanup on application shutdown
   */
  async onApplicationShutdown(): Promise<void> {
    if (this.connected) {
      await this.client.quit();
    }
  }
}
