import { SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

/**
 * Rate limit tiers for different user types and endpoints
 */

/**
 * Public endpoints - Strict limits for unauthenticated users
 * 30 requests per minute
 */
export const PublicThrottle = () => Throttle({ default: { limit: 30, ttl: 60000 } });

/**
 * Authenticated user endpoints - Standard limits
 * 100 requests per minute
 */
export const AuthThrottle = () => Throttle({ default: { limit: 100, ttl: 60000 } });

/**
 * Pro user endpoints - Higher limits
 * 300 requests per minute
 */
export const ProThrottle = () => Throttle({ default: { limit: 300, ttl: 60000 } });

/**
 * Admin endpoints - Very high limits
 * 1000 requests per minute
 */
export const AdminThrottle = () => Throttle({ default: { limit: 1000, ttl: 60000 } });

/**
 * Skill execution endpoints - Moderate limits per skill
 * 60 requests per minute (allows frequent skill testing)
 */
export const SkillExecutionThrottle = () => Throttle({ default: { limit: 60, ttl: 60000 } });

/**
 * Validation endpoints - Lower limits (compute-intensive)
 * 10 requests per minute
 */
export const ValidationThrottle = () => Throttle({ default: { limit: 10, ttl: 60000 } });

/**
 * No throttle - For health checks and static content
 */
export const NO_THROTTLE_KEY = 'no_throttle';
export const SkipThrottle = () => SetMetadata(NO_THROTTLE_KEY, true);
