# Skill Validation Document #02: API Contract Guardian

**Status:** 🟡 Awaiting Approval
**Vertical:** Developer Tools
**Priority:** High
**Estimated Complexity:** Medium-High
**Estimated Build Time:** 3-4 days

---

## 1. Unique Value Proposition

### What Makes This Skill Unique?

**Not just API testing** - This skill provides:
- Automated test generation from OpenAPI/Swagger specs
- Real-time monitoring for breaking changes between versions
- Intelligent versioning strategy recommendations
- Consumer impact analysis (which clients will break)

**Key Differentiator:** Proactive **breaking change detection** before you ship, with specific remediation steps.

### Why This Doesn't Exist Elsewhere

- **Postman/Insomnia:** Manual test creation, no automatic breaking change detection
- **Swagger Validator:** Only validates spec syntax, doesn't detect semantic breaking changes
- **Pact/Contract Testing:** Requires manual contract writing, complex setup
- **Existing tools:** Focus on "is the spec valid?" not "will this break my users?"

### Competitive Moat

1. **Semantic versioning intelligence** - Knows when to bump major/minor/patch
2. **Consumer impact modeling** - Predicts which API consumers break
3. **Automated migration guides** - Generates upgrade instructions
4. **CI/CD native** - Runs in pipeline, blocks dangerous releases

---

## 2. Target User & Use Cases

### Primary Users

1. **Backend Engineers** - Evolving APIs without breaking clients
2. **API Platform Teams** - Managing multiple API versions
3. **DevOps/Platform Engineers** - CI/CD pipeline safety
4. **Product Teams** - Understanding API change impact

### Use Cases

**Use Case 1: Pre-Release Safety Check**
```
Input: OpenAPI spec v2.0.0 vs v2.1.0

Output:
⚠️  3 BREAKING CHANGES DETECTED:
1. Removed field: /users/{id}.email (affects 23 consumers)
2. Changed type: /orders/{id}.total (string → number)
3. Required field added: /products (POST)

Recommendation: MAJOR version bump required (v2.0.0 → v3.0.0)
Estimated impact: 47% of API consumers need updates
```

**Use Case 2: Automated Test Generation**
```
Input: OpenAPI spec for /api/v1/users

Output:
✅ Generated 47 test cases:
- 12 happy path tests
- 18 validation tests (missing fields, invalid types)
- 8 authentication tests
- 9 error handling tests

All tests passing ✓
Code coverage: 94%
```

**Use Case 3: Version Migration Planning**
```
Input: Migrate from v1 to v2

Output:
Migration Guide:
1. Update authentication from API keys to OAuth2
2. Rename 'username' to 'user_name' in all requests
3. Remove deprecated /legacy/* endpoints

Affected Consumers:
- mobile-app: 3 endpoints need updates
- web-dashboard: 7 endpoints need updates
- partner-api: 1 endpoint needs update

Estimated migration time: 2-3 days per consumer
```

---

## 3. Technical Architecture

### Data Sources

1. **OpenAPI/Swagger Specifications**
   - Current version spec (YAML/JSON)
   - Previous version spec
   - Historical specs for trend analysis

2. **API Runtime Logs**
   - Actual request/response data
   - Consumer identification
   - Usage patterns per endpoint

3. **Git Repository**
   - Spec change history
   - Commit messages
   - PR descriptions

4. **Consumer Registry (Optional)**
   - Known API consumers
   - Consumer versions
   - Contact information

### Core Algorithms

#### Algorithm 1: Breaking Change Detection
```typescript
function detectBreakingChanges(
  oldSpec: OpenAPISpec,
  newSpec: OpenAPISpec
): BreakingChange[] {
  const changes: BreakingChange[] = [];

  // 1. Removed endpoints
  for (const path of oldSpec.paths) {
    if (!newSpec.paths[path]) {
      changes.push({
        type: 'endpoint_removed',
        severity: 'critical',
        path,
        impact: 'All consumers using this endpoint will break',
      });
    }
  }

  // 2. Removed or renamed fields
  for (const [path, operation] of oldSpec.getOperations()) {
    const newOp = newSpec.getOperation(path, operation.method);
    if (!newOp) continue;

    const oldFields = extractFields(operation.responses['200']);
    const newFields = extractFields(newOp.responses['200']);

    for (const field of oldFields) {
      if (!newFields.includes(field)) {
        changes.push({
          type: 'field_removed',
          severity: 'major',
          path: `${path}.${field}`,
          impact: 'Consumers expecting this field will break',
        });
      }
    }
  }

  // 3. Type changes
  for (const [path, oldType, newType] of compareTypes(oldSpec, newSpec)) {
    if (oldType !== newType) {
      changes.push({
        type: 'type_changed',
        severity: isCompatibleTypeChange(oldType, newType) ? 'minor' : 'major',
        path,
        oldType,
        newType,
        impact: `Type changed from ${oldType} to ${newType}`,
      });
    }
  }

  // 4. New required fields
  for (const [path, field] of compareRequiredFields(oldSpec, newSpec)) {
    if (field.required && !wasRequired(oldSpec, path, field.name)) {
      changes.push({
        type: 'new_required_field',
        severity: 'major',
        path: `${path}.${field.name}`,
        impact: 'Requests without this field will now fail',
      });
    }
  }

  return changes;
}
```

