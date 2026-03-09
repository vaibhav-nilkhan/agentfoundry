import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BaseParser } from './BaseParser';
import { TokenUsage } from './types';
import { findRecentLogFiles } from './utils';

export class GeminiParser implements BaseParser {
    public parseLogs(startedAt: Date, endedAt: Date): TokenUsage | null {
        const usage: TokenUsage = {
            inputTokens: 0,
            outputTokens: 0,
            cacheCreationTokens: 0,
            cacheReadTokens: 0,
            model: undefined
        };

        const telemetryFile = this.getGeminiTelemetryFile();
        if (telemetryFile && fs.existsSync(telemetryFile)) {
            const fileUsage = this.parseGeminiTelemetryFile(telemetryFile, startedAt, endedAt);
            usage.inputTokens += fileUsage.inputTokens;
            usage.outputTokens += fileUsage.outputTokens;
            if (fileUsage.model) {
                usage.model = fileUsage.model;
            }
        }

        const otelDir = path.join(os.homedir(), '.gemini', 'tmp');
        if (fs.existsSync(otelDir)) {
            const collectorLogs = findRecentLogFiles(otelDir, startedAt)
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

                    if (entry.input_tokens || entry.inputTokenCount) {
                        usage.inputTokens += entry.input_tokens || entry.inputTokenCount || 0;
                        usage.outputTokens += entry.output_tokens || entry.outputTokenCount || 0;
                    }

                    if (entry.attributes) {
                        usage.inputTokens += entry.attributes.input_token_count || entry.attributes.input_tokens || 0;
                        usage.outputTokens += entry.attributes.output_token_count || entry.attributes.output_tokens || 0;
                    }

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

    private getGeminiTelemetryFile(): string | null {
        if (process.env.GEMINI_TELEMETRY_OUTFILE) {
            return process.env.GEMINI_TELEMETRY_OUTFILE;
        }

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
}
