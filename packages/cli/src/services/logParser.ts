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
 * Supports Claude Code, Codex CLI, and Gemini CLI.
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
                    usage = this.parseCodexLogs(startedAt, endedAt);
                    break;
                case 'gemini':
                    usage = this.parseGeminiLogs(startedAt, endedAt);
                    break;
                case 'amp':
                    // Amp Code log format is not yet publicly documented.
                    // TODO: Implement when Amp publishes their log spec.
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
     * Reads Codex CLI JSONL session logs from ~/.codex/sessions/YYYY/MM/DD/.
     * Codex stores per-session rollout logs in date-sharded directories.
     */
    public parseCodexLogs(startedAt: Date, endedAt: Date): TokenUsage | null {
        const codexDir = this.getCodexLogDir();
        if (!codexDir || !fs.existsSync(codexDir)) {
            console.warn('[LogParser] Codex log directory not found:', codexDir);
            return null;
        }

        const usage: TokenUsage = {
            inputTokens: 0,
            outputTokens: 0,
            cacheCreationTokens: 0,
            cacheReadTokens: 0,
            model: undefined
        };

        // Codex uses date-sharded dirs: sessions/YYYY/MM/DD/rollout-*.jsonl
        const logFiles = this.findRecentLogFiles(codexDir, startedAt);
        if (logFiles.length === 0) {
            console.warn('[LogParser] No recent Codex log files found.');
            return null;
        }

        for (const logFile of logFiles) {
            const fileUsage = this.parseCodexJsonlFile(logFile, startedAt, endedAt);
            usage.inputTokens += fileUsage.inputTokens;
            usage.outputTokens += fileUsage.outputTokens;
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
     * Parses a Codex JSONL log file. Codex entries may have usage fields
     * like input_tokens and output_tokens on response objects.
     */
    public parseCodexJsonlFile(filePath: string, startedAt: Date, endedAt: Date): TokenUsage {
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

                    const entryTime = entry.timestamp ? new Date(entry.timestamp) : null;
                    if (entryTime && (entryTime < startedAt || entryTime > endedAt)) {
                        continue;
                    }

                    // Codex logs usage in response/completion objects
                    if (entry.usage) {
                        usage.inputTokens += entry.usage.input_tokens || entry.usage.prompt_tokens || 0;
                        usage.outputTokens += entry.usage.output_tokens || entry.usage.completion_tokens || 0;
                    }

                    if (entry.model && !usage.model) {
                        usage.model = entry.model;
                    }

                } catch {
                    continue;
                }
            }
        } catch (error) {
            console.error(`[LogParser] Failed to read Codex file ${filePath}:`, error);
        }

        return usage;
    }

    /**
     * Returns the Codex log directory path.
     * Default: ~/.codex/sessions/
     */
    public getCodexLogDir(): string {
        const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
        return path.join(codexHome, 'sessions');
    }

    /**
     * Reads Gemini CLI telemetry logs.
     * Gemini writes telemetry to a local file when configured via settings.json,
     * or to ~/.gemini/tmp/<hash>/otel/collector.log via OpenTelemetry.
     */
    public parseGeminiLogs(startedAt: Date, endedAt: Date): TokenUsage | null {
        const usage: TokenUsage = {
            inputTokens: 0,
            outputTokens: 0,
            cacheCreationTokens: 0,
            cacheReadTokens: 0,
            model: undefined
        };

        // Try telemetry outfile from settings.json first
        const telemetryFile = this.getGeminiTelemetryFile();
        if (telemetryFile && fs.existsSync(telemetryFile)) {
            const fileUsage = this.parseGeminiTelemetryFile(telemetryFile, startedAt, endedAt);
            usage.inputTokens += fileUsage.inputTokens;
            usage.outputTokens += fileUsage.outputTokens;
            if (fileUsage.model) {
                usage.model = fileUsage.model;
            }
        }

        // Also check OpenTelemetry collector logs
        const otelDir = path.join(os.homedir(), '.gemini', 'tmp');
        if (fs.existsSync(otelDir)) {
            const collectorLogs = this.findRecentLogFiles(otelDir, startedAt)
                .filter(f => f.endsWith('collector.log') || f.endsWith('.jsonl'));

            for (const logFile of collectorLogs) {
                const fileUsage = this.parseGeminiTelemetryFile(logFile, startedAt, endedAt);
                usage.inputTokens += fileUsage.inputTokens;
                usage.outputTokens += fileUsage.outputTokens;
                if (fileUsage.model) {
                    usage.model = fileUsage.model;
                }
            }
        }

        if (usage.inputTokens === 0 && usage.outputTokens === 0) {
            return null;
        }

        return usage;
    }

    /**
     * Parses a Gemini telemetry/collector log file.
     * Entries contain event names like 'gemini_cli.api_response' with token counts.
     */
    public parseGeminiTelemetryFile(filePath: string, startedAt: Date, endedAt: Date): TokenUsage {
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

                    const entryTime = entry.timestamp ? new Date(entry.timestamp) : null;
                    if (entryTime && (entryTime < startedAt || entryTime > endedAt)) {
                        continue;
                    }

                    // Gemini telemetry entries with token data
                    if (entry.input_tokens || entry.inputTokenCount) {
                        usage.inputTokens += entry.input_tokens || entry.inputTokenCount || 0;
                        usage.outputTokens += entry.output_tokens || entry.outputTokenCount || 0;
                    }

                    // Check nested attributes (OpenTelemetry format)
                    if (entry.attributes) {
                        usage.inputTokens += entry.attributes.input_token_count || entry.attributes.input_tokens || 0;
                        usage.outputTokens += entry.attributes.output_token_count || entry.attributes.output_tokens || 0;
                    }

                    // Extract model name
                    const model = entry.model || entry.attributes?.model_name || entry.attributes?.model;
                    if (model && !usage.model) {
                        usage.model = model;
                    }

                } catch {
                    continue;
                }
            }
        } catch (error) {
            console.error(`[LogParser] Failed to read Gemini file ${filePath}:`, error);
        }

        return usage;
    }

    /**
     * Reads the Gemini CLI telemetry outfile path from settings.json.
     * Falls back to GEMINI_TELEMETRY_OUTFILE env var.
     */
    public getGeminiTelemetryFile(): string | null {
        // Check env var first
        if (process.env.GEMINI_TELEMETRY_OUTFILE) {
            return process.env.GEMINI_TELEMETRY_OUTFILE;
        }

        // Try reading from ~/.gemini/settings.json
        const settingsPath = path.join(os.homedir(), '.gemini', 'settings.json');
        try {
            if (fs.existsSync(settingsPath)) {
                const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
                if (settings.telemetry?.outfile) {
                    return settings.telemetry.outfile;
                }
            }
        } catch {
            // Settings file doesn't exist or is malformed
        }

        return null;
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
