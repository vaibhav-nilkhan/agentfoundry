import { run as validateToolSchema } from '../src/tools/validate-tool-schema';
import { run as executeWithRetry } from '../src/tools/execute-with-retry';
import { run as verifyOutput } from '../src/tools/verify-output';
import { run as convertToolFormat } from '../src/tools/convert-tool-format';

describe('Tool Calling Wrapper', () => {
  describe('validate_tool_schema', () => {
    it('should validate valid input against JSON schema', async () => {
      const result = await validateToolSchema({
        tool_name: 'test_tool',
        tool_input: {
          name: 'John',
          age: 30,
        },
        schema: {
          type: 'json_schema',
          definition: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
            required: ['name', 'age'],
          },
        },
      });

      expect(result.is_valid).toBe(true);
      expect(result.validation_errors).toHaveLength(0);
      expect(result.metadata.schema_type).toBe('json_schema');
    });

    it('should detect validation errors in invalid input', async () => {
      const result = await validateToolSchema({
        tool_name: 'test_tool',
        tool_input: {
          name: 'John',
          age: 'thirty', // Wrong type
        },
        schema: {
          type: 'json_schema',
          definition: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' },
            },
            required: ['name', 'age'],
          },
        },
      });

      expect(result.is_valid).toBe(false);
      expect(result.validation_errors.length).toBeGreaterThan(0);
      expect(result.suggested_fixes.length).toBeGreaterThan(0);
    });

    it('should provide suggested fixes for type errors', async () => {
      const result = await validateToolSchema({
        tool_name: 'test_tool',
        tool_input: {
          count: '42', // String instead of number
        },
        schema: {
          type: 'json_schema',
          definition: {
            type: 'object',
            properties: {
              count: { type: 'number' },
            },
          },
        },
      });

      expect(result.suggested_fixes.length).toBeGreaterThan(0);
      expect(result.suggested_fixes[0].field).toContain('count');
    });
  });

  describe('execute_with_retry', () => {
    it('should execute tool successfully on first attempt', async () => {
      const result = await executeWithRetry({
        tool_name: 'test_tool',
        tool_input: { param: 'value' },
        executor: {
          framework: 'custom',
          tool_function: 'mockFunction',
        },
        retry_config: {
          max_attempts: 3,
        },
      });

      expect(result.success).toBe(true);
      expect(result.attempts_made).toBe(1);
      expect(result.execution_log).toHaveLength(1);
      expect(result.execution_log[0].status).toBe('success');
    });

    it('should respect retry configuration', async () => {
      const result = await executeWithRetry({
        tool_name: 'test_tool',
        tool_input: {},
        executor: {
          framework: 'custom',
          tool_function: 'test',
        },
        retry_config: {
          max_attempts: 5,
          backoff_strategy: 'exponential',
          initial_delay_ms: 100,
          max_delay_ms: 5000,
        },
      });

      expect(result.attempts_made).toBeLessThanOrEqual(5);
    });
  });

  describe('verify_output', () => {
    it('should verify valid output against schema', async () => {
      const result = await verifyOutput({
        tool_name: 'test_tool',
        tool_output: {
          status: 'success',
          data: { id: 123, name: 'Test' },
        },
        expected_schema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            data: { type: 'object' },
          },
          required: ['status', 'data'],
        },
      });

      expect(result.is_valid).toBe(true);
      expect(result.verification_errors).toHaveLength(0);
      expect(result.confidence_score).toBe(100);
    });

    it('should detect invalid output', async () => {
      const result = await verifyOutput({
        tool_name: 'test_tool',
        tool_output: {
          status: 123, // Wrong type
        },
        expected_schema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
          },
        },
      });

      expect(result.is_valid).toBe(false);
      expect(result.verification_errors.length).toBeGreaterThan(0);
    });

    it('should apply custom verification rules', async () => {
      const result = await verifyOutput({
        tool_name: 'test_tool',
        tool_output: {
          score: 150, // Out of range
        },
        expected_schema: {
          type: 'object',
          properties: {
            score: { type: 'number' },
          },
        },
        verification_rules: [
          {
            rule_type: 'range_check' as const,
            field: 'score',
            constraint: { min: 0, max: 100 },
          },
        ],
      });

      expect(result.is_valid).toBe(false);
      expect(result.verification_errors.some((e: any) => e.field === 'score')).toBe(true);
    });
  });

  describe('convert_tool_format', () => {
    it('should convert from LangChain to OpenAI format', async () => {
      const result = await convertToolFormat({
        tool_definition: {
          name: 'test_tool',
          description: 'A test tool',
          args_schema: {
            type: 'object',
            properties: {
              input: { type: 'string' },
            },
          },
        },
        source_framework: 'langchain',
        target_framework: 'openai',
      });

      expect(result.converted_definition).toBeDefined();
      expect(result.converted_definition.type).toBe('function');
      expect(result.converted_definition.function).toBeDefined();
      expect(result.converted_definition.function.name).toBe('test_tool');
      expect(result.compatibility_score).toBeGreaterThan(0);
    });

    it('should convert from OpenAI to Claude format', async () => {
      const result = await convertToolFormat({
        tool_definition: {
          type: 'function',
          function: {
            name: 'test_tool',
            description: 'A test tool',
            parameters: {
              type: 'object',
              properties: {
                input: { type: 'string' },
              },
            },
          },
        },
        source_framework: 'openai',
        target_framework: 'claude',
      });

      expect(result.converted_definition).toBeDefined();
      expect(result.converted_definition.name).toBe('test_tool');
      expect(result.converted_definition.input_schema).toBeDefined();
      expect(result.compatibility_score).toBeGreaterThan(0);
    });

    it('should provide migration notes', async () => {
      const result = await convertToolFormat({
        tool_definition: {
          name: 'test_tool',
          description: 'Test',
        },
        source_framework: 'langchain',
        target_framework: 'openai',
      });

      expect(result.migration_notes).toBeDefined();
      expect(result.migration_notes.length).toBeGreaterThan(0);
    });

    it('should detect compatibility warnings', async () => {
      const result = await convertToolFormat({
        tool_definition: {
          name: 'complex_tool',
          description: 'Complex tool with output schema',
          input_schema: {},
          output_schema: { type: 'object' }, // Not supported in OpenAI
        },
        source_framework: 'agentfoundry',
        target_framework: 'openai',
      });

      expect(result.conversion_warnings).toBeDefined();
    });
  });
});