#### Algorithm 2: Semantic Version Recommendation
```typescript
function recommendVersion(
  currentVersion: string,
  breakingChanges: BreakingChange[]
): VersionRecommendation {
  const hasCritical = breakingChanges.some(c => c.severity === 'critical');
  const hasMajor = breakingChanges.some(c => c.severity === 'major');
  const hasMinor = breakingChanges.some(c => c.severity === 'minor');

  const [major, minor, patch] = currentVersion.split('.').map(Number);

  if (hasCritical || hasMajor) {
    return {
      recommendedVersion: `${major + 1}.0.0`,
      bumpType: 'major',
      reason: 'Breaking changes detected that require consumer updates',
      shouldBlock: true,
    };
  }

  if (hasMinor) {
    return {
      recommendedVersion: `${major}.${minor + 1}.0`,
      bumpType: 'minor',
      reason: 'Backward-compatible changes added',
      shouldBlock: false,
    };
  }

  return {
    recommendedVersion: `${major}.${minor}.${patch + 1}`,
    bumpType: 'patch',
    reason: 'Only bug fixes or documentation updates',
    shouldBlock: false,
  };
}
```

#### Algorithm 3: Consumer Impact Analysis
```typescript
function analyzeConsumerImpact(
  breakingChanges: BreakingChange[],
  apiLogs: ApiLog[]
): ConsumerImpact[] {
  const consumerUsage = groupByConsumer(apiLogs);
  const impacts: ConsumerImpact[] = [];

  for (const [consumerId, logs] of consumerUsage.entries()) {
    const affectedEndpoints = breakingChanges.filter(change =>
      logs.some(log => log.endpoint === change.path)
    );

    if (affectedEndpoints.length > 0) {
      impacts.push({
        consumerId,
        consumerName: getConsumerName(consumerId),
        affectedEndpoints: affectedEndpoints.length,
        severity: calculateSeverity(affectedEndpoints),
        estimatedMigrationEffort: estimateMigrationEffort(affectedEndpoints),
        endpoints: affectedEndpoints.map(e => e.path),
      });
    }
  }

  return impacts.sort((a, b) => b.affectedEndpoints - a.affectedEndpoints);
}
```

---

## 4. Tool Definitions

### Tool 1: `detect_breaking_changes`

**Description:** Compare two OpenAPI specs and detect breaking changes

**Input Schema:**
```yaml
type: object
properties:
  old_spec_url:
    type: string
    description: URL or path to old OpenAPI spec
  new_spec_url:
    type: string
    description: URL or path to new OpenAPI spec
  current_version:
    type: string
    description: Current API version (semver)
  strict_mode:
    type: boolean
    description: Fail on minor changes too
    default: false
required:
  - old_spec_url
  - new_spec_url
  - current_version
```

**Output Schema:**
```yaml
type: object
properties:
  has_breaking_changes:
    type: boolean
  breaking_changes:
    type: array
    items:
      type: object
      properties:
        type:
          type: string
          enum: [endpoint_removed, field_removed, type_changed, new_required_field]
        severity:
          type: string
          enum: [critical, major, minor]
        path:
          type: string
        impact:
          type: string
        remediation:
          type: string
  recommended_version:
    type: string
    description: Recommended next version (semver)
  version_bump_type:
    type: string
    enum: [major, minor, patch]
  should_block_release:
    type: boolean
  summary:
    type: object
    properties:
      total_changes:
        type: integer
      critical_count:
        type: integer
      major_count:
        type: integer
      minor_count:
        type: integer
```

### Tool 2: `generate_api_tests`

