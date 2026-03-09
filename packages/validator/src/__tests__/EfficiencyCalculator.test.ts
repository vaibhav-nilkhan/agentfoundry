import { describe, it, expect } from 'vitest';
import { EfficiencyCalculator } from '../EfficiencyCalculator';

describe('EfficiencyCalculator', () => {
    describe('calculateTokenYield', () => {
        it('should calculate tokens out divided by total lines changed', () => {
            const yieldScore = EfficiencyCalculator.calculateTokenYield(1000, 10, 10);
            expect(yieldScore).toBe(50); // 1000 / 20 = 50
        });

        it('should round to two decimal places', () => {
            const yieldScore = EfficiencyCalculator.calculateTokenYield(1000, 15, 0);
            expect(yieldScore).toBe(66.67); // 1000 / 15 = 66.666... -> 66.67
        });

        it('should return raw tokensOut if no lines changed (max penalty)', () => {
            const yieldScore = EfficiencyCalculator.calculateTokenYield(500, 0, 0);
            expect(yieldScore).toBe(500); 
        });
    });

    describe('calculateIsZeroShot', () => {
        it('should return true if no recent failures and tests passed/build succeeded', () => {
            const quality = { testsFailed: 0, buildSuccess: true };
            const isZeroShot = EfficiencyCalculator.calculateIsZeroShot(quality, 0);
            expect(isZeroShot).toBe(true);
        });

        it('should return false if recent failures exist even if tests currently passed', () => {
            const quality = { testsFailed: 0, buildSuccess: true };
            const isZeroShot = EfficiencyCalculator.calculateIsZeroShot(quality, 1);
            expect(isZeroShot).toBe(false);
        });

        it('should return false if build failed', () => {
            const quality = { testsFailed: 0, buildSuccess: false };
            const isZeroShot = EfficiencyCalculator.calculateIsZeroShot(quality, 0);
            expect(isZeroShot).toBe(false);
        });

        it('should return false if tests failed', () => {
            const quality = { testsFailed: 1, buildSuccess: true };
            const isZeroShot = EfficiencyCalculator.calculateIsZeroShot(quality, 0);
            expect(isZeroShot).toBe(false);
        });
    });
});
