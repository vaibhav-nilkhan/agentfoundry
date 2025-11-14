import { SchemaValidator } from '../lib/schema-validator';

interface ValidateToolSchemaInput {
  tool_name: string;
  tool_input: any;
  schema: {
    type: 'json_schema' | 'zod';
    definition: any;
  };
  strict_mode?: boolean;
}

export async function run(input: ValidateToolSchemaInput): Promise<any> {
  const startTime = Date.now();
  const validator = new SchemaValidator();

  try {
    let result;

    if (input.schema.type === 'json_schema') {
      result = validator.validateJsonSchema(input.tool_input, input.schema.definition);
    } else {
      // For zod, we'd need to evaluate the schema definition
      // For now, fall back to JSON schema validation
      result = validator.validateJsonSchema(input.tool_input, input.schema.definition);
    }

    // In strict mode, warnings are treated as errors
    if (input.strict_mode && result.validation_warnings.length > 0) {
      result.is_valid = false;
      result.validation_errors.push(...result.validation_warnings);
    }

    const endTime = Date.now();

    return {
      ...result,
      metadata: {
        validation_time_ms: endTime - startTime,
        schema_type: input.schema.type,
      },
    };
  } catch (error: any) {
    return {
      is_valid: false,
      validation_errors: [
        {
          field: 'schema',
          message: error.message,
          severity: 'error',
        },
      ],
      validation_warnings: [],
      suggested_fixes: [],
      metadata: {
        validation_time_ms: Date.now() - startTime,
        schema_type: input.schema.type,
      },
    };
  }
}
