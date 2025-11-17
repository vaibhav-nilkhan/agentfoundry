# Basic Usage Examples

## Example 1: Analyze a Public Repository PR

```typescript
import { analyzePR } from '@agentfoundry-skills/github-pr-analyzer';

// Analyze a PR from React repository
const analysis = await analyzePR({
  repo_owner: 'facebook',
  repo_name: 'react',
  pr_number: 12345
});

console.log(`Quality Score: ${analysis.score}/100`);
console.log(`Status: ${analysis.status}`);

// Check for security issues
if (analysis.security_issues.length > 0) {
  console.log('\n🚨 Security Issues Found:');
  analysis.security_issues.forEach(issue => {
    console.log(`  [${issue.severity}] ${issue.description}`);
    console.log(`  File: ${issue.file}`);
    console.log(`  Fix: ${issue.recommendation}\n`);
  });
}

// Review recommendations
if (analysis.recommendations.length > 0) {
  console.log('\n💡 Recommendations:');
  analysis.recommendations.forEach(rec => {
    console.log(`  [${rec.priority}] ${rec.message}`);
  });
}
```

## Example 2: CI/CD Integration

```yaml
# .github/workflows/pr-analysis.yml
name: PR Analysis

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install AgentFoundry CLI
        run: npm install -g @agentfoundry/cli

      - name: Analyze PR
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          agentforge run github-pr-analyzer analyze_pr \
            --repo_owner ${{ github.repository_owner }} \
            --repo_name ${{ github.event.repository.name }} \
            --pr_number ${{ github.event.pull_request.number }}
```

## Example 3: Auto-Assign Reviewers

```typescript
import { suggestReviewers } from '@agentfoundry-skills/github-pr-analyzer';

// Get reviewer suggestions
const suggestions = await suggestReviewers({
  repo_owner: 'myorg',
  repo_name: 'myrepo',
  pr_number: 42,
  max_reviewers: 2
});

// Auto-assign via GitHub API
for (const reviewer of suggestions.suggested_reviewers) {
  console.log(`Assigning: ${reviewer.username}`);
  console.log(`  Expertise: ${reviewer.expertise.join(', ')}`);
  console.log(`  Score: ${reviewer.score}/100\n`);
}
```

## Example 4: Pre-Merge Safety Check

```typescript
import { checkMergeSafety } from '@agentfoundry-skills/github-pr-analyzer';

const safety = await checkMergeSafety({
  repo_owner: 'myorg',
  repo_name: 'myrepo',
  pr_number: 42
});

if (!safety.safe_to_merge) {
  console.error('❌ NOT SAFE TO MERGE');
  console.error('\nBlocking Issues:');
  safety.blocking_issues.forEach(issue => {
    console.error(`  - [${issue.severity}] ${issue.message}`);
  });
  process.exit(1);
}

console.log('✅ Safe to merge');
console.log(`Recommended strategy: ${safety.merge_strategy}`);

if (safety.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  safety.warnings.forEach(w => console.log(`  - ${w.message}`));
}
```
