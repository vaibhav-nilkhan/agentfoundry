import Ajv, { Schema, ValidateFunction } from 'ajv';

export interface ValidationError {
  path: string;
  message: string;
  expected: string;
  actual: string;
}

export interface ValidationSuggestion {
  path: string;
  fix: string;
  reason: string;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationSuggestion[];
  metadata: {
    validation_time_ms: number;
    schema_version: string;
  };
}

export class JsonValidator {
  private ajv: Ajv;
  private validators: Map<string, ValidateFunction>;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false,
      verbose: true
    });
    this.validators = new Map();
  }

  /**
   * Validate JSON data against schema
   */
  validate(data: any, schema: Schema, strictMode: boolean = false): ValidationResult {
    const startTime = Date.now();

    // Parse JSON string if needed
    let parsedData = data;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (e: any) {
        return {
          is_valid: false,
          errors: [{
            path: '$',
            message: 'Invalid JSON string',
            expected: 'Valid JSON',
            actual: e.message,
          }],
          warnings: [],
          suggestions: [{
            path: '$',
            fix: 'Use auto_fix_json tool to repair',
            reason: 'JSON parsing failed',
          }],
          metadata: {
            validation_time_ms: Date.now() - startTime,
            schema_version: (typeof schema === 'object' && schema !== null && '$schema' in schema) ? (schema.$schema as string) : 'draft-07',
          },
        };
      }
    }

    // Get or compile validator
    const schemaKey = JSON.stringify(schema);
    let validate = this.validators.get(schemaKey);

    if (!validate) {
      validate = this.ajv.compile(schema);
      this.validators.set(schemaKey, validate);
    }

    const isValid = validate(parsedData);
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const suggestions: ValidationSuggestion[] = [];

    if (!isValid && validate.errors) {
      for (const error of validate.errors) {
        const path = error.instancePath || error.schemaPath;
        const errorObj: ValidationError = {
          path,
          message: error.message || 'Validation failed',
          expected: this.getExpectedValue(error),
          actual: this.getActualValue(error),
        };

        // Categorize as error or warning
        if (this.isWarningLevel(error)) {
          warnings.push(errorObj);
        } else {
          errors.push(errorObj);
        }

        // Generate suggestions
        const suggestion = this.generateSuggestion(error, parsedData);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    }

    // In strict mode, warnings become errors
    if (strictMode && warnings.length > 0) {
      errors.push(...warnings);
    }

    return {
      is_valid: isValid || (warnings.length > 0 && errors.length === 0),
      errors,
      warnings,
      suggestions,
      metadata: {
        validation_time_ms: Date.now() - startTime,
        schema_version: (typeof schema === 'object' && schema !== null && '$schema' in schema) ? (schema.$schema as string) : 'draft-07',
      },
    };
  }

  /**
   * Determine if error should be a warning
   */
  private isWarningLevel(error: any): boolean {
    // Additional properties are warnings, not errors
    if (error.keyword === 'additionalProperties') {
      return true;
    }
    return false;
  }

  /**
   * Get expected value from error
   */
  private getExpectedValue(error: any): string {
    if (error.keyword === 'type') {
      return `type: ${error.params.type}`;
    }
    if (error.keyword === 'required') {
      return `required property: ${error.params.missingProperty}`;
    }
    if (error.keyword === 'enum') {
      return `one of: ${error.params.allowedValues?.join(', ')}`;
    }
    if (error.keyword === 'minimum') {
      return `>= ${error.params.limit}`;
    }
    if (error.keyword === 'maximum') {
      return `<= ${error.params.limit}`;
    }
    return error.schema?.toString() || 'unknown';
  }

  /**
   * Get actual value from error
   */
  private getActualValue(error: any): string {
    if (error.data !== undefined) {
      return typeof error.data === 'object'
        ? JSON.stringify(error.data)
        : String(error.data);
    }
    return 'undefined';
  }

  /**
   * Generate fix suggestion for error
   */
  private generateSuggestion(error: any, data: any): ValidationSuggestion | null {
    const path = error.instancePath || error.dataPath || '/';

    if (error.keyword === 'type') {
      return {
        path,
        fix: `Convert to ${error.params.type}`,
        reason: `Expected ${error.params.type} but got ${typeof error.data}`,
      };
    }

    if (error.keyword === 'required') {
      return {
        path,
        fix: `Add missing property: ${error.params.missingProperty}`,
        reason: `Required property is missing`,
      };
    }

    if (error.keyword === 'enum') {
      return {
        path,
        fix: `Use one of: ${error.params.allowedValues?.join(', ')}`,
        reason: `Value not in allowed enum values`,
      };
    }

    if (error.keyword === 'additionalProperties') {
      return {
        path,
        fix: `Remove property: ${error.params.additionalProperty}`,
        reason: `Property not defined in schema`,
      };
    }

    return null;
  }

  /**
   * Clear validator cache
   */
  clearCache(): void {
    this.validators.clear();
  }
}
