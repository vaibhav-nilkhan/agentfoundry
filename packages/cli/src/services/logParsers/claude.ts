import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BaseParser } from './BaseParser';
import { TokenUsage } from './types';
import { findRecentLogFiles } from './utils';

export class ClaudeParser implements BaseParser {
    public parseLogs(startedAt: Date, endedAt: Date): TokenUsage | null {
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

        const logFiles = findRecentLogFiles(claudeDir, startedAt);
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

                    const entryTime = entry.timestamp ? new Date(entry.timestamp) : null;
                    if (entryTime && (entryTime < startedAt || entryTime > endedAt)) {
                        continue;
                    }

                    if (entry.type === 'assistant' && entry.message?.usage) {
                        const msgUsage = entry.message.usage;
                        usage.inputTokens += msgUsage.input_tokens || 0;
                        usage.outputTokens += msgUsage.output_tokens || 0;
                        usage.cacheCreationTokens += msgUsage.cache_creation_input_tokens || 0;
                        usage.cacheReadTokens += msgUsage.cache_read_input_tokens || 0;
                    }

                    if (entry.message?.model && !usage.model) {
                        usage.model = entry.message.model;
                    }

                    if (entry.type === 'result' && entry.result?.usage) {
                        const resultUsage = entry.result.usage;
                        if (resultUsage.output_tokens && resultUsage.output_tokens > 2) {
                            usage.outputTokens = resultUsage.output_tokens;
                        }
                    }
                } catch {
                    continue;
                }
            }
        } catch (error) {
            console.error(`[LogParser] Failed to read file ${filePath}:`, error);
        }

        return usage;
    }

    private getClaudeLogDir(): string {
        return path.join(os.homedir(), '.claude', 'projects');
    }
}
