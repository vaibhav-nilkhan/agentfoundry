import { PrismaClient } from '@agentfoundry/db';
import { subDays, subWeeks, subMonths } from 'date-fns';
import { calculateRecommendations } from '@agentfoundry/shared';

// Singleton Prisma instance for Next.js to prevent connection pooling issues
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export class StatsService {
    constructor(private readonly db: any = prisma) { }

    private getStartDateForPeriod(period?: string): Date | undefined {
        if (!period || period === 'all') return undefined;
        const now = new Date();
        switch (period) {
            case 'day': return subDays(now, 1);
            case 'week': return subWeeks(now, 1);
            case 'month': return subMonths(now, 1);
            default: return undefined;
        }
    }

    async getOverview(period?: string) {
        const startDate = this.getStartDateForPeriod(period);
        const whereClause: any = startDate ? { startedAt: { gte: startDate } } : {};

        const sessions = await this.db.agentSession.findMany({
            where: whereClause,
            include: { cost: true, quality: true, gitSnapshot: true }
        });

        const totalSessions = sessions.length;
        const totalCostUsd = sessions.reduce((sum: number, s: any) => sum + (s.cost?.costUsd || 0), 0);

        const sessionsWithQuality = sessions.filter((s: any) => s.quality);
        const totalTestsPassed = sessionsWithQuality.reduce((sum: number, s: any) => sum + (s.quality?.testsPassed || 0), 0);
        const totalTestsFailed = sessionsWithQuality.reduce((sum: number, s: any) => sum + (s.quality?.testsFailed || 0), 0);

        let passRate = 0;
        if (totalTestsPassed + totalTestsFailed > 0) {
            passRate = (totalTestsPassed / (totalTestsPassed + totalTestsFailed)) * 100;
        }

        const agentBreakdown: Record<string, number> = {};
        for (const s of sessions) {
            agentBreakdown[s.agentName] = (agentBreakdown[s.agentName] || 0) + 1;
        }

        const taskTypeBreakdown: Record<string, number> = {};
        for (const s of sessions) {
            const t = s.taskType || 'unknown';
            taskTypeBreakdown[t] = (taskTypeBreakdown[t] || 0) + 1;
        }

        return {
            totalSessions,
            totalCostUsd,
            passRate,
            agentBreakdown,
            taskTypeBreakdown
        };
    }

    async getCosts(period?: string) {
        const startDate = this.getStartDateForPeriod(period);
        const whereClause: any = startDate ? { startedAt: { gte: startDate } } : {};

        const sessions = await this.db.agentSession.findMany({
            where: whereClause,
            orderBy: { startedAt: 'asc' },
            include: { cost: true }
        });

        // Group by day for the trend line
        const dailyCosts: Record<string, number> = {};
        const agentTotals: Record<string, number> = {};

        for (const s of sessions) {
            const dateStr = s.startedAt.toISOString().split('T')[0];
            const cost = s.cost?.costUsd || 0;

            dailyCosts[dateStr] = (dailyCosts[dateStr] || 0) + cost;
            agentTotals[s.agentName] = (agentTotals[s.agentName] || 0) + cost;
        }

        return {
            dailyCosts,
            agentTotals
        };
    }

    async getHistory(limit: number = 50, page: number = 1) {
        const skip = (page - 1) * limit;

        const [total, sessions] = await Promise.all([
            this.db.agentSession.count(),
            this.db.agentSession.findMany({
                orderBy: { startedAt: 'desc' },
                take: limit,
                skip,
                include: { cost: true, quality: true, gitSnapshot: true }
            })
        ]);

        return {
            total,
            page,
            limit,
            sessions
        };
    }

    async getRecommendations(taskType?: string) {
        const sessions = await this.db.agentSession.findMany({
            include: { cost: true, quality: true }
        });

        return calculateRecommendations(sessions, taskType);
    }
}

export const statsService = new StatsService();
