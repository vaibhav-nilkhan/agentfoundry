import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogParserService } from '../logParser';
import { ClaudeParser } from '../logParsers/claude';
import { CodexParser } from '../logParsers/codex';
import { GeminiParser } from '../logParsers/gemini';
import * as fs from 'fs';

// Mock Prisma
const mockPrisma = {
    costRecord: {
        create: vi.fn().mockResolvedValue({ id: 'cost-1' })
    }
} as any;

// Mock fs module
vi.mock('fs');

describe('LogParser adapters', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ClaudeParser', () => {
        const parser = new ClaudeParser();
        
        it('should extract token usage from assistant messages', () => {
            const mockJsonl = [
                JSON.stringify({
                    type: 'assistant',
                    timestamp: '2026-03-07T10:00:30.000Z',
                    message: {
                        model: 'claude-sonnet-4-20250514',
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
                        model: 'claude-sonnet-4-20250514',
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
            expect(result.model).toBe('claude-sonnet-4-20250514');
        });

        it('should filter entries outside the time window', () => {
            const mockJsonl = [
                JSON.stringify({
                    type: 'assistant',
                    timestamp: '2026-03-07T09:00:00.000Z',
                    message: {
                        usage: {
                            input_tokens: 999,
                            output_tokens: 999
                        }
                    }
                }),
                JSON.stringify({
                    type: 'assistant',
                    timestamp: '2026-03-07T10:02:00.000Z',
                    message: {
                        usage: {
                            input_tokens: 500,
                            output_tokens: 300
                        }
                    }
                })
            ].join('\n');

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseJsonlFile('/fake/path.jsonl', start, end);

            expect(result.inputTokens).toBe(500);
            expect(result.outputTokens).toBe(300);
        });

        it('should prefer result event output tokens over message usage', () => {
            const mockJsonl = [
                JSON.stringify({
                    type: 'assistant',
                    timestamp: '2026-03-07T10:01:00.000Z',
                    message: {
                        usage: {
                            input_tokens: 1000,
                            output_tokens: 1
                        }
                    }
                }),
                JSON.stringify({
                    type: 'result',
                    timestamp: '2026-03-07T10:01:05.000Z',
                    result: {
                        usage: {
                            output_tokens: 750
                        }
                    }
                })
            ].join('\n');

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseJsonlFile('/fake/path.jsonl', start, end);

            expect(result.outputTokens).toBe(750);
        });
    });

    describe('CodexParser', () => {
        const parser = new CodexParser();

        it('should extract token usage from Codex response objects', () => {
            const mockJsonl = [
                JSON.stringify({
                    timestamp: '2026-03-07T10:01:00.000Z',
                    model: 'codex-mini-latest',
                    usage: {
                        input_tokens: 2000,
                        output_tokens: 1500
                    }
                }),
                JSON.stringify({
                    timestamp: '2026-03-07T10:02:00.000Z',
                    usage: {
                        input_tokens: 1000,
                        output_tokens: 800
                    }
                })
            ].join('\n');

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseCodexJsonlFile('/fake/codex.jsonl', start, end);

            expect(result.inputTokens).toBe(3000);
            expect(result.outputTokens).toBe(2300);
            expect(result.model).toBe('codex-mini-latest');
        });
    });

    describe('GeminiParser', () => {
        const parser = new GeminiParser();

        it('should extract token usage from telemetry entries', () => {
            const mockJsonl = [
                JSON.stringify({
                    timestamp: '2026-03-07T10:01:00.000Z',
                    model: 'gemini-2.5-pro',
                    input_tokens: 3000,
                    output_tokens: 2000
                }),
                JSON.stringify({
                    timestamp: '2026-03-07T10:02:00.000Z',
                    input_tokens: 1000,
                    output_tokens: 500
                })
            ].join('\n');

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseGeminiTelemetryFile('/fake/gemini.jsonl', start, end);

            expect(result.inputTokens).toBe(4000);
            expect(result.outputTokens).toBe(2500);
            expect(result.model).toBe('gemini-2.5-pro');
        });
    });

    describe('LogParserService Integration', () => {
        let service: LogParserService;

        beforeEach(() => {
            service = new LogParserService(mockPrisma);
        });

        it('should return null for unsupported agent types', async () => {
            const result = await service.parseAndSaveCost(
                'session-1',
                'unknown' as any,
                new Date(),
                new Date()
            );

            expect(result).toBeNull();
        });
    });
});
