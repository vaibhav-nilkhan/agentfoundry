import {
  Platform,
  OpenAITool,
  ToolChoice,
  TranslationResult,
  AdapterConfig,
  OpenAIToolSchema,
} from './types';
import { detectPlatform, getPlatformCapabilities } from './platform-detector';
import {
  translateToAnthropic,
  translateToBedrock,
  translateToCohere,
  translateToOllama,
  translateToolChoice,
  validateToolSchema,
} from './translators';

/**
 * Cross-Platform Tool Adapter
 *
 * Automatically translates tool definitions from OpenAI format to any supported platform.
 *
 * Solves 8 GitHub Issues:
 * - langchain#33855: tool_choice='any' incompatible with Bedrock
 * - langchain#28848: bind_tools not callable after with_structured_output
 * - langchain#29410: ChatOllama structured output not honoured
 * - langchain#29282: DeepSeek V3 no structured output support
 * - langchain#33965: ToolMessage content arrays not supported
 * - langchain#32492: GPT-5 verbosity + structured output conflict
 * - llama-index#19212: Anthropic tool parameters missing
 * - langchain#33970: Deprecated function_call usage
 *
 * @example
 * ```typescript
 * const adapter = new CrossPlatformToolAdapter({
 *   target_platform: Platform.ANTHROPIC,
 * });
 *
 * const result = adapter.translateTools(openAITools, 'auto');
 * console.log(result.tools); // Anthropic-formatted tools
 * ```
 */
export class CrossPlatformToolAdapter {
  private config: Required<AdapterConfig>;

  constructor(config: AdapterConfig) {
    this.config = {
      strict_mode: false,
      enable_legacy_migration: true,
      validate_schemas: true,
      ...config,
    };
  }

  /**
   * Translate tools from OpenAI format to target platform
   */
  translateTools<T = any>(
    tools: OpenAITool[],
    toolChoice?: ToolChoice
  ): TranslationResult<T> {
    const result: TranslationResult<T> = {
      success: true,
      platform: this.config.target_platform,
      tools: [],
      warnings: [],
      errors: [],
      fallback_applied: false,
    };

    const capabilities = getPlatformCapabilities(this.config.target_platform);

    // Validate schemas if enabled
    if (this.config.validate_schemas) {
      for (const tool of tools) {
        const validation = validateToolSchema(tool);
        if (!validation.valid) {
          if (this.config.strict_mode) {
            result.success = false;
            result.errors?.push(...validation.errors);
            return result;
          } else {
            result.warnings?.push(
              `Tool "${tool.function.name}" has validation errors: ${validation.errors.join(', ')}`
            );
          }
        }
      }
    }

    // Translate tools based on platform
    try {
      switch (this.config.target_platform) {
        case Platform.OPENAI:
        case Platform.GROQ:
          result.tools = tools as any;
          break;

        case Platform.ANTHROPIC:
          result.tools = tools.map(translateToAnthropic) as any;
          if (capabilities.supports_array_content === false) {
            result.warnings?.push(
              'Anthropic does not support array content in ToolMessage (Issue #33965)'
            );
          }
          break;

        case Platform.BEDROCK:
          result.tools = tools.map(translateToBedrock) as any;
          break;

        case Platform.COHERE:
          result.tools = tools.map(translateToCohere) as any;
          if (!capabilities.supports_structured_output) {
            result.warnings?.push(
              'Cohere has limited structured output support (Issue #33833). Consider using Structured_Output_Fallback_v1 skill.'
            );
            result.fallback_applied = true;
          }
          break;

        case Platform.OLLAMA:
          result.tools = tools.map(translateToOllama) as any;
          if (!capabilities.supports_structured_output) {
            result.warnings?.push(
              'Ollama does not support native structured output (Issue #29410). Fallback to JSON parsing recommended.'
            );
            result.fallback_applied = true;
          }
          if (capabilities.max_tools && tools.length > capabilities.max_tools) {
            result.warnings?.push(
              `Ollama has a practical limit of ${capabilities.max_tools} tools. You provided ${tools.length}.`
            );
          }
          break;

        case Platform.DEEPSEEK:
          result.tools = tools as any; // Uses OpenAI format
          if (!capabilities.supports_structured_output) {
            result.warnings?.push(
              'DeepSeek V3 does not support structured output (Issue #29282). Fallback to text parsing required.'
            );
            result.fallback_applied = true;
          }
          break;

        default:
          result.success = false;
          result.errors?.push(`Unsupported platform: ${this.config.target_platform}`);
          return result;
      }
    } catch (error) {
      result.success = false;
      result.errors?.push(
        `Translation failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return result;
    }

    // Translate tool_choice if provided
    if (toolChoice) {
      const translatedChoice = translateToolChoice(toolChoice, this.config.target_platform);

      if (translatedChoice === null && toolChoice !== 'none') {
        if (!capabilities.supports_tool_choice) {
          result.warnings?.push(
            `Platform ${this.config.target_platform} does not support tool_choice. Ignoring.`
          );
        } else {
          result.warnings?.push(
            `tool_choice "${String(toolChoice)}" not supported on ${this.config.target_platform}. Using default behavior.`
          );
        }
        result.fallback_applied = true;
      } else {
        result.tool_choice = translatedChoice;
      }
    }

    return result;
  }

  /**
   * Auto-detect platform and translate tools
   */
  autoTranslate<T = any>(
    tools: OpenAITool[],
    toolChoice: ToolChoice | undefined,
    detectionHint: {
      model?: string;
      api_base?: string;
      provider?: string;
    }
  ): TranslationResult<T> {
    const detectedPlatform = detectPlatform(detectionHint);

    // Update config with detected platform
    this.config.target_platform = detectedPlatform;

    return this.translateTools<T>(tools, toolChoice);
  }

  /**
   * Get platform capabilities
   */
  getCapabilities() {
    return getPlatformCapabilities(this.config.target_platform);
  }

  /**
   * Check if a specific tool_choice is supported
   */
  isToolChoiceSupported(toolChoice: ToolChoice): boolean {
    const capabilities = this.getCapabilities();

    if (!capabilities.supports_tool_choice) {
      return false;
    }

    // Platform-specific checks
    if (this.config.target_platform === Platform.BEDROCK && toolChoice === 'any') {
      return false; // Bedrock doesn't support 'any'
    }

    if (
      (this.config.target_platform === Platform.OLLAMA ||
        this.config.target_platform === Platform.DEEPSEEK) &&
      toolChoice !== 'auto'
    ) {
      return false;
    }

    return true;
  }
}

/**
 * Helper function to create adapter and translate in one call
 */
export function adaptTools<T = any>(
  tools: OpenAITool[],
  targetPlatform: Platform,
  toolChoice?: ToolChoice,
  config?: Partial<AdapterConfig>
): TranslationResult<T> {
  const adapter = new CrossPlatformToolAdapter({
    target_platform: targetPlatform,
    ...config,
  });

  return adapter.translateTools<T>(tools, toolChoice);
}
