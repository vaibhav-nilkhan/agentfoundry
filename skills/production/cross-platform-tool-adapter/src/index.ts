/**
 * Cross-Platform Tool Adapter - AgentFoundry Skill v1.0.0
 *
 * Auto-translate tool definitions across OpenAI, Anthropic, Bedrock, Cohere, and Ollama.
 * Write once, run anywhere.
 *
 * Solves 8 real GitHub Issues from frustrated developers:
 * - langchain#33855: tool_choice='any' incompatible with Bedrock
 * - langchain#28848: bind_tools not callable after with_structured_output
 * - langchain#29410: ChatOllama structured output not honoured
 * - langchain#29282: DeepSeek V3 no structured output support
 * - langchain#33965: ToolMessage content arrays not supported on Anthropic
 * - langchain#32492: GPT-5 verbosity parameter conflicts with structured output
 * - llama-index#19212: Anthropic models missing tool calling parameters
 * - langchain#33970: Legacy function_call still in use instead of tool_calls
 *
 * @packageDocumentation
 */

export * from './types';
export * from './platform-detector';
export * from './translators';
export * from './adapter';

// Re-export main classes for convenience
export { CrossPlatformToolAdapter, adaptTools } from './adapter';
export { detectPlatform, getPlatformCapabilities, isFeatureSupported } from './platform-detector';
export { Platform } from './types';
