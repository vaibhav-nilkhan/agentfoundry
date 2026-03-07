import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportsService } from '../reports.service';

describe('ReportsService', () => {
    let service: ReportsService;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = {
            agentSession: {
                findMany: vi.fn()
            }
        };
        service = new ReportsService(mockPrisma);
        vi.clearAllMocks();
    });

    describe('getOverallStats', () => {
        it('should calculate correct stats across multiple sessions', async () => {
            const mockSessions = [
                {
                    agentName: 'claude-code',
                    startedAt: new Date(),
                    durationSeconds: 10,
                    cost: { tokensIn: 100, tokensOut: 50, costUsd: 0.1 },
                    quality: { testsPassed: 5, testsFailed: 0 }
                },
                {
                    agentName: 'claude-code',
                    startedAt: new Date(),
                    durationSeconds: 20,
                    cost: { tokensIn: 200, tokensOut: 100, costUsd: 0.2 },
                    quality: { testsPassed: 4, testsFailed: 1 }
                }
            ];

            mockPrisma.agentSession.findMany.mockResolvedValue(mockSessions);

            const result = await service.getOverallStats();

            expect(result.totalSessions).toBe(2);
            expect(result.avgDuration).toBe(15);
            expect(result.totalTokensIn).toBe(300);
            expect(result.totalTokensOut).toBe(150);
            expect(result.totalCostUsd).toBeCloseTo(0.3);
            expect(result.passRate).toBe(90); // 9 passed, 1 failed = 90%
        });

        it('should handle zero sessions gracefully', async () => {
            mockPrisma.agentSession.findMany.mockResolvedValue([]);

            const result = await service.getOverallStats();

            expect(result.totalSessions).toBe(0);
            expect(result.avgDuration).toBe(0);
            expect(result.totalTokensIn).toBe(0);
            expect(result.totalTokensOut).toBe(0);
            expect(result.totalCostUsd).toBe(0);
            expect(result.passRate).toBe(0);
        });
    });

    describe('getCostBreakdown', () => {
        it('should group costs by agent accurately', async () => {
            const mockSessions = [
                { agentName: 'claude-code', cost: { costUsd: 1.5 } },
                { agentName: 'claude-code', cost: { costUsd: 2.5 } },
                { agentName: 'gemini', cost: { costUsd: 1.0 } },
                { agentName: 'missing-cost', cost: null } // should handle missing cost
            ];

            mockPrisma.agentSession.findMany.mockResolvedValue(mockSessions);

            const result = await service.getCostBreakdown();

            expect(result.totalCost).toBe(5.0);
            expect(result.breakdown['claude-code']).toBe(4.0);
            expect(result.breakdown['gemini']).toBe(1.0);
            expect(result.breakdown['missing-cost']).toBe(0);
        });
    });

    describe('getHistory', () => {
        it('should respect limit parameter', async () => {
            mockPrisma.agentSession.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

            await service.getHistory(2);

            expect(mockPrisma.agentSession.findMany).toHaveBeenCalledWith({
                where: {},
                orderBy: { startedAt: 'desc' },
                take: 2,
                include: { cost: true, gitSnapshot: true, quality: true }
            });
        });
    });
});
