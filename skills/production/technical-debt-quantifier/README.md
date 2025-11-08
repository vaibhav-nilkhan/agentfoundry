# Technical Debt Quantifier

Quantify technical debt in dollar values with ROI-based refactoring prioritization and cost analysis.

## Features

- **Dollar-Value Cost Calculation** - Assigns actual costs to technical debt
- **ROI-Based Prioritization** - Ranks refactoring by return on investment
- **Change Frequency Analysis** - Identifies code hotspots
- **Automated Recommendations** - Specific, actionable refactoring advice

## Installation

```bash
agentfoundry install technical-debt-quantifier
```

## Prerequisites

- Git repository (public or private with token)
- Node.js 20+

## Usage

### 1. Analyze Codebase

Get a complete technical debt analysis with dollar costs:

```typescript
const analysis = await analyzeCodebase({
  repo_url: "https://github.com/facebook/react",
  branch: "main",
  config: {
    avg_hourly_rate: 120,  // Developer hourly rate
    team_size: 8,
    include_test_files: false
  }
});

console.log(`Total annual cost: $${analysis.total_debt_cost_annual}`);
console.log(`Files analyzed: ${analysis.total_files_analyzed}`);
console.log(`\nTop 3 most expensive files:`);
analysis.top_problem_files.slice(0, 3).forEach(file => {
  console.log(`- ${file.file_path}: $${file.annual_cost}/year`);
  console.log(`  Issues: ${file.issues.join(', ')}`);
  console.log(`  Recommendation: ${file.recommendation}`);
});
```

**Output Example:**
```
Total annual cost: $347,000
Files analyzed: 523

Top 3 most expensive files:
- src/auth/middleware.ts: $47,200/year
  Issues: High cyclomatic complexity, Frequently modified
  Recommendation: Critical: Break this file into smaller modules

- src/database/query-builder.ts: $31,800/year
  Issues: File is too large, Frequently modified
  Recommendation: High priority: Simplify control flow

- src/api/routes.ts: $22,400/year
  Issues: High cyclomatic complexity
  Recommendation: Refactor to improve maintainability
```

### 2. Prioritize Refactoring

Get ROI-ranked refactoring tasks that fit your budget:

```typescript
const priorities = await prioritizeRefactoring({
  repo_url: "https://github.com/your-org/your-repo",
  refactoring_budget_hours: 80,  // 2 weeks
  focus_area: "all"
});

console.log(`Budget utilization: ${priorities.budget_utilization}%`);
console.log(`Total potential savings: $${priorities.total_potential_savings}/year`);

priorities.recommended_tasks.forEach((task, i) => {
  console.log(`\n${i + 1}. ${task.title}`);
  console.log(`   Effort: ${task.estimated_hours} hours`);
  console.log(`   Savings: $${task.annual_savings}/year`);
  console.log(`   ROI: ${task.roi}x`);
  console.log(`   Payback: ${task.payback_period_months} months`);
});
```

### 3. Estimate Refactoring Cost

Estimate time and cost to fix specific files:

```typescript
const estimate = await estimateRefactoringCost({
  repo_url: "https://github.com/your-org/your-repo",
  file_paths: [
    "src/auth/middleware.ts",
    "src/database/query-builder.ts"
  ],
  refactoring_type: "simplify"
});

console.log(`Estimated effort: ${estimate.estimated_hours} hours`);
console.log(`Estimated cost: $${estimate.estimated_cost}`);
console.log(`Risk level: ${estimate.risk_level}`);
console.log(`Breaking changes: ${estimate.breaking_changes ? 'Yes' : 'No'}`);
console.log(`Test coverage needed: ${estimate.test_coverage_required}%`);
```

### 4. Track Debt Trends

Monitor technical debt over time:

```typescript
const trends = await trackDebtTrends({
  repo_url: "https://github.com/your-org/your-repo",
  time_range: "last_quarter",
  metric: "total_cost"
});

console.log(`Current debt: $${trends.current_value}`);
console.log(`Change: ${trends.change_percentage}%`);
console.log(`Trend: ${trends.trend}`);

console.log(`\nRecommendations:`);
trends.recommendations.forEach(rec => console.log(`- ${rec}`));
```

## Tools Reference

### `analyze_codebase`

Comprehensive codebase analysis with cost quantification.

**Input:**
- `repo_url` (string, required) - Repository URL
- `branch` (string, optional) - Branch to analyze (default: "main")
- `config` (object, optional):
  - `avg_hourly_rate` (number) - Developer hourly rate (default: 100)
  - `team_size` (number) - Team size (default: 5)
  - `include_test_files` (boolean) - Include tests (default: false)

**Output:**
- `total_debt_cost_annual` - Total annual cost in USD
- `total_files_analyzed` - Number of files analyzed
- `debt_categories` - Breakdown by category
- `top_problem_files` - Top 10 most expensive files

### `prioritize_refactoring`

ROI-based refactoring prioritization.

**Input:**
- `repo_url` (string, required)
- `refactoring_budget_hours` (number, required) - Available hours
- `focus_area` (enum, optional) - all | security | performance | maintainability

**Output:**
- `recommended_tasks` - Prioritized list of refactorings
- `total_potential_savings` - Total annual savings
- `budget_utilization` - Percentage of budget used

### `estimate_refactoring_cost`

Estimate refactoring effort and cost.

**Input:**
- `repo_url` (string, required)
- `file_paths` (array, required) - Files to refactor
- `refactoring_type` (enum, required) - simplify | extract | rename | redesign | rewrite

**Output:**
- `estimated_hours` - Time estimate
- `estimated_cost` - Dollar cost
- `risk_level` - low | medium | high
- `breaking_changes` - Boolean
- `test_coverage_required` - Percentage

### `track_debt_trends`

Track debt changes over time.

**Input:**
- `repo_url` (string, required)
- `time_range` (enum, optional) - last_week | last_month | last_quarter | last_year
- `metric` (enum, optional) - total_cost | complexity | duplication | test_coverage

**Output:**
- `current_value` - Current metric value
- `change_percentage` - % change
- `trend` - improving | stable | degrading
- `data_points` - Historical data
- `recommendations` - Actionable advice

## Cost Calculation Methodology

The skill calculates technical debt cost using these factors:

1. **Maintenance Cost** = Complexity × Change Frequency × Hourly Rate
2. **Onboarding Cost** = (Complexity + LOC) × Team Turnover × Hourly Rate
3. **Duplication Cost** = Duplication % × Change Frequency × Hourly Rate

### Example Calculation

For a file with:
- Cyclomatic complexity: 30
- Changed 15 times in 6 months
- 500 lines of code
- Team hourly rate: $100/hour

**Maintenance:** 30/10 × 15 × $100 × 0.5 = $2,250/year
**Onboarding:** log(31) × 5 × 0.2 × $100 = $340/year
**Total:** $2,590/year per file

## Configuration

### Environment Variables

```bash
# Optional: For private repositories
GITHUB_TOKEN=ghp_your_token_here
```

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
- Quarterly planning workflow
- Executive cost reports
- CI/CD integration

## Pricing

- **Free**: 10 analyses/month, 1 repository
- **Pro ($49/month)**: Unlimited analyses, 10 repositories
- **Enterprise ($299/month)**: Unlimited everything, custom reporting

## License

MIT

## Support

- Documentation: https://docs.agentfoundry.dev/skills/technical-debt-quantifier
- Issues: https://github.com/agentfoundry/skills/issues
- Discord: https://discord.gg/agentfoundry
