/**
 * MCP Server Generator
 * Converts AgentFoundry Skills to MCP servers
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { AgentForgeSkill } from './types.js';

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
        tools: skill.tools.map((tool) => ({
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
      const tool = skill.tools.find((t) => t.name === name);
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
      } catch (error: any) {
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

    // Log to stderr (stdout is used by MCP protocol)
    console.error(`MCP Server started: ${skill.metadata.name} v${skill.metadata.version}`);
  }
}