**Description:** Auto-generate test suite from OpenAPI specification

**Input Schema:**
```yaml
type: object
properties:
  spec_url:
    type: string
    description: URL or path to OpenAPI spec
  base_url:
    type: string
    description: API base URL for testing
  test_framework:
    type: string
    enum: [jest, mocha, pytest, junit]
    default: jest
  include_auth:
    type: boolean
    description: Generate authentication tests
    default: true
required:
  - spec_url
  - base_url
```

**Output Schema:**
```yaml
type: object
properties:
  test_files:
    type: array
    items:
      type: object
      properties:
        filename:
          type: string
        content:
          type: string
          description: Generated test code
        test_count:
          type: integer
  test_summary:
    type: object
    properties:
      total_tests:
        type: integer
      happy_path_tests:
        type: integer
      validation_tests:
        type: integer
      auth_tests:
        type: integer
      error_tests:
        type: integer
  estimated_coverage:
    type: number
    description: Estimated code coverage percentage
```

### Tool 3: `analyze_consumer_impact`

**Description:** Analyze which API consumers will be affected by changes

**Input Schema:**
```yaml
type: object
properties:
  breaking_changes:
    type: array
    description: List of breaking changes from detect_breaking_changes
  api_logs:
    type: string
    description: Path to API access logs or analytics
  time_range:
    type: string
    description: Time range for log analysis
    default: 30d
required:
  - breaking_changes
  - api_logs
```

**Output Schema:**
```yaml
type: object
properties:
  total_consumers:
    type: integer
  affected_consumers:
    type: integer
  impact_percentage:
    type: number
    description: Percentage of consumers affected
  consumer_details:
    type: array
    items:
      type: object
      properties:
        consumer_id:
          type: string
        consumer_name:
          type: string
        affected_endpoints:
          type: array
        severity:
          type: string
          enum: [critical, high, medium, low]
        estimated_migration_hours:
          type: number
  migration_guide:
    type: string
    description: Auto-generated migration instructions
```

### Tool 4: `generate_migration_guide`

**Description:** Create detailed migration guide for API version upgrade

**Input Schema:**
```yaml
type: object
properties:
  old_version:
    type: string
  new_version:
    type: string
  breaking_changes:
    type: array
  format:
    type: string
    enum: [markdown, html, pdf]
    default: markdown
required:
  - old_version
  - new_version
  - breaking_changes
```

**Output Schema:**
```yaml
type: object
properties:
  migration_guide:
    type: string
    description: Full migration guide content
  checklist:
    type: array
    items:
      type: object
      properties:
        task:
          type: string
        priority:
          type: string
        estimated_time:
          type: string
  code_examples:
    type: array
    description: Before/after code examples
```

---

## 5. Dependencies & APIs

### Required NPM Packages

```json
{
  "dependencies": {
    "@apidevtools/swagger-parser": "^10.1.0",  // Parse OpenAPI specs
    "openapi-diff": "^0.27.0",                 // Spec comparison
    "json-schema-diff": "^1.0.0",              // Schema comparison
    "semver": "^7.5.0",                        // Version manipulation
    "axios": "^1.6.0",                         // HTTP requests
    "zod": "^3.22.0",                          // Validation
    "js-yaml": "^4.1.0"                        // YAML parsing
  },
  "devDependencies": {
    "openapi-types": "^12.1.3"                 // TypeScript types
  }
}
```

### External APIs/Tools

1. **OpenAPI Specification Files**
   - Format: YAML or JSON
   - Versions: 2.0, 3.0, 3.1
   - Source: Git repo, URL, file system

2. **API Gateway Logs (Optional)**
   - AWS API Gateway
   - Kong
   - Nginx access logs
   - Format: JSON or CLF

### Environment Variables

```bash
# Optional: For fetching specs from private repos
GITHUB_TOKEN=ghp_xxx
GITLAB_TOKEN=glpat_xxx

# Optional: For accessing API analytics
API_GATEWAY_KEY=xxx
```

---

## 6. Implementation Complexity

### Complexity Breakdown

| Component | Complexity | Estimated Time |
|-----------|-----------|----------------|
| OpenAPI spec parsing | Low | 0.5 days |
| Breaking change detection | High | 1.5 days |
| Semantic version logic | Medium | 0.5 days |
| Test generation | Medium | 1 day |
| Consumer impact analysis | Medium | 0.5 days |
| Migration guide generation | Low | 0.5 days |
| Testing & validation | Medium | 0.5 days |

