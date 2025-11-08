# AgentFoundry Skill Format Specification v1.0

## Overview
This document defines the canonical format for AgentFoundry Skills - the core unit of reusability in the AI agent ecosystem.

---

## Skill Directory Structure

```
skill-name/
├── skill.yaml              # Skill manifest (REQUIRED)
├── README.md               # Human-readable documentation (REQUIRED)
├── src/                    # Source code (REQUIRED)
│   ├── tools/              # Tool implementations
│   │   ├── tool1.ts
│   │   └── tool2.py
│   ├── prompts/            # Prompt templates
│   │   └── system.md
│   └── resources/          # MCP resources (optional)
│       └── resource1.ts
├── tests/                  # Test suite (REQUIRED)
│   ├── unit/
│   │   └── tool1.test.ts
│   └── integration/
│       └── integration.test.ts
├── examples/               # Usage examples (REQUIRED)
│   ├── basic.ts
│   └── advanced.ts
└── .agentforge/           # AgentFoundry metadata (auto-generated)
    ├── validation.json
    └── telemetry.json
```

---

## skill.yaml Specification

```yaml
# REQUIRED FIELDS
name: skill-name                    # Unique identifier (lowercase, hyphens)
version: 1.0.0                      # Semantic versioning
description: Short description      # Max 140 characters

# METADATA
author:
  name: John Doe
  email: john@example.com
  github: johndoe

license: MIT                        # SPDX identifier
repository: https://github.com/user/skill-name

# COMPATIBILITY
platforms:
  - mcp                            # Model Context Protocol
  - claude-skills                  # Claude Skills format
  - openai-agents                  # OpenAI Agents SDK

runtime:
  language: typescript             # typescript, python, javascript
  node: ">=18.0.0"                 # Node version (if applicable)
  python: ">=3.9"                  # Python version (if applicable)

# DEPENDENCIES
dependencies:
  skills: []                       # Other AgentFoundry Skills
  npm: []                          # npm packages
  pip: []                          # Python packages

# RESOURCES & COSTS
resources:
  memory: low                      # low, medium, high
  cpu: low
  network: medium                  # Does it make external API calls?

cost_estimate:
  tokens_per_call: 500            # Estimated tokens consumed per invocation
  api_calls: 2                    # External API calls per invocation
  pricing_tier: free              # free, low, medium, high

# SECURITY & PERMISSIONS
permissions:
  - file.read                     # Read files
  - file.write                    # Write files
  - network.http                  # Make HTTP requests
  - memory.read                   # Access memory/state
  - memory.write                  # Store memory/state

security:
  sandbox: required               # required, optional, none
  verified: false                 # Set to true by AgentFoundry after verification

# CONFIGURATION
config_schema:                    # JSON Schema for user configuration
  type: object
  properties:
    api_key:
      type: string
      description: API key for external service
      secret: true
    endpoint:
      type: string
      default: https://api.example.com

# CATEGORIZATION
tags:
  - memory
  - storage
  - vector-db

category: data-storage             # See categories list below

# VALIDATION
validation:
  required_tests: true            # Must pass tests to publish
  min_coverage: 80                # Minimum test coverage %
  security_scan: true             # Run security analysis
```

---

## Tool Implementation Format

### TypeScript Example (`src/tools/store-memory.ts`)

