import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get tier limits and features
   */
  private getTierConfig(tier: string) {
    const configs = {
      FREE: {
        monthlyLimit: 100,
        features: ['Basic skills', 'Community support'],
        price: 0,
      },
      CREATOR: {
        monthlyLimit: null, // unlimited
        features: [
          'All premium skills',
          'Unlimited executions',
          'Priority support',
          'API access',
        ],
        price: 39,
      },
      PRO: {
        monthlyLimit: null, // unlimited
        features: [
          'Everything in Creator',
          'White-label option',
          'Custom integrations',
          'Dedicated support',
          'SLA guarantee',
        ],
        price: 99,
      },
      ENTERPRISE: {
        monthlyLimit: null, // unlimited
        features: [
          'Everything in Pro',
          'Custom deployment',
          'On-premise option',
          'Custom contract',
          'Dedicated account manager',
        ],
        price: 499,
      },
    };

    return configs[tier] || configs.FREE;
  }

  /**
   * Create a new subscription for a user
   */
  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    // Check if user already has a subscription
    const existing = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('User already has an active subscription');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const config = this.getTierConfig(dto.tier);
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month from now

    // Create subscription
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        tier: dto.tier,
        status: dto.trialEnd ? 'TRIALING' : 'ACTIVE',
        monthlyLimit: config.monthlyLimit,
        usageCount: 0,
        resetDate: periodEnd,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialEnd: dto.trialEnd ? new Date(dto.trialEnd) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    return {
      ...subscription,
      features: config.features,
      price: config.price,
    };
  }

  /**
   * Get subscription by user ID
   */
  async getSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const config = this.getTierConfig(subscription.tier);

    return {
      ...subscription,
      features: config.features,
      price: config.price,
      percentageUsed:
        subscription.monthlyLimit !== null
          ? (subscription.usageCount / subscription.monthlyLimit) * 100
          : 0,
      remaining:
        subscription.monthlyLimit !== null
          ? subscription.monthlyLimit - subscription.usageCount
          : null,
    };
  }

  /**
   * Update subscription (upgrade/downgrade/cancel)
   */
  async updateSubscription(userId: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Handle tier change (upgrade/downgrade)
    if (dto.tier && dto.tier !== subscription.tier) {
      const oldConfig = this.getTierConfig(subscription.tier);
      const newConfig = this.getTierConfig(dto.tier);

      // Determine if upgrade or downgrade
      const isUpgrade = newConfig.price > oldConfig.price;

      // For downgrades, apply at period end
      // For upgrades, apply immediately
      const updateData: any = {
        tier: dto.tier,
        monthlyLimit: newConfig.monthlyLimit,
      };

      if (isUpgrade) {
        // Immediate upgrade - reset usage
        updateData.usageCount = 0;
        updateData.status = 'ACTIVE';
      }

      const updated = await this.prisma.subscription.update({
        where: { userId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
      });

      return {
        ...updated,
        features: newConfig.features,
        price: newConfig.price,
        message: isUpgrade
          ? 'Subscription upgraded successfully'
          : 'Subscription will downgrade at end of billing period',
      };
    }

    // Handle cancellation
    if (dto.cancelAtPeriodEnd !== undefined) {
      const updated = await this.prisma.subscription.update({
        where: { userId },
        data: {
          cancelAtPeriodEnd: dto.cancelAtPeriodEnd,
          canceledAt: dto.cancelAtPeriodEnd ? new Date() : null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
      });

      const config = this.getTierConfig(updated.tier);

      return {
        ...updated,
        features: config.features,
        price: config.price,
        message: dto.cancelAtPeriodEnd
          ? 'Subscription will be canceled at end of billing period'
          : 'Subscription cancellation reversed',
      };
    }

    throw new BadRequestException('No valid update provided');
  }

  /**
   * Cancel subscription immediately
   */
  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Instead of deleting, set to canceled and downgrade to FREE
    const updated = await this.prisma.subscription.update({
      where: { userId },
      data: {
        tier: 'FREE',
        status: 'CANCELED',
        monthlyLimit: 100, // Free tier limit
        usageCount: 0,
        canceledAt: new Date(),
        cancelAtPeriodEnd: false,
        // Clear Stripe data
        stripeSubscriptionId: null,
        stripePriceId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    return {
      ...updated,
      message: 'Subscription canceled successfully. Downgraded to FREE tier.',
    };
  }

  /**
   * Reset monthly usage (called by cron job at billing period end)
   */
  async resetMonthlyUsage(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const now = new Date();
    const nextPeriodEnd = new Date(now);
    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        usageCount: 0,
        resetDate: nextPeriodEnd,
        currentPeriodStart: now,
        currentPeriodEnd: nextPeriodEnd,
      },
    });
  }

  /**
   * Increment usage count (called after skill execution)
   */
  async incrementUsage(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // Create a FREE subscription if none exists
      return this.createSubscription(userId, { tier: 'FREE' });
    }

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Check if user has reached usage limit
   */
  async checkUsageLimit(userId: string): Promise<{
    withinLimit: boolean;
    remaining: number | null;
    percentageUsed: number;
    limit: number | null;
  }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // No subscription = FREE tier with 100 limit
      return {
        withinLimit: true,
        remaining: 100,
        percentageUsed: 0,
        limit: 100,
      };
    }

    // Unlimited tiers
    if (subscription.monthlyLimit === null) {
      return {
        withinLimit: true,
        remaining: null,
        percentageUsed: 0,
        limit: null,
      };
    }

    const remaining = subscription.monthlyLimit - subscription.usageCount;
    const percentageUsed =
      (subscription.usageCount / subscription.monthlyLimit) * 100;

    return {
      withinLimit: remaining > 0,
      remaining,
      percentageUsed,
      limit: subscription.monthlyLimit,
    };
  }

  /**
   * Get all available tiers with pricing
   */
  async getAvailableTiers() {
    return [
      {
        tier: 'FREE',
        ...this.getTierConfig('FREE'),
      },
      {
        tier: 'CREATOR',
        ...this.getTierConfig('CREATOR'),
      },
      {
        tier: 'PRO',
        ...this.getTierConfig('PRO'),
      },
      {
        tier: 'ENTERPRISE',
        ...this.getTierConfig('ENTERPRISE'),
      },
    ];
  }
}
