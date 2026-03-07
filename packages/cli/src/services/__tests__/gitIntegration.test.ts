import { describe, it, expect, vi } from 'vitest';
import { GitIntegration } from '../gitIntegration';

vi.mock('simple-git', () => {
    return {
        default: vi.fn().mockImplementation(() => {
            return {
                status: vi.fn().mockResolvedValue({
                    modified: ['src/index.ts', 'src/utils.ts'],
                    not_added: ['new-file.txt'],
                    created: [],
                    deleted: ['old-file.ts']
                }),
                diffSummary: vi.fn().mockResolvedValue({
                    insertions: 50,
                    deletions: 12,
                    files: 3
                })
            };
        })
    };
});

describe('GitIntegration', () => {
    it('should correctly capture a non-destructive snapshot of the git tree', async () => {
        const gitOptions = { baseDir: '/test/dir' };
        const tracker = new GitIntegration(gitOptions.baseDir);

        const snapshot = await tracker.takeSnapshot();

        expect(snapshot.filesChanged).toContain('src/index.ts');
        expect(snapshot.filesChanged).toContain('src/utils.ts');
        expect(snapshot.filesChanged).toContain('new-file.txt');
        expect(snapshot.filesChanged).toContain('old-file.ts');

        // De-duplication check: lengths should match
        expect(snapshot.filesChanged).toHaveLength(4);

        expect(snapshot.linesAdded).toBe(50);
        expect(snapshot.linesRemoved).toBe(12);
    });

    it('should calculate accurate deltas between pre and post run snapshots', () => {
        const tracker = new GitIntegration();

        const preRun = {
            filesChanged: ['src/index.ts'],
            linesAdded: 10,
            linesRemoved: 5
        };

        const postRun = {
            filesChanged: ['src/index.ts', 'src/new_feature.ts'],
            linesAdded: 100, // +90 lines during agent execution
            linesRemoved: 15 // +10 removed lines
        };

        const delta = tracker.calculateDelta(preRun, postRun);

        expect(delta.filesChanged).toEqual(['src/new_feature.ts']);
        expect(delta.linesAdded).toBe(90);
        expect(delta.linesRemoved).toBe(10);
    });
});