```typescript
/**
 * Store Memory Tool
 *
 * Stores a piece of information in long-term memory with semantic search capability.
 */

import { Tool, ToolInput, ToolOutput } from '@agentforge/sdk';

export interface StoreMemoryInput extends ToolInput {
  content: string;           // The content to store
  tags?: string[];          // Optional tags for categorization
  importance?: number;       // 1-10, how important is this memory?
}

export interface StoreMemoryOutput extends ToolOutput {
  memoryId: string;         // Unique ID of stored memory
  stored: boolean;          // Success flag
  timestamp: string;        // ISO timestamp
}

export const storeMemory: Tool<StoreMemoryInput, StoreMemoryOutput> = {
  name: 'store_memory',
  description: 'Store information in long-term memory with semantic search',

  // Input schema (JSON Schema)
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'The content to store in memory',
        minLength: 1,
        maxLength: 10000
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional tags for categorization'
      },
      importance: {
        type: 'number',
        minimum: 1,
        maximum: 10,
        default: 5,
        description: 'Importance score (1-10)'
      }
    },
    required: ['content']
  },

  // Tool implementation
  async execute(input: StoreMemoryInput): Promise<StoreMemoryOutput> {
    // Validate input
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    // Implementation here
    const memoryId = generateId();
    await vectorDB.store({
      id: memoryId,
      content: input.content,
      tags: input.tags || [],
      importance: input.importance || 5,
      timestamp: new Date().toISOString()
    });

    return {
      memoryId,
      stored: true,
      timestamp: new Date().toISOString()
    };
  }
};
```

### Python Example (`src/tools/retrieve_memory.py`)

```python
"""
Retrieve Memory Tool

Retrieves relevant memories based on semantic search.
"""

from typing import List, Optional
from agentforge import Tool, ToolInput, ToolOutput
from pydantic import BaseModel, Field

class RetrieveMemoryInput(ToolInput):
    """Input for memory retrieval"""
    query: str = Field(..., description="Search query", min_length=1)
    limit: int = Field(5, description="Maximum results", ge=1, le=50)
    min_relevance: float = Field(0.7, description="Minimum relevance score", ge=0.0, le=1.0)

class Memory(BaseModel):
    """A single memory"""
    id: str
    content: str
    relevance: float
    timestamp: str
    tags: List[str]

class RetrieveMemoryOutput(ToolOutput):
    """Output from memory retrieval"""
    memories: List[Memory]
    count: int

class RetrieveMemoryTool(Tool[RetrieveMemoryInput, RetrieveMemoryOutput]):
    """Tool for retrieving memories"""

    name = "retrieve_memory"
    description = "Search and retrieve relevant memories using semantic search"

    def get_input_schema(self):
        return RetrieveMemoryInput.schema()

    async def execute(self, input: RetrieveMemoryInput) -> RetrieveMemoryOutput:
        """Execute memory retrieval"""
        # Implementation here
        results = await vector_db.search(
            query=input.query,
            limit=input.limit,
            min_score=input.min_relevance
        )

        memories = [
            Memory(
                id=r.id,
                content=r.content,
                relevance=r.score,
                timestamp=r.timestamp,
                tags=r.tags
            )
            for r in results
        ]

        return RetrieveMemoryOutput(
            memories=memories,
            count=len(memories)
        )
```

---

## MCP Server Integration

Skills automatically export as MCP servers. AgentFoundry generates:

```typescript
// Auto-generated from skill.yaml
{
  "name": "skill-name",
  "version": "1.0.0",
  "tools": [
    {
      "name": "store_memory",
      "description": "Store information in long-term memory",
      "inputSchema": { /* JSON Schema */ }
    },
    {
      "name": "retrieve_memory",
      "description": "Retrieve relevant memories",
      "inputSchema": { /* JSON Schema */ }
    }
  ]
}
```

---

## Testing Requirements

### Unit Tests (`tests/unit/tool1.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { storeMemory } from '../../src/tools/store-memory';

