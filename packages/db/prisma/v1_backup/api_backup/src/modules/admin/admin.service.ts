import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ==================== ANALYTICS ====================

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Parallel queries for performance
    const [
      totalUsers,
      newUsersLast30Days,
      newUsersLast7Days,
      activeSubscriptions,
      totalRevenue,
      totalSkills,
      pendingSkills,
      totalApiKeys,
      totalSkillExecutions,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count(),

      // New users last 30 days
      this.prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),

      // New users last 7 days
      this.prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),

      // Active subscriptions
      this.prisma.subscription.count({
        where: { status: 'ACTIVE', tier: { not: 'FREE' } },
      }),

      // Total revenue (MRR calculation)
      this.prisma.subscription.findMany({
        where: { status: 'ACTIVE', tier: { not: 'FREE' } },
        select: { tier: true },
      }),

      // Total skills
      this.prisma.skill.count(),

      // Pending skills
      this.prisma.skill.count({
        where: { status: 'PENDING' },
      }),

      // Total API keys
      this.prisma.apiKey.count({
        where: { active: true },
      }),

      // Total skill executions
      this.prisma.skillUsage.count(),
    ]);

    // Calculate MRR
    const tierPrices = { CREATOR: 39, PRO: 99, ENTERPRISE: 499 };
    const mrr = totalRevenue.reduce((sum, sub) => {
      return sum + (tierPrices[sub.tier] || 0);
    }, 0);

    // Calculate growth rates
    const userGrowthRate = totalUsers > 0
      ? ((newUsersLast7Days / (totalUsers - newUsersLast7Days)) * 100).toFixed(1)
      : '0';

    return {
      overview: {
        totalUsers,
        newUsersLast30Days,
        newUsersLast7Days,
        userGrowthRate: `${userGrowthRate}%`,
        activeSubscriptions,
        totalSkills,
        pendingSkills,
        totalApiKeys,
      },
      revenue: {
        mrr,
        arr: mrr * 12,
        averageRevenuePerUser: totalUsers > 0 ? (mrr / totalUsers).toFixed(2) : '0',
      },
      usage: {
        totalExecutions: totalSkillExecutions,
        executionsPerUser: totalUsers > 0 ? Math.round(totalSkillExecutions / totalUsers) : 0,
      },
    };
  }

  /**
   * Get revenue analytics over time
   */
  async getRevenueAnalytics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        createdAt: { gte: startDate },
        tier: { not: 'FREE' },
      },
      select: {
        tier: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const tierPrices = { CREATOR: 39, PRO: 99, ENTERPRISE: 499 };

    // Group by day
    const dailyRevenue = subscriptions.reduce((acc, sub) => {
      const date = sub.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, subscriptions: 0 };
      }
      acc[date].revenue += tierPrices[sub.tier] || 0;
      acc[date].subscriptions += 1;
      return acc;
    }, {} as Record<string, { date: string; revenue: number; subscriptions: number }>);

    return Object.values(dailyRevenue);
  }

  /**
   * Get user growth analytics
   */
  async getUserGrowthAnalytics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        createdAt: true,
        role: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const dailyGrowth = users.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, newUsers: 0, total: 0 };
      }
      acc[date].newUsers += 1;
      return acc;
    }, {} as Record<string, { date: string; newUsers: number; total: number }>);

    // Calculate cumulative total
    let cumulative = 0;
    const result = Object.values(dailyGrowth).map(day => {
      cumulative += day.newUsers;
      return { ...day, total: cumulative };
    });

    return result;
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const { page = 1, limit = 20, search, role, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          status: true,
          verified: true,
          reputation: true,
          createdAt: true,
          suspendedAt: true,
          suspendedReason: true,
          _count: {
            select: {
              skills: true,
              apiKeys: true,
            },
          },
          subscription: {
            select: {
              tier: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single user details
   */
  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            downloads: true,
            rating: true,
            createdAt: true,
          },
        },
        subscription: true,
        apiKeys: {
          select: {
            id: true,
            name: true,
            tier: true,
            active: true,
            usageCount: true,
            lastUsedAt: true,
            createdAt: true,
          },
        },
        skillUsage: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update user status (suspend, ban, activate)
   */
  async updateUserStatus(userId: string, status: string, reason?: string) {
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'BANNED'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updateData: any = { status };

    if (status === 'SUSPENDED' || status === 'BANNED') {
      updateData.suspendedAt = new Date();
      if (reason) {
        updateData.suspendedReason = reason;
      }
    } else {
      updateData.suspendedAt = null;
      updateData.suspendedReason = null;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string) {
    const validRoles = ['USER', 'ADMIN', 'MODERATOR'];

    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  /**
   * Get all subscriptions with filtering
   */
  async getSubscriptions(params: {
    page?: number;
    limit?: number;
    tier?: string;
    status?: string;
  }) {
    const { page = 1, limit = 20, tier, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tier) where.tier = tier;
    if (status) where.status = status;

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Cancel subscription (admin action)
   */
  async cancelSubscription(subscriptionId: string, reason: string) {
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        tier: 'FREE',
        monthlyLimit: 100,
      },
    });
  }

  // ==================== SKILL MANAGEMENT ====================

  /**
   * Get all skills with filtering
   */
  async getSkills(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [skills, total] = await Promise.all([
      this.prisma.skill.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              usage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.skill.count({ where }),
    ]);

    return {
      skills,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update skill status (approve/reject)
   */
  async updateSkillStatus(skillId: string, status: string) {
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'DEPRECATED'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updateData: any = { status };

    if (status === 'APPROVED') {
      updateData.validatedAt = new Date();
      updateData.publishedAt = new Date();
    }

    return this.prisma.skill.update({
      where: { id: skillId },
      data: updateData,
    });
  }
}
