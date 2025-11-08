/**
 * Skill templates for the init command
 */

interface TemplateData {
  name: string;
  description: string;
  author: string;
}

interface Template {
  generate: (data: TemplateData) => string;
}

const basicTemplate: Template = {
  generate: (data) => `# ${data.name}

**Version**: 1.0.0
**Author**: ${data.author}

## Description

${data.description}

## Permissions

- network.http

## Functions

### exampleFunction

Example function that demonstrates Skill capabilities

**Parameters:**

- \`input\` (string, required): Input parameter description

**Returns:**

- \`output\` (string): Output description
`,
};

const mcpTemplate: Template = {
  generate: (data) => `# ${data.name}

**Version**: 1.0.0
**Author**: ${data.author}
**Platform**: MCP

## Description

${data.description}

This is an MCP (Model Context Protocol) server implementation.

## Permissions

- network.http
- file.read

## Tools

### exampleTool

Example MCP tool

**Input Schema:**

\`\`\`json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Query parameter"
    }
  },
  "required": ["query"]
}
\`\`\`
`,
};

const claudeTemplate: Template = {
  generate: (data) => `# ${data.name}

**Version**: 1.0.0
**Author**: ${data.author}
**Platform**: Claude Skills

## Description

${data.description}

Optimized for Anthropic Claude AI assistant.

## Permissions

- network.http

## Claude Tools

### exampleClaudeTool

Example Claude-compatible tool

**Input Schema:**

- \`parameter\` (string, required): Parameter description
`,
};

const templates: Record<string, Template> = {
  basic: basicTemplate,
  mcp: mcpTemplate,
  claude: claudeTemplate,
};

export function getTemplate(name: string): Template {
  return templates[name] || basicTemplate;
}
