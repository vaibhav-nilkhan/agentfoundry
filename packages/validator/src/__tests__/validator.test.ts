import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TaskClassifier } from '../TaskClassifier';
import { QualityChecker } from '../QualityChecker';
import * as child_process from 'child_process';
import { promisify } from 'util';

// Mock child_process
vi.mock('child_process', () => ({
    exec: vi.fn()
}));

describe('TaskClassifier', () => {
    it('should classify backend tasks correctly', () => {
        expect(TaskClassifier.classify(['src/api/routes.ts'])).toBe('backend');
        // schema.prisma is in packages/db, so it triggers hasBackend as well. Priority goes to backend.
        expect(TaskClassifier.classify(['packages/db/schema.prisma'])).toBe('backend');
    });

    it('should classify frontend tasks correctly', () => {
        expect(TaskClassifier.classify(['src/components/Button.tsx'])).toBe('frontend');
        expect(TaskClassifier.classify(['src/styles/globals.css'])).toBe('frontend');
    });

    it('should classify testing tasks', () => {
        expect(TaskClassifier.classify(['src/__tests__/Button.test.tsx'])).toBe('testing');
    });

    it('should classify fullstack tasks', () => {
        expect(TaskClassifier.classify(['src/components/Button.tsx', 'src/api/routes.ts'])).toBe('fullstack');
    });

    it('should fall back to other', () => {
        expect(TaskClassifier.classify(['random/file.xyz'])).toBe('other');
    });
});

describe('QualityChecker', () => {
    let checker: QualityChecker;

    beforeEach(() => {
        checker = new QualityChecker('/fake/path');
    });

    it('should parse testing passed/failed stats from vitest format correctly', () => {
        const stats = (checker as any).parseTestOutput('Tests  10 passed, 2 failed');
        expect(stats.passed).toBe(10);
        expect(stats.failed).toBe(2);
    });

    it('should handle test errors but still parse output', () => {
        const stats = (checker as any).parseTestOutput('Tests 4 failed, 2 passed');
        expect(stats.passed).toBe(2);
        expect(stats.failed).toBe(4);
    });

    it('should parse lint issues from eslint output', () => {
        const issues = (checker as any).parseLintOutput('✖ 12 problems (10 errors, 2 warnings)');
        expect(issues).toBe(12);
    });
});
