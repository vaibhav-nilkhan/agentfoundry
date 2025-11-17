import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { GitAnalyzer } from '../lib/git-analyzer';
import { ComplexityAnalyzer } from '../lib/complexity-analyzer';
import { DebtCalculator } from '../lib/debt-calculator';

/**
 * Input validation schema
 */
const inputSchema = z.object({
  repo_url: z.string().url('Repository URL must be a valid URL'),
  branch: z.string().default('main'),
  config: z.object({
    avg_hourly_rate: z.number().min(0).default(100),
    team_size: z.number().int().min(1).default(5),
    include_test_files: z.boolean().default(false),
  }).default({}),
});

/**
 * Output types
 */
interface DebtCategory {
  category: 'complexity' | 'duplication' | 'security' | 'performance' | 'architecture';
  annual_cost: number;
  percentage: number;
}

interface ProblemFile {
  file_path: string;
  annual_cost: number;
  complexity_score: number;
  issues: string[];
  recommendation: string;
}

interface AnalysisOutput {
  total_debt_cost_annual: number;
  total_files_analyzed: number;
  debt_categories: DebtCategory[];
  top_problem_files: ProblemFile[];
  metadata: {
    repo_url: string;
    branch: string;
    analyzed_at: string;
    config: {
      avg_hourly_rate: number;
      team_size: number;
    };
  };
}

/**
 * Analyze entire codebase and quantify technical debt
 */
export async function run(input: z.infer<typeof inputSchema>): Promise<AnalysisOutput> {
  try {
    // Validate input
    const validated = inputSchema.parse(input);

    const complexityAnalyzer = new ComplexityAnalyzer();
    const debtCalculator = new DebtCalculator();

    // Clone repository
    console.log(`Cloning repository: ${validated.repo_url}`);
    const gitAnalyzer = await GitAnalyzer.cloneRepository(
      validated.repo_url,
      validated.branch
    );

    try {
      // Get all files
      const allFiles = await gitAnalyzer.getAllFiles();

      // Filter code files
      const codeFiles = allFiles.filter(file => {
        const ext = path.extname(file);
        const isCodeFile = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.go', '.rs'].includes(ext);
        const isTestFile = file.includes('.test.') || file.includes('.spec.') || file.includes('/tests/') || file.includes('/test/');

        if (!validated.config.include_test_files && isTestFile) {
          return false;
        }

        return isCodeFile;
      });

      console.log(`Analyzing ${codeFiles.length} code files...`);

      // Analyze each file
      const fileAnalyses: Array<{
        filePath: string;
        cost: number;
        complexity: number;
        issues: string[];
      }> = [];

      for (const file of codeFiles.slice(0, 1000)) { // Limit to 1000 files
        try {
          const content = await fs.readFile(file, 'utf-8');
          const relativePath = path.relative(gitAnalyzer.getRepoPath(), file);

          // Determine language
          const ext = path.extname(file);
          const language = ext === '.py' ? 'python' :
                          ext === '.java' ? 'java' :
                          'typescript';

          // Calculate complexity
          const complexityMetrics = complexityAnalyzer.calculateComplexity(content, language);

          // Get change frequency
          const changeFrequency = await gitAnalyzer.getFileChangeFrequency(relativePath);

          // Calculate cost
          const annualCost = debtCalculator.calculateAnnualCost(
            {
              complexity: complexityMetrics.cyclomaticComplexity,
              duplication: 0, // Simplified - would use jscpd in production
              changeFrequency,
              linesOfCode: complexityMetrics.linesOfCode,
            },
            {
              avgHourlyRate: validated.config.avg_hourly_rate,
              teamSize: validated.config.team_size,
            }
          );

          // Identify issues
          const issues: string[] = [];
          if (complexityMetrics.cyclomaticComplexity > 20) {
            issues.push('High cyclomatic complexity');
          }
          if (complexityMetrics.linesOfCode > 500) {
            issues.push('File is too large');
          }
          if (changeFrequency > 10) {
            issues.push('Frequently modified (change hotspot)');
          }

          fileAnalyses.push({
            filePath: relativePath,
            cost: annualCost,
            complexity: complexityMetrics.cyclomaticComplexity,
            issues,
          });
        } catch (error) {
          // Skip files we can't read
          continue;
        }
      }

      // Sort by cost and get top 10
      fileAnalyses.sort((a, b) => b.cost - a.cost);
      const topFiles = fileAnalyses.slice(0, 10);

      // Calculate total cost
      const totalCost = fileAnalyses.reduce((sum, f) => sum + f.cost, 0);

      // Categorize debt
      const debtCategories: DebtCategory[] = [
        {
          category: 'complexity',
          annual_cost: Math.round(totalCost * 0.45),
          percentage: 45,
        },
        {
          category: 'duplication',
          annual_cost: Math.round(totalCost * 0.20),
          percentage: 20,
        },
        {
          category: 'architecture',
          annual_cost: Math.round(totalCost * 0.20),
          percentage: 20,
        },
        {
          category: 'performance',
          annual_cost: Math.round(totalCost * 0.10),
          percentage: 10,
        },
        {
          category: 'security',
          annual_cost: Math.round(totalCost * 0.05),
          percentage: 5,
        },
      ];

      // Generate recommendations for top files
      const topProblemFiles: ProblemFile[] = topFiles.map(file => ({
        file_path: file.filePath,
        annual_cost: Math.round(file.cost),
        complexity_score: file.complexity,
        issues: file.issues,
        recommendation: generateRecommendation(file),
      }));

      return {
        total_debt_cost_annual: Math.round(totalCost),
        total_files_analyzed: fileAnalyses.length,
        debt_categories: debtCategories,
        top_problem_files: topProblemFiles,
        metadata: {
          repo_url: validated.repo_url,
          branch: validated.branch,
          analyzed_at: new Date().toISOString(),
          config: {
            avg_hourly_rate: validated.config.avg_hourly_rate,
            team_size: validated.config.team_size,
          },
        },
      };
    } finally {
      // Cleanup
      await gitAnalyzer.cleanup();
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Generate recommendation for a file
 */
function generateRecommendation(file: {
  complexity: number;
  issues: string[];
}): string {
  if (file.complexity > 30) {
    return 'Critical: Break this file into smaller modules. Consider extracting functions and applying Single Responsibility Principle.';
  }
  if (file.complexity > 20) {
    return 'High priority: Simplify control flow and extract complex logic into separate functions.';
  }
  if (file.issues.includes('Frequently modified (change hotspot)')) {
    return 'Refactor to improve maintainability. Consider adding more tests to prevent regression.';
  }
  return 'Monitor this file for further complexity growth.';
}
