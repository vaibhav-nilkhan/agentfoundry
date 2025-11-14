import { run as validateJson } from '../src/tools/validate-json';
import { run as autoFixJson } from '../src/tools/auto-fix-json';
import { run as retryWithSchema } from '../src/tools/retry-with-schema';
import { run as generateSchema } from '../src/tools/generate-schema';

describe('JSON Validator', () => {
  describe('validate_json', () => {
    it('should validate valid JSON against schema', async () => {
      const result = await validateJson({
        json_data: {
          name: 'John Doe',
          age: 30,
          email: 'john@example.com',
        },
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            email: { type: 'string' },
          },
          required: ['name', 'age'],
        },
        include_suggestions: true,
      });

      expect(result.is_valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.validation_time_ms).toBeGreaterThan(0);
    });

    it('should detect validation errors in invalid JSON', async () => {
      const result = await validateJson({
        json_data: {
          name: 'John Doe',
          age: 'thirty', // Wrong type
        },
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['name', 'age'],
        },
        include_suggestions: true,
      });

      expect(result.is_valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].expected).toContain('number');
      expect(result.suggestions).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const result = await validateJson({
        json_data: {
          name: 'John Doe',
        },
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['name', 'age'],
        },
        include_suggestions: true,
      });

      expect(result.is_valid).toBe(false);
      expect(result.errors.some((e: any) => e.message.includes('required'))).toBe(true);
    });

    it('should validate JSON string input', async () => {
      const result = await validateJson({
        json_data: '{"name": "John", "age": 30}',
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
        },
      });

      expect(result.is_valid).toBe(true);
    });
  });

  describe('auto_fix_json', () => {
    it('should fix missing commas in JSON', async () => {
      const malformedJson = `{
  "name": "John"
  "age": 30
}`;

      const result = await autoFixJson({
        json_string: malformedJson,
        fix_level: 'moderate',
      });

      expect(result.is_valid).toBe(true);
      expect(result.fixes_applied.length).toBeGreaterThan(0);
      expect(result.fixes_applied.some((f: any) => f.type === 'add_comma')).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should fix trailing commas', async () => {
      const malformedJson = '{"name": "John", "age": 30,}';

      const result = await autoFixJson({
        json_string: malformedJson,
        fix_level: 'conservative',
      });

      expect(result.is_valid).toBe(true);
      expect(result.fixes_applied.some((f: any) => f.type === 'remove_trailing_comma')).toBe(true);
    });

    it('should handle single quotes', async () => {
      const malformedJson = "{'name': 'John', 'age': 30}";

      const result = await autoFixJson({
        json_string: malformedJson,
        fix_level: 'moderate',
      });

      expect(result.is_valid).toBe(true);
      expect(result.fixes_applied.some((f: any) => f.type === 'fix_quotes')).toBe(true);
    });

    it('should return as-is if JSON is already valid', async () => {
      const validJson = '{"name": "John", "age": 30}';

      const result = await autoFixJson({
        json_string: validJson,
      });

      expect(result.is_valid).toBe(true);
      expect(result.fixes_applied).toHaveLength(0);
      expect(result.confidence).toBe(100);
    });

    it('should balance missing brackets in aggressive mode', async () => {
      const malformedJson = '{"name": "John", "data": {"id": 123}';

      const result = await autoFixJson({
        json_string: malformedJson,
        fix_level: 'aggressive',
      });

      expect(result.is_valid).toBe(true);
      expect(result.fixes_applied.length).toBeGreaterThan(0);
    });
  });

  describe('retry_with_schema', () => {
    it('should successfully validate on first attempt', async () => {
      const result = await retryWithSchema({
        llm_call: {
          model: 'gpt-4',
          prompt: 'Generate user data',
        },
        schema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            data: { type: 'object' },
          },
          required: ['status', 'data'],
        },
        invalid_output: '{"status": "success", "data": {"id": 123}}',
        max_retries: 3,
        enhance_prompt: true,
      });

      expect(result.success).toBe(true);
      expect(result.valid_json).toBeDefined();
      expect(result.attempts).toBeLessThanOrEqual(3);
      expect(result.attempt_log).toBeDefined();
    });

    it('should track attempt history', async () => {
      const result = await retryWithSchema({
        llm_call: {
          model: 'gpt-4',
          prompt: 'Generate data',
        },
        schema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
          },
        },
        invalid_output: '{invalid}',
        max_retries: 2,
      });

      expect(result.attempt_log).toBeDefined();
      expect(result.attempt_log.length).toBeGreaterThan(0);
      expect(result.total_cost).toBeDefined();
      expect(result.total_cost).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generate_schema', () => {
    it('should generate schema from single example', async () => {
      const result = await generateSchema({
        examples: [
          {
            name: 'John Doe',
            age: 30,
            email: 'john@example.com',
          },
        ],
        schema_options: {
          infer_required: true,
          include_examples: true,
        },
      });

      expect(result.schema).toBeDefined();
      expect(result.schema.type).toBe('object');
      expect(result.schema.properties).toBeDefined();
      expect(result.schema.properties.name).toBeDefined();
      expect(result.schema.properties.age).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should generate schema from multiple examples', async () => {
      const result = await generateSchema({
        examples: [
          { name: 'John', age: 30, active: true },
          { name: 'Jane', age: 25, active: false },
          { name: 'Bob', age: 35, active: true },
        ],
        schema_options: {
          infer_required: true,
          strict_types: true,
        },
      });

      expect(result.schema).toBeDefined();
      expect(result.analysis.total_examples).toBe(3);
      expect(result.analysis.fields_found).toBeGreaterThan(0);
      expect(result.schema.required).toBeDefined();
      expect(result.schema.required).toContain('name');
      expect(result.confidence).toBeGreaterThan(50);
    });

    it('should detect type conflicts', async () => {
      const result = await generateSchema({
        examples: [
          { id: 123 }, // number
          { id: '456' }, // string - conflict!
        ],
      });

      expect(result.schema).toBeDefined();
      expect(result.analysis.type_conflicts.length).toBeGreaterThan(0);
      expect(result.analysis.type_conflicts[0].field).toBe('id');
      expect(result.analysis.type_conflicts[0].types).toHaveLength(2);
    });
  });
});
