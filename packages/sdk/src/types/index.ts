/**
 * Core type definitions for AgentFoundry Skills
 */

export enum Platform {
  CLAUDE_SKILLS = 'CLAUDE_SKILLS',
  GPT_ACTIONS = 'GPT_ACTIONS',
  MCP = 'MCP',
  LANGCHAIN = 'LANGCHAIN',
  MISTRAL = 'MISTRAL',
}

export enum PricingType {
  FREE = 'FREE',
  PAID = 'PAID',
  FREEMIUM = 'FREEMIUM',
}

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  platforms: Platform[];
  permissions: string[];
  category?: string;
  tags?: string[];
  pricingType?: PricingType;
  price?: number;
  homepage?: string;
  repository?: string;
  documentation?: string;
}

export interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  default?: any;
}

export interface SkillFunction {
  name: string;
  description: string;
  parameters: SkillParameter[];
  execute: (params: Record<string, any>) => Promise<any>;
}

export interface Skill {
  manifest: SkillManifest;
  functions: SkillFunction[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score?: number;
}
