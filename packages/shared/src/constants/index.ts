/**
 * Shared constants across AgentFoundry
 */

export const SUPPORTED_PLATFORMS = [
  'CLAUDE_SKILLS',
  'GPT_ACTIONS',
  'MCP',
  'LANGCHAIN',
  'MISTRAL',
] as const;

export const SKILL_CATEGORIES = [
  'Productivity',
  'Utilities',
  'Communication',
  'Data Analysis',
  'Development',
  'Entertainment',
  'Education',
  'Business',
  'Finance',
  'Health',
  'Other',
] as const;

export const PERMISSION_TYPES = [
  'network.http',
  'network.websocket',
  'file.read',
  'file.write',
  'email.send',
  'email.read',
  'database.query',
  'database.write',
  'location.read',
  'storage.read',
  'storage.write',
] as const;

export const MAX_SKILL_NAME_LENGTH = 50;
export const MIN_SKILL_DESCRIPTION_LENGTH = 10;
export const MAX_SKILL_DESCRIPTION_LENGTH = 200;
export const MAX_SKILL_LONG_DESCRIPTION_LENGTH = 5000;

export const API_ROUTES = {
  SKILLS: '/api/v1/skills',
  AUTH: '/api/v1/auth',
  VALIDATE: '/api/v1/validate',
  USERS: '/api/v1/users',
} as const;
