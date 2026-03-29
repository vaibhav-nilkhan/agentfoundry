import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BenchmarkService } from '../benchmarkService';

describe('BenchmarkService', () => {
    let service: BenchmarkService;
    let mockGit: any;
    let mockDb: any;
    let mockLogParser: any;
    let mockQQueue: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockGit = {
            takeSnapshot: vi.fn().mockResolvedValue({ filesChanged: [], linesAdded: 0, linesRemoved: 0 }),
            calculateDelta: vi.fn().mockReturnValue({ filesChanged: [], linesAdded: 0, linesRemoved: 0 }),
            resetToCleanState: vi.fn().mockResolvedValue(undefined)
        };

        mockDb = {
            agentSession: {
                create: vi.fn().mockResolvedValue({ id: 'mock-session-id' })
            }
        };

        mockLogParser = {
            parseAndSaveCost: vi.fn().mockResolvedValue({ costUsd: 0.05 })
        };

        mockQQueue = {
            enqueue: vi.fn().mockResolvedValue({
                testsPassed: 5,
                testsFailed: 0,
                lintIssues: 0,
                buildSuccess: true
            })
        };

        service = new BenchmarkService(mockDb, mockLogParser, mockGit, mockQQueue);
        
        // @ts-ignore - Mock private executeAgent to avoid actual spawning
        vi.spyOn(service, 'executeAgent').mockResolvedValue(undefined);
    });

    it('should orchestrate a benchmark run for multiple agents', async () => {
        const results = await service.runBenchmark('test prompt', ['agent1', 'agent2']);

        expect(results).toHaveLength(2);
        expect(results[0].agentName).toBe('agent1');
        expect(results[1].agentName).toBe('agent2');
        
        expect(mockGit.resetToCleanState).toHaveBeenCalledTimes(2);
        expect(mockQQueue.enqueue).toHaveBeenCalledTimes(2);
        expect(mockDb.agentSession.create).toHaveBeenCalledTimes(2);
    });
});
