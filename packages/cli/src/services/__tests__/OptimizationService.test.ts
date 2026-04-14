import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import { OptimizationService } from '../OptimizationService';

vi.mock('fs');

const mockPrisma = {
    agentSession: {
        findMany: vi.fn()
    }
} as any;

describe('OptimizationService', () => {
    let service: OptimizationService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new OptimizationService(mockPrisma);
        
        (fs.existsSync as any).mockReturnValue(false);
        (fs.readFileSync as any).mockReturnValue('');
        (fs.mkdirSync as any).mockImplementation(() => {});
        (fs.writeFileSync as any).mockImplementation(() => {});
    });

    it('should generate no rules if no bad metrics exist', async () => {
        mockPrisma.agentSession.findMany.mockResolvedValue([]);
        const rules = await service.applyOptimizations('/test/workspace');
        expect(rules).toEqual([]);
        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should generate rules for high token yield (thrashing)', async () => {
        const mockSessions = [
            { agentName: 'claude-code', taskType: 'frontend', quality: { tokenYield: 2.5, isZeroShot: true } },
            { agentName: 'claude-code', taskType: 'frontend', quality: { tokenYield: 2.0, isZeroShot: true } },
            { agentName: 'claude-code', taskType: 'frontend', quality: { tokenYield: 1.8, isZeroShot: true } },
        ];
        
        mockPrisma.agentSession.findMany.mockImplementation(({ where }: any) => {
            if (where.createdAt.gte) {
                return Promise.resolve(mockSessions);
            }
            return Promise.resolve([]);
        });

        const rules = await service.applyOptimizations('/test/workspace');
        expect(rules.length).toBeGreaterThan(0);
        expect(rules[0]).toContain('High token yield (2.10) indicates thrashing');
        expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should detect agent degradation (token inflation)', async () => {
        const recentSessions = [
            { agentName: 'claude-code', taskType: 'frontend', quality: { tokenYield: 3.0, isZeroShot: true } },
            { agentName: 'claude-code', taskType: 'frontend', quality: { tokenYield: 3.0, isZeroShot: true } },
            { agentName: 'claude-code', taskType: 'frontend', quality: { tokenYield: 3.0, isZeroShot: true } }
        ];

        const historicalSessions = [
            { agentName: 'claude-code', taskType: 'frontend', quality: { tokenYield: 1.0, isZeroShot: true } },
            { agentName: 'claude-code', taskType: 'frontend', quality: { tokenYield: 1.0, isZeroShot: true } },
            { agentName: 'claude-code', taskType: 'frontend', quality: { tokenYield: 1.0, isZeroShot: true } }
        ];

        mockPrisma.agentSession.findMany.mockImplementation(({ where }: any) => {
            if (where.createdAt.gte) {
                return Promise.resolve(recentSessions);
            }
            return Promise.resolve(historicalSessions);
        });

        const rules = await service.applyOptimizations('/test/workspace');
        expect(rules.some(r => r.includes('Degradation Detected'))).toBe(true);
        expect(rules.some(r => r.includes('spike in token usage (thrashing)'))).toBe(true);
    });
});
