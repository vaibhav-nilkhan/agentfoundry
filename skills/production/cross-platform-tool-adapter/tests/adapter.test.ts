import { CrossPlatformToolAdapter, adaptTools } from '../src/adapter';
import { Platform, OpenAITool } from '../src/types';

describe('CrossPlatformToolAdapter', () => {
  // Sample OpenAI tool for testing
  const sampleTool: OpenAITool = {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get the current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
          },
        },
        required: ['location'],
      },
    },
  };

  describe('Issue #33855: tool_choice incompatible with Bedrock', () => {
    it('should translate tool_choice="any" to Bedrock format', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.BEDROCK,
      });

      const result = adapter.translateTools([sampleTool], 'any');

      expect(result.success).toBe(true);
      // Bedrock doesn't support 'any', should fallback to 'auto'
      expect(result.tool_choice).toEqual({ auto: {} });
      expect(result.fallback_applied).toBe(false);
    });

    it('should translate specific tool choice to Bedrock format', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.BEDROCK,
      });

      const result = adapter.translateTools([sampleTool], {
        type: 'function',
        function: { name: 'get_weather' },
      });

      expect(result.success).toBe(true);
      expect(result.tool_choice).toEqual({
        tool: { name: 'get_weather' },
      });
    });
  });

  describe('Issue #19212: Anthropic tool parameters missing', () => {
    it('should translate to Anthropic format with all parameters', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.ANTHROPIC,
      });

      const result = adapter.translateTools([sampleTool]);

      expect(result.success).toBe(true);
      expect(result.tools).toHaveLength(1);

      const anthropicTool = result.tools[0] as any;
      expect(anthropicTool.name).toBe('get_weather');
      expect(anthropicTool.description).toBe('Get the current weather for a location');
      expect(anthropicTool.input_schema).toEqual({
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
          },
        },
        required: ['location'],
      });
    });

    it('should translate tool_choice to Anthropic format', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.ANTHROPIC,
      });

      const result = adapter.translateTools([sampleTool], 'any');

      expect(result.success).toBe(true);
      expect(result.tool_choice).toEqual({ type: 'any' });
    });
  });

  describe('Issue #33965: ToolMessage array content not supported on Anthropic', () => {
    it('should warn about array content limitation', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.ANTHROPIC,
      });

      const result = adapter.translateTools([sampleTool]);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain(
        'Anthropic does not support array content in ToolMessage (Issue #33965)'
      );
    });
  });

  describe('Issue #29410: Ollama structured output not honoured', () => {
    it('should translate to Ollama format with structured output warning', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.OLLAMA,
      });

      const result = adapter.translateTools([sampleTool]);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain(
        'Ollama does not support native structured output (Issue #29410). Fallback to JSON parsing recommended.'
      );
      expect(result.fallback_applied).toBe(true);
    });

    it('should warn about max tools limit', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.OLLAMA,
      });

      const manyTools = Array(20)
        .fill(null)
        .map((_, i) => ({
          ...sampleTool,
          function: { ...sampleTool.function, name: `tool_${i}` },
        }));

      const result = adapter.translateTools(manyTools);

      expect(result.success).toBe(true);
      expect(result.warnings?.some((w) => w.includes('practical limit'))).toBe(true);
    });

    it('should not support tool_choice', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.OLLAMA,
      });

      expect(adapter.isToolChoiceSupported('auto')).toBe(false);
      expect(adapter.isToolChoiceSupported('any')).toBe(false);
    });
  });

  describe('Issue #29282: DeepSeek V3 no structured output', () => {
    it('should warn about missing structured output support', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.DEEPSEEK,
      });

      const result = adapter.translateTools([sampleTool]);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain(
        'DeepSeek V3 does not support structured output (Issue #29282). Fallback to text parsing required.'
      );
      expect(result.fallback_applied).toBe(true);
    });
  });

  describe('Issue #33833: Cohere structured output failures', () => {
    it('should translate to Cohere format', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.COHERE,
      });

      const result = adapter.translateTools([sampleTool]);

      expect(result.success).toBe(true);
      expect(result.tools).toHaveLength(1);

      const cohereTool = result.tools[0] as any;
      expect(cohereTool.name).toBe('get_weather');
      expect(cohereTool.description).toBe('Get the current weather for a location');
      expect(cohereTool.parameter_definitions).toHaveProperty('location');
      expect(cohereTool.parameter_definitions.location.required).toBe(true);
      expect(cohereTool.parameter_definitions.unit.required).toBe(false);
    });

    it('should translate tool_choice to Cohere format', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.COHERE,
      });

      const result = adapter.translateTools([sampleTool], 'any');

      expect(result.success).toBe(true);
      expect(result.tool_choice).toBe('required');
    });
  });

  describe('Cross-platform compatibility', () => {
    it('should work with OpenAI (pass-through)', () => {
      const result = adaptTools([sampleTool], Platform.OPENAI);

      expect(result.success).toBe(true);
      expect(result.tools).toEqual([sampleTool]);
    });

    it('should work with Groq (OpenAI-compatible)', () => {
      const result = adaptTools([sampleTool], Platform.GROQ, 'auto');

      expect(result.success).toBe(true);
      expect(result.tools).toEqual([sampleTool]);
      expect(result.tool_choice).toBe('auto');
    });

    it('should handle validation errors in strict mode', () => {
      const invalidTool = {
        type: 'function',
        function: {
          // Missing 'name'
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      } as any;

      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.OPENAI,
        strict_mode: true,
        validate_schemas: true,
      });

      const result = adapter.translateTools([invalidTool]);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing function.name');
    });

    it('should warn about validation errors in non-strict mode', () => {
      const invalidTool = {
        type: 'function',
        function: {
          name: 'test',
          parameters: {
            type: 'array', // Should be 'object'
            properties: {},
          },
        },
      } as any;

      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.OPENAI,
        strict_mode: false,
        validate_schemas: true,
      });

      const result = adapter.translateTools([invalidTool]);

      expect(result.success).toBe(true);
      expect(result.warnings?.length).toBeGreaterThan(0);
    });
  });

  describe('Auto-detection', () => {
    it('should detect Anthropic from model name', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.OPENAI, // Will be overridden
      });

      const result = adapter.autoTranslate([sampleTool], undefined, {
        model: 'claude-3-opus-20240229',
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe(Platform.ANTHROPIC);
    });

    it('should detect OpenAI from model name', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.ANTHROPIC, // Will be overridden
      });

      const result = adapter.autoTranslate([sampleTool], undefined, {
        model: 'gpt-4-turbo',
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe(Platform.OPENAI);
    });

    it('should detect Cohere from model name', () => {
      const adapter = new CrossPlatformToolAdapter({
        target_platform: Platform.OPENAI,
      });

      const result = adapter.autoTranslate([sampleTool], undefined, {
        model: 'command-r-plus',
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe(Platform.COHERE);
    });
  });
});
