# AgentFoundry MCP Integration - Implementation Guide

## Overview
This guide shows how to integrate Model Context Protocol (MCP) with AgentFoundry, enabling Skills to work as MCP servers.

---

## Phase 1: MCP Server Generator (Days 1-3)

### Goal
Convert AgentFoundry Skills → MCP servers automatically

### Implementation

#### 1. Install MCP SDK

```bash
npm install @modelcontextprotocol/sdk
```

#### 2. Create MCP Generator (`packages/mcp-adapter/src/generator.ts`)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { AgentForgeSkill } from '@agentforge/sdk';

export class MCPServerGenerator {
  /**
   * Generate MCP server from AgentFoundry Skill
   */
  static async generate(skill: AgentForgeSkill): Promise<Server> {
    const server = new Server(
      {
        name: skill.metadata.name,
        version: skill.metadata.version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Register list_tools handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: skill.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // Register call_tool handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Find tool
      const tool = skill.tools.find(t => t.name === name);
      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }

      // Execute tool
      try {
        const result = await tool.execute(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });

    return server;
  }

  /**
   * Start MCP server (stdio transport)
   */
  static async start(skill: AgentForgeSkill): Promise<void> {
    const server = await this.generate(skill);
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error(`MCP Server started: ${skill.metadata.name}`);
  }
}
```

#### 3. CLI Command to Run as MCP Server

```typescript
// packages/cli/src/commands/mcp.ts

import { Command } from 'commander';
import { loadSkill } from '@agentforge/sdk';
import { MCPServerGenerator } from '@agentforge/mcp-adapter';

export const mcpCommand = new Command('mcp')
  .description('Run skill as MCP server')
  .argument('<skill-path>', 'Path to skill directory')
  .action(async (skillPath: string) => {
    try {
      // Load skill
      const skill = await loadSkill(skillPath);

      // Start MCP server
      await MCPServerGenerator.start(skill);
    } catch (error) {
      console.error('Error starting MCP server:', error.message);
      process.exit(1);
    }
  });
```

#### 4. Usage

```bash
# Run skill as MCP server
agentforge mcp ./my-skill

# In Claude Desktop config (~/Library/Application Support/Claude/claude_desktop_config.json)
{
  "mcpServers": {
    "my-skill": {
      "command": "agentforge",
      "args": ["mcp", "/path/to/my-skill"]
    }
  }
}
```

---

## Phase 2: Publish to GitHub MCP Registry (Days 4-5)

### Goal
Auto-publish AgentFoundry Skills to GitHub MCP Registry

### Implementation

#### 1. Generate mcp.json

```typescript
// packages/mcp-adapter/src/registry.ts

export interface MCPRegistryEntry {
  name: string;
  description: string;
  version: string;
  homepage?: string;
  sourceUrl?: string;
  run: {
    command: string;
    args: string[];
  };
}

export function generateMCPRegistryEntry(skill: AgentForgeSkill): MCPRegistryEntry {
  return {
    name: skill.metadata.name,
    description: skill.metadata.description,
    version: skill.metadata.version,
    homepage: skill.metadata.repository,
    sourceUrl: skill.metadata.repository,
    run: {
      command: 'npx',
      args: [`@agentforge/${skill.metadata.name}`],
    },
  };
}
```

#### 2. CLI Command to Publish

```typescript
// packages/cli/src/commands/publish.ts

export const publishCommand = new Command('publish')
  .description('Publish skill to registries')
  .option('--registry <name>', 'Specific registry (mcp, all)', 'all')
  .action(async (options) => {
    const skill = await loadSkill('.');

    if (options.registry === 'mcp' || options.registry === 'all') {
      // Generate mcp.json
      const entry = generateMCPRegistryEntry(skill);
      await fs.writeFile('mcp.json', JSON.stringify(entry, null, 2));

      console.log('✓ Generated mcp.json');
      console.log('→ Submit PR to: https://github.com/modelcontextprotocol/registry');
    }
  });
```

---

## Phase 3: MCP Client (Days 6-7)

### Goal
Allow AgentFoundry platform to USE MCP servers (not just publish them)

### Implementation

```typescript
// packages/sdk/src/mcp-client.ts

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class MCPClient {
  private client: Client;

  async connect(command: string, args: string[]): Promise<void> {
    this.client = new Client(
      {
        name: 'agentforge-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    const transport = new StdioClientTransport({
      command,
      args,
    });

    await this.client.connect(transport);
  }

  async listTools(): Promise<Tool[]> {
    const response = await this.client.request(
      { method: 'tools/list' },
      ListToolsResultSchema
    );
    return response.tools;
  }

  async callTool(name: string, args: any): Promise<any> {
    const response = await this.client.request(
      {
        method: 'tools/call',
        params: { name, arguments: args },
      },
      CallToolResultSchema
    );
    return response;
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}
```

---

## Testing Your MCP Integration

### 1. Create Test Skill

```bash
agentforge create test-skill --template=basic
cd test-skill
```

### 2. Run as MCP Server

```bash
agentforge mcp .
```

### 3. Test with Claude Desktop

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "test-skill": {
      "command": "agentforge",
      "args": ["mcp", "/path/to/test-skill"]
    }
  }
}
```

Restart Claude Desktop and verify tool appears.

### 4. Automated Test

```typescript
import { MCPClient } from '@agentforge/sdk';

describe('MCP Integration', () => {
  it('should connect to MCP server', async () => {
    const client = new MCPClient();
    await client.connect('agentforge', ['mcp', './test-skill']);

    const tools = await client.listTools();
    expect(tools.length).toBeGreaterThan(0);

    await client.disconnect();
  });

  it('should call tool via MCP', async () => {
    const client = new MCPClient();
    await client.connect('agentforge', ['mcp', './test-skill']);

    const result = await client.callTool('my_tool', { input: 'test' });
    expect(result).toBeDefined();

    await client.disconnect();
  });
});
```

---

## Minimum Viable MCP Support Checklist

Week 1 (MCP Server):
- [ ] MCP SDK installed
- [ ] MCPServerGenerator class implemented
- [ ] `agentforge mcp` command works
- [ ] Test skill runs as MCP server
- [ ] Claude Desktop can call skill

Week 2 (Registry + Client):
- [ ] Generate mcp.json for publishing
- [ ] Document how to submit to GitHub MCP Registry
- [ ] MCP Client implementation (optional - defer if needed)
- [ ] Integration tests passing
- [ ] Documentation updated

---

## Resources

- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **MCP SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **GitHub MCP Registry**: https://github.com/modelcontextprotocol/registry
- **Claude Desktop MCP Guide**: https://modelcontextprotocol.io/quickstart/user

---

## Common Issues

### Issue: "Module not found @modelcontextprotocol/sdk"
**Solution**: Install MCP SDK: `npm install @modelcontextprotocol/sdk`

### Issue: "Transport error" when starting server
**Solution**: Check that stdio transport is working. Test with: `echo '{"method":"tools/list"}' | agentforge mcp ./skill`

### Issue: Claude Desktop not detecting server
**Solution**:
1. Check `claude_desktop_config.json` syntax
2. Restart Claude Desktop completely
3. Check logs: `~/Library/Logs/Claude/mcp*.log`

### Issue: Tool execution fails
**Solution**: Add detailed error handling in CallToolRequestSchema handler. Log errors to stderr (not stdout, which is used by MCP protocol).
