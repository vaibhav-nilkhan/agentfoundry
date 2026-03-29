import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SwarmManager } from '../swarmManager';
import { GitIntegration } from '../gitIntegration';

// Mock GitIntegration
vi.mock('../gitIntegration', () => {
    return {
        GitIntegration: class {
            takeSnapshot = vi.fn();
            calculateDelta = vi.fn();
        }
    };
});

describe('SwarmManager', () => {
    let swarmManager: SwarmManager;
    let mockGit: any;

    beforeEach(() => {
        vi.clearAllMocks();
        swarmManager = new SwarmManager();
        // @ts-ignore
        mockGit = swarmManager.git;
    });

    it('should track active sessions and count correctly', async () => {
        mockGit.takeSnapshot.mockResolvedValue({ filesChanged: [], linesAdded: 0, linesRemoved: 0 });

        await swarmManager.registerStart(101, 'claude-code', new Date());
        expect(swarmManager.getActiveCount()).toBe(1);
        expect(swarmManager.isSwarmActive()).toBe(false);

        await swarmManager.registerStart(102, 'codex', new Date());
        expect(swarmManager.getActiveCount()).toBe(2);
        expect(swarmManager.isSwarmActive()).toBe(true);

        await swarmManager.registerStop(101);
        expect(swarmManager.getActiveCount()).toBe(1);
        expect(swarmManager.isSwarmActive()).toBe(false);
    });

    it('should calculate specific delta for stopping agent', async () => {
        const startSnapshot = { filesChanged: ['file1.ts'], linesAdded: 5, linesRemoved: 0 };
        const stopSnapshot = { filesChanged: ['file1.ts', 'file2.ts'], linesAdded: 15, linesRemoved: 0 };
        const expectedDelta = { filesChanged: ['file2.ts'], linesAdded: 10, linesRemoved: 0 };

        mockGit.takeSnapshot.mockResolvedValueOnce(startSnapshot); // For RegisterStart (Base)
        mockGit.takeSnapshot.mockResolvedValueOnce(startSnapshot); // For RegisterStart (Individual)
        
        await swarmManager.registerStart(101, 'claude-code', new Date());

        mockGit.takeSnapshot.mockResolvedValueOnce(stopSnapshot);
        mockGit.calculateDelta.mockReturnValue(expectedDelta);

        const result = await swarmManager.registerStop(101);

        expect(result?.delta).toEqual(expectedDelta);
        expect(result?.session.pid).toBe(101);
    });

    it('should update baseline for concurrent agents when one stops', async () => {
        mockGit.takeSnapshot.mockResolvedValue({ filesChanged: [], linesAdded: 0, linesRemoved: 0 });

        // Start Agent A and Agent B
        await swarmManager.registerStart(101, 'claude-code', new Date());
        await swarmManager.registerStart(102, 'codex', new Date());

        // Snapshot when A stops
        const stopSnapshotA = { filesChanged: ['a.ts'], linesAdded: 10, linesRemoved: 0 };
        mockGit.takeSnapshot.mockResolvedValue(stopSnapshotA);
        mockGit.calculateDelta.mockReturnValue({ filesChanged: ['a.ts'], linesAdded: 10, linesRemoved: 0 });

        // Stop Agent A
        await swarmManager.registerStop(101);

        // Verify that Agent B's startSnapshot was updated to stopSnapshotA
        // @ts-ignore
        const sessionB = swarmManager.activeSessions.get(102);
        expect(sessionB.startSnapshot).toEqual(stopSnapshotA);
    });

    it('should generate and return a swarmId for concurrent sessions', async () => {
        mockGit.takeSnapshot.mockResolvedValue({ filesChanged: [], linesAdded: 0, linesRemoved: 0 });

        // Start Agent A and Agent B
        await swarmManager.registerStart(101, 'claude-code', new Date());
        await swarmManager.registerStart(102, 'codex', new Date());

        // Stop Agent A
        const resultA = await swarmManager.registerStop(101);
        expect(resultA?.swarmId).toBeDefined();
        expect(resultA?.swarmId).toMatch(/^swarm_\d+$/);

        // Stop Agent B
        const resultB = await swarmManager.registerStop(102);
        expect(resultB?.swarmId).toBeUndefined(); // Only one left when it stopped
    });
});
