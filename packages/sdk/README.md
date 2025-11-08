# @agentfoundry/sdk

TypeScript SDK for building portable AI Skills for AgentFoundry.

## Installation

```bash
npm install @agentfoundry/sdk
```

## Quick Start

```typescript
import { SkillBuilder, Platform, PricingType } from '@agentfoundry/sdk';

const skill = new SkillBuilder()
  .name('Weather Forecast')
  .version('1.0.0')
  .description('Get weather forecasts for any location')
  .author('Your Name')
  .platforms(Platform.CLAUDE_SKILLS, Platform.MCP)
  .permissions('network.http', 'location.read')
  .categorize('Utilities', ['weather', 'forecast'])
  .pricing(PricingType.FREE)
  .addFunction({
    name: 'getWeather',
    description: 'Get current weather for a location',
    parameters: [
      {
        name: 'location',
        type: 'string',
        description: 'City name or coordinates',
        required: true,
      },
    ],
    execute: async (params) => {
      // Your implementation
      return { temperature: 72, condition: 'sunny' };
    },
  })
  .build();

// Export to .claudeskill.md format
const markdown = new SkillBuilder().toClaudeSkill();
```

## Features

- **Fluent API**: Easy-to-use builder pattern
- **Cross-platform**: Target Claude, GPT, and MCP with one codebase
- **Type-safe**: Full TypeScript support
- **Validation**: Built-in manifest validation

## Platform Adapters

Convert your Skill to platform-specific formats:

```typescript
import { ClaudeAdapter, GPTAdapter, MCPAdapter } from '@agentfoundry/sdk';

// Convert to Claude Skills format
const claudeFormat = new ClaudeAdapter().convert(skill);

// Convert to GPT Actions (OpenAPI)
const gptFormat = new GPTAdapter().convert(skill);

// Convert to MCP format
const mcpFormat = new MCPAdapter().convert(skill);
```
