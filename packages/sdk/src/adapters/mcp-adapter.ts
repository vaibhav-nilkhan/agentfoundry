/**
 * MCPAdapter - Converts AgentFoundry Skills to MCP (Model Context Protocol) format
 */
import { Skill } from '../types';

export class MCPAdapter {
  /**
   * Convert a Skill to MCP server format
   */
  convert(skill: Skill): object {
    const { manifest, functions } = skill;

    // MCP format based on the MCP specification
    return {
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      tools: functions.map((fn) => ({
        name: fn.name,
        description: fn.description,
        inputSchema: {
          type: 'object',
          properties: fn.parameters.reduce(
            (acc, param) => {
              acc[param.name] = {
                type: param.type,
                description: param.description,
                ...(param.default !== undefined && { default: param.default }),
              };
              return acc;
            },
            {} as Record<string, any>
          ),
          required: fn.parameters.filter((p) => p.required).map((p) => p.name),
        },
      })),
    };
  }

  /**
   * Generate MCP server implementation code
   */
  generateServerCode(skill: Skill): string {
    const { manifest, functions } = skill;

    let code = `// MCP Server for ${manifest.name}\n`;
    code += `import { Server } from '@modelcontextprotocol/sdk/server/index.js';\n`;
    code += `import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';\n\n`;

    code += `const server = new Server(\n`;
    code += `  {\n`;
    code += `    name: "${manifest.name}",\n`;
    code += `    version: "${manifest.version}",\n`;
    code += `  },\n`;
    code += `  {\n`;
    code += `    capabilities: {\n`;
    code += `      tools: {},\n`;
    code += `    },\n`;
    code += `  }\n`;
    code += `);\n\n`;

    // Add tool handlers
    functions.forEach((fn) => {
      code += `server.setRequestHandler('tools/call', async (request) => {\n`;
      code += `  if (request.params.name === '${fn.name}') {\n`;
      code += `    // TODO: Implement ${fn.name}\n`;
      code += `    return { content: [{ type: 'text', text: 'Not implemented' }] };\n`;
      code += `  }\n`;
      code += `});\n\n`;
    });

    code += `// Start server\n`;
    code += `const transport = new StdioServerTransport();\n`;
    code += `await server.connect(transport);\n`;

    return code;
  }
}
