import { z } from 'zod';
import * as fs from 'fs/promises';
import { GitAnalyzer } from '../lib/git-analyzer';
import { ComplexityAnalyzer } from '../lib/complexity-analyzer';

const inputSchema = z.object({
  repo_url: z.string().url(),
  file_paths: z.array(z.string()).min(1),
  refactoring_type: z.enum(['simplify', 'extract', 'rename', 'redesign', 'rewrite']),
});

interface EstimationOutput {
  estimated_hours: number;
  estimated_cost: number;
  risk_level: 'low' | 'medium' | 'high';
  breaking_changes: boolean;
  test_coverage_required: number;
  dependencies_affected: string[];
}

export async function run(input: z.infer<typeof inputSchema>): Promise<EstimationOutput> {
  const validated = inputSchema.parse(input);

  const gitAnalyzer = await GitAnalyzer.cloneRepository(validated.repo_url);

  try {
    const complexityAnalyzer = new ComplexityAnalyzer();
    let totalComplexity = 0;
    let totalLines = 0;

    // Analyze each file
    for (const filePath of validated.file_paths) {
      try {
        const fullPath = `${gitAnalyzer.getRepoPath()}/${filePath}`;
        const content = await fs.readFile(fullPath, 'utf-8');

        const metrics = complexityAnalyzer.calculateComplexity(content, 'typescript');
        totalComplexity += metrics.cyclomaticComplexity;
        totalLines += metrics.linesOfCode;
      } catch (error) {
        continue;
      }
    }

    // Estimate hours based on refactoring type
    const baseHours = totalLines / 50; // ~50 lines per hour baseline

    const typeMultipliers = {
      simplify: 1.0,
      extract: 1.2,
      rename: 0.5,
      redesign: 2.0,
      rewrite: 3.0,
    };

    const multiplier = typeMultipliers[validated.refactoring_type];
    const estimatedHours = Math.ceil(baseHours * multiplier);

    // Determine risk level
    const riskLevel: 'low' | 'medium' | 'high' =
      totalComplexity > 50 ? 'high' :
      totalComplexity > 20 ? 'medium' :
      'low';

    // Breaking changes likely for redesign/rewrite
    const breakingChanges = ['redesign', 'rewrite'].includes(validated.refactoring_type);

    // Test coverage required
    const testCoverageRequired = breakingChanges ? 90 : riskLevel === 'high' ? 80 : 70;

    return {
      estimated_hours: estimatedHours,
      estimated_cost: estimatedHours * 100, // $100/hour default
      risk_level: riskLevel,
      breaking_changes: breakingChanges,
      test_coverage_required: testCoverageRequired,
      dependencies_affected: [], // Simplified - would analyze imports in production
    };
  } finally {
    await gitAnalyzer.cleanup();
  }
}
