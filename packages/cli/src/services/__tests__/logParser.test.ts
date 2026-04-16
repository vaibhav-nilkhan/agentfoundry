import { findRecentLogFiles } from "../logParsers/utils";
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { LogParserService } from '../logParser';
import { ClaudeParser } from '../logParsers/claude';
import { CodexParser } from '../logParsers/codex';
import { GeminiParser } from '../logParsers/gemini';
import { PrismaClient } from '@agentfoundry/db';
import { execSync } from 'child_process';
import path from 'path';
import * as fs from 'fs';

// Setup real SQLite DB
const TEST_DB_PATH = path.join(__dirname, 'logParser_test.db');
process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: `file:${TEST_DB_PATH}`
        }
    }
});

vi.mock('fs', async (importOriginal) => {
    const actual = await importOriginal<typeof import('fs')>();
    return {
        ...actual,
        readFileSync: vi.fn(),
        existsSync: vi.fn(),
    };
});

vi.mock('../logParsers/utils', () => ({
    findRecentLogFiles: vi.fn(),
}));

describe('LogParser adapters', () => {
    beforeAll(async () => {
        // Initialize the DB schema
        const schemaPath = path.resolve(__dirname, '../../../../../packages/db/prisma/schema.prisma');
        execSync(`npx prisma db push --schema=${schemaPath} --accept-data-loss`, {
            env: { ...process.env, DATABASE_URL: `file:${TEST_DB_PATH}` },
            stdio: 'ignore'
        });
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
        // Clean the database tables before each test
        await prisma.costRecord.deleteMany();
        await prisma.agentSession.deleteMany();
    });

    describe('ClaudeParser', () => {
        const parser = new ClaudeParser();
        
        it('should extract token usage from assistant messages', () => {
            // Bug this catches: Fails to parse correct token metrics from Claude's distinct tool_use format vs assistant message format
            const mockJsonl = [
                JSON.stringify({
                    type: 'assistant',
                    timestamp: '2026-03-07T10:00:30.000Z',
                    message: {
                        model: 'claude-4-6-sonnet-20260115',
                        usage: {
                            input_tokens: 1500,
                            output_tokens: 800,
                            cache_creation_input_tokens: 200,
                            cache_read_input_tokens: 100
                        }
                    }
                }),
                JSON.stringify({
                    type: 'assistant',
                    timestamp: '2026-03-07T10:01:00.000Z',
                    message: {
                        model: 'claude-4-6-sonnet-20260115',
                        usage: {
                            input_tokens: 2000,
                            output_tokens: 1200,
                            cache_creation_input_tokens: 0,
                            cache_read_input_tokens: 300
                        }
                    }
                })
            ].join('\n');

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseJsonlFile('/fake/path.jsonl', start, end);

            expect(result.inputTokens).toBe(3500);
            expect(result.outputTokens).toBe(2000);
            expect(result.cacheCreationTokens).toBe(200);
            expect(result.cacheReadTokens).toBe(400);
            expect(result.model).toBe('claude-4-6-sonnet-20260115');
        });
    });

    describe('CodexParser', () => {
        const parser = new CodexParser();

        it('should extract token usage from Codex response objects', () => {
            const mockJsonl = [
                JSON.stringify({
                    timestamp: '2026-03-07T10:01:00.000Z',
                    model: 'codex-5-3-turbo',
                    usage: {
                        input_tokens: 2000,
                        output_tokens: 1500
                    }
                })
            ].join('\n');

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseCodexJsonlFile('/fake/codex.jsonl', start, end);

            expect(result.inputTokens).toBe(2000);
            expect(result.outputTokens).toBe(1500);
            expect(result.model).toBe('codex-5-3-turbo');
        });
    });

    describe('GeminiParser', () => {
        const parser = new GeminiParser();

        it('should extract token usage from telemetry entries', () => {
            const mockJsonl = [
                JSON.stringify({
                    timestamp: '2026-03-07T10:01:00.000Z',
                    model: 'gemini-3-1-pro',
                    input_tokens: 3000,
                    output_tokens: 2000
                })
            ].join('\n');

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseGeminiTelemetryFile('/fake/gemini.jsonl', start, end);

            expect(result.inputTokens).toBe(3000);
            expect(result.outputTokens).toBe(2000);
            expect(result.model).toBe('gemini-3-1-pro');
        });
    });

    describe('LogParserService Integration', () => {
        let service: LogParserService;

        beforeEach(() => {
            service = new LogParserService(prisma);
        });

        it('should parse and save cost successfully for a supported agent', async () => {
            // Bug this catches: Failing to correctly link CostRecord to AgentSession due to missing foreign keys, or writing incorrect float math to DB
            
            const session = await prisma.agentSession.create({
                data: {
                    agentName: 'claude-code',
                    startedAt: new Date('2026-03-07T10:00:00.000Z')
                }
            });

            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(findRecentLogFiles).mockReturnValue(['/fake/path.jsonl']);
            const mockJsonl = [
                JSON.stringify({
                    type: 'assistant',
                    timestamp: '2026-03-07T10:01:00.000Z',
                    message: {
                        model: 'claude-4-6-sonnet-20260115',
                        usage: {
                            input_tokens: 1000,
                            output_tokens: 500,
                            cache_creation_input_tokens: 0,
                            cache_read_input_tokens: 0
                        }
                    }
                })
            ].join('\n');
            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');
            const result = await service.parseAndSaveCost(
                session.id,
                'claude-code',
                start,
                end
            );

            expect(result).not.toBeNull();
            expect(result?.tokensIn).toBe(1000);
            expect(result?.model).toBe('claude-4-6-sonnet-20260115');
            
            const savedCost = await prisma.costRecord.findUnique({
                where: { sessionId: session.id }
            });
            expect(savedCost).not.toBeNull();
            expect(savedCost?.costUsd).toBeGreaterThan(0);
        });
    });
});
