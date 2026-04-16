import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@agentfoundry/db';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { LogParserService } from '../logParser';

// Mock the agent-specific parsers to return multi-model data
vi.mock('../logParsers', async () => {
    const actual = await vi.importActual('../logParsers') as any;
    return {
        ...actual,
        getParserForAgent: vi.fn()
    };
});

import { getParserForAgent } from '../logParsers';

const TEST_DB_PATH = path.join(__dirname, 'test-multimodel-v2026.db');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${TEST_DB_PATH}`
        }
    }
});

describe('LogParserService - 2026 Frontier Multi-Model Integration', () => {
    let service: LogParserService;

    beforeAll(async () => {
        const dbDir = path.resolve(__dirname, '../../../../../packages/db');
        execSync(`npx pnpm exec prisma db push --schema=./prisma/schema.prisma --accept-data-loss`, {
            cwd: dbDir,
            env: { ...process.env, DATABASE_URL: `file:${TEST_DB_PATH}` },
            stdio: 'ignore'
        });
        await prisma.$connect();
        service = new LogParserService(prisma);
    });

    afterAll(async () => {
        await prisma.$disconnect();
        if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    });

    it('should correctly save 2026 models and reasoning effort to the database', async () => {
        // Bug this catches: DB failing to persist 'high' reasoning effort classification for GPT-5/Sonnet 4.6
        
        const mockBreakdown = [
            { 
                model: 'claude-4-6-haiku-20260115', 
                inputTokens: 50000, 
                outputTokens: 100,
                reasoningEffort: 'low' 
            },
            { 
                model: 'gpt-5-4-omni', 
                inputTokens: 10000, 
                outputTokens: 500,
                thinkingTokens: 2000,
                reasoningEffort: 'high'
            }
        ];

        (getParserForAgent as any).mockReturnValue({
            parseLogs: () => ({
                inputTokens: 60000,
                outputTokens: 600,
                cacheCreationTokens: 0,
                cacheReadTokens: 0,
                model: 'gpt-5-4-omni',
                breakdown: mockBreakdown
            })
        });

        const session = await prisma.agentSession.create({
            data: {
                agentName: 'amp',
                taskType: 'backend',
                startedAt: new Date(),
                endedAt: new Date()
            }
        });

        const result = await service.parseAndSaveCost(session.id, 'amp' as any, new Date(), new Date());
        
        // 1. Verify calculated result
        expect(result?.model).toBe('gpt-5-4-omni');
        expect(result?.breakdown?.[1].reasoningEffort).toBe('high');

        // 2. Verify DB persistence
        const record = await prisma.costRecord.findUnique({
            where: { sessionId: session.id }
        });

        expect(record?.modelName).toBe('gpt-5-4-omni');
        const savedBreakdown = JSON.parse(record!.breakdown!);
        expect(savedBreakdown[1].model).toBe('gpt-5-4-omni');
        expect(savedBreakdown[1].reasoningEffort).toBe('high');
        expect(savedBreakdown[1].thinkingTokens).toBe(2000);
    });
});
