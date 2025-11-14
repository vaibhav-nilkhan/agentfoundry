import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TrackExecutionInput {
  userId: string;
  skillId: string;
  toolName: string;
  platform: string;
  success: boolean;
  executionTime: number;
  errorMessage?: string;
  apiKeyId?: string;
}

@Injectable()
export class UsageTrackingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Track skill execution for analytics and billing
   */
  async trackExecution(data: TrackExecutionInput) {
    // Store in SkillUsage table
    const usage = await this.prisma.skillUsage.create({
      data: {
        userId: data.userId,
        skillId: data.skillId,
        toolName: data.toolName,
        platform: data.platform as any, // TODO: Map to Platform enum
        success: data.success,
        executionTime: data.executionTime,
        errorMessage: data.errorMessage,
        apiKeyId: data.apiKeyId,
      },
    });

    // Increment subscription usage counter if user has subscription
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId: data.userId },
    });

    if (subscription && subscription.monthlyLimit !== null) {
      await this.prisma.subscription.update({
        where: { userId: data.userId },
        data: {
          usageCount: { increment: 1 },
        },
      });
    }

    return usage;
  }

  /**
   * Get monthly usage for a user
   */
  async getMonthlyUsage(userId: string, startDate?: Date, endDate?: Date) {
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const totalCount = await this.prisma.skillUsage.count({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const successCount = await this.prisma.skillUsage.count({
      where: {
        userId,
        success: true,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const failureCount = totalCount - successCount;

    // Get subscription limits
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    return {
      period: {
        start,
        end,
      },
      usage: {
        total: totalCount,
        success: successCount,
        failures: failureCount,
      },
      limit: subscription?.monthlyLimit,
      remaining: subscription?.monthlyLimit
        ? Math.max(0, subscription.monthlyLimit - (subscription.usageCount || 0))
        : null,
      resetDate: subscription?.resetDate,
    };
  }

  /**
   * Get usage breakdown by skill
   */
  async getUsageBySkill(userId: string, startDate?: Date, endDate?: Date) {
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usageBySkill = await this.prisma.skillUsage.groupBy({
      by: ['skillId'],
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
      _avg: {
        executionTime: true,
      },
    });

    // Fetch skill details
    const skillIds = usageBySkill.map(u => u.skillId);
    const skills = await this.prisma.skill.findMany({
      where: { id: { in: skillIds } },
      select: { id: true, name: true, slug: true },
    });

    return usageBySkill.map(usage => {
      const skill = skills.find(s => s.id === usage.skillId);
      return {
        skillId: usage.skillId,
        skillName: skill?.name,
        skillSlug: skill?.slug,
        totalExecutions: usage._count.id,
        avgExecutionTime: Math.round(usage._avg.executionTime || 0),
      };
    });
  }

  /**
   * Reset monthly usage (called on subscription renewal)
   */
  async resetMonthlyUsage(userId: string) {
    const nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        usageCount: 0,
        resetDate: nextResetDate,
      },
    });
  }

  /**
   * Check if user is approaching usage limit
   */
  async checkUsageLimit(userId: string): Promise<{
    withinLimit: boolean;
    percentageUsed: number;
    remaining: number;
  }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.monthlyLimit === null) {
      return {
        withinLimit: true,
        percentageUsed: 0,
        remaining: Infinity,
      };
    }

    const percentageUsed = (subscription.usageCount / subscription.monthlyLimit) * 100;
    const remaining = Math.max(0, subscription.monthlyLimit - subscription.usageCount);

    return {
      withinLimit: subscription.usageCount < subscription.monthlyLimit,
      percentageUsed: Math.round(percentageUsed),
      remaining,
    };
  }
}
