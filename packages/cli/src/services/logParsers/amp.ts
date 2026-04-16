import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BaseParser } from './BaseParser';
import { TokenUsage, UsageBreakdown } from './types';

export class AmpParser implements BaseParser {
    /**
     * Amp Code stores full session history in ~/.local/share/amp/threads/*.json
     * Each message in the thread has a 'usage' object with model and token counts.
     */
    public parseLogs(startedAt: Date, endedAt: Date): TokenUsage | null {
        const threadDir = path.join(os.homedir(), '.local/share/amp/threads');
        if (!fs.existsSync(threadDir)) return null;

        const files = fs.readdirSync(threadDir).filter(f => f.endsWith('.json'));
        const usage: TokenUsage = {
            inputTokens: 0,
            outputTokens: 0,
            cacheCreationTokens: 0,
            cacheReadTokens: 0,
            breakdown: []
        };

        const breakdownMap: Record<string, UsageBreakdown> = {};

        for (const file of files) {
            const filePath = path.join(threadDir, file);
            const stats = fs.statSync(filePath);

            // Only parse threads modified during this session
            if (stats.mtime >= startedAt) {
                try {
                    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    if (!content.messages) continue;

                    for (const msg of content.messages) {
                        const u = msg.usage;
                        if (!u || !u.model) continue;

                        const modelKey = u.model;
                        if (!breakdownMap[modelKey]) {
                            breakdownMap[modelKey] = {
                                model: modelKey,
                                inputTokens: 0,
                                outputTokens: 0,
                                cacheCreationTokens: 0,
                                cacheReadTokens: 0,
                                thinkingTokens: 0,
                                reasoningEffort: 'low'
                            };
                        }

                        const b = breakdownMap[modelKey];
                        b.inputTokens += (u.inputTokens || 0);
                        b.outputTokens += (u.outputTokens || 0);
                        b.cacheCreationTokens! += (u.cacheCreationInputTokens || 0);
                        b.cacheReadTokens! += (u.cacheReadInputTokens || 0);
                        b.thinkingTokens! += (u.thinkingTokens || 0);

                        // Detect reasoning effort from thinking budget or metadata
                        if (u.thinkingBudget > 10000 || content.agentMode === 'deep') {
                            b.reasoningEffort = 'high';
                        } else if (u.thinkingBudget > 2000) {
                            b.reasoningEffort = 'medium';
                        }

                        usage.inputTokens += (u.inputTokens || 0);
                        usage.outputTokens += (u.outputTokens || 0);
                        usage.cacheCreationTokens += (u.cacheCreationInputTokens || 0);
                        usage.cacheReadTokens += (u.cacheReadInputTokens || 0);
                    }
                } catch (e) {
                    // Skip malformed JSON
                }
            }
        }

        usage.breakdown = Object.values(breakdownMap);
        return usage.inputTokens > 0 ? usage : null;
    }
}
