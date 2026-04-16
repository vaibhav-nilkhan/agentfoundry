import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@agentfoundry/db';
import { SwarmManager } from '../swarmManager';
import { LogParserService } from '../logParser';
import { HeartbeatService } from '../HeartbeatService';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const TEST_DB_PATH = path.join(__dirname, 'test-heartbeat.db');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${TEST_DB_PATH}`
        }
    }
});

// Mock the GitIntegration to simulate real-time deltas
vi.mock('../gitIntegration', () => {
    class MockGitIntegration {
        takeSnapshot = vi.fn().mockResolvedValue({
            filesChanged: ['src/new-file.ts'],
            linesAdded: 100,
            linesRemoved: 5
        });
        calculateDelta = vi.fn().mockReturnValue({
            filesChanged: ['src/new-file.ts'],
            linesAdded: 100,
            linesRemoved: 5
        });
    }
    return { GitIntegration: MockGitIntegration };
});

// Mock LogParser to return fake token usage
vi.mock('../logParsers', async () => {
    const actual = await vi.importActual('../logParsers') as any;
    return {
        ...actual,
        getParserForAgent: vi.fn().mockReturnValue({
            parseLogs: () => ({
                inputTokens: 5000,
                outputTokens: 1000,
                cacheCreationTokens: 0,
                cacheReadTokens: 0,
                model: 'gpt-5-4-omni'
            })
        })
    };
});

describe('HeartbeatService - Real DB Integration', () => {
    let heartbeat: HeartbeatService;
    let swarm: SwarmManager;
    let logParser: LogParserService;

    beforeAll(async () => {
        const dbDir = path.resolve(__dirname, '../../../../../packages/db');
        execSync(`npx pnpm exec prisma db push --schema=./prisma/schema.prisma --accept-data-loss`, {
            cwd: dbDir,
            env: { ...process.env, DATABASE_URL: `file:${TEST_DB_PATH}` },
            stdio: 'ignore'
        });
        await prisma.$connect();
        
        swarm = new SwarmManager();
        logParser = new LogParserService(prisma);
        heartbeat = new HeartbeatService(prisma, swarm, logParser);
    }, 120000);

    afterAll(async () => {
        await prisma.$disconnect();
        if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    });

    it('should anchor a session as ACTIVE and update its progress during a heartbeat', async () => {
        // Bug this catches: Data loss during 3-day sessions if system crashes before 'stop' event
        
        const PID = 99999;
        const timestamp = new Date();

        // 1. Simulate session start
        await swarm.registerStart(PID, 'amp', timestamp);
        const session = await prisma.agentSession.create({
            data: {
                agentName: 'amp',
                status: 'ACTIVE',
                startedAt: timestamp,
                quality: { create: {} },
                gitSnapshot: { create: { filesChanged: '[]' } }
            }
        });
        heartbeat.registerSessionMapping(PID, session.id);

        // 2. Trigger Heartbeat
        await heartbeat.processActiveSessions();

        // 3. Verify real-time update in DB
        const updatedSession = await prisma.agentSession.findUnique({
            where: { id: session.id },
            include: { cost: true, gitSnapshot: true }
        });

        expect(updatedSession?.status).toBe('ACTIVE');
        expect(updatedSession?.cost?.tokensIn).toBe(5000);
        expect(updatedSession?.gitSnapshot?.linesAdded).toBe(100);
        expect(JSON.parse(updatedSession!.gitSnapshot!.filesChanged)).toContain('src/new-file.ts');
        
        // 4. Verify idempotent upsert (trigger second heartbeat)
        await heartbeat.processActiveSessions();
        const costCount = await prisma.costRecord.count({ where: { sessionId: session.id } });
        expect(costCount).toBe(1); // Should NOT create duplicate rows
    });
});
