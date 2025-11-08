/**
 * Shared type definitions across AgentFoundry packages
 */

export enum SkillStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEPRECATED = 'DEPRECATED',
}

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

export enum ValidationType {
  STATIC_ANALYSIS = 'STATIC_ANALYSIS',
  PERMISSION_SCAN = 'PERMISSION_SCAN',
  SECURITY_AUDIT = 'SECURITY_AUDIT',
  BEHAVIOR_TEST = 'BEHAVIOR_TEST',
  LLM_VALIDATION = 'LLM_VALIDATION',
}

export enum ValidationStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  WARNING = 'WARNING',
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