describe('storeMemory', () => {
  it('should store memory successfully', async () => {
    const result = await storeMemory.execute({
      content: 'Test memory',
      tags: ['test'],
      importance: 7
    });

    expect(result.stored).toBe(true);
    expect(result.memoryId).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it('should reject empty content', async () => {
    await expect(
      storeMemory.execute({ content: '' })
    ).rejects.toThrow('Content cannot be empty');
  });

  it('should handle missing optional fields', async () => {
    const result = await storeMemory.execute({
      content: 'Test memory'
    });

    expect(result.stored).toBe(true);
  });
});
```

### Integration Tests (`tests/integration/integration.test.ts`)

```typescript
describe('Memory Skill Integration', () => {
  it('should store and retrieve memory', async () => {
    // Store
    const stored = await storeMemory.execute({
      content: 'Important fact about AI',
      tags: ['ai', 'knowledge'],
      importance: 9
    });

    // Retrieve
    const retrieved = await retrieveMemory.execute({
      query: 'AI fact',
      limit: 5
    });

    expect(retrieved.count).toBeGreaterThan(0);
    expect(retrieved.memories[0].id).toBe(stored.memoryId);
  });
});
```

---

## Example Usage (`examples/basic.ts`)

```typescript
import { AgentForge } from '@agentforge/sdk';

async function main() {
  // Initialize AgentFoundry
  const forge = new AgentForge({
    apiKey: process.env.AGENTFORGE_API_KEY
  });

  // Install skill (first time)
  await forge.skills.install('memory-skill');

  // Use skill
  const stored = await forge.skills.execute('memory-skill', 'store_memory', {
    content: 'User prefers dark mode',
    tags: ['preferences', 'ui'],
    importance: 8
  });

  console.log('Memory stored:', stored.memoryId);

  // Retrieve later
  const memories = await forge.skills.execute('memory-skill', 'retrieve_memory', {
    query: 'user interface preferences',
    limit: 5
  });

  console.log('Found memories:', memories.count);
  memories.memories.forEach(m => {
    console.log(`- ${m.content} (relevance: ${m.relevance})`);
  });
}

main();
```

---

## Documentation Requirements (README.md)

Every Skill MUST have comprehensive README with:

1. **Title and Description**
2. **Installation** (`agentforge add skill-name`)
3. **Quick Start** (minimal working example)
4. **API Reference** (all tools with parameters)
5. **Configuration** (environment variables, config options)
6. **Examples** (common use cases)
7. **Troubleshooting** (common issues and solutions)
8. **Contributing** (how to contribute)
9. **License**

See template: `templates/README.md`

---

## Skill Categories

```yaml
categories:
  - memory-storage         # Long-term memory, caching, state
  - data-retrieval        # Search, APIs, web scraping
  - data-processing       # Transform, analyze, compute
  - communication         # Email, Slack, notifications
  - file-operations       # Read, write, parse files
  - reasoning             # Chain-of-thought, planning
  - validation            # Testing, verification
  - monitoring            # Logging, telemetry, errors
  - security              # Auth, encryption, secrets
  - integration           # Third-party service wrappers
```

---

## Validation & Publishing

### Pre-Publish Checklist

Before publishing to AgentFoundry marketplace:

- [ ] `skill.yaml` is valid and complete
- [ ] All REQUIRED fields populated
- [ ] README.md with all sections
- [ ] At least 2 examples in `examples/`
- [ ] Test suite with >80% coverage
- [ ] All tests passing
- [ ] Security scan passed (no critical issues)
- [ ] License file present
- [ ] At least one tool implemented

### Publishing Process

```bash
# Validate locally
agentforge validate

# Run tests
agentforge test

# Security scan
agentforge scan

# Publish to marketplace
agentforge publish

# Publish to specific registries
agentforge publish --registry=mcp  # GitHub MCP Registry
agentforge publish --registry=all  # All supported registries
```

---

## Versioning Policy

Skills MUST follow Semantic Versioning (semver):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes (API changes, removed features)
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes (backward compatible)

Example:
```yaml
version: 1.2.3
  # Major: 1 (initial release)
  # Minor: 2 (added retrieve_memory tool)
  # Patch: 3 (fixed bug in store_memory)
```

---

## Security Best Practices

### 1. Principle of Least Privilege
Only request permissions you actually need.

❌ BAD:
```yaml
permissions:
  - file.read
  - file.write
  - network.http
  - system.exec  # Don't need this!
```

✅ GOOD:
```yaml
permissions:
  - file.read
  - network.http
```

### 2. Validate All Inputs
Never trust user input.

```typescript
async execute(input: ToolInput) {
  // Validate
  if (!input.content || input.content.length > 10000) {
    throw new Error('Content must be 1-10000 characters');
  }

  // Sanitize
  const sanitized = sanitize(input.content);

  // Use sanitized version
  await process(sanitized);
}
```

### 3. Handle Secrets Securely
Never hardcode secrets.

```typescript
// ❌ BAD
const API_KEY = 'sk-1234567890abcdef';

// ✅ GOOD
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error('API_KEY environment variable not set');
}
```

### 4. Rate Limiting
Prevent abuse.

```typescript
import { rateLimit } from '@agentforge/sdk';

export const myTool = rateLimit({
  max: 100,           // 100 calls
  window: '1h'        // per hour
})(async (input) => {
  // Implementation
});
```

---

## Cost Optimization

### Estimating Costs

Skills should provide accurate cost estimates:

```yaml
cost_estimate:
  tokens_per_call: 500        # Average tokens (input + output)
  api_calls: 2                # External API calls
  pricing_tier: low           # free | low | medium | high

  # Detailed breakdown (optional)
  breakdown:
    llm_tokens: 500
    vector_db_queries: 1
    api_requests: 2
    storage_kb: 10
```

### Tips for Low-Cost Skills

1. **Cache aggressively**: Store results to avoid re-computation
2. **Batch operations**: Group multiple calls into one
3. **Use smaller models**: Not everything needs GPT-4
4. **Lazy loading**: Only load resources when needed
5. **Compression**: Compress data before storage

---

## Multi-Platform Support

Skills can target multiple platforms:

```yaml
platforms:
  - mcp                    # Model Context Protocol (primary)
  - claude-skills          # Anthropic Claude Skills
  - openai-agents          # OpenAI Agents SDK
  - custom                 # Your own format
```

AgentFoundry automatically generates platform-specific exports:

```bash
agentforge build --platform=mcp
agentforge build --platform=claude-skills
agentforge build --platform=all
```

---

## Migration Guide

### From MCP Server to AgentFoundry Skill

1. Create `skill.yaml` with metadata
2. Move MCP server code to `src/tools/`
3. Add tests in `tests/`
4. Create README.md
5. Publish: `agentforge publish`

### From Claude Skill to AgentFoundry Skill

1. Convert SKILL.md → `skill.yaml` + README.md
2. Move tool code to `src/tools/`
3. Convert tests (if any)
4. Publish: `agentforge publish`

---

## Skill Templates

Use built-in templates for common patterns:

```bash
# Create from template
agentforge create --template=memory-storage
agentforge create --template=api-wrapper
agentforge create --template=data-processing
agentforge create --template=reasoning
agentforge create --template=integration

# List available templates
agentforge templates list
```

---

## Community Guidelines

### Naming Conventions

- **Skill names**: lowercase, hyphens (`memory-skill`, not `MemorySkill`)
- **Tool names**: snake_case (`store_memory`, not `storeMemory`)
- **File names**: kebab-case (`store-memory.ts`, not `StoreMemory.ts`)

### Documentation Style

- Use clear, concise language
- Include examples for every tool
- Explain parameters and return values
- Show error handling
- Link to relevant resources

### Code Quality

- TypeScript/Python type hints required
- Linting: ESLint, Ruff
- Formatting: Prettier, Black
- Comments for complex logic
- Error messages should be helpful

---

## Resources

- **Skill Templates**: https://github.com/agentforge/skill-templates
- **Example Skills**: https://github.com/agentforge/example-skills
- **SDK Documentation**: https://docs.agentforge.dev
- **Community Forum**: https://community.agentforge.dev
- **Discord**: https://discord.gg/agentforge

---

## Changelog

- **v1.0.0** (2025-11): Initial specification
