# API Contract Guardian

> Detect breaking API changes, generate tests, and analyze consumer impact before shipping

## 🎯 What It Does

API Contract Guardian helps you evolve APIs safely by:
- **Detecting breaking changes** between OpenAPI/Swagger spec versions
- **Recommending version bumps** (major/minor/patch) using semantic versioning
- **Generating test suites** automatically from API specifications
- **Analyzing consumer impact** to understand who will be affected
- **Creating migration guides** with code examples and checklists

## 🚀 Key Features

### 1. Breaking Change Detection
Compare two OpenAPI specs and identify:
- Removed endpoints or HTTP methods
- Deleted response fields
- Changed field types
- New required parameters

### 2. Smart Version Recommendations
Get automatic semantic version bump suggestions:
- **Major** → Breaking changes that require consumer updates
- **Minor** → Backward-compatible additions
- **Patch** → Bug fixes and documentation updates

### 3. Automated Test Generation
Generate comprehensive test suites supporting:
- Jest, Mocha, pytest, JUnit
- Happy path, validation, authentication, and error tests
- Estimated code coverage metrics

### 4. Consumer Impact Analysis
Understand migration effort:
- Which consumers are affected
- Severity of impact per consumer
- Estimated migration hours
- Automatic migration guides

## 📦 Installation

```bash
npm install @agentfoundry-skills/api-contract-guardian
```

## 🔧 Usage

### Detect Breaking Changes

```typescript
import { run as detectBreakingChanges } from './tools/detect-breaking-changes';

const result = await detectBreakingChanges({
  old_spec_url: 'https://api.example.com/v1/openapi.yaml',
  new_spec_url: 'https://api.example.com/v2/openapi.yaml',
  current_version: '1.5.0',
  strict_mode: false
});

console.log(`Breaking changes: ${result.summary.total_changes}`);
console.log(`Recommended version: ${result.recommended_version}`);
console.log(`Should block release: ${result.should_block_release}`);
```

**Output:**
```json
{
  "has_breaking_changes": true,
  "breaking_changes": [
    {
      "type": "field_removed",
      "severity": "major",
      "path": "GET /users/{id}.email",
      "impact": "Consumers expecting the 'email' field will break",
      "remediation": "Restore field 'email' or mark it as deprecated"
    }
  ],
  "recommended_version": "2.0.0",
  "version_bump_type": "major",
  "should_block_release": true,
  "summary": {
    "total_changes": 3,
    "critical_count": 1,
    "major_count": 2,
    "minor_count": 0
  }
}
```

### Generate API Tests

```typescript
import { run as generateApiTests } from './tools/generate-api-tests';

const result = await generateApiTests({
  spec_url: './openapi.yaml',
  base_url: 'https://api.example.com',
  test_framework: 'jest',
  include_auth: true
});

console.log(`Generated ${result.test_summary.total_tests} tests`);
console.log(`Estimated coverage: ${result.estimated_coverage}%`);
```

### Analyze Consumer Impact

```typescript
import { run as analyzeConsumerImpact } from './tools/analyze-consumer-impact';

const result = await analyzeConsumerImpact({
  breaking_changes: breakingChanges,
  api_logs: './logs/api-access.json',
  time_range: '30d'
});

console.log(`${result.affected_consumers} of ${result.total_consumers} consumers affected`);
console.log(`Impact: ${result.impact_percentage}%`);
```

### Generate Migration Guide

```typescript
import { run as generateMigrationGuide } from './tools/generate-migration-guide';

const result = await generateMigrationGuide({
  old_version: '1.0.0',
  new_version: '2.0.0',
  breaking_changes: breakingChanges,
  format: 'markdown'
});

console.log(result.migration_guide);
```

## 🛠️ Tools

| Tool | Description |
|------|-------------|
| `detect_breaking_changes` | Compare OpenAPI specs and detect breaking changes |
| `generate_api_tests` | Auto-generate test suite from OpenAPI spec |
| `analyze_consumer_impact` | Analyze which consumers will be affected |
| `generate_migration_guide` | Create detailed migration documentation |

## 📋 Use Cases

### 1. CI/CD Pipeline Integration
```yaml
# .github/workflows/api-check.yml
- name: Check for breaking changes
  run: |
    npx @agentfoundry-skills/api-contract-guardian \
      --old-spec ./specs/v1.yaml \
      --new-spec ./specs/v2.yaml \
      --current-version 1.5.0
```

### 2. Pre-Release Safety Check
Prevent shipping breaking changes accidentally by running detection before every release.

### 3. Automated Documentation
Generate migration guides and test suites automatically from spec changes.

## 🎯 Real-World Impact

**Before API Contract Guardian:**
- 😰 Manual API diff reviews (2+ hours)
- 💥 Surprise breaking changes in production
- 📧 Support tickets from angry customers
- 🔧 Emergency hotfixes and rollbacks

**After API Contract Guardian:**
- ✅ Automated breaking change detection (<5 minutes)
- 🛡️ Prevented breaking changes before deployment
- 📊 Consumer impact analysis upfront
- 🚀 Confident API evolution

## 💰 Pricing

| Tier | Price | Limits |
|------|-------|--------|
| **Free** | $0/mo | 100 requests/month, 500KB spec size |
| **Pro** | $29/mo | 1,000 requests/month, 5MB spec size |
| **Enterprise** | $199/mo | Unlimited, custom integration |

## 🔗 Links

- [Documentation](https://docs.agentfoundry.dev/skills/api-contract-guardian)
- [Examples](./examples/)
- [Report Issues](https://github.com/agentfoundry/skills/issues)

## 📄 License

MIT © AgentFoundry
