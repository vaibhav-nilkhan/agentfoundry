import { Octokit } from '@octokit/rest';
import { z } from 'zod';

const inputSchema = z.object({
  repo_owner: z.string().min(1),
  repo_name: z.string().min(1),
  pr_number: z.number().int().positive(),
});

interface BlockingIssue {
  type: string;
  severity: 'critical' | 'major' | 'minor';
  message: string;
}

interface Warning {
  type: string;
  message: string;
}

interface MergeSafetyOutput {
  safe_to_merge: boolean;
  blocking_issues: BlockingIssue[];
  warnings: Warning[];
  merge_strategy: 'squash' | 'merge' | 'rebase';
  metadata: {
    checks_passed: number;
    checks_failed: number;
    has_conflicts: boolean;
    approvals_count: number;
    required_approvals: number;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<MergeSafetyOutput> {
  const validated = inputSchema.parse(input);

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  const octokit = new Octokit({ auth: token });

  // Get PR details
  const { data: pr } = await octokit.pulls.get({
    owner: validated.repo_owner,
    repo: validated.repo_name,
    pull_number: validated.pr_number,
  });

  // Get PR reviews
  const { data: reviews } = await octokit.pulls.listReviews({
    owner: validated.repo_owner,
    repo: validated.repo_name,
    pull_number: validated.pr_number,
  });

  // Get check runs
  let checksPassed = 0;
  let checksFailed = 0;

  try {
    const { data: checkRuns } = await octokit.checks.listForRef({
      owner: validated.repo_owner,
      repo: validated.repo_name,
      ref: pr.head.sha,
    });

    checksPassed = checkRuns.check_runs.filter(c => c.conclusion === 'success').length;
    checksFailed = checkRuns.check_runs.filter(c => c.conclusion === 'failure').length;
  } catch (error) {
    // Checks API might not be available
  }

  // Analyze blocking issues
  const blockingIssues: BlockingIssue[] = [];
  const warnings: Warning[] = [];

  // Check for merge conflicts
  if (pr.mergeable === false) {
    blockingIssues.push({
      type: 'merge_conflict',
      severity: 'critical',
      message: 'PR has merge conflicts that must be resolved',
    });
  }

  // Check for failed checks
  if (checksFailed > 0) {
    blockingIssues.push({
      type: 'failed_checks',
      severity: 'major',
      message: `${checksFailed} CI/CD check(s) failed`,
    });
  }

  // Check for approvals
  const approvals = reviews.filter(r => r.state === 'APPROVED').length;
  const changesRequested = reviews.filter(r => r.state === 'CHANGES_REQUESTED').length;

  if (changesRequested > 0) {
    blockingIssues.push({
      type: 'changes_requested',
      severity: 'major',
      message: `${changesRequested} reviewer(s) requested changes`,
    });
  }

  if (approvals === 0) {
    warnings.push({
      type: 'no_approvals',
      message: 'PR has no approvals yet',
    });
  }

  // Check PR state
  if (pr.draft) {
    blockingIssues.push({
      type: 'draft_pr',
      severity: 'major',
      message: 'PR is marked as draft',
    });
  }

  // Determine merge strategy
  let mergeStrategy: 'squash' | 'merge' | 'rebase' = 'squash';

  if (pr.commits === 1) {
    mergeStrategy = 'squash';
  } else if (pr.commits > 10) {
    mergeStrategy = 'squash';
    warnings.push({
      type: 'many_commits',
      message: `PR has ${pr.commits} commits - consider squashing`,
    });
  } else if (pr.commits > 1 && pr.commits <= 10) {
    mergeStrategy = 'merge';
  }

  // Determine if safe to merge
  const safeToMerge = blockingIssues.length === 0;

  return {
    safe_to_merge: safeToMerge,
    blocking_issues: blockingIssues,
    warnings,
    merge_strategy: mergeStrategy,
    metadata: {
      checks_passed: checksPassed,
      checks_failed: checksFailed,
      has_conflicts: pr.mergeable === false,
      approvals_count: approvals,
      required_approvals: 1, // Default - could be fetched from branch protection
    },
  };
}
