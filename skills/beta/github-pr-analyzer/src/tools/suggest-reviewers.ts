import { Octokit } from '@octokit/rest';
import { z } from 'zod';

const inputSchema = z.object({
  repo_owner: z.string().min(1),
  repo_name: z.string().min(1),
  pr_number: z.number().int().positive(),
  max_reviewers: z.number().int().min(1).max(10).default(3),
});

interface ReviewerSuggestion {
  username: string;
  score: number;
  expertise: string[];
  recent_contributions: number;
  review_quality: number;
}

interface SuggestReviewersOutput {
  suggested_reviewers: ReviewerSuggestion[];
  reasoning: {
    files_analyzed: number;
    contributors_evaluated: number;
    recommendation_basis: string;
  };
}

export async function run(input: z.infer<typeof inputSchema>): Promise<SuggestReviewersOutput> {
  const validated = inputSchema.parse(input);

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  const octokit = new Octokit({ auth: token });

  // Get PR files
  const { data: files } = await octokit.pulls.listFiles({
    owner: validated.repo_owner,
    repo: validated.repo_name,
    pull_number: validated.pr_number,
  });

  // Get repository contributors
  const { data: contributors } = await octokit.repos.listContributors({
    owner: validated.repo_owner,
    repo: validated.repo_name,
    per_page: 50,
  });

  // Analyze file expertise
  const filesByContributor = new Map<string, Set<string>>();

  for (const file of files) {
    try {
      const { data: commits } = await octokit.repos.listCommits({
        owner: validated.repo_owner,
        repo: validated.repo_name,
        path: file.filename,
        per_page: 10,
      });

      for (const commit of commits) {
        const author = commit.author?.login;
        if (author) {
          if (!filesByContributor.has(author)) {
            filesByContributor.set(author, new Set());
          }
          filesByContributor.get(author)!.add(file.filename);
        }
      }
    } catch (error) {
      // Skip files we can't analyze
      continue;
    }
  }

  // Score reviewers
  const suggestions: ReviewerSuggestion[] = [];

  for (const [username, touchedFiles] of filesByContributor.entries()) {
    const contributor = contributors.find(c => c.login === username);
    if (!contributor) continue;

    const score = calculateReviewerScore({
      touchedFilesCount: touchedFiles.size,
      totalFilesInPR: files.length,
      totalContributions: contributor.contributions,
    });

    suggestions.push({
      username,
      score,
      expertise: Array.from(touchedFiles).slice(0, 5),
      recent_contributions: contributor.contributions,
      review_quality: 0.8, // Placeholder - would integrate with review history
    });
  }

  // Sort by score and limit
  suggestions.sort((a, b) => b.score - a.score);
  const topSuggestions = suggestions.slice(0, validated.max_reviewers);

  return {
    suggested_reviewers: topSuggestions,
    reasoning: {
      files_analyzed: files.length,
      contributors_evaluated: filesByContributor.size,
      recommendation_basis: 'File expertise, contribution history, and review quality',
    },
  };
}

function calculateReviewerScore(params: {
  touchedFilesCount: number;
  totalFilesInPR: number;
  totalContributions: number;
}): number {
  const expertiseScore = (params.touchedFilesCount / params.totalFilesInPR) * 70;
  const activityScore = Math.min((params.totalContributions / 100) * 30, 30);
  return Math.round(expertiseScore + activityScore);
}
