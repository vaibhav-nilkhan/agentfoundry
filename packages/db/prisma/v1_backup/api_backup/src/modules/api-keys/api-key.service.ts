import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface ApiKeyValidationResult {
  user: any;
  subscription: any;
  tier: string;
  scopes: string[];
  apiKeyId: string;
}

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate new API key for user
   */
  async generateApiKey(
    userId: string,
    name: string,
    scopes: string[] = ['skills:execute', 'skills:read']
  ) {
    // Generate secure random key
    const randomBytes = crypto.randomBytes(32);
    const key = `ak_live_${randomBytes.toString('base64url')}`;

    // Get user's subscription tier
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tier = user.subscription?.tier || 'FREE';

    return this.prisma.apiKey.create({
      data: {
        key,
        userId,
        name,
        scopes,
        tier,
      },
    });
  }

  /**
   * Generate test API key (for development)
   */
  async generateTestApiKey(userId: string, name: string) {
    const randomBytes = crypto.randomBytes(32);
    const key = `ak_test_${randomBytes.toString('base64url')}`;

    return this.prisma.apiKey.create({
      data: {
        key,
        userId,
        name,
        scopes: ['skills:execute', 'skills:read'],
        tier: 'FREE',
      },
    });
  }

  /**
   * Validate API key and return user + subscription info
   */
  async validateApiKey(key: string): Promise<ApiKeyValidationResult> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { key },
      include: {
        user: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (!apiKey.active) {
      throw new UnauthorizedException('API key has been revoked');
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // Update last used timestamp and count
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        lastUsedAt: new Date(),
        usageCount: { increment: 1 },
      },
    });

    return {
      user: apiKey.user,
      subscription: apiKey.user.subscription,
      tier: apiKey.tier,
      scopes: apiKey.scopes,
      apiKeyId: apiKey.id,
    };
  }

  /**
   * Check if user has access to specific skill
   */
  async checkSkillAccess(
    userId: string,
    skillId: string,
    toolName?: string
  ): Promise<{ hasAccess: boolean; reason?: string }> {
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return { hasAccess: false, reason: 'Skill not found' };
    }

    // Free skills - everyone has access
    if (skill.pricingType === 'FREE') {
      return { hasAccess: true };
    }

    // Premium skills - check subscription
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return {
        hasAccess: false,
        reason: 'Premium skill requires subscription. Upgrade at https://agentfoundry.ai/pricing',
      };
    }

    if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
      return {
        hasAccess: false,
        reason: 'Subscription is not active. Please check your billing at https://agentfoundry.ai/billing',
      };
    }

    // Check usage limits
    if (subscription.monthlyLimit !== null) {
      if (subscription.usageCount >= subscription.monthlyLimit) {
        return {
          hasAccess: false,
          reason: 'Monthly usage limit exceeded. Upgrade your plan at https://agentfoundry.ai/pricing',
        };
      }
    }

    // Check if subscription tier allows access to this skill
    // For FREEMIUM skills, check tier requirements
    if (skill.pricingType === 'FREEMIUM') {
      // TODO: Add tier-based access control logic
      // For now, any active subscription can access freemium skills
    }

    return { hasAccess: true };
  }

  /**
   * List all API keys for a user
   */
  async listApiKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        key: true, // In production, mask this: ak_live_***xyz
        active: true,
        tier: true,
        scopes: true,
        lastUsedAt: true,
        usageCount: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId: string, userId: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to revoke this API key');
    }

    return this.prisma.apiKey.update({
      where: { id: keyId },
      data: {
        active: false,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Update API key metadata
   */
  async updateApiKey(keyId: string, userId: string, data: { name?: string; scopes?: string[] }) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to update this API key');
    }

    return this.prisma.apiKey.update({
      where: { id: keyId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.scopes && { scopes: data.scopes }),
      },
    });
  }

  /**
   * Mask API key for display (show first 8 and last 4 characters)
   */
  maskApiKey(key: string): string {
    if (key.length < 20) return key;
    const prefix = key.substring(0, 11); // "ak_live_" or "ak_test_"
    const suffix = key.substring(key.length - 4);
    return `${prefix}***${suffix}`;
  }
}
