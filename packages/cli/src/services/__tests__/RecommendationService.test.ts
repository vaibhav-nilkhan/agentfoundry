import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecommendationService } from '../RecommendationService';

// Mock Prisma
const mockPrisma = {
    agentSession: {
        findMany: vi.fn(),
    }
} as any;

describe('RecommendationService', () => {
    let service: RecommendationService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new RecommendationService(mockPrisma);
    });

    it('should return empty array if no sessions exist', async () => {
        mockPrisma.agentSession.findMany.mockResolvedValue([]);
        
        const recommendations = await service.getRecommendations();
        
        expect(recommendations).toEqual([]);
    });

    it('should calculate weighted scores and sort by descending score', async () => {
        const mockSessions = [
            {
                agentName: 'claude-code',
                taskType: 'frontend',
                quality: { testsPassed: 9, testsFailed: 1, tokenYield: 1.2 },
                cost: { costUsd: 0.05 }
            },
            {
                agentName: 'gemini',
                taskType: 'frontend',
                quality: { testsPassed: 5, testsFailed: 5, tokenYield: 3.5 },
                cost: { costUsd: 0.01 }
            }
        ];

        mockPrisma.agentSession.findMany.mockResolvedValue(mockSessions);

        const recommendations = await service.getRecommendations('frontend');

        expect(recommendations.length).toBe(2);
        expect(recommendations[0].agentName).toBe('claude-code'); // Better pass rate and yield
        expect(recommendations[0].score).toBeGreaterThan(recommendations[1].score);
        expect(recommendations[0].confidence).toBe('low'); // Only 1 session
    });

    it('should assign high confidence for 10+ sessions', async () => {
        const mockSessions = Array(10).fill({
            agentName: 'claude-code',
            taskType: 'backend',
            quality: { testsPassed: 1, testsFailed: 0, tokenYield: 1.0 },
            cost: { costUsd: 0.02 }
        });

        mockPrisma.agentSession.findMany.mockResolvedValue(mockSessions);

        const recommendations = await service.getRecommendations('backend');

        expect(recommendations[0].confidence).toBe('high');
    });
});
