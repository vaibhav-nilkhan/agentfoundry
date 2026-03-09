export class EfficiencyCalculator {
    /**
     * Calculates Token-to-Code Yield
     * Formula: Tokens Out / Net Lines Changed (Total Diff Surface)
     * Lower is better (less text output needed per line of code changed).
     */
    static calculateTokenYield(tokensOut: number, linesAdded: number, linesRemoved: number): number {
        const totalLinesChanged = linesAdded + linesRemoved;
        
        if (totalLinesChanged === 0) {
            // If the agent wrote output but no code changed, it's thrashing maximally.
            // We return the raw token count as a penalty.
            return tokensOut; 
        }

        return Math.round((tokensOut / totalLinesChanged) * 100) / 100;
    }

    /**
     * Determines if a session was a 'Zero-Shot' success.
     * True if it passed the quality gates and had no immediately preceding failed sessions.
     */
    static calculateIsZeroShot(
        currentQuality: { testsFailed: number; buildSuccess: boolean },
        recentFailuresCount: number
    ): boolean {
        const isCurrentSuccess = currentQuality.buildSuccess && currentQuality.testsFailed === 0;
        
        return isCurrentSuccess && recentFailuresCount === 0;
    }
}
