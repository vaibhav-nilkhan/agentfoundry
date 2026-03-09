import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BaseParser } from './BaseParser';
import { TokenUsage } from './types';
import { findRecentLogFiles } from './utils';

export class CodexParser implements BaseParser {
    public parseLogs(startedAt: Date, endedAt: Date): TokenUsage | null {
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

        const logFiles = findRecentLogFiles(codexDir, startedAt);
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

    private getCodexLogDir(): string {
        const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
        return path.join(codexHome, 'sessions');
    }
}
