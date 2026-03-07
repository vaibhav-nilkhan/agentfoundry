import simpleGit, { SimpleGit } from 'simple-git';

export interface GitSnapshotData {
    filesChanged: string[];
    linesAdded: number;
    linesRemoved: number;
}

export class GitIntegration {
    private git: SimpleGit;

    constructor(workspacePath: string = process.cwd()) {
        this.git = simpleGit(workspacePath);
    }

    /**
     * Safely records a snapshot of the current git status without modifying anything.
     */
    public async takeSnapshot(): Promise<GitSnapshotData> {
        try {
            // Get the currently modified tracked files and untracked files
            const status = await this.git.status();
            const filesChanged = [
                ...status.modified,
                ...status.not_added,
                ...status.created,
                ...status.deleted
            ];

            // Dedup file list
            const uniqueFiles = Array.from(new Set(filesChanged));

            // Get shortstat for line diffs conceptually (since last commit, or we can just track absolute state)
            // For now, simple diff of working tree vs HEAD
            const diffSummary = await this.git.diffSummary(['HEAD']);

            return {
                filesChanged: uniqueFiles,
                linesAdded: diffSummary.insertions,
                linesRemoved: diffSummary.deletions
            };
        } catch (error) {
            console.error('[GitIntegration] Failed to take snapshot:', error);
            return { filesChanged: [], linesAdded: 0, linesRemoved: 0 };
        }
    }

    /**
     * Calculates the delta between two snapshots.
     */
    public calculateDelta(preRun: GitSnapshotData, postRun: GitSnapshotData): GitSnapshotData {
        // Determine new files that were changed during the session
        const preSet = new Set(preRun.filesChanged);
        const sessionFiles = postRun.filesChanged.filter(f => !preSet.has(f));

        // Calculate lines delta (this is an approximation; a true session delta would require generating a patch)
        // For V2 MVP, this relative delta between absolute diffs is sufficient.
        const addedDelta = Math.max(0, postRun.linesAdded - preRun.linesAdded);
        const removedDelta = Math.max(0, postRun.linesRemoved - preRun.linesRemoved);

        return {
            filesChanged: sessionFiles,
            linesAdded: addedDelta,
            linesRemoved: removedDelta
        };
    }
}
