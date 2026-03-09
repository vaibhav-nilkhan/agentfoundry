import { TokenUsage } from './types';

export interface BaseParser {
    parseLogs(startedAt: Date, endedAt: Date): TokenUsage | null;
}