**Total Estimated Time:** 3-4 days

### Technical Challenges

1. **Challenge:** Supporting multiple OpenAPI versions (2.0, 3.0, 3.1)
   - **Solution:** Use swagger-parser for normalization
   - **Risk:** Low - library handles this

2. **Challenge:** Accurate breaking change detection (false positives)
   - **Solution:** Conservative rules + user override flags
   - **Risk:** Medium - Requires refinement

3. **Challenge:** Consumer identification from logs
   - **Solution:** API key mapping, user-agent parsing
   - **Risk:** Medium - Depends on log quality

---

## 7. Testing Strategy

### Unit Tests

```typescript
describe('detectBreakingChanges', () => {
  it('should detect removed endpoint', () => {
    const oldSpec = { paths: { '/users': {} } };
    const newSpec = { paths: {} };

    const changes = detectBreakingChanges(oldSpec, newSpec);

    expect(changes).toContainEqual({
      type: 'endpoint_removed',
      severity: 'critical',
      path: '/users',
    });
  });

  it('should detect type change', () => {
    const oldSpec = createSpec({ userId: { type: 'string' } });
    const newSpec = createSpec({ userId: { type: 'number' } });

    const changes = detectBreakingChanges(oldSpec, newSpec);

    expect(changes[0].type).toBe('type_changed');
    expect(changes[0].severity).toBe('major');
  });
});
```

### Integration Tests

- Test with real OpenAPI specs from popular APIs (Stripe, GitHub, Twilio)
- Verify version recommendations match manual analysis
- Test migration guide generation

---

## 8. Monetization Strategy

### Pricing Tiers

**Free Tier:**
- 1 API spec comparison per day
- Basic breaking change detection
- No consumer impact analysis

**Pro Tier ($39/month):**
- Unlimited spec comparisons
- Full breaking change detection
- Test generation (up to 100 tests)
- Basic consumer impact analysis
- CI/CD integration

**Enterprise Tier ($199/month):**
- Everything in Pro
- Unlimited test generation
- Full consumer impact analysis with logs
- Custom breaking change rules
- SLA + support
- White-label reports

### Market Size

- **Target:** API-first companies, platform teams
- **TAM:** 50,000+ companies with public/private APIs
- **Conversion:** 3% free-to-paid = 1,500 paid customers
- **ARR:** Mix of Pro/Enterprise = ~$780k/year

---

## 9. Success Metrics

### Technical Metrics

- ✅ 95%+ accuracy in breaking change detection
- ✅ Supports OpenAPI 2.0, 3.0, 3.1
- ✅ Processes specs with 100+ endpoints in < 10 seconds
- ✅ Generated tests have 85%+ coverage

### Business Metrics

- 🎯 200 free users in first month
- 🎯 20 paid conversions in first quarter
- 🎯 Featured in 2+ API design blogs
- 🎯 5+ GitHub stars per week

---

## 10. Go/No-Go Decision

### ✅ Reasons to Build

1. **Clear pain point** - Breaking APIs is a common, expensive mistake
2. **Enterprise value** - Platform teams will pay for this
3. **CI/CD integration** - Natural fit in development workflow
4. **Viral potential** - Developers share tools that save them from disasters
5. **Moderate complexity** - Not too hard, achievable in 3-4 days

### ❌ Reasons NOT to Build

1. **Niche market** - Only valuable for teams with external APIs
2. **Existing tools** - Some solutions exist (though not comprehensive)
3. **Spec dependency** - Requires teams to maintain OpenAPI specs

### Final Recommendation

**🟢 APPROVED TO BUILD**

This skill has:
- Strong product-market fit (API-first companies)
- Clear differentiation (proactive + consumer impact)
- Medium complexity (achievable quickly)
- Good monetization potential ($39-199/month)

**Risk Level:** Medium (spec parsing complexity)
**Reward Level:** High (prevents costly API breaks)

---

## 11. Next Steps

1. ✅ Validation document approved
2. ⏳ Create skill.yaml manifest
3. ⏳ Set up project from api-integration template
4. ⏳ Implement breaking change detection
5. ⏳ Build test generation
6. ⏳ Add consumer impact analysis
7. ⏳ Write tests
8. ⏳ Create documentation
9. ⏳ Test with 5 real API specs
10. ⏳ Publish to marketplace

---

**Validated By:** AgentFoundry Team
**Date:** 2025-01-08
**Status:** 🟢 Approved for Development
