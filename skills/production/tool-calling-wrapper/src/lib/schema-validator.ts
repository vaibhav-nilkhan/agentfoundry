import Ajv, { Schema } from 'ajv';
import { z, ZodSchema } from 'zod';

export interface ValidationResult {
  is_valid: boolean;
  validation_errors: ValidationError[];
  validation_warnings: ValidationError[];
  suggested_fixes: SuggestedFix[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface SuggestedFix {
  field: string;
  current_value: any;
  suggested_value: any;
  reason: string;
}

export class SchemaValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
  }

  /**
   * Validate data against JSON Schema
   */
  validateJsonSchema(data: any, schema: Schema): ValidationResult {
    const validate = this.ajv.compile(schema);
    const isValid = validate(data);

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const fixes: SuggestedFix[] = [];

    if (!isValid && validate.errors) {
      for (const error of validate.errors) {
        const field = error.instancePath || error.schemaPath;
        const message = error.message || 'Validation failed';

        errors.push({
          field,
          message,
          severity: 'error',
        });

        // Generate suggested fixes
        if (error.keyword === 'type') {
          fixes.push({
            field,
            current_value: error.data,
            suggested_value: this.convertType(error.data, error.params.type),
            reason: `Convert to ${error.params.type}`,
          });
        }
      }
    }

    return {
      is_valid: isValid,
      validation_errors: errors,
      validation_warnings: warnings,
      suggested_fixes: fixes,
    };
  }

  /**
   * Validate data against Zod schema
   */
  validateZodSchema(data: any, schema: ZodSchema): ValidationResult {
    const result = schema.safeParse(data);

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const fixes: SuggestedFix[] = [];

    if (!result.success) {
      for (const error of result.error.errors) {
        const field = error.path.join('.');

        errors.push({
          field,
          message: error.message,
          severity: 'error',
        });

        // Generate suggested fixes based on error type
        if (error.code === 'invalid_type') {
          fixes.push({
            field,
            current_value: error.received,
            suggested_value: `<${error.expected}>`,
            reason: `Convert to ${error.expected}`,
          });
        }
      }
    }

    return {
      is_valid: result.success,
      validation_errors: errors,
      validation_warnings: warnings,
      suggested_fixes: fixes,
    };
  }

  /**
   * Convert value to target type
   */
  private convertType(value: any, targetType: string): any {
    switch (targetType) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'array':
        return Array.isArray(value) ? value : [value];
      case 'object':
        return typeof value === 'object' ? value : { value };
      default:
        return value;
    }
  }
}
