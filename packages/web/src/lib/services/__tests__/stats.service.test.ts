import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@agentfoundry/db';
import { execSync } from 'child_process';
import path from 'path';
import * as fs from 'fs';
import { StatsService } from '../stats.service';

// Ensure a unique test database
const TEST_DB_PATH = path.join(__dirname, 'stats_test.db');
process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${TEST_DB_PATH}`
        }
    }
});

describe('Web StatsService - Real DB Integration', () => {
    let service: StatsService;

    beforeAll(async () => {
        const schemaPath = path.resolve(__dirname, '../../../../../../packages/db/prisma/schema.prisma');
        execSync(`npx prisma db push --schema=${schemaPath} --accept-data-loss`, {
            env: { ...process.env, DATABASE_URL: `file:${TEST_DB_PATH}` },
            stdio: 'ignore'
        });
        await prisma.$connect();
        service = new StatsService(prisma);
    });

    afterAll(async () => {
        await prisma.$disconnect();
        if (fs.existsSync(TEST_DB_PATH)) {
            fs.unlinkSync(TEST_DB_PATH);
        }
    });

    beforeEach(async () => {
        vi.clearAllMocks();
        // Clean the database tables before each test
        await prisma.gitSnapshot.deleteMany();
        await prisma.qualityMetrics.deleteMany();
        await prisma.costRecord.deleteMany();
        await prisma.agentSession.deleteMany();
    });

    describe('getOverview', () => {
        it('should correctly aggregate cost, sessions, and pass rates for the web dashboard', async () => {
            // Bug this catches: Overlooking sessions with missing quality/cost records, leading to NaN pass rates or null pointer errors
            
            await prisma.agentSession.create({
                data: {
                    agentName: 'claude',
                    taskType: 'backend',
                    cost: { create: { costUsd: 1.50, tokensIn: 100, tokensOut: 50 } },
                    quality: { create: { testsPassed: 10, testsFailed: 0 } }
                }
            });
            await prisma.agentSession.create({
                data: {
                    agentName: 'codex',
                    taskType: 'frontend',
                    cost: { create: { costUsd: 0.50, tokensIn: 100, tokensOut: 50 } },
                    quality: { create: { testsPassed: 8, testsFailed: 2 } }
                }
            });

            const result = await service.getOverview(undefined, 'all');

            expect(result.totalSessions).toBe(2);
            expect(result.totalCostUsd).toBe(2.00);
            expect(result.passRate).toBe(90); // 18 passed out of 20 = 90%
            expect(result.agentBreakdown).toEqual({ claude: 1, codex: 1 });
            expect(result.taskTypeBreakdown).toEqual({ backend: 1, frontend: 1 });
        });
    });

    describe('getCosts', () => {
        it('should aggregate costs by agent and daily trend', async () => {
            // Bug this catches: Timezone bugs in daily cost grouping, or missing zero-cost sessions causing misaligned chart data
            
            await prisma.agentSession.create({
                data: {
                    agentName: 'claude',
                    startedAt: new Date('2026-03-01T10:00:00Z'),
                    cost: { create: { costUsd: 1.00, tokensIn: 100, tokensOut: 50 } }
                }
            });
            await prisma.agentSession.create({
                data: {
                    agentName: 'claude',
                    startedAt: new Date('2026-03-01T14:00:00Z'),
                    cost: { create: { costUsd: 2.00, tokensIn: 100, tokensOut: 50 } }
                }
            });

            const result = await service.getCosts(undefined, 'all');
            expect(result.agentTotals).toEqual({ claude: 3.00 });
            expect(result.dailyCosts['2026-03-01']).toBe(3.00);
        });
    });

    describe('getSwarm', () => {
        it('should fetch and calculate metrics for a specific swarm', async () => {
            // Bug this catches: Failing to deduplicate changed files across multiple parallel swarm sessions
            
            await prisma.agentSession.create({
                data: {
                    agentName: 'claude',
                    swarmId: 'swarm_123',
                    startedAt: new Date('2026-03-01T10:00:00Z'),
                    endedAt: new Date('2026-03-01T10:05:00Z'),
                    cost: { create: { costUsd: 0.50, tokensIn: 100, tokensOut: 50 } },
                    gitSnapshot: { create: { filesChanged: JSON.stringify(['a.ts', 'b.ts']), linesAdded: 10, linesRemoved: 5 } }
                }
            });
            await prisma.agentSession.create({
                data: {
                    agentName: 'codex',
                    swarmId: 'swarm_123',
                    startedAt: new Date('2026-03-01T10:01:00Z'),
                    endedAt: new Date('2026-03-01T10:06:00Z'),
                    cost: { create: { costUsd: 0.30, tokensIn: 100, tokensOut: 50 } },
                    gitSnapshot: { create: { filesChanged: JSON.stringify(['b.ts', 'c.ts']), linesAdded: 10, linesRemoved: 5 } }
                }
            });

            const result = await service.getSwarm('swarm_123');

            expect(result?.swarmId).toBe('swarm_123');
            expect(result?.totalCost).toBe(0.80);
            expect(result?.totalFiles).toBe(3); // a.ts, b.ts, c.ts (deduplicated)
            expect(result?.sessions).toHaveLength(2);
        });

        it('should return null if no sessions found for swarmId', async () => {
            // Bug this catches: Crashing the swarm detail page when an invalid URL parameter is passed
            const result = await service.getSwarm('non-existent');
            expect(result).toBeNull();
        });
    });

    describe('getActiveSwarms', () => {
        it('should group currently active sessions into swarms and solos', async () => {
            // Bug this catches: Including completed sessions in the active tab because 'endedAt' null check is missing
            
            await prisma.agentSession.create({
                data: { agentName: 'claude', swarmId: 's1', endedAt: null, startedAt: new Date() }
            });
            await prisma.agentSession.create({
                data: { agentName: 'codex', swarmId: 's1', endedAt: null, startedAt: new Date() }
            });
            await prisma.agentSession.create({
                data: { agentName: 'gemini', swarmId: null, endedAt: null, startedAt: new Date() }
            });

            // Ensure ended session is NOT included
            await prisma.agentSession.create({
                data: { agentName: 'claude', swarmId: 's2', endedAt: new Date(), startedAt: new Date() }
            });

            const result = await service.getActiveSwarms();

            expect(result.swarms).toHaveLength(1);
            expect(result.swarms[0].sessions).toHaveLength(2);
            expect(result.solos).toHaveLength(1);
            expect(result.solos[0].agentName).toBe('gemini');
        });
    });

    describe('getBenchmarks', () => {
        it('should group sessions by benchmarkId and sort agents by pass rate, token yield, and cost', async () => {
            // Bug this catches: Sorting benchmark winners randomly instead of weighting pass rate first, then token yield, then cost
            
            await prisma.agentSession.create({
                data: {
                    agentName: 'claude',
                    benchmarkId: 'bench_123',
                    taskHint: 'Build a login form',
                    taskType: 'frontend',
                    startedAt: new Date('2026-03-01T10:00:00Z'),
                    quality: { create: { testsPassed: 10, testsFailed: 0, tokenYield: 2.5 } },
                    cost: { create: { costUsd: 0.10, tokensIn: 100, tokensOut: 50 } }
                }
            });
            await prisma.agentSession.create({
                data: {
                    agentName: 'codex',
                    benchmarkId: 'bench_123',
                    taskHint: 'Build a login form',
                    taskType: 'frontend',
                    startedAt: new Date('2026-03-01T10:00:00Z'),
                    quality: { create: { testsPassed: 8, testsFailed: 2, tokenYield: 1.5 } },
                    cost: { create: { costUsd: 0.05, tokensIn: 100, tokensOut: 50 } }
                }
            });
            await prisma.agentSession.create({
                data: {
                    agentName: 'gemini',
                    benchmarkId: 'bench_123',
                    taskHint: 'Build a login form',
                    taskType: 'frontend',
                    startedAt: new Date('2026-03-01T10:00:00Z'),
                    quality: { create: { testsPassed: 10, testsFailed: 0, tokenYield: 1.2 } },
                    cost: { create: { costUsd: 0.08, tokensIn: 100, tokensOut: 50 } }
                }
            });

            const result = await service.getBenchmarks();

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('bench_123');
            expect(result[0].taskHint).toBe('Build a login form');
            expect(result[0].taskType).toBe('frontend');
            
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
