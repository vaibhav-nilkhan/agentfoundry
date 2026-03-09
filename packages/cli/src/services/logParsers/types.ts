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
