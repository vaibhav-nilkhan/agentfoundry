import { describe, it, expect } from 'vitest';
import { calculateTokenCost, AGENT_PRICING } from '../pricingConfig';
import { UsageBreakdown } from '../logParsers/types';

describe('pricingConfig - Multi-Model Calculation', () => {
    it('should calculate cost based on a single model (fallback)', () => {
        // Bug this catches: Incorrect multiplier application for single-model fallback
        const cost = calculateTokenCost('claude-code', 1000000, 1000000, 'claude-4-6-sonnet-20260115');
        // Sonnet 4.6: $2.50/1M in + $12.00/1M out = $14.50
        expect(cost).toBe(14.50);
    });

    it('should calculate exact cost from a breakdown array', () => {
        // Bug this catches: Recommender ignoring specific models in a multi-model session
        const breakdown: UsageBreakdown[] = [
            {
                model: 'claude-4-6-haiku-20260115',
                inputTokens: 1000000,
                outputTokens: 0
            },
            {
                model: 'claude-4-6-sonnet-20260115',
                inputTokens: 0,
                outputTokens: 1000000
            }
        ];

        const cost = calculateTokenCost('amp', 0, 0, undefined, breakdown);
        // Haiku 4.6 In: $0.50 + Sonnet 4.6 Out: $12.00 = $12.50
        expect(cost).toBe(12.50);
    });

    it('should handle unknown models in breakdown by ignoring them', () => {
        // Bug this catches: Crash or NaN when an agent uses a model not in our pricing YAML
        const breakdown: UsageBreakdown[] = [
            {
                model: 'mystery-model-2026',
                inputTokens: 1000000,
                outputTokens: 1000000
            },
            {
                model: 'claude-4-6-haiku-20260115',
                inputTokens: 1000000,
                outputTokens: 0
            }
        ];

        const cost = calculateTokenCost('amp', 0, 0, undefined, breakdown);
        // Mystery: $0 + Haiku 4.6 In: $0.50 = $0.50
        expect(cost).toBe(0.5);
    });

    it('should round to 6 decimal places to prevent floating point drift', () => {
        // Bug this catches: Cumulative errors in total cost reporting for large sessions
        const cost = calculateTokenCost('gemini', 123, 456, 'gemini-3-1-flash');
        const expected = (123 / 1_000_000 * 0.10) + (456 / 1_000_000 * 0.40);
        expect(cost).toBe(Math.round(expected * 1_000_000) / 1_000_000);
    });
});
