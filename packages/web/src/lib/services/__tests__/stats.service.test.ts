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

    describe('getBenchmarks', () => {
        it('should group sessions by benchmarkId and sort agents by pass rate, token yield, and cost', async () => {
            const mockSessions = [
                {
                    id: '1',
                    agentName: 'claude',
                    benchmarkId: 'bench_123',
                    taskHint: 'Build a login form',
                    createdAt: new Date('2026-03-01T10:00:00Z'),
                    quality: { testsPassed: 10, testsFailed: 0, tokenYield: 2.5 },
                    cost: { costUsd: 0.10 }
                },
                {
                    id: '2',
                    agentName: 'codex',
                    benchmarkId: 'bench_123',
                    taskHint: 'Build a login form',
                    createdAt: new Date('2026-03-01T10:00:00Z'),
                    quality: { testsPassed: 8, testsFailed: 2, tokenYield: 1.5 },
                    cost: { costUsd: 0.05 }
                },
                {
                    id: '3',
                    agentName: 'gemini',
                    benchmarkId: 'bench_123',
                    taskHint: 'Build a login form',
                    createdAt: new Date('2026-03-01T10:00:00Z'),
                    quality: { testsPassed: 10, testsFailed: 0, tokenYield: 1.2 }, // Better yield than claude
                    cost: { costUsd: 0.08 }
                }
            ];

            mockPrisma.agentSession.findMany.mockResolvedValue(mockSessions);

            const result = await service.getBenchmarks();

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('bench_123');
            expect(result[0].taskHint).toBe('Build a login form');
            
            // Expected Order:
            // 1. gemini (100% pass, 1.2 yield, $0.08)
            // 2. claude (100% pass, 2.5 yield, $0.10)
            // 3. codex (80% pass, 1.5 yield, $0.05)
            expect(result[0].sessions).toHaveLength(3);
            expect(result[0].sessions[0].agentName).toBe('gemini');
            expect(result[0].sessions[1].agentName).toBe('claude');
            expect(result[0].sessions[2].agentName).toBe('codex');
            expect(result[0].winner).toBe('gemini');
        });
    });
});
