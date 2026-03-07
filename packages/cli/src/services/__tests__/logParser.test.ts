import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogParserService, TokenUsage } from '../logParser';
import * as fs from 'fs';
import * as path from 'path';

// Mock Prisma
const mockPrisma = {
    costRecord: {
        create: vi.fn().mockResolvedValue({ id: 'cost-1' })
    }
} as any;

// Mock fs module
vi.mock('fs');

describe('LogParserService', () => {
    let parser: LogParserService;

    beforeEach(() => {
        vi.clearAllMocks();
        parser = new LogParserService(mockPrisma);
    });

    describe('parseJsonlFile', () => {
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

            // Only the second entry should be counted
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
                            output_tokens: 1 // Placeholder value (known bug)
                        }
                    }
                }),
                JSON.stringify({
                    type: 'result',
                    timestamp: '2026-03-07T10:01:05.000Z',
                    result: {
                        usage: {
                            output_tokens: 750 // Accurate value
                        }
                    }
                })
            ].join('\n');

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseJsonlFile('/fake/path.jsonl', start, end);

            // Should use the result event's output_tokens (750) instead of the placeholder (1)
            expect(result.outputTokens).toBe(750);
        });

        it('should skip malformed JSON lines gracefully', () => {
            const mockJsonl = [
                '{"type": "assistant", "timestamp": "2026-03-07T10:01:00.000Z", "message": {"usage": {"input_tokens": 100, "output_tokens": 50}}}',
                'this is not json',
                '{"broken json',
                '{"type": "assistant", "timestamp": "2026-03-07T10:02:00.000Z", "message": {"usage": {"input_tokens": 200, "output_tokens": 100}}}'
            ].join('\n');

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseJsonlFile('/fake/path.jsonl', start, end);

            expect(result.inputTokens).toBe(300);
            expect(result.outputTokens).toBe(150);
        });

        it('should return zero tokens for empty file', () => {
            vi.mocked(fs.readFileSync).mockReturnValue('');

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseJsonlFile('/fake/path.jsonl', start, end);

            expect(result.inputTokens).toBe(0);
            expect(result.outputTokens).toBe(0);
        });
    });

    describe('parseAndSaveCost', () => {
        it('should return null for unsupported agent types', async () => {
            const result = await parser.parseAndSaveCost(
                'session-1',
                'unknown' as any,
                new Date(),
                new Date()
            );

            expect(result).toBeNull();
        });
    });

    describe('parseCodexJsonlFile', () => {
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

        it('should support prompt_tokens/completion_tokens format', () => {
            const mockJsonl = JSON.stringify({
                timestamp: '2026-03-07T10:01:00.000Z',
                model: 'o3',
                usage: {
                    prompt_tokens: 5000,
                    completion_tokens: 3000
                }
            });

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseCodexJsonlFile('/fake/codex.jsonl', start, end);

            expect(result.inputTokens).toBe(5000);
            expect(result.outputTokens).toBe(3000);
            expect(result.model).toBe('o3');
        });

        it('should filter Codex entries outside time window', () => {
            const mockJsonl = [
                JSON.stringify({
                    timestamp: '2026-03-07T08:00:00.000Z',
                    usage: { input_tokens: 999, output_tokens: 999 }
                }),
                JSON.stringify({
                    timestamp: '2026-03-07T10:01:00.000Z',
                    usage: { input_tokens: 100, output_tokens: 50 }
                })
            ].join('\n');

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseCodexJsonlFile('/fake/codex.jsonl', start, end);

            expect(result.inputTokens).toBe(100);
            expect(result.outputTokens).toBe(50);
        });
    });

    describe('parseGeminiTelemetryFile', () => {
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

        it('should extract tokens from OpenTelemetry attributes format', () => {
            const mockJsonl = JSON.stringify({
                timestamp: '2026-03-07T10:01:00.000Z',
                attributes: {
                    input_token_count: 2500,
                    output_token_count: 1200,
                    model_name: 'gemini-2.5-flash'
                }
            });

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseGeminiTelemetryFile('/fake/collector.log', start, end);

            expect(result.inputTokens).toBe(2500);
            expect(result.outputTokens).toBe(1200);
            expect(result.model).toBe('gemini-2.5-flash');
        });

        it('should support inputTokenCount/outputTokenCount format', () => {
            const mockJsonl = JSON.stringify({
                timestamp: '2026-03-07T10:01:00.000Z',
                inputTokenCount: 4000,
                outputTokenCount: 1800
            });

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseGeminiTelemetryFile('/fake/gemini.jsonl', start, end);

            expect(result.inputTokens).toBe(4000);
            expect(result.outputTokens).toBe(1800);
        });

        it('should filter Gemini entries outside time window', () => {
            const mockJsonl = [
                JSON.stringify({
                    timestamp: '2026-03-07T08:00:00.000Z',
                    input_tokens: 999,
                    output_tokens: 999
                }),
                JSON.stringify({
                    timestamp: '2026-03-07T10:01:00.000Z',
                    input_tokens: 200,
                    output_tokens: 100
                })
            ].join('\n');

            vi.mocked(fs.readFileSync).mockReturnValue(mockJsonl);

            const start = new Date('2026-03-07T10:00:00.000Z');
            const end = new Date('2026-03-07T10:05:00.000Z');

            const result = parser.parseGeminiTelemetryFile('/fake/gemini.jsonl', start, end);

            expect(result.inputTokens).toBe(200);
            expect(result.outputTokens).toBe(100);
        });
    });
});
