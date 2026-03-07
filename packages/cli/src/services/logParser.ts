import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { PrismaClient } from '@agentfoundry/db';
import { calculateTokenCost } from './pricingConfig';
import { AgentType } from './processMonitor';

export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    model?: string;
}

export interface ParsedSessionCost {
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
    model?: string;
}

/**
 * Parses agent log files to extract token usage and calculate costs.
 * Currently supports Claude Code JSONL logs from ~/.claude/projects/.
 */
export class LogParserService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Main entry point: parse logs for an agent session and save the cost record.
     */
    public async parseAndSaveCost(
        sessionId: string,
        agentName: AgentType,
        startedAt: Date,
        endedAt: Date
    ): Promise<ParsedSessionCost | null> {
        try {
            let usage: TokenUsage | null = null;

            switch (agentName) {
                case 'claude-code':
                    usage = this.parseClaudeLogs(startedAt, endedAt);
                    break;
                case 'codex':
                    // Codex log parsing — future implementation
                    usage = null;
                    break;
                case 'gemini':
                    // Gemini log parsing — future implementation
                    usage = null;
                    break;
                default:
                    usage = null;
            }

            if (!usage) {
                return null;
            }

            const totalIn = usage.inputTokens + usage.cacheCreationTokens + usage.cacheReadTokens;
            const totalOut = usage.outputTokens;
            const costUsd = calculateTokenCost(agentName, totalIn, totalOut, usage.model);

            const result: ParsedSessionCost = {
                tokensIn: totalIn,
                tokensOut: totalOut,
                costUsd,
                model: usage.model
            };

            await this.saveCostRecord(sessionId, result);
            return result;

        } catch (error) {
            console.error(`[LogParser] Failed to parse logs for ${agentName}:`, error);
            return null;
        }
    }

    /**
     * Reads Claude Code JSONL session logs from ~/.claude/projects/.
     * Each line is a JSON object. We look for assistant messages with usage data
     * that fall within the session timeframe.
     */
    public parseClaudeLogs(startedAt: Date, endedAt: Date): TokenUsage | null {
        const claudeDir = this.getClaudeLogDir();
        if (!claudeDir || !fs.existsSync(claudeDir)) {
            console.warn('[LogParser] Claude log directory not found:', claudeDir);
            return null;
        }

        const usage: TokenUsage = {
            inputTokens: 0,
            outputTokens: 0,
            cacheCreationTokens: 0,
            cacheReadTokens: 0,
            model: undefined
        };

        const logFiles = this.findRecentLogFiles(claudeDir, startedAt);
        if (logFiles.length === 0) {
            console.warn('[LogParser] No recent Claude log files found.');
            return null;
        }

        for (const logFile of logFiles) {
            const fileUsage = this.parseJsonlFile(logFile, startedAt, endedAt);
            usage.inputTokens += fileUsage.inputTokens;
            usage.outputTokens += fileUsage.outputTokens;
            usage.cacheCreationTokens += fileUsage.cacheCreationTokens;
            usage.cacheReadTokens += fileUsage.cacheReadTokens;
            if (fileUsage.model) {
                usage.model = fileUsage.model;
            }
        }

        if (usage.inputTokens === 0 && usage.outputTokens === 0) {
            return null;
        }

        return usage;
    }

    /**
     * Parses a single JSONL file and extracts token usage within the time window.
     */
    public parseJsonlFile(filePath: string, startedAt: Date, endedAt: Date): TokenUsage {
        const usage: TokenUsage = {
            inputTokens: 0,
            outputTokens: 0,
            cacheCreationTokens: 0,
            cacheReadTokens: 0,
            model: undefined
        };

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    const entry = JSON.parse(line);

                    // Check if this entry falls within our session time window
                    const entryTime = entry.timestamp ? new Date(entry.timestamp) : null;
                    if (entryTime && (entryTime < startedAt || entryTime > endedAt)) {
                        continue;
                    }

                    // Extract usage from assistant messages
                    if (entry.type === 'assistant' && entry.message?.usage) {
                        const msgUsage = entry.message.usage;
                        usage.inputTokens += msgUsage.input_tokens || 0;
                        usage.outputTokens += msgUsage.output_tokens || 0;
                        usage.cacheCreationTokens += msgUsage.cache_creation_input_tokens || 0;
                        usage.cacheReadTokens += msgUsage.cache_read_input_tokens || 0;
                    }

                    // Extract model name
                    if (entry.message?.model && !usage.model) {
                        usage.model = entry.message.model;
                    }

                    // Also check for usage in result events (more accurate output tokens)
                    if (entry.type === 'result' && entry.result?.usage) {
                        const resultUsage = entry.result.usage;
                        if (resultUsage.output_tokens && resultUsage.output_tokens > 2) {
                            // Result events have more accurate output token counts
                            usage.outputTokens = resultUsage.output_tokens;
                        }
                    }

                } catch {
                    // Skip malformed lines
                    continue;
                }
            }
        } catch (error) {
            console.error(`[LogParser] Failed to read file ${filePath}:`, error);
        }

        return usage;
    }

    /**
     * Returns the Claude log directory path.
     */
    public getClaudeLogDir(): string {
        return path.join(os.homedir(), '.claude', 'projects');
    }

    /**
     * Finds JSONL log files modified recently (within the session timeframe).
     */
    public findRecentLogFiles(dir: string, since: Date): string[] {
        const results: string[] = [];

        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    // Recurse into subdirectories
                    results.push(...this.findRecentLogFiles(fullPath, since));
                } else if (entry.name.endsWith('.jsonl')) {
                    const stat = fs.statSync(fullPath);
                    // Include files modified after the session started
                    if (stat.mtime >= since) {
                        results.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.error(`[LogParser] Failed to read directory ${dir}:`, error);
        }

        return results;
    }

    /**
     * Saves the parsed cost data to the CostRecord table via Prisma.
     */
    private async saveCostRecord(sessionId: string, cost: ParsedSessionCost): Promise<void> {
        await this.prisma.costRecord.create({
            data: {
                sessionId,
                tokensIn: cost.tokensIn,
                tokensOut: cost.tokensOut,
                costUsd: cost.costUsd
            }
        });
    }
}
