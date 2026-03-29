import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QualityQueue } from '../qualityQueue';

// Mock QualityChecker
const mockRunChecks = vi.fn().mockResolvedValue({
    testsPassed: 10,
    testsFailed: 0,
    lintIssues: 0,
    buildSuccess: true
});

vi.mock('@agentfoundry/validator', () => {
    return {
        QualityChecker: class {
            runChecks = mockRunChecks;
        }
    };
});

describe('QualityQueue', () => {
    let queue: QualityQueue;

    beforeEach(() => {
        vi.clearAllMocks();
        queue = new QualityQueue();
    });

    it('should process quality checks and return results', async () => {
        const results = await queue.enqueue('/test/dir');
        expect(results.testsPassed).toBe(10);
        expect(mockRunChecks).toHaveBeenCalled();
    });

    it('should process multiple requests', async () => {
        const p1 = queue.enqueue('/test/dir');
        const p2 = queue.enqueue('/test/dir');
        
        const [r1, r2] = await Promise.all([p1, p2]);
        expect(r1.testsPassed).toBe(10);
        expect(r2.testsPassed).toBe(10);
        expect(mockRunChecks).toHaveBeenCalledTimes(2);
    });
});
