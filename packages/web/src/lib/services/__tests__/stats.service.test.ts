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

    describe('getSwarm', () => {
        it('should fetch and calculate metrics for a specific swarm', async () => {
            const mockSessions = [
                {
                    id: '1',
                    agentName: 'claude',
                    swarmId: 'swarm_123',
                    startedAt: new Date('2026-03-01T10:00:00Z'),
                    endedAt: new Date('2026-03-01T10:05:00Z'),
                    cost: { costUsd: 0.50 },
                    gitSnapshot: { filesChanged: JSON.stringify(['a.ts', 'b.ts']) }
                },
                {
                    id: '2',
                    agentName: 'codex',
                    swarmId: 'swarm_123',
                    startedAt: new Date('2026-03-01T10:01:00Z'),
                    endedAt: new Date('2026-03-01T10:06:00Z'),
                    cost: { costUsd: 0.30 },
                    gitSnapshot: { filesChanged: JSON.stringify(['b.ts', 'c.ts']) }
                }
            ];

            mockPrisma.agentSession.findMany.mockResolvedValue(mockSessions);

            const result = await service.getSwarm('swarm_123');

            expect(result?.swarmId).toBe('swarm_123');
            expect(result?.totalCost).toBe(0.80);
            expect(result?.totalFiles).toBe(3); // a.ts, b.ts, c.ts (deduplicated)
            expect(result?.sessions).toHaveLength(2);
        });

        it('should return null if no sessions found for swarmId', async () => {
            mockPrisma.agentSession.findMany.mockResolvedValue([]);
            const result = await service.getSwarm('non-existent');
            expect(result).toBeNull();
        });
    });

    describe('getActiveSwarms', () => {
        it('should group currently active sessions into swarms and solos', async () => {
            mockPrisma.agentSession.findMany.mockResolvedValue([
                { id: '1', agentName: 'claude', swarmId: 's1', endedAt: null, startedAt: new Date() },
                { id: '2', agentName: 'codex', swarmId: 's1', endedAt: null, startedAt: new Date() },
                { id: '3', agentName: 'gemini', swarmId: null, endedAt: null, startedAt: new Date() }
            ]);

            const result = await service.getActiveSwarms();

            expect(result.swarms).toHaveLength(1);
            expect(result.swarms[0].sessions).toHaveLength(2);
            expect(result.solos).toHaveLength(1);
            expect(result.solos[0].agentName).toBe('gemini');
        });
    });
});
