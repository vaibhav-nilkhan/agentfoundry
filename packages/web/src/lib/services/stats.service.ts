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

    async getOverview(teamId?: string, period?: string) {
        const startDate = this.getStartDateForPeriod(period);
        const whereClause: any = {
            ...(teamId ? { teamId } : {}),
            ...(startDate ? { startedAt: { gte: startDate } } : {})
        };

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

    async getCosts(teamId?: string, period?: string) {
        const startDate = this.getStartDateForPeriod(period);
        const whereClause: any = {
            ...(teamId ? { teamId } : {}),
            ...(startDate ? { startedAt: { gte: startDate } } : {})
        };

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

    async getHistory(teamId?: string, limit: number = 50, page: number = 1) {
        const skip = (page - 1) * limit;
        const whereClause: any = teamId ? { teamId } : {};

        const [total, sessions] = await Promise.all([
            this.db.agentSession.count({ where: whereClause }),
            this.db.agentSession.findMany({
                where: whereClause,
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

    async getSwarm(swarmId: string) {
        const sessions = await this.db.agentSession.findMany({
            where: { swarmId },
            orderBy: { startedAt: 'asc' },
            include: { cost: true, quality: true, gitSnapshot: true }
        });

        if (sessions.length === 0) return null;

        const totalCost = sessions.reduce((sum: number, s: any) => sum + (s.cost?.costUsd || 0), 0);
        const totalFiles = new Set(sessions.flatMap((s: any) => {
            try {
                return JSON.parse(s.gitSnapshot?.filesChanged || '[]');
            } catch {
                return [];
            }
        })).size;

        return {
            swarmId,
            startTime: sessions[0].startedAt,
            endTime: sessions[sessions.length - 1].endedAt,
            sessions,
            totalCost,
            totalFiles
        };
    }

    async getActiveSwarms() {
        const activeSessions = await this.db.agentSession.findMany({
            where: { endedAt: null },
            orderBy: { startedAt: 'desc' },
            include: { cost: true, quality: true, gitSnapshot: true }
        });

        // Group by swarmId
        const swarms: Record<string, any[]> = {};
        const solos: any[] = [];

        for (const s of activeSessions) {
            if (s.swarmId) {
                if (!swarms[s.swarmId]) swarms[s.swarmId] = [];
                swarms[s.swarmId].push(s);
            } else {
                solos.push(s);
            }
        }

        return {
            swarms: Object.entries(swarms).map(([id, sessions]) => ({
                id,
                sessions,
                startTime: sessions[sessions.length - 1].startedAt,
            })),
            solos
        };
    }

    async getRecommendations(teamId?: string, taskType?: string) {
        const whereClause: any = teamId ? { teamId } : {};
        const sessions = await this.db.agentSession.findMany({
            where: whereClause,
            include: { cost: true, quality: true }
        });

        return calculateRecommendations(sessions, taskType);
    }

    /**
     * Fetches and groups benchmark sessions to generate a comparative leaderboard.
     * Sorts agents by a heuristic: highest pass rate, then lowest token yield, then lowest cost.
     * 
     * @param teamId - Optional ID to filter benchmarks by a specific team.
     * @returns An array of benchmark groups, sorted by newest first, containing ranked agent sessions.
     */
    async getBenchmarks(teamId?: string) {
        const whereClause: any = {
            benchmarkId: { not: null },
            ...(teamId ? { teamId } : {})
        };

        const sessions = await this.db.agentSession.findMany({
            where: whereClause,
            orderBy: { startedAt: 'desc' },
            include: { cost: true, quality: true, gitSnapshot: true }
        });

        // Group by benchmarkId
        const benchmarksMap: Record<string, any[]> = {};
        for (const s of sessions) {
            const bId = s.benchmarkId!;
            if (!benchmarksMap[bId]) benchmarksMap[bId] = [];
            benchmarksMap[bId].push(s);
        }

        const benchmarks = Object.entries(benchmarksMap).map(([id, groupSessions]) => {
            // Sort agents by performance:
            // 1. Highest pass rate (testsPassed / (testsPassed + testsFailed))
            // 2. Lowest tokenYield
            // 3. Lowest costUsd
            const sortedSessions = [...groupSessions].sort((a, b) => {
                const aTotalTests = (a.quality?.testsPassed || 0) + (a.quality?.testsFailed || 0);
                const bTotalTests = (b.quality?.testsPassed || 0) + (b.quality?.testsFailed || 0);
                const aPassRate = aTotalTests > 0 ? (a.quality?.testsPassed || 0) / aTotalTests : 0;
                const bPassRate = bTotalTests > 0 ? (b.quality?.testsPassed || 0) / bTotalTests : 0;

                if (bPassRate !== aPassRate) return bPassRate - aPassRate;

                const aYield = a.quality?.tokenYield || Infinity;
                const bYield = b.quality?.tokenYield || Infinity;
                if (aYield !== bYield) return aYield - bYield;

                const aCost = a.cost?.costUsd || Infinity;
                const bCost = b.cost?.costUsd || Infinity;
                return aCost - bCost;
            });

            return {
                id,
                taskHint: groupSessions[0].taskHint || 'Unknown Task',
                taskType: groupSessions[0].taskType || 'unknown',
                createdAt: groupSessions[0].createdAt,
                sessions: sortedSessions,
                winner: sortedSessions[0]?.agentName || null
            };
        });

        // Sort benchmarks by newest first
        benchmarks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return benchmarks;
    }
}

export const statsService = new StatsService();
