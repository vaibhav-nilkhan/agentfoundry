import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { PrismaClient } from '@agentfoundry/db';
import { ReportsService } from '../reports.service';

const TEST_DB_PATH = path.join(__dirname, 'reports_test-reports.db');
process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${TEST_DB_PATH}`
        }
    }
});

describe('ReportsService - Real DB Integration', () => {
    let service: ReportsService;

    beforeAll(async () => {
        const schemaPath = path.resolve(__dirname, '../../../../db/prisma/schema.prisma');
        execSync(`npx prisma db push --schema=${schemaPath} --accept-data-loss`, { stdio: 'ignore' });
        await prisma.$connect();
        service = new ReportsService(prisma);
    });

    afterAll(async () => {
        await prisma.$disconnect();
        if (fs.existsSync(TEST_DB_PATH)) {
            fs.unlinkSync(TEST_DB_PATH);
        }
    });

    beforeEach(async () => {
        await prisma.agentSession.deleteMany();
    });

    describe('getOverallStats', () => {
        it('should calculate correct stats across multiple sessions', async () => {
            // Bug this catches: Incorrect aggregate mathematical calculations when querying real DB rows (e.g., ignoring cost nulls)
            await prisma.agentSession.create({
                data: {
                    agentName: 'claude-code',
                    startedAt: new Date(),
                    durationSeconds: 10,
                    cost: { create: { tokensIn: 100, tokensOut: 50, costUsd: 0.1 } },
                    quality: { create: { testsPassed: 5, testsFailed: 0 } }
                }
            });
            await prisma.agentSession.create({
                data: {
                    agentName: 'claude-code',
                    startedAt: new Date(),
                    durationSeconds: 20,
                    cost: { create: { tokensIn: 200, tokensOut: 100, costUsd: 0.2 } },
                    quality: { create: { testsPassed: 4, testsFailed: 1 } }
                }
            });

            const result = await service.getOverallStats();

            expect(result.totalSessions).toBe(2);
            expect(result.avgDuration).toBe(15);
            expect(result.totalTokensIn).toBe(300);
            expect(result.totalTokensOut).toBe(150);
            expect(result.totalCostUsd).toBeCloseTo(0.3);
            expect(result.passRate).toBe(90); // 9 passed, 1 failed = 90%
        });

        it('should handle zero sessions gracefully', async () => {
            // Bug this catches: Division by zero or null reference errors when running against an empty production database
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
            // Bug this catches: Faulty group-by logic or failing to handle sessions that lack cost records in the real DB
            await prisma.agentSession.create({
                data: {
                    agentName: 'claude-code',
                    cost: { create: { costUsd: 1.5, tokensIn: 0, tokensOut: 0 } }
                }
            });
            await prisma.agentSession.create({
                data: {
                    agentName: 'claude-code',
                    cost: { create: { costUsd: 2.5, tokensIn: 0, tokensOut: 0 } }
                }
            });
            await prisma.agentSession.create({
                data: {
                    agentName: 'gemini',
                    cost: { create: { costUsd: 1.0, tokensIn: 0, tokensOut: 0 } }
                }
            });
            await prisma.agentSession.create({
                data: {
                    agentName: 'missing-cost'
                }
            }); // missing cost record

            const result = await service.getCostBreakdown();

            expect(result.totalCost).toBe(5.0);
            expect(result.breakdown['claude-code']).toBe(4.0);
            expect(result.breakdown['gemini']).toBe(1.0);
            expect(result.breakdown['missing-cost']).toBe(0);
        });
    });

    describe('getHistory', () => {
        it('should respect limit parameter', async () => {
            // Bug this catches: Database queries returning too many rows, causing memory exhaustion in production
            await prisma.agentSession.create({ data: { agentName: 'test-1', startedAt: new Date('2024-01-01') } });
            await prisma.agentSession.create({ data: { agentName: 'test-2', startedAt: new Date('2024-01-02') } });
            await prisma.agentSession.create({ data: { agentName: 'test-3', startedAt: new Date('2024-01-03') } });

            const history = await service.getHistory(2);

            expect(history.length).toBe(2);
            // Should be ordered by startedAt desc
            expect(history[0].agentName).toBe('test-3');
            expect(history[1].agentName).toBe('test-2');
        });
    });
});
