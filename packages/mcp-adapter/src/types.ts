/**
 * AgentFoundry Skill Types
 * Type definitions for Skills and their components
 */

export interface SkillMetadata {
  name: string;
  version: string;
  description: string;
  author?: {
    name: string;
    email?: string;
    github?: string;
  };
  license?: string;
  repository?: string;
  platforms?: string[];
  permissions?: string[];
}

export interface ToolInputSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  execute: (input: any) => Promise<any>;
}

export interface AgentForgeSkill {
  metadata: SkillMetadata;
  tools: Tool[];
  [key: string]: any;
}

export interface MCPServerConfig {
  name: string;
  version: string;
  tools: Array<{
    name: string;
    description: string;
    inputSchema: ToolInputSchema;
  }>;
}
