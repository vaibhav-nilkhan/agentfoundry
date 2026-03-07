import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatsService } from '../stats.service';

const mockPrisma = {
    agentSession: {
        findMany: vi.fn(),
        count: vi.fn()
    }
};

describe('Web StatsService', () => {
    let service: StatsService;

    beforeEach(() => {
        service = new StatsService(mockPrisma);
        vi.clearAllMocks();
    });

    describe('getOverview', () => {
        it('should correctly aggregate cost, sessions, and pass rates for the web dashboard', async () => {
            mockPrisma.agentSession.findMany.mockResolvedValue([
                {
                    agentName: 'claude',
                    taskType: 'backend',
                    cost: { costUsd: 1.50 },
                    quality: { testsPassed: 10, testsFailed: 0 }
                },
                {
                    agentName: 'codex',
                    taskType: 'frontend',
                    cost: { costUsd: 0.50 },
                    quality: { testsPassed: 8, testsFailed: 2 }
                }
            ]);

            const result = await service.getOverview('all');

            expect(result.totalSessions).toBe(2);
            expect(result.totalCostUsd).toBe(2.00);
            expect(result.passRate).toBe(90); // 18 passed out of 20 = 90%
            expect(result.agentBreakdown).toEqual({ claude: 1, codex: 1 });
            expect(result.taskTypeBreakdown).toEqual({ backend: 1, frontend: 1 });
        });
    });

    describe('getCosts', () => {
        it('should aggregate costs by agent and daily trend', async () => {
            mockPrisma.agentSession.findMany.mockResolvedValue([
                {
                    agentName: 'claude',
                    startedAt: new Date('2026-03-01T10:00:00Z'),
                    cost: { costUsd: 1.00 }
                },
                {
                    agentName: 'claude',
                    startedAt: new Date('2026-03-01T14:00:00Z'),
                    cost: { costUsd: 2.00 }
                }
            ]);

            const result = await service.getCosts('all');
            expect(result.agentTotals).toEqual({ claude: 3.00 });
            expect(result.dailyCosts['2026-03-01']).toBe(3.00);
        });
    });
});
