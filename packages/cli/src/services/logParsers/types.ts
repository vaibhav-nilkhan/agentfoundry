export interface UsageBreakdown {
    model: string;
    mode?: string; // e.g., 'smart', 'deep', 'rush' for Amp
    reasoningEffort?: 'low' | 'medium' | 'high' | 'xhigh'; // For o3/o1/GPT-5 effort levels
    inputTokens: number;
    outputTokens: number;
    thinkingTokens?: number; // Granular 'thinking' or 'reasoning' tokens (e.g. Claude 3.7+)
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
}

export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    model?: string;
    breakdown?: UsageBreakdown[];
}

export interface ParsedSessionCost {
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
    model?: string;
    breakdown?: UsageBreakdown[];
}
