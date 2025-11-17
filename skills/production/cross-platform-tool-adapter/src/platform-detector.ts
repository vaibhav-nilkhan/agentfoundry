import { Platform, PlatformCapabilities } from './types';

/**
 * Platform capabilities map
 */
export const PLATFORM_CAPABILITIES: Record<Platform, PlatformCapabilities> = {
  [Platform.OPENAI]: {
    supports_tool_choice: true,
    supports_structured_output: true,
    supports_array_content: true,
    supports_parallel_tools: true,
    parameter_format: 'openai',
  },
  [Platform.ANTHROPIC]: {
    supports_tool_choice: true,
    supports_structured_output: true,
    supports_array_content: false, // Issue #33965
    supports_parallel_tools: true,
    parameter_format: 'anthropic',
  },
  [Platform.BEDROCK]: {
    supports_tool_choice: false, // Limited support
    supports_structured_output: true,
    supports_array_content: true,
    supports_parallel_tools: true,
    parameter_format: 'bedrock',
  },
  [Platform.COHERE]: {
    supports_tool_choice: true,
    supports_structured_output: false, // Issue #33833
    supports_array_content: true,
    supports_parallel_tools: true,
    parameter_format: 'cohere',
  },
  [Platform.OLLAMA]: {
    supports_tool_choice: false,
    supports_structured_output: false, // Issue #29410
    supports_array_content: true,
    supports_parallel_tools: true,
    max_tools: 16, // Practical limit
    parameter_format: 'openai', // Uses OpenAI-compatible format
  },
  [Platform.DEEPSEEK]: {
    supports_tool_choice: false,
    supports_structured_output: false, // Issue #29282
    supports_array_content: true,
    supports_parallel_tools: false,
    parameter_format: 'openai',
  },
  [Platform.GROQ]: {
    supports_tool_choice: true,
    supports_structured_output: true,
    supports_array_content: true,
    supports_parallel_tools: true,
    parameter_format: 'openai',
  },
};

/**
 * Detect platform from model name or API config
 */
export function detectPlatform(input: {
  model?: string;
  api_base?: string;
  provider?: string;
}): Platform {
  const { model = '', api_base = '', provider = '' } = input;

  // Check provider explicitly set
  if (provider) {
    const platformKey = provider.toUpperCase() as keyof typeof Platform;
    if (Platform[platformKey]) {
      return Platform[platformKey];
    }
  }

  // Detect from model name
  if (model.includes('claude')) return Platform.ANTHROPIC;
  if (model.includes('gpt') || model.includes('o1')) return Platform.OPENAI;
  if (model.includes('bedrock')) return Platform.BEDROCK;
  if (model.includes('command')) return Platform.COHERE;
  if (model.includes('deepseek')) return Platform.DEEPSEEK;
  if (model.includes('llama') || model.includes('mistral') || model.includes('mixtral')) {
    return Platform.OLLAMA;
  }
  if (model.includes('groq')) return Platform.GROQ;

  // Detect from API base URL
  if (api_base.includes('anthropic.com')) return Platform.ANTHROPIC;
  if (api_base.includes('openai.com')) return Platform.OPENAI;
  if (api_base.includes('bedrock')) return Platform.BEDROCK;
  if (api_base.includes('cohere.com')) return Platform.COHERE;
  if (api_base.includes('ollama')) return Platform.OLLAMA;
  if (api_base.includes('deepseek.com')) return Platform.DEEPSEEK;
  if (api_base.includes('groq.com')) return Platform.GROQ;

  // Default to OpenAI (most common)
  return Platform.OPENAI;
}

/**
 * Get capabilities for a platform
 */
export function getPlatformCapabilities(platform: Platform): PlatformCapabilities {
  return PLATFORM_CAPABILITIES[platform];
}

/**
 * Check if a feature is supported on a platform
 */
export function isFeatureSupported(
  platform: Platform,
  feature: keyof PlatformCapabilities
): boolean {
  const capabilities = getPlatformCapabilities(platform);
  const value = capabilities[feature];
  return typeof value === 'boolean' ? value : value !== undefined;
}
