# 🧠 AgentFoundry Skill Specification (v1.0)

**Version:** 1.0.0
**Last Updated:** 2025-01-08
**Status:** Stable

This document defines the canonical specification for all AgentFoundry Skills. Every Skill submitted to the marketplace must conform to this specification.

---

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Manifest Schema (skill.yaml)](#manifest-schema)
4. [Tool Definition Rules](#tool-definition-rules)
5. [Validation Requirements](#validation-requirements)
6. [Quality Standards](#quality-standards)
7. [Examples](#examples)

---

## Overview

An AgentFoundry Skill is a self-contained package that provides one or more tools for AI agents to use. Skills follow the MCP (Model Context Protocol) standard and can run on multiple platforms.

**Key Principles:**
- **Deterministic:** Same input always produces same output
- **Self-contained:** All dependencies declared in manifest
- **Platform-agnostic:** Works with MCP, Claude Skills, OpenAI Agents
- **Well-tested:** Automated validation and testing required
- **Documented:** Clear usage examples and API documentation

---

## File Structure

Every Skill MUST follow this directory layout:

```
my-skill/
├── skill.yaml                 # REQUIRED: Skill manifest
├── README.md                  # REQUIRED: User documentation
├── src/                       # REQUIRED: Source code
│   ├── index.ts              # Main entry point
│   └── tools/                # Tool implementations
│       ├── tool-one.ts
│       └── tool-two.ts
├── tests/                     # REQUIRED: Test files
│   ├── tool-one.test.ts
│   └── tool-two.test.ts
├── examples/                  # RECOMMENDED: Usage examples
│   └── basic-usage.md
├── package.json              # REQUIRED (for TypeScript/Node skills)
├── tsconfig.json             # REQUIRED (for TypeScript skills)
├── .gitignore
└── LICENSE
```

### Required Files

| File | Required | Purpose |
|------|----------|---------|
| `skill.yaml` | ✅ Yes | Skill manifest and metadata |
| `README.md` | ✅ Yes | User-facing documentation |
| `src/index.ts` | ✅ Yes | Main entry point |
| `src/tools/` | ✅ Yes | Tool implementations |
| `tests/` | ✅ Yes | Test suites |
| `package.json` | ✅ Yes (TS/Node) | Dependencies and scripts |
| `examples/` | ⚠️ Recommended | Usage examples |
| `LICENSE` | ⚠️ Recommended | License file |

---

## Manifest Schema (skill.yaml)

### Complete Example

```yaml
# Schema version (REQUIRED)
schema_version: "1.0"

# Basic Metadata (REQUIRED)
name: github-pr-analyzer
version: 1.2.3
description: Analyze pull requests for code quality, security, and best practices

# Author Information (REQUIRED)
author:
  name: John Doe
  email: john@example.com
  url: https://github.com/johndoe

# License (REQUIRED)
license: MIT

# Platform Compatibility (REQUIRED)
platforms:
  - mcp
  - claude-skills
  - openai-agents

# Permissions (REQUIRED - can be empty array)
permissions:
  - network         # Makes HTTP requests
  - filesystem:read # Reads local files
  - env:read        # Reads environment variables

# Categories (REQUIRED)
categories:
  - developer-tools
  - code-analysis

# Tags (OPTIONAL)
tags:
  - github
  - code-review
  - security
  - pull-requests

# Repository (OPTIONAL but recommended)
repository:
  type: git
  url: https://github.com/agentfoundry/github-pr-analyzer

# Homepage (OPTIONAL)
homepage: https://agentfoundry.dev/skills/github-pr-analyzer

# Documentation (OPTIONAL)
documentation: https://docs.agentfoundry.dev/skills/github-pr-analyzer

# Tools (REQUIRED - at least one tool)
tools:
  - name: analyze_pr
    description: Analyze a GitHub pull request for quality and security issues
    entry: src/tools/analyze-pr.ts
    input_schema:
      type: object
      properties:
        repo_owner:
          type: string
          description: GitHub repository owner
        repo_name:
          type: string
          description: GitHub repository name
        pr_number:
          type: integer
          description: Pull request number
      required:
        - repo_owner
        - repo_name
        - pr_number
    output_schema:
      type: object
      properties:
        score:
          type: number
          description: Quality score (0-100)
        issues:
          type: array
          description: List of issues found
        recommendations:
          type: array
          description: Improvement suggestions

# Dependencies (OPTIONAL)
dependencies:
  npm:
    - "@octokit/rest@^19.0.0"
    - "zod@^3.22.0"
  env:
    - name: GITHUB_TOKEN
      required: true
      description: GitHub API token with repo access

# Configuration (OPTIONAL)
config:
  max_files_analyzed: 100
  timeout_seconds: 30
  supported_languages:
    - typescript
    - javascript
    - python

# Pricing (OPTIONAL)
pricing:
  type: free  # free, freemium, paid
  tiers:
    - name: free
      price: 0
      limits:
        requests_per_month: 1000
    - name: pro
      price: 29
      limits:
        requests_per_month: 10000

# Validation (REQUIRED)
validation:
  static_checks:
    - manifest_schema
    - required_files_exist
    - tool_schemas_valid
  sandbox_tests:
    - basic_execution
    - error_handling
    - timeout_handling
```

### Field Reference

#### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema_version` | string | ✅ Yes | Must be `"1.0"` |
| `name` | string | ✅ Yes | Unique skill identifier (lowercase, hyphens) |
| `version` | string | ✅ Yes | Semantic version (e.g., `1.2.3`) |
| `description` | string | ✅ Yes | One-line summary (max 200 chars) |
| `author` | object | ✅ Yes | Author information |
| `license` | string | ✅ Yes | SPDX license identifier |
| `platforms` | array | ✅ Yes | Supported platforms |
| `permissions` | array | ✅ Yes | Required permissions (can be `[]`) |
| `categories` | array | ✅ Yes | Skill categories (1-3 categories) |
| `tags` | array | ⚠️ Recommended | Search tags |
| `tools` | array | ✅ Yes | Tool definitions (min 1, max 10) |
| `validation` | object | ✅ Yes | Validation configuration |

#### Author Object

```yaml
author:
  name: string       # REQUIRED
  email: string      # REQUIRED
  url: string        # OPTIONAL
  github: string     # OPTIONAL
```

#### Platform Options

Valid platform values:
- `mcp` - Model Context Protocol (Claude Desktop, etc.)
- `claude-skills` - Anthropic Claude Skills
- `openai-agents` - OpenAI Agents/GPTs
- `langchain` - LangChain compatible

#### Permission Types

Valid permission values:
- `network` - Makes HTTP/network requests
- `filesystem:read` - Reads files from disk
- `filesystem:write` - Writes files to disk
- `env:read` - Reads environment variables
- `exec` - Executes shell commands
- `database` - Database connections

#### Category Options

Valid categories (choose 1-3):
- `developer-tools`
- `content-creation`
- `e-commerce`
- `data-analysis`
- `automation`
- `communication`
- `productivity`
- `security`
- `finance`
- `marketing`

#### Tool Definition

Each tool must define:

```yaml
tools:
  - name: string              # REQUIRED: Tool identifier (snake_case)
    description: string       # REQUIRED: Clear description
    entry: string            # REQUIRED: Path to tool file
    input_schema: object     # REQUIRED: JSON Schema for inputs
    output_schema: object    # OPTIONAL: JSON Schema for outputs
```

**Tool Naming Rules:**
- Use `snake_case` (e.g., `analyze_pr`, `get_user_data`)
- Be descriptive (avoid abbreviations)
- Start with verb when possible
- Max 50 characters

---

## Tool Definition Rules

### Tool File Structure

Every tool file MUST export a `run` function:

```typescript
// src/tools/example-tool.ts

import { z } from 'zod';

// Input validation schema
const inputSchema = z.object({
  param1: z.string(),
  param2: z.number().optional(),
});

// Output type
interface ToolOutput {
  result: string;
  metadata?: Record<string, any>;
}

/**
 * Tool description
 * @param input - Input parameters
 * @returns Tool output
 */
export async function run(input: z.infer<typeof inputSchema>): Promise<ToolOutput> {
  // Validate input
  const validated = inputSchema.parse(input);

  // Tool logic
  const result = `Processed: ${validated.param1}`;

  // Return output
  return {
    result,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
}
```

### Tool Requirements

1. **Deterministic:** Same input → same output (unless explicitly non-deterministic)
2. **Error Handling:** Must catch and handle errors gracefully
3. **Validation:** Must validate all inputs
4. **Timeout:** Should complete within 30 seconds (configurable)
5. **Documentation:** Must have JSDoc comments
6. **Type Safety:** Must use TypeScript with strict mode

### Tool Best Practices

✅ **DO:**
- Validate inputs with Zod or similar
- Return structured JSON objects
- Include helpful error messages
- Log important operations
- Handle edge cases
- Provide clear examples

❌ **DON'T:**
- Use global state
- Make assumptions about environment
- Return unstructured strings
- Ignore errors silently
- Use blocking operations without timeouts
- Expose sensitive data in outputs

---

## Validation Requirements

### Static Checks (Pre-Deployment)

All Skills must pass these static validations:

1. **Manifest Schema**
   - `skill.yaml` validates against schema
   - All required fields present
   - Semantic version format correct

2. **File Structure**
   - All required files exist
   - Tool entry points exist
   - Test files exist for each tool

3. **Code Quality**
   - TypeScript compiles without errors
   - Passes linting (ESLint)
   - No security vulnerabilities (npm audit)

4. **Documentation**
   - README.md exists and is complete
   - All tools documented
   - Examples provided

### Sandbox Tests (Runtime)

All Skills must pass these runtime tests:

1. **Basic Execution**
   - Each tool runs successfully
   - Returns valid JSON
   - Matches output schema

2. **Error Handling**
   - Invalid inputs rejected gracefully
   - Network errors handled
   - Timeout handling works

3. **Security**
   - No code injection vulnerabilities
   - API keys not exposed
   - Rate limiting respected

### Validation Output Format

```json
{
  "passed": true,
  "skill_name": "github-pr-analyzer",
  "version": "1.2.3",
  "static_checks": {
    "manifest_schema": "pass",
    "required_files": "pass",
    "typescript_compile": "pass",
    "linting": "pass",
    "security_audit": "pass"
  },
  "sandbox_tests": {
    "basic_execution": "pass",
    "error_handling": "pass",
    "timeout_handling": "pass",
    "security_checks": "pass"
  },
  "coverage": {
    "lines": 87.5,
    "functions": 92.3,
    "branches": 78.6
  },
  "errors": [],
  "warnings": [
    "Consider adding more test cases for edge conditions"
  ]
}
```

---

## Quality Standards

### Code Coverage

- **Minimum:** 80% line coverage
- **Recommended:** 90%+ line coverage
- **Required:** All public functions tested

### Documentation

Every Skill must include:

1. **README.md** with:
   - Clear description
   - Installation instructions
   - Usage examples
   - API reference
   - Configuration options
   - Troubleshooting guide

2. **Inline documentation:**
   - JSDoc for all public functions
   - Type definitions for all interfaces
   - Comments for complex logic

### Performance

- **Response Time:** < 5 seconds for 95th percentile
- **Timeout:** 30 seconds max (configurable)
- **Memory:** < 100MB per execution
- **Rate Limits:** Respect API limits

### Security

- **Dependencies:** No known vulnerabilities
- **Secrets:** Use environment variables
- **Input Validation:** Validate all user inputs
- **Output Sanitization:** Don't expose sensitive data

---

## Examples

### Minimal Skill Example

```yaml
# skill.yaml
schema_version: "1.0"
name: hello-world
version: 1.0.0
description: A simple hello world skill
author:
  name: AgentFoundry
  email: team@agentfoundry.dev
license: MIT
platforms:
  - mcp
permissions: []
categories:
  - developer-tools
tools:
  - name: say_hello
    description: Returns a greeting message
    entry: src/tools/hello.ts
    input_schema:
      type: object
      properties:
        name:
          type: string
          description: Name to greet
      required:
        - name
validation:
  static_checks:
    - manifest_schema
    - required_files
  sandbox_tests:
    - basic_execution
```

```typescript
// src/tools/hello.ts
import { z } from 'zod';

const inputSchema = z.object({
  name: z.string(),
});

export async function run(input: z.infer<typeof inputSchema>) {
  const { name } = inputSchema.parse(input);
  return {
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  };
}
```

### Advanced Skill Example

See `/skills/examples/github-pr-analyzer/` for a complete, production-ready example.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-08 | Initial specification |

---

## References

- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [JSON Schema](https://json-schema.org)
- [Semantic Versioning](https://semver.org)
- [SPDX License List](https://spdx.org/licenses/)

---

**Questions or feedback?** Open an issue at [github.com/agentfoundry/agentfoundry/issues](https://github.com/agentfoundry/agentfoundry/issues)
