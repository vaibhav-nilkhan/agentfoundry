import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface QualityValidationResult {
    testsPassed: number;
    testsFailed: number;
    lintIssues: number;
    buildSuccess: boolean;
}

export class QualityChecker {
    private projectDir: string;

    constructor(projectDir: string) {
        this.projectDir = projectDir;
    }

    /**
     * Executes the quality checks and aggregates the results.
     */
    async runChecks(): Promise<QualityValidationResult> {
        const [testStats, lintIssues, buildSuccess] = await Promise.all([
            this.runTests(),
            this.runLinter(),
            this.runBuild()
        ]);

        return {
            testsPassed: testStats.passed,
            testsFailed: testStats.failed,
            lintIssues,
            buildSuccess
        };
    }

    /**
     * Runs tests using pnpm test and parses output for passed/failed stats.
     */
    public async runTests(): Promise<{ passed: number, failed: number }> {
        try {
            // we use 'pnpm test' as per repository standards
            const { stdout, stderr } = await execAsync('npx pnpm test', { cwd: this.projectDir });
            return this.parseTestOutput(stdout + '\n' + stderr);
        } catch (error: any) {
            // Tests failed, but there is still output we can parse
            return this.parseTestOutput(error.stdout + '\n' + error.stderr);
        }
    }

    /**
     * Runs linter and tallies up warnings and errors.
     */
    public async runLinter(): Promise<number> {
        try {
            const { stdout, stderr } = await execAsync('npx pnpm lint', { cwd: this.projectDir });
            return this.parseLintOutput(stdout + '\n' + stderr);
        } catch (error: any) {
            return this.parseLintOutput(error.stdout + '\n' + error.stderr);
        }
    }

    /**
     * Runs the build command. Returns true if successful.
     */
    public async runBuild(): Promise<boolean> {
        try {
            await execAsync('npx pnpm build', { cwd: this.projectDir });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Simple parsing of vitest or jest output for pass/fail counts.
     */
    private parseTestOutput(output: string): { passed: number, failed: number } {
        if (!output) return { passed: 0, failed: 0 };

        let passed = 0;
        let failed = 0;

        // Vitest format: Tests  10 passed, 2 failed
        // Jest format: Tests: 1 failed, 1 passed, 2 total
        const vitestMatch = output.match(/Tests\s+(\d+)\s+failed.*?(\d+)\s+passed/i) ||
            output.match(/Tests\s+(\d+)\s+passed.*?(\d+)\s+failed/i);

        if (vitestMatch) {
            // depending on the order in the regex match...
            if (output.match(/(\d+)\s+passed.*?(\d+)\s+failed/i)) {
                passed = parseInt(vitestMatch[1], 10);
                failed = parseInt(vitestMatch[2], 10);
            } else {
                failed = parseInt(vitestMatch[1], 10);
                passed = parseInt(vitestMatch[2], 10);
            }
        } else {
            // Fallback for simple single occurrences 
            // example: "23 passed" "1 failed"
            const passMatch = output.match(/(\d+)\s+passed/i);
            const failMatch = output.match(/(\d+)\s+failed/i);

            if (passMatch) passed = parseInt(passMatch[1], 10);
            if (failMatch) failed = parseInt(failMatch[1], 10);
        }

        return { passed, failed };
    }

    /**
     * Simple parsing for eslint output to count problems.
     */
    private parseLintOutput(output: string): number {
        if (!output) return 0;

        // ESLint format: ✖ 12 problems (10 errors, 2 warnings)
        const match = output.match(/(\d+)\s+problems?\s+\(/i) || output.match(/✖\s+(\d+)\s+problems/i);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }

        return 0;
    }
}
