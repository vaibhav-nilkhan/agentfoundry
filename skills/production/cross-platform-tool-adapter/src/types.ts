import { z } from 'zod';

/**
 * Supported LLM platforms
 */
export enum Platform {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  BEDROCK = 'bedrock',
  COHERE = 'cohere',
  OLLAMA = 'ollama',
  DEEPSEEK = 'deepseek',
  GROQ = 'groq',
}

/**
 * OpenAI-style tool definition (our standard format)
 */
export const OpenAIToolSchema = z.object({
  type: z.literal('function'),
  function: z.object({
    name: z.string(),
    description: z.string().optional(),
    parameters: z.object({
      type: z.literal('object'),
      properties: z.record(z.any()),
      required: z.array(z.string()).optional(),
    }),
  }),
});

export type OpenAITool = z.infer<typeof OpenAIToolSchema>;

/**
 * Anthropic-style tool definition
 */
export interface AnthropicTool {
  name: string;
  description?: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Bedrock-style tool definition
 */
export interface BedrockTool {
  toolSpec: {
    name: string;
    description?: string;
    inputSchema: {
      json: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
      };
    };
  };
}

/**
 * Cohere-style tool definition
 */
export interface CohereTool {
  name: string;
  description?: string;
  parameter_definitions: Record<string, {
    description?: string;
    type: string;
    required?: boolean;
  }>;
}

/**
 * Tool choice options
 */
export type ToolChoice =
  | 'auto'
  | 'none'
  | 'required'
  | 'any'
  | { type: 'function'; function: { name: string } };

/**
 * Platform-specific tool choice
 */
export interface PlatformToolChoice {
  openai: ToolChoice;
  anthropic: { type: 'auto' | 'any' | 'tool'; name?: string } | null;
  bedrock: { auto?: {} } | { any?: {} } | { tool?: { name: string } } | null;
  cohere: 'auto' | 'required' | null;
  ollama: null; // Ollama doesn't support tool_choice
}

/**
 * Translation result
 */
export interface TranslationResult<T = any> {
  success: boolean;
  platform: Platform;
  tools: T[];
  tool_choice?: any;
  warnings?: string[];
  errors?: string[];
  fallback_applied?: boolean;
}

/**
 * Adapter configuration
 */
export interface AdapterConfig {
  target_platform: Platform;
  strict_mode?: boolean; // Throw on unsupported features vs. fallback
  enable_legacy_migration?: boolean; // Auto-migrate function_call → tool_calls
  validate_schemas?: boolean; // Pre-flight validation
}

/**
 * Platform capabilities
 */
export interface PlatformCapabilities {
  supports_tool_choice: boolean;
  supports_structured_output: boolean;
  supports_array_content: boolean;
  supports_parallel_tools: boolean;
  max_tools?: number;
  parameter_format: 'openai' | 'anthropic' | 'bedrock' | 'cohere' | 'custom';
}
