# GitHub PR Analyzer

Intelligent GitHub pull request analysis with security scanning, code quality scoring, and AI-powered recommendations.

## Features

- **Comprehensive PR Analysis** - Quality scoring, security scanning, code smell detection
- **Smart Reviewer Suggestions** - AI-powered recommendations based on file expertise
- **Merge Safety Checks** - Automated checks for conflicts, CI status, and approvals
- **Actionable Recommendations** - Specific, prioritized suggestions for improvement

## Installation

```bash
agentfoundry install github-pr-analyzer
```

## Prerequisites

1. GitHub account
2. GitHub Personal Access Token with `repo` access
   - Create at: https://github.com/settings/tokens

## Configuration

Set your GitHub token as an environment variable:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

## Usage

### 1. Analyze Pull Request

Get a comprehensive analysis of any pull request:

```typescript
const analysis = await analyzePR({
  repo_owner: "facebook",
  repo_name: "react",
  pr_number: 12345
});

console.log(`Score: ${analysis.score}/100`);
console.log(`Status: ${analysis.status}`);
console.log(`Security Issues: ${analysis.security_issues.length}`);
console.log(`Recommendations: ${analysis.recommendations.length}`);
```

**Output:**
```json
{
  "score": 87,
  "status": "good",
  "files_changed": 12,
  "lines_added": 234,
  "lines_deleted": 89,
  "security_issues": [
    {
      "type": "hardcoded_secret",
      "severity": "critical",
      "file": "src/config.ts",
      "description": "Potential hardcoded API key detected",
      "recommendation": "Use environment variables for sensitive data"
    }
  ],
  "code_smells": [
    {
      "type": "debug_statement",
      "severity": "minor",
      "file": "src/utils.ts",
      "description": "Debug console.log statement left in code"
    }
  ],
  "recommendations": [
    {
      "category": "security",
      "priority": "high",
      "message": "Fix 1 critical security issue before merging",
      "actionable": true
    }
  ]
}
```

### 2. Suggest Reviewers

Get AI-powered reviewer suggestions based on code expertise:

```typescript
const suggestions = await suggestReviewers({
  repo_owner: "vercel",
  repo_name: "next.js",
  pr_number: 54321,
  max_reviewers: 3
});

console.log(`Suggested reviewers:`);
suggestions.suggested_reviewers.forEach(r => {
  console.log(`- ${r.username} (score: ${r.score})`);
  console.log(`  Expertise: ${r.expertise.join(', ')}`);
});
```

### 3. Check Merge Safety

Determine if a PR is safe to merge:

```typescript
const safety = await checkMergeSafety({
  repo_owner: "microsoft",
  repo_name: "vscode",
  pr_number: 98765
});

if (safety.safe_to_merge) {
  console.log(`Safe to merge using: ${safety.merge_strategy}`);
} else {
  console.log(`Blocking issues:`);
  safety.blocking_issues.forEach(issue => {
    console.log(`- [${issue.severity}] ${issue.message}`);
  });
}
```

## Tools Reference

### `analyze_pr`

Comprehensive pull request analysis.

**Input:**
- `repo_owner` (string, required) - Repository owner
- `repo_name` (string, required) - Repository name
- `pr_number` (integer, required) - PR number
- `include_diff` (boolean, optional) - Include full diff (default: false)

**Output:**
- `score` (number) - Quality score 0-100
- `status` (string) - excellent | good | needs_improvement | poor
- `files_changed` (integer) - Number of files modified
- `lines_added` (integer) - Lines of code added
- `lines_deleted` (integer) - Lines of code removed
- `security_issues` (array) - Security vulnerabilities found
- `code_smells` (array) - Code quality issues
- `recommendations` (array) - Actionable improvement suggestions
- `metadata` (object) - PR metadata and analysis info

### `suggest_reviewers`

AI-powered reviewer suggestions based on expertise.

**Input:**
- `repo_owner` (string, required)
- `repo_name` (string, required)
- `pr_number` (integer, required)
- `max_reviewers` (integer, optional) - Max suggestions (default: 3)

**Output:**
- `suggested_reviewers` (array) - Ranked list of suggested reviewers
- `reasoning` (object) - Explanation of recommendation basis

### `check_merge_safety`

Verify if PR is safe to merge.

**Input:**
- `repo_owner` (string, required)
- `repo_name` (string, required)
- `pr_number` (integer, required)

**Output:**
- `safe_to_merge` (boolean) - Whether merging is recommended
- `blocking_issues` (array) - Critical issues preventing merge
- `warnings` (array) - Non-blocking concerns
- `merge_strategy` (string) - Recommended merge method
- `metadata` (object) - Check status details

## Security Analysis

The analyzer detects:

- **Hardcoded Secrets** - API keys, passwords, tokens
- **SQL Injection** - Unsafe query construction
- **XSS Vulnerabilities** - Unsafe DOM manipulation
- **Command Injection** - Unsafe shell command execution
- **Path Traversal** - Unsafe file path handling

## Code Quality Checks

Detects code smells including:

- Debug statements (console.log, print, etc.)
- TODO comments
- Commented code blocks
- Long lines (>120 characters)
- Large file changes (>300 lines)
- Missing documentation

## Scoring Algorithm

Score calculation:
- Start at 100 points
- -25 per critical security issue
- -10 per high security issue
- -5 per medium security issue
- -5 per major code smell
- -2 per minor code smell
- +5 bonus for including tests
- +3 bonus for documentation updates
- -5 penalty for overly large PRs (>20 files)

## Rate Limiting

Respects GitHub API rate limits:
- 5000 requests/hour for authenticated requests
- Automatic retry with exponential backoff

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev

# Lint
npm run lint
```

## Examples

See `/examples` directory for:
- Basic usage examples
- CI/CD integration
- Custom workflows
- Advanced configurations

## License

MIT

## Support

- Documentation: https://docs.agentfoundry.dev/skills/github-pr-analyzer
- Issues: https://github.com/agentfoundry/skills/issues
- Discord: https://discord.gg/agentfoundry
