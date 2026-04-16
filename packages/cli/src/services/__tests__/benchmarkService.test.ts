import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { PrismaClient } from '@agentfoundry/db';
import { BenchmarkService } from '../benchmarkService';

const TEST_DB_PATH = path.join(__dirname, 'benchmark_test-benchmark.db');
process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${TEST_DB_PATH}`
        }
    }
});

describe('BenchmarkService - Real DB Integration', () => {
    let service: BenchmarkService;
    let mockGit: any;
    let mockLogParser: any;
    let mockQQueue: any;

    beforeAll(async () => {
        const schemaPath = path.resolve(__dirname, '../../../../db/prisma/schema.prisma');
        execSync(`npx pnpm exec prisma db push --schema=${schemaPath} --accept-data-loss`, { stdio: 'ignore' });
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
        if (fs.existsSync(TEST_DB_PATH)) {
            fs.unlinkSync(TEST_DB_PATH);
        }
    });

    beforeEach(async () => {
        vi.clearAllMocks();
        await prisma.agentSession.deleteMany();

        mockGit = {
            takeSnapshot: vi.fn().mockResolvedValue({ filesChanged: ['src/index.ts'], linesAdded: 10, linesRemoved: 5 }),
            calculateDelta: vi.fn().mockReturnValue({ filesChanged: ['src/index.ts'], linesAdded: 10, linesRemoved: 5 }),
            resetToCleanState: vi.fn().mockResolvedValue(undefined)
        };

        mockLogParser = {
            parseAndSaveCost: vi.fn().mockResolvedValue({ costUsd: 0.05 })
        };

        mockQQueue = {
            enqueue: vi.fn().mockResolvedValue({
                testsPassed: 5,
                testsFailed: 0,
                lintIssues: 0,
                buildSuccess: true
            })
        };

        service = new BenchmarkService(prisma, mockLogParser, mockGit, mockQQueue);
        
        // @ts-ignore - Mock private executeAgent to avoid actual spawning
        vi.spyOn(service, 'executeAgent').mockResolvedValue(undefined);
    });

    it('should orchestrate a benchmark run for multiple agents and persist real data', async () => {
        // Bug this catches: Failing to correctly save the session, quality metrics, or git snapshot relationships when a benchmark finishes
        const results = await service.runBenchmark('test prompt', ['agent1', 'agent2']);

        expect(results).toHaveLength(2);
        expect(results[0].agentName).toBe('agent1');
        expect(results[1].agentName).toBe('agent2');
        
        expect(mockGit.resetToCleanState).toHaveBeenCalledTimes(2);
        expect(mockQQueue.enqueue).toHaveBeenCalledTimes(2);

        const sessionsInDb = await prisma.agentSession.findMany({
            include: { quality: true, gitSnapshot: true }
        });

        expect(sessionsInDb).toHaveLength(2);
        expect(sessionsInDb[0].agentName).toBe('agent1');
        expect(sessionsInDb[0].taskHint).toBe('test prompt');
        expect(sessionsInDb[0].benchmarkId).toBeDefined();
        
        // Ensure relations were created
        expect(sessionsInDb[0].quality).toBeDefined();
        expect(sessionsInDb[0].quality?.testsPassed).toBe(5);
        expect(sessionsInDb[0].gitSnapshot).toBeDefined();
        expect(sessionsInDb[0].gitSnapshot?.linesAdded).toBe(10);
    });
});
