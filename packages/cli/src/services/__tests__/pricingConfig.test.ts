import { describe, it, expect } from 'vitest';
import { calculateTokenCost, AGENT_PRICING } from '../pricingConfig';

describe('pricingConfig', () => {
    describe('AGENT_PRICING', () => {
        it('should have pricing for claude-code, codex, and gemini', () => {
            expect(AGENT_PRICING['claude-code']).toBeDefined();
            expect(AGENT_PRICING['codex']).toBeDefined();
            expect(AGENT_PRICING['gemini']).toBeDefined();
        });

        it('should have default models for each agent', () => {
            expect(AGENT_PRICING['claude-code'].defaultModel).toBe('claude-sonnet-4-20250514');
            expect(AGENT_PRICING['codex'].defaultModel).toBe('codex-mini-latest');
            expect(AGENT_PRICING['gemini'].defaultModel).toBe('gemini-2.5-pro');
        });
    });

    describe('calculateTokenCost', () => {
        it('should calculate cost for claude-code with default model', () => {
            // Claude Sonnet 4: $3/M input, $15/M output
            // 1000 input tokens = $0.003, 500 output tokens = $0.0075
            const cost = calculateTokenCost('claude-code', 1000, 500);
            expect(cost).toBeCloseTo(0.0105, 4);
        });

        it('should calculate cost for a specific model', () => {
            // Claude Opus 4: $15/M input, $75/M output
            const cost = calculateTokenCost('claude-code', 1000, 500, 'claude-opus-4-20250514');
            expect(cost).toBeCloseTo(0.0525, 4);
        });

        it('should return 0 for unknown agent', () => {
            const cost = calculateTokenCost('unknown-agent', 1000, 500);
            expect(cost).toBe(0);
        });

        it('should return 0 for unknown model', () => {
            const cost = calculateTokenCost('claude-code', 1000, 500, 'nonexistent-model');
            expect(cost).toBe(0);
        });

        it('should handle zero tokens', () => {
            const cost = calculateTokenCost('claude-code', 0, 0);
            expect(cost).toBe(0);
        });

        it('should handle large token counts accurately', () => {
            // 1M input + 1M output on Claude Sonnet 4
            const cost = calculateTokenCost('claude-code', 1_000_000, 1_000_000);
            expect(cost).toBeCloseTo(18.0, 2); // $3 + $15
        });
    });
});
