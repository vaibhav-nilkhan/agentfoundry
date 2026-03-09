import { PrismaClient } from '@agentfoundry/db';
import { subDays, subWeeks, subMonths } from 'date-fns';

export interface ReportFilterOptions {
    agentName?: string;
    period?: string;
    teamId?: string;
    userId?: string;
}

export class ReportsService {
    constructor(private prisma: PrismaClient) { }

    private getStartDateForPeriod(period?: string): Date | undefined {
        if (!period) return undefined;
        const now = new Date();
        switch (period) {
            case 'day': return subDays(now, 1);
            case 'week': return subWeeks(now, 1);
            case 'month': return subMonths(now, 1);
            default: return undefined;
        }
    }

    private buildWhereClause(options: ReportFilterOptions) {
        const startDate = this.getStartDateForPeriod(options.period);
        const whereClause: any = {};
        
        if (options.agentName) whereClause.agentName = options.agentName;
        if (startDate) whereClause.startedAt = { gte: startDate };
        if (options.teamId) whereClause.teamId = options.teamId;
        if (options.userId) whereClause.userId = options.userId;
        
        return whereClause;
    }

    async getOverallStats(options: ReportFilterOptions = {}) {
        const whereClause = this.buildWhereClause(options);

        const sessions = await this.prisma.agentSession.findMany({
            where: whereClause,
            include: { cost: true, quality: true, gitSnapshot: true }
        });

        const totalSessions = sessions.length;
        const totalTokensIn = sessions.reduce((sum, s) => sum + (s.cost?.tokensIn || 0), 0);
        const totalTokensOut = sessions.reduce((sum, s) => sum + (s.cost?.tokensOut || 0), 0);
        const totalCostUsd = sessions.reduce((sum, s) => sum + (s.cost?.costUsd || 0), 0);

        const sessionsWithQuality = sessions.filter(s => s.quality);
        const totalTestsPassed = sessionsWithQuality.reduce((sum, s) => sum + (s.quality?.testsPassed || 0), 0);
        const totalTestsFailed = sessionsWithQuality.reduce((sum, s) => sum + (s.quality?.testsFailed || 0), 0);

        let passRate = 0;
        if (totalTestsPassed + totalTestsFailed > 0) {
            passRate = (totalTestsPassed / (totalTestsPassed + totalTestsFailed)) * 100;
        }

        const validDurations = sessions.filter(s => s.durationSeconds != null).map(s => s.durationSeconds as number);
        const avgDuration = validDurations.length > 0 ? validDurations.reduce((a, b) => a + b, 0) / validDurations.length : 0;

        const sessionsWithYield = sessionsWithQuality.filter(s => s.quality?.tokenYield != null);
        const avgTokenYield = sessionsWithYield.length > 0 
            ? sessionsWithYield.reduce((sum, s) => sum + (s.quality!.tokenYield!), 0) / sessionsWithYield.length 
            : 0;

        const sessionsWithZeroShotData = sessionsWithQuality.filter(s => s.quality?.isZeroShot != null);
        const zeroShotCount = sessionsWithZeroShotData.filter(s => s.quality!.isZeroShot).length;
        const zeroShotRate = sessionsWithZeroShotData.length > 0
            ? (zeroShotCount / sessionsWithZeroShotData.length) * 100
            : 0;

        return {
            totalSessions,
            totalTokensIn,
            totalTokensOut,
            totalCostUsd,
            avgDuration,
            passRate,
            avgTokenYield,
            zeroShotRate
        };
    }

    async getCostBreakdown(options: ReportFilterOptions = {}) {
        const whereClause = this.buildWhereClause(options);

        const sessions = await this.prisma.agentSession.findMany({
            where: whereClause,
            include: { cost: true }
        });

        const breakdown: Record<string, number> = {};
        let totalCost = 0;

        for (const session of sessions) {
            const cost = session.cost?.costUsd || 0;
            if (!breakdown[session.agentName]) {
                breakdown[session.agentName] = 0;
            }
            breakdown[session.agentName] += cost;
            totalCost += cost;
        }

        return { breakdown, totalCost };
    }

    async getHistory(limit: number = 10, options: ReportFilterOptions = {}) {
        const whereClause = this.buildWhereClause(options);

        return this.prisma.agentSession.findMany({
            where: whereClause,
            orderBy: { startedAt: 'desc' },
            take: limit,
            include: { cost: true, gitSnapshot: true, quality: true }
        });
    }
}
