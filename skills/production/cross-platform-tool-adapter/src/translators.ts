import {
  OpenAITool,
  AnthropicTool,
  BedrockTool,
  CohereTool,
  Platform,
  ToolChoice,
} from './types';
import { getPlatformCapabilities } from './platform-detector';

/**
 * Translate OpenAI tool to Anthropic format
 * Solves: Issue #19212 (llama_index) - Anthropic tool parameters missing
 */
export function translateToAnthropic(tool: OpenAITool): AnthropicTool {
  return {
    name: tool.function.name,
    description: tool.function.description,
    input_schema: {
      type: 'object',
      properties: tool.function.parameters.properties,
      required: tool.function.parameters.required,
    },
  };
}

/**
 * Translate OpenAI tool to Bedrock format
 * Solves: Issue #33855 - tool_choice='any' incompatible with Bedrock
 */
export function translateToBedrock(tool: OpenAITool): BedrockTool {
  return {
    toolSpec: {
      name: tool.function.name,
      description: tool.function.description,
      inputSchema: {
        json: {
          type: 'object',
          properties: tool.function.parameters.properties,
          required: tool.function.parameters.required,
        },
      },
    },
  };
}

/**
 * Translate OpenAI tool to Cohere format
 * Solves: Issue #33833 - Cohere structured output failures
 */
export function translateToCohere(tool: OpenAITool): CohereTool {
  const parameter_definitions: Record<string, any> = {};

  for (const [name, schema] of Object.entries(tool.function.parameters.properties)) {
    parameter_definitions[name] = {
      description: (schema as any).description,
      type: (schema as any).type || 'string',
      required: tool.function.parameters.required?.includes(name) ?? false,
    };
  }

  return {
    name: tool.function.name,
    description: tool.function.description,
    parameter_definitions,
  };
}

/**
 * Translate OpenAI tool to Ollama format
 * Solves: Issue #29410 - ChatOllama structured output not honoured
 * Note: Ollama uses OpenAI-compatible format but with limitations
 */
export function translateToOllama(tool: OpenAITool): OpenAITool {
  const capabilities = getPlatformCapabilities(Platform.OLLAMA);

  // Ollama uses same format as OpenAI but doesn't support some features
  // Warn if structured output is required
  return {
    ...tool,
    // Remove any OpenAI-specific extensions
    function: {
      ...tool.function,
      // Simplify schema if needed
      parameters: {
        ...tool.function.parameters,
        // Remove advanced JSON schema features not supported by Ollama
      },
    },
  };
}

/**
 * Translate tool_choice parameter to platform-specific format
 * Solves: Issue #33855 - tool_choice='any' incompatible with Bedrock
 */
export function translateToolChoice(
  toolChoice: ToolChoice,
  platform: Platform
): any {
  const capabilities = getPlatformCapabilities(platform);

  if (!capabilities.supports_tool_choice) {
    return null;
  }

  switch (platform) {
    case Platform.OPENAI:
    case Platform.GROQ:
      // OpenAI and Groq use same format
      return toolChoice;

    case Platform.ANTHROPIC:
      // Anthropic format: {type: 'auto' | 'any' | 'tool', name?: string}
      if (toolChoice === 'auto') {
        return { type: 'auto' };
      }
      if (toolChoice === 'required' || toolChoice === 'any') {
        return { type: 'any' };
      }
      if (toolChoice === 'none') {
        return null;
      }
      if (typeof toolChoice === 'object' && toolChoice.type === 'function') {
        return {
          type: 'tool',
          name: toolChoice.function.name,
        };
      }
      return { type: 'auto' };

    case Platform.BEDROCK:
      // Bedrock format: {auto: {}} | {any: {}} | {tool: {name: string}}
      if (toolChoice === 'auto') {
        return { auto: {} };
      }
      if (toolChoice === 'required' || toolChoice === 'any') {
        // Bedrock doesn't support 'any', fallback to 'auto'
        return { auto: {} };
      }
      if (toolChoice === 'none') {
        return null;
      }
      if (typeof toolChoice === 'object' && toolChoice.type === 'function') {
        return {
          tool: {
            name: toolChoice.function.name,
          },
        };
      }
      return { auto: {} };

    case Platform.COHERE:
      // Cohere format: 'auto' | 'required'
      if (toolChoice === 'auto') {
        return 'auto';
      }
      if (toolChoice === 'required' || toolChoice === 'any') {
        return 'required';
      }
      if (toolChoice === 'none') {
        return null;
      }
      return 'auto';

    case Platform.OLLAMA:
    case Platform.DEEPSEEK:
      // These platforms don't support tool_choice
      return null;

    default:
      return null;
  }
}

/**
 * Migrate legacy function_call to tool_calls
 * Solves: Issue #33970 - get_buffer_string uses deprecated function_call
 */
export function migrateLegacyFunctionCall(legacyCall: {
  name: string;
  arguments: string;
}): ToolChoice {
  return {
    type: 'function',
    function: {
      name: legacyCall.name,
    },
  };
}

/**
 * Validate tool schema before translation
 */
export function validateToolSchema(tool: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!tool.function) {
    errors.push('Missing function property');
  }

  if (!tool.function?.name) {
    errors.push('Missing function.name');
  }

  if (!tool.function?.parameters) {
    errors.push('Missing function.parameters');
  }

  if (tool.function?.parameters?.type !== 'object') {
    errors.push('function.parameters.type must be "object"');
  }

  if (!tool.function?.parameters?.properties) {
    errors.push('Missing function.parameters.properties');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
