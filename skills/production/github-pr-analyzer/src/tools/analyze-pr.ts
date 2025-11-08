import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import { SecurityScanner } from '../lib/security-scanner';
import { QualityAnalyzer } from '../lib/quality-analyzer';

/**
 * Input validation schema
 */
const inputSchema = z.object({
  repo_owner: z.string().min(1, 'Repository owner is required'),
  repo_name: z.string().min(1, 'Repository name is required'),
  pr_number: z.number().int().positive('PR number must be positive'),
  include_diff: z.boolean().optional().default(false),
});

/**
 * Analysis output types
 */
interface SecurityIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  description: string;
  recommendation: string;
}

interface CodeSmell {
  type: string;
  severity: 'major' | 'minor';
  file: string;
  description: string;
}

interface Recommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  actionable: boolean;
}

interface AnalysisOutput {
  score: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  files_changed: number;
  lines_added: number;
  lines_deleted: number;
  security_issues: SecurityIssue[];
  code_smells: CodeSmell[];
  recommendations: Recommendation[];
  metadata: {
    pr_title: string;
    pr_author: string;
    pr_state: string;
    pr_created_at: string;
    pr_updated_at: string;
    analyzed_at: string;
    analysis_version: string;
  };
}

/**
 * Analyze a GitHub pull request for code quality, security, and best practices
 *
 * @param input - PR identification parameters
 * @returns Comprehensive analysis results
 */
export async function run(input: z.infer<typeof inputSchema>): Promise<AnalysisOutput> {
  try {
    // Validate input
    const validated = inputSchema.parse(input);

    // Initialize GitHub client
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

    const octokit = new Octokit({ auth: token });

    // Fetch PR details
    const { data: pr } = await octokit.pulls.get({
      owner: validated.repo_owner,
      repo: validated.repo_name,
      pull_number: validated.pr_number,
    });

    // Fetch PR files
    const { data: files } = await octokit.pulls.listFiles({
      owner: validated.repo_owner,
      repo: validated.repo_name,
      pull_number: validated.pr_number,
    });

    // Calculate basic metrics
    const filesChanged = files.length;
    const linesAdded = files.reduce((sum, file) => sum + file.additions, 0);
    const linesDeleted = files.reduce((sum, file) => sum + file.deletions, 0);

    // Run security analysis
    const securityScanner = new SecurityScanner();
    const securityIssues = await securityScanner.scan(files);

    // Run quality analysis
    const qualityAnalyzer = new QualityAnalyzer();
    const codeSmells = await qualityAnalyzer.analyze(files);

    // Generate recommendations
    const recommendations = generateRecommendations({
      filesChanged,
      linesAdded,
      linesDeleted,
      securityIssues,
      codeSmells,
      prDescription: pr.body || '',
    });

    // Calculate overall score
    const score = calculateScore({
      securityIssues,
      codeSmells,
      filesChanged,
      linesAdded,
      hasTests: files.some(f => f.filename.includes('test') || f.filename.includes('spec')),
      hasDocumentation: files.some(f => f.filename.toLowerCase().includes('readme') || f.filename.endsWith('.md')),
    });

    // Determine status
    const status = getStatus(score);

    return {
      score,
      status,
      files_changed: filesChanged,
      lines_added: linesAdded,
      lines_deleted: linesDeleted,
      security_issues: securityIssues,
      code_smells: codeSmells,
      recommendations,
      metadata: {
        pr_title: pr.title,
        pr_author: pr.user?.login || 'unknown',
        pr_state: pr.state,
        pr_created_at: pr.created_at,
        pr_updated_at: pr.updated_at,
        analyzed_at: new Date().toISOString(),
        analysis_version: '1.0.0',
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`);
    }

    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as any).status;
      if (status === 404) {
        throw new Error('Pull request not found. Check owner, repo, and PR number.');
      }
      if (status === 401) {
        throw new Error('Invalid GitHub token. Please check GITHUB_TOKEN environment variable.');
      }
    }

    throw error;
  }
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(params: {
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  securityIssues: SecurityIssue[];
  codeSmells: CodeSmell[];
  prDescription: string;
}): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Security recommendations
  if (params.securityIssues.length > 0) {
    const criticalCount = params.securityIssues.filter(i => i.severity === 'critical').length;
    if (criticalCount > 0) {
      recommendations.push({
        category: 'security',
        priority: 'high',
        message: `Fix ${criticalCount} critical security ${criticalCount === 1 ? 'issue' : 'issues'} before merging`,
        actionable: true,
      });
    }
  }

  // Size recommendations
  if (params.filesChanged > 20) {
    recommendations.push({
      category: 'size',
      priority: 'medium',
      message: 'Consider breaking this PR into smaller, focused changes',
      actionable: true,
    });
  }

  if (params.linesAdded > 500) {
    recommendations.push({
      category: 'size',
      priority: 'medium',
      message: 'Large PR detected. Ensure adequate test coverage and documentation',
      actionable: true,
    });
  }

  // Description quality
  if (!params.prDescription || params.prDescription.length < 50) {
    recommendations.push({
      category: 'documentation',
      priority: 'low',
      message: 'Add a detailed PR description explaining the changes',
      actionable: true,
    });
  }

  return recommendations;
}

/**
 * Calculate overall quality score (0-100)
 */
function calculateScore(params: {
  securityIssues: SecurityIssue[];
  codeSmells: CodeSmell[];
  filesChanged: number;
  linesAdded: number;
  hasTests: boolean;
  hasDocumentation: boolean;
}): number {
  let score = 100;

  // Deduct for security issues
  const criticalIssues = params.securityIssues.filter(i => i.severity === 'critical').length;
  const highIssues = params.securityIssues.filter(i => i.severity === 'high').length;
  const mediumIssues = params.securityIssues.filter(i => i.severity === 'medium').length;

  score -= criticalIssues * 25;
  score -= highIssues * 10;
  score -= mediumIssues * 5;

  // Deduct for code smells
  score -= params.codeSmells.filter(s => s.severity === 'major').length * 5;
  score -= params.codeSmells.filter(s => s.severity === 'minor').length * 2;

  // Bonus for tests
  if (params.hasTests) {
    score += 5;
  }

  // Bonus for documentation
  if (params.hasDocumentation) {
    score += 3;
  }

  // Penalize overly large PRs
  if (params.filesChanged > 20) {
    score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Determine status from score
 */
function getStatus(score: number): 'excellent' | 'good' | 'needs_improvement' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'needs_improvement';
  return 'poor';
}
